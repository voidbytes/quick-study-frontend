import request from './request'
import type { ApiResponse, PageResult, Question } from '@/types'

export interface CreateQuestionParams {
  type: number
  difficulty: string
  content: string
  options?: string
  answer: string
  referenceAnswer?: string
  analysis?: string
  tagIds?: number[]
  status?: string
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
}

export interface QuestionListParams {
  page?: number
  pageSize?: number
  size?: number
  bankId?: number
  type?: string
  difficulty?: string
  keyword?: string
  tagId?: number
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

export function create(data: CreateQuestionParams) {
  return request.post<ApiResponse<Question>>('/questions', data)
}

export function list(params?: QuestionListParams) {
  return request.get<ApiResponse<PageResult<Question>>>('/questions', { params })
}

export function getById(id: number | string) {
  return request.get<ApiResponse<Question>>(`/questions/${id}`)
}

export function update(id: number | string, data: UpdateQuestionParams) {
  return request.put<ApiResponse<Question>>(`/questions/${id}`, data)
}

export function deleteQuestion(bankId: number | string, questionId: number | string) {
  return request.delete<ApiResponse<null>>(`/banks/${bankId}/questions/${questionId}`)
}

export function sort(ids: number[]) {
  return request.put<ApiResponse<null>>('/questions/sort', { ids })
}

export function batchImport(bankId: number | string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<ApiResponse<{ success: number; failed: number; errors: string[] }>>(
    `/questions/batch-import?bankId=${bankId}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
}

export function downloadTemplate() {
  return request.get<Blob>('/questions/import-template', {
    responseType: 'blob'
  })
}