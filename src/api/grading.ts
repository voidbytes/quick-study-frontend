import request from './request'
import type { ApiResponse, PageResult } from '@/types'

/** GET /grading/pending 分页参数（后端 PageRequest 字段为 page/size） */
export interface GradingListParams {
  page?: number
  size?: number
  status?: string
}

/** 待批改列表行（对应 GradingPendingResponse，sessionId 经 ToStringSerializer 序列化为字符串） */
export interface GradingPendingItem {
  sessionId: string
  paperId: number
  paperTitle?: string
  userId: number
  userNickname?: string
  submitTime?: string
  status?: string
}

/** 批改详情 - 单题（对应 GradingSessionResponse.AnswerDetail） */
export interface GradingAnswerDetail {
  id: number | null
  paperQuestionId: number
  content: string | null
  userAnswer: string | null
  referenceAnswer: string | null
  score: number | null
  type: string | null
  isCorrect: boolean | null
  maxScore: number | null
}

/** 批改详情（对应 GradingSessionResponse） */
export interface GradingSessionDetail {
  sessionId: string
  user: { id: number; nickname: string | null } | null
  paper: { id: number; title: string | null } | null
  answers: GradingAnswerDetail[]
}

/** AI 评分建议（对应 AiSuggestResponse） */
export interface AiSuggestResult {
  suggestedScore: number
  reasoning: string
}

export interface KeywordMatch {
  keyword: string
  found: boolean
}

/** 关键词匹配评分（对应 KeywordSuggestResponse） */
export interface KeywordSuggestResult {
  suggestedScore: number
  matchedKeywords: KeywordMatch[]
  reasoning: string
}

export function getGradingPending(params?: GradingListParams) {
  return request.get<ApiResponse<PageResult<GradingPendingItem>>>('/grading/pending', { params })
}

export function getGradingSession(sessionId: string) {
  return request.get<ApiResponse<GradingSessionDetail>>(`/grading/sessions/${sessionId}`)
}

/** PUT /grading/sessions/{sessionId}/answers/{answerId}，body 仅 { score } */
export function saveScore(sessionId: string, answerId: number, data: { score: number }) {
  return request.put<ApiResponse<null>>(`/grading/sessions/${sessionId}/answers/${answerId}`, data)
}

export function completeGrading(sessionId: string) {
  return request.post<ApiResponse<null>>(`/grading/sessions/${sessionId}/complete`)
}

export function aiSuggest(sessionId: string, answerId: number) {
  return request.post<ApiResponse<AiSuggestResult>>(
    `/grading/sessions/${sessionId}/answers/${answerId}/ai-suggest`
  )
}

export function keywordSuggest(sessionId: string, answerId: number, data?: { keywords?: string[] }) {
  return request.post<ApiResponse<KeywordSuggestResult>>(
    `/grading/sessions/${sessionId}/answers/${answerId}/keyword-suggest`,
    data
  )
}
