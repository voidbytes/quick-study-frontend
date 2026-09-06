import request from './request'
import type { ApiResponse } from '@/types'

export interface PlaygroundLanguage {
  code: string
  name: string
  fileName: string
  highlightName: string
}

export interface PlaygroundRunRequest {
  languageCode: string
  code: string
  stdin?: string
}

export interface PlaygroundRunResponse {
  success: boolean
  compileError?: string
  stdout: string
  stderr: string
  exitCode?: number
  timeMs: number
  timedOut: boolean
  languageName: string
}

/** 代码运行台：支持的语言列表 */
export function getPlaygroundLanguages() {
  return request.get<ApiResponse<PlaygroundLanguage[]>>('/api/v1/playground/languages')
}

/** 代码运行台：同步运行代码（不落库、不计分） */
export function runPlayground(data: PlaygroundRunRequest) {
  return request.post<ApiResponse<PlaygroundRunResponse>>('/api/v1/playground/run', data)
}
