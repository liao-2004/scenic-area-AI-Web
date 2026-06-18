// 统一接口封装：所有 axios 请求集中在此，组件中只调用这里导出的方法。
// 默认走主服务 http(BaseUrl 3000)，需要 4000 端口时改用 http1(BaseUrl1)。
import { http, http1, BaseUrl, BaseUrl1 } from '../utils/request.js'

export { http, http1, BaseUrl, BaseUrl1 }

// ===== 用户管理 =====
// 分页/条件查询用户列表
export const userSelect = params => http.get('/api/select', { params })
// 更新用户
export const userUpdate = data => http.post('/api/user_update', data)
// 删除用户
export const userDelete = data => http.post('/api/user_delete', data)
// 今日入园旅客（用于导出 CSV）
export const selectDate = () => http.get('/api/select_date')

// ===== 数据 / 图表 =====
// 图表初始数据
export const imgStart = () => http.get('/api/start')
// 云服务器测试接口
export const cloudYyy = () => http.get('/api/yyy')

// ===== MQTT / 定位 =====
// 拉取所有用户最新坐标
export const mqttLoad = () => http.get('/mqtt/mqtt_load')
// 拉取指定用户(no)的坐标轨迹
export const mqttData = no => http.get('/mqtt/mqtt_data', { params: { no } })
// 发送 SOS 求救
export const mqttPubSos = () => http.get('/mqtt_pub/sos')

// ===== 新闻 =====
// 导航分类列表
export const newsNavlist = () => http.get('/api/news/navlist')
// 发布新闻（FormData）
export const newsPublish = data => http.post('/api/news/publish', data)

// ===== AI =====
// 视觉对话（FormData：text + 可选 image）
export const aiChat = formData => http.post('/ai/chat', formData)
