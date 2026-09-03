import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '@/utils/constants'
import { createLogger } from '@/utils/logger'
import * as authApi from '@/api/auth'

const log = createLogger('auth')

export interface LoginParams {
  username: string
  password: string
  captchaId?: string
  captchaCode?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY))
  const userInfo = ref<User | null>(loadUserInfo())

  function loadUserInfo(): User | null {
    try {
      const stored = localStorage.getItem(USER_INFO_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  function saveUserInfo(user: User | null) {
    userInfo.value = user
    if (user) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'ADMIN' || userInfo.value?.role === 'SUPER_ADMIN')
  const isSuperAdmin = computed(() => userInfo.value?.role === 'SUPER_ADMIN')
  const role = computed(() => userInfo.value?.role ?? null)

  async function login(data: LoginParams) {
    const res = await authApi.login(data)
    const { accessToken, refreshToken: newRefreshToken, userId, username, nickname } = res.data
    const role = res.data.role as User['role']
    const newUserInfo: User = { id: userId, username, nickname, role }
    token.value = accessToken
    refreshToken.value = newRefreshToken
    saveUserInfo(newUserInfo)
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
    log.info(`登录成功 user=${username} id=${userId} role=${role}`)
  }

  async function register(data: authApi.RegisterParams) {
    const res = await authApi.register(data)
    const { accessToken, refreshToken: newRefreshToken, userId, username, nickname } = res.data
    const role = res.data.role as User['role']
    const newUserInfo: User = { id: userId, username, nickname, role }
    token.value = accessToken
    refreshToken.value = newRefreshToken
    saveUserInfo(newUserInfo)
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
    log.info(`注册成功 user=${username} id=${userId}`)
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (e) {
      log.warn('退出登录接口调用失败（继续清理本地态）', e)
    }
    token.value = null
    refreshToken.value = null
    saveUserInfo(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    log.info('已登出，清理本地凭证')
  }

  async function doRefreshToken() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    const res = await authApi.refreshToken(refreshToken.value)
    const { accessToken: newToken, refreshToken: newRefreshToken } = res.data
    token.value = newToken
    refreshToken.value = newRefreshToken
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
    log.debug('手动刷新 token 成功')
  }

  return {
    token,
    refreshToken,
    userInfo,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    role,
    login,
    register,
    logout,
    doRefreshToken
  }
})