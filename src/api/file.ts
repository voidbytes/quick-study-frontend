import request from './request'
import type { ApiResponse } from '@/types'

export function upload(file: File, directory?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  return request.post<ApiResponse<{ url: string; filename: string; size: number }>>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** 头像上传：返回相对路径（如 /uploads/avatar/xxx.jpg），展示时原样使用（与 /files/upload 同口径，dev 走 /uploads 代理） */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<ApiResponse<{ url: string }>>('/files/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}