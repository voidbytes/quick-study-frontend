import type { QuestionType, Difficulty, SessionStatus, PaperStatus } from '@/types'

/**
 * 全站唯一枚举字典 —— 题型 / 难度 / 状态的 label、Tag 语义色。
 * 取值与后端运行时（大写枚举）保持一致，禁止在页面内再复制本地字典。
 * 颜色取自 design-tokens（success/error/warning/info/primary 语义色）。
 */

export const QUESTION_TYPE_OPTIONS: { label: string; value: QuestionType }[] = [
  { label: '单选题', value: 'SINGLE' },
  { label: '多选题', value: 'MULTIPLE' },
  { label: '判断题', value: 'TRUE_FALSE' },
  { label: '填空题', value: 'FILL_BLANK' },
  { label: '简答题', value: 'SHORT_ANSWER' }
]

export const QUESTION_TYPE_MAP: Record<QuestionType, string> = {
  SINGLE: '单选题',
  MULTIPLE: '多选题',
  TRUE_FALSE: '判断题',
  FILL_BLANK: '填空题',
  SHORT_ANSWER: '简答题'
}

export const DIFFICULTY_OPTIONS: { label: string; value: Difficulty }[] = [
  { label: '简单', value: 'EASY' },
  { label: '中等', value: 'MEDIUM' },
  { label: '困难', value: 'HARD' }
]

export const DIFFICULTY_MAP: Record<Difficulty, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难'
}

export const QUESTION_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待审核', value: 'PENDING_REVIEW' },
  { label: '已发布', value: 'PUBLISHED' }
]

export const SESSION_STATUS_MAP: Record<SessionStatus, { label: string; type: 'info' | 'warning' | 'success' | 'default' }> = {
  IN_PROGRESS: { label: '进行中', type: 'info' },
  PENDING_REVIEW: { label: '待批改', type: 'warning' },
  COMPLETED: { label: '已完成', type: 'success' },
  ABANDONED: { label: '已放弃', type: 'default' }
}

export const PAPER_STATUS_MAP: Record<PaperStatus, { label: string; type: 'default' | 'success' | 'error' }> = {
  DRAFT: { label: '草稿', type: 'default' },
  PUBLISHED: { label: '已发布', type: 'success' },
  CLOSED: { label: '已关闭', type: 'error' }
}

export const TOKEN_KEY = 'quick-study-token'
export const REFRESH_TOKEN_KEY = 'quick-study-refresh-token'
export const USER_INFO_KEY = 'quick-study-user-info'
