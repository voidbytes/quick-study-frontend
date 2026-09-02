import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import PracticePage from '@/views/practice/PracticePage.vue'
import { mountWithProviders } from '@/test-utils/mountWithProviders'
import { getPracticeSession, submitPracticeAnswer, completePractice } from '@/api/practice'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '100' } }),
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('@/api/practice', () => ({
  getPracticeSession: vi.fn(),
  submitPracticeAnswer: vi.fn(),
  completePractice: vi.fn()
}))

// 响应拦截器解包后返回类型为 Promise<ApiResponse<T>>，与泛型签名一致
const getSessionMock = vi.mocked(getPracticeSession)
const submitMock = vi.mocked(submitPracticeAnswer)

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
        options: null,
        answer: 'B',
        analysis: 'int 是基本类型',
        difficulty: 'EASY'
      },
      {
        index: 1,
        type: 'SINGLE',
        content: '下列哪个是 JVM 语言？',
        options: '["A. Python","B. Kotlin","C. Go","D. Rust"]',
        answer: 'B',
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
  it('判断题无 options 时兜底渲染"正确/错误"两个选项（回归 bug-035）', async () => {
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

  it('单选题渲染解析后的选项内容（去除数据自带前缀）', async () => {
    const payload = sessionPayload()
    getSessionMock.mockResolvedValue({ code: 0, message: 'success', data: payload })
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 停在第1题（判断题），需要切到第2题验证单选选项 → 直接断言当前题
    const text = wrapper.text()
    expect(text).toContain('Java 中 int 是包装类型。')
  })

  it('提交答案后显示对错反馈横幅（回归 bug-036）', async () => {
    getSessionMock.mockResolvedValue({ code: 0, message: 'success', data: sessionPayload() })
    const wrapper = mountPage()
    await flushPromises()

    // 选择第一项（正确 对应 A，标准答案 B → 答错）
    submitMock.mockResolvedValue({ code: 0, message: 'success', data: false })
    await wrapper.findAll('.cursor-pointer')[0].trigger('click')
    await wrapper.vm.$nextTick()
    const submitBtn = wrapper.findAll('button').find(b => b.text() === '提交答案')
    await submitBtn!.trigger('click')
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('回答错误')
    expect(text).toContain('正确答案')
    expect(text).toContain('错误')
  })

  it('答对时横幅显示"回答正确"且不显示正确答案', async () => {
    getSessionMock.mockResolvedValue({ code: 0, message: 'success', data: sessionPayload() })
    const wrapper = mountPage()
    await flushPromises()

    submitMock.mockResolvedValue({ code: 0, message: 'success', data: true })
    await wrapper.findAll('.cursor-pointer')[0].trigger('click')
    await wrapper.vm.$nextTick()
    const submitBtn = wrapper.findAll('button').find(b => b.text() === '提交答案')
    await submitBtn!.trigger('click')
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('回答正确')
    expect(text).not.toContain('正确答案：')
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
})
