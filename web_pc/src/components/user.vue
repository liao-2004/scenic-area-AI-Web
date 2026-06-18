<template>
    <div>
        <div :style="{display:'flex','justify-content':'space-between'}">
                <h5 :style="{margin:'auto 25px',fontWeight: '900'}">用户管理</h5>
                <div style="width: 20vw;">
                  <el-input :placeholder="`请输入${select_list[select-1].label}`" :style="{width:'20vw'}" v-model="input3" class="input-with-select" clearable @keyup.enter.native="searchUser" @clear="searchUser">
                    <el-select v-model="select" slot="prepend" placeholder="请选择" :style="{width:'105px'}">
                      <el-option label="编号" value="1"></el-option>
                      <el-option label="姓名" value="2"></el-option>
                      <el-option label="电话" value="3"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
                  </el-input>
                </div>
              </div>
              <div :style="{display:'flex',}">
              <div :style="{width:'880px',}">
                <el-table
                :data="tableData"
                :style="{width: '100%',height:'570px'}">
                  <el-table-column
                    label="姓名"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.username }}</span>
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
                    label="电话"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.dianhua }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="查看位置">
                    <template slot-scope="scope">
                        <user_guiji :no="scope.row.id"></user_guiji>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                      <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
                      <el-button size="mini" type="danger" @click="removeUser(scope.row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
            <div :style="{margin:'40px',display:'flex',alignItems:'center',justifyContent:'center',gap:'15px'}">
              <el-button @click="prevPage" :disabled="index===0">上一页</el-button> {{ index+1 }}<el-button @click="nextPage" :disabled="tableData.length<9">下一页</el-button><el-button
                type="success" 
                icon="el-icon-download" 
                @click="downloadTable"
            >
                下载今日入园旅客信息
            </el-button>
            </div>
        </div>
        <div>
          <user_img></user_img>
        </div>
      </div>

      <!-- 编辑用户弹窗 -->
      <el-dialog title="编辑用户" :visible.sync="dialogVisible" width="400px">
        <el-form :model="editForm" label-width="70px">
          <el-form-item label="编号">
            <el-input v-model="editForm.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="editForm.nickname" placeholder="请输入姓名"></el-input>
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="editForm.dianhua" placeholder="请输入电话"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="dialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="saveEdit">保 存</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import { saveAs } from 'file-saver';
import { userSelect, userUpdate, userDelete, selectDate } from '@/api'
import user_guiji from './user_guiji_vue.vue'
import user_img from './user_img.vue'
export default {
    name:'user_vue',
    data(){
        return{
          select_list:[
            {id:1,label:'编号'},
            {id:2,label:'姓名'},
            {id:3,label:'电话'},
          ],
            index:0,
            input3: '',
            tableData: [],
            select:'1',
            new_list:[],
            dialogVisible:false,
            editForm:{ id:'', nickname:'', dianhua:'' }
        }
    },
    components:{
        user_guiji,
        user_img
    },
    methods:{
        load_fun(){
            // select: 1=编号(id) 2=姓名(nickname) 3=电话(dianhua)
            const fieldMap={'1':'id','2':'nickname','3':'dianhua'}
            userSelect({
                index:this.index*9,
                field:fieldMap[this.select],
                keyword:this.input3
            }).then(results=>{
                this.tableData=results.data
                console.log(results)
            })
        },
        // 点击搜索/回车：回到第一页并按条件查询
        searchUser(){
            this.index=0
            this.load_fun()
        },
        // 打开编辑弹窗（username 是 nickname 的别名）
        openEdit(row){
            this.editForm={ id:row.id, nickname:row.username, dianhua:row.dianhua }
            this.dialogVisible=true
        },
        // 保存编辑
        saveEdit(){
            userUpdate(this.editForm).then(res=>{
                if(res.data && res.data.code===0){
                    this.$message.success('更新成功')
                    this.dialogVisible=false
                    this.load_fun()
                }else{
                    this.$message.error((res.data && res.data.message) || '更新失败')
                }
            }).catch(()=>this.$message.error('更新失败'))
        },
        // 删除用户（二次确认）
        removeUser(row){
            this.$confirm(`确定删除用户「${row.username || row.id}」吗？`, '提示', {
                type:'warning',
                confirmButtonText:'删除',
                cancelButtonText:'取消'
            }).then(()=>{
                userDelete({ id:row.id }).then(res=>{
                    if(res.data && res.data.code===0){
                        this.$message.success('删除成功')
                        // 若删除后当前页空了且不是第一页，自动回退一页
                        if(this.tableData.length===1 && this.index>0){
                            this.index--
                        }
                        this.load_fun()
                    }else{
                        this.$message.error((res.data && res.data.message) || '删除失败')
                    }
                }).catch(()=>this.$message.error('删除失败'))
            }).catch(()=>{})
        },
        prevPage(){
            if(this.index>0){
                this.index--
                this.load_fun()
            }
        },
        nextPage(){
            // 满 9 条说明可能还有下一页
            if(this.tableData.length===9){
                this.index++
                this.load_fun()
            }
        },
        downloadTable() {
          selectDate().then(results=>{
          if (!results.data || results.data.length === 0) {
                this.$message.warning('暂无今日入园旅客数据可下载');
                return;
            }
            this.new_list=results.data
            console.log(this.new_list,'===========----')

            // 1. 定义CSV表头（与入园旅客信息对应）
            const headers = [
                '姓名',
                '编号',
                '电话',
                '入园时间'
            ];

            // 2. 转换数据为CSV行
            const rows = this.new_list.map(row => [
                row.username || '', // 处理可能的空值
                row.no || '',
                row.dianhua || '',
                this.formatCellTime(row.time)
            ]);

            // 3. 组合CSV内容（表头 + 数据行）
            const csvContent = [
                headers.join(','), // 表头行
                ...rows.map(row => row.join(',')) // 数据行
            ].join('\n');

            // 4. 创建Blob对象并下载（加 BOM 防止 Excel 打开中文乱码）
            const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' });
            // 文件名格式：今日入园旅客信息_yyyyMMddHHmmss.csv
            const fileName = `今日入园旅客信息_${this.formatDate()}.csv`;
            saveAs(blob, fileName);

            this.$message.success(`已下载今日入园旅客信息，共 ${this.new_list.length} 人`);
            })
        },

        // 辅助方法：格式化当前时间为文件名格式
        formatDate() {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}${month}${day}${hours}${minutes}${seconds}`;
        },

        // 辅助方法：把入园时间格式化为 yyyy-MM-dd HH:mm:ss（避免后端返回的 ISO 字符串带 T/Z）
        formatCellTime(t) {
            if (!t) return '';
            const date = new Date(t);
            if (isNaN(date.getTime())) return t; // 解析失败则原样返回
            const pad = n => String(n).padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
                   `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        }
    },
    mounted(){
        this.load_fun()
    }
}
</script>
<style>
.cell{
  padding-left: 200px;
}
</style>