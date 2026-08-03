import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/utils/constants'

const request: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新 token
let isRefreshing = false
// 等待刷新 token 的请求队列
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  async error => {
    const { response, config } = error
    if (!response) {
      return Promise.reject(error)
    }

    // 401 未授权 - 尝试刷新 token
    if (response.status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise(resolve => {
          addRefreshSubscriber((token: string) => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(request(config))
          })
        })
      }

      config._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem('quick-study-user-info')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post('/api/v1/auth/refresh', { refreshToken })
        const { token: newToken, refreshToken: newRefreshToken } = res.data.data
        localStorage.setItem(TOKEN_KEY, newToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
        isRefreshing = false
        onRefreshed(newToken)
        config.headers.Authorization = `Bearer ${newToken}`
        return request(config)
      } catch {
        isRefreshing = false
        refreshSubscribers = []
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem('quick-study-user-info')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    // 403 权限不足
    if (response.status === 403) {
      window.$message?.error('权限不足，无法执行此操作')
      return Promise.reject(error)
    }

    // 500 服务器错误
    if (response.status >= 500) {
      window.$message?.error('服务器错误，请稍后重试')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default request