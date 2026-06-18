// 微信小程序登录鉴权处理
// 流程：前端 uni.login() 拿到 code -> 传给 /api/login
//      后端 code + AppID + AppSecret 调微信 jscode2session 换取 openid
//      根据 openid 判断新/老用户，签发 token 返回前端
//      后续请求携带 token，经 authMiddleware 鉴权
const crypto = require('crypto')
const axios = require('axios')
const dayjs = require('dayjs')
const index = require('../db/index')

// ===== 配置（请替换为自己的小程序信息，建议放到环境变量）=====
const APPID = process.env.WX_APPID || 'wx1c130c1addae29a8'
const APPSECRET = process.env.WX_APPSECRET || '54d10fd5b770b9ed49fb9330be4133f9'
// 签发 token 用的密钥，生产环境务必改掉并保密
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'qingnianbang_news_secret_2026'
// token 有效期（毫秒），默认 7 天
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000

// ===== 简易 JWT（HMAC-SHA256），无需引入额外依赖 =====
function base64url(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

function signToken(payload) {
    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = base64url(JSON.stringify(payload))
    const sig = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(`${header}.${body}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    return `${header}.${body}.${sig}`
}

function verifyToken(token) {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const expected = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(`${header}.${body}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    // 防时序攻击的等长比较
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
    let payload
    try {
        payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8'))
    } catch (e) {
        return null
    }
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
}

// ===== 数据库工具：按 open_id 查/建用户 =====
function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        index.query(sql, params, (err, results) => {
            if (err) return reject(err)
            resolve(results)
        })
    })
}

// 根据 openid 查找老用户，不存在则创建新用户，返回 { user, isNewUser }
async function findOrCreateUser(openid) {
    const rows = await queryAsync('select * from user where open_id = ? limit 1', [openid])
    if (rows && rows.length) {
        return { user: rows[0], isNewUser: false }
    }
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const newUser = {
        open_id: openid,
        nickname: '微信用户',
        createdAt: now,
        updatedAt: now
    }
    const result = await queryAsync('insert into user set ?', [newUser])
    newUser.id = result.insertId
    // 昵称后面拼上用户 id（id 是插入后才生成的自增值），并回写数据库
    newUser.nickname = `微信用户${newUser.id}`
    await queryAsync('update user set nickname = ?, updatedAt = ? where id = ?', [newUser.nickname, now, newUser.id])
    return { user: newUser, isNewUser: true }
}

// ===== 控制器：登录 =====
// POST /api/login   body: { code }
exports.login = async (ctx) => {
    console.log('收到验证',ctx.request.body)
    const { code } = ctx.request.body || {}
    if (!code) {
        ctx.status = 400
        ctx.body = { code: 1, message: '缺少 code 参数' }
        return
    }
    try {
        // 1. 拿 code + AppID + AppSecret 去微信服务器换取 openid
        const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: APPID,
                secret: APPSECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        })
        const { openid, session_key, errcode, errmsg } = wxRes.data || {}
        if (errcode || !openid) {
            ctx.status = 401
            ctx.body = { code: 1, message: `微信登录失败: ${errmsg || '未获取到 openid'}`, errcode }
            return
        }

        // 2. 根据 openid 判断新/老用户
        const { user, isNewUser } = await findOrCreateUser(openid)

        // 3. 生成登录 token 返回前端（不把 session_key 下发给前端）
        const token = signToken({
            uid: user.id,
            openid,
            iat: Date.now(),
            exp: Date.now() + TOKEN_TTL
        })

        ctx.body = {
            code: 0,
            message: isNewUser ? '注册并登录成功' : '登录成功',
            token,
            isNewUser,
            userInfo: {
                id: user.id,
                nickname: user.nickname,
                dianhua: user.dianhua || ''
            }
        }
    } catch (err) {
        console.error('登录失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '服务器登录异常' }
    }
}

// ===== 控制器：获取所有用户最新坐标（需鉴权）=====
// GET /api/locations
// 每个用户(no)取 time 最大的一条；返回 mine=当前登录用户 id，前端据此区分蓝点/红点
exports.allLocations = async (ctx) => {
    const { uid } = ctx.state.user
    try {
        const rows = await queryAsync(`
            SELECT l.no, l.zuobiao, l.time, l.dwzl
            FROM user_data l
            INNER JOIN (
                SELECT no, MAX(time) AS time
                FROM user_data
                GROUP BY no
            ) t ON l.no = t.no AND l.time = t.time
        `, [])
        const list = (rows || []).map((item) => {
            const parts = String(item.zuobiao || '').split(',')
            return {
                no: item.no,
                lat: Number(parts[0]),
                lng: Number(parts[1]),
                dwzl: item.dwzl,
                time: item.time
            }
        }).filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
        ctx.body = { code: 0, message: 'ok', mine: String(uid), list }
    } catch (err) {
        console.error('查询坐标失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '查询坐标异常' }
    }
}

// ===== 鉴权中间件 =====
// 校验请求头 Authorization: Bearer <token>，通过后挂到 ctx.state.user
exports.authMiddleware = async (ctx, next) => {
    const auth = ctx.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth
    const payload = verifyToken(token)
    if (!payload) {
        ctx.status = 401
        ctx.body = { code: 401, message: '登录已失效，请重新登录' }
        return
    }
    ctx.state.user = payload
    await next()
}

// ===== 控制器：获取当前登录用户信息（需鉴权）=====
// GET /api/profile
exports.profile = async (ctx) => {
    const { uid } = ctx.state.user
    const rows = await queryAsync(
        'select id, open_id, nickname, dianhua, createdAt from user where id = ? limit 1',
        [uid]
    )
    if (!rows || !rows.length) {
        ctx.status = 404
        ctx.body = { code: 1, message: '用户不存在' }
        return
    }
    ctx.body = { code: 0, message: 'ok', userInfo: rows[0] }
}

// ===== 控制器：补全/更新当前登录用户电话（需鉴权）=====
// POST /api/profile/phone   body: { dianhua }
// 紧急救援前若用户未填电话，前端调用此接口把手机号写入 user 表
exports.updatePhone = async (ctx) => {
    const { uid } = ctx.state.user
    const { dianhua } = ctx.request.body || {}
    const phone = String(dianhua || '').trim()
    if (!/^1\d{10}$/.test(phone)) {
        ctx.status = 400
        ctx.body = { code: 1, message: '请输入正确的11位手机号' }
        return
    }
    try {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        await queryAsync('update user set dianhua = ?, updatedAt = ? where id = ?', [phone, now, uid])
        ctx.body = { code: 0, message: '保存成功', dianhua: phone }
    } catch (err) {
        console.error('保存电话失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '保存电话异常' }
    }
}

// ===== 控制器：上报坐标（需鉴权）=====
// POST /api/location   body: { lat, lng }
// 以登录用户的 id 作为 no，存入 user_data；dwzl 默认为 0
// zuobiao 存成 "lat,lng" 字符串，与前端地图按 split(',') 读取的格式一致
exports.reportLocation = async (ctx) => {
    const { uid } = ctx.state.user
    console.log(ctx.request.body)
    const { lat, lng } = ctx.request.body || {}
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
        ctx.status = 400
        ctx.body = { code: 1, message: '缺少经纬度参数' }
        return
    }
    try {
        const zuobiao = `${lat},${lng}`
        const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
        await queryAsync(
            'insert into user_data (no, zuobiao, time, dwzl) values (?, ?, ?, ?)',
            [uid, zuobiao, time, 0]
        )
        ctx.body = { code: 0, message: '坐标上报成功' }
    } catch (err) {
        console.error('坐标上报失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '坐标上报异常' }
    }
}
