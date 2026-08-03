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
  id: number
  bankName: string
  submitterName: string
  status: string
  question: {
    content: string
    options?: string[]
    answer?: string
    analysis?: string
  }
  createdAt: string
}

export function getReviewList(params?: ReviewListParams) {
  return request.get<ApiResponse<PageResult<ReviewResponse>>>('/reviews', { params })
}

export function getReviewDetail(id: number) {
  return request.get<ApiResponse<ReviewResponse>>(`/reviews/${id}`)
}

export function approveReview(id: number, data?: ReviewActionRequest) {
  return request.post<ApiResponse<null>>(`/reviews/${id}/approve`, data)
}

export function rejectReview(id: number, data?: ReviewActionRequest) {
  return request.post<ApiResponse<null>>(`/reviews/${id}/reject`, data)
}