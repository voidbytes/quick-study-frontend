<template>
  <div class="min-h-screen bg-neutral-100">
    <!-- 顶部 sticky 导航 -->
    <header class="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div class="max-w-content mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <h1 class="text-lg font-bold text-neutral-900 truncate">{{ paperTitle }}</h1>
        <div class="flex items-center gap-4 flex-shrink-0">
          <span class="hidden md:inline text-sm text-neutral-500">
            已答 <span class="text-success-600 font-semibold">{{ answeredCount }}</span>
            / {{ questions.length }} 题
          </span>
          <span
            class="text-xl font-mono font-bold tabular-nums"
            :class="timeRemaining <= 300 ? 'text-error-500 animate-pulse' : 'text-neutral-900'"
          >
            {{ formattedTime }}
          </span>
          <n-button type="error" :disabled="submitting" @click="handleSubmit">交卷</n-button>
        </div>
      </div>
    </header>

    <div class="max-w-content mx-auto p-6 flex gap-6 items-start">
      <!-- 左侧题目导航 -->
      <aside class="w-52 shrink-0 hidden lg:block">
        <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div class="px-4 py-3 border-b border-neutral-200">
            <span class="text-base font-semibold text-neutral-900">题目导航</span>
          </div>
          <div class="p-4">
            <QuestionNavGrid :items="navStatusList" @select="goToQuestion" />

            <!-- 图例 -->
            <div class="mt-4 space-y-2">
              <div class="flex items-center gap-2 text-sm text-neutral-600">
                <span class="w-3.5 h-3.5 rounded bg-primary-500 flex-shrink-0" />当前
              </div>
              <div class="flex items-center gap-2 text-sm text-neutral-600">
                <span class="w-3.5 h-3.5 rounded bg-success-500 flex-shrink-0" />已答
              </div>
              <div class="flex items-center gap-2 text-sm text-neutral-600">
                <span class="w-3.5 h-3.5 rounded bg-neutral-100 border border-neutral-200 flex-shrink-0" />未答
              </div>
              <div class="flex items-center gap-2 text-sm text-neutral-600">
                <span class="w-3.5 h-3.5 rounded bg-warning-500 flex-shrink-0" />待检查
              </div>
            </div>

            <!-- 汇总 -->
            <div class="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-500">
              已答：<span class="text-success-600 font-semibold">{{ answeredCount }} 题</span>
              / 未答：<span class="text-neutral-500 font-semibold">{{ unansweredCount }} 题</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 答题主区 -->
      <main class="flex-1 min-w-0">
        <div class="bg-white border border-neutral-200 rounded-lg p-6 md:p-8">
          <!-- 题目头部 -->
          <div class="flex items-center gap-3 flex-wrap mb-5">
            <span class="text-base font-bold text-neutral-900">
              第 {{ currentIndex + 1 }} 题
              <span class="text-sm font-medium text-neutral-500">/ 共 {{ questions.length }} 题</span>
            </span>
            <n-tag size="small" round :type="typeTagType(currentQuestion?.type)">
              {{ typeLabel(currentQuestion?.type) }}
            </n-tag>
            <n-tag size="small" round :type="difficultyTagType(currentQuestion?.difficulty)">
              {{ difficultyLabel(currentQuestion?.difficulty) }}
            </n-tag>
            <div class="flex-1" />
            <n-button
              v-if="currentQuestion"
              size="small"
              quaternary
              :type="isMarkedForReview(currentIndex) ? 'warning' : 'default'"
              @click="toggleMarkForReview(currentIndex)"
            >
              {{ isMarkedForReview(currentIndex) ? '✓ 已标记待检查' : '标记待检查' }}
            </n-button>
          </div>

          <!-- 题干（富文本） -->
          <div class="exam-stem mb-6">
            <RichText :content="parsedContent" />
          </div>

          <!-- 作答区 -->
          <div>
            <!-- 单选题（按 option_id 选择，字母为展示序号） -->
            <template v-if="currentQuestion && currentQuestion.type === 'SINGLE'">
              <QuestionOption
                v-for="(opt, idx) in parsedOptions"
                :key="opt.id"
                :marker="optionMarker(idx)"
                :selected="currentAnswers[currentQuestion.id] === opt.id"
                @select="selectAnswer(opt.id)"
              >
                <RichText :content="opt.text" />
              </QuestionOption>
            </template>

            <!-- 多选题 -->
            <template v-if="currentQuestion && currentQuestion.type === 'MULTIPLE'">
              <QuestionOption
                v-for="(opt, idx) in parsedOptions"
                :key="opt.id"
                :marker="optionMarker(idx)"
                :selected="isMultipleSelected(opt.id)"
                @select="toggleMultipleAnswer(opt.id)"
              >
                <RichText :content="opt.text" />
              </QuestionOption>
            </template>

            <!-- 判断题：id 模型 0=正确 / 1=错误 -->
            <template v-if="currentQuestion && currentQuestion.type === 'TRUE_FALSE'">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <QuestionOption
                  marker="√"
                  :selected="currentAnswers[currentQuestion.id] === TRUE_FALSE_TRUE_ID"
                  @select="selectAnswer(TRUE_FALSE_TRUE_ID)"
                >
                  正确
                </QuestionOption>
                <QuestionOption
                  marker="×"
                  :selected="currentAnswers[currentQuestion.id] === TRUE_FALSE_FALSE_ID"
                  @select="selectAnswer(TRUE_FALSE_FALSE_ID)"
                >
                  错误
                </QuestionOption>
              </div>
            </template>

            <!-- 填空题 -->
            <!-- 注意：naive-ui 输入组件在 value 为 undefined 时会退回非受控内部状态，
                 导致切题后残留上一题的文字（历史 bug）。这里显式给默认值 '' 并按题目 id
                 强制重建组件，保证每题作答区完全隔离。 -->
            <template v-if="currentQuestion && currentQuestion.type === 'FILL_BLANK'">
              <label class="block text-sm font-medium text-neutral-700 mb-2">请填写答案</label>
              <n-input
                :key="`fill-${currentQuestion.id}`"
                :value="fillAnswers[currentQuestion.id] || ''"
                type="textarea"
                placeholder="请输入答案"
                :rows="4"
                @update:value="(v: string) => { fillAnswers[currentQuestion.id] = v }"
                @blur="saveFillAnswer"
              />
            </template>

            <!-- 简答题：富媒体作答（富文本 + 图片，与题目创建侧同款编辑器） -->
            <template v-if="currentQuestion && currentQuestion.type === 'SHORT_ANSWER'">
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                请作答（支持文字、图片与公式）
              </label>
              <MarkdownEditor
                :key="`short-${currentQuestion.id}`"
                :model-value="fillAnswers[currentQuestion.id] || ''"
                mode="edit"
                height="280px"
                placeholder="输入文字作答，可通过工具栏插入图片（最多 9 张）"
                :max-images="9"
                :disabled-menus="answerDisabledMenus"
                @update:model-value="handleShortAnswerChange"
              />
            </template>

            <!-- 编程题：语言选择（受题目限制）/ 运行样例 / 草稿自动保存 -->
            <template v-if="currentQuestion && currentQuestion.type === 'PROGRAMMING'">
              <ProgrammingAnswerPanel
                :key="`prog-${currentQuestion.id}`"
                :programming="currentQuestion.programming ?? null"
                mode="exam"
                :session-id="sessionId ?? ''"
                :paper-question-id="currentQuestion.id"
                :initial-code="progAnswers[currentQuestion.id]?.code"
                :initial-language-id="progAnswers[currentQuestion.id]?.languageId || undefined"
                @change="onProgrammingChange"
              />
            </template>
          </div>

          <!-- 导航按钮 -->
          <div class="flex justify-between items-center mt-8 pt-5 border-t border-neutral-200">
            <n-button :disabled="currentIndex === 0" @click="prevQuestion">
              上一题
            </n-button>
            <n-button v-if="currentIndex < questions.length - 1" type="primary" @click="nextQuestion">
              下一题
            </n-button>
            <n-button v-else type="success" @click="handleSubmit">
              完成作答
            </n-button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { startSession, getSession, saveAnswers, submitSession, reportCheat } from '@/api/exam'
