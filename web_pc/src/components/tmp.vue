<template>
    <div>
        <div :style="{display:'flex','justify-content':'space-between'}">
            <h5 :style="{margin:'auto 25px',fontWeight: '900'}">人流密度</h5>
            <div :style="{display:'flex',justifyContent:'space-between',gap:'40px'}">
              <div>
                <div>
                  <img src="../../public/用户坐标 (1).png" :style="{ width: '20px', height: '20px', verticalAlign: 'middle', marginRight: '4px' }">
                  <span :style="{fontSize:'12px'}"> 用户实时定位</span>
                </div>
                <div>
                  <img src="../../public/用户坐标 (2).png" :style="{ width: '20px', height: '20px', verticalAlign: 'middle', marginRight: '4px' }">
                  <span :style="{fontSize:'12px'}"> 电子围栏区域外用户定位</span>
                </div>
              </div>
            </div>
        </div>
                <tlbs-map
                    :style="{height:'60vh',width:'80vw',margin:'20px 25px'}"
                    ref="mapRef"
                    api-key="CMABZ-4OG67-NG4X6-HKQSW-RZ6RZ-5KFWJ"
                    :center="center"
                    :zoom="zoom"
                    :maxZoom="20"
                    :minZoom="8"
                    :control="control"
                    @click="onClick"
                    @map_inited="onMapInited"
                >
                    <tlbs-multi-label
                ref="labelRef"
                :geometries="jingdian.map((item,index)=>({
                    id: `label_${index}`, 
                    styleId: 'label', 
                    content: `${item.name}`, 
                    position: { lat: item.lat, lng: item.lng }
                }))"
                :styles="styles_text"
                :options="textOptions" 
            />
                    <tlbs-multi-marker
                    ref="markerRef"
                    :geometries="geometries"
                    :styles="styles"
                    :options="options"
                    />
                    <tlbs-multi-polygon
                      ref="polygonRef"
                      :geometries="geometries_xing"
                      :styles="styles_xing"
                      :options="options_xing"
                    />
                    <tlbs-info-window
                      v-for="(item,index) in jingdian"
                      :key="index"
                      ref="infoWindowRef"
                      :visible="visible"
                      :position="{lat:item.lat,lng:item.lng}"
                      :content="`${item.name}\n预测${item.time_range}内\n${item.congestion_level}\n人数：${item.crowd_count}`"
                      :options="{
                        offset: {
                          x: 0,
                          y: 0,
                        }
                      }"
                    />
                </tlbs-map>
                <div :style="{margin:'0px 25px',height:'15vh'}">
                  <span :style="{fontSize:'16px',fontWeight: '700'}">热门景点</span>
                  <div :style="{marginTop:'20px',display:'flex',justifyContent:'flex-start',gap:'80px'}">
                    <div>
                      <span :style="{marginRight: '10px',
                      textAlign: 'left',
                      fontWeight: '400',
                      lineHeight:'1.5'}">木鱼天桥：</span><el-button icon="el-icon-thumb" type="primary"  @click="center = { lat: jingdian[0].lat, lng: jingdian[0].lng };zoom=20">前往</el-button>
                    </div>
                    <div>
                      <span :style="{marginRight: '10px',
                      textAlign: 'left',
                      fontWeight: '400',
                      lineHeight:'1.5'}">湖中桥：</span><el-button icon="el-icon-thumb" type="primary" @click="center = { lat: jingdian[1].lat, lng: jingdian[1].lng };zoom=20">前往</el-button>
                    </div>
                    <div>
                      <span :style="{marginRight: '10px',
                      textAlign: 'left',
                      fontWeight: '400',
                      lineHeight:'1.5'}">木鱼大门：</span><el-button icon="el-icon-thumb" type="primary" @click="center = { lat: jingdian[2].lat, lng: jingdian[2].lng };zoom=20">前往</el-button>
                    </div>
                  </div>
                  <!-- <el-descriptions title="热门景点">
                      <el-descriptions-item label="木鱼天桥"><el-button  @click="center = { lat: jingdian[0].lat, lng: jingdian[0].lng }">前往</el-button></el-descriptions-item>
                      <el-descriptions-item label="湖中桥"><el-button @click="center = { lat: jingdian[1].lat, lng: jingdian[1].lng }">前往</el-button></el-descriptions-item>
                      <el-descriptions-item label="木鱼大门"><el-button @click="center = { lat: jingdian[2].lat, lng: jingdian[2].lng }">前往</el-button></el-descriptions-item> -->
                      <!-- <el-descriptions-item label="备注">
                        <el-tag size="small">学校</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="联系地址">江苏省苏州市吴中区吴中大道 1188 号</el-descriptions-item> -->
                  <!-- </el-descriptions> -->
                </div>
  </div>
