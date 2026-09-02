import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import naive from 'naive-ui'
import LoadError from '@/components/LoadError.vue'

const backMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ back: backMock })
}))

function mountComp(props = {}) {
  return mount(LoadError, {
    props,
    global: { plugins: [naive] }
  })
}

describe('LoadError 共享错误态组件', () => {
  it('渲染默认标题与兜底描述', () => {
    const wrapper = mountComp()
    expect(wrapper.text()).toContain('加载失败')
    expect(wrapper.text()).toContain('请稍后重试')
  })

  it('渲染传入的具体错误描述', () => {
    const wrapper = mountComp({ description: '题库不存在' })
    expect(wrapper.text()).toContain('题库不存在')
  })

  it('点击重试触发 retry 事件', async () => {
    const wrapper = mountComp({ description: '网络错误' })
    const retryBtn = wrapper.findAll('button').find(b => b.text() === '重试')
    expect(retryBtn).toBeTruthy()
    await retryBtn!.trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('点击返回上一页调用 router.back', async () => {
    const wrapper = mountComp({ description: '无权访问' })
    const backBtn = wrapper.findAll('button').find(b => b.text() === '返回上一页')
    expect(backBtn).toBeTruthy()
    await backBtn!.trigger('click')
    expect(backMock).toHaveBeenCalled()
  })
})
