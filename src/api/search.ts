import request from './request'
import type { ApiResponse, PageResult, Question, QuestionBank, ExamPaper } from '@/types'

export interface SearchParams {
  keyword: string
  type?: 'question' | 'bank' | 'paper'
  page?: number
  size?: number
}

export interface SearchResultItem {
  type: string
  id: number
  title: string
  description: string
  matchField: string
}

export function search(params: SearchParams) {
  return request.get<ApiResponse<PageResult<SearchResultItem>>>('/search', { params })
}