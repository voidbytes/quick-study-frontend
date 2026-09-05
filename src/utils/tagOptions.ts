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
