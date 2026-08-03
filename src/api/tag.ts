import request from './request'
import type { ApiResponse, Tag } from '@/types'

export interface CreateTagParams {
  name: string
  color?: string
}

export function getTagList() {
  return request.get<ApiResponse<Tag[]>>('/tags')
}

export function list() {
  return request.get<ApiResponse<Tag[]>>('/tags')
}

export function create(data: CreateTagParams) {
  return request.post<ApiResponse<Tag>>('/tags', data)
}

export function deleteTag(id: number) {
  return request.delete<ApiResponse<null>>(`/tags/${id}`)
}