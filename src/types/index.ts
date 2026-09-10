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

// ============ 雪花 id 约定 ============
// 后端主键均为雪花 long，JacksonConfig 全局序列化为字符串；前端全链路用 string 承载，
// 禁止 Number() 转换（超 2^53 丢精度）。例外：OptionItem.id / 答案数组里的 id 是
// 选项序号（0 起小整数），恒定 number。

// 用户
export interface User {
  id: string
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
  id: string
  name: string
  description: string
  cover: string
  /** 创建者ID（后端 BankResponse 字段名） */
  creatorId?: string
  userId: string
  username: string
  isPublic: boolean
  questionCount: number
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

/** 题库协作人（与 User 不同：用 userId 而非 id） */
export interface BankCollaborator {
  userId: string
  nickname?: string
  username?: string
  role: 'OWNER' | 'EDITOR' | 'REVIEWER' | 'VIEWER' | string
}

// 标签
export interface Tag {
  /** 雪花 long：后端 Jackson 序列化为字符串，前端禁止 Number() 转换（超 2^53 丢精度） */
  id: string
  name: string
  /** 标签分组名（可空，仅展示层聚合导航用，不参与筛选语义） */
  groupName?: string | null
  /** 使用次数（后端返回，管理弹窗展示用） */
  usageCount?: number
  color: string
}

// 题目
// 与后端运行时一致的大写枚举（历史上此处曾误写为小写，导致三套枚举并存）
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER' | 'PROGRAMMING'

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface Question {
  id: string
  bankId: string
  bankName: string
  type: QuestionType
  difficulty: Difficulty
  content: string
  /** 选项对象数组（id 为稳定标识，从 0 起；answer 引用 id） */
  options: OptionItem[]
  /**
   * 答案（option_id 模型，按题型分治）：
   * 选择题 = id JSON 数组字符串（"[1]"/"[0,2]"，判断题 "[0]"正确/"[1]"错误）；
   * 填空/简答 = 文本（简答参考答案并入本字段）；编程题 = null
   */
  answer: string | null
  analysis: string
  score: number
  sort: number
  status: string
  tags: Tag[]
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

/** 选项值对象（与后端 OptionItem 一致）：id 稳定标识（0 起），text 纯文本无字母前缀 */
export interface OptionItem {
  /** 选项序号（0=A, 1=B…，小整数非雪花），answer 引用它；保持不变 number */
  id: number
  text: string
}

// ============ 导入导出（题库/题目）============

/**
 * 单题交换结构（与后端 importexport 模块 QuestionExportItem 对应，option_id 模型）。
 * options 为 JSON 字符串 "[{"id":0,"text":"..."}]"；answer：选择题=id JSON 数组
 * （"[1]"/"[0,2]"）、判断题="[0]"/"[1]"、填空=文本、简答=参考答案文本、编程=null。
 */
export interface QuestionExportItem {
  type: QuestionType
  content: string
  options?: string | null
  answer: string | null
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
  /** 雪花 id 字符串（后端序列化） */
  bankId?: string
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
  id: string
  title: string
  description?: string
  creatorId?: string
  creatorName?: string
  status: PaperStatus
  questionCount?: number
  totalScore?: number
  /** 及格线（得分率百分比，1-100，默认 60） */
  passPercent?: number
  timeLimit?: number | null
  startTime?: string | null
  endTime?: string | null
  attemptType?: string
  attemptLimit?: number | null
  cheatEnabled?: boolean
  shareType: PaperShareType
  password?: string
  graderId?: string | null
  /** 批改人展示名（nickname 优先，后端填充） */
  graderName?: string | null
  questions?: PaperQuestion[]
  createdAt: string
  updatedAt?: string
}

/** 试卷内题目快照（paper detail / 组卷回填用） */
export interface PaperQuestion {
  /** 题目雪花 id，选中回填时以字符串匹配题单 */
  id: string
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
  id: string
  paperId: string
  paperTitle: string
  userId: string
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
  questionId: string
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
  /** 题目 ID（字符串序列化；笔记等按题引用的功能使用） */
  id?: string
  type: string
  content: string
  /** OptionItem JSON 字符串或对象数组（成卷快照，乱序后顺序） */
  options: string | OptionItem[] | null
  /** 选择题=id JSON 数组字符串（"[1]"/"[0,2]"，判断题 "[0]"/"[1]"）；填空/简答=文本；编程=null */
  answer: string | null
  analysis: string
  difficulty: string
}

export interface PracticeAnswer {
  questionIndex: number
  questionId: string
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
  /** 会话标题（后端创建时拼装落库；旧数据可能为空，为空时降级前端拼装） */
  title?: string | null
  /** 命名摘要：题库/标签名称与题型（后端解析 filterParams） */
  bankNames?: string[]
  tagNames?: string[]
  types?: string[]
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

// 收藏（等待后端 FavoriteController — 以下为前端约定契约）
export interface FavoriteItem {
  id: string
  questionId: string
  bankId: string
  bankName: string
  /** 题目快照 JSON 字符串，展开结构见 QuestionSnapshot */
  questionSnapshot: string
  /** 关联的标签名（后端可返回或前端按 tagIds 反查） */
  tagNames?: string[]
  favoritedAt: string
  createdAt: string
}

export interface FavoriteStats {
  total: number
  thisWeekNew: number
  thisMonthPractice: number
  toReview: number
}

// 错题（与后端 WrongQuestionResponse 一致）
export interface WrongQuestion {
  id: string
  questionId: string
  bankId: string
  bankName: string
  /** 题目快照 JSON 字符串，展开结构见 QuestionSnapshot */
  questionSnapshot: string
  errorCount: number
  lastWrongTime: string
  createdAt: string
}

/** questionSnapshot / question_snapshot JSON 字符串展开后的结构（成卷快照，option_id 模型） */
export interface QuestionSnapshot {
  id?: string
  bankId?: string
  type?: QuestionType
  content?: string
  /** OptionItem JSON 字符串或对象数组 */
  options?: string | OptionItem[] | null
  /** 选择题=id JSON 数组字符串；填空/简答=文本；编程=null */
  answer?: string | null
  analysis?: string
  difficulty?: Difficulty
}

// 做题记录（与后端 RecordResponse 一致）
export interface PracticeRecord {
  id: string
  questionId: string
  bankId: string
  bankName: string
  questionSnapshot: string
  userAnswer: string | null
  isCorrect: boolean | null
  sourceType: string
  sourceId: string | null
  createdAt: string
}

// 通知
export interface Notification {
  id: string
  type: 'system' | 'exam' | 'grading' | 'collaborator'
  title: string
  content: string
  isRead: boolean
  relatedId: string
  /** 前端跳转链接（路由路径），为空表示无可跳转详情 */
  link?: string | null
  createdAt: string
}

/** 我的考试记录（历史作答会话） */
export interface MyExamSession {
  id: string
  paperId: string
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
  id: string
  paperId: string
  paperTitle: string
  userId: string
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
  bankStats: { bankId: string; bankName: string; count: number; correctRate: number }[]
}

export interface QuestionAccuracy {
  type: QuestionType
  total: number
  correct: number
  accuracy: number
}

export interface PaperStatistics {
  paperId: string
  paperTitle: string
  totalSessions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  scoreDistribution: { range: string; count: number }[]
}