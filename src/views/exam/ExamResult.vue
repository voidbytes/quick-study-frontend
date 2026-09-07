<template>
  <div class="max-w-4xl mx-auto">
    <PageHeader title="考试结果" subtitle="查看本次考试得分与逐题作答详情" />

    <!-- 加载失败：明确错误态，避免渲染 0 分 + 状态未知的假结果页 -->
    <div v-if="loadError" class="bg-white border border-neutral-200 rounded-xl p-6">
      <n-result status="error" title="无法查看考试结果" :description="loadError">
        <template #footer>
          <n-button type="primary" @click="router.push('/records')">返回记录</n-button>
        </template>
      </n-result>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="bg-white border border-neutral-200 rounded-xl">
      <div class="px-5 py-4 border-b border-neutral-200">
        <span class="text-base font-semibold text-neutral-900">考试结果</span>
      </div>
      <div class="py-16 flex justify-center">
        <n-spin size="large" />
      </div>
    </div>

    <template v-else>
      <!-- 成绩总览 hero -->
      <div class="relative bg-white border border-neutral-200 rounded-xl p-8 text-center overflow-hidden mb-6">
        <div class="flex justify-center mb-4">
          <span
            class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
            :class="statusBadgeClass"
          >
            {{ statusLabel }}
          </span>
        </div>
        <div class="flex items-baseline justify-center gap-1 mb-1">
          <span class="score-big">
            <n-number-animation
              :from="0"
              :to="result?.totalScore || 0"
              :duration="800"
            />
          </span>
        </div>
        <div class="text-sm text-neutral-500 mb-6">最终得分</div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
          <StatCard label="客观题得分" :value="result?.objectiveScore || 0" tone="success" />
          <StatCard label="主观题得分" :value="result?.subjectiveScore || 0" tone="warning" />
          <StatCard label="作答状态" tone="brand">
            {{ statusLabel }}
          </StatCard>
        </div>
      </div>

      <!-- 答题回顾 -->
      <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-neutral-200 flex items-center gap-3">
          <span class="text-base font-semibold text-neutral-900">答题详情</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
            共 {{ result?.questions?.length || 0 }} 题
          </span>
        </div>

        <div v-if="result?.questions?.length" class="p-4 space-y-4">
          <div
            v-for="(q, index) in result!.questions"
            :key="q.paperQuestionId"
            class="border border-neutral-200 rounded-lg p-5 transition-colors hover:border-primary-300"
          >
            <!-- 题目头：序号 + 题型 + 作答结果 -->
            <div class="flex items-center gap-3 flex-wrap mb-3">
              <span
                class="w-7 h-7 rounded-md bg-primary-50 text-primary-600 inline-flex items-center justify-center text-sm font-bold flex-shrink-0"
              >
                {{ index + 1 }}
              </span>
              <span class="text-base font-semibold text-neutral-900">第 {{ index + 1 }} 题</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-info-50 text-info-600">
                {{ typeLabel(q.type) }}
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="judgeBadgeClass(q)">
                {{ judgeLabel(q) }}
              </span>
            </div>

            <!-- 题干 -->
            <div class="review-stem mb-4">
              <RichText :content="parseQuestionContent(q.content)" />
            </div>

            <!-- 答案对比（简答题为富文本 HTML，用 RichText 渲染；客观题保持文本插值；编程题为代码块） -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div class="px-4 py-3 rounded-lg" :class="answerBoxClass(q)">
                <div class="text-xs text-neutral-500 mb-1">
                  你的答案<template v-if="q.programming?.languageName">（{{ q.programming.languageName }}）</template>
                </div>
                <RichText
                  v-if="q.type === 'SHORT_ANSWER'"
                  :content="formatAnswer(q, q.yourAnswer)"
                  class="answer-rich"
                  :class="answerTextClass(q)"
                />
                <pre
                  v-else-if="q.type === 'PROGRAMMING'"
                  class="text-xs font-mono whitespace-pre-wrap break-all max-h-64 overflow-auto bg-neutral-50 border border-neutral-200 rounded p-2"
                >{{ q.yourAnswer || '未作答' }}</pre>
                <div v-else class="text-sm font-semibold" :class="answerTextClass(q)">
                  {{ formatAnswer(q, q.yourAnswer) }}
                </div>
              </div>
              <div v-if="q.correctAnswer" class="px-4 py-3 rounded-lg bg-success-50">
                <div class="text-xs text-neutral-500 mb-1">正确答案</div>
                <RichText
                  v-if="q.type === 'SHORT_ANSWER'"
                  :content="formatAnswer(q, q.correctAnswer)"
                  class="answer-rich text-success-700"
                />
                <div v-else class="text-sm font-semibold text-success-700">
                  {{ formatAnswer(q, q.correctAnswer) }}
                </div>
              </div>
            </div>

            <!-- 编程题判题详情（用例通过 / 耗时 / 编译错误） -->
            <div
              v-if="q.type === 'PROGRAMMING' && q.programming"
              class="mb-4 px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200"
            >
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-1.5">
                <span class="text-neutral-600">
                  判题状态：
                  <b :class="judgeTextClass(q)">{{ judgeLabel(q) }}</b>
                </span>
                <span v-if="q.programming.totalCount != null" class="text-neutral-600">
                  用例通过：{{ q.programming.passCount ?? 0 }} / {{ q.programming.totalCount }}
                </span>
                <span v-if="q.programming.maxTimeMs" class="text-neutral-600">
                  最大耗时：{{ q.programming.maxTimeMs }}ms
                </span>
              </div>
              <pre
                v-if="q.programming.compileMessage"
                class="text-xs text-error-600 whitespace-pre-wrap break-all font-mono max-h-40 overflow-auto bg-white border border-error-100 rounded p-2"
              >{{ q.programming.compileMessage }}</pre>
              <div v-if="!judgeFinished(q)" class="text-xs text-neutral-400">
                判题仍在进行，页面会自动刷新结果，请稍候…
              </div>
            </div>

            <!-- 解析 -->
            <div v-if="q.analysis" class="flex items-start gap-2 px-4 py-3 rounded-lg bg-info-50 text-sm text-info-600 mb-4">
              <RichText :content="q.analysis" class="analysis-rich" />
            </div>

            <!-- 得分 -->
            <div class="flex items-center justify-between pt-3 border-t border-neutral-200">
              <span class="text-sm text-neutral-500">得分</span>
              <span class="text-lg font-bold" :class="scoreTextClass(q)">
                {{ scoreLabel(q) }}
              </span>
            </div>
          </div>
        </div>

        <EmptyState
          v-else
          description="暂无题目详情"
          :icon="DocumentTextOutline"
        />
      </div>

      <div class="mt-6 text-center">
        <n-button type="primary" @click="router.push('/records')">返回记录</n-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getResult } from '@/api/exam'
