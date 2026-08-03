<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold truncate">{{ paperTitle }}</h1>
        <div class="flex items-center gap-4">
          <span :class="['text-lg font-mono font-bold', timeRemaining <= 300 ? 'text-red-500 animate-pulse' : 'text-gray-700']">
            {{ formattedTime }}
          </span>
          <n-button type="error" @click="handleSubmit">交卷</n-button>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto p-4 flex gap-6">
      <!-- 左侧题目导航 -->
      <div class="w-48 shrink-0">
        <n-card title="题目导航" size="small">
          <div class="grid grid-cols-5 gap-2">
            <div
              v-for="(q, index) in questions"
              :key="q.id"
              class="w-8 h-8 flex items-center justify-center rounded cursor-pointer text-sm font-medium"
              :class="getQuestionStatusClass(index)"
              @click="currentIndex = index"
            >
              {{ index + 1 }}
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-500 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded bg-primary inline-block" />
              <span>当前</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded bg-success inline-block" />
              <span>已答</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded bg-gray-200 inline-block" />
              <span>未答</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded bg-warning inline-block" />
              <span>待检查</span>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 答题区 -->
      <div class="flex-1">
        <n-card>
          <div class="mb-4">
            <span class="text-sm text-gray-500">第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题</span>
            <n-tag :type="difficultyTagType(currentQuestion?.difficulty)" size="small" class="ml-2">
              {{ difficultyLabels[currentQuestion?.difficulty] || '未知' }}
            </n-tag>
            <n-tag size="small" class="ml-2">{{ typeLabels[currentQuestion?.type] || '未知' }}</n-tag>
            <n-button
              v-if="currentQuestion"
              size="tiny"
              quaternary
              :type="isMarkedForReview(currentIndex) ? 'warning' : 'default'"
              class="ml-2"
              @click="toggleMarkForReview(currentIndex)"
            >
              {{ isMarkedForReview(currentIndex) ? '✓ 已标记' : '标记待检查' }}
            </n-button>
          </div>

          <!-- 题目内容 -->
          <div class="prose max-w-none mb-6" v-html="parsedContent" />

          <!-- 选项 -->
          <div class="space-y-3">
            <!-- 单选题 -->
            <template v-if="currentQuestion?.type === 'SINGLE'">
              <div
                v-for="(opt, idx) in parsedOptions"
                :key="idx"
                class="p-3 border rounded cursor-pointer hover:border-primary transition-colors"
                :class="{ 'border-primary bg-primary bg-opacity-5': currentAnswers[currentQuestion.id] === String.fromCharCode(65 + idx) }"
                @click="selectAnswer(String.fromCharCode(65 + idx))"
              >
                <n-radio :checked="currentAnswers[currentQuestion.id] === String.fromCharCode(65 + idx)">
                  <span class="font-mono mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
                  {{ opt }}
                </n-radio>
              </div>
            </template>

            <!-- 多选题 -->
            <template v-if="currentQuestion?.type === 'MULTIPLE'">
              <div
                v-for="(opt, idx) in parsedOptions"
                :key="idx"
                class="p-3 border rounded cursor-pointer hover:border-primary transition-colors"
                :class="{ 'border-primary bg-primary bg-opacity-5': isMultipleSelected(String.fromCharCode(65 + idx)) }"
                @click="toggleMultipleAnswer(String.fromCharCode(65 + idx))"
              >
                <n-checkbox :checked="isMultipleSelected(String.fromCharCode(65 + idx))">
                  <span class="font-mono mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
                  {{ opt }}
                </n-checkbox>
              </div>
            </template>

            <!-- 判断题 -->
            <template v-if="currentQuestion?.type === 'TRUE_FALSE'">
              <div class="flex gap-4">
                <div
                  class="flex-1 p-3 border rounded text-center cursor-pointer hover:border-primary"
                  :class="{ 'border-primary bg-primary bg-opacity-5': currentAnswers[currentQuestion.id] === 'A' }"
                  @click="selectAnswer('A')"
                >
                  <n-radio :checked="currentAnswers[currentQuestion.id] === 'A'">正确</n-radio>
                </div>
                <div
                  class="flex-1 p-3 border rounded text-center cursor-pointer hover:border-primary"
                  :class="{ 'border-primary bg-primary bg-opacity-5': currentAnswers[currentQuestion.id] === 'B' }"
                  @click="selectAnswer('B')"
                >
                  <n-radio :checked="currentAnswers[currentQuestion.id] === 'B'">错误</n-radio>
                </div>
              </div>
            </template>

            <!-- 填空题 -->
            <template v-if="currentQuestion?.type === 'FILL_BLANK'">
              <n-input
                v-model:value="fillAnswers[currentQuestion.id]"
                type="textarea"
                placeholder="请输入答案"
                :rows="3"
                @blur="saveFillAnswer"
              />
            </template>

            <!-- 简答题 -->
            <template v-if="currentQuestion?.type === 'SHORT_ANSWER'">
              <n-input
                v-model:value="fillAnswers[currentQuestion.id]"
                type="textarea"
                placeholder="请输入答案"
                :rows="6"
                @blur="saveFillAnswer"
              />
            </template>
          </div>

          <!-- 导航按钮 -->
          <div class="flex justify-between mt-8">
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
        </n-card>
      </div>
    </div>

    <!-- 提交确认弹窗 -->
    <n-modal v-model:show="showSubmitConfirm" title="确认交卷" preset="card" style="width: 400px">
      <div class="space-y-3">
        <p>确定要提交试卷吗？</p>
        <p>已答：{{ answeredCount }} 题，未答：{{ unansweredCount }} 题</p>
        <n-alert type="warning" v-if="unansweredCount > 0">
          还有 {{ unansweredCount }} 道题未作答，确定提交吗？
        </n-alert>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showSubmitConfirm = false">继续作答</n-button>
          <n-button type="primary" :loading="submitting" @click="confirmSubmit">确认交卷</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { startSession, getSession, saveAnswers, submitSession, reportCheat } from '@/api/exam'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const paperId = Number(route.params.id)
