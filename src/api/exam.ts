import request from './request'
import type { ApiResponse, PageResult, MyExamSession, OptionItem } from '@/types'

export interface StartSessionResponse {
  sessionId: string
  deadline: string | null
  questions: QuestionItem[]
}

export interface QuestionItem {
  id: string
  type: string
  content: string
  /** 选项对象数组（成卷快照，乱序后顺序） */
  options: OptionItem[] | null
  score: number
  sortOrder: number
  /** 编程题配置（答题者视角，脱敏：仅公开样例、无 answerCode） */
  programming?: {
    timeLimitMs?: number
    memoryLimitKb?: number
    allowedLanguages?: string[] | null
    starterCode?: Record<string, string>
    sampleCases?: { sortOrder: number; input: string; expectedOutput: string }[]
  } | null
}

export interface SessionResponse {
  sessionId: string
  status: string
  deadline: string | null
  cheatCount: number
  currentAnswers: AnswerItem[]
  questions: QuestionItem[]
}

export interface AnswerItem {
  paperQuestionId: string
  userAnswer: string
  /** 编程题作答语言ID（断点恢复时前端据此回显语言选择） */
  languageId?: string | null
}

export interface SaveAnswerItem {
  paperQuestionId: string
  answer: string
  /** 编程题作答语言ID（交卷判题时后端据此选择语言） */
  languageId?: string | null
}

export interface SaveAnswersPayload {
  answers: SaveAnswerItem[]
}

export interface SessionResultResponse {
  sessionId: string
  totalScore: number
  objectiveScore: number
  subjectiveScore: number
  status: string
  questions: QuestionResultItem[]
}

export interface QuestionResultItem {
  paperQuestionId: string
  /** 原题 id（题库内题目，成绩复核页跳转原题用） */
  questionId?: string
  /** 原题所属题库 id（跳转原题用） */
  bankId?: string
  content: string
  type: string
  /** 选项对象数组（成卷快照，乱序后顺序） */
  options: OptionItem[] | null
  /** 选择题=id JSON 数组字符串；填空/简答=文本；编程=代码 */
  yourAnswer: string | null
  /** 同上；未公布/无标准答案为 null */
  correctAnswer: string | null
  analysis: string
  score: number | null
  isCorrect: boolean | null
  /** 编程题判题结果（交卷时创建的 submission 快照；非编程题/未提交为 null） */
  programming?: {
    submissionId: number
    /** PENDING / JUDGING / FINISHED / ERROR */
    status: string
    /** AC / WA / TLE / MLE / RE / CE / SE（仅 FINISHED 有值） */
    result: string
    passCount: number | null
    totalCount: number | null
    maxTimeMs: number | null
    compileMessage?: string | null
    languageName?: string | null
  } | null
}

export function startSession(paperId: string | number, password?: string) {
  const params = password ? `?password=${encodeURIComponent(password)}` : ''
  return request.post<ApiResponse<StartSessionResponse>>(`/papers/${paperId}/sessions${params}`)
}

export function getSession(sessionId: string) {
  return request.get<ApiResponse<SessionResponse>>(`/sessions/${sessionId}`)
}

export function saveAnswers(sessionId: string, data: SaveAnswersPayload) {
  return request.post<ApiResponse<null>>(`/sessions/${sessionId}/answers`, data)
}

export function submitSession(sessionId: string) {
  return request.post<ApiResponse<any>>(`/sessions/${sessionId}/submit`)
}

export function reportCheat(sessionId: string) {
  return request.post<ApiResponse<any>>(`/sessions/${sessionId}/cheat`)
}

export function getResult(sessionId: string) {
  return request.get<ApiResponse<SessionResultResponse>>(`/sessions/${sessionId}/result`)
}

/** 「我的考试记录」：当前用户的历史作答会话分页列表 */
export function getMyExamSessions(params?: { page?: number; size?: number; keyword?: string }) {
  return request.get<ApiResponse<PageResult<MyExamSession>>>('/my/exam-sessions', { params })
}