import type { SessionResultResponse, QuestionResultItem } from '@/api/exam'
import { QUESTION_TYPE_MAP } from '@/utils/constants'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RichText from '@/components/common/RichText.vue'
import { DocumentTextOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()

const sessionId = route.params.id as string
const result = ref<SessionResultResponse | null>(null)
const loading = ref(true)
const loadError = ref('')

const statusMap: Record<string, string> = {
  GRADED: '已批改',
  SUBMITTED: '待批改',
  IN_PROGRESS: '进行中',
  AUTO_SUBMITTED: '自动交卷',
  CHEAT_SUBMITTED: '切屏交卷'
}

const statusLabel = computed(() => statusMap[result.value?.status || ''] || result.value?.status || '未知')

const statusBadgeClass = computed(() => {
  const s = result.value?.status
  if (s === 'GRADED') return 'bg-success-50 text-success-700'
  if (s === 'CHEAT_SUBMITTED') return 'bg-error-50 text-error-700'
  if (s === 'SUBMITTED' || s === 'IN_PROGRESS') return 'bg-warning-50 text-warning-700'
  return 'bg-neutral-100 text-neutral-600'
})

function typeLabel(type?: string): string {
  return (type && QUESTION_TYPE_MAP[type as keyof typeof QUESTION_TYPE_MAP]) || type || '未知'
}

// 判断题答案显示为中文；选项题答案字母映射到选项内容不可行（快照无序号对应），保持原样
function formatAnswer(q: QuestionResultItem, answer: string | null): string {
  if (answer == null || answer === '') return '未作答'
  if (q.type === 'TRUE_FALSE') {
    return answer === 'true' ? '正确' : answer === 'false' ? '错误' : answer
  }
  return answer
}

/** 判题结果是否已终态（FINISHED/ERROR） */
function judgeFinished(q: QuestionResultItem): boolean {
  if (q.type !== 'PROGRAMMING' || !q.programming) return true
  return q.programming.status === 'FINISHED' || q.programming.status === 'ERROR'
}

function judgeLabel(q: QuestionResultItem): string {
  // 编程题：以判题结果为准（AC/WA/TLE/MLE/RE/CE/SE），判题中单独提示
  if (q.type === 'PROGRAMMING') {
    const p = q.programming
    if (!p) return '未判题'
    if (p.status === 'FINISHED') return p.result || '未知'
    if (p.status === 'ERROR') return '判题异常'
    return '判题中'
  }
  if (q.isCorrect === true) return '正确'
  if (q.isCorrect === false) return '错误'
  return '待批改'
}

function judgeBadgeClass(q: QuestionResultItem): string {
  if (q.type === 'PROGRAMMING') {
    const p = q.programming
    if (!p) return 'bg-warning-50 text-warning-700'
    if (p.status === 'FINISHED') {
      if (p.result === 'AC') return 'bg-success-50 text-success-700'
      if (p.result === 'CE') return 'bg-warning-50 text-warning-700'
      if (p.result === 'TLE' || p.result === 'MLE') return 'bg-warning-50 text-warning-700'
      return 'bg-error-50 text-error-700'
    }
    return 'bg-info-50 text-info-600'
  }
  if (q.isCorrect === true) return 'bg-success-50 text-success-700'
  if (q.isCorrect === false) return 'bg-error-50 text-error-700'
  return 'bg-warning-50 text-warning-700'
}

function judgeTextClass(q: QuestionResultItem): string {
  if (q.type === 'PROGRAMMING') {
    const p = q.programming
    if (p && p.status === 'FINISHED' && p.result === 'AC') return 'text-success-700'
    if (p && p.status === 'FINISHED') return 'text-error-600'
    return 'text-info-600'
  }
  if (q.isCorrect === true) return 'text-success-700'
  if (q.isCorrect === false) return 'text-error-700'
  return 'text-warning-700'
}

function answerBoxClass(q: QuestionResultItem): string {
  if (q.isCorrect === true) return 'bg-success-50'
  if (q.isCorrect === false) return 'bg-error-50'
  return 'bg-warning-50'
}

function answerTextClass(q: QuestionResultItem): string {
  if (q.isCorrect === true) return 'text-success-700'
  if (q.isCorrect === false) return 'text-error-700'
  return 'text-warning-700'
}

function scoreTextClass(q: QuestionResultItem): string {
  if (q.isCorrect === true) return 'text-success-700'
  if (q.isCorrect === false) return 'text-error-700'
  return 'text-warning-700'
}

function scoreLabel(q: QuestionResultItem): string {
  if (q.type === 'PROGRAMMING' && q.programming && !judgeFinished(q)) return '判题中'
  return q.score != null ? String(q.score) : '待批改'
}

function parseQuestionContent(content?: string): string {
  if (!content) return ''
  try {
    const parsed: unknown = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && 'content' in parsed) {
      return String((parsed as { content?: unknown }).content || content)
    }
    return content
  } catch {
    return content
  }
}

