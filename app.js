const Koa = require('koa');
const cors = require('@koa/cors');
const static = require('koa-static');  
const path = require('path');
const fs = require('fs/promises');
const bodyParser = require('koa-bodyparser');
const { ReadableStream } = require('web-streams-polyfill');
global.ReadableStream = ReadableStream; // 让全局环境能访问到 ReadableStream

// 引入 Blob Polyfill 并全局注册
const { Blob } = require('blob-polyfill');
global.Blob = Blob; // 让全局环境能访问到 Blob
 const { setupDatabase } = require('./dbSetup');
const { startCleanup } = require('./db/cleanup');
const router = require('./router/user.js');
const auth = require('./router/auth.js');
const news = require('./router/news.js');
const mqtt_pub = require('./router/mqtt_pub.js');
const mqtt_sub = require('./router/mqtt_sub.js');
const AI_api = require('./router/ai_api.js');
const mqtt = require('./router/mqtt.js');

const app = new Koa();
const port = 3000;
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  await next();
});
app.use(cors()); 
app.use(bodyParser());
const staticPath = path.join(__dirname, 'public');
app.use(static(staticPath));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(auth.routes());
app.use(auth.allowedMethods());
app.use(news.routes());
app.use(news.allowedMethods());
app.use(mqtt_pub.routes());
app.use(mqtt_pub.allowedMethods());
app.use(mqtt_sub.routes());
app.use(mqtt_sub.allowedMethods());
app.use(mqtt.routes());
app.use(mqtt.allowedMethods());
app.use(static(path.join(__dirname, 'dist')));
app.use(AI_api.routes());
app.use(AI_api.allowedMethods());
const dbSetupSuccess =  setupDatabase();
// 启动 user_data 过期数据定时清理（删除 time 早于 30 分钟前的记录）
startCleanup();
app.use(async (ctx) => { 
  ctx.type = 'text/html';
  ctx.body = await fs.readFile(path.resolve(__dirname, 'dist', 'index.html'));
});
app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});