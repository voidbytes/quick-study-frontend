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

          <!-- 题干（填空题：占位符渲染为行内横线段） -->
          <section>
            <h3 class="text-sm font-medium text-neutral-500 mb-2">题干</h3>
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <RichText :content="stemContent" />
            </div>
          </section>

          <!-- 选项（单选 / 多选） -->
          <section v-if="showOptions">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">选项</h3>
            <div class="space-y-2">
              <div
                v-for="(opt, index) in parsedOptions"
                :key="opt.id"
                class="flex items-start gap-3 p-3 border rounded-lg transition-colors"
                :class="isCorrectOption(index) ? 'border-success-500 bg-success-50' : 'border-neutral-200'"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
                  :class="isCorrectOption(index) ? 'bg-success-500 text-white' : 'bg-neutral-100 text-neutral-600'"
                >
                  {{ String.fromCharCode(65 + index) }}
                </div>
                <div class="flex-1 min-w-0 text-sm text-neutral-900 leading-relaxed pt-0.5">
                  <RichText :content="opt.text" />
                </div>
              </div>
            </div>
          </section>

          <!-- 判断题答案 -->
          <section v-if="detail.type === 'TRUE_FALSE' && detail.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <n-tag :type="isTrueFalseTrue ? 'success' : 'error'" round>
              {{ isTrueFalseTrue ? '正确' : '错误' }}
            </n-tag>
          </section>
          <!-- 填空题答案：答案组格式 ① color/Color ② #fff ③（开放） -->
          <section v-else-if="detail.type === 'FILL_BLANK' && detail.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div class="bg-success-50 border border-success-100 rounded-lg p-4 font-medium">
              {{ fillAnswerLabel }}
            </div>
            <div class="text-xs text-neutral-400 mt-1.5">
              每空任一答案命中即该空正确；（开放）= 开放空，作答交 AI 辅助评估。
            </div>
          </section>
          <section v-else-if="detail.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div class="bg-success-50 border border-success-100 rounded-lg p-4 font-medium">
              <RichText :content="answerLabel" />
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
  /** 题目雪花 id（字符串序列化） */
  id: string
  type?: string | null
  difficulty?: string | null
  content?: string | null
  /** OptionItem 对象数组或 JSON 字符串（option_id 模型） */
  options?: unknown
  /** 选择题=id JSON 数组；填空/简答=文本；编程=null */
  answer?: string | null
  analysis?: string | null
  bankName?: string | null
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getQuestionDetail } from '@/api/question'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP } from '@/utils/constants'
import {
  parseOptionList,
  parseAnswerIds,
  answerIdsToLabel,
  formatFillAnswer,
  renderFillContent,
  TRUE_FALSE_TRUE_ID
} from '@/utils/answer'
import type { OptionItem } from '@/types'
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

const parsedOptions = computed<OptionItem[]>(() => parseOptionList(detail.value?.options))

/** 判断题答案是否为"正确"（id=0） */
const isTrueFalseTrue = computed(() => parseAnswerIds(detail.value?.answer)[0] === TRUE_FALSE_TRUE_ID)

/** 展示位是否命中标准答案（按 option_id 集合比较） */
function isCorrectOption(index: number): boolean {
  const opt = parsedOptions.value[index]
  if (!opt) return false
  return parseAnswerIds(detail.value?.answer).includes(opt.id)
}

/** 选择题答案 → 展示字母+内容；其余题型原样 */
const answerLabel = computed(() => {
  const answer = detail.value?.answer
  if (!answer) return ''
  const type = detail.value?.type
  if (type === 'SINGLE' || type === 'MULTIPLE') {
    return answerIdsToLabel(parsedOptions.value, answer)
  }
  return answer
})

/** 填空题干：【空N】渲染为行内横线段（进 markdown-it 前替换） */
const stemContent = computed(() => {
  const d = detail.value
  if (!d) return ''
  return d.type === 'FILL_BLANK' ? renderFillContent(d.content) : d.content
})

/** 填空答案组展示：① color/Color ② #fff ③（开放）（三形态容错） */
const fillAnswerLabel = computed(() => {
  const answer = detail.value?.answer
  if (!answer) return ''
  return formatFillAnswer(answer) || answer
})

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
