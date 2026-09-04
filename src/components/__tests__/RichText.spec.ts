import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RichText from '@/components/common/RichText.vue'

// happy-dom 处于 quirks 模式，真实 KaTeX 会拒绝渲染（"KaTeX doesn't work in quirks mode"）。
// 因此这里 mock auto-render，仅断言组件正确接线；真实公式渲染在浏览器实测。
const { renderMathInElement } = vi.hoisted(() => ({ renderMathInElement: vi.fn() }))
vi.mock('katex/dist/contrib/auto-render.mjs', () => ({
  default: (...args: unknown[]) => renderMathInElement(...args)
}))

function render(content?: string | null) {
  return mount(RichText, { props: { content } })
}

function renderCalls() {
  return renderMathInElement.mock.calls
}

describe('RichText 富文本渲染', () => {
  beforeEach(() => renderMathInElement.mockClear())

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

  it('含公式时调用 KaTeX auto-render，且作用在内容容器上', async () => {
    const wrapper = render('$p$ 与 $\\sum_{n=1}^{\\infty}\\frac{1}{n^p}$')
    await new Promise((r) => setTimeout(r, 0))
    expect(renderMathInElement).toHaveBeenCalled()
    const firstEl = renderCalls()[0][0] as HTMLElement
    expect(firstEl.classList.contains('markdown-body')).toBe(true)
  })

  it('auto-render 配置了 $ 内联与 $$ 块级定界符', async () => {
    render('$x$')
    await new Promise((r) => setTimeout(r, 0))
    const delimiters = (renderCalls()[0][1] as { delimiters: Array<{ left: string; right: string; display: boolean }> })
      .delimiters
    expect(delimiters.some((d) => d.left === '$' && d.right === '$' && d.display === false)).toBe(true)
    expect(delimiters.some((d) => d.left === '$$' && d.right === '$$' && d.display === true)).toBe(true)
  })

  it('无公式的纯文本不破坏渲染流程', async () => {
    const wrapper = render('纯文本内容')
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.markdown-body').text()).toContain('纯文本内容')
  })
})