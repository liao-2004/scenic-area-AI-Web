<template>
    <div :style="{display:'flex'}">
    <div>
                  <h5 :style="{margin:'auto 25px',fontWeight: '900'}">预约用户信息</h5>
                  <el-table
                :data="tableData"
                :style="{width: '100%',height:'670px'}">
                  <el-table-column
                    label="姓名"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="编号"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.id }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="拍照智能站点"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.address }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="预约时间"
                    width="250">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.ondate }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="拍摄时间"
                    width="250">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.todate }}</span>
                    </template>
                  </el-table-column>
                </el-table>
                <div :style="{display:'flex',justifyContent:'center',gap:'20px',marginTop:'20px',alignItems:'center'}">
                    <el-button @click="handlePrevPage">上一页</el-button><span> 1 </span><el-button @click="handleNextPage">下一页</el-button>
                </div>
  </div>
  <div>
    <div :style="{display:'flex', flexDirection:'column', gap:'20px', 'margin-left':'100px'}">
                    <el-col :span="5" v-for="(item,index) in path" :key="index">
                      <el-card shadow="hover" :style="{height:'150px',width:'250px'}">
                        <div :style="{height:'80px'}">
                            <div :style="{display:'flex',justifyContent:'space-between'}">
                            <span :style="{fontWeight: 'bold'}">{{item.name}}</span>
                            <el-tag type="danger">异常</el-tag>
                            </div>
                          <div :style="{paddingTop:'10px'}">
                          </div>
                          <span :style="{paddingTop:'40px'}">今日预约人数:{{ item.count }}</span>
                        </div>
                        <xinxi :list="count(index).list"></xinxi>
                      </el-card>
                    </el-col>
                  </div>
  </div>
  </div>
</template>

<script>
import xinxi from './paizhao_xinxi.vue'
export default {
  name: 'tmp_daima',
  components:{
    xinxi
  },
  data() {
    return {
        tableData: [
        {
              id:0,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '王小虎',
          lat: '27.848293370695384', 
          lng: '112.92757039732784',
          address: '景区拍照一站',
          ok_value:true,
          danwei:'--'
        }, {
          id:1,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李一',
          lat: '27.848303691422696', 
          lng: '112.92880420724111',
          address: '景区拍照三站',
          ok_value:true,
          danwei:'--'
        }, {
          id:2,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '景区拍照三站',
          ok_value:true,
          danwei:'--'
        }, {
          id:3,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '景区拍照二站',
          ok_value:true,
          danwei:'--'
        }, {
          id:4,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '景区拍照二站',
          ok_value:true,
          danwei:'--'
        }, {
          id:5,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '景区拍照二站',
          ok_value:true,
          danwei:'--'
        }, {
          id:6,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '景区拍照二站',
          ok_value:true,
          danwei:'--'
        }, {
          id:7,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '景区拍照一站',
          ok_value:true,
          danwei:'--'
        }, {
          id:8,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '景区拍照一站',
          ok_value:true,
          danwei:'--'
        }, {
          id:9,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '景区拍照三站',
          ok_value:true,
          danwei:'--'
        }, {
          id:10,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '景区拍照二站',
          ok_value:true,
          danwei:'--'
        }, {
          id:11,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '景区拍照三站',
          ok_value:true,
          danwei:'--'
        }, {
          id:12,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '景区拍照二站',
          ok_value:true,
          danwei:'--'
        }, {
          id:13,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '景区拍照一站',
          ok_value:true,
          danwei:'--'
        },{
              id:14,
          ondate: '2025-08-13 08:24',
          todate: '2025-08-13 08:24',
          name: '王小虎',
          lat: '27.848293370695384', 
          lng: '112.92757039732784',
          address: '景区拍照一站',
          ok_value:true,
          danwei:'--'
        }
      ],
        path: [
                { lat: 27.848293370695345, lng: 112.92743306415025, name: '景区拍照一站',count:5 },
                { lat: 27.848303691422696, lng: 112.92880420724111, name: '景区拍照二站',count:6 },
                { lat: 27.846732842719007, lng: 112.92890809148969, name: '景区拍照三站',count:4 },
                { lat: 27.84585384656255, lng: 112.92768974558624, name: '景区拍照四站',count:0 }
            ]
    }
  },
  methods: {
    count(index){
        let list=[]
        let count=0
        this.tableData.forEach(item=>{
          if(this.path[index].name==item.address){
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
    handlePrevPage() {
      // 用 Element UI 的 $message 替代原生 alert，样式更统一
      this.$message({
        message: '无上一页',
        type: 'warning', // 警告类型（可选：success/info/warning/error）
        duration: 1500, // 自动关闭时间（ms），默认 3000
        center: true // 文字居中
      });
    },
    handleNextPage() {
      this.$message({
        message: '最后一页',
        type: 'warning',
        duration: 1500,
        center: true
      });
    }
  }
}
</script>

<style scoped>

</style>
