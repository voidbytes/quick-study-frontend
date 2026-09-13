import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RichText from '@/components/common/RichText.vue'

// happy-dom 的 DOM parse 存在"剥离根级元素"怪癖（<ul>→<li>、<pre>→<code>），且 quirks 模式
// 下 KaTeX 拒绝渲染。因此本组件测试只验证"接线"（净化被调用、内容进入 DOM、KaTeX 挂载），
// markdown 编译 / 高亮 / 公式保护的输出正确性由 utils/__tests__/richText.spec.ts 纯函数测试覆盖，
// 真实浏览器渲染见验收清单。
const { sanitize } = vi.hoisted(() => ({ sanitize: vi.fn((s: string) => s) }))
vi.mock('dompurify', () => ({ default: { sanitize } }))

const { renderMathInElement } = vi.hoisted(() => ({ renderMathInElement: vi.fn() }))
vi.mock('katex/dist/contrib/auto-render.mjs', () => ({
  default: (...args: unknown[]) => renderMathInElement(...args)
}))

function render(content?: string | null, format?: 'markdown' | 'html' | 'plain') {
  return mount(RichText, { props: format ? { content, format } : { content } })
}

describe('RichText 组件接线', () => {
  beforeEach(() => {
    sanitize.mockClear()
    renderMathInElement.mockClear()
  })

  it('markdown 内容经编译后进入 DOM（代码块反引号不显示）', () => {
    const wrapper = render('```java\nint a = 1;\n```')
    expect(wrapper.text()).toContain('int a = 1;')
    expect(wrapper.text()).not.toContain('```')
    expect(sanitize).toHaveBeenCalled()
  })

  it('富文本内容过 DOMPurify 净化（sanitize 被调用且收到编译产物）', () => {
    render('这是 **重点**')
    expect(sanitize).toHaveBeenCalledTimes(1)
    const arg = sanitize.mock.calls[0][0] as string
    expect(arg).toContain('<strong>重点</strong>')
  })

  it('空内容渲染为空', () => {
    const wrapper = render('')
    expect(wrapper.find('.markdown-body').element.innerHTML).toBe('')
    expect(sanitize).toHaveBeenCalledTimes(1)
  })

  it('plain 格式：内容被转义进 DOM，文本保留原文', () => {
    const wrapper = render('a < b & c', 'plain')
    expect(wrapper.text()).toContain('a < b & c')
    const arg = sanitize.mock.calls[0][0] as string
    expect(arg).toContain('&lt;')
  })

  it('含公式时调用 KaTeX auto-render，且作用在内容容器上', async () => {
    render('$p$ 与 $\\sum_{n=1}^{\\infty}\\frac{1}{n^p}$')
    await new Promise((r) => setTimeout(r, 0))
    expect(renderMathInElement).toHaveBeenCalled()
    const firstEl = renderMathInElement.mock.calls[0][0] as HTMLElement
    expect(firstEl.classList.contains('markdown-body')).toBe(true)
  })

  it('auto-render 配置了 $ 内联与 $$ 块级定界符', async () => {
    render('$x$')
    await new Promise((r) => setTimeout(r, 0))
    const delimiters = (renderMathInElement.mock.calls[0][1] as {
      delimiters: Array<{ left: string; right: string; display: boolean }>
    }).delimiters
    expect(delimiters.some((d) => d.left === '$' && d.right === '$' && d.display === false)).toBe(true)
    expect(delimiters.some((d) => d.left === '$$' && d.right === '$$' && d.display === true)).toBe(true)
  })

  it('内容更新后重新渲染并再次触发 KaTeX', async () => {
    const wrapper = render('$a$')
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.setProps({ content: '$b$' })
    await new Promise((r) => setTimeout(r, 0))
    expect(renderMathInElement.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})
