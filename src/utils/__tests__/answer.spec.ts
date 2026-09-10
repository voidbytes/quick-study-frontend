import { describe, it, expect } from 'vitest'
import {
  parseOptionList,
  parseAnswerIds,
  formatAnswerIds,
  formatAnswerView,
  answerIdsToLabel,
  sameIdSet,
  optionMarker,
  idToMarker,
  sortOptionsById,
  TRUE_FALSE_TRUE_ID,
  TRUE_FALSE_FALSE_ID
} from '../answer'
import type { OptionItem } from '@/types'

describe('parseOptionList', () => {
  it('解析对象数组', () => {
    const raw: OptionItem[] = [
      { id: 0, text: '选项一' },
      { id: 1, text: '选项二' }
    ]
    expect(parseOptionList(raw)).toEqual(raw)
  })

  it('解析 JSON 字符串（快照/审核存储格式）', () => {
    const raw = '[{"id":0,"text":"A内容"},{"id":1,"text":"B内容"}]'
    expect(parseOptionList(raw)).toEqual([
      { id: 0, text: 'A内容' },
      { id: 1, text: 'B内容' }
    ])
  })

  it('兼容历史字段名 content 作为文本来源', () => {
    const raw = '[{"id":0,"content":"旧内容"}]'
    expect(parseOptionList(raw)).toEqual([{ id: 0, text: '旧内容' }])
  })

  it('null/空/非法输入返回空数组', () => {
    expect(parseOptionList(null)).toEqual([])
    expect(parseOptionList(undefined)).toEqual([])
    expect(parseOptionList('')).toEqual([])
    expect(parseOptionList('not json')).toEqual([])
    expect(parseOptionList('{"a":1}')).toEqual([])
  })

  it('过滤非法项（缺 id / 负数 id）', () => {
    const raw = [
      { id: 0, text: 'ok' },
      { text: '无id' },
      { id: -1, text: '负数' },
      '裸字符串'
    ]
    expect(parseOptionList(raw)).toEqual([{ id: 0, text: 'ok' }])
  })
})

describe('parseAnswerIds / formatAnswerIds', () => {
  it('解析 id JSON 数组并升序排列', () => {
    expect(parseAnswerIds('[2,0]')).toEqual([0, 2])
    expect(parseAnswerIds('[1]')).toEqual([1])
    expect(parseAnswerIds('[0]')).toEqual([0])
  })

  it('非数组格式返回空（填空/简答文本、编程 null）', () => {
    expect(parseAnswerIds('参考答案文本')).toEqual([])
    expect(parseAnswerIds(null)).toEqual([])
    expect(parseAnswerIds('')).toEqual([])
    expect(parseAnswerIds('[abc]')).toEqual([])
  })

  it('序列化为升序 JSON 数组', () => {
    expect(formatAnswerIds([2, 0])).toBe('[0,2]')
    expect(formatAnswerIds([1])).toBe('[1]')
    expect(formatAnswerIds([TRUE_FALSE_TRUE_ID])).toBe('[0]')
    expect(formatAnswerIds([TRUE_FALSE_FALSE_ID])).toBe('[1]')
  })

  it('parse ↔ format 往返一致', () => {
    const ids = [3, 1, 2]
    expect(parseAnswerIds(formatAnswerIds(ids))).toEqual([1, 2, 3])
  })
})

describe('展示字母映射', () => {
  const options: OptionItem[] = [
    { id: 2, text: '乱序第一' },
    { id: 0, text: '乱序第二' },
    { id: 1, text: '乱序第三' }
  ]

  it('optionMarker 按展示顺序生成字母', () => {
    expect(optionMarker(0)).toBe('A')
    expect(optionMarker(2)).toBe('C')
  })

  it('idToMarker 按 id 找展示位（乱序时字母≠id）', () => {
    expect(idToMarker(options, 2)).toBe('A') // id=2 排在展示第一位
    expect(idToMarker(options, 0)).toBe('B')
    expect(idToMarker(options, 9)).toBeNull()
  })

  it('answerIdsToLabel：id → 展示字母串（字母按 id 升序，但字母对应乱序后的展示位）', () => {
    expect(answerIdsToLabel(options, '[1]')).toBe('C')
    // id 0 在展示位 B、id 2 在展示位 A；按 id 升序输出 → B、A（乱序模型下字母允许乱序）
    expect(answerIdsToLabel(options, '[0,2]')).toBe('B、A')
  })

  it('answerIdsToLabel：id 越界回退数字，非数组格式原样', () => {
    expect(answerIdsToLabel(options, '[9]')).toBe('9')
    expect(answerIdsToLabel(options, '纯文本')).toBe('纯文本')
    expect(answerIdsToLabel(options, null)).toBe('')
  })
})

describe('formatAnswerView', () => {
  const options: OptionItem[] = [
    { id: 0, text: '北京' },
    { id: 1, text: '上海' }
  ]

  it('判断题 [0]/[1] 转文案', () => {
    expect(formatAnswerView('[0]', 'TRUE_FALSE')).toBe('正确')
    expect(formatAnswerView('[1]', 'TRUE_FALSE')).toBe('错误')
  })

  it('选择题转展示字母（依赖 options）', () => {
    expect(formatAnswerView('[1]', 'SINGLE', options)).toBe('B')
    expect(formatAnswerView('[0,1]', 'MULTIPLE', options)).toBe('A、B')
  })

  it('选择题无 options 回退原文', () => {
    expect(formatAnswerView('[0,2]', 'SINGLE')).toBe('[0,2]')
  })

  it('文本题型原样', () => {
    expect(formatAnswerView('TCP 是面向连接的', 'FILL_BLANK')).toBe('TCP 是面向连接的')
    expect(formatAnswerView('要点一；要点二', 'SHORT_ANSWER')).toBe('要点一；要点二')
  })
})

describe('sortOptionsById', () => {
  it('按 id 升序回落题库原序（解析文本按存库字母书写，字母须与之一致）', () => {
    const shuffled: OptionItem[] = [
      { id: 2, text: 'C内容' },
      { id: 0, text: 'A内容' },
      { id: 1, text: 'B内容' }
    ]
    expect(sortOptionsById(shuffled)).toEqual([
      { id: 0, text: 'A内容' },
      { id: 1, text: 'B内容' },
      { id: 2, text: 'C内容' }
    ])
  })

  it('不改动入参数组（纯函数）', () => {
    const shuffled: OptionItem[] = [{ id: 1, text: 'x' }, { id: 0, text: 'y' }]
    sortOptionsById(shuffled)
    expect(shuffled.map((o) => o.id)).toEqual([1, 0])
  })

  it('空数组与已序数组原样', () => {
    expect(sortOptionsById([])).toEqual([])
    expect(sortOptionsById([{ id: 0, text: 'a' }])).toEqual([{ id: 0, text: 'a' }])
  })
})

describe('sameIdSet', () => {
  it('集合相等与顺序无关', () => {
    expect(sameIdSet([0, 2], [2, 0])).toBe(true)
    expect(sameIdSet([1], [1])).toBe(true)
  })

  it('空集/元素不同/长度不同不等', () => {
    expect(sameIdSet([], [])).toBe(true)
    expect(sameIdSet([0], [])).toBe(false)
    expect(sameIdSet([0, 1], [0, 2])).toBe(false)
    expect(sameIdSet([0, 1, 2], [0, 1])).toBe(false)
  })
})
