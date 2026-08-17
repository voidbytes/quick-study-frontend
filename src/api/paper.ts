import request from './request'
import type { ApiResponse, PageResult, ExamPaper, GradingSession } from '@/types'

export interface CreatePaperParams {
  title: string
  description?: string
  timeLimit?: number
  startTime?: string
  endTime?: string
  attemptLimit?: number
  attemptType?: string
  multipleChoicePartial?: string
  fillBlankAutoSplit?: boolean
  questionItems: { questionId: number; score: number }[]
  graderId?: number
  shareType: string
  password?: string
  cheatEnabled?: boolean
  cheatLimit?: number
}

export interface UpdatePaperParams {
  title?: string
  description?: string
  timeLimit?: number
  startTime?: string
  endTime?: string
  attemptLimit?: number
  attemptType?: string
  multipleChoicePartial?: string
  fillBlankAutoSplit?: boolean
  graderId?: number
  shareType?: string
  password?: string
  cheatEnabled?: boolean
  cheatLimit?: number
}

export interface PaperListParams {
  page?: number
  size?: number
  keyword?: string
  shareType?: string
  status?: string
}

export function createPaper(data: CreatePaperParams) {
  return request.post<ApiResponse<ExamPaper>>('/papers', data)
}

export function getPaperList(params?: PaperListParams) {
  return request.get<ApiResponse<PageResult<ExamPaper>>>('/papers', { params })
}

export function getPaperDetail(id: string | number) {
  return request.get<ApiResponse<ExamPaper>>(`/papers/${id}`)
}

export function updatePaper(id: string | number, data: UpdatePaperParams) {
  return request.put<ApiResponse<ExamPaper>>(`/papers/${id}`, data)
}

export function getPaperSessions(id: string | number, params?: { page?: number; size?: number }) {
  return request.get<ApiResponse<PageResult<GradingSession>>>(`/papers/${id}/sessions`, { params })
}

export function publishPaper(id: string | number) {
  return request.post<ApiResponse<ExamPaper>>(`/papers/${id}/publish`)
}

export function create(data: CreatePaperParams) {
  return request.post<ApiResponse<ExamPaper>>('/papers', data)
}

export function list(params?: PaperListParams) {
  return request.get<ApiResponse<PageResult<ExamPaper>>>('/papers', { params })
}

export function getById(id: string | number) {
  return request.get<ApiResponse<ExamPaper>>(`/papers/${id}`)
}

export function update(id: string | number, data: UpdatePaperParams) {
  return request.put<ApiResponse<ExamPaper>>(`/papers/${id}`, data)
}

export function deletePaper(id: string | number) {
  return request.delete<ApiResponse<null>>(`/papers/${id}`)
}

export function publish(id: string | number) {
  return request.post<ApiResponse<ExamPaper>>(`/papers/${id}/publish`)
}

export function updateGrader(id: string | number, graderId: number) {
  return request.put<ApiResponse<null>>(`/papers/${id}/grader`, { graderId })
}

export function getQuestions(id: string | number) {
  return request.get<ApiResponse<any[]>>(`/papers/${id}/questions`)
}

export function listSessions(id: string | number, params?: { page?: number; size?: number }) {
  return request.get<ApiResponse<PageResult<GradingSession>>>(`/papers/${id}/sessions`, { params })
}

export function verifyPassword(id: string | number, password: string) {
  return request.post<ApiResponse<{ valid: boolean }>>(`/papers/${id}/verify-password`, { password })
}

export function getSessionsSummary(paperId: string | number) {
  return request.get<ApiResponse<{ totalParticipants: number; averageScore: number; maxScore: number; minScore: number }>>(`/papers/${paperId}/sessions-summary`)
}