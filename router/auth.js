// 微信登录鉴权路由
// 对应处理函数见 ../router_handle/auth.js
const Router = require('koa-router')
const authHandle = require('../router_handle/auth.js')

const router = new Router({ prefix: '/api' })

// 登录：前端传 code，后端换 openid 并签发 token
router.post('/login', authHandle.login)

// 获取当前登录用户信息（需携带 token 鉴权）
router.get('/profile', authHandle.authMiddleware, authHandle.profile)

// 补全/更新当前登录用户电话（需鉴权）：紧急救援前若未填电话则调用
router.post('/profile/phone', authHandle.authMiddleware, authHandle.updatePhone)

// 上报坐标（需携带 token 鉴权）：以用户 id 作为 no 存入 user_data
router.post('/location', authHandle.authMiddleware, authHandle.reportLocation)

// 获取所有用户最新坐标（需鉴权）：用于实时地图展示
router.get('/locations', authHandle.authMiddleware, authHandle.allLocations)

module.exports = router
