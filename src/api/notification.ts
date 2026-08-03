import request from './request'
import type { ApiResponse, PageResult, Notification } from '@/types'

export interface NotificationListParams {
  page?: number
  pageSize?: number
  isRead?: boolean
}

export function getNotifications(params?: NotificationListParams) {
  return request.get<ApiResponse<PageResult<Notification>>>('/notifications', { params })
}

export function markReadAll() {
  return request.put<ApiResponse<null>>('/notifications/read-all')
}

export function list(params?: NotificationListParams) {
  return request.get<ApiResponse<PageResult<Notification>>>('/notifications', { params })
}

export function getUnreadCount() {
  return request.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
}

export function markRead(id: number) {
  return request.put<ApiResponse<null>>(`/notifications/${id}/read`)
}

export function markAllRead() {
  return request.put<ApiResponse<null>>('/notifications/read-all')
}

export function deleteNotification(id: number) {
  return request.delete<ApiResponse<null>>(`/notifications/${id}`)
}