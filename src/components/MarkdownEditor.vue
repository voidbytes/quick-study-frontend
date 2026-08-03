<template>
  <div class="markdown-editor border rounded">
    <v-md-editor
      :model-value="modelValue"
      :height="height"
      :disabled-menus="[]"
      @change="handleChange"
      @upload-image="handleUploadImage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn'
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'

VMdEditor.use(vuepressTheme)
VMdEditor.use(createKatexPlugin())
VMdEditor.use(createLineNumbertPlugin())

const props = defineProps<{
  modelValue: string
  height?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const message = useMessage()

const defaultHeight = props.height || '400px'

function handleChange(text: string) {
  emit('update:modelValue', text)
}

async function handleUploadImage(event: any, insertImage: (url: string, alt: string) => void) {
  const file = event.target?.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
      },
      body: formData
    })

    const result = await response.json()
    if (result.data?.url) {
      insertImage(result.data.url, '图片')
    } else {
      message.error('图片上传失败')
    }
  } catch {
    message.error('图片上传失败')
  }
}
</script>