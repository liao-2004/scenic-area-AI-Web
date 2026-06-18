// 新闻文章路由
// 对接处理函数见 ../router_handle/news.js
const Router = require('koa-router')
const newsHandle = require('../router_handle/news.js')
const upload = require('../db/multer') // 复用已有的磁盘存储 multer（public/req_file）

const router = new Router({ prefix: '/api/news' })

// 导航分类
router.get('/navlist', newsHandle.navlist)
// 新闻列表（cid + page）
router.get('/newslist', newsHandle.newslist)
// 新闻详情
router.get('/detail', newsHandle.detail)
// 发布文章（web 端，支持上传封面图，字段名 image）
router.post('/publish', upload.single('image'), newsHandle.publish)

module.exports = router
