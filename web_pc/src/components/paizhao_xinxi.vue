<template>
    <div>
        <el-button 
            type="primary" 
            icon="el-icon-view" 
           @click="startfun"
        >
            查看
        </el-button>
        <el-dialog
        title="用户活动轨迹"
        :visible.sync="showModal1"
        top="5vh"
        width="70%">
        <div>
            <el-table
                    :data="list"
                    height="460"
                    style="width: 100%;height: 54vh;margin-bottom: 20px;">
                    <el-table-column label="设备编号" width="130">
                        <template slot-scope="scope">{{ scope.row.id }}</template>
                    </el-table-column>
                    <el-table-column label="姓名" width="150">
                        <template slot-scope="scope">{{ scope.row.name }}</template>
                    </el-table-column>
                    <el-table-column label="预约时间" width="300">
                        <template slot-scope="scope">
                            <i class="el-icon-time"></i>
                            <span>{{ scope.row.ondate }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="拍摄时间" width="300">
                        <template slot-scope="scope">
                            <i class="el-icon-time"></i>
                            <span>{{ scope.row.todate }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="预约相机单位" width="220">
                        <template slot-scope="scope">
                            <span style="margin-left: 10px">{{ scope.row.address }}</span>
                        </template>
                    </el-table-column>
                </el-table>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="stopFun">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name:'paizhao_xinxi',
    props:['list'],
    data(){
        return{
             showModal1:false,
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
            IPV4:'http://127.0.0.1',
            path: [
                { lat: 27.848293370695345, lng: 112.92743306415025, name: '救援所一站' },
                { lat: 27.848303691422696, lng: 112.92880420724111, name: '救援所二站' },
                { lat: 27.846732842719007, lng: 112.92890809148969, name: '救援所三站' },
                { lat: 27.84585384656255, lng: 112.92768974558624, name: '救援所四站' }
            ]
        }
    },
    methods:{
       startfun(){
        this.showModal1=true
      },
      stopFun(){
        this.showModal1=false
      }
    },
beforeDestroy() {
}
}
</script>
<style>
</style>