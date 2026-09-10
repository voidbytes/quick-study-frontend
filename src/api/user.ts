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

/** 用户搜索结果项（批改人选择等远程搜索场景，最小字段集） */
export interface UserSearchItem {
  id: string
  username: string
  nickname?: string | null
}

/** 按 username / nickname 模糊搜索用户（用于批改人下拉远程搜索） */
export function searchUsers(keyword: string, limit = 20) {
  return request.get<ApiResponse<UserSearchItem[]>>('/user/search', {
    params: { keyword, limit }
  })
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