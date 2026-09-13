<template>
  <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
    <!-- 工具栏：语言选择 + 资源限制提示 -->
    <div class="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-200 bg-neutral-50 flex-wrap">
      <div class="flex items-center gap-2">
        <span class="text-xs text-neutral-500">语言</span>
        <n-select
          v-model:value="langCode"
          :options="langOptions"
          size="small"
          class="w-40"
          :disabled="locked"
          @update:value="onLangChange"
        />
      </div>
      <span v-if="props.programming" class="text-xs text-neutral-400">
        时间 {{ props.programming.timeLimitMs }}ms · 内存
        {{ Math.round((props.programming.memoryLimitKb || 131072) / 1024) }}MB
      </span>
      <n-tag v-if="!props.programming" size="small" round type="warning">仅样例加载失败，可编辑但无法运行</n-tag>
      <span class="flex-1" />
      <span class="text-xs text-neutral-400">Ctrl/⌘ + Enter 运行样例</span>
    </div>

    <!-- 代码编辑器 -->
    <div class="panel-editor" ref="editorEl" />

    <!-- 操作区 -->
    <div class="flex items-center gap-2 px-4 py-2.5 border-t border-neutral-200 bg-neutral-50">
      <n-button size="small" :loading="runningSample" :disabled="locked" @click="runSample">
        <template #icon><n-icon><PlayOutline /></n-icon></template>
        运行样例
      </n-button>
      <n-button
        v-if="props.mode === 'practice'"
        size="small"
        type="primary"
        :loading="submitting"
        :disabled="locked"
        @click="submitJudge"
      >
        <template #icon><n-icon><CheckmarkDoneOutline /></n-icon></template>
        提交判题
      </n-button>
      <span v-if="locked" class="text-xs text-neutral-400">已提交，答案已锁定</span>
      <span class="flex-1" />
      <n-button size="tiny" quaternary @click="loadSample">还原模板</n-button>
      <n-button size="tiny" quaternary :disabled="!code" @click="clearCode">清空</n-button>
    </div>

    <!-- 结果区 -->
    <div v-if="hasResult" class="border-t border-neutral-200">
      <!-- 判题结果（practice） -->
      <div v-if="finalResult" class="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div class="flex items-center gap-2 mb-2">
          <n-tag :type="finalTagType" size="small" round>{{ finalResult }}</n-tag>
          <span class="text-xs text-neutral-500">
            {{ passCount }}/{{ totalCount }} 用例通过
            <template v-if="maxTimeMs > 0"> · 最大耗时 {{ maxTimeMs }}ms</template>
          </span>
        </div>
        <pre
          v-if="compileMessage"
          class="text-xs text-error-600 whitespace-pre-wrap break-all font-mono max-h-40 overflow-auto bg-white border border-error-100 rounded p-2"
        >{{ compileMessage }}</pre>
        <div v-if="submissionCases.length" class="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          <div
            v-for="c in submissionCases"
            :key="c.sortOrder"
            class="text-xs border rounded px-2 py-1 flex items-center gap-1.5"
            :class="caseClass(c.result)"
          >
            <span class="font-medium">#{{ c.sortOrder }}</span>
            <span class="font-bold">{{ c.result }}</span>
            <span class="text-neutral-400 ml-auto">{{ c.timeMs }}ms</span>
          </div>
        </div>
      </div>

      <!-- 运行样例结果 -->
      <div v-if="sampleRun" class="px-4 py-3">
        <div class="text-xs font-medium text-neutral-500 mb-2">样例运行结果</div>
        <pre
          v-if="sampleRun.compileError"
          class="text-xs text-error-600 whitespace-pre-wrap break-all font-mono max-h-48 overflow-auto bg-white border border-error-100 rounded p-2"
        >{{ sampleRun.compileError }}</pre>
        <div v-else class="space-y-2">
          <div
            v-for="r in sampleRun.results"
            :key="r.sortOrder"
            class="border border-neutral-200 rounded p-2 text-xs"
          >
            <div class="flex items-center gap-2 mb-1">
              <n-tag :type="r.result === 'AC' ? 'success' : 'error'" size="tiny" round>{{ r.result }}</n-tag>
              <span class="text-neutral-500">用例 {{ r.sortOrder }} · {{ r.timeMs }}ms</span>
            </div>
            <div class="grid sm:grid-cols-2 gap-1.5">
              <div class="bg-neutral-50 rounded p-1.5">
                <span class="text-neutral-400">输入</span>
                <pre class="whitespace-pre-wrap break-all font-mono mt-0.5">{{ r.input || '（空）' }}</pre>
              </div>
              <div class="bg-neutral-50 rounded p-1.5">
                <span class="text-neutral-400">期望</span>
                <pre class="whitespace-pre-wrap break-all font-mono mt-0.5">{{ r.expectedOutput }}</pre>
              </div>
            </div>
            <div class="mt-1 bg-neutral-50 rounded p-1.5">
              <span class="text-neutral-400">实际输出</span>
              <pre class="whitespace-pre-wrap break-all font-mono mt-0.5">{{ r.actualOutput || '（空）' }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useMessage } from 'naive-ui'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material-darker.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/go/go.js'
