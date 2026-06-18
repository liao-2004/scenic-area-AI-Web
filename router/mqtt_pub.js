const Router = require('koa-router');
const mqtt_pub = new Router({ prefix: '/mqtt_pub' });
const db=require('../db/db')
const mqtt = require('mqtt')
const dayjs=require('dayjs')
const client = mqtt.connect('mqtt://192.168.214.202:1883') 
console.log('mqtt_pub模块')
client.on('message', (topic, message) => {

});
mqtt_pub.get('/sos',(ctx)=>{
    console.log(`{"sos":"yes"}`)
    client.publish('gps',`{"sos":"yes"}` , {qos: 1})
    ctx.body=''
})
    

module.exports=mqtt_pub