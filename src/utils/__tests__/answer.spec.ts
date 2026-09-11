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
  TRUE_FALSE_FALSE_ID,
  parseFillBlanks,
  renderFillContent,
  parseFillAnswer,
  formatFillAnswer,
  normalizeForMatch,
  matchFillBlank,
  gradeFillBlanks,
  validateFillQuestion,
  formatFillAnswerJson,
  FILL_MAX_BLANKS
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

// ==================== 填空题多空（占位符/转义/答案组） ====================

describe('parseFillBlanks', () => {
  it('拆分片段与空位（单空）', () => {
    const { parts, blanks } = parseFillBlanks('Java 中【空1】是面向对象语言')
    expect(parts).toEqual(['Java 中', '是面向对象语言'])
    expect(blanks).toEqual([{ no: 1, text: 'Java 中' }])
  })

  it('多空按顺序解析，编号保留', () => {
    const { parts, blanks } = parseFillBlanks('a【空1】b【空2】c')
    expect(parts).toEqual(['a', 'b', 'c'])
    expect(blanks.map((b) => b.no)).toEqual([1, 2])
  })

  it('\\【空N】转义字面量不拆空位且去除反斜杠', () => {
    const { parts, blanks } = parseFillBlanks('写作 \\【空1】 是字面量，真实空位【空1】在此')
    expect(blanks.map((b) => b.no)).toEqual([1])
    // 转义符 \ 被去除，字面量原样保留
    expect(parts[0]).toContain('【空1】')
    expect(parts[0]).not.toContain('\\')
  })

  it('无空位：单一片段、空空位数组', () => {
    const { parts, blanks } = parseFillBlanks('没有空位的题干')
    expect(parts).toEqual(['没有空位的题干'])
    expect(blanks).toEqual([])
  })

  it('空/null 内容兜底', () => {
    expect(parseFillBlanks('')).toEqual({ parts: [''], blanks: [] })
    expect(parseFillBlanks(null)).toEqual({ parts: [''], blanks: [] })
    expect(parseFillBlanks(undefined)).toEqual({ parts: [''], blanks: [] })
  })

  it('开头即空位 / 结尾即空位', () => {
    const head = parseFillBlanks('【空1】尾部')
    expect(head.parts).toEqual(['', '尾部'])
    const tail = parseFillBlanks('开头【空1】')
    expect(tail.parts).toEqual(['开头', ''])
  })

  it('代码内容不受影响（{1}、[1]、{{x}} 等非占位符语法）', () => {
    const { blanks } = parseFillBlanks('new int[]{1} 与 {{ x }} 与 arr[1]')
    expect(blanks).toEqual([])
  })
})

describe('renderFillContent', () => {
  it('【空N】替换为行内横线段（<u>）', () => {
    const html = renderFillContent('Java 中【空1】是面向对象语言，三大特性是【空2】、【空3】')
    expect(html).toBe('Java 中<u>　　</u>是面向对象语言，三大特性是<u>　　</u>、<u>　　</u>')
    expect(html).not.toContain('【空')
  })

  it('转义字面量保留展示且不生成横线', () => {
    const html = renderFillContent('字面量 \\【空1】 与真实空【空1】')
    expect(html).toContain('【空1】')
    expect(html).toContain('<u>　　</u>')
    // 仅 1 条横线（字面量不拆空）
    expect(html.match(/<u>/g)?.length).toBe(1)
  })

  it('无空位原样返回', () => {
    expect(renderFillContent('纯题干')).toBe('纯题干')
    expect(renderFillContent('')).toBe('')
    expect(renderFillContent(null)).toBe('')
  })

  it('行内横线进 markdown-it 不被误解析为 hr（____ 单独成行会变 <hr>，<u> 不会）', async () => {
    const { renderRichTextContent } = await import('../richText')
    const content = renderFillContent('题干第一行\n【空1】\n第二行')
    const html = renderRichTextContent(content)
    expect(html).toContain('<u>')
    expect(html).not.toContain('<hr')
  })
})

