import request from './request'
import type { ApiResponse, ImportResult } from '@/types'

/**
 * 题库 / 题目导入导出 API。
 *
 * 导出接口返回 Blob 下载流；当后端返回业务错误（code != 0）时，
 * 响应体是 application/json 的 ApiResponse，此处统一解析并以 Error 抛出，
 * 让调用方 catch 后能拿到后端 message。
 */

async function ensureBlob(promise: Promise<Blob>): Promise<Blob> {
  const blob = await promise
  if (blob.type && blob.type.includes('application/json')) {
    const text = await blob.text()
    let msg = '导出失败'
    try {
      const json = JSON.parse(text)
      if (json?.message) msg = json.message
    } catch {
      // 非 JSON 兜底用默认提示
    }
    throw new Error(msg)
  }
  return blob
}

/** 导出整个题库（含全部题目）为 JSON 文件 */
export function exportBank(bankId: number | string): Promise<Blob> {
  return ensureBlob(request.post<Blob>(`/banks/${bankId}/export`, undefined, { responseType: 'blob' }))
}

/**
 * 批量导出题目：传 questionIds 按显式 ID 导出；
 * 传 bankId/type/difficulty/status/tagIds/keyword 按筛选条件导出全部。
 */
export interface ExportQuestionsParams {
  questionIds?: number[]
  bankId?: number | string
  type?: string
  difficulty?: string
  status?: string
  tagIds?: number[]
  keyword?: string
}

export function exportQuestions(params: ExportQuestionsParams): Promise<Blob> {
  return ensureBlob(request.post<Blob>('/questions/export', params, { responseType: 'blob' }))
}

/** 导入一个题库（JSON 文件）；与已有题库重名时后端直接拒绝 */
export function importBank(file: File): Promise<ApiResponse<ImportResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<ApiResponse<ImportResult>>('/banks/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** 导入题目到指定题库（JSON 文件），后端按题干去重并返回汇总 */
export function importQuestions(bankId: number | string, file: File): Promise<ApiResponse<ImportResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<ApiResponse<ImportResult>>(`/banks/${bankId}/questions/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
