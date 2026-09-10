import request from './request'
import type { ApiResponse, PageResult, QuestionBank, BankCollaborator } from '@/types'

export interface CreateBankParams {
  name: string
  description?: string
  cover?: string
  isPublic?: boolean
  tags?: number[]
}

export interface UpdateBankParams {
  name?: string
  description?: string
  cover?: string
  isPublic?: boolean
  tags?: number[]
}

export interface BankListParams {
  page?: number
  size?: number
  keyword?: string
  isPublic?: boolean
  isOfficial?: boolean
  sort?: string
}

export function createBank(data: CreateBankParams) {
  return request.post<ApiResponse<QuestionBank>>('/banks', data)
}

export function getBankList(params?: BankListParams) {
  return request.get<ApiResponse<PageResult<QuestionBank>>>('/banks', { params })
}

export function getBankDetail(id: number | string) {
  return request.get<ApiResponse<QuestionBank>>(`/banks/${id}`)
}

export function getCollaborators(bankId: number | string) {
  return request.get<ApiResponse<BankCollaborator[]>>(`/banks/${bankId}/collaborators`)
}

export function transferBank(id: number | string, targetUserId: string) {
  return request.post<ApiResponse<null>>(`/banks/${id}/transfer`, { targetUserId })
}

export function updateBank(id: number | string, data: UpdateBankParams) {
  return request.put<ApiResponse<QuestionBank>>(`/banks/${id}`, data)
}

export function deleteBank(id: string) {
  return request.delete<ApiResponse<null>>(`/banks/${id}`)
}

export function toggleVisibility(id: string, isPublic: boolean) {
  return request.put<ApiResponse<QuestionBank>>(`/banks/${id}/visibility?isPublic=${isPublic}`)
}

export function transfer(id: string, targetUserId: string) {
  return request.post<ApiResponse<null>>(`/banks/${id}/transfer`, { targetUserId })
}

export function addCollaborator(bankId: number | string, userId: string) {
  return request.post<ApiResponse<null>>(`/banks/${bankId}/collaborators`, { userId })
}

export function removeCollaborator(bankId: number | string, userId: string) {
  return request.delete<ApiResponse<null>>(`/banks/${bankId}/collaborators/${userId}`)
}