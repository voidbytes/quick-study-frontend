import request from './request'
import type { ApiResponse } from '@/types'

export interface StartSessionResponse {
  sessionId: string
  deadline: string | null
  questions: QuestionItem[]
}

export interface QuestionItem {
  id: number
  type: string
  content: string
  options: string | null
  score: number
  sortOrder: number
}

export interface SessionResponse {
  sessionId: string
  status: string
  deadline: string | null
  cheatCount: number
  currentAnswers: AnswerItem[]
  questions: QuestionItem[]
}

export interface AnswerItem {
  paperQuestionId: number
  userAnswer: string
}

export interface SaveAnswerItem {
  paperQuestionId: number
  answer: string
}

export interface SaveAnswersPayload {
  answers: SaveAnswerItem[]
}

export interface SessionResultResponse {
  sessionId: string
  totalScore: number
  objectiveScore: number
  subjectiveScore: number
  status: string
  questions: QuestionResultItem[]
}

export interface QuestionResultItem {
  paperQuestionId: number
  content: string
  type: string
  options: string | null
  yourAnswer: string
  correctAnswer: string
  analysis: string
  score: number
  isCorrect: boolean | null
}

export function startSession(paperId: string | number, password?: string) {
  const params = password ? `?password=${encodeURIComponent(password)}` : ''
  return request.post<ApiResponse<StartSessionResponse>>(`/papers/${paperId}/sessions${params}`)
}

export function getSession(sessionId: string) {
  return request.get<ApiResponse<SessionResponse>>(`/sessions/${sessionId}`)
}

export function saveAnswers(sessionId: string, data: SaveAnswersPayload) {
  return request.post<ApiResponse<null>>(`/sessions/${sessionId}/answers`, data)
}

export function submitSession(sessionId: string) {
  return request.post<ApiResponse<any>>(`/sessions/${sessionId}/submit`)
}

export function reportCheat(sessionId: string) {
  return request.post<ApiResponse<any>>(`/sessions/${sessionId}/cheat`)
}

export function getResult(sessionId: string) {
  return request.get<ApiResponse<SessionResultResponse>>(`/sessions/${sessionId}/result`)
}