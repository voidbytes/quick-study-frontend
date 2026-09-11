<template>
  <!-- 富文本安全渲染：所有 v-html 都应改用它，统一过 DOMPurify 净化，防 XSS。
       $...$ / $$...$$ 等数学公式由 KaTeX 自动渲染（auto-render）。
       format=markdown（默认）时先经 markdown-it 编译（代码块 hljs 高亮），HTML 内容透传（html:true）后同样净化。
       fill-blanks：渲染后再把【空N】替换为「横线+圈数字」空位徽章——
       在最终 HTML 上替换，代码围栏内同样生效（fence 会转义预替换的 HTML，见方案 C）。 -->
  <div ref="root" class="markdown-body" v-html="sanitized" />
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import DOMPurify from 'dompurify'
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import { renderRichTextContent, type ContentFormat } from '@/utils/richText'

const props = withDefaults(
  defineProps<{
    /** 原始 HTML / Markdown / 纯文本富文本内容 */
    content?: string | null
    /** 内容格式：markdown（默认，兼容纯文本与内嵌 HTML）/ html（原样净化）/ plain（纯文本转义） */
    format?: ContentFormat
    /** 填空题展示态：【空N】渲染为「横线+圈数字」空位徽章（渲染后替换，代码块内生效） */
    fillBlanks?: boolean
  }>(),
  { content: '', format: 'markdown', fillBlanks: false }
)

const normalized = computed(() => renderRichTextContent(props.content ?? '', props.format))

const sanitized = computed(() => {
  const html = DOMPurify.sanitize(normalized.value, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target']
  })
  if (!props.fillBlanks) return html
  // 渲染后替换：fence/highlight 输出的 HTML 里【空N】仍是字面文本，此处替换全场景生效。
  // 徽章为自产静态 HTML（无用户输入插值），替换后再过一次净化保持管线一致。
  const withBadges = html.replace(
    /【空(\d+)】/g,
    '<span class="fill-blank-badge"><span class="fill-blank-line"></span><span class="fill-blank-no">$1</span></span>'
  )
  return DOMPurify.sanitize(withBadges, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target']
  })
})

const root = ref<HTMLElement | null>(null)

/** 渲染 $...$ 数学公式。失败仅降级为原文展示，不抛出影响页面。 */
function renderMath() {
  const el = root.value
  if (!el) return
  try {
    renderMathInElement(el, {
      throwOnError: false,
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ]
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[math] 公式渲染失败，降级为原文展示', err)
  }
}

watch(sanitized, () => nextTick(renderMath))
watch(root, () => nextTick(renderMath))
</script>

<style>
/* hljs github-light 主题自带 .hljs 背景（#fff），覆盖为透明，与容器背景保持一致 */
.markdown-body pre code.hljs {
  background: transparent;
  padding: 0;
}

/* 填空空位徽章（fillBlanks）：横线底 + 圈数字，与答案区 ①②③ 风格对齐。
   inline 元素，代码块内/外均生效；行内随文字流不换行。 */
.fill-blank-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.6em;
  height: 1.5em;
  margin: 0 0.15em;
  vertical-align: middle;
  border-bottom: 2px solid var(--color-neutral-400, #a3a3a3);
  background: var(--color-neutral-50, #fafafa);
  border-radius: 3px 3px 0 0;
  padding: 0 0.3em;
}

.fill-blank-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.15em;
  height: 1.15em;
  border: 1.5px solid var(--color-primary-500, #0ea5e9);
  border-radius: 9999px;
  color: var(--color-primary-600, #0284c7);
  font-size: 0.72em;
  font-weight: 700;
  line-height: 1;
  padding: 0 0.15em;
  font-family: ui-monospace, monospace;
}

/* 代码块内：背景加深避免与代码底色混淆 */
.markdown-body pre .fill-blank-badge {
  background: rgba(14, 165, 233, 0.08);
  border-bottom-color: var(--color-primary-400, #38bdf8);
}
</style>