import { PlayOutline, CheckmarkDoneOutline } from '@vicons/ionicons5'
import {
  getProgrammingLanguages,
  runSampleInExam,
  runSampleInPractice,
  submitCode,
  getSubmission,
  getSubmissionCases,
  type ProgrammingLanguage,
  type RunSampleResponseData,
  type SubmissionResponseData,
  type SubmissionCaseDetail
} from '@/api/judge'

/** 答题者视角的编程题配置（后端 ProgrammingAnswerView 脱敏投影） */
export interface ProgrammingAnswerView {
  timeLimitMs?: number
  memoryLimitKb?: number
  /** null = 不限制（全部启用语言） */
  allowedLanguages?: string[] | null
  starterCode?: Record<string, string>
  sampleCases?: { sortOrder: number; input: string; expectedOutput: string }[]
}

const props = defineProps<{
  programming: ProgrammingAnswerView | null
  mode: 'practice' | 'exam'
  sessionId: number | string
  questionIndex?: number
  paperQuestionId?: number | string
  initialCode?: string
  initialLanguageId?: string
  /** 已提交/已交卷后锁定编辑 */
  locked?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', payload: { code: string; languageId: string | null }): void
  (e: 'answered', payload: { code: string; languageId: string; submissionId: string }): void
}>()

const message = useMessage()

// ---------------- 语言 ----------------
const languages = ref<ProgrammingLanguage[]>([])
const langCode = ref('')

/** 判题语言 code → CodeMirror mode（判题语言表 code 与 Playground code 一致） */
const CM_MODES: Record<string, string> = {
  cpp: 'text/x-c++src',
  c: 'text/x-csrc',
  java: 'text/x-java',
  py: 'python',
  js: 'javascript',
  ts: 'text/typescript',
  go: 'go'
}

/** 可见语言：题目限制时仅允许列表，否则全部启用语言 */
const visibleLanguages = computed(() => {
  const allowed = props.programming?.allowedLanguages
  if (allowed && allowed.length > 0) {
    const allowedSet = new Set(allowed)
    return languages.value.filter((l) => allowedSet.has(l.code))
  }
  return languages.value
})

const langOptions = computed(() =>
  visibleLanguages.value.map((l) => ({ label: l.name, value: l.code }))
)

const currentLang = computed(() => languages.value.find((l) => l.code === langCode.value))

// ---------------- 编辑器 ----------------
const editorEl = ref<HTMLElement | null>(null)
let editor: CodeMirror.Editor | null = null
let syncingFromEditor = false

const code = ref('')

