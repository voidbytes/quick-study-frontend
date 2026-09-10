import request from './request'
import type { ApiResponse } from '@/types'

export interface PlaygroundLanguage {
  code: string
  name: string
  fileName: string
  highlightName: string
}

/** 判题语言（programming_language 表启用项；出题时用于语言限制与模板编辑） */
export interface ProgrammingLanguage {
  id: string
  code: string
  name: string
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
  return request.get<ApiResponse<PlaygroundLanguage[]>>('/playground/languages')
}

/** 判题启用的语言列表（出题表单：语言限制选择 + 初始代码模板编辑） */
export function getProgrammingLanguages() {
  return request.get<ApiResponse<ProgrammingLanguage[]>>('/programming-languages')
}

/** 代码运行台：同步运行代码（不落库、不计分） */
export function runPlayground(data: PlaygroundRunRequest) {
  return request.post<ApiResponse<PlaygroundRunResponse>>('/playground/run', data)
}

// ==================== 判题接口（答题端） ====================

export interface RunSampleCaseResult {
  sortOrder: number
  input: string
  expectedOutput: string
  actualOutput: string
  /** AC / WA / TLE / RE */
  result: string
  timeMs: number
}

export interface RunSampleResponseData {
  /** 编译错误（编译失败时非空，results 为空） */
  compileError?: string
  results: RunSampleCaseResult[]
  customRun?: {
    input: string
    output: string
    result: string
    timeMs: number
  } | null
}

export interface RunSamplePayload {
  languageCode: string
  code: string
  customInput?: string
}

/** 题库直调：运行样例（运行样例入口二选一，按场景调用对应端点） */
export function runSampleDirect(questionId: number | string, data: RunSamplePayload) {
  return request.post<ApiResponse<RunSampleResponseData>>(`/questions/${questionId}/run-sample`, data)
}

/** 考试快照：运行样例 */
export function runSampleInExam(sessionId: number | string, paperQuestionId: number | string, data: RunSamplePayload) {
  return request.post<ApiResponse<RunSampleResponseData>>(
    `/exam/sessions/${sessionId}/questions/${paperQuestionId}/run-sample`, data)
}

/** 练习快照：运行样例 */
export function runSampleInPractice(sessionId: number | string, questionIndex: number, data: RunSamplePayload) {
  return request.post<ApiResponse<RunSampleResponseData>>(
    `/practice/sessions/${sessionId}/questions/${questionIndex}/run-sample`, data)
}

export interface SubmitCodePayload {
  languageId: string
  code: string
}

export interface SubmissionResponseData {
  id: string
  sourceType: string
  questionId: string
  userId: string
  languageId: string
  languageName: string
  timeLimitMs: number
  memoryLimitKb: number
  /** PENDING / JUDGING / FINISHED / ERROR */
  status: string
  /** AC / WA / TLE / MLE / RE / CE / SE（仅 FINISHED 有值） */
  result: string
  passCount: number
  totalCount: number
  maxTimeMs: number
  compileMessage?: string
  score: number
  judgedAt?: string
}

/** 练习：提交判题（异步，随后轮询判题结果） */
export function submitCode(sessionId: number | string, questionIndex: number, data: SubmitCodePayload) {
  return request.post<ApiResponse<SubmissionResponseData>>(
    `/practice/sessions/${sessionId}/questions/${questionIndex}/submit-code`, data)
}

/** 判题结果（轮询用） */
export function getSubmission(id: number | string) {
  return request.get<ApiResponse<SubmissionResponseData>>(`/judge/submissions/${id}`)
}

export interface SubmissionCaseDetail {
  sortOrder: number
  isSample: boolean
  /** AC / WA / TLE / MLE / RE */
  result: string
  timeMs: number
  input?: string
  expectedOutput?: string
  actualOutput: string
}

/** 逐用例判题详情（仅样例展示 input/expectedOutput，隐藏用例脱敏） */
export function getSubmissionCases(id: number | string) {
  return request.get<ApiResponse<{ cases: SubmissionCaseDetail[] }>>(`/judge/submissions/${id}/cases`)
}