const sessionId = ref<number | null>(null)
const paperTitle = ref('')
const questions = ref<any[]>([])
const currentIndex = ref(0)
const currentAnswers = reactive<Record<number, string>>({})
const fillAnswers = reactive<Record<number, string>>({})
const markedForReview = ref<Set<number>>(new Set())
const timeRemaining = ref(0)
const timerHandle = ref<ReturnType<typeof setInterval> | null>(null)
const showSubmitConfirm = ref(false)
const submitting = ref(false)
const cheatCount = ref(0)

const typeLabels: Record<string, string> = { SINGLE: '单选题', MULTIPLE: '多选题', TRUE_FALSE: '判断题', FILL_BLANK: '填空题', SHORT_ANSWER: '简答题' }
const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

/** 解析 options JSON 字符串为数组 */
const parsedOptions = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.options) return []
  if (Array.isArray(q.options)) return q.options
  try {
    return JSON.parse(q.options)
  } catch {
    return []
  }
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
  questions.value.forEach((q: any) => {
    if (q.type === 'MULTIPLE') {
      if (currentAnswers[q.id]?.length) count++
    } else if (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER') {
      if (fillAnswers[q.id]?.trim()) count++
    } else {
      if (currentAnswers[q.id]) count++
    }
  })
  return count
})

const unansweredCount = computed(() => questions.value.length - answeredCount.value)

const formattedTime = computed(() => {
  if (timeRemaining.value <= 0) return '00:00'
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function difficultyTagType(d: string) {
  return d === 'HARD' ? 'error' : d === 'MEDIUM' ? 'warning' : 'success'
}

function getQuestionStatusClass(index: number) {
  const q = questions.value[index]
  if (!q) return 'bg-gray-200 text-gray-500'
  if (currentIndex.value === index) return 'bg-primary text-white'
  if (markedForReview.value.has(index)) return 'bg-warning text-white'
  const hasAnswer = q.type === 'MULTIPLE'
    ? currentAnswers[q.id]?.length
    : (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER')
      ? fillAnswers[q.id]?.trim()
      : currentAnswers[q.id]
  return hasAnswer ? 'bg-success text-white' : 'bg-gray-200 text-gray-500'
}

function selectAnswer(value: string) {
  currentAnswers[currentQuestion.value.id] = value
  saveToLocal()
  autoSave()
}

function isMultipleSelected(value: string) {
  const ans = currentAnswers[currentQuestion.value.id] || ''
  return ans.split(',').includes(value)
}

function toggleMultipleAnswer(value: string) {
  const ans = currentAnswers[currentQuestion.value.id] || ''
  const arr = ans ? ans.split(',') : []
  const idx = arr.indexOf(value)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(value)
  currentAnswers[currentQuestion.value.id] = arr.join(',')
  saveToLocal()
  autoSave()
}

function saveFillAnswer() {
  saveToLocal()
  autoSave()
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
  return questions.value.map((q: any) => {
    const answer = q.type === 'MULTIPLE'
      ? currentAnswers[q.id] || ''
      : (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER')
        ? fillAnswers[q.id] || ''
        : currentAnswers[q.id] || ''
    return { paperQuestionId: q.id, answer }
  })
}

function saveToLocal() {
  const key = `exam_${sessionId.value}`
  localStorage.setItem(key, JSON.stringify({
    answers: { ...currentAnswers },
    fillAnswers: { ...fillAnswers },
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
    if (data.currentIndex !== undefined) currentIndex.value = data.currentIndex
    if (data.markedForReview) markedForReview.value = new Set(data.markedForReview)
  } catch {
    // ignore
  }
}

async function initSession() {
  try {
    const res = await startSession(paperId)
    const data = res.data.data
    sessionId.value = data.sessionId
    paperTitle.value = route.params.title as string || '考试'
    questions.value = data.questions || []
    if (data.deadline) {
      timeRemaining.value = Math.max(0, Math.floor((new Date(data.deadline).getTime() - Date.now()) / 1000))
    }
    loadFromLocal()
    startTimer()
  } catch {
    message.error('无法开始作答')
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

async function handleSubmit() {
  showSubmitConfirm.value = true
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
    showSubmitConfirm.value = false
  }
}

// 切屏检测
function handleVisibilityChange() {
  if (document.hidden && sessionId.value) {
    reportCheat(sessionId.value).then(res => {
      const data = res.data.data
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
    const data = res.data.data
    if (data.currentAnswers) {
      data.currentAnswers.forEach((a: any) => {
        const q = questions.value.find((q: any) => q.id === a.paperQuestionId)
        if (q) {
          if (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER') {
            fillAnswers[q.id] = a.userAnswer
          } else {
            currentAnswers[q.id] = a.userAnswer
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
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>