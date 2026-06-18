<template>
    <div class="table_div">
      <!-- <el-button :plain="true" @click="open1">消息</el-button> 
      <el-button @click="closeMessage">关闭</el-button> -->
        <el-tabs tab-position="left" :style="{height:'82vh'}">
            <!-- <el-tab-pane label="用户管理">用户管理</el-tab-pane> -->
            <el-tab-pane>
              <span slot="label" :style="{paddingRight:'4px'}">人流密度</span>
              <tmp></tmp>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label" :style="{paddingRight:'4px'}">用户管理</span>
              <user></user>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label" :style="{padding:'20px 0',paddingRight:'4px'}" @click="closeMessage">救援消息</span>
                <div :style="{display:'flex','justify-content':'space-between'}">
                  <h5 :style="{margin:'auto 25px',fontWeight: '900'}">救援消息</h5>
                  <div>
                    输入设备编号：
                    <el-input :style="{width:'18vw'}"></el-input>
                    <el-button>查询</el-button>
                  </div>
                </div>
                <div :style="{height:'100%'}">
                   <el-table
                    :data="tableData"
                    height="460"
                    style="width: 100%;height: 54vh;margin-bottom: 20px;">
                    <el-table-column
                      label="姓名"
                      width="180">
                      <template slot-scope="scope">
                        <span>{{ scope.row.name }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="设备编号"
                      width="180">
                      <template slot-scope="scope">
                        <span>{{ scope.row.id }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="位置"
                      width="320">
                      <template slot-scope="scope">
                        <span>{{ scope.row.lat }},{{ scope.row.lng }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="消息发送时间"
                      width="180">
                      <template slot-scope="scope">
                        <i class="el-icon-time"></i>
                        <span>{{ scope.row.date }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="救援单位"
                      width="180">
                      <template slot-scope="scope">
                        <span style="margin-left: 10px">{{ scope.row.danwei }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                    label="操作">
                      <template slot-scope="scope">
                        <sos :id="scope.row.id" :title="id" @f5="f5Fun" :ok_value="scope.row.ok_value" :lat="tableData[scope.$index].lat" :lng="tableData[scope.$index].lng"></sos>
                        <!-- <el-button
                          size="mini"
                          type="danger"
                          @click="handleDelete(scope.$index, scope.row)">删除</el-button> -->
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <div :style="{display:'flex',justifyContent:'space-around'}">
                    <el-col :span="5" v-for="(item,index) in path" :key="index">
                      <el-card shadow="hover" :style="{height:'150px',}">
                        <div :style="{height:'80px'}">
                          <span :style="{fontWeight: 'bold'}">{{item.name}}</span><br>
                          <div :style="{paddingTop:'10px'}">
                            <span :style="{paddingTop:'40px'}" v-if="count(index).count!=0">已救援人数：{{ count(index).count }}</span>
                            <span :style="{paddingTop:'40px'}" v-if="count(index).count==0">暂无救援记录</span>
                          </div>
                        </div>
                        <sos_user :list="count(index).list"></sos_user>
                      </el-card>
                    </el-col>
                  </div>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label" :style="{paddingRight:'4px'}">拍照系统管理</span>
              <paizhao></paizhao>
            </el-tab-pane>
        </el-tabs>
        
    </div>
</template>

<script>
import io from 'socket.io-client';
import tmp from '../components/tmp.vue'
import sos from '../components/sos.vue'
import sos_user from '../components/sos_user.vue'
import user from '../components/user.vue'
import paizhao from '../components/paizhao.vue'
import { cloudYyy, BaseUrl1 } from '@/api'
import dayjs from 'dayjs'
export default {
    components:{
        tmp,
        sos,
        user,
        sos_user,
        paizhao
    },data(){
        return{
          socket:null,
            tableData: [
              {
              id:0,
          date: '2025-08-17 15:24',
          sos_date: '2025-08-16 21:24',
          name: '王小虎',
          lat: '27.848293370695384', 
          lng: '112.92757039732784',
          address: '上海市普陀区金沙江路 1518 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:1,
          date: '2025-08-17 12:24',
          sos_date: '2025-08-17 21:24',
          name: '李一',
          lat: '27.848303691422696', 
          lng: '112.92880420724111',
          address: '上海市普陀区金沙江路 1517 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:2,
          date: '2025-08-17 11:24',
          sos_date: '2025-08-17 21:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:3,
          date: '2025-08-17 11:23',
          sos_date: '2025-08-17 21:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:4,
          date: '2025-08-17 11:22',
          sos_date: '2025-08-17 21:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:5,
          date: '2025-08-17 11:21',
          sos_date: '2025-08-17 21:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:6,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:7,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:8,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:9,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:10,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:11,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:12,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:13,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        },{
              id:14,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          name: '王小虎',
          lat: '27.848293370695384', 
          lng: '112.92757039732784',
          address: '上海市普陀区金沙江路 1518 弄',
          ok_value:true,
          danwei:'--'
        }
      ],
        i:15,
        messageInstance: null,
        path: [
                { lat: 27.848293370695345, lng: 112.92743306415025, name: '救援所一站' },
                { lat: 27.848303691422696, lng: 112.92880420724111, name: '救援所二站' },
                { lat: 27.846732842719007, lng: 112.92890809148969, name: '救援所三站' },
                { lat: 27.84585384656255, lng: 112.92768974558624, name: '救援所四站' }
            ]
        }
    },
    methods:{
      fetchCloudData() {
        console.log('测试开始')
        cloudYyy().then(response=>{
          console.log('云服务器响应', response.data)
        }).catch(err=>{
          console.error('云服务错误', err)
          this.$message.error('请求失败，请稍后重试')
        })
      },
      handleDelete(index,row){
        console.log(index,row)
      },
      open1() {
        const h =  this.$createElement;
        this.messageInstance = this.$message({
          message: h('p', null, [
            h('span',{ 
      style: { 
        fontSize: '14px', // 放大文字大小（默认一般是14px）
        lineHeight: '1.5' // 可选：调整行高
      } 
    }, '收到一条求救消息')
          ]),
           type: 'error',
           showClose: true,
          duration:0,
        });
      },
      closeMessage() {
        if (this.messageInstance) {
          this.messageInstance.close();
          this.messageInstance = null;
        }
      },
      scoket(){
        this.socket = io(BaseUrl1);
          this.socket.on('message', (msg) => {
            if(msg.title=='sos'){
              this.closeMessage()
              this.open1()
              // 实时救援消息：来自设备的 SOS（不落库，仅实时展示）
              this.tableData.unshift({
                id:msg.id || msg.name,
                date:msg.date,
                sos_date: '----',
                name: msg.name,
                lat: msg.lat,
                lng: msg.lng,
                address: '--',
                ok_value:true,
                danwei:'--'
              })
            }
        });
      },
      count(index){
        let list=[]
        let count=0
        this.tableData.forEach(item=>{
          if(this.path[index].name==item.danwei){
            list.push(item)
            count++
          }
        })
        console.log('--------------',list,count)
        return {
          list:list,
          count:count
        }
      },
      f5Fun(title){
        this.tableData.forEach(item=>{
          if(title.id==item.id){
            item.ok_value=false
            item.danwei=title.name
            item.sos_date=dayjs().format('YYYY-MM-DD HH:mm')
          }
        })
      }
    },
    created(){
      // 救援消息为实时数据，清空示例 mock，仅展示来自 socket 的真实 SOS
      this.tableData=[]
      this.scoket()
    },
    beforeDestroy() {
      this.socket.disconnect();
    }
}
</script>
<style scoped>
    .table_div{
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        border-radius: 2px ;
        height:100%;
        width: 90%;
        margin: 20px auto;
    }
    .control-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1001;
    display: flex;
    align-items: center;
    }
</style>