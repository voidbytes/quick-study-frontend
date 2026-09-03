import request from './request'
import type { ApiResponse, User } from '@/types'

export interface LoginParams {
  username: string
  password: string
  captchaId?: string
  captchaCode?: string
}

export interface LoginResult {
  userId: number
  username: string
  nickname: string
  role: string
  accessToken: string
  refreshToken: string
}

export interface RegisterParams {
  username: string
  password: string
  confirmPassword: string
  nickname: string
  email?: string
  captchaId?: string
  captchaCode?: string
}

export interface CaptchaResult {
  captchaId: string
  captchaImage: string
}

export function login(data: LoginParams) {
  return request.post<ApiResponse<LoginResult>>('/auth/login', data)
}

export function register(data: RegisterParams) {
  return request.post<ApiResponse<LoginResult>>('/auth/register', data)
}

export function refreshToken(refreshToken: string) {
  return request.post<ApiResponse<LoginResult>>('/auth/refresh', { refreshToken })
}

export function logout() {
  return request.post<ApiResponse<null>>('/auth/logout')
}

export function getCaptcha() {
  return request.get<ApiResponse<CaptchaResult>>('/auth/captcha')
}

export function checkUsername(username: string) {
  return request.get<ApiResponse<{ exists: boolean }>>('/auth/check-username', { params: { username } })
}