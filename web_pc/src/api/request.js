import axios from 'axios'

// 后端基础地址
export const BaseUrl = ''   // 主服务（Node 后端）
export const BaseUrl1 = ''  // 备用服务（如独立 socket/AI 服务）

// 主服务实例（默认所有接口都走这里）
export const http = axios.create({
  baseURL: BaseUrl
})

// 备用服务实例（预留，调用 4000 端口接口时使用）
export const http1 = axios.create({
  baseURL: BaseUrl1
})

export default http
