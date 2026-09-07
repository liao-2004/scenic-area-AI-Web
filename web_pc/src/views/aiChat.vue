<template>
  <div class="ai-chat">
    <div class="chat-card">
      <!-- 头部 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="header-info">
            <div class="header-title">豆包 · 景区智能助手</div>
            <div class="header-status">
              <span class="dot" :class="{ busy: loading }"></span>
              {{ loading ? '正在思考…' : '在线' }}
            </div>
          </div>
        </div>
        <el-button
          size="small"
          icon="el-icon-delete"
          :disabled="messages.length === 0 || loading"
          @click="clearChat">清空对话</el-button>
      </div>

      <!-- 消息区 -->
      <div class="chat-body" ref="chatBody">
        <!-- 欢迎页 -->
        <div v-if="messages.length === 0" class="welcome">
          <div class="welcome-logo"><img src="/客服.png" :style="{height:'40px'}"></div>
          <h2 class="welcome-title">你好</h2>
          <p class="welcome-sub">向我提问，或上传一张图片让我帮你识别、描述与分析。</p>
          <div class="suggest-grid">
            <div
              v-for="(s, i) in suggestions"
              :key="i"
              class="suggest-card"
              @click="useSuggestion(s.text)">
              <i :class="s.icon"></i>
              <div class="suggest-text">
                <div class="suggest-title">{{ s.title }}</div>
                <div class="suggest-desc">{{ s.text }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 对话气泡 -->
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['msg-row', msg.role]">
          <div class="msg-avatar" v-if="msg.role === 'assistant'">
            <i class="el-icon-cpu"></i>
          </div>
          <div class="msg-main">
            <div class="bubble">
              <img v-if="msg.image" :src="msg.image" class="bubble-img" />
              <div v-if="msg.text" class="bubble-text">{{ msg.text }}</div>
            </div>
            <div class="msg-meta">
              <span class="msg-time">{{ msg.time }}</span>
              <span
                v-if="msg.role === 'assistant' && msg.text"
                class="msg-copy"
                @click="copyText(msg.text)">
                <i class="el-icon-document-copy"></i> 复制
              </span>
            </div>
          </div>
          <div class="msg-avatar user-avatar" v-if="msg.role === 'user'">
            <i class="el-icon-user"></i>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="msg-row assistant">
          <div class="msg-avatar"><i class="el-icon-cpu"></i></div>
          <div class="msg-main">
            <div class="bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input">
        <div v-if="imagePreview" class="img-preview">
          <img :src="imagePreview" />
          <i class="el-icon-close remove-img" @click="removeImage"></i>
        </div>
        <div class="input-row">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="onImageChange">
            <el-tooltip content="上传图片" placement="top">
              <el-button icon="el-icon-picture-outline" circle></el-button>
            </el-tooltip>
          </el-upload>
          <el-input
            v-model="input"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            resize="none"
            placeholder="输入你的问题，Enter 发送 / Shift+Enter 换行"
            @keydown.native.enter="onEnter"
            class="text-area" />
          <el-button
            type="primary"
            icon="el-icon-position"
            :loading="loading"
            @click="send">发送</el-button>
        </div>
        <div class="input-tip">AI 生成内容仅供参考，请谨慎甄别。</div>
      </div>
    </div>
  </div>
</template>

<script>
import { aiChat } from '@/api'

export default {
  name: 'AiChat',
  data() {
    return {
      input: '',
      imageFile: null,
      imagePreview: '',
      messages: [],
      loading: false,
      suggestions: [
        { icon: 'el-icon-chat-dot-round', title: '自我介绍', text: '你是谁？能做什么？' },
        { icon: 'el-icon-picture-outline', title: '看图说话', text: '上传一张图片，描述里面的内容' },
        { icon: 'el-icon-edit-outline', title: '晚上吃什么', text: '木鱼湖公园晚上有什么好吃的' },
        { icon: 'el-icon-cpu', title: '附近玩什么', text: '木鱼湖公园周边娱乐' }
      ]
    }
  },
  methods: {
    nowTime() {
      const d = new Date()
      const p = n => (n < 10 ? '0' + n : '' + n)
      return `${p(d.getHours())}:${p(d.getMinutes())}`
    },
    useSuggestion(text) {
      this.input = text
      this.send()
    },
    onImageChange(file) {
      const isImage = file.raw && file.raw.type.startsWith('image/')
      if (!isImage) {
        this.$message.warning('请选择图片文件')
        return
      }
      this.imageFile = file.raw
      this.imagePreview = URL.createObjectURL(file.raw)
    },
    removeImage() {
      this.imageFile = null
      this.imagePreview = ''
    },
    onEnter(e) {
      if (e.shiftKey) return
      e.preventDefault()
      this.send()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatBody
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    copyText(text) {
      const done = () => this.$message.success('已复制')
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done).catch(() => this.fallbackCopy(text, done))
      } else {
        this.fallbackCopy(text, done)
      }
    },
    fallbackCopy(text, done) {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      done()
    },
    clearChat() {
      this.$confirm('确定清空当前对话吗？', '提示', {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = []
      }).catch(() => {})
    },
    async send() {
      const text = this.input.trim()
      if (!text && !this.imageFile) {
        this.$message.warning('请输入内容或选择图片')
        return
      }
      if (this.loading) return

      this.messages.push({
        role: 'user',
        text,
        image: this.imagePreview || '',
        time: this.nowTime()
      })

      const formData = new FormData()
      formData.append('text', text || '你是谁')
      if (this.imageFile) formData.append('image', this.imageFile)

      this.input = ''
      this.imageFile = null
      this.imagePreview = ''
      this.loading = true
      this.scrollToBottom()

      try {
        const { data } = await aiChat(formData)
        if (data.code === 0) {
          this.messages.push({ role: 'assistant', text: data.data.answer, time: this.nowTime() })
        } else {
          this.messages.push({ role: 'assistant', text: `出错了：${data.message}`, time: this.nowTime() })
        }
      } catch (err) {
        this.messages.push({ role: 'assistant', text: `请求失败：${err.message}`, time: this.nowTime() })
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    }
  }
}
</script>

<style scoped>
.ai-chat {
  display: flex;
  justify-content: center;
  padding: 20px 16px;
  box-sizing: border-box;
}
.chat-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  height: calc(100vh - 100px);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(31, 42, 72, 0.12);
  overflow: hidden;
}

