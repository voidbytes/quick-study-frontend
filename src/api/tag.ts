import request from './request'
import type { ApiResponse, Tag } from '@/types'

export interface CreateTagParams {
  name: string
  /** 可选分组名；不传视为未分组 */
  groupName?: string
  color?: string
  /** 标签所属题库（标签作用域=单题库）；不传则落历史全局命名空间 */
  bankId?: number | string
}

export function getTagList() {
  return request.get<ApiResponse<Tag[]>>('/tags')
}

/** 题库作用域全量标签（含未被题目引用的标签，标签管理弹窗用） */
export function getTagListByBankScope(bankId: number | string) {
  return request.get<ApiResponse<Tag[]>>('/tags', { params: { bankId } })
}

/** 题库内实际使用的标签（题库详情页筛选下拉专用；后端按 tag_rel 反查 DISTINCT） */
export function getTagListByBank(bankId: number | string) {
  return request.get<ApiResponse<Tag[]>>(`/tags/bank/${bankId}`)
}

export function list() {
  return request.get<ApiResponse<Tag[]>>('/tags')
}

export function create(data: CreateTagParams) {
  return request.post<ApiResponse<Tag>>('/tags', null, { params: data })
}

/** 设置/清除标签分组（仅管理员）；groupName 传空清除分组 */
export function updateTagGroup(id: string, groupName?: string) {
  return request.put<ApiResponse<null>>(`/tags/${id}/group`, null, {
    params: { groupName: groupName || undefined }
  })
}

export function deleteTag(id: string) {
  return request.delete<ApiResponse<null>>(`/tags/${id}`)
}
