const Router = require('koa-router');
const mqtt_sub = new Router({ prefix: '/mqtt_sub' });
const mqtt = require('mqtt')
const dayjs=require('dayjs')
const index=require('../db/index')
const db=require('../db/db')
const client = mqtt.connect('mqtt://192.168.214.202:1883') 
console.log('mqtt_sub模块')

//--------------------------------------------------
const http=require('http')
const { Server }=require('socket.io');
const { Console } = require('console');
const server=http.createServer(mqtt_sub)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // 允许访问的前端域名
    methods: ["GET", "POST"],        // 允许的 HTTP 方法
    credentials: true                // 允许携带凭证（如 cookies）
  }
});
const connectedSockets=new Map()
io.on('connection',(socket)=>{
  console.log('客户端连接成功:',socket.id)

  connectedSockets.set(socket.id,socket)
  
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    connectedSockets.delete(socket.id);
  });
})
server.listen(4000,() => {
  console.log('scoket服务器运行在 http://0.0.0.0:4000');
});
const value={
  value:'sos'
}
function broadcastMessage(message) {
  console.log('发送消息')
  connectedSockets.forEach(socket => {
    socket.emit('message',message);
  });
}
// setInterval(()=>{
//   broadcastMessage(value)
// },3000)

// uni-app 紧急救援：小程序/H5 点击“紧急救援”后 POST 到这里，
// 后端再通过 socket.io 广播给 web 端（与 MQTT 上报的 sos 走同一通道、同一数据结构）
mqtt_sub.post('/sos', (ctx) => {
  const body = ctx.request.body || {}
  const payload = {
    title: 'sos',
    id: body.id || '',          // 用户 id -> web 端“设备编号”列
    date: dayjs().format('YYYY-MM-DD HH:mm'),
    name: body.name || '未知用户',
    lat: body.lat,
    lng: body.lng,
  }
  console.log('收到 uni-app 紧急救援:', payload)
  broadcastMessage(payload)
  ctx.body = { code: 0, message: '救援请求已发送' }
})

//------------------------------------------------------------


client.on('connect', () => {
    console.log('sensor/data主题连接建立')
    client.subscribe('dzwl')
    client.subscribe('sos')
})
client.on('message', (topic, message) => {
    if(topic=='dzwl'){
      const data=JSON.parse(message)
      const mysql_insert=`INSERT INTO user_data (no,zuobiao,time,dzwl) VALUES ("${data.ID}","${data.lat},${data.lng}","${dayjs().format('YYYY-MM-DD HH:mm:ss')}",${data.dzwl})`
      index.query(mysql_insert,(err)=>{if(err) return console.log(err)})
    }

    if(topic=='sos'){
      const data=JSON.parse(message)
      console.log(data,'sos')
      broadcastMessage({
        title:'sos',
        id: data.ID,            // 设备/用户编号 -> web 端“设备编号”列
        date: dayjs().format('YYYY-MM-DD HH:mm'),
        name: data.ID,
        lat: data.lat,
        lng: data.lng,
      })
    }
})
// 经纬度坐标数组（纬度lat在前，经度lng在后）
// 更新后的经纬度坐标数组

const axios = require('axios');

async function sendMessageToServerB(ip,message) {
  try {
    const response = await axios(
        ip,
        message
    );
    if(response.data.predictions[0].congestion_level=='拥挤'){
      client.publish('gps',`{"Y1":"1"}` , {qos: 1})
    }else{
      client.publish('gps',`{"Y1":"0"}` , {qos: 1})
    }
    if(response.data.predictions[1].congestion_level=='拥挤'){
      client.publish('gps',`{"Y2":"1"}` , {qos: 1})
    }else{
      client.publish('gps',`{"Y2":"0"}` , {qos: 1})
    }

    // console.log(response.data)
    broadcastMessage({
      title:'py',
      value:response.data
    })
    // client.publish(topic,`{"${config_id_select_topic(value[i].config_id)}":"${value[i].value}"}` , {qos: 1})
  } catch (error) {
    console.error('消息发送失败:', error.message);
  }
}

const ip='http://localhost:5000/latest_prediction'
const message=''
setInterval(()=>{sendMessageToServerB(ip,message)},40000)
setTimeout(()=>{sendMessageToServerB(ip,message)},5000)
// const list=[
//   { lat: 27.84560314, lng: 112.92869863 }
// ]
// setTimeout(()=>{broadcastMessage({
//         title:'sos',
//         date: dayjs().format('YYYY-MM-DD HH:mm'),
//         name: 245,
//         lat: 27.848293370695384, 
//         lng: 112.92757039732784,
//       })},5000)    
// list.forEach((item,index)=>{
//   db.query(`INSERT INTO user_data (no,zuobiao,time,dzwl) VALUES (1,'${item.lat},${item.lng}','${dayjs().format("YYYY-MM-DD HH:mm:ss")}',0)`,err=>{
//     console.log(err)
//   })
// })















// 模块化导出（按需启用）
// export default coordinates;

// coordinates.forEach(data=>{
//   const mysql_insert=`INSERT INTO user_data (no,zuobiao,time) VALUES (2,"${data.lat},${data.lng}","${dayjs().format('YYYY-MM-DD HH:mm:ss')}")`
//     console.log(`2,${data.lat},${data.lng}`)
//     index.query(mysql_insert,(err)=>{if(err) return console.log(err)})
// })
// 导出供其他文件使用（如果使用模块化开发）
// export default coordinates;

// 数据
// {
//     "error":[{"id":38,"d_no":0,"c_time":"2-2-2","e_msg":"1","e_no":"1","type":"2"}]
//   }
module.exports=mqtt_sub