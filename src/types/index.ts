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
  email: string
  avatar: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
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

// 标签
export interface Tag {
  id: number
  name: string
  color: string
}

// 题目
export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay'

export type Difficulty = 'easy' | 'medium' | 'hard'

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

// 试卷
export type PaperStatus = 'draft' | 'published' | 'closed'

export interface ExamPaper {
  id: number
  bankId: number
  bankName: string
  title: string
  description: string
  duration: number
  totalScore: number
  status: PaperStatus
  isRandom: boolean
  shuffleOptions: boolean
  showResult: boolean
  needGrader: boolean
  password: string
  maxAttempts: number
  questions: PaperQuestion[]
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface PaperQuestion {
  questionId: number
  score: number
  sort: number
}

// 考试会话
export type SessionStatus = 'in_progress' | 'pending_review' | 'completed' | 'abandoned'

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
  sessionId: number
  status: string
  currentIndex: number
  totalCount: number
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

// 错题
export interface WrongQuestion {
  id: number
  questionId: number
  question: Question
  userId: number
  wrongAnswer: string
  correctAnswer: string
  wrongCount: number
  lastWrongAt: string
  createdAt: string
}

// 做题记录
export interface PracticeRecord {
  id: number
  questionId: number
  question: Question
  answer: string
  isCorrect: boolean
  score: number
  bankName: string
  sessionType: 'exam' | 'practice'
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
  createdAt: string
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