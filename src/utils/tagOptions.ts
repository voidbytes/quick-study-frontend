import type { Tag } from '@/types'
import type { SelectOption } from 'naive-ui'

/**
 * 标签列表 → Naive UI 分组 options。
 *
 * 层级只做导航辅助：有组的标签按组分区展示，未分组归入"未分组"分区放最后；
 * option 的 value 仍是标签 id，筛选语义（标签多选）完全不变。
 */
export function buildGroupedTagOptions(tags: Tag[]): SelectOption[] {
  const groups = new Map<string, SelectOption[]>()
  const ungrouped: SelectOption[] = []
  for (const t of tags) {
    const opt: SelectOption = { label: t.name, value: t.id }
    if (t.groupName) {
      if (!groups.has(t.groupName)) groups.set(t.groupName, [])
      groups.get(t.groupName)!.push(opt)
    } else {
      ungrouped.push(opt)
    }
  }
  const result: SelectOption[] = []
  for (const [label, children] of groups) {
    result.push({ type: 'group', label, key: `tag-group-${label}`, children })
  }
  if (ungrouped.length > 0) {
    result.push({ type: 'group', label: '未分组', key: 'tag-group-ungrouped', children: ungrouped })
  }
  return result
}

/**
 * 标签列表 → 按「标签名」取值的分组 options（跨题库筛选专用）。
 *
 * 标签作用域为单题库、跨库允许同名；跨库筛选时必须<b>按名去重</b>，
 * 否则同名标签会在下拉里重复出现、给用户造成歧义。同名的多条只保留第一条
 * （后端按 usage_count 倒序返回，即保留使用最多的那条），option 的 value 为标签名，
 * 由后端按名做 AND 筛选。
 */
export function buildGroupedTagNameOptions(tags: Tag[]): SelectOption[] {
  const seen = new Set<string>()
  const deduped: Tag[] = []
  for (const t of tags) {
    const name = (t.name || '').trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    deduped.push({ ...t, name })
  }

  const groups = new Map<string, SelectOption[]>()
  const ungrouped: SelectOption[] = []
  for (const t of deduped) {
    const opt: SelectOption = { label: t.name, value: t.name }
    if (t.groupName) {
      if (!groups.has(t.groupName)) groups.set(t.groupName, [])
      groups.get(t.groupName)!.push(opt)
    } else {
      ungrouped.push(opt)
    }
  }

  const result: SelectOption[] = []
  for (const [label, children] of groups) {
    result.push({ type: 'group', label, key: `tag-group-${label}`, children })
  }
  if (ungrouped.length > 0) {
    result.push({ type: 'group', label: '未分组', key: 'tag-group-ungrouped', children: ungrouped })
  }
  return result
}
