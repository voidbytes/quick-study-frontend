import request from './request'
import type { ApiResponse, PageResult, PracticeRecord } from '@/types'

export interface RecordListParams {
  page?: number
  size?: number
  bankId?: number
  type?: string
  startDate?: string
  endDate?: string
}

export function getRecordList(params?: RecordListParams) {
  return request.get<ApiResponse<PageResult<PracticeRecord>>>('/practice-records', { params })
}

export function list(params?: RecordListParams) {
  return request.get<ApiResponse<PageResult<PracticeRecord>>>('/records', { params })
}

export function getById(id: number) {
  return request.get<ApiResponse<PracticeRecord>>(`/records/${id}`)
}