import type { QuestionItem, AnswerItem } from '@/api/exam'
import type { OptionItem } from '@/types'
import {
  parseOptionList,
  parseAnswerIds,
  formatAnswerIds,
  optionMarker,
  TRUE_FALSE_TRUE_ID,
  TRUE_FALSE_FALSE_ID
} from '@/utils/answer'
import { QUESTION_TYPE_MAP } from '@/utils/constants'
import { useConfirm } from '@/composables/useConfirm'
import type { QuestionNavStatus } from '@/components/common/questionNav'
import QuestionNavGrid from '@/components/common/QuestionNavGrid.vue'
import QuestionOption from '@/components/common/QuestionOption.vue'
import RichText from '@/components/common/RichText.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import ProgrammingAnswerPanel from '@/components/programming/ProgrammingAnswerPanel.vue'
import type { ProgrammingAnswerView } from '@/components/programming/ProgrammingAnswerPanel.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { confirm } = useConfirm()

const paperId = route.params.id as string
const sessionId = ref<string | null>(null)
const paperTitle = ref('')
/** 作答页题目行：后端还会下发 difficulty 等展示字段 */
interface ExamQuestion extends QuestionItem {
  difficulty?: string
}
/** 编程题答案（id → 代码 + 语言），语言为 null 表示尚未选择/不可用 */
interface ProgAnswer {
  code: string
  languageId: number | null
}
const questions = ref<ExamQuestion[]>([])
const currentIndex = ref(0)
const fillAnswers = reactive<Record<number, string>>({})
const progAnswers = reactive<Record<number, ProgAnswer>>({})
const markedForReview = ref<Set<number>>(new Set())
const timeRemaining = ref(0)
const timerHandle = ref<ReturnType<typeof setInterval> | null>(null)
const submitting = ref(false)
const cheatCount = ref(0)

