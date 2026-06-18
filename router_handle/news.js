// 新闻文章接口处理
// 对接 uni-app 首页/详情页（导航、列表、详情），以及 web 端发布文章
// 响应字段刻意对齐原第三方接口（青年帮），前端几乎无需改动：
//   navlist  -> [{ id, classname }]
//   newslist -> [{ id, title, picurl, posttime, hits, classid, author }]
//   detail   -> { id, title, content, author, posttime, picurl, classid, hits }
const index = require('../db/index')
const dayjs = require('dayjs')

// 简易 promise 封装（与 auth.js 风格一致）
function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        index.query(sql, params, (err, results) => {
            if (err) return reject(err)
            resolve(results)
        })
    })
}

// 每页条数
const PAGE_SIZE = 10

// ===== 导航分类列表 =====
// GET /api/news/navlist  -> [{ id, classname }]
exports.navlist = async (ctx) => {
    try {
        const rows = await queryAsync(
            'select id, classname from article_class order by sort asc, id asc',
            []
        )
        ctx.body = rows || []
    } catch (err) {
        console.error('navlist 查询失败:', err.message)
        ctx.status = 500
        ctx.body = []
    }
}

// ===== 新闻列表（按分类 + 分页）=====
// GET /api/news/newslist?cid=&page=
exports.newslist = async (ctx) => {
    const cid = ctx.query.cid
    const page = Math.max(1, parseInt(ctx.query.page) || 1)
    const offset = (page - 1) * PAGE_SIZE
    try {
        let rows
        if (cid) {
            rows = await queryAsync(
                `select id, title, picurl, posttime, hits, classid, author
                 from article where classid = ?
                 order by id desc limit ? offset ?`,
                [cid, PAGE_SIZE, offset]
            )
        } else {
            rows = await queryAsync(
                `select id, title, picurl, posttime, hits, classid, author
                 from article order by id desc limit ? offset ?`,
                [PAGE_SIZE, offset]
            )
        }
        ctx.body = rows || []
    } catch (err) {
        console.error('newslist 查询失败:', err.message)
        ctx.status = 500
        ctx.body = []
    }
}

// ===== 新闻详情 =====
// GET /api/news/detail?id=
exports.detail = async (ctx) => {
    const id = ctx.query.id
    if (!id) {
        ctx.status = 400
        ctx.body = { code: 1, message: '缺少 id 参数' }
        return
    }
    try {
        // 浏览量 +1
        await queryAsync('update article set hits = hits + 1 where id = ?', [id])
        const rows = await queryAsync(
            `select id, title, content, author, posttime, picurl, classid, hits
             from article where id = ? limit 1`,
            [id]
        )
        if (!rows || !rows.length) {
            ctx.status = 404
            ctx.body = { code: 1, message: '文章不存在' }
            return
        }
        ctx.body = rows[0]
    } catch (err) {
        console.error('detail 查询失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '查询失败' }
    }
}

// ===== 发布文章（web 端）=====
// POST /api/news/publish  FormData: title, author, classid, content, image(可选文件)
// multer 中间件解析后：文本在 ctx.request.body，文件在 ctx.file
exports.publish = async (ctx) => {
    const body = ctx.request.body || {}
    const title = (body.title || '').trim()
    const author = (body.author || '').trim() || '匿名'
    const classid = body.classid || null
    const content = body.content || ''

    if (!title) {
        ctx.status = 400
        ctx.body = { code: 1, message: '标题不能为空' }
        return
    }
    if (!content) {
        ctx.status = 400
        ctx.body = { code: 1, message: '正文不能为空' }
        return
    }

    // 封面图：上传了文件就用文件可访问路径，否则用表单里传的 picurl
    let picurl = (body.picurl || '').trim()
    if (ctx.file) {
        // multer 存到 public/req_file，public 已作为静态目录挂载
        picurl = `/req_file/${ctx.file.filename}`
    }

    try {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const result = await queryAsync(
            `insert into article (title, author, picurl, content, classid, hits, posttime, createdAt, updatedAt)
             values (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
            [title, author, picurl, content, classid, now, now, now]
        )
        ctx.body = {
            code: 0,
            message: '发布成功',
            data: { id: result.insertId }
        }
    } catch (err) {
        console.error('发布文章失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '发布失败' }
    }
}
