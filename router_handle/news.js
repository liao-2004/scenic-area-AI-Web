
const index = require('../db/index')
const dayjs = require('dayjs')

function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        index.query(sql, params, (err, results) => {
            if (err) return reject(err)
            resolve(results)
        })
    })
}

const PAGE_SIZE = 10

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

exports.detail = async (ctx) => {
    const id = ctx.query.id
    if (!id) {
        ctx.status = 400
        ctx.body = { code: 1, message: '缺少 id 参数' }
        return
    }
    try {
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

    let picurl = (body.picurl || '').trim()
    if (ctx.file) {
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

exports.update = async (ctx) => {
    const body = ctx.request.body || {}
    const id = body.id
    if (!id) {
        ctx.status = 400
        ctx.body = { code: 1, message: '缺少 id 参数' }
        return
    }
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

    let picurl = (body.picurl || '').trim()
    if (ctx.file) {
        picurl = `/req_file/${ctx.file.filename}`
    }

    try {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        await queryAsync(
            `update article set title = ?, author = ?, picurl = ?, content = ?, classid = ?, updatedAt = ?
             where id = ?`,
            [title, author, picurl, content, classid, now, id]
        )
        ctx.body = { code: 0, message: '更新成功' }
    } catch (err) {
        console.error('更新文章失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '更新失败' }
    }
}

exports.remove = async (ctx) => {
    const { id } = ctx.request.body || {}
    if (!id) {
        ctx.status = 400
        ctx.body = { code: 1, message: '缺少 id 参数' }
        return
    }
    try {
        await queryAsync('delete from article where id = ?', [id])
        ctx.body = { code: 0, message: '删除成功' }
    } catch (err) {
        console.error('删除文章失败:', err.message)
        ctx.status = 500
        ctx.body = { code: 1, message: '删除失败' }
    }
}