/* 头部 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #eef0f4;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ai-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6ea8fe, #3a3f6b);
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
}
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2a48;
}
.header-status {
  font-size: 12px;
  color: #8a93a6;
  display: flex;
  align-items: center;
  gap: 5px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #52c41a;
}
.dot.busy {
  background: #faad14;
}

/* 消息区 */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  background: #f7f8fb;
}

/* 欢迎页 */
.welcome {
  text-align: center;
  padding: 30px 10px;
}
.welcome-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #6ea8fe, #3a3f6b);
  color: #fff;
  font-size: 30px;
}
.welcome-title {
  margin: 0 0 8px;
  color: #1f2a48;
}
.welcome-sub {
  color: #8a93a6;
  margin: 0 0 26px;
}
.suggest-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-width: 640px;
  margin: 0 auto;
}
.suggest-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.suggest-card:hover {
  border-color: #6ea8fe;
  box-shadow: 0 4px 14px rgba(110, 168, 254, 0.2);
  transform: translateY(-2px);
}
.suggest-card i {
  font-size: 22px;
  color: #6ea8fe;
}
.suggest-title {
  font-weight: 600;
  color: #1f2a48;
  font-size: 14px;
}
.suggest-desc {
  font-size: 12px;
  color: #8a93a6;
  margin-top: 2px;
}

/* 气泡 */
.msg-row {
  display: flex;
  margin-bottom: 18px;
  align-items: flex-start;
  gap: 10px;
}
.msg-row.user {
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6ea8fe, #3a3f6b);
  color: #fff;
  font-size: 18px;
  flex-shrink: 0;
}
.user-avatar {
  background: linear-gradient(135deg, #52c41a, #1f8a3b);
}
.msg-main {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}
.msg-row.user .msg-main {
  align-items: flex-end;
}
.bubble {
  padding: 11px 15px;
  border-radius: 12px;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 14px;
}
.msg-row.user .bubble {
  background: linear-gradient(135deg, #6ea8fe, #4f7fe0);
  color: #fff;
  border-top-right-radius: 4px;
}
.msg-row.assistant .bubble {
  background: #fff;
  color: #2c3242;
  border: 1px solid #eef0f4;
  border-top-left-radius: 4px;
}
.bubble-img {
  max-width: 220px;
  border-radius: 8px;
  display: block;
  margin-bottom: 6px;
}
.msg-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 5px;
  padding: 0 4px;
}
.msg-time {
  font-size: 11px;
  color: #b4bac6;
}
.msg-copy {
  font-size: 11px;
  color: #8a93a6;
  cursor: pointer;
}
.msg-copy:hover {
  color: #6ea8fe;
}

/* 打字动画 */
.typing {
  display: flex;
  gap: 5px;
  align-items: center;
}
.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c2c8d4;
  animation: blink 1.2s infinite both;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* 输入区 */
.chat-input {
  border-top: 1px solid #eef0f4;
  padding: 12px 18px 10px;
  background: #fff;
}
.img-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 10px;
}
.img-preview img {
  max-height: 84px;
  border-radius: 8px;
  border: 1px solid #eef0f4;
}
.remove-img {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  color: #f56c6c;
  font-size: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.text-area {
  flex: 1;
}
.input-tip {
  text-align: center;
  font-size: 11px;
  color: #b4bac6;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .suggest-grid { grid-template-columns: 1fr; }
  .msg-main { max-width: 82%; }
}
</style>
