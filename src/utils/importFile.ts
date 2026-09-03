import type { QuestionExportItem } from '@/types'

/**
 * 导入文件的前端解析与预览工具。
 * 与后端校验保持一致：format 必须为 quick-study-bank / quick-study-questions，
 * 且必须含 questions 数组。
 */
export interface ParsedImportFile {
  format: 'quick-study-bank' | 'quick-study-questions'
  /** 题库文件：题库名称 */
  bankName?: string
  /** 题库文件：描述 */
  bankDescription?: string
  questionCount: number
  tagCount: number
  questions: QuestionExportItem[]
}

interface RawImportFile {
  format?: string
  bank?: { name?: string; description?: string }
  questions?: unknown[]
}

export async function parseImportFile(file: File): Promise<ParsedImportFile> {
  let json: RawImportFile
  try {
    json = JSON.parse(await file.text()) as RawImportFile
  } catch {
    throw new Error('文件不是有效的 JSON，请选择本系统导出的 JSON 文件')
  }

  const format = json?.format
  if (format !== 'quick-study-bank' && format !== 'quick-study-questions') {
    throw new Error('无法识别的文件类型，请选择本系统导出的题库/题目 JSON 文件')
  }
  if (!Array.isArray(json?.questions)) {
    throw new Error('文件缺少题目列表 questions，请使用本系统导出的 JSON 文件')
  }

  const tagCount = (json.questions as QuestionExportItem[]).reduce(
    (sum, q) => sum + (q.tags?.length ?? 0),
    0
  )
  return {
    format,
    bankName: format === 'quick-study-bank' ? json.bank?.name : undefined,
    bankDescription: format === 'quick-study-bank' ? json.bank?.description : undefined,
    questionCount: json.questions.length,
    tagCount,
    questions: json.questions as QuestionExportItem[]
  }
}
