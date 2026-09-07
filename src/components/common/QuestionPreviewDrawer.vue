<template>
  <n-drawer :show="show" :width="520" @update:show="(v: boolean) => emit('update:show', v)">
    <n-drawer-content :title="title" closable>
      <n-spin :show="fetching">
        <div v-if="detail" class="space-y-5">
          <!-- 标签行 -->
          <div class="flex items-center gap-2 flex-wrap">
            <n-tag size="small" round :type="typeTagType(detail.type)">{{ typeLabel(detail.type) }}</n-tag>
            <n-tag size="small" round :type="difficultyTagType(detail.difficulty)">
              {{ difficultyLabel(detail.difficulty) }}
            </n-tag>
            <span v-if="detail.bankName" class="ml-auto text-xs text-neutral-400">{{ detail.bankName }}</span>
          </div>

          <!-- 题干 -->
          <section>
            <h3 class="text-sm font-medium text-neutral-500 mb-2">题干</h3>
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <RichText :content="detail.content" />
            </div>
          </section>

          <!-- 选项（单选 / 多选） -->
          <section v-if="showOptions">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">选项</h3>
            <div class="space-y-2">
              <div
                v-for="(opt, index) in parsedOptions"
                :key="index"
                class="flex items-start gap-3 p-3 border rounded-lg transition-colors"
                :class="isCorrectOption(opt) ? 'border-success-500 bg-success-50' : 'border-neutral-200'"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
                  :class="isCorrectOption(opt) ? 'bg-success-500 text-white' : 'bg-neutral-100 text-neutral-600'"
                >
                  {{ String.fromCharCode(65 + index) }}
                </div>
                <div class="flex-1 min-w-0 text-sm text-neutral-900 leading-relaxed pt-0.5">
                  <RichText :content="opt" />
                </div>
              </div>
            </div>
          </section>

          <!-- 正确答案 -->
          <section v-if="detail.type === 'TRUE_FALSE' && detail.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <n-tag :type="detail.answer === 'true' ? 'success' : 'error'" round>
              {{ detail.answer === 'true' ? '正确' : '错误' }}
            </n-tag>
          </section>
          <section v-else-if="detail.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div class="bg-success-50 border border-success-100 rounded-lg p-4 font-medium">
              <RichText :content="detail.answer" />
            </div>
          </section>

          <!-- 参考答案 -->
          <section v-if="detail.referenceAnswer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">参考答案</h3>
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <RichText :content="detail.referenceAnswer" />
            </div>
          </section>

          <!-- 解析 -->
          <section v-if="detail.analysis">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">解析</h3>
            <div class="bg-warning-50 border border-warning-100 rounded-lg p-4">
              <RichText :content="detail.analysis" />
            </div>
          </section>
        </div>
      </n-spin>
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts">
/**
 * 预览题目最小字段集：题目列表项（QuestionResponse）、试卷回填项（PaperQuestion）均可直接传入。
 * 传入项缺少答案等字段时（组卷编辑回填场景），组件内部自动拉取题目详情补全。
 */
export interface PreviewQuestion {
  id: number
  type?: string | null
  difficulty?: string | null
  content?: string | null
  options?: unknown
  answer?: string | null
  referenceAnswer?: string | null
  analysis?: string | null
  bankName?: string | null
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getQuestionDetail } from '@/api/question'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP } from '@/utils/constants'
import type { QuestionType, Difficulty } from '@/types'
import RichText from '@/components/common/RichText.vue'

const props = defineProps<{
  show: boolean
  question: PreviewQuestion | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const fetching = ref(false)
const detail = ref<PreviewQuestion | null>(null)

const title = computed(() => {
  if (!detail.value) return '题目预览'
  return `题目预览 #${detail.value.id}`
})

type TagColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const TYPE_TAG: Record<string, TagColor> = {
  SINGLE: 'info',
  MULTIPLE: 'warning',
  TRUE_FALSE: 'success',
  FILL_BLANK: 'default',
  SHORT_ANSWER: 'primary',
  PROGRAMMING: 'primary'
}

const DIFFICULTY_TAG: Record<string, TagColor> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'error'
}

function typeLabel(type?: string | null): string {
  return (type && QUESTION_TYPE_MAP[type as QuestionType]) || type || '-'
}

function typeTagType(type?: string | null): TagColor {
  return (type && TYPE_TAG[type]) || 'default'
}

function difficultyLabel(difficulty?: string | null): string {
  return (difficulty && DIFFICULTY_MAP[difficulty as Difficulty]) || difficulty || '-'
}

function difficultyTagType(difficulty?: string | null): TagColor {
  return (difficulty && DIFFICULTY_TAG[difficulty]) || 'default'
}

const showOptions = computed(() => detail.value?.type === 'SINGLE' || detail.value?.type === 'MULTIPLE')

const parsedOptions = computed<string[]>(() => {
  const raw = detail.value?.options
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

function isCorrectOption(opt: string): boolean {
  const answer = detail.value?.answer
  if (!answer) return false
  const idx = parsedOptions.value.indexOf(opt)
  if (idx < 0) return false
  if (detail.value?.type === 'SINGLE') {
    return answer === String.fromCharCode(65 + idx)
  }
  if (detail.value?.type === 'MULTIPLE') {
    return answer.split(',').includes(String.fromCharCode(65 + idx))
  }
  return false
}

watch(
  () => props.question,
  async (q) => {
    detail.value = q ? { ...q } : null
    if (!q || q.answer != null) return
    fetching.value = true
    try {
      const res = await getQuestionDetail(q.id)
      detail.value = { ...q, ...res.data }
    } catch {
      // 题目详情不可见（如题库权限变化）时按已有字段展示
    } finally {
      fetching.value = false
    }
  }
)
</script>
