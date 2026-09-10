import request from './request'
import type { ApiResponse, PageResult, PracticeSession, PracticeResult, PracticeSessionSummary } from '@/types'

export interface CreateSessionParams {
  count: number
  bankIds?: string[]
  types?: string[]
  tagIds?: string[]
  correctRateMin?: number
  correctRateMax?: number
  priorUnanswered?: boolean
  priorWrong?: boolean
}

export interface PracticeListParams {
  page?: number
  size?: number
  pageSize?: number
  status?: string
  keyword?: string
}

export interface SaveAnswerParams {
  index: number
  answer: string
}

export function createPractice(data: CreateSessionParams) {
  return request.post<ApiResponse<PracticeSession>>('/practice/sessions', data)
}

export function getPracticeSessions(params?: PracticeListParams) {
  return request.get<ApiResponse<PageResult<PracticeSessionSummary>>>('/practice/sessions', { params })
}

export function getPracticeSession(id: string) {
  return request.get<ApiResponse<PracticeSession>>(`/practice/sessions/${id}`)
}

export function submitPracticeAnswer(sessionId: string, data: SaveAnswerParams) {
  return request.post<ApiResponse<boolean>>(`/practice/sessions/${sessionId}/answers`, data)
}

export function completePractice(sessionId: string) {
  return request.post<ApiResponse<PracticeResult>>(`/practice/sessions/${sessionId}/complete`)
}

export function abandonPractice(sessionId: string) {
  return request.post<ApiResponse<null>>(`/practice/sessions/${sessionId}/abandon`)
}

export function reroll(sessionId: string, data?: Partial<CreateSessionParams>) {
  return request.post<ApiResponse<PracticeSession>>(`/practice/sessions/${sessionId}/reroll`, data)
}