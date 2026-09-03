<template>
  <n-modal :show="show" preset="card" style="width: 540px; max-width: 94vw" title="导入题库" @update:show="close">
    <!-- 步骤一：选择文件并预览 -->
    <template v-if="step === 'pick'">
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        class="hidden"
        @change="onFileChange"
      />
      <div
        class="border border-dashed border-neutral-300 rounded-lg px-4 py-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
        @click="fileInput?.click()"
      >
        <n-icon :size="28" :component="CloudUploadOutline" class="text-neutral-400" />
        <div class="text-sm text-neutral-600 mt-2">点击选择导出的题库 JSON 文件</div>
        <div class="text-xs text-neutral-400 mt-1">仅支持本系统导出的 .json 文件</div>
      </div>

      <!-- 文件预览 -->
      <div v-if="parsed" class="mt-4 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
        <div class="flex items-center gap-2 text-sm">
          <n-icon :component="DocumentTextOutline" class="text-primary-500 flex-shrink-0" />
          <span class="font-medium text-neutral-800 truncate">{{ fileName }}</span>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-neutral-500">
          <span>题库名称：<b class="text-neutral-800">{{ parsed.bankName || '-' }}</b></span>
          <span>题目数：<b class="text-neutral-800">{{ parsed.questionCount }}</b></span>
          <span>标签引用：<b class="text-neutral-800">{{ parsed.tagCount }}</b></span>
        </div>
        <div v-if="parsed.bankDescription" class="mt-1 text-xs text-neutral-400 line-clamp-1">
          {{ parsed.bankDescription }}
        </div>
      </div>

      <div class="text-xs text-neutral-400 mt-3 leading-relaxed">
        说明：导入后将在你的名下创建一个<b>私有题库</b>。若你已拥有同名题库，本次导入将被拒绝。
      </div>
    </template>

    <!-- 步骤二：结果 -->
    <ImportResultPanel v-else-if="step === 'result'" :result="importResult" @done="close" />

    <template #footer v-if="step === 'pick'">
      <div class="flex justify-end gap-2">
        <n-button @click="close">取消</n-button>
        <n-button type="primary" :disabled="!parsed || !selectedFile" :loading="importing" @click="handleImport">
          开始导入
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { CloudUploadOutline, DocumentTextOutline } from '@vicons/ionicons5'
import { importBank } from '@/api/importExport'
import { parseImportFile, type ParsedImportFile } from '@/utils/importFile'
import type { ImportResult } from '@/types'
import ImportResultPanel from './ImportResultPanel.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  imported: []
}>()

const message = useMessage()
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const selectedFile = ref<File | null>(null)
const parsed = ref<ParsedImportFile | null>(null)
const importing = ref(false)
const step = ref<'pick' | 'result'>('pick')
const importResult = ref<ImportResult | null>(null)

watch(
  () => props.show,
  (val) => {
    if (val) {
      step.value = 'pick'
      parsed.value = null
      fileName.value = ''
      selectedFile.value = null
      importResult.value = null
      if (fileInput.value) fileInput.value.value = ''
    }
  }
)

function close() {
  emit('update:show', false)
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  parsed.value = null
  selectedFile.value = null
  if (!file) return
  try {
    const info = await parseImportFile(file)
    if (info.format !== 'quick-study-bank') {
      message.warning('该文件是「题目导出」文件，请使用「导入题目」功能')
      return
    }
    parsed.value = info
    fileName.value = file.name
    selectedFile.value = file
  } catch (err: any) {
    message.error(err?.message || '文件解析失败')
  }
}

async function handleImport() {
  if (!parsed.value || !selectedFile.value) return
  importing.value = true
  try {
    const res = await importBank(selectedFile.value)
    importResult.value = res.data
    step.value = 'result'
    emit('imported')
  } catch (err: any) {
    message.error(err?.message || '导入失败')
  } finally {
    importing.value = false
  }
}

defineExpose({})
</script>

<style scoped>
.hidden {
  display: none;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
