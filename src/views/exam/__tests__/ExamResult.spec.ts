import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import naive from 'naive-ui'
import ExamResult from '@/views/exam/ExamResult.vue'
import { getResult } from '@/api/exam'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '100' } }),
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('@/api/exam', () => ({
  getResult: vi.fn()
}))

// 响应拦截器解包后返回类型为 Promise<ApiResponse<T>>，与泛型签名一致
const getResultMock = vi.mocked(getResult)

function mountPage() {
  return mount(ExamResult, { global: { plugins: [naive] } })
}

function sessionResult(overrides: Record<string, unknown> = {}) {
  return {
    sessionId: '100',
    totalScore: 90,
    objectiveScore: 80,
    subjectiveScore: 10,
    status: 'GRADED',
    questions: [
      {
        paperQuestionId: 1,
        content: '1+1=?',
        type: 'SINGLE',
        options: null,
        yourAnswer: 'B',
        correctAnswer: 'B',
        analysis: '基础题',
        score: 5,
        isCorrect: true
      }
    ],
    ...overrides
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ExamResult 考试结果页', () => {
  it('GRADED → 显示"已批改"标签与分数', async () => {
    getResultMock.mockResolvedValue({ code: 0, message: 'success', data: sessionResult() })
    const wrapper = mountPage()
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('已批改')
    expect(text).toContain('考试结果')
    expect(text).toContain('答题详情')
    expect(text).not.toContain('未知')
  })

  it('SUBMITTED → 显示"待批改"与答题详情入口', async () => {
    getResultMock.mockResolvedValue({
      code: 0,
      message: 'success',
      data: sessionResult({
        status: 'SUBMITTED',
        questions: [
          {
            paperQuestionId: 2,
            content: 'CSS 颜色属性______',
            type: 'FILL_BLANK',
            options: null,
            yourAnswer: null,
            correctAnswer: 'color',
            analysis: '',
            score: null,
            isCorrect: null
          }
        ]
      })
    })
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('待批改')
    expect(wrapper.text()).toContain('答题详情')
    expect(wrapper.text()).toContain('第 1 题')
  })

  it('AUTO_SUBMITTED → 显示"自动交卷"', async () => {
    getResultMock.mockResolvedValue({
      code: 0,
      message: 'success',
      data: sessionResult({ status: 'AUTO_SUBMITTED' })
    })
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('自动交卷')
  })

  it('加载失败（403 无权）→ 显示明确错误态，不渲染假数据（回归 bug-045）', async () => {
    const err = new Error('无权查看该结果')
    ;(err as any).response = { data: { code: 10202, message: '无权查看该结果' } }
    getResultMock.mockRejectedValue(err)

    const wrapper = mountPage()
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('无法查看考试结果')
    expect(text).toContain('无权查看该结果')
    // 不应出现假数据结果卡
    expect(text).not.toContain('已批改')
    expect(text).not.toContain('待批改')
    expect(text).not.toContain('答题详情')
  })

  it('网络异常（无响应体）→ 显示兜底错误文案', async () => {
    getResultMock.mockRejectedValue(new Error('Network Error'))
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('无法查看考试结果')
    expect(wrapper.text()).toContain('Network Error')
  })
})
