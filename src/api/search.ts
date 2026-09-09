import request from './request'
import type { ApiResponse, PageResult, Question, QuestionBank, ExamPaper } from '@/types'

export interface SearchParams {
  keyword: string
  type?: 'question' | 'bank' | 'paper' | 'note' | 'practice_session' | 'exam_session' | 'wrong_question' | 'answer_record'
  page?: number
  size?: number
}

export interface SearchResultItem {
  type: string
  id: number
  title: string
  description: string
  matchField: string
  /** QUESTION 命中：所属题库 ID（构造题目详情跳转用）；其他类型 null */
  bankId?: number | null
}

export function search(params: SearchParams) {
  return request.get<ApiResponse<PageResult<SearchResultItem>>>('/search', { params })
}