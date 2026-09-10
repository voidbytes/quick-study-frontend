import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY, API_BASE_URL } from '@/utils/constants'
import { createLogger } from '@/utils/logger'

const log = createLogger('http')

/**
 * 响应拦截器将 AxiosResponse 解包为 response.data（即 ApiResponse<T>），
 * 但 AxiosInstance 泛型签名仍返回 Promise<AxiosResponse<T>>，导致类型与运行时不一致。
 * 此处用 Omit 抹去原方法签名后以正确返回类型重载，as 断言绕过编译期兼容性检查。
 */
type RequestInstance = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'> & {
  <T = any>(config: AxiosRequestConfig): Promise<T>
  <T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
}

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}) as unknown as RequestInstance

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
    const method = (config.method || 'get').toUpperCase()
    log.debug(`${method} ${config.url ?? ''}`, config.params ? { params: config.params } : undefined)
    return config
  },
  error => {
    log.error('请求配置错误', error)
    return Promise.reject(error)
  }
)

// 401 且无法刷新时跳登录页，携带当前位置以便登录后跳回。
// 用 location.replace：不往 history 压栈，避免登录后浏览器返回键退回过期页面（用户反馈：返回时偶见回到登录页）。
function redirectToLogin() {
  const current = window.location.pathname + window.location.search
  window.location.replace('/login?redirect=' + encodeURIComponent(current))
}

function clearAuthAndRedirect() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  redirectToLogin()
}

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data
    // 检查业务状态码，非0表示业务错误，转为reject以便统一处理
    if (data && data.code !== undefined && data.code !== 0) {
      const method = (response.config.method || 'get').toUpperCase()
      log.warn(`${method} ${response.config.url ?? ''} 业务失败 code=${data.code}`, data.message)
      const error = new Error(data.message || '业务错误')
      ;(error as any).response = response
      return Promise.reject(error)
    }
    return data
  },
  async error => {
    const { response, config } = error
    if (!response) {
      log.warn('网络错误(无响应)', config?.url ?? '', error?.message ?? '')
      return Promise.reject(error)
    }
    const method = (config?.method || 'get').toUpperCase()
    const url = config?.url ?? ''

    // 401 未授权 - 尝试刷新 token
    if (response.status === 401 && !config._retry) {
      log.info(`${method} ${url} 401，尝试刷新 token`)
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
        log.warn('401 且无 refreshToken，跳转登录页')
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
        const body = res.data
        const data = body?.data
        // 后端业务失败也返回 HTTP 200（如 code=10105 刷新令牌无效），
        // 裸 axios 不走拦截器，必须手动校验业务码，否则会把 undefined 写入
        // localStorage 并陷入 401 死循环；成功字段为 accessToken（与登录响应一致）
        if (body?.code !== 0 || !data?.accessToken || !data?.refreshToken) {
          throw new Error(body?.message || '刷新令牌无效')
        }
        localStorage.setItem(TOKEN_KEY, data.accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
        isRefreshing = false
        log.info('token 刷新成功')
        onRefreshed(data.accessToken)
        config.headers.Authorization = `Bearer ${data.accessToken}`
        return request(config)
      } catch (refreshErr) {
        isRefreshing = false
        refreshSubscribers = []
        log.error('token 刷新失败，跳转登录页', refreshErr)
        clearAuthAndRedirect()
        return Promise.reject(error)
      }
    }

    // 403 权限不足
    if (response.status === 403) {
      log.warn(`${method} ${url} 403 权限不足`)
      window.$message?.error('权限不足，无法执行此操作')
      return Promise.reject(error)
    }

    // 500 服务器错误
    if (response.status >= 500) {
      log.error(`${method} ${url} ${response.status} 服务器错误`)
      window.$message?.error('服务器错误，请稍后重试')
      return Promise.reject(error)
    }

    log.warn(`${method} ${url} HTTP ${response.status}`)
    return Promise.reject(error)
  }
)

export default request