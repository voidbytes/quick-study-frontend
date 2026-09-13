import request from './request'
import type { ApiResponse, PageResult, User } from '@/types'

export interface AdminListUsersParams {
  page?: number
  size?: number
  keyword?: string
  role?: string
  status?: string
}

export function getUserList(params?: AdminListUsersParams) {
  return request.get<ApiResponse<PageResult<User>>>('/admin/users', { params })
}

export function updateUserStatus(id: string, status: string) {
  return request.put<ApiResponse<null>>(`/admin/users/${id}/status`, { status })
}

export function listUsers(params?: AdminListUsersParams) {
  return request.get<ApiResponse<PageResult<User>>>('/admin/users', { params })
}

export function getUserDetail(id: string) {
  return request.get<ApiResponse<User>>(`/admin/users/${id}`)
}

export function updateStatus(id: string, status: string) {
  return request.put<ApiResponse<null>>(`/admin/users/${id}/status`, { status })
}

export function deleteUser(id: string) {
  return request.delete<ApiResponse<null>>(`/admin/users/${id}`)
}

export function resetPassword(id: string) {
  return request.put<ApiResponse<{ newPassword: string }>>(`/admin/users/${id}/password`)
}

export function createAdmin(userId: string) {
  return request.post<ApiResponse<null>>('/admin/admins', { userId })
}

export function removeAdmin(id: string) {
  return request.delete<ApiResponse<null>>(`/admin/admins/${id}`)
}