/** 编程题判题轮询：存在未终态判题时每 5s 刷新，最多 60s（判题 worker 一般秒级完成） */
let pollTimer: ReturnType<typeof setInterval> | null = null
let pollCount = 0

function startPollingIfNeeded() {
  const qs = result.value?.questions || []
  const pending = qs.some((q) => q.type === 'PROGRAMMING' && q.programming && !judgeFinished(q))
  if (!pending) return
  if (pollTimer) return
  pollTimer = setInterval(async () => {
    pollCount++
    await loadResult()
    const stillPending = (result.value?.questions || []).some(
      (q) => q.type === 'PROGRAMMING' && q.programming && !judgeFinished(q)
    )
    if (!stillPending || pollCount >= 12) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
    }
  }, 5000)
}

async function loadResult() {
  try {
    const res = await getResult(sessionId)
    // 拦截器已返回 ApiResponse，res.data 即业务数据
    result.value = res.data
  } catch (err: any) {
    // 业务错误拦截器 reject 的 Error 带 response；HTTP 错误为 axios error，message 在 response.data
    loadError.value =
      err?.response?.data?.message || err?.message || '获取考试结果失败，请稍后重试'
  } finally {
    loading.value = false
    startPollingIfNeeded()
  }
}

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

onMounted(() => {
  loadResult()
})
</script>

<style scoped>
.score-big {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-success-500);
}
.review-stem :deep(.markdown-body) {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}
.answer-rich :deep(.markdown-body),
.analysis-rich :deep(.markdown-body) {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}
.answer-rich :deep(img),
.analysis-rich :deep(img) {
  max-width: 100%;
}
</style>
