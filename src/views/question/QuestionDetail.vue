<template>
  <div>
    <!-- 页头：返回 + 标题 + 编辑操作 -->
    <PageHeader title="题目详情" :subtitle="bankSubtitle" showBack>
      <template #actions>
        <n-button
          v-if="authStore.isAdmin"
          type="primary"
          size="small"
          @click="router.push(`/banks/${bankId}/questions/${questionId}/edit`)"
        >
          编辑
        </n-button>
      </template>
    </PageHeader>

    <n-spin v-if="!loadError" :show="loading">
      <div
        v-if="question"
        class="bg-white border border-neutral-200 rounded-lg overflow-hidden"
      >
        <!-- 标签行 -->
        <div class="px-6 py-4 border-b border-neutral-200 flex items-center gap-2 flex-wrap">
          <n-tag size="small" round :type="typeTagType(question.type)">{{ typeLabel }}</n-tag>
          <n-tag size="small" round :type="difficultyTagType(question.difficulty)">
            {{ difficultyLabel }}
          </n-tag>
          <n-tag size="small" round :type="statusTagType(question.status)">
            {{ statusLabel }}
          </n-tag>
          <span v-if="question.bankName" class="ml-auto text-xs text-neutral-400">
            所属题库：
            <a class="text-brand cursor-pointer hover:underline" @click="router.push(`/banks/${bankId}`)">
              {{ question.bankName }}
            </a>
          </span>
        </div>

        <div class="px-6 py-6 space-y-6">
          <!-- 题干 -->
          <section>
            <h3 class="text-sm font-medium text-neutral-500 mb-2">题干</h3>
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <RichText :content="question.content" />
            </div>
          </section>

          <!-- 选项（单选 / 多选） -->
          <section v-if="showOptions">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">选项</h3>
            <div class="space-y-2">
              <div
                v-for="(opt, index) in parsedOptions"
                :key="index"
                class="flex items-start gap-3 p-4 border rounded-lg transition-colors"
                :class="isCorrectOption(opt)
                  ? 'border-success-500 bg-success-50'
                  : 'border-neutral-200 bg-white'"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
                  :class="isCorrectOption(opt)
                    ? 'bg-success-500 text-white'
                    : 'bg-neutral-100 text-neutral-600'"
                >
                  {{ String.fromCharCode(65 + index) }}
                </div>
                <div class="flex-1 min-w-0 text-sm text-neutral-900 leading-relaxed pt-0.5">
                  <RichText :content="opt" />
                </div>
                <n-icon v-if="isCorrectOption(opt)" color="#22B570" size="18" class="flex-shrink-0 mt-1">
                  <CheckmarkOutline />
                </n-icon>
              </div>
            </div>
          </section>

          <!-- 判断题答案 -->
          <section v-if="question.type === 'TRUE_FALSE'">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div>
              <n-tag :type="question.answer === 'true' ? 'success' : 'error'" size="medium" round>
                {{ question.answer === 'true' ? '正确' : '错误' }}
              </n-tag>
            </div>
          </section>

          <!-- 正确答案（非判断题） -->
          <section v-if="question.answer && question.type !== 'TRUE_FALSE'">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div class="bg-success-50 border border-success-100 rounded-lg p-4">
              <RichText :content="answerLabel" />
            </div>
          </section>

          <!-- 参考答案 -->
          <section v-if="question.referenceAnswer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">参考答案</h3>
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <RichText :content="question.referenceAnswer" />
            </div>
          </section>

          <!-- 解析 -->
          <section v-if="question.analysis">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">解析</h3>
            <div class="bg-warning-50 border border-warning-100 rounded-lg p-4">
              <RichText :content="question.analysis" />
            </div>
          </section>

          <!-- 标签 -->
          <section v-if="question.tags && question.tags.length > 0">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">标签</h3>
            <div class="flex gap-1.5 flex-wrap">
              <n-tag v-for="tag in question.tags" :key="tag.id" size="small" round>
                {{ tag.name }}
              </n-tag>
            </div>
          </section>

          <!-- 元信息 -->
          <div class="flex items-center gap-x-5 gap-y-1 text-xs text-neutral-400 border-t border-neutral-200 pt-4">
            <span class="inline-flex items-center gap-1">
              <n-icon :size="14"><TimeOutline /></n-icon>
              创建时间：{{ formatTime(question.createdAt) }}
            </span>
            <span v-if="question.updatedAt" class="inline-flex items-center gap-1">
              <n-icon :size="14"><TimeOutline /></n-icon>
              更新时间：{{ formatTime(question.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuestionType, Difficulty, Question, QuestionOption } from '@/types'
import { getQuestionDetail } from '@/api/question'
import { useAuthStore } from '@/stores/auth'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP, QUESTION_STATUS_OPTIONS } from '@/utils/constants'
import PageHeader from '@/components/common/PageHeader.vue'
import RichText from '@/components/common/RichText.vue'
import LoadError from '@/components/LoadError.vue'
import { CheckmarkOutline, TimeOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const bankId = route.params.bankId as string
const questionId = route.params.questionId as string

const loading = ref(false)
const loadError = ref('')

/** 后端运行时 options 为 JSON 字符串（Question 类型声明滞后），本地收敛为联合类型 */
interface QuestionDetailData extends Omit<Question, 'options'> {
  options?: string | QuestionOption[] | null
  referenceAnswer?: string | null
}

const question = ref<QuestionDetailData | null>(null)

const bankSubtitle = computed(() => (question.value?.bankName ? `所属题库：${question.value.bankName}` : ''))

type TagColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const TYPE_TAG: Record<QuestionType, TagColor> = {
  SINGLE: 'info',
  MULTIPLE: 'warning',
  TRUE_FALSE: 'success',
  FILL_BLANK: 'default',
  SHORT_ANSWER: 'primary'
}

const DIFFICULTY_TAG: Record<Difficulty, TagColor> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'error'
}

const STATUS_TAG: Record<string, TagColor> = {
  DRAFT: 'default',
  PENDING_REVIEW: 'warning',
  PUBLISHED: 'success'
}

const typeLabel = computed(() => (question.value ? QUESTION_TYPE_MAP[question.value.type] || '-' : '-'))
const difficultyLabel = computed(() =>
  question.value ? DIFFICULTY_MAP[question.value.difficulty] || '-' : '-'
)
const statusLabel = computed(() => {
  if (!question.value) return '-'
  return QUESTION_STATUS_OPTIONS.find((o) => o.value === question.value?.status)?.label || question.value.status || '-'
})

function typeTagType(type?: QuestionType): TagColor {
  return (type && TYPE_TAG[type]) || 'default'
}

function difficultyTagType(difficulty?: Difficulty): TagColor {
  return (difficulty && DIFFICULTY_TAG[difficulty]) || 'default'
}

function statusTagType(status?: string): TagColor {
  return (status && STATUS_TAG[status]) || 'default'
}

const showOptions = computed(
  () => question.value?.type === 'SINGLE' || question.value?.type === 'MULTIPLE'
)

const parsedOptions = computed<string[]>(() => {
  const raw = question.value?.options
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((o): o is string => typeof o === 'string') : []
    } catch {
      return []
    }
  }
  if (Array.isArray(raw)) {
    return raw.map((o) => (typeof o === 'string' ? o : o?.content ?? ''))
  }
  return []
})