</template>

<script>
import { mqttLoad, BaseUrl1 } from '@/api'
import io from 'socket.io-client';
const paths_xing = [
    {
      'lat': '27.849258415686986',
      'lng': '112.92683793396372'
    },{
      'lat': '27.84686745402085',
      'lng': '112.92685974995698'
    },{
      'lat': '27.84292991358077',
      'lng': '112.92695060960648'
    },{
      'lat': '27.842961416853445', 
      'lng': '112.92775327141817'

    },{
      'lat': '27.84450909256113',
       'lng': '112.93048883078131'
    },
    {
      'lat': '27.84963625679527', 
      'lng': '112.93163597690682'

    },
    {
      'lat': '27.850200745539674',
       'lng': '112.9286326468482'
    }
];
export default {
  name: 'tmp_daima',
  data() {
    return {
       styles_text: {
                label: {
                    color: '#f24e4e',
                    fontSize: 18,
                     fontWeight: 900,
                    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    zIndex: 9999,  // 文字标签样式层级（最高）
                    pointerEvents: 'auto'
                }
            },
            textOptions: {
                zIndex: 9999  // 组件级层级（确保覆盖其他元素）
            },
      socket:null,
      jingdian:[
        {name:'木鱼天桥',lat: '27.84463224788258',lng: '112.92769704282682',congestion_level:'---',crowd_count:'--',time_range:'---'},
        {name:'湖中桥',lat: '27.849334503383574',lng: '112.92830754200588',congestion_level:'---',crowd_count:'--',time_range:'---'},
        {name:'木鱼大门',lat: '27.847655823249188',lng: '112.92922477482216',congestion_level:'---',crowd_count:'--',time_range:'---'}
      ],
      center: { lat: 27.846984734502954,lng: 112.92827210585119 },
      zoom: 16,
      control: {
        scale: {},
        zoom: {
          position: 'topRight',
        },
      },
       geometries: [
        { styleId: 'marker', position: { lat: 27.847655823249188, lng: 112.92922477482216 } },
        { styleId: 'marker', position: { lat: 27.845558085576478, lng: 112.92879134217787 } },
      ],
       geometries1: [
        { styleId: 'marker_dzwl0', position: { lat: 27.847655823249188, lng: 112.92922477482216 } },
        { styleId: 'marker_dzwl0', position: { lat: 27.845558085576478, lng: 112.92879134217787 } },
        { styleId: 'marker_dzwl0', position: { lat: 27.847204384204424, lng: 112.92905832158476} },
        { styleId: 'marker_dzwl0', position: { lat: 27.84648640515251, lng: 112.92903043569322} },
        { styleId: 'marker_dzwl0', position: { lat: 27.84567092679178, lng: 112.92766898603452} },
        { styleId: 'marker_dzwl0', position: { lat: 27.84802673645739, lng: 112.92712733399617} },
        { styleId: 'marker_dzwl0', position: { lat: 27.848803365584555, lng: 112.92727372643003} },
        { styleId: 'marker_dzwl0', position: { lat: 27.849544803525006, lng: 112.92772743166483} },
        { styleId: 'marker_dzwl0', position: { lat: 27.846424796959276, lng: 112.92969166132707} },
        { styleId: 'marker_dzwl0', position: { lat: 27.845656308729087, lng: 112.92974380893736} },
      ],
      styles: {
        marker: {
          width: 20,
          height: 30,
          anchor: { x: 10, y: 30 },
        },
        marker1: {
           width: 2,
                    height: 2,
                    anchor: { x: 10, y: 30 }, 
                    src: '/景区.png',
                    imageSize: { width: 2, height: 2 } 
        },
        marker_jing: {
                    width: 30,
                    height: 30,
                    anchor: { x: 20, y: 18 }, 
                    src: '/小桥.png',
                    // imageSize: { width: 80, height:80 } 
                },
        marker_jing1: {
                    width: 20,
                    height: 20,
                    anchor: { x: 20, y: 18 }, 
                    src: '/小区大门.png',
                    // imageSize: { width: 80, height:80 } 
                },
        marker_dzwl1: {
                    width: 24,
                    height: 24,
                    anchor: { x: 12, y: 12 },
                    src: '/用户坐标 (1).png',
                    imageSize: { width: 24, height: 24 }
                },
        marker_dzwl0: {
                    width: 24,
                    height: 24,
                    anchor: { x: 12, y: 12 },
                    src: '/用户坐标 (2).png',
                    imageSize: { width: 24, height: 24 }
                },
        polyline: {
          color: '#2C68FF', // 线填充色
          borderWidth: 2, // 边线宽度
          borderColor: '#004EE1', // 边线颜色
          lineCap: 'round',
          showArrow:true,
          arrowOptions:{
            space:25,
            animSpeed:18
          }
        }
      },
      options: {
        // minZoom: 5,
        zIndex: 1,
        // maxZoom: 15,
      },
        select: '',
        geometries_xing: [
        {
          id: 'polygon', // 多边形图形数据的标志信息
          styleId: 'polygon', // 样式id
          paths:paths_xing, // 多边形的位置信息
          properties: {
            // 多边形的属性数据
            title: 'polygon',
          },
        },
      ],
      styles_xing: {
        polygon: {
          color: 'rgba(41,91,255,0.16)', // 面填充色
          showBorder: true,
          borderColor: 'rgba(41,91,255,1)',
          borderWidth: 2,
        },
      },
      options_xing: {
        zIndex: 1,
      },
      visible: false,
      timer:null
    }
  },
  methods: {
    fun(){
      this.visible=!this.visible
      setTimeout(() => {
                  this.jingdian=[
                    {name:'木鱼天桥',lat: '27.84463224788258',lng: '112.92769704282682',congestion_level:'拥挤',crowd_count:'18',time_range:'未来五分钟'},
                    {name:'湖中桥',lat: '27.849334503383574',lng: '112.92830754200588',congestion_level:'正常',crowd_count:'4',time_range:'未来五分钟'},
                    {name:'木鱼大门',lat: '27.847655823249188',lng: '112.92922477482216',congestion_level:'正常',crowd_count:'6',time_range:'未来五分钟'}
                  ]
                }, 2000)
    },
    switchInfoWindow() {
    this.visible = !this.visible;  // 反转 visible 的布尔值
  },
    onClick(e) {
      console.log(e)
    },
    scoket(){
        this.socket = io(BaseUrl1);
          this.socket.on('message', (msg) => {
            if(msg.title=='py'){
              const preds = msg.value && msg.value.predictions
              if(Array.isArray(preds)){
                // 用 AI 预测结果更新各景点拥挤度/人数（按景点顺序一一对应），
                // 用 map 重建数组以触发视图与信息窗刷新
                this.jingdian = this.jingdian.map((item,index)=>{
                  const p = preds[index]
                  if(!p) return item
                  return {
                    ...item,
                    congestion_level: p.congestion_level,
                    crowd_count: p.crowd_count,
                    time_range: p.time_range
                  }
                })
                // 收到预测后显示景点信息窗
                this.visible = true
              }
            }
        });
      },
      // 拉取每个用户的最新坐标并显示在地图上（后端按 no 取 MAX(time) 的记录）
      click_fun(){
        mqttLoad().then(results=>{
          if(results.data.length!=0){
          // 每个用户一个圆点：dzwl=0 围栏内(人流量.png)，否则围栏外(人流量1.png)；坐标转数字
          this.geometries=results.data.map(item=>(
            item.dzwl==0?{
              styleId: 'marker_dzwl0', position: { lat: Number(item.lat), lng: Number(item.lng) }
            }:{
              styleId: 'marker_dzwl1', position: { lat: Number(item.lat), lng: Number(item.lng) }
            }
          ))
          this.geometries.push({
            styleId: 'marker', position: { lat: Number(this.jingdian[0].lat), lng: Number(this.jingdian[0].lng) }
          },{
            styleId: 'marker', position: { lat: Number(this.jingdian[1].lat), lng: Number(this.jingdian[1].lng) }
          },{
            styleId: 'marker', position: { lat: Number(this.jingdian[2].lat), lng: Number(this.jingdian[2].lng) }
          })}
        }).catch(err=>{
          console.error('加载用户最新坐标失败', err)
        })
      }
  },
  mounted(){
    this.click_fun();
    this.timer = setInterval(() => {
      this.click_fun();
    }, 5000);
  },
  created(){
      this.scoket()
    },
    beforeDestroy() {
      this.socket.disconnect();
      if (this.timer) {
      clearInterval(this.timer);
      this.timer = null; // 释放引用
    }
    }
}
</script>

<style scoped>

</style>
