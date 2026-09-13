import request from './request'
import type { ApiResponse } from '@/types'

export type SystemConfigValueType = 'BOOLEAN' | 'INT' | 'STRING' | 'LONG'

export interface SystemConfigItem {
  id: string
  configKey: string
  configValue: string
  valueType: SystemConfigValueType
  configGroup: string
  description: string | null
  editable: boolean
  updatedAt: string
}

export interface EnvConfigItem {
  key: string
  description: string
  category: string
  sensitive: boolean
  configured: boolean
  restartRequired: boolean
}

export interface SystemConfigUpdateItem {
  configKey: string
  configValue: string
}

export function getSystemConfig() {
  return request.get<ApiResponse<SystemConfigItem[]>>('/admin/system-config')
}

export function updateSystemConfig(items: SystemConfigUpdateItem[]) {
  return request.put<ApiResponse<SystemConfigItem[]>>('/admin/system-config', { items })
}

export function getSystemConfigEnv() {
  return request.get<ApiResponse<EnvConfigItem[]>>('/admin/system-config/env-summary')
}
