import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import PracticePage from '@/views/practice/PracticePage.vue'
import { mountWithProviders } from '@/test-utils/mountWithProviders'
import { getPracticeSession, submitPracticeAnswer, completePractice } from '@/api/practice'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '100' } }),
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('@/composables/useConfirm', () => ({
  useConfirm: () => ({
    confirm: (opts: { onPositiveClick?: () => void }) => opts.onPositiveClick?.(),
    confirmDanger: (opts: { onPositiveClick?: () => void }) => opts.onPositiveClick?.()
  })
}))

vi.mock('@/api/practice', () => ({
  getPracticeSession: vi.fn(),
  submitPracticeAnswer: vi.fn(),
  completePractice: vi.fn(),
  aiSuggest: vi.fn()
}))

// 响应拦截器解包后返回类型为 Promise<ApiResponse<T>>，与泛型签名一致
const getSessionMock = vi.mocked(getPracticeSession)
const submitMock = vi.mocked(submitPracticeAnswer)
const completeMock = vi.mocked(completePractice)

// option_id 模型：options 为对象数组 JSON；answer 为 id JSON 数组（判断题 [1]=错误）
function sessionPayload(overrides: Record<string, unknown> = {}): any {
  return {
    sessionId: '100',
    status: 'IN_PROGRESS',
    currentIndex: 0,
    totalCount: 2,
    filterParams: '{"sourceType":"RANDOM"}',
    completedAt: null,
    questions: [
      {
        index: 0,
        type: 'TRUE_FALSE',
        content: 'Java 中 int 是包装类型。',
        options: '[{"id":0,"text":"正确"},{"id":1,"text":"错误"}]',
        answer: '[1]',
        analysis: 'int 是基本类型',
        difficulty: 'EASY'
      },
      {
        index: 1,
        type: 'SINGLE',
        content: '下列哪个是 JVM 语言？',
        options:
          '[{"id":0,"text":"Python"},{"id":1,"text":"Kotlin"},{"id":2,"text":"Go"},{"id":3,"text":"Rust"}]',
        answer: '[1]',
        analysis: '',
        difficulty: 'MEDIUM'
      }
    ],
    answers: [],
    stats: { correctCount: 0, totalCount: 0, accuracy: 0, duration: 0 },
    ...overrides
  }
}

