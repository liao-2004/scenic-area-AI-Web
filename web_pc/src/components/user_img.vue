<template>
    <div :style="{marginLeft:'50px',borderLeft:'2px solid #adb5bd'}">
    <div :style="{display:'flex'}">
        <el-tabs  @click="initChart(0)" tab-position="left" style="height: 350px;width: 130px;">
            <el-tab-pane>
              <span slot="label" :style="{padding:'20px 0'}"  @click="initChart(0)">{{ time1 }}</span>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label" :style="{padding:'20px 0'}" @click="initChart(1)">{{ time2 }}</span>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label" :style="{padding:'20px 0'}" @click="initChart(2)">{{ time3 }}</span>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label" :style="{padding:'20px 0'}" @click="initChart(3)">{{ time4 }}</span>
            </el-tab-pane>
        </el-tabs>
        <div>
                <div ref="img" class="chart" :style="{width:'480px',height:'350px'}"></div>
        </div>
    </div>
    <div>
        <h7 :style="{fontSize:'17px',fontWeight :'bold',marginLeft:'280px'}">旅客人数统计</h7>
        <div ref="img1" class="chart" :style="{width:'680px',height:'290px'}"></div>
    </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'
import { imgStart } from '@/api'
import dayjs from 'dayjs'
export default {
  name: 'SimpleLineChart',
  data() {
    return {
        time1:dayjs().subtract(1, 'day').format('MM月DD日'),
        time2:dayjs().subtract(2, 'day').format('MM月DD日'),
        time3:dayjs().subtract(3, 'day').format('MM月DD日'),
        time4:dayjs().subtract(4, 'day').format('MM月DD日'),
      chart: null,
      chart1: null,
      option: {},
      option1: {},
      list: [
        { type: 0, f_name: 'Temperature' },
        { type: 0, f_name: 'Humidity' }
      ],
      data_max: [
        { c_time: '00:00', Temperature: 20, Humidity: 60 },
        { c_time: '06:00', Temperature: 18, Humidity: 65 },
        { c_time: '12:00', Temperature: 25, Humidity: 50 },
        { c_time: '18:00', Temperature: 22, Humidity: 55 },
        { c_time: '24:00', Temperature: 21, Humidity: 58 }
      ],
      img_data:{
        img1:[
            [
                {value:64,name:'早上(6-10点)'},
                {value:64,name:'中午(10-14点)'},
                {value:23,name:'下午(14-18点)'},
                {value:63,name:'晚上(18-22点)'},
            ],[
                {value:21,name:'早上(6-10点)'},
                {value:34,name:'中午(10-14点)'},
                {value:24,name:'下午(14-18点)'},
                {value:28,name:'晚上(18-22点)'},
            ],[
                {value:19,name:'早上(6-10点)'},
                {value:41,name:'中午(10-14点)'},
                {value:33,name:'下午(14-18点)'},
                {value:52,name:'晚上(18-22点)'},
            ],[
                {value:64,name:'早上(6-10点)'},
                {value:23,name:'中午(10-14点)'},
                {value:42,name:'下午(14-18点)'},
                {value:43,name:'晚上(18-22点)'},
            ]
        ],
        img2:{
            list:[dayjs().subtract(7, 'day').format('MM月DD日'),dayjs().subtract(6, 'day').format('MM月DD日'),dayjs().subtract(5, 'day').format('MM月DD日'),dayjs().subtract(4, 'day').format('MM月DD日'),dayjs().subtract(3, 'day').format('MM月DD日'),dayjs().subtract(2, 'day').format('MM月DD日'),dayjs().subtract(1, 'day').format('MM月DD日'),],
            data:[150, 230, 224, 218, 135, 147, 260]
        }
      }
    }
  },
  methods: {
    initChart(day) {
      console.log(day)
      // 确保销毁已有实例
      if (this.chart) {
        this.chart.dispose()
      }
      this.chart = null
      this.option={}
      // 初始化图表
      this.chart = echarts.init(this.$refs.img)

      // 兼容后端返回的 {period, record_count} 与默认的 {name, value}
      const pieData = this.img_data.img1[day].map(item => ({
        name: item.name !== undefined ? item.name : item.period,
        value: item.value !== undefined ? item.value : item.record_count
      }))

      // 设置图表配置
      this.option = {
            title: {
        text: '旅客入园时间段统计',
        // subtext: 'Fake Data',
        left: 'center'
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
        bottom: 10,
        left: 'center',
        data: pieData.map(item=>
            item.name
        )
    },
    series: [
        {
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        selectedMode: 'single',
        data: pieData,
        emphasis: {
            itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }
  ]
      }
      
      this.chart.setOption(this.option)
    },
    initChart1() {
      // 确保销毁已有实例
      if (this.chart1) {
        this.chart1.dispose()
      }
      
      // 初始化图表
      this.chart1 = echarts.init(this.$refs.img1)
      
      // 设置图表配置
      this.option1 = {
           xAxis: {
    type: 'category',
    data: this.img_data.img2.list
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: this.img_data.img2.data,
      type: 'line'
    }
  ]
      }
      
      this.chart1.setOption(this.option1)
    }
  },
  mounted() {
    // 监听窗口大小变化
    imgStart().then(results=>{
        this.img_data=results.data
        this.img_data.img1.forEach((item,index)=>{
            if(item.length==0){
                this.img_data.img1[index]=[{period:'暂无数据',record_count:1}]
            }
        })
        // 数据返回后用真实数据重绘两张图表
        this.initChart(0)
        this.initChart1()
    })
        this.initChart(0)
        this.initChart1()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 组件销毁时清理
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.chart-box {
  width: 100%;
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>