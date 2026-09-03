// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = any> {
  records: T[]
  total: number
  page: number
  pageSize: number
  pages: number
}

// 用户
export interface User {
  id: number
  username: string
  nickname: string
  email?: string
  avatar?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  status?: 'active' | 'disabled'
  createdAt?: string
  updatedAt?: string
}

// 题库
export interface QuestionBank {
  id: number
  name: string
  description: string
  cover: string
  userId: number
  username: string
  isPublic: boolean
  questionCount: number
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

/** 题库协作人（与 User 不同：用 userId 而非 id） */
export interface BankCollaborator {
  userId: number
  nickname?: string
  username?: string
  role: 'OWNER' | 'EDITOR' | 'REVIEWER' | 'VIEWER' | string
}

// 标签
export interface Tag {
  id: number
  name: string
  color: string
}

// 题目
// 与后端运行时一致的大写枚举（历史上此处曾误写为小写，导致三套枚举并存）
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER'

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface Question {
  id: number
  bankId: number
  bankName: string
  type: QuestionType
  difficulty: Difficulty
  content: string
  options: QuestionOption[]
  answer: string
  analysis: string
  score: number
  sort: number
  status: string
  tags: Tag[]
  tagIds: number[]
  createdAt: string
  updatedAt: string
}

export interface QuestionOption {
  label: string
  value: string
  content: string
}

// ============ 导入导出（题库/题目）============

/**
 * 单题交换结构（与后端 importexport 模块 QuestionExportItem 对应）。
 * options 必须是 JSON 字符串（如 "[{\"key\":\"A\",\"content\":\"...\"}]"），不能是对象数组
 * （后端用 JsonNode 接收，能容忍数组，但导出的规范格式是字符串）。
 */
export interface QuestionExportItem {
  type: QuestionType
  content: string
  options?: string | null
  answer: string
  referenceAnswer?: string | null
  analysis?: string | null
  difficulty: Difficulty
  status: string
  tags: string[]
}

export interface BankExportFile {
  format: 'quick-study-bank'
  version: number
  exportedAt: string
  bank: { name: string; description?: string | null; coverUrl?: string | null }
  questions: QuestionExportItem[]
}

export interface QuestionExportFile {
  format: 'quick-study-questions'
  version: number
  exportedAt: string
  questions: QuestionExportItem[]
}

export interface ImportSkippedItem {
  index: number
  content: string
  reason: string
}

export interface ImportErrorItem {
  index: number
  message: string
}

export interface ImportResult {
  bankId?: number | string
  bankName?: string
  successCount: number
  skipCount: number
  failCount: number
  skipped: ImportSkippedItem[]
  errors: ImportErrorItem[]
}

// 试卷
// 字段与后端运行时（PaperResponse）一致：PaperList / PaperDetail / PaperForm 按此消费。
export type PaperStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'
export type PaperShareType = 'PRIVATE' | 'LINK' | 'PASSWORD' | 'PUBLIC'

export interface ExamPaper {
  id: number
  title: string
  description?: string
  creatorId?: number
  creatorName?: string
  status: PaperStatus
  questionCount?: number
  totalScore?: number
  timeLimit?: number | null
  startTime?: string | null
  endTime?: string | null
  attemptType?: string
  attemptLimit?: number | null
  cheatEnabled?: boolean
  shareType: PaperShareType
  password?: string
  graderId?: number | null
  /** 批改人展示名（nickname 优先，后端填充） */
  graderName?: string | null
  questions?: PaperQuestion[]
  createdAt: string
  updatedAt?: string
}

/** 试卷内题目快照（paper detail / 组卷回填用） */
export interface PaperQuestion {
  id: number
  content: string
  type: string
  options?: string | null
  difficulty?: string
  analysis?: string
  score: number
  sortOrder?: number
}

// 考试会话
export type SessionStatus = 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'ABANDONED'

export interface ExamSession {
  id: number
  paperId: number
  paperTitle: string
  userId: number
  username: string
  status: SessionStatus
  score: number
  totalScore: number
  answers: Answer[]
  startTime: string
  endTime: string
  duration: number
  createdAt: string
}

export interface Answer {
  questionId: number
  answer: string
  score: number
  isCorrect: boolean
  comment: string
}

// 练习会话
export interface PracticeSession {
  sessionId: string
  status: string
  currentIndex: number
  totalCount: number
  filterParams?: string
  questions: PracticeQuestion[]
  answers: PracticeAnswer[]
  stats: PracticeStats
}

export interface PracticeQuestion {
  index: number
  type: string
  content: string
  options: string
  answer: string
  analysis: string
  difficulty: string
}

export interface PracticeAnswer {
  questionIndex: number
  questionId: number
  userAnswer: string | null
  isCorrect: boolean | null
}

export interface PracticeStats {
  correctCount: number
  totalCount: number
  accuracy: number
  duration: number
}

/** 练习会话列表项（后端 /practice/sessions 分页返回的精简行） */
export interface PracticeSessionSummary {
  sessionId: string
  status: string
  totalCount: number
  stats?: { accuracy?: number | null; duration?: number | null; correctCount?: number }
  completedAt?: string | null
  createdAt?: string
}

/** 完成练习后返回（与后端 PracticeResultResponse 一致） */
export interface PracticeResult {
  sessionId: string
  correctCount: number
  totalCount: number
  accuracy: number
  duration: number
}

// 错题（与后端 WrongQuestionResponse 一致）
export interface WrongQuestion {
  id: number
  questionId: number
  bankId: number
  bankName: string
  /** 题目快照 JSON 字符串，展开结构见 QuestionSnapshot */
  questionSnapshot: string
  errorCount: number
  lastWrongTime: string
  createdAt: string
}

/** questionSnapshot / question_snapshot JSON 字符串展开后的结构（后端将原题序列化为 JSON 存储） */
export interface QuestionSnapshot {
  id?: number
  bankId?: number
  type?: QuestionType
  content?: string
  options?: string
  answer?: string
  analysis?: string
  difficulty?: Difficulty
}

// 做题记录（与后端 RecordResponse 一致）
export interface PracticeRecord {
  id: number
  questionId: number
  bankId: number
  bankName: string
  questionSnapshot: string
  userAnswer: string | null
  isCorrect: boolean | null
  sourceType: string
  sourceId: number | null
  createdAt: string
}

// 通知
export interface Notification {
  id: number
  type: 'system' | 'exam' | 'grading' | 'collaborator'
  title: string
  content: string
  isRead: boolean
  relatedId: number
  /** 前端跳转链接（路由路径），为空表示无可跳转详情 */
  link?: string | null
  createdAt: string
}

/** 我的考试记录（历史作答会话） */
export interface MyExamSession {
  id: number
  paperId: number
  paperTitle?: string | null
  attemptNumber?: number
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'GRADED' | 'EXPIRED' | 'AUTO_SUBMITTED' | string
  objectiveScore?: number | null
  subjectiveScore?: number | null
  totalScore?: number | null
  startTime?: string | null
  submittedAt?: string | null
}

// 批改
export interface GradingSession {
  id: number
  paperId: number
  paperTitle: string
  userId: number
  username: string
  status: SessionStatus
  score: number
  totalScore: number
  questionCount: number
  gradedCount: number
  createdAt: string
}

// 统计
export interface OverviewStats {
  totalPractices: number
  totalQuestions: number
  correctRate: number
  wrongCount: number
  bankStats: { bankId: number; bankName: string; count: number; correctRate: number }[]
}

export interface QuestionAccuracy {
  type: QuestionType
  total: number
  correct: number
  accuracy: number
}

export interface PaperStatistics {
  paperId: number
  paperTitle: string
  totalSessions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  scoreDistribution: { range: string; count: number }[]
}