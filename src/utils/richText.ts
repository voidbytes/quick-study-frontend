import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
// 按需注册题目内容常用语言（避免全量 hljs 进 bundle）
import java from 'highlight.js/lib/languages/java'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import css from 'highlight.js/lib/languages/css'
import cpp from 'highlight.js/lib/languages/cpp'
import c from 'highlight.js/lib/languages/c'
import go from 'highlight.js/lib/languages/go'
import kotlin from 'highlight.js/lib/languages/kotlin'
import php from 'highlight.js/lib/languages/php'
import rust from 'highlight.js/lib/languages/rust'

hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', c)
hljs.registerLanguage('go', go)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('php', php)
hljs.registerLanguage('rust', rust)

export type ContentFormat = 'markdown' | 'html' | 'plain'

// html:true 存量 HTML 内容透传（净化由 DOMPurify 兜底）；breaks:true 单换行输出 <br>，
// 与存量纯文本分支行为一致，避免带换行的纯文本答案视觉回归。
// highlight: 代码块语法高亮；未知语言转义原样输出（安全兜底）。
const md: MarkdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  highlight: (str: string, lang?: string): string => {
    const langCls = lang ? md.utils.escapeHtml(lang) : ''
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${langCls}">${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch {
        // 高亮异常降级：转义原样输出
      }
    }
    return `<pre><code class="language-${langCls}">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// ==================== 公式占位符保护 ====================
// markdown-it 会把 $a*b$ 的 *、\sum_{n=1} 的 _ 当强调语法破坏公式，
// 因此编译前先把公式段提取为占位符，编译后还原再交 KaTeX auto-render。
// 占位符不含 * / _ / < / &，markdown 编译与 DOMPurify 均不触碰。
// 代码块内的 $..$ 也会被提取/还原，但 auto-render 默认忽略 pre/code 内内容，不会误渲染。
const MATH_PLACEHOLDER = '%%QSMATH'

function protectMath(raw: string): { text: string; formulas: string[] } {
  const formulas: string[] = []
  let text = raw
  // 顺序：$$..$$（块级）→ $..$（行内）→ \(..\) → \[..\]
  const pass = (re: RegExp) => {
    text = text.replace(re, (m) => {
      const idx = formulas.length
      formulas.push(m)
      return `${MATH_PLACEHOLDER}${idx}%%`
    })
  }
  pass(/\$\$[\s\S]+?\$\$/g)
  pass(/\$[^$\n]+?\$/g)
  pass(/\\\([\s\S]+?\\\)/g)
  pass(/\\\[[\s\S]+?\\\]/g)
  return { text, formulas }
}

function restoreMath(text: string, formulas: string[]): string {
  // 必须用函数式 replacement：字符串 replacement 中 $$ 是特殊转义（= 字面 $），
  // 会把 KaTeX 块级定界符 $$ 吞成 $（实测 bug，richText.spec 已锁死该场景）。
  return formulas.reduce((acc, f, i) => acc.replace(`${MATH_PLACEHOLDER}${i}%%`, () => f), text)
}

/** 纯文本转义并保留换行（plain 分支）。
 *  外层包 <p>：DOMPurify 对"裸文本+标签"混合串会丢弃首个标签前的文本（jsdom/浏览器解析差异） */
function escapePlain(raw: string): string {
  return `<p>${raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')}</p>`
}

/**
 * 按格式把原始内容编译为待净化的 HTML：
 * - markdown（默认）：公式占位符保护 → markdown-it 编译（代码块 hljs 高亮）→ 还原公式（兼容纯文本与内嵌 HTML）
 * - html：原样透传（净化由调用方 DOMPurify 兜底）
 * - plain：纯文本转义 + 换行转 <br>
 */
export function renderRichTextContent(raw: string, format: ContentFormat = 'markdown'): string {
  if (!raw) return ''
  if (format === 'plain') return escapePlain(raw)
  if (format === 'html') return raw
  const { text, formulas } = protectMath(raw)
  return restoreMath(md.render(text), formulas)
}
