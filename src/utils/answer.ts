/**
 * 选项答案 id 模型工具（与后端 option_id 模型对齐）。
 * 设计文档：quick-study/docs/计划/选项答案下标化改造方案.md §8（前后端契约）。
 *
 * 核心约定：
 * - options：[{ id, text }] 对象数组（id 为数组内编号，从 0 起，乱序时随对象移动；
 *   展示字母 A/B/C 由前端按当前展示顺序临时生成，不落库）
 * - answer / userAnswer（选择题型）：option_id JSON 数组字符串（升序，如 "[1]" / "[0,2]"）；
 *   判断题 "[0]"=正确 / "[1]"=错误；填空/简答为纯文本；编程题为空
 * - HTTP 接口的 options 为对象数组；快照/审核等存储字段为 JSON 字符串——本工具统一收敛
 */
import type { OptionItem } from '@/types'

export type { OptionItem } from '@/types'

/** 判断题固定选项 id：0=正确 / 1=错误（与后端 AnswerIdUtil 常量一致） */
export const TRUE_FALSE_TRUE_ID = 0
export const TRUE_FALSE_FALSE_ID = 1

/** 展示字母（临时序号，按当前展示顺序生成，A-Z，上限与后端 MAX_OPTIONS=26 对齐） */
export function optionMarker(index: number): string {
  return String.fromCharCode(65 + index)
}

/**
 * 选项按 id 升序排列（题库原序）：快照乱序仅用于作答态防背题，
 * 反馈/解析态必须回落原序——解析文本按存库字母（id 0=A, 1=B…）书写，
 * 乱序展示会让「解析说 A」与眼前 A 选项错位。
 */
export function sortOptionsById(options: OptionItem[]): OptionItem[] {
  return [...options].sort((a, b) => a.id - b.id)
}

/**
 * 解析 options 为 OptionItem[]（宽容三形态：对象数组 / JSON 字符串 / null）。
 * 同时兼容 text（新模型）与 content/value（历史字段名）作为文本来源。
 */
export function parseOptionList(raw: unknown): OptionItem[] {
  if (!raw) return []
  let list: unknown = raw
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(list)) return []
  return list
    .map((item): OptionItem | null => {
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>
        const id = typeof rec.id === 'number' ? rec.id : Number(rec.id)
        const text =
          typeof rec.text === 'string'
            ? rec.text
            : typeof rec.content === 'string'
              ? rec.content
              : ''
        return Number.isFinite(id) && id >= 0 ? { id, text } : null
      }
      return null
    })
    .filter((o): o is OptionItem => o !== null)
}

/** 解析选择题型 answer / userAnswer 为升序 id 数组；非 JSON 数组格式（填空/简答文本等）返回 [] */
export function parseAnswerIds(answer: string | null | undefined): number[] {
  if (!answer) return []
  const trimmed = answer.trim()
  if (!trimmed.startsWith('[')) return []
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((n) => (typeof n === 'number' ? n : Number(n)))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)
  } catch {
    return []
  }
}

/** 序列化 id 数组 → 升序 JSON 数组字符串（提交/落库统一格式，如 [2,0] → "[0,2]"） */
export function formatAnswerIds(ids: number[]): string {
  return JSON.stringify([...ids].sort((a, b) => a - b))
}

/** id 在展示序列中的下标；不存在返回 -1 */
export function idToIndex(options: OptionItem[], id: number): number {
  return options.findIndex((o) => o.id === id)
}

/** id → 展示字母（按选项在展示序列中的位置）；找不到返回 null */
export function idToMarker(options: OptionItem[], id: number): string | null {
  const idx = idToIndex(options, id)
  return idx >= 0 ? optionMarker(idx) : null
}

/** id 数组 → 展示字母串（如 "A" / "A、C"，按 id 升序）；选项缺失时回退 id 数字 */
export function answerIdsToLabel(options: OptionItem[], answer: string | null | undefined): string {
  const ids = parseAnswerIds(answer)
  if (!ids.length) return answer || ''
  return ids
    .slice()
    .sort((a, b) => a - b)
    .map((id) => idToMarker(options, id) ?? String(id))
    .join('、')
}

/** 判断题 answer → 文案（"[0]"=正确 / "[1]"=错误；无法识别时原样返回） */
export function formatTrueFalse(answer: string | null | undefined): string {
  const ids = parseAnswerIds(answer)
  if (ids.length === 1) {
    return ids[0] === TRUE_FALSE_TRUE_ID ? '正确' : '错误'
  }
  return answer || ''
}

/**
 * 通用答案展示：判断题转文案；选择题 id 数组转展示字母（需 options，缺失回退原文）；
 * 填空/简答等文本题型原样。
 */
export function formatAnswerView(
  answer: string | null | undefined,
  type: string | null | undefined,
  options?: OptionItem[]
): string {
  if (!answer) return ''
  if (type === 'TRUE_FALSE') return formatTrueFalse(answer)
  if (type === 'SINGLE' || type === 'MULTIPLE') {
    return options && options.length ? answerIdsToLabel(options, answer) : answer
  }
  return answer
}

/** id 集合相等比较（多选判分语义：与顺序无关；空集不相等由调用方保证非空） */
export function sameIdSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const bs = new Set(b)
  return a.every((id) => bs.has(id))
}
