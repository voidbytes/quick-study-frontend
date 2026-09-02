<template>
  <!-- 富文本安全渲染：所有 v-html 都应改用它，统一过 DOMPurify 净化，防 XSS -->
  <div class="markdown-body" v-html="sanitized" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = withDefaults(
  defineProps<{
    /** 原始 HTML / Markdown 富文本内容 */
    content?: string | null
  }>(),
  { content: '' }
)

const sanitized = computed(() =>
  DOMPurify.sanitize(props.content ?? '', {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target']
  })
)
</script>
