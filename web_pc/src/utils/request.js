import axios from 'axios'

export const BaseUrl = 'http://120.27.201.60/'    // 主服务（Node 后端）
export const BaseUrl1 = 'http://120.27.201.60/'   // 备用服务
  
// 主服务实例（默认所有接口都走这里）
export const http = axios.create({
  baseURL: BaseUrl
})

// 备用服务实例（预留，调用 4000 端口接口时使用）
export const http1 = axios.create({
  baseURL: BaseUrl1
})

export default http
