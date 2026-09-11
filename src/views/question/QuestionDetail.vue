<template>
  <div>
    <!-- 页头：返回 + 标题 + 编辑操作 -->
    <PageHeader
      title="题目详情"
      :subtitle="bankSubtitle"
      showBack
      :back-to="`/banks/${bankId}`"
    >
      <template #actions>
        <n-button v-if="authStore.isAuthenticated" size="small" @click="openNoteDrawer">
          <template #icon>
            <n-icon :component="BookOutline" />
          </template>
          笔记
        </n-button>
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
      >        <!-- 标签行 -->
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
          <!-- 题干（填空题：占位符渲染为行内横线段） -->
          <section>
            <h3 class="text-sm font-medium text-neutral-500 mb-2">题干</h3>
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <RichText :content="stemContent" fill-blanks />
            </div>
          </section>

          <!-- 选项（单选 / 多选） -->
          <section v-if="showOptions">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">选项</h3>
            <div class="space-y-2">
              <div
                v-for="(opt, index) in parsedOptions"
                :key="opt.id"
                class="flex items-start gap-3 p-4 border rounded-lg transition-colors"
                :class="isCorrectOption(index)
                  ? 'border-success-500 bg-success-50'
                  : 'border-neutral-200 bg-white'"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
                  :class="isCorrectOption(index)
                    ? 'bg-success-500 text-white'
                    : 'bg-neutral-100 text-neutral-600'"
                >
                  {{ String.fromCharCode(65 + index) }}
                </div>
                <div class="flex-1 min-w-0 text-sm text-neutral-900 leading-relaxed pt-0.5">
                  <RichText :content="opt.text" />
                </div>
                <n-icon v-if="isCorrectOption(index)" color="#22B570" size="18" class="flex-shrink-0 mt-1">
                  <CheckmarkOutline />
                </n-icon>
              </div>
            </div>
          </section>

          <!-- 判断题答案 -->
          <section v-if="question.type === 'TRUE_FALSE' && question.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div>
              <n-tag :type="isTrueFalseTrue ? 'success' : 'error'" size="medium" round>
                {{ isTrueFalseTrue ? '正确' : '错误' }}
              </n-tag>
            </div>
          </section>

          <!-- 填空题答案：答案组格式（① color/Color ② #fff ③（开放）） -->
          <section v-else-if="question.type === 'FILL_BLANK' && question.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div class="bg-success-50 border border-success-100 rounded-lg p-4 font-medium">
              {{ fillAnswerLabel }}
            </div>
            <div class="text-xs text-neutral-400 mt-1.5">
              每空任一答案命中即该空正确；（开放）= 开放空，作答交 AI 辅助评估。
            </div>
          </section>

          <!-- 正确答案（其他非判断题） -->
          <section v-else-if="question.answer">
            <h3 class="text-sm font-medium text-neutral-500 mb-2">正确答案</h3>
            <div class="bg-success-50 border border-success-100 rounded-lg p-4">
              <RichText :content="answerLabel" />
            </div>
          </section>

          <!-- 解析 -->
                    <section v-if="question.analysis">
                      <h3 class="text-sm font-medium text-neutral-500 mb-2">解析</h3>
                      <div class="bg-warning-50 border border-warning-100 rounded-lg p-4">
                        <RichText :content="question.analysis" />
                      </div>
                    </section>

                    <!-- 编程题配置（出题人预览） -->
                    <section v-if="question.programming" class="border-t border-neutral-200 pt-6">
                      <h3 class="text-sm font-medium text-neutral-500 mb-3">编程题配置</h3>
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <div class="text-xs text-neutral-400 mb-1">允许语言</div>
                          <div class="text-sm flex flex-wrap gap-1">
                            <n-tag v-for="code in programmingLangList" :key="code" size="small" round>
                              {{ code.toUpperCase() }}
                            </n-tag>
                            <span v-if="!programmingLangList.length" class="text-neutral-500">不限制（全部启用语言）</span>
                          </div>
                        </div>
                        <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <div class="text-xs text-neutral-400 mb-1">时间限制</div>
                          <div class="text-sm">{{ question.programming.timeLimitMs }} ms</div>
                        </div>
                        <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                          <div class="text-xs text-neutral-400 mb-1">内存限制</div>
                          <div class="text-sm">{{ Math.round(question.programming.memoryLimitKb / 1024) }} MB</div>
                        </div>
                      </div>
                      <div class="text-xs font-medium text-neutral-400 mb-2">
                        测试用例（{{ question.programming.testCases.length }}）
                      </div>
                      <div class="space-y-2">
                        <div
                          v-for="(tc, i) in question.programming.testCases"
                          :key="i"
                          class="border border-neutral-200 rounded-lg p-3"
                        >
                          <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-medium">用例 {{ i + 1 }}</span>
                            <n-tag size="tiny" :type="tc.isSample ? 'info' : 'default'">
                              {{ tc.isSample ? '公开样例' : '隐藏用例' }}
                            </n-tag>
                          </div>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div class="bg-neutral-50 rounded p-2">
                              <div class="text-xs text-neutral-400 mb-1">标准输入</div>
                              <pre class="whitespace-pre-wrap break-all font-mono text-xs">{{ tc.input || '（空）' }}</pre>
                            </div>
                            <div class="bg-neutral-50 rounded p-2">
                              <div class="text-xs text-neutral-400 mb-1">期望输出</div>
                              <pre class="whitespace-pre-wrap break-all font-mono text-xs">{{ tc.expectedOutput || '（空）' }}</pre>
                            </div>
                          </div>
                        </div>
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

    <!-- 笔记抽屉 -->
    <n-drawer v-model:show="showNoteDrawer" :width="520" placement="right">
      <n-drawer-content title="题目笔记" closable>
        <div class="flex flex-col h-full">
          <MarkdownEditor
            v-model="noteContent"
            mode="edit"
            height="340px"
            :disable-image="true"
            placeholder="记录这道题的易错点、思路、口诀……（支持 Markdown，不支持图片）"
          />
          <div
            class="flex items-center justify-end mt-2 text-xs"
            :class="noteOverLimit || noteImageDetected ? 'text-red-500' : 'text-neutral-400'"
          >
            <span v-if="noteImageDetected" class="mr-auto">笔记不支持图片，请移除图片内容</span>
            {{ noteContent.length }} / 16000
          </div>
          <div class="flex-1" />
          <div class="flex gap-2 pt-3">
            <n-button
              type="primary"
              class="flex-1"
              :loading="noteSaving"
              :disabled="!noteCanSave"
              @click="handleSaveNote"
            >
              保存
            </n-button>
            <n-button v-if="hasNote" quaternary type="error" @click="handleDeleteNote">删除笔记</n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuestionType, Difficulty, Question, OptionItem } from '@/types'
