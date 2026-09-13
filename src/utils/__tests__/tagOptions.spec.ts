import { describe, it, expect } from 'vitest'
import { buildGroupedTagNameOptions, buildGroupedTagOptions } from '@/utils/tagOptions'
import type { Tag } from '@/types'

function tag(id: string, name: string, groupName?: string | null, usageCount = 0): Tag {
  return { id, name, groupName: groupName ?? null, usageCount, color: '' }
}

/** 收集分组 options 里的叶子项（跳过 type=group 的容器） */
function leaves(options: ReturnType<typeof buildGroupedTagNameOptions>) {
  const out: Array<{ label: string; value: string; group: string }> = []
  for (const opt of options as any[]) {
    if (opt.type === 'group') {
      for (const child of opt.children ?? []) {
        out.push({ label: child.label, value: child.value, group: opt.label })
      }
    } else {
      out.push({ label: opt.label, value: opt.value, group: '' })
    }
  }
  return out
}

describe('buildGroupedTagNameOptions 跨库标签筛选下拉', () => {
  it('option 的 value 取标签名（而非 id）', () => {
    const opts = buildGroupedTagNameOptions([tag('900719925474099301', '导数')])
    expect(leaves(opts)).toEqual([{ label: '导数', value: '导数', group: '未分组' }])
  })

  it('同名标签只保留一条（跨库同名去重，避免下拉重复）', () => {
    // 后端按 usage_count 倒序返回，同名的第一条使用最多 → 保留第一条
    const opts = buildGroupedTagNameOptions([
      tag('1', '导数', null, 10),
      tag('2', '导数', null, 3),
      tag('3', '导数', '微积分', 1)
    ])
    const items = leaves(opts)
    expect(items).toHaveLength(1)
    expect(items[0]).toEqual({ label: '导数', value: '导数', group: '未分组' })
  })

  it('有分组的按组分区、未分组归入「未分组」且排在最后', () => {
    const opts = buildGroupedTagNameOptions([
      tag('1', '极限', null),
      tag('2', '导数', '微积分'),
      tag('3', '积分', '微积分')
    ])
    const groupLabels = (opts as any[]).map((o) => o.label)
    expect(groupLabels).toEqual(['微积分', '未分组'])
    const items = leaves(opts)
    expect(items.filter((i) => i.group === '微积分').map((i) => i.value)).toEqual(['导数', '积分'])
    expect(items.filter((i) => i.group === '未分组').map((i) => i.value)).toEqual(['极限'])
  })

  it('空名与纯空白名被丢弃', () => {
    const opts = buildGroupedTagNameOptions([tag('1', ''), tag('2', '   '), tag('3', '导数')])
    expect(leaves(opts).map((i) => i.value)).toEqual(['导数'])
  })

  it('空列表返回空 options', () => {
    expect(buildGroupedTagNameOptions([])).toEqual([])
  })
})

describe('buildGroupedTagOptions 单题库表单下拉（对照组）', () => {
  it('value 仍为标签 id，且不做同名去重（题库内本就唯一）', () => {
    const opts = buildGroupedTagOptions([tag('11', '导数'), tag('12', '极限')])
    expect(leaves(opts).map((i) => i.value)).toEqual(['11', '12'])
  })
})
