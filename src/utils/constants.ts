import type { QuestionType, Difficulty, SessionStatus, PaperStatus } from '@/types'

export const QUESTION_TYPE_OPTIONS: { label: string; value: QuestionType }[] = [
  { label: '单选题', value: 'single_choice' },
  { label: '多选题', value: 'multiple_choice' },
  { label: '判断题', value: 'true_false' },
  { label: '填空题', value: 'fill_blank' },
  { label: '简答题', value: 'short_answer' },
  { label: '论述题', value: 'essay' }
]

export const QUESTION_TYPE_MAP: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  short_answer: '简答题',
  essay: '论述题'
}

export const DIFFICULTY_OPTIONS: { label: string; value: Difficulty; color: string }[] = [
  { label: '简单', value: 'easy', color: '#18a058' },
  { label: '中等', value: 'medium', color: '#d03050' },
  { label: '困难', value: 'hard', color: '#d03050' }
]

export const DIFFICULTY_MAP: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

export const SESSION_STATUS_MAP: Record<SessionStatus, { label: string; color: string }> = {
  in_progress: { label: '进行中', color: '#2080f0' },
  pending_review: { label: '待批改', color: '#f0a020' },
  completed: { label: '已完成', color: '#18a058' },
  abandoned: { label: '已放弃', color: '#909399' }
}

export const PAPER_STATUS_MAP: Record<PaperStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: '#909399' },
  published: { label: '已发布', color: '#18a058' },
  closed: { label: '已关闭', color: '#d03050' }
}

export const TOKEN_KEY = 'quick-study-token'
export const REFRESH_TOKEN_KEY = 'quick-study-refresh-token'
export const USER_INFO_KEY = 'quick-study-user-info'