import { getQuestionDetail } from '@/api/question'
import { parseOptionList, parseAnswerIds, idToIndex, formatFillAnswer, TRUE_FALSE_TRUE_ID } from '@/utils/answer'
import { getNote, saveNote, deleteNote, NOTE_IMAGE_PATTERN } from '@/api/note'
import { useAuthStore } from '@/stores/auth'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP, QUESTION_STATUS_OPTIONS } from '@/utils/constants'
import PageHeader from '@/components/common/PageHeader.vue'
import RichText from '@/components/common/RichText.vue'
import LoadError from '@/components/LoadError.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import { CheckmarkOutline, TimeOutline, BookOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

/** 题库 ID：长 URL 从路由取；短 URL（alias /questions/:questionId）路由无此参数，加载详情后回填 */
const bankId = ref((route.params.bankId as string) || '')
const questionId = route.params.questionId as string

// ==================== 题目笔记 ====================

const NOTE_MAX_LENGTH = 16000
const showNoteDrawer = ref(false)
const noteSaving = ref(false)
const hasNote = ref(false)
const noteContent = ref('')

const noteOverLimit = computed(() => noteContent.value.length > NOTE_MAX_LENGTH)
const noteImageDetected = computed(() => NOTE_IMAGE_PATTERN.test(noteContent.value))
const noteCanSave = computed(
  () => noteContent.value.trim().length > 0 && !noteOverLimit.value && !noteImageDetected.value
)

