import request from './request'
import type { ApiResponse, Tag } from '@/types'

export interface CreateTagParams {
  name: string
  /** 可选分组名；不传视为未分组 */
  groupName?: string
  color?: string
}

export function getTagList() {
  return request.get<ApiResponse<Tag[]>>('/tags')
}

export function list() {
  return request.get<ApiResponse<Tag[]>>('/tags')
}

export function create(data: CreateTagParams) {
  return request.post<ApiResponse<Tag>>('/tags', null, { params: data })
}

/** 设置/清除标签分组（仅管理员）；groupName 传空清除分组 */
export function updateTagGroup(id: number, groupName?: string) {
  return request.put<ApiResponse<null>>(`/tags/${id}/group`, null, {
    params: { groupName: groupName || undefined }
  })
}

export function deleteTag(id: number) {
  return request.delete<ApiResponse<null>>(`/tags/${id}`)
}
