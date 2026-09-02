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
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="judgeBadgeClass(q.isCorrect)">
                {{ judgeLabel(q.isCorrect) }}
              </span>
            </div>

            <!-- 题干 -->
            <div class="review-stem mb-4">
              <RichText :content="parseQuestionContent(q.content)" />
            </div>

            <!-- 答案对比 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div class="px-4 py-3 rounded-lg" :class="answerBoxClass(q.isCorrect)">
                <div class="text-xs text-neutral-500 mb-1">你的答案</div>
                <div class="text-sm font-semibold" :class="answerTextClass(q.isCorrect)">
                  {{ formatAnswer(q, q.yourAnswer) }}
                </div>
              </div>
              <div v-if="q.correctAnswer" class="px-4 py-3 rounded-lg bg-success-50">
                <div class="text-xs text-neutral-500 mb-1">正确答案</div>
                <div class="text-sm font-semibold text-success-700">
                  {{ formatAnswer(q, q.correctAnswer) }}
                </div>
              </div>
            </div>

            <!-- 解析 -->
            <div v-if="q.analysis" class="flex items-start gap-2 px-4 py-3 rounded-lg bg-info-50 text-sm text-info-600 mb-4">
              {{ q.analysis }}
            </div>

            <!-- 得分 -->
            <div class="flex items-center justify-between pt-3 border-t border-neutral-200">
              <span class="text-sm text-neutral-500">得分</span>
              <span class="text-lg font-bold" :class="scoreTextClass(q)">
                {{ q.score != null ? q.score : '待批改' }}
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
import { ref, computed, onMounted } from 'vue'
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

function judgeLabel(isCorrect: boolean | null): string {
  if (isCorrect === true) return '正确'
  if (isCorrect === false) return '错误'
  return '待批改'
}

function judgeBadgeClass(isCorrect: boolean | null): string {
  if (isCorrect === true) return 'bg-success-50 text-success-700'
  if (isCorrect === false) return 'bg-error-50 text-error-700'
  return 'bg-warning-50 text-warning-700'
}

function answerBoxClass(isCorrect: boolean | null): string {
  if (isCorrect === true) return 'bg-success-50'
  if (isCorrect === false) return 'bg-error-50'
  return 'bg-warning-50'
}

function answerTextClass(isCorrect: boolean | null): string {
  if (isCorrect === true) return 'text-success-700'
  if (isCorrect === false) return 'text-error-700'
  return 'text-warning-700'
}

function scoreTextClass(q: QuestionResultItem): string {
  if (q.isCorrect === true) return 'text-success-700'
  if (q.isCorrect === false) return 'text-error-700'
  return 'text-warning-700'
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
  }
}

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
</style>
