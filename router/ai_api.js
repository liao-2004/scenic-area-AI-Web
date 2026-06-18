const Router = require('koa-router');
const multer = require('@koa/multer');

const AI_api = new Router({ prefix: '/ai' });
const ai_handle = require('../router_handle/ai_api.js');

// 内存存储，单文件字段名为 image，可接收前端 FormData
const upload = multer({ storage: multer.memoryStorage() });

// 前端 POST FormData：text 文本字段 + image 图片文件
AI_api.post('/chat', upload.single('image'), ai_handle.runVisionChat);

module.exports = AI_api;
