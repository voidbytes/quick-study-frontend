import request from './request'
import type { ApiResponse, PageResult, PracticeSession } from '@/types'

export interface CreateSessionParams {
  count: number
  bankIds?: number[]
  types?: number[]
  tagIds?: number[]
  correctRateMin?: number
  correctRateMax?: number
  priorUnanswered?: boolean
  priorWrong?: boolean
}

export interface PracticeListParams {
  page?: number
  pageSize?: number
  status?: string
}

export interface SaveAnswerParams {
  questionId: number
  answer: string
}

export function createPractice(data: CreateSessionParams) {
  return request.post<ApiResponse<PracticeSession>>('/practice/sessions', data)
}

export function getPracticeSessions(params?: PracticeListParams) {
  return request.get<ApiResponse<PageResult<PracticeSession>>>('/practice/sessions', { params })
}

export function getPracticeSession(id: number) {
  return request.get<ApiResponse<PracticeSession>>(`/practice/sessions/${id}`)
}

export function submitPracticeAnswer(sessionId: number, data: SaveAnswerParams) {
  return request.put<ApiResponse<null>>(`/practice/sessions/${sessionId}/answers`, data)
}

export function completePractice(sessionId: number) {
  return request.post<ApiResponse<PracticeSession>>(`/practice/sessions/${sessionId}/complete`)
}

export function abandonPractice(sessionId: number) {
  return request.post<ApiResponse<null>>(`/practice/sessions/${sessionId}/abandon`)
}

export function createSession(data: CreateSessionParams) {
  return request.post<ApiResponse<PracticeSession>>('/practice/sessions', data)
}

export function listSessions(params?: PracticeListParams) {
  return request.get<ApiResponse<PageResult<PracticeSession>>>('/practice/sessions', { params })
}

export function getSession(id: number) {
  return request.get<ApiResponse<PracticeSession>>(`/practice/sessions/${id}`)
}

export function saveAnswer(sessionId: number, data: SaveAnswerParams) {
  return request.put<ApiResponse<null>>(`/practice/sessions/${sessionId}/answers`, data)
}

export function complete(sessionId: number) {
  return request.post<ApiResponse<PracticeSession>>(`/practice/sessions/${sessionId}/complete`)
}

export function abandon(sessionId: number) {
  return request.post<ApiResponse<null>>(`/practice/sessions/${sessionId}/abandon`)
}

export function reroll(sessionId: number) {
  return request.post<ApiResponse<PracticeSession>>(`/practice/sessions/${sessionId}/reroll`)
}