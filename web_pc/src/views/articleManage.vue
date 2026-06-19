<template>
  <div class="article-manage">
    <el-card class="article-card">
      <!-- 卡片头部：标题 + 分类筛选 + 新增 -->
      <div slot="header" class="card-header">
        <span>文章管理</span>
        <div class="actions">
          <el-select
            v-model="filterCid"
            placeholder="全部分类"
            clearable
            size="small"
            style="width: 150px"
            @change="search">
            <el-option
              v-for="c in classList"
              :key="c.id"
              :label="c.classname"
              :value="c.id">
            </el-option>
          </el-select>
        </div>
      </div>

      <!-- 文章列表 -->
      <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="70"></el-table-column>
      <el-table-column label="封面" width="90">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.picurl"
            :src="fullUrl(scope.row.picurl)"
            fit="cover"
            style="width: 60px; height: 40px; border-radius: 4px">
          </el-image>
          <span v-else class="muted">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="author" label="作者" width="110"></el-table-column>
      <el-table-column label="分类" width="110">
        <template slot-scope="scope">{{ classMap[scope.row.classid] || '-' }}</template>
      </el-table-column>
      <el-table-column prop="hits" label="浏览" width="80"></el-table-column>
      <el-table-column label="发布时间" width="160">
        <template slot-scope="scope">{{ formatTime(scope.row.posttime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

      <!-- 分页 -->
      <div class="pager">
        <el-button @click="prevPage" :disabled="page === 1">上一页</el-button>
        <span>第 {{ page }} 页</span>
        <el-button @click="nextPage" :disabled="tableData.length < PAGE_SIZE">下一页</el-button>
      </div>
    </el-card>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      :title="dialogMode === 'create' ? '新增文章' : '编辑文章'"
      :visible.sync="dialogVisible"
      width="640px"
      @close="onDialogClose">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="100" show-word-limit placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" placeholder="不填默认为“匿名”"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="classid">
          <el-select v-model="form.classid" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="c in classList"
              :key="c.id"
              :label="c.classname"
              :value="c.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面图">
          <el-upload
            action="#"
            list-type="picture-card"
            :limit="1"
            :auto-upload="false"
            :on-change="onCoverChange"
            :on-remove="onCoverRemove"
            :file-list="coverList">
            <i class="el-icon-plus"></i>
          </el-upload>
          <div class="tip">不上传则保留原封面，支持 jpg/png，最大 10MB</div>
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            :rows="8"
            placeholder="支持 HTML 内容，将原样展示在详情页"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { newsNavlist, newsList, newsDetail, newsPublish, newsUpdate, newsDelete, BaseUrl } from '@/api'

export default {
  name: 'ArticleManage',
  data() {
    return {
      PAGE_SIZE: 10,
      classList: [],
      filterCid: '',
      page: 1,
      tableData: [],
      dialogVisible: false,
      dialogMode: 'create', // create | edit
      submitting: false,
      coverFile: null,
      coverList: [],
      form: { id: '', title: '', author: '', classid: '', content: '', picurl: '' },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        classid: [{ required: true, message: '请选择分类', trigger: 'change' }],
        content: [{ required: true, message: '请输入正文', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // classid -> classname 映射，用于表格展示分类名
    classMap() {
      const m = {}
      this.classList.forEach(c => { m[c.id] = c.classname })
      return m
    }
  },
  created() {
    this.loadClass()
    this.load()
  },
  methods: {
    // 拼接封面图完整地址（后端返回相对路径）
    fullUrl(u) {
      if (!u) return ''
      return /^https?:/.test(u) ? u : BaseUrl + u
    },
    formatTime(t) {
      return t ? dayjs(t).format('YYYY-MM-DD HH:mm') : ''
    },
    loadClass() {
      newsNavlist().then(res => {
        this.classList = res.data || []
      }).catch(() => this.$message.error('获取分类失败'))
    },
    load() {
      newsList({ cid: this.filterCid || '', page: this.page }).then(res => {
        this.tableData = res.data || []
      }).catch(() => this.$message.error('加载文章失败'))
    },
    search() {
      this.page = 1
      this.load()
    },
    prevPage() {
      if (this.page > 1) {
        this.page--
        this.load()
      }
    },
    nextPage() {
      // 满一页说明可能还有下一页
      if (this.tableData.length === this.PAGE_SIZE) {
        this.page++
        this.load()
      }
    },
    openEdit(row) {
      this.dialogMode = 'edit'
      this.coverFile = null
      // 列表不含正文，需拉取详情拿到 content
      newsDetail(row.id).then(res => {
        const d = res.data || {}
        this.form = {
          id: d.id,
          title: d.title || '',
          author: d.author || '',
          classid: d.classid || '',
          content: d.content || '',
          picurl: d.picurl || ''
        }
        this.coverList = d.picurl ? [{ name: '封面', url: this.fullUrl(d.picurl) }] : []
        this.dialogVisible = true
      }).catch(() => this.$message.error('获取文章详情失败'))
    },
    onCoverChange(file) {
      this.coverFile = file.raw
    },
    onCoverRemove() {
      this.coverFile = null
      this.form.picurl = '' // 移除则清空原封面
    },
    onDialogClose() {
      if (this.$refs.form) this.$refs.form.clearValidate()
      this.coverFile = null
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitting = true

        const fd = new FormData()
        fd.append('title', this.form.title)
        fd.append('author', this.form.author)
        fd.append('classid', this.form.classid)
        fd.append('content', this.form.content)
        fd.append('picurl', this.form.picurl || '') // 回传原封面，未换图时保留
        if (this.coverFile) fd.append('image', this.coverFile)

        let req
        if (this.dialogMode === 'create') {
          req = newsPublish(fd)
        } else {
          fd.append('id', this.form.id)
          req = newsUpdate(fd)
        }

        req.then(res => {
          if (res.data && res.data.code === 0) {
            this.$message.success(this.dialogMode === 'create' ? '新增成功' : '更新成功')
            this.dialogVisible = false
            this.load()
          } else {
            this.$message.error((res.data && res.data.message) || '操作失败')
          }
        }).catch(() => this.$message.error('操作失败')).finally(() => {
          this.submitting = false
        })
      })
    },
    remove(row) {
      this.$confirm(`确定删除文章「${row.title}」吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(() => {
        newsDelete({ id: row.id }).then(res => {
          if (res.data && res.data.code === 0) {
            this.$message.success('删除成功')
            // 删光当前页且非首页时回退一页
            if (this.tableData.length === 1 && this.page > 1) this.page--
            this.load()
          } else {
            this.$message.error((res.data && res.data.message) || '删除失败')
          }
        }).catch(() => this.$message.error('删除失败'))
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.article-manage {
  width: 90%;
  max-width: 1100px;
  margin: 20px auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.muted {
  color: #bbb;
}
.pager {
  margin: 24px 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}
.tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}
</style>
