import request from './request'
import type { ApiResponse, PageResult } from '@/types'

export interface OperationLogItem {
  id: string
  operatorName: string
  operatorRole: string
  action: string
  targetType: string
  targetId: string | null
  detail: string | null
  requestId: string | null
  clientIp: string | null
  success: boolean
  errorMessage: string | null
  costMs: number | null
  createdAt: string
}

export interface OperationLogQuery {
  page?: number
  size?: number
  action?: string
  operatorId?: string
  targetType?: string
  startTime?: string
  endTime?: string
}

export function getOperationLogs(params?: OperationLogQuery) {
  return request.get<ApiResponse<PageResult<OperationLogItem>>>('/admin/operation-logs', { params })
}
