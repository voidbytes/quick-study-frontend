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

// ==================== 填空题多空（占位符【空N】+ 可接受答案组） ====================
// 契约：quick-study/docs/计划/填空题多空扩展方案.md §3.1/§3.2/§3.3（与后端 FillAnswerUtil 同规则）。
// 存储/编辑层用全角占位符【空N】（编号 1..N 连续、≤10），\【空N】 为转义字面量不拆空位；
// answer 为 JSON 嵌套数组（每空一组可接受答案，任一命中即对，空数组=开放空）；
// userAnswer 提交为 JSON 字符串数组（逐位对齐空位，未填存 ""）。

/** 单题空位数上限（与后端 FillAnswerUtil.MAX_BLANKS 一致） */
export const FILL_MAX_BLANKS = 10

/** 题干空位（不含转义字面量）：编号 + 该空前的文本片段 */
export interface FillBlankSegment {
  /** 空位编号（题干中【空N】的 N，从 1 起） */
  no: number
  /** 紧邻该空之前的文本片段（首空前的题干开头等） */
  text: string
}

export interface FillContentParts {
  /** 依次交替的文本片段：parts[i] 与 blank i 相邻，最后一个元素为末空后的剩余文本 */
  parts: string[]
  /** 按出现顺序的空位编号（1..N） */
  blanks: FillBlankSegment[]
}

/** 题干空位解析正则：前面无 \ 的【空N】才计入空位（\【空N】是转义字面量） */
const FILL_BLANK_RE = /(?<!\\)【空(\d+)】/g

/**
 * 拆分题干为文本片段 + 空位序列（跳过 \【空N】 转义；转义符 \ 去除后保留原文）。
 * 纯函数，作答态行内渲染与展示态横线替换共用同一事实源。
 */
export function parseFillBlanks(content: string | null | undefined): FillContentParts {
  const parts: string[] = []
  const blanks: FillBlankSegment[] = []
  if (!content) return { parts: [''], blanks }
  let last = 0
  let m: RegExpExecArray | null
  FILL_BLANK_RE.lastIndex = 0
  while ((m = FILL_BLANK_RE.exec(content)) !== null) {
    parts.push(unescapeFillLiteral(content.slice(last, m.index)))
    blanks.push({ no: Number(m[1]), text: parts[parts.length - 1] })
    last = m.index + m[0].length
  }
  parts.push(unescapeFillLiteral(content.slice(last)))
  return { parts, blanks }
}

/** 去转义：\【空N】→ 字面量【空N】（仅展示用；切片中孤立的尾部 \ 原样保留） */
function unescapeFillLiteral(text: string): string {
  return text.replace(/\\(?=【空\d+】)/g, '')
}

/**
 * 纯展示态渲染：【空N】替换为行内横线段。
 * 横线用 <u>　　</u>（全角空格撑宽 + HTML 下划线）而非 ____ 文本：
 * markdown-it 中单独成行的 ____ 会被误解析为 hr（实测验证），<u> 不会；
 * html:true 管线透传 <u>，DOMPurify USE_PROFILES html 放行，无 XSS 面。
 */
export function renderFillContent(content: string | null | undefined): string {
  if (!content) return ''
  return parseFillBlanks(content).parts
    .reduce((acc, part, i) => (i === 0 ? part : `${acc}<u>　　</u>${part}`), '')
}

/**
 * 归一化 answer 为嵌套数组形态（三形态容错，与后端 FillAnswerUtil.parseAnswer 同规则）：
 * - 嵌套数组（现状）→ 原样；
 * - 单层数组（旧格式）→ 每空单答案 [["a"],["b"]]；
 * - 纯文本 → 单空单答案 [["text"]]；null/非法 JSON → []（无空）。
 */
export function parseFillAnswer(answer: string | null | undefined): string[][] {
  if (!answer) return []
  const trimmed = answer.trim()
  if (!trimmed.startsWith('[')) return trimmed ? [[trimmed]] : []
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return [[trimmed]]
  }
  if (!Array.isArray(parsed)) return [[trimmed]]
  if (parsed.length === 0) return []
  // 单层数组（元素为字符串）→ 每空单答案；嵌套 → 原样（组内逐项取字符串）
  if (parsed.every((item) => typeof item === 'string')) {
    return (parsed as string[]).map((s) => [s])
  }
  return parsed.map((group) =>
    Array.isArray(group)
      ? group.filter((s): s is string => typeof s === 'string')
      : typeof group === 'string'
        ? [group]
        : []
  )
}

/**
 * 答案组展示：① color/Color ② #fff ③（开放）。
 * 组内用 / 连接（任一命中即对），空数组=开放空；answer 为空返回 ''（无答案）。
 */
export function formatFillAnswer(answer: string | null | undefined): string {
  const groups = parseFillAnswer(answer)
  if (!groups.length) return ''
  return groups
    .map((g, i) => `${'①②③④⑤⑥⑦⑧⑨⑩'[i] ?? `${i + 1}.`} ${g.length ? g.join('/') : '（开放）'}`)
    .join(' ')
}

/**
 * 匹配归一化（与后端 FillAnswerUtil.normalizeForMatch 同规则，仅前端本地预判展示用）：
 * 全角空格→半角 → trim → 连续空白折叠为单空格；大小写不动（敏感是既定决策）。
 */
export function normalizeForMatch(s: string): string {
  return s.replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ')
}

/** 组内任一答案命中（精确或空白归一化后相等）；空组=开放空，不在此裁决，恒 false */
export function matchFillBlank(acceptedGroup: string[], userAnswer: string): boolean {
  if (!acceptedGroup.length) return false
  const input = normalizeForMatch(userAnswer)
  return acceptedGroup.some((a) => a === userAnswer || normalizeForMatch(a) === input)
}

/**
 * 逐空判分（本地预览用，权威判分在后端）：hit[i]=true 确定性命中；
 * false=未命中或开放空。user 不足位数按 ''（未作答）计。
 */
export function gradeFillBlanks(correct: string[][], user: string[]): boolean[] {
  return correct.map((group, i) => matchFillBlank(group, user[i] ?? ''))
}

/**
 * 保存前结构校验（与后端 FillAnswerUtil.validate 同门禁，给即时反馈）：
 * 编号必须 1..N 连续、N≤10、答案组数=空位数。返回首个错误的中文原因，null=通过。
 */
export function validateFillQuestion(
  content: string | null | undefined,
  answerGroups: string[][]
): string | null {
  const nos = parseFillBlanks(content).blanks.map((b) => b.no)
  if (nos.length === 0) return '题干中未插入空位（【空N】）'
  if (nos.length > FILL_MAX_BLANKS) return `空位数不能超过 ${FILL_MAX_BLANKS} 个`
  for (let i = 0; i < nos.length; i++) {
    if (nos[i] !== i + 1) {
      return `空位编号必须从 1 起连续，当前为 ${nos.join('、')}`
    }
  }
  if (answerGroups.length !== nos.length) {
    return `空位数为 ${nos.length}，答案组为 ${answerGroups.length} 组，数量不一致`
  }
  return null
}

/** 序列化嵌套答案组 → JSON 字符串（建题/改题统一物化为嵌套数组落库） */
export function formatFillAnswerJson(groups: string[][]): string {
  return JSON.stringify(groups)
}

// ==================== 选项答案 id 模型 ====================

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
