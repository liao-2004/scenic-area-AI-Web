const Router=require('koa-router')
const mqtt_router=new Router({ prefix: '/mqtt' })
const mqtt_handle=require('../router_handle/mqtt.js')
mqtt_router.get('/mqtt_data',mqtt_handle.mqtt_data)
mqtt_router.get('/mqtt_load',mqtt_handle.mqtt_load)
mqtt_router.get('/bug_mysql',mqtt_handle.bug_mysql)
module.exports=mqtt_router