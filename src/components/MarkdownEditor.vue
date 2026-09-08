<template>
  <!-- w-full：组件位于 n-form-item-blank（flex 容器）内，
       缺省 flex-basis:auto 会收缩到内容固有宽度(~420px)，必须显式撑满 -->
  <div class="markdown-editor w-full border rounded">
    <v-md-editor
      :model-value="modelValue"
      :height="height"
      :mode="mode"
      :placeholder="placeholder"
      :disabled-menus="effectiveDisabledMenus"
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
import { API_BASE_URL, TOKEN_KEY } from '@/utils/constants'

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
    /**
     * 禁图模式（笔记场景）：隐藏图片菜单 + 拦截拖拽/粘贴上传。
     * 优先级高于 maxImages。
     */
    disableImage?: boolean
  }>(),
  {
    height: '400px',
    placeholder: '',
    disabledMenus: () => [],
    disableImage: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const message = useMessage()

/** 禁图模式下追加屏蔽图片工具栏菜单 */
const effectiveDisabledMenus = computed(() =>
  props.disableImage ? [...props.disabledMenus, 'image'] : props.disabledMenus
)

/**
 * 已插入图片数。注意 v-model / @change 输出的是 Markdown 源码，
 * 工具栏插入形如 `![图片](url)`；仅用户手写 HTML 时才出现 `<img>`。
 */
const imageCount = computed(
  () => (props.modelValue.match(/!\[[^\]]*\]\([^)]*\)|<img\b/g) || []).length
)

function handleChange(text: string) {
  emit('update:modelValue', text)
}

async function handleUploadImage(event: any, insertImage: (url: string, alt: string) => void) {
  const file = event.target?.files?.[0]
  if (!file) return

  // 禁图模式：拦截拖拽 / 粘贴 / 菜单触发的上传（笔记场景）
  if (props.disableImage) {
    message.warning('笔记不支持图片')
    return
  }

  if (props.maxImages != null && imageCount.value >= props.maxImages) {
    message.warning(`最多插入 ${props.maxImages} 张图片`)
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
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
