import request from './request'
import type { ApiResponse, ImportResult } from '@/types'

/**
 * 题库 / 题目导入导出 API。
 *
 * 导出接口返回 Blob 下载流；当后端返回业务错误（code != 0）时，
 * 响应体是 application/json 的 ApiResponse，此处统一解析并以 Error 抛出，
 * 让调用方 catch 后能拿到后端 message。
 */

export async function ensureBlob(promise: Promise<Blob>): Promise<Blob> {
  const blob = await promise
  if (blob.type && blob.type.includes('application/json')) {
    const text = await blob.text()
    let json: any = null
    let parseFailed = false
    try {
      json = JSON.parse(text)
    } catch {
      parseFailed = true
    }
    // 仅当解析失败（非 JSON 异常）或为 ApiResponse（含 code 字段）时才视为业务错误；
    // 导出文件本身也是合法 JSON，不能仅凭 Content-Type 判定失败
    if (parseFailed || json?.code !== undefined) {
      throw new Error(json?.message || '导出失败')
    }
  }
  return blob
}

/** 导出整个题库（含全部题目）为 JSON 文件 */
export function exportBank(bankId: number | string): Promise<Blob> {
  return ensureBlob(request.post<Blob>(`/banks/${bankId}/export`, undefined, { responseType: 'blob' }))
}

/**
 * 导出整个题库为 Markdown（人读交付物，仅管理员及以上）。
 * @param bankId 题库 ID
 * @param params 可选：withAnswer（默认 true）/ typeFilter / tagIds
 */
export interface MarkdownExportParams {
  withAnswer?: boolean
  typeFilter?: string[]
  tagIds?: string[]
}

export function exportBankMarkdown(
  bankId: number | string,
  params: MarkdownExportParams = {}
): Promise<Blob> {
  return ensureBlob(
    request.post<Blob>(`/banks/${bankId}/export/markdown`, params, { responseType: 'blob' })
  )
}

/**
 * 批量导出题目：传 questionIds 按显式 ID 导出；
 * 传 bankId/type/difficulty/status/tagIds/keyword 按筛选条件导出全部。
 */
export interface ExportQuestionsParams {
  questionIds?: string[]
  bankId?: number | string
  type?: string
  difficulty?: string
  status?: string
  tagIds?: string[]
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