const isCorrectOption = (opt: string): boolean => {
  if (!question.value?.answer) return false
  const answer = question.value.answer
  const idx = parsedOptions.value.indexOf(opt)
  if (idx < 0) return false
  if (question.value.type === 'SINGLE') {
    // 单选答案如 "A"、"B"
    return answer === String.fromCharCode(65 + idx)
  }
  if (question.value.type === 'MULTIPLE') {
    return answer.split(',').includes(String.fromCharCode(65 + idx))
  }
  return false
}

const answerLabel = computed(() => {
  if (!question.value?.answer) return ''
  if (question.value.type === 'SINGLE') {
    const idx = question.value.answer.charCodeAt(0) - 65
    if (idx >= 0 && idx < parsedOptions.value.length) {
      return `${question.value.answer}. ${parsedOptions.value[idx]}`
    }
    return question.value.answer
  }
  if (question.value.type === 'MULTIPLE') {
    const answers = question.value.answer.split(',')
    return answers
      .map((a: string) => {
        const idx = a.trim().charCodeAt(0) - 65
        if (idx >= 0 && idx < parsedOptions.value.length) {
          return `${a.trim()}. ${parsedOptions.value[idx]}`
        }
        return a.trim()
      })
      .join('；')
  }
  return question.value.answer
})

function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

async function fetchDetail() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getQuestionDetail(questionId)
    question.value = res.data
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || err?.message || '加载题目详情失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>
