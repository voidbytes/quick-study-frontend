import { describe, expect, it } from 'vitest'
import { buildPracticeSessionTitle } from '../practiceTitle'

describe('buildPracticeSessionTitle 练习会话命名', () => {
  it('题库+标签+题量齐全，末尾带随机练习后缀', () => {
    expect(
      buildPracticeSessionTitle({
        bankNames: ['Java 基础题库'],
        tagNames: ['集合'],
        totalCount: 20
      })
    ).toBe('Java 基础题库 · 集合 · 20题 · 随机练习')
  })

  it('多个题库取第一个并标注数量', () => {
    expect(
      buildPracticeSessionTitle({
        bankNames: ['Java', '数据结构', '数学'],
        tagNames: [],
        totalCount: 30
      })
    ).toBe('Java 等3个题库 · 30题 · 随机练习')
  })

  it('多个标签取第一个并标注数量', () => {
    expect(
      buildPracticeSessionTitle({
        bankNames: ['Java'],
        tagNames: ['集合', '并发', 'jvm'],
        totalCount: 50
      })
    ).toBe('Java · 集合 等3个标签 · 50题 · 随机练习')
  })

  it('仅有题量', () => {
    expect(buildPracticeSessionTitle({ totalCount: 10 })).toBe('10题 · 随机练习')
  })

  it('仅有题库', () => {
    expect(buildPracticeSessionTitle({ bankNames: ['高等数学'] })).toBe('高等数学 · 随机练习')
  })

  it('题库/标签为空数组时降级为题量', () => {
    expect(buildPracticeSessionTitle({ bankNames: [], tagNames: [], totalCount: 15 })).toBe(
      '15题 · 随机练习'
    )
  })

  it('题量为 0 或 null 时不输出题量段', () => {
    expect(buildPracticeSessionTitle({ bankNames: ['Java'], totalCount: 0 })).toBe(
      'Java · 随机练习'
    )
    expect(buildPracticeSessionTitle({ bankNames: ['Java'], totalCount: null })).toBe(
      'Java · 随机练习'
    )
    expect(buildPracticeSessionTitle({ bankNames: ['Java'], totalCount: undefined })).toBe(
      'Java · 随机练习'
    )
  })

  it('前置内容全部为空时标题即为「随机练习」', () => {
    expect(buildPracticeSessionTitle({})).toBe('随机练习')
    expect(buildPracticeSessionTitle({ bankNames: [], tagNames: [], totalCount: 0 })).toBe(
      '随机练习'
    )
    expect(buildPracticeSessionTitle({ bankNames: null, tagNames: null, totalCount: null })).toBe(
      '随机练习'
    )
  })

  it('名称为空白字符串时按空处理', () => {
    expect(
      buildPracticeSessionTitle({ bankNames: ['  '], tagNames: [''], totalCount: 5 })
    ).toBe('5题 · 随机练习')
  })

  it('未定义输入全部字段时安全回退', () => {
    expect(
      buildPracticeSessionTitle({
        bankNames: undefined,
        tagNames: undefined,
        totalCount: undefined
      })
    ).toBe('随机练习')
  })
})
