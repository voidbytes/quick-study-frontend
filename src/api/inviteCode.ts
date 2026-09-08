import request from './request'
import type { ApiResponse, PageResult } from '@/types'

export interface InviteCodeItem {
  id: string
  code: string
  codeDisplay: string
  maxUses: number
  usedCount: number
  status: 'ACTIVE' | 'DISABLED'
  displayStatus: 'AVAILABLE' | 'EXHAUSTED' | 'EXPIRED' | 'DISABLED'
  statusLabel: string
  expireAt: string | null
  expired: boolean
  grantRole: string
  remark: string | null
  createdBy: string
  createdByNickname: string | null
  createdAt: string | null
}

export interface InviteCodeSummary {
  total: number
  available: number
  exhausted: number
  expired: number
  disabled: number
}

export interface InviteCodeQuery {
  page?: number
  size?: number
  keyword?: string
  status?: string
  createdBy?: number
}

export interface GenerateInviteCodeParams {
  count: number
  maxUses: number
  validDays?: number
  expireAt?: string
  grantRole: string
  remark?: string
}

export interface InviteCodeUsage {
  id: string
  usedBy: string
  usedByNickname: string | null
  usedByUsername: string | null
  userStatus: string | null
  usedAt: string | null
  registerIp: string | null
}

export function fetchInviteCodes(params?: InviteCodeQuery) {
  return request.get<ApiResponse<{ page: PageResult<InviteCodeItem>; summary: InviteCodeSummary }>>(
    '/admin/invite-codes',
    { params }
  )
}

export function generateInviteCodes(data: GenerateInviteCodeParams) {
  return request.post<ApiResponse<InviteCodeItem[]>>('/admin/invite-codes', data)
}

export function updateInviteCodeStatus(id: string | number, status: 'ACTIVE' | 'DISABLED') {
  return request.put<ApiResponse<null>>(`/admin/invite-codes/${id}/status`, { status })
}

export function fetchInviteCodeUsages(id: string | number) {
  return request.get<ApiResponse<InviteCodeUsage[]>>(`/admin/invite-codes/${id}/usages`)
}

export function deleteInviteCode(id: string | number) {
  return request.delete<ApiResponse<null>>(`/admin/invite-codes/${id}`)
}
