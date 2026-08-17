import request from './request'
import type { ApiResponse, PageResult, GradingSession } from '@/types'

export interface GradingListParams {
  page?: number
  pageSize?: number
  status?: string
}

export interface ScoreAnswerParams {
  questionId: number
  score: number
  comment?: string
}

export function getGradingPending(params?: GradingListParams) {
  return request.get<ApiResponse<PageResult<GradingSession>>>('/grading/pending', { params })
}

export function getGradingSession(sessionId: string) {
  return request.get<ApiResponse<GradingSession>>(`/grading/sessions/${sessionId}`)
}

export function saveScore(sessionId: string, data: ScoreAnswerParams) {
  return request.post<ApiResponse<null>>(`/grading/sessions/${sessionId}/score`, data)
}

export function getPendingList(params?: GradingListParams) {
  return request.get<ApiResponse<PageResult<GradingSession>>>('/grading/pending', { params })
}

export function getSessionDetail(sessionId: string) {
  return request.get<ApiResponse<GradingSession>>(`/grading/sessions/${sessionId}`)
}

export function scoreAnswer(sessionId: string, data: ScoreAnswerParams) {
  return request.post<ApiResponse<null>>(`/grading/sessions/${sessionId}/score`, data)
}

export function completeGrading(sessionId: string) {
  return request.post<ApiResponse<null>>(`/grading/sessions/${sessionId}/complete`)
}

export function aiSuggest(sessionId: string, questionId: number) {
  return request.get<ApiResponse<{ score: number; comment: string }>>(
    `/grading/sessions/${sessionId}/ai-suggest/${questionId}`
  )
}

export function keywordSuggest(sessionId: string, questionId: number) {
  return request.get<ApiResponse<{ keywords: string[]; matched: string[] }>>(
    `/grading/sessions/${sessionId}/keyword-suggest/${questionId}`
  )
}