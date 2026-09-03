<template>
  <!-- w-full：组件位于 n-form-item-blank（flex 容器）内，
       缺省 flex-basis:auto 会收缩到内容固有宽度(~420px)，必须显式撑满 -->
  <div class="markdown-editor w-full border rounded">
    <v-md-editor
      :model-value="modelValue"
      :height="height"
      :mode="mode"
      :placeholder="placeholder"
      :disabled-menus="disabledMenus"
      @change="handleChange"
      @upload-image="handleUploadImage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn'
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'
import { TOKEN_KEY } from '@/utils/constants'

VMdEditor.use(vuepressTheme)
VMdEditor.use(createKatexPlugin())
VMdEditor.use(createLineNumbertPlugin())

const props = withDefaults(
  defineProps<{
    modelValue: string
    height?: string
    /**
     * 编辑器形态：不传 = 默认（编辑+预览双栏，题目创建/编辑用）；
     * 'edit' = 单栏编辑 + 工具栏（考试答题卡用，空间有限）；
     * 'preview' = 仅预览。
     */
    mode?: 'edit' | 'editable' | 'preview'
    placeholder?: string
    /** 禁用的工具栏菜单（如答题模式禁用标题/表格等低频项） */
    disabledMenus?: string[]
    /** 图片张数上限（答题场景限制 9 张），不传则不限 */
    maxImages?: number
  }>(),
  {
    height: '400px',
    placeholder: '',
    disabledMenus: () => []
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const message = useMessage()

/** 已插入图片数（@change 输出为编译后 HTML，图片即 <img> 标签） */
const imageCount = computed(() => (props.modelValue.match(/<img/g) || []).length)

function handleChange(text: string) {
  emit('update:modelValue', text)
}

async function handleUploadImage(event: any, insertImage: (url: string, alt: string) => void) {
  const file = event.target?.files?.[0]
  if (!file) return

  if (props.maxImages != null && imageCount.value >= props.maxImages) {
    message.warning(`最多插入 ${props.maxImages} 张图片`)
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ''}`
      },
      body: formData
    })

    const result = await response.json()
    if (result.data?.url) {
      insertImage(result.data.url, '图片')
    } else {
      message.error(result.message || '图片上传失败')
    }
  } catch {
    message.error('图片上传失败')
  }
}
</script>
<style scoped>
.markdown-editor {
  width: 100%;
}
.markdown-editor :deep(.v-md-editor) {
  width: 100%;
}
</style>