function setEditorMode(lang: string) {
  if (!editor) return
  editor.setOption('mode', CM_MODES[lang] || 'text/x-c++src')
}

/** 当前语言的初始模板（题目配置优先，其次父级传入的已答代码由 initialCode 生效） */
function starterFor(lang: string): string {
  return props.programming?.starterCode?.[lang] ?? ''
}

/** 语言切换：代码仍是"旧语言模板原文/空白"时自动换新语言模板，用户已编辑内容不覆盖 */
function onLangChange(lang: string) {
  if (editor && editor.getValue().length > 0) {
    const trimmed = editor.getValue().trim()
    const expectedOld = starterFor(oldLangCode)
    if (trimmed && trimmed !== expectedOld.trim()) {
      return // 已编辑，不覆盖
    }
  }
  code.value = starterFor(lang)
  emitChange()
}

let oldLangCode = ''

function loadSample() {
  code.value = starterFor(langCode.value)
  emitChange()
}

function clearCode() {
  code.value = ''
  emitChange()
}

function emitChange() {
  emit('change', { code: code.value, languageId: currentLang.value?.id ?? null })
}

// ---------------- 运行样例 / 提交判题 ----------------
const runningSample = ref(false)
const submitting = ref(false)
const sampleRun = ref<RunSampleResponseData | null>(null)
const finalResult = ref('')
const passCount = ref(0)
const totalCount = ref(0)
const maxTimeMs = ref(0)
const compileMessage = ref('')
const submissionCases = ref<SubmissionCaseDetail[]>([])

const hasResult = computed(() => !!sampleRun.value || !!finalResult.value)

const finalTagType = computed(() => {
  switch (finalResult.value) {
    case 'AC': return 'success'
    case 'CE': return 'warning'
    case 'TLE': case 'MLE': return 'warning'
    case 'RE': case 'SE': return 'error'
    default: return 'default'
  }
})

function caseClass(result: string): string {
  if (result === 'AC') return 'border-success-200 bg-success-50 text-success-700'
  if (result === 'SKIP') return 'border-neutral-200 bg-neutral-50 text-neutral-400'
  return 'border-error-200 bg-error-50 text-error-700'
}

/** 运行样例：按场景调用对应快照端点 */
async function runSample() {
  if (runningSample.value) return
  const trimmed = code.value.trim()
  if (!trimmed) {
    message.warning('请先编写代码')
    return
  }
  if (!currentLang.value) {
    message.warning('请先选择语言')
    return
  }
  runningSample.value = true
  finalResult.value = ''
  submissionCases.value = []
  try {
    const payload = { languageCode: langCode.value, code: code.value }
    let res
    if (props.mode === 'practice') {
      res = await runSampleInPractice(props.sessionId, props.questionIndex!, payload)
    } else {
      res = await runSampleInExam(props.sessionId, props.paperQuestionId!, payload)
    }
    sampleRun.value = res.data
  } catch (e: any) {
    message.error(e?.response?.data?.message || '运行样例失败')
  } finally {
    runningSample.value = false
  }
}

