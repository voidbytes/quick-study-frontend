import request from './request'
import type { ApiResponse } from '@/types'

export interface AiConfigKeyItem {
  id: string
  maskedApiKey: string
  enabled: boolean
}

export interface AiConfig {
  id: string
  enabled: boolean
  protocolType: string
  baseUrl: string
  modelId: string
  temperature: number | null
  maxTokens: number | null
  timeoutSeconds: number | null
  retryCount: number | null
  gradingPrompt: string
  updatedAt: string
  keys: AiConfigKeyItem[]
}

/**
 * AI Key 提交项（三态保留语义）：
 * - 已有 key 未改明文 → 只传 id + enabled（apiKey 留空，后端保留原值）；
 * - 已有 key 改明文 → 传 id + apiKey + enabled；
 * - 新增 key → 只传 apiKey + enabled（无 id）；
 * - 列表删除某行 → 从提交数组移除该 id（后端删除）。
 * 注意：绝不能把 maskedApiKey（形如 sk-xxxx****）回传。
 */
export interface AiConfigKeySubmit {
  id?: string
  apiKey?: string
  enabled?: boolean
}

export interface AiConfigSubmit {
  enabled: boolean
  protocolType: string
  baseUrl: string
  modelId: string
  temperature: number | null
  maxTokens: number | null
  timeoutSeconds: number | null
  retryCount: number | null
  gradingPrompt: string
  keys: AiConfigKeySubmit[]
}

export function getAiConfig() {
  return request.get<ApiResponse<AiConfig>>('/admin/ai-config')
}

export function saveAiConfig(payload: AiConfigSubmit) {
  return request.put<ApiResponse<null>>('/admin/ai-config', payload)
}