async function openNoteDrawer() {
  showNoteDrawer.value = true
  try {
    const res = await getNote(questionId)
    hasNote.value = !!res.data
    noteContent.value = res.data?.content || ''
  } catch {
    hasNote.value = false
    noteContent.value = ''
  }
}

async function handleSaveNote() {
  if (!noteCanSave.value) return
  noteSaving.value = true
  try {
    await saveNote(questionId, noteContent.value)
    hasNote.value = true
    message.success('笔记已保存')
    showNoteDrawer.value = false
  } catch (e: any) {
    message.error(e?.response?.data?.message || '保存失败')
  } finally {
    noteSaving.value = false
  }
}

async function handleDeleteNote() {
  try {
    await deleteNote(questionId)
    hasNote.value = false
    noteContent.value = ''
    message.success('笔记已删除')
    showNoteDrawer.value = false
  } catch (e: any) {
    message.error(e?.response?.data?.message || '删除失败')
  }
}

const loading = ref(false)
const loadError = ref('')

/** 后端运行时（QuestionDetailResponse，option_id 模型）：options 为 OptionItem 数组 */
interface QuestionDetailData extends Omit<Question, 'options' | 'answer'> {
  options?: string | OptionItem[] | null
  /** 选择题=id JSON 数组；填空/简答=文本（简答参考答案并入）；编程=null */
  answer?: string | null
  /** 编程题配置（type=PROGRAMMING 时存在） */
  programming?: {
    timeLimitMs: number
    memoryLimitKb: number
    allowedLanguages: string[] | null
    starterCode: Record<string, string>
    answerCode: Record<string, string>
    testCases: {
      input: string
      expectedOutput: string
      isSample: boolean
      sortOrder: number
    }[]
  } | null
}

const question = ref<QuestionDetailData | null>(null)

const bankSubtitle = computed(() => (question.value?.bankName ? `所属题库：${question.value.bankName}` : ''))

type TagColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const TYPE_TAG: Record<QuestionType, TagColor> = {
  SINGLE: 'info',
  MULTIPLE: 'warning',
  TRUE_FALSE: 'success',
  FILL_BLANK: 'default',
  SHORT_ANSWER: 'primary',
  PROGRAMMING: 'primary'
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

/** 编程题允许语言列表（空 = 不限制） */
const programmingLangList = computed<string[]>(() => question.value?.programming?.allowedLanguages || [])

const parsedOptions = computed<OptionItem[]>(() => parseOptionList(question.value?.options))

/** 判断题答案是否为"正确"（id=0；无法识别时回退 false） */
const isTrueFalseTrue = computed(() => parseAnswerIds(question.value?.answer)[0] === TRUE_FALSE_TRUE_ID)

/** 展示位是否命中标准答案（按 option_id 集合比较） */
const isCorrectOption = (index: number): boolean => {
  const opt = parsedOptions.value[index]
  if (!opt || !question.value?.answer) return false
  return parseAnswerIds(question.value.answer).includes(opt.id)
}

const answerLabel = computed(() => {
  const answer = question.value?.answer
  if (!answer) return ''
  const type = question.value?.type
  if (type === 'SINGLE' || type === 'MULTIPLE') {
    const ids = parseAnswerIds(answer)
    if (!ids.length) return answer
    return ids
      .map((id) => {
        const idx = idToIndex(parsedOptions.value, id)
        const marker = idx >= 0 ? String.fromCharCode(65 + idx) : String(id)
        const text = idx >= 0 ? parsedOptions.value[idx].text : ''
        return text ? `${marker}. ${text}` : marker
      })
      .join('；')
  }
  return answer
})

/** 填空题干保留【空N】原文，由 RichText fill-blanks 渲染后替换为徽章（方案 C，代码块内生效） */
const stemContent = computed(() => question.value?.content ?? '')

/** 填空答案组展示：① color/Color ② #fff ③（开放）（三形态容错） */
const fillAnswerLabel = computed(() => {
  const answer = question.value?.answer
  if (!answer) return ''
  return formatFillAnswer(answer) || answer
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
    // 短 URL 形态：bankId 只能从详情接口回填（返回题库/编辑跳转依赖它）
    if (!bankId.value && res.data?.bankId) {
      bankId.value = String(res.data.bankId)
    }
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