/** 练习：提交判题 + 轮询结果 */
async function submitJudge() {
  if (submitting.value) return
  const trimmed = code.value.trim()
  if (!trimmed) {
    message.warning('请先编写代码')
    return
  }
  if (!currentLang.value) {
    message.warning('请先选择语言')
    return
  }
  submitting.value = true
  sampleRun.value = null
  try {
    const res = await submitCode(props.sessionId, props.questionIndex!, {
      languageId: currentLang.value.id,
      code: code.value
    })
    const submissionId = res.data.id
    // 轮询判题结果（异步 worker，PENDING/JUDGING → FINISHED/ERROR）
    const final = await pollSubmission(submissionId)
    // 非终态（轮询 30s 未完成，异常场景）：不臆造判题结果，提示后由判题记录兜底
    if (final.status !== 'FINISHED' && final.status !== 'ERROR') {
      finalResult.value = ''
      emit('answered', { code: code.value, languageId: currentLang.value.id, submissionId })
      message.info('判题仍在进行，请稍后在练习记录中查看结果')
      return
    }
    compileMessage.value = final.compileMessage || ''
    finalResult.value = final.result || 'SE'
    passCount.value = final.passCount ?? 0
    totalCount.value = final.totalCount ?? 0
    maxTimeMs.value = final.maxTimeMs ?? 0
    if (finalResult.value !== 'CE') {
      try {
        const casesRes = await getSubmissionCases(submissionId)
        submissionCases.value = casesRes.data?.cases || []
      } catch {
        // 用例详情加载失败不阻塞结果展示
      }
    }
    emit('answered', { code: code.value, languageId: currentLang.value.id, submissionId })
    if (finalResult.value === 'AC') {
      message.success('判题通过（AC）')
    } else {
      message.info(`判题完成：${finalResult.value}`)
    }
  } catch (e: any) {
    message.error(e?.response?.data?.message || '提交判题失败')
  } finally {
    submitting.value = false
  }
}

/** 轮询判题状态：最多 30 秒（0.8s 间隔 × ~38 次） */
function pollSubmission(submissionId: string, attempts = 0): Promise<SubmissionResponseData> {
  return getSubmission(submissionId).then((res) => {
    const sub = res.data
    if (sub.status === 'FINISHED' || sub.status === 'ERROR' || attempts >= 38) {
      return sub
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(pollSubmission(submissionId, attempts + 1)), 800)
    })
  })
}

// ---------------- 生命周期 ----------------
onMounted(async () => {
  try {
    const res = await getProgrammingLanguages()
    languages.value = res.data
  } catch {
    // 语言列表加载失败：组件退化为只读提示
  }
  // 初始语言：父级回传语言 ID > 题目限制第一个 > 全量第一个
  const allowed = props.programming?.allowedLanguages
  const visible = visibleLanguages.value
  const byId = props.initialLanguageId
    ? visible.find((l) => l.id === props.initialLanguageId)
    : undefined
  const firstAllowed = allowed?.length
    ? visible.find((l) => allowed.includes(l.code))
    : undefined
  const initial = byId || firstAllowed || visible[0]
  oldLangCode = initial?.code ?? ''
  langCode.value = initial?.code ?? ''

  // 初始代码：已答代码（断点恢复）优先，其次题目模板
  code.value = props.initialCode ?? starterFor(langCode.value)

  if (editorEl.value) {
    editor = CodeMirror(editorEl.value, {
      value: code.value,
      mode: CM_MODES[langCode.value] || 'text/x-c++src',
      lineNumbers: true,
      lineWrapping: false,
      indentUnit: 4,
      tabSize: 4,
      extraKeys: {
        'Ctrl-Enter': () => { void runSample() },
        'Cmd-Enter': () => { void runSample() }
      }
    })
    editor.on('change', () => {
      if (!editor) return
      syncingFromEditor = true
      code.value = editor.getValue()
      syncingFromEditor = false
      emitChange()
    })
  }
})

onBeforeUnmount(() => {
  editor = null
})

watch(langCode, (lang, old) => {
  oldLangCode = old ?? ''
  setEditorMode(lang)
})

watch(
  () => props.locked,
  (locked) => {
    if (editor) {
      editor.setOption('readOnly', locked)
    }
  }
)

watch(code, () => {
  if (editor && !syncingFromEditor && editor.getValue() !== code.value) {
    editor.setValue(code.value)
  }
})
</script>

<style scoped>
.panel-editor :deep(.CodeMirror) {
  height: auto;
  min-height: 280px;
  font-family: var(--font-mono);
  font-size: 13.5px;
  line-height: 1.6;
}
.panel-editor :deep(.CodeMirror-scroll) {
  min-height: 280px;
}
</style>