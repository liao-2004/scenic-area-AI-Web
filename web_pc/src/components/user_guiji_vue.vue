<template>
    <div>
        <el-button size="mini" type="info" @click="startfun">查看</el-button>
        <el-dialog
        title="用户活动轨迹"
        :visible.sync="showModal1"
        top="5vh"
        width="70%">
        <div>
            <tlbs-map
                ref="mapRef"
                api-key="OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77"
                :center="center"
                :zoom="19"
                :style="{ borderRadius: '80px'}"
            >
                <tlbs-multi-polyline
                        ref="polylineRef"
                        :geometries="polylineGeometries"
                        :styles="styles"
                        :options="options"
                    />
                <!-- 用户当前位置：用 用户坐标 (2).png 标记 -->
                <tlbs-multi-marker
                        ref="markerRef"
                        :geometries="markerGeometries"
                        :styles="styles"
                    />
            </tlbs-map>
        </div>
        <span slot="footer" class="dialog-footer">
            <!-- <el-button @click="showModal1 = false">取 消</el-button> -->
            <el-button type="primary" @click="stopFun">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>
<script>
import { mqttData } from '@/api'
export default {
    name:'sos_vue',
    props:['no'],
    data(){
        return{
             showModal1:false,
            center:{ lat: 27.84685996895247, lng: 112.92757039732737 },
            polylineGeometries: [],
            markerGeometries: [],
            styles: {
                marker: {
                width: 16,
                height: 16,
                anchor: { x: 16, y: 10 },
                src: '/用户坐标 (2).png', // 用户位置图标
                imageSize: { width: 16, height: 16 }
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
            timer:null
        }
    },
    watch:{
        no(newVal){
            if (newVal !== undefined && !isNaN(newVal)) {
                this.loadfun();
            }
        },
        showModal1(newVal){
            if(newVal==false){
                clearInterval(this.timer);
            }
        }
    },
    methods:{
        // 拉取该用户坐标并渲染到地图（公共方法）
        fetchAndRender(){
            return mqttData(this.no).then(results=>{
                const data = Array.isArray(results.data) ? results.data : []
                if(!data.length){
                    // 无坐标数据：清空轨迹和标记，提示
                    this.polylineGeometries=[]
                    this.markerGeometries=[]
                    if(this.showModal1){
                        this.$message && this.$message.warning('该用户暂无坐标数据')
                    }
                    return
                }
                // 地图中心定位到最新一个点
                const last = data[data.length-1]
                this.center = { lat: Number(last.lat), lng: Number(last.lng) }
                // 用 用户坐标 (2).png 在用户最新位置打标记
                this.markerGeometries = [
                    {
                        id: 'user-marker',
                        styleId: 'marker',
                        position: { lat: Number(last.lat), lng: Number(last.lng) }
                    }
                ]
                // 多个点才画轨迹线，单个点只定位中心（已设置）
                if(data.length>1){
                    this.polylineGeometries=[
                        {
                            id: 'polyline1',
                            styleId: 'polyline',
                            paths: data.map(item=>({ lat:Number(item.lat), lng:Number(item.lng) })),
                            properties: { title: 'polyline' }
                        }
                    ]
                }else{
                    this.polylineGeometries=[]
                }
            }).catch(err=>{
                console.log(err && err.message)
            })
        },
        settimefun(){
            this.timer = setInterval(() => {
                console.log('计时器启动中')
                this.fetchAndRender()
            }, 5000);
        },
        startfun(){
            this.fetchAndRender()
            this.showModal1=true
            this.settimefun()
        },
        loadfun(){
            this.fetchAndRender()
        },
        stopFun(){
            clearInterval(this.timer);
            this.showModal1=false
        }
    },
beforeDestroy() {
    // 组件销毁前清除定时器
    clearInterval(this.timer);
}
}
</script>
<style>
</style>