const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }

/** 作答状态：客观题存 option_id（单选/判断）或 id 数组（多选），提交时统一序列化 */
const currentAnswers = reactive<Record<number, number | number[]>>({})

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

/** options 已由后端下发为 OptionItem 对象数组（成卷快照，乱序后顺序） */
const parsedOptions = computed<OptionItem[]>(() => {
  const q = currentQuestion.value
  if (!q || !q.options) return []
  return parseOptionList(q.options)
})

/** 解析 content JSON 字符串，提取 content 字段 */
const parsedContent = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.content) return ''
  try {
    const parsed = JSON.parse(q.content)
    return parsed.content || ''
  } catch {
    return q.content
  }
})

const answeredCount = computed(() => {
  let count = 0
  questions.value.forEach((q) => {
    if (hasAnswer(q)) count++
  })
  return count
})

const unansweredCount = computed(() => questions.value.length - answeredCount.value)

/** 导航网格状态：当前 > 标记 > 已答 > 未答 */
const navStatusList = computed<QuestionNavStatus[]>(() =>
  questions.value.map((q, index) => {
    if (currentIndex.value === index) return 'current'
    if (markedForReview.value.has(index)) return 'review'
    return hasAnswer(q) ? 'answered' : 'unanswered'
  })
)

const formattedTime = computed(() => {
  if (timeRemaining.value <= 0) return '00:00'
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function hasAnswer(q: ExamQuestion): boolean {
  if (q.type === 'PROGRAMMING') return !!progAnswers[q.id]?.code?.trim()
  if (q.type === 'MULTIPLE') return ((currentAnswers[q.id] as number[] | undefined)?.length ?? 0) > 0
  if (q.type === 'FILL_BLANK') return !!fillAnswers[q.id]?.trim()
  if (q.type === 'SHORT_ANSWER') {
    const ans = fillAnswers[q.id]
    if (!ans) return false
    // 富文本答案：含图片即算已答；纯文字需 strip 标签后非空
    if (ans.includes('<img')) return true
    return !!ans.replace(/<[^>]+>/g, '').trim()
  }
  // 单选/判断：option_id（0 是合法值，不能真值判断）
  return currentAnswers[q.id] != null
}

function typeLabel(type?: string): string {
  return (type && QUESTION_TYPE_MAP[type as keyof typeof QUESTION_TYPE_MAP]) || '未知'
}

function difficultyLabel(d?: string): string {
  return d ? difficultyLabels[d] || '未知' : '未知'
}

function typeTagType(type?: string): 'default' | 'info' | 'primary' {
  if (type === 'SINGLE' || type === 'MULTIPLE' || type === 'PROGRAMMING') return 'primary'
  if (type === 'FILL_BLANK' || type === 'SHORT_ANSWER') return 'info'
  return 'default'
}

function difficultyTagType(d?: string): 'error' | 'warning' | 'success' {
  return d === 'HARD' ? 'error' : d === 'MEDIUM' ? 'warning' : 'success'
}

function goToQuestion(index: number) {
  currentIndex.value = index
}

function selectAnswer(id: number) {
  const q = currentQuestion.value
  if (!q) return
  currentAnswers[q.id] = id
  saveToLocal()
  autoSave()
}

function isMultipleSelected(id: number) {
  const q = currentQuestion.value
  if (!q) return false
  return ((currentAnswers[q.id] as number[] | undefined) || []).includes(id)
}

function toggleMultipleAnswer(id: number) {
  const q = currentQuestion.value
  if (!q) return
  const arr = (currentAnswers[q.id] as number[] | undefined) || []
  const idx = arr.indexOf(id)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(id)
  currentAnswers[q.id] = arr
  saveToLocal()
  autoSave()
}

function saveFillAnswer() {
  saveToLocal()
  autoSave()
}

/** 答题模式禁用的编辑器菜单：保留加粗/斜体/删除线/图片/公式，去掉低频排版项 */
const answerDisabledMenus = ['title', 'quote', 'code', 'table', 'hr', 'link', 'clear', 'sub', 'sup']

/** 富文本编辑无 blur 事件，change 防抖 2s 自动保存草稿（考试切屏计作弊，用户不会主动触发 blur） */
let shortAnswerSaveTimer: ReturnType<typeof setTimeout> | null = null

function handleShortAnswerChange(v: string) {
  const q = currentQuestion.value
  if (!q) return
  fillAnswers[q.id] = v
  saveToLocal()
  if (shortAnswerSaveTimer) clearTimeout(shortAnswerSaveTimer)
  shortAnswerSaveTimer = setTimeout(() => {
    shortAnswerSaveTimer = null
    autoSave()
  }, 2000)
}

/** 编程题草稿自动保存定时器（编辑防抖 2s，与简答题一致） */
let progSaveTimer: ReturnType<typeof setTimeout> | null = null

/** 编程题编辑：同步内存态 + 本地草稿，防抖自动保存（含语言ID，交卷判题用） */
function onProgrammingChange(payload: { code: string; languageId: number | null }) {
  const q = currentQuestion.value
  if (!q) return
  progAnswers[q.id] = { code: payload.code, languageId: payload.languageId }
  saveToLocal()
  if (progSaveTimer) clearTimeout(progSaveTimer)
  progSaveTimer = setTimeout(() => {
    progSaveTimer = null
    autoSave()
  }, 2000)
}

function isMarkedForReview(index: number) {
  return markedForReview.value.has(index)
}

function toggleMarkForReview(index: number) {
  if (markedForReview.value.has(index)) {
    markedForReview.value.delete(index)
  } else {
    markedForReview.value.add(index)
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

async function autoSave() {
  if (!sessionId.value) return
  try {
    const answers = buildAnswerPayload()
    await saveAnswers(sessionId.value, { answers })
  } catch {
    // 静默保存失败，下次再试
  }
}

function buildAnswerPayload() {
  return questions.value.map((q) => {
    if (q.type === 'PROGRAMMING') {
      const prog = progAnswers[q.id]
      return {
        paperQuestionId: q.id,
        answer: prog?.code || '',
        languageId: prog?.languageId ?? null
      }
    }
    let answer = ''
    if (hasAnswer(q)) {
      if (q.type === 'MULTIPLE') {
        // 多选：id 数组升序 JSON（与后端落库归一格式一致）
        answer = formatAnswerIds((currentAnswers[q.id] as number[]) || [])
      } else if (q.type === 'SINGLE' || q.type === 'TRUE_FALSE') {
        // 单选/判断：单 id JSON 数组（判断题 [0]=正确 / [1]=错误）
        answer = formatAnswerIds([currentAnswers[q.id] as number])
      } else {
        // 填空/简答：文本
        answer = fillAnswers[q.id] || ''
      }
    }
    return { paperQuestionId: q.id, answer }
  })
}

function saveToLocal() {
  const key = `exam_${sessionId.value}`
  localStorage.setItem(key, JSON.stringify({
    answers: { ...currentAnswers },
    fillAnswers: { ...fillAnswers },
    progAnswers: { ...progAnswers },
    currentIndex: currentIndex.value,
    markedForReview: Array.from(markedForReview.value)
  }))
}

function loadFromLocal() {
  const key = `exam_${sessionId.value}`
  try {
    const data = JSON.parse(localStorage.getItem(key) || '{}')
    if (data.answers) Object.assign(currentAnswers, data.answers)
    if (data.fillAnswers) Object.assign(fillAnswers, data.fillAnswers)
    if (data.progAnswers) Object.assign(progAnswers, data.progAnswers)
    if (data.currentIndex !== undefined) currentIndex.value = data.currentIndex
    if (data.markedForReview) markedForReview.value = new Set(data.markedForReview)
  } catch {
    // ignore
  }
}

async function initSession() {
  try {
    const res = await startSession(paperId)
    const data = res.data
    sessionId.value = data.sessionId
    paperTitle.value = (route.params.title as string) || '考试'
    questions.value = data.questions || []
    if (data.deadline) {
      timeRemaining.value = Math.max(0, Math.floor((new Date(data.deadline).getTime() - Date.now()) / 1000))
    }
    loadFromLocal()
    startTimer()
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || '无法开始作答'
    message.error(msg)
    router.push('/papers')
  }
}

function startTimer() {
  timerHandle.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      if (timeRemaining.value === 0) {
        autoSubmit()
      }
    }
  }, 1000)
}

async function autoSubmit() {
  message.warning('时间到，自动交卷')
  await autoSave()
  await confirmSubmit()
}

/** 交卷二次确认（未答提醒随弹窗内容展示） */
function handleSubmit() {
  if (!sessionId.value) return
  const answered = answeredCount.value
  const remain = unansweredCount.value
  const content = remain > 0
    ? `已答 ${answered} 题，还有 ${remain} 道题未作答。确定要提交试卷吗？`
    : `已答 ${answered} 题，确定要提交试卷吗？`
  confirm({
    title: '确认交卷',
    content,
    positiveText: '确认交卷',
    onPositiveClick: confirmSubmit
  })
}

async function confirmSubmit() {
  if (!sessionId.value) return
  submitting.value = true
  try {
    await autoSave()
    await submitSession(sessionId.value)
    message.success('交卷成功')
    localStorage.removeItem(`exam_${sessionId.value}`)
    router.push(`/exam/sessions/${sessionId.value}/result`)
  } catch {
    message.error('交卷失败')
  } finally {
    submitting.value = false
  }
}

// 切屏检测
function handleVisibilityChange() {
  if (document.hidden && sessionId.value) {
    reportCheat(sessionId.value).then(res => {
      const data = res.data
      cheatCount.value = data.cheatCount
      if (data.forceSubmit) {
        message.warning('切屏次数超限，已强制交卷')
        autoSubmit()
      }
    }).catch(() => {})
  }
}

// 恢复断网后的答案
async function restoreSession() {
  if (!sessionId.value) return
  try {
    const res = await getSession(sessionId.value)
    const data = res.data
    if (data.currentAnswers) {
      data.currentAnswers.forEach((a: AnswerItem) => {
        const q = questions.value.find((item) => item.id === a.paperQuestionId)
        if (q) {
          if (q.type === 'PROGRAMMING') {
            progAnswers[q.id] = { code: a.userAnswer || '', languageId: a.languageId ?? null }
          } else if (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER') {
            fillAnswers[q.id] = a.userAnswer
          } else {
            // 客观题：后端返回的 userAnswer 为 id JSON 数组字符串，还原内存态
            const ids = parseAnswerIds(a.userAnswer)
            currentAnswers[q.id] = q.type === 'MULTIPLE' ? ids : (ids[0] ?? null)
          }
        }
      })
    }
  } catch {
    // ignore
  }
}

watch(questions, () => {
  restoreSession()
})

onMounted(() => {
  initSession()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  if (timerHandle.value) clearInterval(timerHandle.value)
  if (shortAnswerSaveTimer) clearTimeout(shortAnswerSaveTimer)
  if (progSaveTimer) clearTimeout(progSaveTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.exam-stem :deep(.markdown-body) {
  font-size: 17px;
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
</style>