describe('parseFillAnswer（三形态归一化）', () => {
  it('嵌套数组原样', () => {
    const raw = '[["color","Color"],["#fff"],[]]'
    expect(parseFillAnswer(raw)).toEqual([['color', 'Color'], ['#fff'], []])
  })

  it('单层数组（旧格式）→ 每空单答案', () => {
    expect(parseFillAnswer('["a","b"]')).toEqual([['a'], ['b']])
    expect(parseFillAnswer('["color"]')).toEqual([['color']])
  })

  it('纯文本（旧格式）→ 单空单答案', () => {
    expect(parseFillAnswer('TCP')).toEqual([['TCP']])
    expect(parseFillAnswer('参考答案文本')).toEqual([['参考答案文本']])
  })

  it('空/非法输入返回空数组', () => {
    expect(parseFillAnswer('')).toEqual([])
    expect(parseFillAnswer(null)).toEqual([])
    expect(parseFillAnswer(undefined)).toEqual([])
  })

  it('空 JSON 数组 → 无空', () => {
    expect(parseFillAnswer('[]')).toEqual([])
  })

  it('嵌套数组内混入非字符串项被过滤', () => {
    expect(parseFillAnswer('[["a",1,null],["b"]]')).toEqual([['a'], ['b']])
  })
})

describe('formatFillAnswer', () => {
  it('① 编号 + 组内 / 连接 + 开放空（开放）', () => {
    expect(formatFillAnswer('[["color","Color"],["#fff"],[]]'))
      .toBe('① color/Color ② #fff ③ （开放）')
  })

  it('单空纯文本旧格式', () => {
    expect(formatFillAnswer('TCP')).toBe('① TCP')
  })

  it('超 10 空回退 N. 编号', () => {
    const groups = Array.from({ length: 11 }, (_, i) => [`v${i + 1}`])
    expect(formatFillAnswer(JSON.stringify(groups))).toContain('11. v11')
  })

  it('空答案返回空串', () => {
    expect(formatFillAnswer('')).toBe('')
    expect(formatFillAnswer(null)).toBe('')
  })
})

describe('normalizeForMatch / matchFillBlank', () => {
  it('全角空格→半角、trim、连续空白折叠；大小写不动', () => {
    expect(normalizeForMatch('　a  b　')).toBe('a b')
    expect(normalizeForMatch('Hello   World')).toBe('Hello World')
    expect(normalizeForMatch('ABC')).toBe('ABC')
    expect(normalizeForMatch('abc')).toBe('abc') // 不转换大小写
  })

  it('组内任一命中（精确或归一化后相等）', () => {
    expect(matchFillBlank(['color', 'Color'], 'color')).toBe(true)
    expect(matchFillBlank(['color', 'Color'], 'Color')).toBe(true)
    expect(matchFillBlank(['hello world'], 'hello  world')).toBe(true) // 空白归一化
    expect(matchFillBlank(['hello world'], '　hello world ')).toBe(true)
  })

  it('未命中 / 大小写敏感（既定决策）', () => {
    expect(matchFillBlank(['color'], 'colour')).toBe(false)
    expect(matchFillBlank(['color'], 'COLOR')).toBe(false) // 大小写敏感
  })

  it('开放空（空组）恒不命中', () => {
    expect(matchFillBlank([], '任意答案')).toBe(false)
  })
})

describe('gradeFillBlanks', () => {
  it('逐空判分；user 不足位按未作答计', () => {
    const correct = [['color', 'Color'], ['#fff'], []]
    expect(gradeFillBlanks(correct, ['Color', '#fff', 'whatever']))
      .toEqual([true, true, false]) // 开放空不裁决
    expect(gradeFillBlanks(correct, ['color'])).toEqual([true, false, false])
  })
})

describe('validateFillQuestion（保存门禁，与后端同规则）', () => {
  it('编号连续 + 数量一致 → 通过', () => {
    expect(validateFillQuestion('a【空1】b【空2】c', [['x'], []])).toBeNull()
  })

  it('无空位 / 编号断裂 / 超上限 / 数量不一致 → 中文原因', () => {
    expect(validateFillQuestion('无空位', [])).toContain('未插入空位')
    expect(validateFillQuestion('【空1】【空3】', [['x'], [], ['y']])).toContain('连续')
    const over = Array.from({ length: FILL_MAX_BLANKS + 1 }, (_, i) => `【空${i + 1}】`).join('')
    expect(validateFillQuestion(over, [])).toContain('不能超过')
    expect(validateFillQuestion('a【空1】b', [['x'], ['y']])).toContain('数量不一致')
  })
})

describe('formatFillAnswerJson（物化为嵌套数组落库）', () => {
  it('往返一致', () => {
    const groups = [['color', 'Color'], ['#fff'], []]
    expect(parseFillAnswer(formatFillAnswerJson(groups))).toEqual(groups)
  })
})

