<template>
    <div>
        <el-button 
            type="primary" 
            icon="el-icon-view" 
            @click="showModal1 = true"
            v-if="list.length !== 0"
        >
            查看救援信息
        </el-button>
        
        <el-dialog
            title="救援信息"
            :visible.sync="showModal1"
            top="5vh"
            width="70%"
        >
            
            <div>
                <el-table
                    :data="table_list"
                    height="460"
                    style="width: 100%;height: 54vh;margin-bottom: 20px;">
                    <el-table-column label="姓名" width="100">
                        <template slot-scope="scope">{{ scope.row.name }}</template>
                    </el-table-column>
                    <el-table-column label="设备编号" width="130">
                        <template slot-scope="scope">{{ scope.row.id }}</template>
                    </el-table-column>
                    <el-table-column label="位置" width="320">
                        <template slot-scope="scope">{{ scope.row.lat }},{{ scope.row.lng }}</template>
                    </el-table-column>
                    <el-table-column label="消息发送时间" width="180">
                        <template slot-scope="scope">
                            <i class="el-icon-time"></i>
                            <span>{{ scope.row.date }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="救援接收时间" width="180">
                        <template slot-scope="scope">
                            <i class="el-icon-time"></i>
                            <span>{{ scope.row.sos_date }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="救援单位" width="180">
                        <template slot-scope="scope">
                            <span style="margin-left: 10px">{{ scope.row.danwei }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            
            <span slot="footer" class="dialog-footer">
                <el-button 
                    type="primary" 
                    @click="showModal1 = false"
                >
                    确认
                </el-button>
                <el-button 
                type="success" 
                icon="el-icon-download" 
                @click="downloadTable"
                style="margin-bottom: 15px;"
            >
                下载表格内容
            </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { saveAs } from 'file-saver'; // 导入file-saver

export default {
    name: 'sos_user_vue',
    props: ['list'],
    data() {
        return {
            showModal1: false,
            table_list: []
        }
    },
    watch: {
        list(newVal) {
            this.table_list = newVal;
        }
    },
    methods: {
        // 下载表格内容为CSV文件
        downloadTable() {
            if (this.table_list.length === 0) {
                this.$message.warning('暂无数据可下载');
                return;
            }

            // 1. 定义CSV表头（与表格列对应）
            const headers = [
                '姓名',
                '设备编号',
                '位置',
                '消息发送时间',
                '救援接收时间',
                '救援单位'
            ];

            // 2. 转换数据为CSV行
            const rows = this.table_list.map(row => [
                row.name || '', // 处理可能的空值
                row.id || '',
                `${row.lat || ''}，${row.lng || ''}`, // 拼接经纬度
                row.date || '',
                row.sos_date || '',
                row.danwei || ''
            ]);

            // 3. 组合CSV内容（表头 + 数据行）
            const csvContent = [
                headers.join(','), // 表头行
                ...rows.map(row => row.join(',')) // 数据行
            ].join('\n');

            // 4. 创建Blob对象并下载
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            // 文件名格式：救援信息_yyyyMMddHHmmss.csv
            const fileName = `救援信息_${this.formatDate()}.csv`;
            saveAs(blob, fileName);

            this.$message.success('表格下载成功');
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
        }
    }
}
</script>

<style>
</style>