import request from './request'
import type { ApiResponse, PageResult, Question, QuestionType } from '@/types'

export interface CreateQuestionParams {
  type: QuestionType
  difficulty: string
  content: string
  options?: string
  answer: string
  referenceAnswer?: string
  analysis?: string
  tagIds?: number[]
  status?: string
  /** 编程题配置（type=PROGRAMMING 时必传） */
  programming?: ProgrammingQuestionConfig
}

export interface UpdateQuestionParams {
  type?: string
  difficulty?: string
  content?: string
  options?: { label: string; value: string; content: string }[]
  answer?: string
  analysis?: string
  score?: number
  tags?: number[]
  status?: string
  tagIds?: number[]
  referenceAnswer?: string
  /** 编程题配置（type=PROGRAMMING 时全量回传，未传则后端保留原配置） */
  programming?: ProgrammingQuestionConfig
}

/** 编程题测试用例（出题表单行） */
export interface ProgrammingTestCase {
  input: string
  expectedOutput: string
  isSample: boolean
  sortOrder: number
}

/** 编程题配置（与后端 QuestionProgrammingRequest 对齐） */
export interface ProgrammingQuestionConfig {
  timeLimitMs: number
  memoryLimitKb: number
  /** 允许语言代码数组；null/空 = 全部启用语言 */
  allowedLanguages: string[] | null
  starterCode: Record<string, string>
  answerCode: Record<string, string>
  judgeStrategy: 'AC_ONLY' | 'PARTIAL'
  testCases: ProgrammingTestCase[]
}

export interface QuestionListParams {
  page?: number
  pageSize?: number
  size?: number
  bankId?: number
  type?: string
  difficulty?: string
  keyword?: string
  tagIds?: number[]
  status?: string
  sortBy?: string
  sortOrder?: string
}

export function getQuestionList(bankId: number | string, params?: QuestionListParams) {
  return request.get<ApiResponse<PageResult<Question>>>(`/banks/${bankId}/questions`, { params })
}

export function getAllQuestions(params?: QuestionListParams) {
  return request.get<ApiResponse<PageResult<Question>>>('/questions', { params })
}

export function createQuestion(bankId: number | string, data: CreateQuestionParams) {
  return request.post<ApiResponse<Question>>(`/banks/${bankId}/questions`, data)
}

export function getQuestionDetail(id: number | string) {
  return request.get<ApiResponse<Question>>(`/questions/${id}`)
}

export function updateQuestion(bankId: number | string, questionId: number | string, data: UpdateQuestionParams) {
  return request.put<ApiResponse<Question>>(`/banks/${bankId}/questions/${questionId}`, data)
}

export function updateSort(ids: number[]) {
  return request.put<ApiResponse<null>>('/questions/sort', { ids })
}

export function deleteQuestion(bankId: number | string, questionId: number | string) {
  return request.delete<ApiResponse<null>>(`/banks/${bankId}/questions/${questionId}`)
}
