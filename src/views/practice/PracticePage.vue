<template>
  <div class="w-full">
    <!-- ============ 作答模式 ============ -->
    <template v-if="!result">
      <!-- 加载中 -->
      <div v-if="loading" class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-neutral-200">
          <span class="text-base font-semibold text-neutral-900">随机练习</span>
        </div>
        <div class="py-20 flex justify-center">
          <n-spin size="large" />
        </div>
      </div>

      <!-- 无题目（加载失败已跳回列表时兜底） -->
      <div v-else-if="questions.length === 0" class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <EmptyState
          title="暂无题目"
          description="本次练习没有生成题目，请返回练习列表重新开始"
          :icon="GameControllerOutline"
        >
          <template #action>
            <n-button type="primary" @click="router.push('/practice')">返回练习列表</n-button>
          </template>
        </EmptyState>
      </div>

      <template v-else>
        <!-- sticky 顶部：会话标题 + 题号 + 进度 -->
        <div class="bg-white border-b border-neutral-200 sticky z-10" style="top: var(--header-height)">
          <div class="max-w-4xl mx-auto px-4 lg:px-6 py-3.5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white flex-shrink-0"
                >
                  <n-icon :size="18"><GameControllerOutline /></n-icon>
                </div>
                <div class="leading-tight min-w-0">
                  <div class="text-base font-bold text-neutral-900 truncate">随机练习</div>
                  <div class="text-xs text-neutral-500">
                    第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <span class="hidden md:inline text-sm text-neutral-500">
                  已答
                  <span class="text-primary-600 font-bold">{{ answeredCount }}</span>
                  / {{ questions.length }} 题
                </span>
                <n-button size="small" quaternary @click="handleExit">
                  <template #icon>
                    <n-icon><CloseOutline /></n-icon>
                  </template>
                  退出练习
                </n-button>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 rounded-full transition-all duration-300"
                :style="{ width: progressPercent + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- 练习条件 -->
        <div v-if="conditionParts.length" class="max-w-4xl mx-auto px-1 pt-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-neutral-400 mr-1">练习条件</span>
            <span
              v-for="part in conditionParts"
              :key="part"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-600"
            >
              {{ part }}
            </span>
          </div>
        </div>

        <!-- 答题卡片 -->
        <div class="max-w-4xl mx-auto py-5">
          <div class="bg-white border border-neutral-200 rounded-xl p-6 md:p-8">
            <!-- 题目标题 -->
            <div class="flex items-center gap-3 flex-wrap mb-5">
              <span class="text-base font-bold text-neutral-900">
                第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="typePillClass(currentQuestion?.type)">
                {{ typeLabel(currentQuestion?.type) }}
              </span>
              <span
                v-if="currentQuestion?.difficulty"
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="difficultyPillClass(currentQuestion?.difficulty)"
              >
                {{ difficultyLabel(currentQuestion?.difficulty) }}
              </span>
            </div>

            <!-- 题干（富文本） -->
            <div class="practice-stem mb-6">
              <RichText :content="currentQuestion?.content" />
            </div>

            <!-- 客观题选项 -->
            <template v-if="isSingleChoice">
              <QuestionOption
                v-for="(opt, idx) in parsedOptions"
                :key="idx"
                :marker="String.fromCharCode(65 + idx)"
                :selected="!answered && selectedAnswer === String.fromCharCode(65 + idx)"
                :correct="answered && isCorrectOption(String.fromCharCode(65 + idx))"
                :wrong="answered && optionWrong(String.fromCharCode(65 + idx))"
                :disabled="optionDisabled(String.fromCharCode(65 + idx))"
                @select="selectAnswer(String.fromCharCode(65 + idx))"
              >
                <RichText :content="opt" />
              </QuestionOption>
            </template>

            <template v-else-if="currentQuestion?.type === 'MULTIPLE'">
              <QuestionOption
                v-for="(opt, idx) in parsedOptions"
                :key="idx"
                :marker="String.fromCharCode(65 + idx)"
                :selected="!answered && multipleSelected.includes(String.fromCharCode(65 + idx))"
                :correct="answered && isCorrectOption(String.fromCharCode(65 + idx))"
                :wrong="answered && optionWrong(String.fromCharCode(65 + idx))"
                :disabled="optionDisabled(String.fromCharCode(65 + idx))"
                @select="toggleMultiple(String.fromCharCode(65 + idx))"
              >
                <RichText :content="opt" />
              </QuestionOption>
            </template>

            <!-- 提交后判分横幅 -->
            <div
              v-if="answered"
              class="mt-6 px-4 py-3.5 rounded-lg border flex items-start gap-3"
              :class="currentQuestion?.isCorrect ? 'bg-success-50 border-success-200' : 'bg-error-50 border-error-200'"
            >
              <n-icon
                :size="22"
                class="flex-shrink-0 mt-0.5"
                :color="currentQuestion?.isCorrect ? 'var(--color-success-500)' : 'var(--color-error-500)'"
              >
                <CheckmarkCircleOutline v-if="currentQuestion?.isCorrect" />
                <CloseCircleOutline v-else />
              </n-icon>
              <div class="text-sm leading-relaxed min-w-0">
                <span class="font-bold" :class="currentQuestion?.isCorrect ? 'text-success-700' : 'text-error-700'">
                  {{ currentQuestion?.isCorrect ? '回答正确' : '回答错误' }}
                </span>
                <span class="text-neutral-600">
                  你的答案：<b>{{ formatAnswer(currentQuestion?.userAnswer, currentQuestion?.type) || '未作答' }}</b>
                </span>
                <template v-if="!currentQuestion?.isCorrect">
                  <span class="mx-2 text-neutral-300">|</span>
                  <span class="text-neutral-600">
                    正确答案：<b class="text-success-700">{{ formatAnswer(currentQuestion?.answer, currentQuestion?.type) }}</b>
                  </span>
                </template>
              </div>
            </div>

            <!-- 解析 -->
            <div
              v-if="answered && currentQuestion?.analysis"
              class="mt-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-info-50 text-sm text-info-600"
            >
              <n-icon :size="18" class="flex-shrink-0 mt-0.5"><BulbOutline /></n-icon>
              <div class="practice-analysis min-w-0">
                <RichText :content="currentQuestion?.analysis" />
              </div>
            </div>

            <!-- 底部操作 -->
            <div class="flex flex-wrap items-center justify-between gap-3 mt-8 pt-5 border-t border-neutral-200">
              <div class="flex flex-wrap items-center gap-2">
                <n-button size="small" :disabled="currentIndex === 0" @click="prevQuestion">上一题</n-button>
                <n-button v-if="!answered" size="small" type="primary" :loading="submitting" @click="submitAnswer">
                  提交答案
                </n-button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <n-button
                  v-if="answered && currentIndex < questions.length - 1"
                  size="small"
                  type="primary"
                  @click="nextQuestion"
                >
                  下一题
                </n-button>
                <n-button size="small" type="success" @click="handleComplete">完成练习</n-button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ============ 练习结果 ============ -->
    <template v-else>
      <div class="max-w-4xl mx-auto">
        <PageHeader title="练习结果" subtitle="本套练习的作答统计与逐题回顾">
          <template #actions>
            <n-button type="primary" @click="router.push('/practice')">返回练习列表</n-button>
          </template>
        </PageHeader>

        <!-- 练习条件 -->
        <div v-if="conditionParts.length" class="flex flex-wrap items-center gap-2 mb-5">
          <span class="text-xs font-medium text-neutral-400 mr-1">练习条件</span>
          <span
            v-for="part in conditionParts"
            :key="part"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-600"
          >
            {{ part }}
          </span>
        </div>

        <!-- 成绩 hero -->
        <div class="bg-white border border-neutral-200 rounded-xl p-8 text-center mb-6">
          <div class="text-sm font-medium text-neutral-500 mb-3">本次正确率</div>
          <div class="text-6xl font-bold tabular-nums mb-1" :class="accuracyTextClass()">
            {{ (result.accuracy * 100).toFixed(1) }}%
          </div>
          <div class="text-sm text-neutral-400">{{ result.correctCount }} 题作答正确</div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-neutral-200 text-left">
            <StatCard label="答对题数" :value="result.correctCount" tone="success" />
            <StatCard label="总题数" :value="result.totalCount ?? questions.length" tone="brand" />
            <StatCard label="用时" :value="formatDuration(result.duration)" tone="warning" />
          </div>
        </div>

        <!-- 逐题回顾 -->
        <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-neutral-200 flex items-center gap-3">
            <span class="text-base font-semibold text-neutral-900">答题回顾</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              共 {{ questions.length }} 题
            </span>
          </div>

          <div v-if="questions.length" class="p-4 space-y-4">
            <div
              v-for="(q, index) in questions"
              :key="q.index ?? index"
              class="border border-neutral-200 rounded-lg p-5 transition-colors hover:border-primary-300"
            >
              <!-- 题目头：序号 + 题型 + 难度 + 对错 -->
              <div class="flex items-center gap-3 flex-wrap mb-3">
                <span
                  class="w-7 h-7 rounded-md bg-primary-50 text-primary-600 inline-flex items-center justify-center text-sm font-bold flex-shrink-0"
                >
                  {{ index + 1 }}
                </span>
                <span class="text-base font-semibold text-neutral-900">第 {{ index + 1 }} 题</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="typePillClass(q.type)">
                  {{ typeLabel(q.type) }}
                </span>
                <span
                  v-if="q.difficulty"
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="difficultyPillClass(q.difficulty)"
                >
                  {{ difficultyLabel(q.difficulty) }}
                </span>
                <span v-if="!q.userAnswer" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                  未作答
                </span>
              </div>

              <!-- 题干 -->
              <div class="practice-stem mb-4">
                <RichText :content="q.content" />
              </div>

              <!-- 答案对比 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div class="px-4 py-3 rounded-lg" :class="resultBoxClass(q.isCorrect)">
                  <div class="text-xs text-neutral-500 mb-1">你的答案</div>
                  <div class="text-sm font-semibold" :class="resultTextClass(q.isCorrect)">
                    {{ formatAnswer(q.userAnswer, q.type) || '未作答' }}
                  </div>
                </div>
                <div class="px-4 py-3 rounded-lg bg-success-50">
                  <div class="text-xs text-neutral-500 mb-1">正确答案</div>
                  <div class="text-sm font-semibold text-success-700">{{ formatAnswer(q.answer, q.type) }}</div>
                </div>
              </div>

              <!-- 解析 -->
              <div v-if="q.analysis" class="flex items-start gap-2 px-4 py-3 rounded-lg bg-info-50 text-sm text-info-600">
                <n-icon :size="18" class="flex-shrink-0 mt-0.5"><BulbOutline /></n-icon>
                <div class="practice-analysis min-w-0">
                  <RichText :content="q.analysis" />
                </div>
              </div>
            </div>
          </div>

          <EmptyState
            v-else
            title="暂无题目详情"
            description="本次练习没有记录到题目"
            :icon="DocumentTextOutline"
          />
        </div>

        <div class="mt-6 text-center">
          <n-button type="primary" @click="router.push('/practice')">返回练习列表</n-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  GameControllerOutline,
  CloseOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  BulbOutline,
  DocumentTextOutline
} from '@vicons/ionicons5'
import { getPracticeSession, submitPracticeAnswer, completePractice } from '@/api/practice'
import type { PracticeQuestion } from '@/types'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP } from '@/utils/constants'
import { useConfirm } from '@/composables/useConfirm'
import QuestionOption from '@/components/common/QuestionOption.vue'
import RichText from '@/components/common/RichText.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { confirm } = useConfirm()

