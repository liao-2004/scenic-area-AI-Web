<template>
    <div>
        <el-button 
            size="mini"
            type="danger" 
            @click="showModal1=true"
            v-if="ok_value"
        >派遣救援</el-button>
        <el-button 
            size="mini"
            type="info"
            @click="showModal1=true"
            v-if="!ok_value"
        >呼叫完成</el-button>
        
        <el-dialog
            title="救援站 (为您寻找最近的医疗站)"
            :visible.sync="showModal1"
            top="5vh"
            width="70%"
        >
            <div>
                <tlbs-map
                    :style="{height:'500px'}"
                    ref="mapRef"
                    api-key="OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77"
                    :center="center"
                    :zoom="zoom"
                    :control="control"
                    @click="onClick"
                    @init="onMapInit"
                >
                    <!-- 救援站文字标签 -->
                    <tlbs-multi-label
                        ref="labelRef"
                        :geometries="path.map((item,index)=>({
                            id: `label_${index}`, 
                            styleId: 'label', 
                            content: `${item.name}`, 
                            position: { lat: item.lat, lng: item.lng }
                        }))"
                        :styles="styles_text"
                        :options="options"
                    />
                    
                    <!-- 地图标记 -->
                    <tlbs-multi-marker
                        ref="markerRef"
                        :geometries="geometries"
                        :styles="styles"
                    />
                    
                    <!-- 最近救援站范围圆 -->
                    <tlbs-multi-circle
                        ref="circleRef"
                        :geometries="geometries_rad"
                        :styles="styles_rad"
                        :options="options_rad"
                    />
                </tlbs-map>
            </div>
            
            <!-- 显示最近救援站信息 -->
            <div v-if="nearestHospital" class="mt-2">
                <p>最近的救援站: {{ nearestHospital.name }}</p>
                <p>距离: {{ Math.round(nearestHospital.distance) }} 米</p>
            </div>
            
            <span slot="footer" class="dialog-footer">
                <el-button @click="showModal1 = false">取 消</el-button>
                <el-button 
                    type="primary" 
                    @click="startFun"
                    :disabled="!nearestHospital"
                >
                    呼叫 {{ nearestHospital ? nearestHospital.name : '' }}
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mqttPubSos } from '@/api';
export default {
    name: 'sos_vue',
    props: ['lat', 'lng', 'ok_value', 'id'],
    data() {
        return {
            showModal1: false,
            center: { lat: 27.848294470, lng: 112.92757039732737 },
            zoom: 20,
            path: [
                { lat: 27.848293370695345, lng: 112.92743306415025, name: '救援所一站' },
                { lat: 27.848303691422696, lng: 112.92880420724111, name: '救援所二站' },
                { lat: 27.846732842719007, lng: 112.92890809148969, name: '救援所三站' },
                { lat: 27.84585384656255, lng: 112.92768974558624, name: '救援所四站' }
            ],
            geometries: [
                { styleId: 'marker', position: { lat: 27.848293370695398, lng: 112.92757039732737 } },
                { styleId: 'marker_yuan', position: { lat: 27.848293370695345, lng: 112.92743306415025 }, name: '救援一站' },
                { styleId: 'marker_yuan', position: { lat: 27.848303691422696, lng: 112.92880420724111 }, name: '救援二站' },
                { styleId: 'marker_yuan', position: { lat: 27.846732842719007, lng: 112.92890809148969 }, name: '救援三站' },
                { styleId: 'marker_yuan', position: { lat: 27.84585384656255, lng: 112.92768974558624 }, name: '救援四站' },
            ],
            // 地图控件配置
            control: {
                scale: {},
                zoom: {
                    position: 'topRight'
                }
            },
            // 点标记样式配置
            styles: {
                marker: {
                    width: 20,
                    height: 30,
                    anchor: { x: 10, y: 30 },
                    src: '/wb_user.png', // 用户位置图标
                    imageSize: { width: 25, height: 30 }
                },
                marker_yuan: {
                    width: 30,
                    height: 30,
                    anchor: { x: 10, y: 30 },
                    src: '/wb_医院.png',
                    imageSize: { width: 25, height: 18 }
                },
                marker_nearest: { // 最近救援站特殊样式
                    width: 35,
                    height: 35,
                    anchor: { x: 10, y: 30 },
                    src: '/wb_医院_highlight.png', // 高亮图标
                    imageSize: { width: 30, height: 23 }
                }
            },
            options: {
                zIndex: 1,
            },
            styles_text: {
                label: {
                    color: '#f24e4e',
                    size: 14,
                    offset: { x: 0, y: 10 },
                    angle: 0,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    fontWeight: 'bold'
                }
            },
            geometries_rad: [],
            styles_rad: {
                circle: {
                    color: 'rgba(41,91,255,0.16)',
                    showBorder: true,
                    borderColor: 'rgba(41,91,255,1)',
                    borderWidth: 2,
                },
            },
            options_rad: {
                zIndex: 1,
            },
            nearestHospital: null
        }
    },
    watch: {
        lat(newVal) {
            if (newVal !== undefined && !isNaN(newVal)) {
                this.center.lat = parseFloat(newVal);
                this.geometries[0].position.lat = parseFloat(newVal);
                this.calcNearestHospital();
            }
        },
        lng(newVal) {
            if (newVal !== undefined && !isNaN(newVal)) {
                this.center.lng = parseFloat(newVal);
                this.geometries[0].position.lng = parseFloat(newVal);
                this.calcNearestHospital();
            }
        }
    },
    created() {
        // 初始化时验证并设置坐标
        if (this.lat !== undefined && this.lng !== undefined && !isNaN(this.lat) && !isNaN(this.lng)) {
            this.center = { lat: parseFloat(this.lat), lng: parseFloat(this.lng) };
            this.geometries[0].position = { lat: parseFloat(this.lat), lng: parseFloat(this.lng) };
            this.calcNearestHospital();
        } else {
            this.$message.warning('传入的经纬度无效，使用默认坐标');
        }
    },
    methods: {
        // 地图初始化完成回调
        onMapInit(map) {
            console.log('地图初始化完成', map);
            this.calcNearestHospital(); // 确保地图初始化后计算最近救援站
        },
        
        onClick(e) {
            console.log('点击地图坐标:', e.lat, e.lng);
        },
        
        // 角度转弧度
        toRadians(deg) {
            return deg * Math.PI / 180;
        },
        
        // 计算两点间距离（米）
        getDistance(lat1, lon1, lat2, lon2) {
            if (!lat1 || !lon1 || !lat2 || !lon2 || isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
                return Infinity;
            }
            
            const R = 6371000; // 地球半径（米）
            const dLat = this.toRadians(lat2 - lat1);
            const dLon = this.toRadians(lon2 - lon1);
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
            return R * c;
        },
        
        // 根据距离计算合适的缩放级别
        getZoomLevelByDistance(distance) {
            if (distance < 100) return 20;    // 100米内
            if (distance < 500) return 19;    // 500米内
            if (distance < 1000) return 14;   // 1公里内
            if (distance < 5000) return 12;   // 5公里内
            return 10;                        // 5公里以上
        },
        
        // 计算最近的救援站
        calcNearestHospital() {
            const userLat = this.center.lat;
            const userLng = this.center.lng;
            
            // 验证用户坐标
            if (isNaN(userLat) || isNaN(userLng)) {
                this.$message.error('无法获取有效的位置信息');
                return;
            }

            // 计算所有救援站距离并过滤无效数据
            const distances = this.path.map(hospital => ({
                ...hospital,
                distance: this.getDistance(userLat, userLng, hospital.lat, hospital.lng)
            })).filter(h => h.distance !== Infinity);

            if (distances.length === 0) {
                this.$message.warning('未找到可用的救援站');
                this.nearestHospital = null;
                this.geometries_rad = [];
                return;
            }

            // 筛选最近的救援站
            this.nearestHospital = distances.reduce((prev, curr) => 
                prev.distance < curr.distance ? prev : curr
            );

            // 绘制最近救援站的范围圆
            const radius = Math.round(this.nearestHospital.distance) + 10;
            this.geometries_rad = [{
                styleId: 'circle',
                radius: radius,
                center: this.nearestHospital
            }];

            // 调整缩放级别确保用户和最近救援站都可见
            this.zoom = this.getZoomLevelByDistance(radius);
            
            // 更新标记样式，高亮最近的救援站
            this.updateMarkerStyles();
        },
        
        // 更新标记样式，高亮最近的救援站
        updateMarkerStyles() {
            if (!this.nearestHospital) return;
            
            this.geometries = this.geometries.map(marker => {
                // 找到最近救援站的标记并修改样式
                if (marker.name && marker.name.includes(this.nearestHospital.name)) {
                    return { ...marker, styleId: 'marker_nearest' };
                }
                return marker;
            });
        },
        
        // 发送呼叫请求
        startFun() {
            if (!this.nearestHospital) return;
            
            this.showModal1 = false;
            mqttPubSos().then(() => {
                this.$message.success(`已向${this.nearestHospital.name}发送救援请求`);
            }).catch(err => {
                this.$message.error('发送救援请求失败，请重试');
                console.error('请求失败:', err);
            });
            
            this.$emit('f5', { id: this.id, name: this.nearestHospital.name });
        }
    }
}
</script>

<style>
/* 可以添加自定义样式 */
.mt-2 {
    margin-top: 12px;
    padding: 8px;
    background-color: #f5f7fa;
    border-radius: 4px;
}
</style>
