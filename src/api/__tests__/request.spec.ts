import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  responseHandlers: {} as { onFulfilled?: any; onRejected?: any },
  instanceCalls: [] as any[],
  axiosPost: undefined as any
}))

vi.mock('axios', () => {
  const instance: any = (config: any) => {
    h.instanceCalls.push(config)
    return Promise.resolve({ data: { code: 0, data: null } })
  }
  instance.interceptors = {
    request: { use: () => {} },
    response: {
      use: (onFulfilled: any, onRejected: any) => { h.responseHandlers = { onFulfilled, onRejected } }
    }
  }
  const axiosMock: any = vi.fn()
  axiosMock.create = vi.fn(() => instance)
  axiosMock.post = vi.fn((...args: any[]) => h.axiosPost(...args))
  return { default: axiosMock }
})

import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '@/utils/constants'

// happy-dom 环境未实现 localStorage，注入内存版
const memoryStorage = new Map<string, string>()
const localStorageMock = {
  getItem: (key: string) => memoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => { memoryStorage.set(key, String(value)) },
  removeItem: (key: string) => { memoryStorage.delete(key) },
  clear: () => { memoryStorage.clear() }
}
;(globalThis as any).localStorage = localStorageMock
;(window as any).localStorage = localStorageMock

// 此环境 vi.mock 工厂对静态 import 的模块图不生效（request.ts 会拿到真实 axios），
// 必须在 mock 注册后动态导入才能拦截
let request: any

function mockLocation(pathname: string, search = '') {
  ;(window as any).location = { href: '', pathname, search }
}

function make401Error() {
  return {
    response: { status: 401, data: { code: 10201, message: '未认证' } },
    config: { url: '/api/v1/records', method: 'get', headers: {} as any }
  }
}

describe('request 响应拦截器：401 刷新与登出', () => {
  beforeAll(async () => {
    request = await import('../request')
  })

  beforeEach(() => {
    memoryStorage.clear()
    h.instanceCalls.length = 0
    mockLocation('/records')
    h.axiosPost = vi.fn()
  })

  it('refresh 返回 HTTP 200 + 业务错误码时清空凭证并跳转登录页', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-at')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'expired-rt')
    localStorage.setItem(USER_INFO_KEY, '{"id":1}')
    // 后端业务失败统一返回 HTTP 200，此为线上事故根因：旧代码不校验业务码导致
    // undefined 写入 localStorage 并陷入 401 死循环
    h.axiosPost.mockResolvedValue({ data: { code: 10105, message: '刷新令牌无效', data: null } })

    const promise = h.responseHandlers.onRejected!(make401Error())
    await expect(promise).rejects.toBeTruthy()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(USER_INFO_KEY)).toBeNull()
    expect((window as any).location.href).toContain('/login?redirect=')
  })

  it('refresh 成功时用 accessToken 字段续期并重放原请求', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-at')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-rt')
    h.axiosPost.mockResolvedValue({
      data: { code: 0, message: 'success', data: { accessToken: 'new-at', refreshToken: 'new-rt' } }
    })

    const error = make401Error()
    await h.responseHandlers.onRejected!(error)

    expect(localStorage.getItem(TOKEN_KEY)).toBe('new-at')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-rt')
    expect(h.axiosPost).toHaveBeenCalledWith('/api/v1/auth/refresh', { refreshToken: 'valid-rt' })
    // 重放原请求且携带新 token
    expect(h.instanceCalls).toHaveLength(1)
    expect(error.config.headers.Authorization).toBe('Bearer new-at')
    expect((window as any).location.href).toBe('')
  })

  it('401 且无 refreshToken 时直接清空凭证跳转登录页', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-at')
    localStorage.setItem(USER_INFO_KEY, '{"id":1}')

    const promise = h.responseHandlers.onRejected!(make401Error())
    await expect(promise).rejects.toBeTruthy()

    expect(h.axiosPost).not.toHaveBeenCalled()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(USER_INFO_KEY)).toBeNull()
    expect((window as any).location.href).toContain('/login?redirect=')
  })

  it('刷新期间并发的第二个 401 请求等待新 token 后重放', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-at')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'valid-rt')
    let resolveRefresh: (v: any) => void = () => {}
    h.axiosPost.mockReturnValue(new Promise(resolve => { resolveRefresh = resolve }))

    const first = h.responseHandlers.onRejected!(make401Error())
    // 第二个请求到达时 isRefreshing=true，应挂入等待队列
    const second = h.responseHandlers.onRejected!(make401Error())

    resolveRefresh({ data: { code: 0, data: { accessToken: 'new-at', refreshToken: 'new-rt' } } })
    await first
    await second

    expect(localStorage.getItem(TOKEN_KEY)).toBe('new-at')
    // 两个请求都重放且携带新 token
    expect(h.instanceCalls).toHaveLength(2)
  })

  it('业务错误响应（HTTP 200 + code!=0）转为 reject 且不触发刷新', async () => {
    const promise = h.responseHandlers.onFulfilled!({
      data: { code: 20601, message: '已存在同名题库' },
      config: { method: 'post', url: '/api/v1/banks/import' }
    })
    await expect(promise).rejects.toThrow('已存在同名题库')
    expect(h.axiosPost).not.toHaveBeenCalled()
  })
})
