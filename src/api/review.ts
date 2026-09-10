import request from './request'
import type { ApiResponse, PageResult } from '@/types'

export interface ReviewListParams {
  page?: number
  size?: number
  status?: string
}

export interface ReviewActionRequest {
  comment?: string
}

export interface ReviewResponse {
  id: string
  bankName: string
  submitterName: string
  status: string
  question: {
    content: string
    /** OptionItem JSON 字符串（option_id 模型） */
    options?: string | null
    /** 选择题=id JSON 数组；填空/简答=文本 */
    answer?: string | null
    analysis?: string
  }
  createdAt: string
}

export function getReviewList(params?: ReviewListParams) {
  return request.get<ApiResponse<PageResult<ReviewResponse>>>('/reviews', { params })
}

export function getReviewDetail(id: string) {
  return request.get<ApiResponse<ReviewResponse>>(`/reviews/${id}`)
}

export function approveReview(id: string, data?: ReviewActionRequest) {
  return request.post<ApiResponse<null>>(`/reviews/${id}/approve`, data)
}

export function rejectReview(id: string, data?: ReviewActionRequest) {
  return request.post<ApiResponse<null>>(`/reviews/${id}/reject`, data)
}