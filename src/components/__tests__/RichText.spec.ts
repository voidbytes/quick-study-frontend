import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RichText from '@/components/common/RichText.vue'

function render(content?: string | null) {
  return mount(RichText, { props: { content } })
}

describe('RichText 富文本渲染', () => {
  it('HTML 内容原样渲染（保留标签语义）', () => {
    const wrapper = render('<p>组合式 <strong>API</strong></p>')
    expect(wrapper.html()).toContain('<strong>API</strong>')
  })

  it('纯文本换行渲染为 <br>（存量纯文本答案兼容）', () => {
    const wrapper = render('第一行\n第二行')
    const el = wrapper.find('.markdown-body').element
    expect(el.innerHTML).toContain('<br>')
    expect(el.textContent).toContain('第一行')
    expect(el.textContent).toContain('第二行')
  })

  it('纯文本中的 < > & 被转义，不解析为标签', () => {
    const wrapper = render('a < b & c > d')
    const html = wrapper.find('.markdown-body').element.innerHTML
    expect(html).not.toContain('<b>')
    expect(wrapper.text()).toContain('a < b & c > d')
  })

  it('危险脚本被 DOMPurify 净化', () => {
    const wrapper = render('<img src=x onerror="alert(1)"><p>ok</p>')
    const html = wrapper.find('.markdown-body').element.innerHTML
    expect(html).not.toContain('onerror')
    expect(html).toContain('ok')
  })

  it('空内容渲染为空', () => {
    const wrapper = render('')
    expect(wrapper.find('.markdown-body').element.innerHTML).toBe('')
  })
})
