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