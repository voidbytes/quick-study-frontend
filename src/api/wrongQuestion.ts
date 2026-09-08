import request from './request'
import type { ApiResponse, PageResult, WrongQuestion } from '@/types'

export interface WrongQuestionListParams {
  page?: number
  size?: number
  keyword?: string
  bankId?: number
  tagId?: number
  sortBy?: string
}

export function list(params?: WrongQuestionListParams) {
  return request.get<ApiResponse<PageResult<WrongQuestion>>>('/wrong-questions', { params })
}

export function deleteWrongQuestion(id: number) {
  return request.delete<ApiResponse<null>>(`/wrong-questions/${id}`)
}

export function getWrongQuestionById(id: string) {
  return request.get<ApiResponse<WrongQuestion>>(`/wrong-questions/${id}`)
}