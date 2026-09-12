import request from './request'
import type { ApiResponse } from '@/types'

export interface AdminLanguage {
  id: string
  code: string
  name: string
  fileExtension: string
  compileCommand: string
  runCommand: string
  classnameRequired: boolean
  timeMultiplier: number
  dockerImage: string
  highlightName: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

/** 创建时包含 code；更新时忽略 code（code 为不可变自然键，后端校验） */
export interface AdminLanguageForm {
  code?: string
  name: string
  fileExtension: string
  compileCommand: string
  runCommand: string
  classnameRequired: boolean
  timeMultiplier: number
  dockerImage: string
  highlightName: string
  isEnabled: boolean
}

export function listAdminLanguages() {
  return request.get<ApiResponse<AdminLanguage[]>>('/admin/programming-languages')
}

export function createAdminLanguage(payload: AdminLanguageForm) {
  return request.post<ApiResponse<AdminLanguage>>('/admin/programming-languages', payload)
}

export function updateAdminLanguage(id: string, payload: AdminLanguageForm) {
  return request.put<ApiResponse<AdminLanguage>>(`/admin/programming-languages/${id}`, payload)
}

export function deleteAdminLanguage(id: string) {
  return request.delete<ApiResponse<null>>(`/admin/programming-languages/${id}`)
}
