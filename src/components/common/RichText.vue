<template>
  <!-- 富文本安全渲染：所有 v-html 都应改用它，统一过 DOMPurify 净化，防 XSS。
       $...$ / $$...$$ 等数学公式由 KaTeX 自动渲染（auto-render）。 -->
  <div ref="root" class="markdown-body" v-html="sanitized" />
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import DOMPurify from 'dompurify'
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'
import 'katex/dist/katex.min.css'

const props = withDefaults(
  defineProps<{
    /** 原始 HTML / Markdown 富文本内容 */
    content?: string | null
  }>(),
  { content: '' }
)

/** 存量纯文本内容（如旧版纯文本答案）无换行渲染，按纯文本转义并保留换行。
 *  外层包 <p>：DOMPurify 对"裸文本+标签"混合串会丢弃首个标签前的文本（jsdom/浏览器解析差异） */
const normalized = computed(() => {
  const raw = props.content ?? ''
  if (!raw) return ''
  const hasTag = /<[a-z][^>]*>/i.test(raw)
  if (hasTag) return raw
  return `<p>${raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')}</p>`
})

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