import type { PracticeSessionSummary } from '@/types'

/** 练习会话命名输入：全部字段可空，空值参与降级组合 */
export interface PracticeTitleInput {
  bankNames?: string[] | null
  tagNames?: string[] | null
  totalCount?: number | null
}

/**
 * 练习会话标题：按「题库 · 标签 · 题量 · 随机练习」组合命名。
 *
 * 规则：
 * - 题库：取第一个名称，多个时追加「等N个题库」
 * - 标签：取第一个名称，多个时追加「等N个标签」
 * - 题量：totalCount 有效（>0）时输出「N题」
 * - 各段用「 · 」连接；末尾固定追加「随机练习」类型后缀
 * - 前置内容全部为空时，标题即为「随机练习」
 */
export function buildPracticeSessionTitle(input: PracticeTitleInput): string {
  const bankNames = (input.bankNames ?? []).filter((n) => n && n.trim())
  const tagNames = (input.tagNames ?? []).filter((n) => n && n.trim())
  const count = input.totalCount

  const parts: string[] = []

  if (bankNames.length > 0) {
    const rest = bankNames.length - 1
    parts.push(rest > 0 ? `${bankNames[0]} 等${bankNames.length}个题库` : bankNames[0])
  }

  if (tagNames.length > 0) {
    const rest = tagNames.length - 1
    parts.push(rest > 0 ? `${tagNames[0]} 等${tagNames.length}个标签` : tagNames[0])
  }

  if (count != null && count > 0) {
    parts.push(`${count}题`)
  }

  parts.push('随机练习')

  return parts.join(' · ')
}

/** 便捷重载：直接吃会话列表行 */
export function buildPracticeSessionTitleFromSummary(
  summary: Pick<PracticeSessionSummary, 'bankNames' | 'tagNames' | 'totalCount'>
): string {
  return buildPracticeSessionTitle({
    bankNames: summary.bankNames,
    tagNames: summary.tagNames,
    totalCount: summary.totalCount
  })
}
