import { describe, it, expect } from 'vitest'
import { renderRichTextContent } from '@/utils/richText'

describe('renderRichTextContent markdown 编译', () => {
  it('java 代码块 hljs 高亮，输出 pre/code 带 hljs token', () => {
    const out = renderRichTextContent('```java\nfor (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}\n```')
    expect(out).toContain('<pre><code class="hljs language-java">')
    expect(out).toContain('<span class="hljs-keyword">')
    expect(out).not.toContain('```')
  })

  it('未知语言代码块转义原样输出（无 hljs 高亮）', () => {
    const out = renderRichTextContent('```nosuchlang\nif (a < b) {\n}\n```')
    expect(out).toContain('<pre><code class="language-nosuchlang">')
    expect(out).not.toContain('hljs')
    expect(out).toContain('&lt;') // 转义
  })

  it('无围栏语言标记的代码块原样输出', () => {
    const out = renderRichTextContent('```\nplain\n```')
    expect(out).toContain('<pre><code class="language-">')
    expect(out).toContain('plain')
  })

  it('行内 code 渲染', () => {
    const out = renderRichTextContent('用 `code` 标记')
    expect(out).toContain('<code>code</code>')
  })

  it('无序列表渲染为 ul/li', () => {
    const out = renderRichTextContent('- 项一\n- 项二')
    expect(out).toContain('<ul>')
    expect(out).toContain('<li>项一</li>')
    expect(out).toContain('<li>项二</li>')
  })

  it('加粗/斜体渲染', () => {
    const out = renderRichTextContent('这是 **重点** 与 *斜体*')
    expect(out).toContain('<strong>重点</strong>')
    expect(out).toContain('<em>斜体</em>')
  })

  it('单换行输出 <br>（breaks:true，存量纯文本兼容）', () => {
    const out = renderRichTextContent('第一行\n第二行')
    expect(out).toContain('<br>')
  })

  it('markdown 内嵌 HTML 透传（html:true）', () => {
    const out = renderRichTextContent('前缀<strong>加粗</strong>后缀')
    expect(out).toContain('<strong>加粗</strong>')
  })

  it('javascript: 链接被 markdown-it 拒绝，保留字面文本', () => {
    const out = renderRichTextContent('[点击](javascript:alert(1))')
    expect(out).not.toContain('href="javascript')
    expect(out).toContain('(javascript:alert(1))')
  })
})

describe('renderRichTextContent 公式占位符保护', () => {
  it('$a*b$ 的 * 不被当强调，$x_1$ 的 _ 不被当强调', () => {
    const out = renderRichTextContent('公式 $a*b$ 与 $x_1$')
    expect(out).toContain('$a*b$')
    expect(out).toContain('$x_1$')
    expect(out).not.toContain('<em>')
    expect(out).not.toContain('<strong>')
  })

  it('$$ 块级与 $ 行内公式混合还原', () => {
    const out = renderRichTextContent('行内 $E=mc^2$ 与块级 $$\\sum_{n=1}^{N} n$$')
    expect(out).toContain('$E=mc^2$')
    expect(out).toContain('$$\\sum_{n=1}^{N} n$$')
  })

  it('代码块内的 $..$ 不破坏代码块渲染', () => {
    const out = renderRichTextContent('```bash\necho $HOME\n```')
    expect(out).toContain('<pre><code')
    expect(out).toContain('echo')
    expect(out).toContain('$HOME') // bash 高亮会包 span，文本仍在
  })
})

describe('renderRichTextContent 格式分支', () => {
  it('html 格式原样透传', () => {
    expect(renderRichTextContent('<b>x</b>', 'html')).toBe('<b>x</b>')
  })

  it('plain 格式转义并保留换行', () => {
    const out = renderRichTextContent('a < b\n二行', 'plain')
    expect(out).toContain('&lt;')
    expect(out).toContain('<br>')
    expect(out).not.toContain('<b>')
  })

  it('markdown 格式为默认值', () => {
    expect(renderRichTextContent('**b**')).toContain('<strong>b</strong>')
  })

  it('空内容返回空串', () => {
    expect(renderRichTextContent('')).toBe('')
    expect(renderRichTextContent('', 'html')).toBe('')
    expect(renderRichTextContent('', 'plain')).toBe('')
  })
})
