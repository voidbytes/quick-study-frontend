<template>
  <div class="max-w-content mx-auto w-full">
    <PageHeader
      title="错题详情"
      :subtitle="wrongQuestion ? `${wrongQuestion.bankName || '未知题库'} · 错 ${wrongQuestion.errorCount} 次 · 最近做错于 ${formatTime(wrongQuestion.lastWrongTime)}` : ''"
      showBack
    />

    <n-spin v-if="!loadError" :show="loading">
      <div v-if="wrongQuestion" class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <!-- 标签行 -->
        <div class="px-6 py-4 border-b border-neutral-200 flex items-center gap-2 flex-wrap">
          <n-tag size="small" round :type="typeTagType(snapshot?.type)">{{ typeLabel }}</n-tag>
          <n-tag v-if="snapshot?.difficulty" size="small" round :type="difficultyTagType(snapshot.difficulty)">
            {{ difficultyLabel }}
          </n-tag>
          <span v-if="wrongQuestion.bankName" class="ml-auto text-xs text-neutral-400">
            所属题库：
            <a class="text-brand cursor-pointer hover:underline" @click="handleViewBank">{{ wrongQuestion.bankName }}</a>
          </span>
        </div>

        <div class="px-6 py-6 space-y-6">
          <!-- 题干 -->
          <section>
            <h3 class="text-sm font-medium text-neutral-500 mb-2">题干</h3>
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <RichText :content="snapshot?.content" />
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

          <!-- 判断题正确答案 -->
          <section v-if="snapshot?.type === 'TRUE_FALSE' && snapshot?.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div>
              <n-tag :type="snapshot.answer === 'A' ? 'success' : 'error'" round>
                {{ snapshot.answer === 'A' ? '正确' : '错误' }}
              </n-tag>
            </div>
          </section>

          <!-- 正确答案（非判断题） -->
          <section v-if="snapshot?.answer && snapshot.type !== 'TRUE_FALSE'">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div class="bg-success-50 border border-success-100 rounded-lg p-4">
              <RichText :content="answerLabel" />
            </div>
          </section>

          <!-- 解析 -->
          <section v-if="snapshot?.analysis">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">解析</h3>
            <div class="bg-warning-50 border border-warning-100 rounded-lg p-4">
              <RichText :content="snapshot.analysis" />
            </div>
          </section>
        </div>
      </div>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getWrongQuestionById } from '@/api/wrongQuestion'
import type { WrongQuestion, QuestionType, Difficulty } from '@/types'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP } from '@/utils/constants'
import PageHeader from '@/components/common/PageHeader.vue'
import RichText from '@/components/common/RichText.vue'
import LoadError from '@/components/LoadError.vue'
import { CheckmarkOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const loadError = ref('')
const wrongQuestion = ref<WrongQuestion | null>(null)

/** 快照 JSON 展开（字段可为空，均按 string / unknown 保守收敛） */
interface SnapshotData {
  type?: string | null
  difficulty?: string | null
  content?: string | null
  options?: unknown
  answer?: string | null
  analysis?: string | null
}

const snapshot = ref<SnapshotData | null>(null)

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

const typeLabel = computed(() => {
  const raw = snapshot.value?.type
  if (!raw) return '-'
  const key = raw as QuestionType
  return key in TYPE_TAG ? QUESTION_TYPE_MAP[key] : raw
})

const typeTagType = (raw?: string | null): TagColor => {
  if (!raw) return 'default'
  const key = raw as QuestionType
  return key in TYPE_TAG ? TYPE_TAG[key] : 'default'
}

const difficultyLabel = computed(() => {
  const raw = snapshot.value?.difficulty
  if (!raw) return '-'
  const key = raw as Difficulty
  return key in DIFFICULTY_TAG ? DIFFICULTY_MAP[key] : raw
})

function difficultyTagType(raw?: string | null): TagColor {
  if (!raw) return 'default'
  const key = raw as Difficulty
  return key in DIFFICULTY_TAG ? DIFFICULTY_TAG[key] : 'default'
}

const showOptions = computed(
  () => snapshot.value?.type === 'SINGLE' || snapshot.value?.type === 'MULTIPLE'
)

function toOptionText(opt: unknown): string {
  if (typeof opt === 'string') return opt
  if (opt && typeof opt === 'object') {
    const record = opt as Record<string, unknown>
    const content = record.content ?? record.text ?? record.value
    return typeof content === 'string' ? content : ''
  }
  return ''
}

const parsedOptions = computed<string[]>(() => {
  const raw = snapshot.value?.options
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(toOptionText)
    } catch {
      // 非 JSON，忽略
    }
    return []
  }
  if (Array.isArray(raw)) return raw.map(toOptionText)
  return []
})

const isCorrectOption = (opt: string): boolean => {
  const answer = snapshot.value?.answer
  const type = snapshot.value?.type
  if (!answer) return false
  const idx = parsedOptions.value.indexOf(opt)
  if (idx < 0) return false
  const letter = String.fromCharCode(65 + idx)
  if (type === 'SINGLE') return answer === letter
  if (type === 'MULTIPLE') return answer.split(',').map((a) => a.trim()).includes(letter)
  return false
}

const answerLabel = computed(() => {
  const answer = snapshot.value?.answer
  const type = snapshot.value?.type
  if (!answer) return ''
  const format = (letter: string): string => {
    const idx = letter.trim().charCodeAt(0) - 65
    if (idx >= 0 && idx < parsedOptions.value.length) {
      return `${letter.trim()}. ${parsedOptions.value[idx]}`
    }
    return letter.trim()
  }
  if (type === 'SINGLE') return format(answer)
  if (type === 'MULTIPLE') {
    return answer
      .split(',')
      .map(format)
      .join('；')
  }
  return answer
})

function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

function handleViewBank() {
  const bankId = wrongQuestion.value?.bankId
  if (bankId) router.push(`/banks/${bankId}`)
}

function parseSnapshot(raw?: string | null): SnapshotData | null {
  if (!raw) return null
  try {
    const obj: unknown = JSON.parse(raw)
    if (obj && typeof obj === 'object') {
      const record = obj as Record<string, unknown>
      return {
        type: typeof record.type === 'string' ? record.type : null,
        difficulty: typeof record.difficulty === 'string' ? record.difficulty : null,
        content: typeof record.content === 'string' ? record.content : null,
        options: record.options ?? null,
        answer: typeof record.answer === 'string' ? record.answer : null,
        analysis: typeof record.analysis === 'string' ? record.analysis : null
      }
    }
  } catch {
    // 忽略解析失败
  }
  return null
}

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    message.error('缺少错题记录ID')
    return
  }

  loading.value = true
  loadError.value = ''
  try {
    const res = await getWrongQuestionById(id)
    wrongQuestion.value = res.data
    snapshot.value = parseSnapshot(res.data.questionSnapshot)
    if (!snapshot.value) {
      message.warning('该错题记录没有可用的快照数据')
    }
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || err?.message || '加载错题快照失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>
