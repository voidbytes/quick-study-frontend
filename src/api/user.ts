import request from './request'
import type { ApiResponse, User } from '@/types'

export interface UpdateProfileParams {
  nickname?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export function deactivateAccount() {
  return request.delete<ApiResponse<null>>('/user/account')
}

export function getProfile() {
  return request.get<ApiResponse<User>>('/user/profile')
}

export function updateProfile(data: UpdateProfileParams) {
  return request.put<ApiResponse<User>>('/user/profile', data)
}

export function changePassword(data: ChangePasswordParams) {
  return request.put<ApiResponse<null>>('/user/password', data)
}

export function deactivate() {
  return request.delete<ApiResponse<null>>('/user/account')
}

export function getAiKey() {
  return request.get<ApiResponse<{ key: string }>>('/user/ai-key')
}

export function setAiKey(data: { key: string }) {
  return request.put<ApiResponse<null>>('/user/ai-key', data)
}

export function deleteAiKey() {
  return request.delete<ApiResponse<null>>('/user/ai-key')
}