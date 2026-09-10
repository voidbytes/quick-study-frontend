import request from './request'
import type { ApiResponse, PageResult, Question, QuestionType, OptionItem } from '@/types'

export interface CreateQuestionParams {
  type: QuestionType
  difficulty: string
  content: string
  /** 选项对象数组（整题替换模型：id 从 0 起连续编号，后端防御性校验；仅选择题型） */
  options?: OptionItem[]
  /**
   * 答案（option_id 模型，按题型分治）：
   * 选择题 = id JSON 数组字符串（"[1]"/"[0,2]"）、判断题 = "[0]"/"[1]"、
   * 填空/简答 = 文本（简答参考答案并入本字段，后端已删除 referenceAnswer）、编程题不传
   */
  answer?: string
  analysis?: string
  tagIds?: string[]
  status?: string
  /** 选项是否可乱序（仅选择题型） */
  optionsShufflable?: boolean
  /** 编程题配置（type=PROGRAMMING 时必传） */
  programming?: ProgrammingQuestionConfig
}

export interface UpdateQuestionParams {
  type?: string
  difficulty?: string
  content?: string
  /** 选项对象数组（整题替换：options + answer 成对原子提交，后端校验 answer 引用 id 均存在） */
  options?: OptionItem[]
  answer?: string
  analysis?: string
  tags?: number[]
  status?: string
  tagIds?: string[]
  optionsShufflable?: boolean
  /** 编程题配置（type=PROGRAMMING 时全量回传，未传则后端保留原配置） */
  programming?: ProgrammingQuestionConfig
}

/** 编程题测试用例（出题表单行） */
export interface ProgrammingTestCase {
  input: string
  expectedOutput: string
  isSample: boolean
  sortOrder: number
}

/** 编程题配置（与后端 QuestionProgrammingRequest 对齐） */
export interface ProgrammingQuestionConfig {
  timeLimitMs: number
  memoryLimitKb: number
  /** 允许语言代码数组；null/空 = 全部启用语言 */
  allowedLanguages: string[] | null
  starterCode: Record<string, string>
  answerCode: Record<string, string>
  judgeStrategy: 'AC_ONLY' | 'PARTIAL'
  testCases: ProgrammingTestCase[]
}

export interface QuestionListParams {
  page?: number
  pageSize?: number
  size?: number
  bankId?: number
  type?: string
  difficulty?: string
  keyword?: string
  /** 标签 id（雪花 long，字符串承载防 2^53 精度丢失） */
  tagIds?: string[]
  status?: string
  sortBy?: string
  sortOrder?: string
}

export function getQuestionList(bankId: number | string, params?: QuestionListParams) {
  return request.get<ApiResponse<PageResult<Question>>>(`/banks/${bankId}/questions`, { params })
}

export function getAllQuestions(params?: QuestionListParams) {
  return request.get<ApiResponse<PageResult<Question>>>('/questions', { params })
}

export function createQuestion(bankId: number | string, data: CreateQuestionParams) {
  return request.post<ApiResponse<Question>>(`/banks/${bankId}/questions`, data)
}

export function getQuestionDetail(id: number | string) {
  return request.get<ApiResponse<Question>>(`/questions/${id}`)
}

export function updateQuestion(bankId: number | string, questionId: number | string, data: UpdateQuestionParams) {
  return request.put<ApiResponse<Question>>(`/banks/${bankId}/questions/${questionId}`, data)
}

export function updateSort(ids: number[]) {
  return request.put<ApiResponse<null>>('/questions/sort', { ids })
}

export function deleteQuestion(bankId: number | string, questionId: number | string) {
  return request.delete<ApiResponse<null>>(`/banks/${bankId}/questions/${questionId}`)
}
