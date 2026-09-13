import request from './request'
import type { ApiResponse, PageResult, WrongQuestion } from '@/types'

export interface WrongQuestionListParams {
  page?: number
  size?: number
  keyword?: string
  bankId?: string
  /** 标签 id（单库场景） */
  tagId?: number
  /** 标签名（跨库场景推荐，大小写不敏感；与 tagId 取并集） */
  tagNames?: string[]
  sortBy?: string
}

export function list(params?: WrongQuestionListParams) {
  return request.get<ApiResponse<PageResult<WrongQuestion>>>('/wrong-questions', { params })
}

export function deleteWrongQuestion(id: string) {
  return request.delete<ApiResponse<null>>(`/wrong-questions/${id}`)
}

export function getWrongQuestionById(id: string) {
  return request.get<ApiResponse<WrongQuestion>>(`/wrong-questions/${id}`)
}