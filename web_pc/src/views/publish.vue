<template>
  <div class="publish">
    <el-card class="publish-card">
      <div slot="header" class="card-header">
        <span>发布文章</span>
        <el-button size="small" type="text" @click="resetForm">重置</el-button>
      </div>

      <el-form :model="form" :rules="rules" ref="form" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="不填默认为“匿名”"></el-input>
        </el-form-item>

        <el-form-item label="分类" prop="classid">
          <el-select v-model="form.classid" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in classList"
              :key="item.id"
              :label="item.classname"
              :value="item.id">
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
          <div class="tip">不上传则无封面，支持 jpg/png，最大 10MB</div>
        </el-form-item>

        <el-form-item label="正文" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            :rows="10"
            placeholder="支持 HTML 内容，将原样展示在新闻详情页"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">发布</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { newsNavlist, newsPublish } from '@/api'

export default {
  name: 'PublishView',
  data() {
    return {
      classList: [],
      coverFile: null,
      coverList: [],
      submitting: false,
      form: {
        title: '',
        author: '',
        classid: '',
        content: ''
      },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        classid: [{ required: true, message: '请选择分类', trigger: 'change' }],
        content: [{ required: true, message: '请输入正文', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.loadClassList()
  },
  methods: {
    // 拉取分类（与 uni-app 首页导航同一接口）
    loadClassList() {
      newsNavlist().then(res => {
        this.classList = res.data || []
      }).catch(err => {
        console.error('获取分类失败', err)
        this.$message.error('获取分类失败')
      })
    },
    onCoverChange(file) {
      this.coverFile = file.raw
    },
    onCoverRemove() {
      this.coverFile = null
    },
    resetForm() {
      this.$refs.form.resetFields()
      this.coverFile = null
      this.coverList = []
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
        if (this.coverFile) fd.append('image', this.coverFile)

        newsPublish(fd).then(res => {
          if (res.data && res.data.code === 0) {
            this.$message.success('发布成功')
            this.resetForm()
          } else {
            this.$message.error((res.data && res.data.message) || '发布失败')
          }
        }).catch(err => {
          console.error('发布失败', err)
          this.$message.error('发布失败，请稍后重试')
        }).finally(() => {
          this.submitting = false
        })
      })
    }
  }
}
</script>

<style scoped>
.publish {
  width: 90%;
  max-width: 900px;
  margin: 20px auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}
</style>
