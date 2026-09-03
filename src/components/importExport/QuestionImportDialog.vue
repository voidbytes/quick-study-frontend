<template>
  <n-modal :show="show" preset="card" style="width: 560px; max-width: 94vw" title="导入题目" @update:show="close">
    <!-- 步骤一：选择目标题库 + 文件 -->
    <template v-if="step === 'pick'">
      <div class="flex flex-col gap-4">
        <div v-if="!presetBankId">
          <div class="text-sm text-neutral-600 mb-2">导入到题库（需为你的题库）</div>
          <n-select
            v-model:value="targetBankId"
            :options="bankOptions"
            placeholder="选择目标题库"
            filterable
            clearable
          />
          <n-empty
            v-if="bankOptions.length === 0"
            title="暂无可导入的题库"
            description="请先创建自己的题库"
            size="small"
            class="mt-2"
          />
        </div>
        <div v-else>
          <div class="text-sm text-neutral-600 mb-2">导入到题库</div>
          <div class="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-neutral-800">
            {{ bankName || bankId }}
          </div>
        </div>

        <div>
          <div class="text-sm text-neutral-600 mb-2">选择文件</div>
          <input
            ref="fileInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="onFileChange"
          />
          <div
            class="border border-dashed border-neutral-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
            @click="fileInput?.click()"
          >
            <n-icon :size="26" :component="CloudUploadOutline" class="text-neutral-400" />
            <div class="text-sm text-neutral-600 mt-2">点击选择题库/题目导出的 JSON 文件</div>
            <div class="text-xs text-neutral-400 mt-1">题库导出文件导入时只取其题目</div>
          </div>
        </div>

        <div v-if="parsed" class="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
          <div class="flex items-center gap-2 text-sm">
            <n-icon :component="DocumentTextOutline" class="text-primary-500 flex-shrink-0" />
            <span class="font-medium text-neutral-800 truncate">{{ fileName }}</span>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-neutral-500">
            <span>题目数：<b class="text-neutral-800">{{ parsed.questionCount }}</b></span>
            <span>标签引用：<b class="text-neutral-800">{{ parsed.tagCount }}</b></span>
          </div>
          <div v-if="parsed.format === 'quick-study-bank'" class="mt-1 text-xs text-primary-500">
            检测为「题库导出」文件，将导入其中的全部题目
          </div>
          <div class="mt-1 text-xs text-warning-500">与目标题库已有题目题干重复的将被跳过</div>
        </div>
      </div>
    </template>

    <!-- 步骤二：结果 -->
    <ImportResultPanel v-else-if="step === 'result'" :result="importResult" @done="close" />

    <template #footer v-if="step === 'pick'">
      <div class="flex justify-end gap-2">
        <n-button @click="close">取消</n-button>
        <n-button
          type="primary"
          :disabled="!parsed || !selectedFile || !(presetBankId || targetBankId)"
          :loading="importing"
          @click="handleImport"
        >
          开始导入
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { CloudUploadOutline, DocumentTextOutline } from '@vicons/ionicons5'
import { importQuestions } from '@/api/importExport'
import { getBankList } from '@/api/bank'
import { parseImportFile, type ParsedImportFile } from '@/utils/importFile'
import { useAuthStore } from '@/stores/auth'
import type { ImportResult } from '@/types'
import ImportResultPanel from './ImportResultPanel.vue'

const props = defineProps<{
  show: boolean
  /** 指定目标题库（题库详情页场景）；为空则显示题库选择器 */
  bankId?: number | string
  /** 目标题库名称（展示用） */
  bankName?: string
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  imported: []
}>()

/** 是否由调用方指定了目标题库 */
const presetBankId = computed(
  () => props.bankId !== undefined && props.bankId !== null && props.bankId !== ''
)

const message = useMessage()
const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const selectedFile = ref<File | null>(null)
const parsed = ref<ParsedImportFile | null>(null)
const importing = ref(false)
const step = ref<'pick' | 'result'>('pick')
const importResult = ref<ImportResult | null>(null)

const targetBankId = ref<number | string | null>(null)
const bankOptions = ref<SelectOption[]>([])

async function fetchBankOptions() {
  try {
    const res = await getBankList({ page: 1, size: 1000 })
    const me = authStore.userInfo?.id
    bankOptions.value = (res.data.records || [])
      .filter((b: any) => authStore.isAdmin || String(b.creatorId) === String(me))
      .map((b: any) => ({ label: b.name, value: b.id }))
  } catch {
    // 忽略：目标题库由 props 传入时无需下拉
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      step.value = 'pick'
      parsed.value = null
      fileName.value = ''
      selectedFile.value = null
      importResult.value = null
      targetBankId.value = null
      if (fileInput.value) fileInput.value.value = ''
      if (!presetBankId.value) fetchBankOptions()
    }
  }
)

onMounted(() => {
  if (props.show && !presetBankId.value) fetchBankOptions()
})

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
    parsed.value = await parseImportFile(file)
    fileName.value = file.name
    selectedFile.value = file
  } catch (err: any) {
    message.error(err?.message || '文件解析失败')
  }
}

async function handleImport() {
  const targetId = presetBankId.value ? props.bankId : targetBankId.value
  if (!parsed.value || !selectedFile.value || !targetId) return
  importing.value = true
  try {
    const res = await importQuestions(targetId, selectedFile.value)
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
</style>
