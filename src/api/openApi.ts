import request from './request'
import type { ApiResponse } from '@/types'

// ==================== 类型 ====================

export interface ApiCredential {
  id: string
  name: string
  accessKey: string
  /** SK 明文（仅创建/轮换响应一次性返回） */
  plainSecret: string | null
  /** 脱敏回显：qs****XXXX */
  maskedSecret: string
  /** 1 启用 0 禁用 2 已删除 */
  status: number
  lastUsedAt: string | null
  createdAt: string
}

export interface ApiCredentialListResponse {
  items: ApiCredential[]
  activeCount: number
  maxCount: number
}

export interface SandboxQuotaUsage {
  tier: string
  // 契约：后端全局 Jackson Long→String（防雪花 ID 超 JS 精度），Long 字段为字符串
  dailyLimit: string
  minuteLimit: string
  timeoutMs: string
  compileTimeoutMs: string
  memoryMb: string
  outputKb: string
  maxCredentials: number
  dailyUsed: string
  /** -1=不限（字符串承载） */
  dailyRemaining: string
}

export interface SandboxExecution {
  id: string
  executionId: string
  userId: string
  credentialId: string | null
  scene: string
  status: string
  outcomeCharged: boolean
  languageCode: string | null
  stdoutBytes: number | null
  stderrBytes: number | null
  timeMs: number | null
  exitCode: number | null
  costMs: number | null
  createdAt: string
}

// ==================== 凭证管理（JWT 站内会话） ====================

export function listCredentials() {
  return request.get<ApiResponse<ApiCredentialListResponse>>('/open/credentials')
}

export function createCredential(name: string) {
  return request.post<ApiResponse<ApiCredential>>('/open/credentials', { name })
}

export function rotateCredential(id: string) {
  return request.post<ApiResponse<ApiCredential>>(`/open/credentials/${id}/rotate`)
}

export function updateCredentialStatus(id: string, enabled: boolean) {
  return request.put<ApiResponse<void>>(`/open/credentials/${id}/status`, { enabled })
}

export function deleteCredential(id: string) {
  return request.delete<ApiResponse<void>>(`/open/credentials/${id}`)
}

// ==================== 配额用量（与开放 API /quota 同源） ====================

export function getSandboxQuota() {
  return request.get<ApiResponse<SandboxQuotaUsage>>('/playground/quota')
}