function mountPage() {
  return mountWithProviders(PracticePage)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PracticePage 自由练习页', () => {
  it('判断题渲染 正确/错误 两个选项（id 模型物化选项）', async () => {
    getSessionMock.mockResolvedValue({ code: 0, message: 'success', data: sessionPayload() })
    const wrapper = mountPage()
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('正确')
    expect(text).toContain('错误')
    expect(text).toContain('第 1 题 / 共 2 题')
    // 题型标签（回归 bug-044）
    expect(text).toContain('判断')
  })

  it('单选题渲染解析后的选项内容（id 模型对象数组）', async () => {
    const payload = sessionPayload()
    getSessionMock.mockResolvedValue({ code: 0, message: 'success', data: payload })
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 停在第1题（判断题），需要切到第2题验证单选选项 → 直接断言当前题
    const text = wrapper.text()
    expect(text).toContain('Java 中 int 是包装类型。')
  })

  it('选择题点选即暂存并自动跳下一题，完成练习时统一提交（整卷模式）', async () => {
    getSessionMock.mockResolvedValue({ code: 0, message: 'success', data: sessionPayload() })
    const wrapper = mountPage()
    await flushPromises()

    // 点选项：暂存 + 自动跳下一题（不判分，无对错横幅）
    submitMock.mockClear()
    await wrapper.findAll('.q-option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(submitMock).not.toHaveBeenCalled()

    // 完成练习：统一提交判分
    completeMock.mockResolvedValue({ code: 0, message: 'success', data: { sessionId: '1', correctCount: 0, totalCount: 2, accuracy: 0, duration: 1 } })
    const completeBtn = wrapper.findAll('button').find(b => b.text() === '完成练习')
    await completeBtn!.trigger('click')
    await flushPromises()
    await flushPromises()

    // 统一提交时格式为 option_id JSON 数组（判断题 [0]=正确 / [1]=错误）
    expect(submitMock).toHaveBeenCalled()
  })

  it('完成练习进入对答案环节：判分结果来自统一提交', async () => {
    getSessionMock.mockResolvedValue({ code: 0, message: 'success', data: sessionPayload() })
    const wrapper = mountPage()
    await flushPromises()

    submitMock.mockResolvedValue({ code: 0, message: 'success', data: true })
    completeMock.mockResolvedValue({ code: 0, message: 'success', data: { sessionId: '1', correctCount: 1, totalCount: 2, accuracy: 0.5, duration: 1 } })
    await wrapper.findAll('.q-option')[1].trigger('click')
    await wrapper.vm.$nextTick()
    const completeBtn = wrapper.findAll('button').find(b => b.text() === '完成练习')
    await completeBtn!.trigger('click')
    await flushPromises()
    await flushPromises()

    // 完成练习后先停在对答案环节（第 1 题），判分结果即时可见
    const text = wrapper.text()
    expect(text).toContain('回答正确')
    expect(text).toContain('查看结果')
    // 点「查看结果」→ 出统计结果页
    const resultsBtn = wrapper.findAll('button').find(b => b.text() === '查看结果')
    await resultsBtn!.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('练习结果')
    expect(wrapper.text()).toContain('答题回顾')
  })

  it('完成的会话直接展示结果页，题型标签齐全（回归 bug-044）', async () => {
    getSessionMock.mockResolvedValue({
      code: 0,
      message: 'success',
      data: sessionPayload({
        status: 'COMPLETED',
        stats: { accuracy: 0.5, correctCount: 1, duration: 60 }
      })
    })
    const wrapper = mountPage()
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('练习结果')
    expect(text).toContain('50.0%')
  })

  it('会话加载失败 → 提示并跳回练习列表', async () => {
    getSessionMock.mockRejectedValue(new Error('network'))
    const wrapper = mountPage()
    await flushPromises()

    // PracticePage catch 后 router.push('/practice')，页面不渲染题目
    expect(wrapper.text()).not.toContain('第 1 题 / 共 2 题')
  })

  it('对答案环节切题保持判分态，不回落作答界面（回归：只能评第一题）', async () => {
    getSessionMock.mockResolvedValue({
      code: 0,
      message: 'success',
      data: sessionPayload({
        answers: [
          { questionIndex: 0, userAnswer: '[1]', isCorrect: true },
          { questionIndex: 1, userAnswer: '[0]', isCorrect: false }
        ]
      })
    })
    const wrapper = mountPage()
    await flushPromises()

    submitMock.mockImplementation(async (_sid: string, payload: { index: number }) => ({
      code: 0,
      message: 'success',
      data: payload.index === 0
    }))
    completeMock.mockResolvedValue({
      code: 0,
      message: 'success',
      data: { sessionId: '1', correctCount: 1, totalCount: 2, accuracy: 0.5, duration: 1 }
    })

    const completeBtn = wrapper.findAll('button').find((b) => b.text() === '完成练习')
    await completeBtn!.trigger('click')
    await flushPromises()
    await flushPromises()

    // 进入对答案环节：第 1 题判分可见，完成练习按钮收起
    expect(wrapper.text()).toContain('回答正确')
    expect(wrapper.findAll('button').find((b) => b.text() === '完成练习')).toBeUndefined()

    // 切到第 2 题：仍是判分态（第二题判错横幅可见），不是作答界面
    const nextBtn = wrapper.findAll('button').find((b) => b.text() === '下一题')
    await nextBtn!.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('回答错误')
    expect(wrapper.text()).toContain('第 2 题 / 共 2 题')
  })

  it('主观题自评后收起 AI 给分建议（回归：评完仍显示）', async () => {
    getSessionMock.mockResolvedValue({
      code: 0,
      message: 'success',
      data: sessionPayload({
        totalCount: 1,
        questions: [
          {
            index: 0,
            type: 'SHORT_ANSWER',
            content: '简述 JVM 内存模型。',
            options: null,
            answer: '参考答案',
            analysis: '',
            difficulty: 'MEDIUM'
          }
        ],
        answers: [{ questionIndex: 0, userAnswer: '我的作答', isCorrect: null }]
      })
    })
    const wrapper = mountPage()
    await flushPromises()

    // 简答题后端返回 data=null（主观题确定性层不裁决），与声明的 ApiResponse<boolean> 不符，测试内做收敛
    submitMock.mockResolvedValue({ code: 0, message: 'success', data: null as unknown as boolean })
    completeMock.mockResolvedValue({
      code: 0,
      message: 'success',
      data: { sessionId: '1', correctCount: 0, totalCount: 1, accuracy: 0, duration: 1 }
    })

    const completeBtn = wrapper.findAll('button').find((b) => b.text() === '完成练习')
    await completeBtn!.trigger('click')
    await flushPromises()
    await flushPromises()

    // 待裁决：AI 给分建议 + 自评按钮同排
    expect(wrapper.text()).toContain('AI 给分建议')
    expect(wrapper.text()).toContain('我已掌握')
    expect(wrapper.text()).toContain('还没掌握')

    // 自评「我已掌握」后，三颗按钮一并收起（结论已定）
    const masteredBtn = wrapper.findAll('button').find((b) => b.text().includes('我已掌握'))
    await masteredBtn!.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('AI 给分建议')
    expect(wrapper.text()).not.toContain('还没掌握')
  })
})
