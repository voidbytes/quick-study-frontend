<template>
  <!-- 富文本安全渲染：所有 v-html 都应改用它，统一过 DOMPurify 净化，防 XSS。
       $...$ / $$...$$ 等数学公式由 KaTeX 自动渲染（auto-render）。
       format=markdown（默认）时先经 markdown-it 编译（代码块 hljs 高亮），HTML 内容透传（html:true）后同样净化。 -->
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
  }>(),
  { content: '', format: 'markdown' }
)

const normalized = computed(() => renderRichTextContent(props.content ?? '', props.format))

const sanitized = computed(() =>
  DOMPurify.sanitize(normalized.value, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target']
  })
)

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
/* hljs github-light 主题自带 .hljs 背景（#fff），覆盖为容器背景色（--bg-subtle）保持一致 */
.markdown-body pre code.hljs {
  background: transparent;
  padding: 0;
}
</style>