/** 会话中的题目行：userAnswer / isCorrect 由后端 answers 合并进来，仅运行期赋值 */
interface QuestionRow extends PracticeQuestion {
  userAnswer?: string | null
  isCorrect?: boolean | null
}

/** filterParams JSON 展开 */
interface FilterParams {
  sourceType?: string
  bankIds?: number[]
  types?: string[]
  tagIds?: number[]
  correctRateMin?: number
  correctRateMax?: number
  priorUnanswered?: boolean
  priorWrong?: boolean
}

/** 结果统计展示（兼容 PracticeStats 与 PracticeResult 两种返回） */
interface ResultView {
  sessionId?: string
  correctCount: number
  totalCount?: number
  accuracy: number
  duration: number
}

const sessionId = route.params.id as string
const questions = ref<QuestionRow[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref('')
const multipleSelected = ref<string[]>([])
const answered = ref(false)
const submitting = ref(false)
const loading = ref(true)
const result = ref<ResultView | null>(null)
const filterParams = ref<FilterParams | null>(null)

const currentQuestion = computed<QuestionRow | null>(() => questions.value[currentIndex.value] || null)

/** 客观题作答区：单选/判断共用单选交互，多选单独处理 */
const isSingleChoice = computed(() => {
  const t = currentQuestion.value?.type
  return t === 'SINGLE' || t === 'TRUE_FALSE'
})

/** 已答题目数（恢复会话后已提交过的也算） */
const answeredCount = computed(() => questions.value.filter((q) => Boolean(q.userAnswer)).length)

const progressPercent = computed(() => {
  const n = questions.value.length
  if (!n) return 0
  return Math.min(100, Math.round((answeredCount.value / n) * 100))
})

/** 解析 options JSON 字符串为数组（去除数据自带的 "A. " 前缀，前缀统一由组件渲染） */
const parsedOptions = computed<string[]>(() => {
  const q = currentQuestion.value
  if (!q) return []
  // 判断题老数据可能没有 options，兜底给出 正确/错误 两项（对应 A/B）
  if (q.type === 'TRUE_FALSE' && !q.options) return ['正确', '错误']
  if (!q.options) return []
  try {
    const opts: unknown = JSON.parse(q.options)
    return Array.isArray(opts) ? opts.map((o) => String(o).replace(/^[A-Za-z][.、．]\s*/, '')) : []
  } catch {
    return []
  }
})

/** 解析条件描述 */
const conditionText = computed(() => {
  const fp = filterParams.value
  if (!fp) return ''
  const parts: string[] = []
  if (fp.sourceType === 'WRONG_REDO') {
    parts.push('来源：错题重做')
  } else {
    parts.push('来源：随机练习')
  }
  if (fp.bankIds && fp.bankIds.length > 0) parts.push(`题库：${fp.bankIds.length}个`)
  if (fp.types && fp.types.length > 0) {
    const typeMap: Record<string, string> = { SINGLE: '单选', MULTIPLE: '多选', TRUE_FALSE: '判断' }
    const typeNames = fp.types.map((t) => typeMap[t] || t)
    parts.push(`题型：${typeNames.join('、')}`)
  }
  if (fp.tagIds && fp.tagIds.length > 0) parts.push(`标签：${fp.tagIds.length}个`)
  if (fp.correctRateMin != null || fp.correctRateMax != null) {
    const min = fp.correctRateMin != null ? Math.round(fp.correctRateMin * 100) : 0
    const max = fp.correctRateMax != null ? Math.round(fp.correctRateMax * 100) : 100
    parts.push(`正确率：${min}%-${max}%`)
  }
  if (fp.priorUnanswered) parts.push('优先未做')
  if (fp.priorWrong) parts.push('优先易错')
  return parts.join(' | ')
})

/** 条件分片，逐个渲染 pill */
const conditionParts = computed(() => conditionText.value.split(' | ').filter(Boolean))

function typeLabel(type?: string): string {
  return (type && QUESTION_TYPE_MAP[type as keyof typeof QUESTION_TYPE_MAP]) || type || '未知'
}

function difficultyLabel(d?: string): string {
  return (d && DIFFICULTY_MAP[d as keyof typeof DIFFICULTY_MAP]) || d || '未知'
}

function typePillClass(type?: string): string {
  switch (type) {
    case 'SINGLE': return 'bg-primary-50 text-primary-600'
    case 'MULTIPLE': return 'bg-info-50 text-info-600'
    case 'TRUE_FALSE': return 'bg-success-50 text-success-600'
    case 'FILL_BLANK': return 'bg-warning-50 text-warning-600'
    default: return 'bg-neutral-100 text-neutral-600'
  }
}

function difficultyPillClass(d?: string): string {
  if (d === 'HARD') return 'bg-error-50 text-error-600'
  if (d === 'MEDIUM') return 'bg-warning-50 text-warning-600'
  return 'bg-success-50 text-success-600'
}

function accuracyTextClass(): string {
  const acc = result.value?.accuracy ?? 0
  if (acc >= 0.6) return 'text-success-600'
  if (acc >= 0.3) return 'text-warning-500'
  return 'text-error-500'
}

function formatAnswer(answer?: string | null, type?: string): string {
  if (!answer) return '未作答'
  if (type === 'TRUE_FALSE') {
    // 兼容历史数据混用的 A/B 与 true/false 两种格式
    return answer === 'A' || answer === 'true' ? '正确' : '错误'
  }
  return answer
}

function formatDuration(seconds?: number): string {
  if (seconds == null) return '-'
  if (seconds < 60) return `${seconds} 秒`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分钟`
}

/** 该字母是否命中标准答案 */
function isCorrectOption(letter: string): boolean {
  const q = currentQuestion.value
  if (!q) return false
  if (q.type === 'MULTIPLE') return q.answer.includes(letter)
  return q.answer === letter
}

function optionSelected(letter: string): boolean {
  const q = currentQuestion.value
  if (!q) return false
  return q.type === 'MULTIPLE'
    ? multipleSelected.value.includes(letter)
    : selectedAnswer.value === letter
}

/** 提交后：用户选中但选错的选项标红 */
function optionWrong(letter: string): boolean {
  return answered.value && optionSelected(letter) && !isCorrectOption(letter)
}

/** 提交后：非正确且非选错的选项变灰不可点（其余半透明） */
function optionDisabled(letter: string): boolean {
  if (!answered.value) return false
  return !isCorrectOption(letter) && !optionWrong(letter)
}

function resultBoxClass(isCorrect: boolean | null | undefined): string {
  if (isCorrect === true) return 'bg-success-50'
  if (isCorrect === false) return 'bg-error-50'
  return 'bg-neutral-100'
}

function resultTextClass(isCorrect: boolean | null | undefined): string {
  if (isCorrect === true) return 'text-success-700'
  if (isCorrect === false) return 'text-error-700'
  return 'text-neutral-500'
}

function selectAnswer(value: string) {
  if (answered.value) return
  selectedAnswer.value = value
  multipleSelected.value = []
}

function toggleMultiple(value: string) {
  if (answered.value) return
  const idx = multipleSelected.value.indexOf(value)
  if (idx >= 0) multipleSelected.value.splice(idx, 1)
  else multipleSelected.value.push(value)
}

async function submitAnswer() {
  const q = currentQuestion.value
  if (!q) return
  const answer = q.type === 'MULTIPLE' ? multipleSelected.value.join(',') : selectedAnswer.value
  if (!answer) {
    message.warning('请先选择答案')
    return
  }

  submitting.value = true
  try {
    const res = await submitPracticeAnswer(sessionId, {
      index: currentIndex.value,
      answer
    })
    answered.value = true
    // 以后端判分结果为准（多选题选项顺序、判断题 A/B 与 true/false 归一都在后端处理）
    const target = questions.value[currentIndex.value]
    if (target) {
      target.userAnswer = answer
      target.isCorrect = typeof res.data === 'boolean' ? res.data : target.answer === answer
    }
  } catch {
    message.error('提交答案失败')
  } finally {
    submitting.value = false
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetAnswer()
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    resetAnswer()
  }
}

function resetAnswer() {
  selectedAnswer.value = ''
  multipleSelected.value = []
  answered.value = false
  // 恢复已答题目的状态
  const q = questions.value[currentIndex.value]
  if (q && q.userAnswer) {
    if (q.type === 'MULTIPLE') {
      multipleSelected.value = String(q.userAnswer).split(',').filter(Boolean)
    } else {
      selectedAnswer.value = String(q.userAnswer)
    }
    answered.value = true
  }
}

async function finishPractice() {
  try {
    const res = await completePractice(sessionId)
    result.value = res.data
    message.success('练习完成')
  } catch {
    message.error('完成练习失败')
  }
}

function handleComplete() {
  const unanswered = questions.value.length - answeredCount.value
  const hasUnanswered = unanswered > 0
  confirm({
    title: '确认提交',
    content: hasUnanswered
      ? `还有 ${unanswered} 道题未作答，确定提交吗？`
      : '已完成所有题目，确定提交吗？',
    positiveText: hasUnanswered ? '确定提交' : '确定',
    negativeText: hasUnanswered ? '继续作答' : '取消',
    onPositiveClick: async () => {
      await finishPractice()
    }
  })
}

/** 退出练习：仅返回列表，进度保留在服务端，可从记录里继续 */
function handleExit() {
  confirm({
    title: '退出练习',
    content: '确定退出本次练习吗？退出后可在练习记录中继续作答。',
    positiveText: '退出',
    negativeText: '继续练习',
    onPositiveClick: () => {
      router.push('/practice')
    }
  })
}

async function loadSession() {
  try {
    const res = await getPracticeSession(sessionId)
    const session = res.data
    questions.value = session.questions || []
    // 解析条件
    if (session.filterParams) {
      try {
        filterParams.value = JSON.parse(session.filterParams) as FilterParams
      } catch {
        filterParams.value = null
      }
    }
    // 合并答案信息到题目中（断点恢复）
    if (session.answers?.length) {
      questions.value.forEach((q) => {
        const ans = session.answers.find((a) => a.questionIndex === q.index)
        if (ans) {
          q.userAnswer = ans.userAnswer
          q.isCorrect = ans.isCorrect
        }
      })
    }
    // 如果已完成，直接显示结果
    if (session.status === 'COMPLETED') {
      result.value = session.stats
      return
    }
    if (session.currentIndex !== undefined) {
      // 答完最后一题时后端 currentIndex 会越界（=题数），回到最后一题，避免首屏空白
      currentIndex.value = Math.min(session.currentIndex, Math.max(questions.value.length - 1, 0))
    }
    // 恢复当前题目的状态
    resetAnswer()
  } catch {
    message.error('加载练习会话失败')
    router.push('/practice')
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadSession() })
</script>

<style scoped>
.practice-stem :deep(.markdown-body) {
  font-size: 17px;
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
.practice-analysis :deep(.markdown-body) {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
</style>
