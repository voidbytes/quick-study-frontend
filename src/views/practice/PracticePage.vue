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

            <!-- 题干（富文本；填空题渲染为行内横线段） -->
            <div class="practice-stem mb-6">
              <RichText :content="practiceStem" fill-blanks />
            </div>

            <!-- 客观题选项（按 option_id 选择，字母为展示序号） -->
            <template v-if="isSingleChoice">
              <QuestionOption
                v-for="(opt, idx) in parsedOptions"
                :key="opt.id"
                :marker="optionMarker(idx)"
                :selected="!answered && selectedId === opt.id"
                :correct="answered && isCorrectOption(idx)"
                :wrong="answered && optionWrong(idx)"
                :disabled="optionDisabled(idx)"
                @select="selectAnswer(opt.id)"
              >
                <RichText :content="opt.text" />
              </QuestionOption>
            </template>

            <template v-else-if="currentQuestion?.type === 'MULTIPLE'">
              <QuestionOption
                v-for="(opt, idx) in parsedOptions"
                :key="opt.id"
                :marker="optionMarker(idx)"
                :selected="!answered && selectedIds.includes(opt.id)"
                :correct="answered && isCorrectOption(idx)"
                :wrong="answered && optionWrong(idx)"
                :disabled="optionDisabled(idx)"
                @select="toggleMultiple(opt.id)"
              >
                <RichText :content="opt.text" />
              </QuestionOption>
            </template>

            <!-- 填空题：题干徽章标空位，下方独立横线输入框逐空作答（提交后锁定） -->
            <template v-else-if="currentQuestion?.type === 'FILL_BLANK'">
              <div :key="`fill-${currentIndex}`" class="fill-lines">
                <div v-for="(blank, bi) in fillBlanks" :key="bi" class="fill-line-input">
                  <n-input
                    :value="fillBlankAnswers[bi] ?? ''"
                    :bordered="false"
                    :placeholder="`填写第 ${blank.no} 空`"
                    :disabled="answered"
                    @update:value="(v: string) => updateFillBlank(bi, v)"
                  />
                </div>
              </div>
            </template>

            <!-- 简答题：富媒体作答（富文本 + 图片，与考试侧同款编辑器） -->
            <template v-else-if="currentQuestion?.type === 'SHORT_ANSWER'">
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                请作答（支持文字、图片与公式）
              </label>
              <MarkdownEditor
                :key="`short-${currentIndex}`"
                :model-value="shortAnswerDraft"
                mode="edit"
                height="240px"
                placeholder="输入文字作答，可通过工具栏插入图片（最多 9 张）"
                :max-images="9"
                :disabled-menus="shortDisabledMenus"
                :disabled="answered"
                @update:model-value="handleShortDraftChange"
              />
            </template>

            <!-- 编程题作答（语言选择 / 运行样例 / 提交判题均在面板内） -->
            <template v-else-if="currentQuestion?.type === 'PROGRAMMING'">
              <ProgrammingAnswerPanel
                :programming="currentQuestion?.programming ?? null"
                mode="practice"
                :session-id="sessionId"
                :question-index="currentIndex"
                :initial-code="currentQuestion?.userAnswer || undefined"
                :locked="answered"
                @change="onProgrammingChange"
                @answered="onProgrammingAnswered"
              />
            </template>

            <!-- 提交后判分横幅（编程题不展示：判题结果由面板内展示） -->
            <div
              v-if="answered && currentQuestion?.type !== 'PROGRAMMING'"
              class="mt-6 px-4 py-3.5 rounded-lg border flex items-start gap-3"
              :class="bannerTone.cls"
            >
              <n-icon
                :size="22"
                class="flex-shrink-0 mt-0.5"
                :color="bannerTone.color"
              >
                <CheckmarkCircleOutline v-if="currentQuestion?.isCorrect" />
                <CloseCircleOutline v-else-if="bannerTone.state === 'wrong'" />
                <TimeOutline v-else />
              </n-icon>
              <div class="text-sm leading-relaxed min-w-0 flex-1">
                <span class="font-bold" :class="bannerTone.text">
                  {{ bannerTone.label }}
                </span>
                <!-- 填空题：逐空 ✓/✗/待评估 明细 -->
                <div v-if="fillDetailRows.length" class="mt-2 space-y-1">
                  <div
                    v-for="row in fillDetailRows"
                    :key="row.no"
                    class="flex items-center gap-2 flex-wrap"
                  >
                    <span
                      class="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold flex-shrink-0"
                      :class="row.hit ? 'bg-success-500 text-white' : row.open ? 'bg-warning-500 text-white' : 'bg-error-500 text-white'"
                    >
                      {{ row.hit ? '✓' : row.open ? '?' : '✗' }}
                    </span>
                    <span class="text-neutral-600">空{{ row.no }}：</span>
                    <span class="font-medium text-neutral-900">{{ row.user || '未作答' }}</span>
                    <template v-if="!row.hit">
                      <span v-if="row.open" class="text-warning-600">（开放空，待 AI 评估）</span>
                      <span v-else class="text-neutral-500">正确答案：<b class="text-success-700">{{ row.correct }}</b></span>
                    </template>
                  </div>
                </div>
                <template v-else>
                  <span class="text-neutral-600">
                    你的答案：<b>{{ formatAnswer(currentQuestion?.userAnswer, currentQuestion?.type) || '未作答' }}</b>
                  </span>
                  <template v-if="!currentQuestion?.isCorrect">
                    <span class="mx-2 text-neutral-300">|</span>
                    <span class="text-neutral-600">
                      正确答案：<b class="text-success-700">{{ formatAnswer(currentQuestion?.answer, currentQuestion?.type) }}</b>
                    </span>
                  </template>
                </template>
              </div>
              <!-- 填空存在未判定空/开放空时显示 AI 给分建议（全命中不显示；AI 未配置/报错时降级隐藏） -->
              <n-button
                v-if="showAiSuggest"
                size="small"
                type="warning"
                secondary
                :loading="aiSuggestLoading"
                @click="handleAiSuggest"
              >
                AI 给分建议
              </n-button>
              <!-- 简答自评 -->
              <div v-if="isShortPending" class="flex gap-2 mt-2">
                <n-button size="small" type="success" secondary @click="selfAssess(true)">我已掌握</n-button>
                <n-button size="small" type="error" secondary @click="selfAssess(false)">还没掌握</n-button>
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

            <!-- AI 给分建议弹层（仅展示，不回写判分） -->
            <n-modal
              v-model:show="aiSuggestShow"
              preset="card"
              title="AI 给分建议"
              style="width: 520px"
            >
              <div v-if="aiSuggestResult" class="space-y-4">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm text-neutral-500">建议得分</span>
                  <span class="text-3xl font-bold text-warning-600 tabular-nums">{{ aiSuggestResult.suggestedScore }}</span>
                  <span class="text-xs text-neutral-400">仅供参考，不记入成绩</span>
                </div>
                <div class="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {{ aiSuggestResult.reasoning }}
                </div>
              </div>
              <n-spin v-else :show="true" />
            </n-modal>

            <!-- 底部操作 -->
            <div class="flex flex-wrap items-center justify-between gap-3 mt-8 pt-5 border-t border-neutral-200">
              <div class="flex flex-wrap items-center gap-2">
                <n-button size="small" :disabled="currentIndex === 0" @click="prevQuestion">上一题</n-button>
                <n-button
                  v-if="currentIndex < questions.length - 1"
                  size="small"
                  type="primary"
                  @click="nextQuestion"
                >
                  下一题
                </n-button>
                <n-badge :value="hasNote" dot>
                  <n-button size="small" quaternary @click="openNoteDrawer">
                    <template #icon>
                      <n-icon :component="BookOutline" />
                    </template>
                    笔记
                  </n-button>
                </n-badge>
              </div>
              <div class="flex flex-wrap items-center gap-2">
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

              <!-- 题干（填空题渲染为行内横线段） -->
              <div class="practice-stem mb-4">
                <RichText :content="q.content" fill-blanks />
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

    <!-- ============ 题目笔记抽屉 ============ -->
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  GameControllerOutline,
  CloseOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  BulbOutline,
  DocumentTextOutline,
  BookOutline,
  TimeOutline
} from '@vicons/ionicons5'
import { getPracticeSession, submitPracticeAnswer, completePractice, aiSuggest } from '@/api/practice'
import { getNote, saveNote, deleteNote, NOTE_IMAGE_PATTERN } from '@/api/note'
import ProgrammingAnswerPanel from '@/components/programming/ProgrammingAnswerPanel.vue'
import type { ProgrammingAnswerView } from '@/components/programming/ProgrammingAnswerPanel.vue'
import type { PracticeQuestion, OptionItem } from '@/types'
import {
  parseOptionList,
  sortOptionsById,
  parseAnswerIds,
  formatAnswerIds,
  formatAnswerView,
  formatFillAnswer,
  parseFillAnswer,
  parseFillBlanks,
  gradeFillBlanks,
  sameIdSet,
  optionMarker,
  TRUE_FALSE_TRUE_ID,
  TRUE_FALSE_FALSE_ID
} from '@/utils/answer'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP } from '@/utils/constants'
import { useConfirm } from '@/composables/useConfirm'
import QuestionOption from '@/components/common/QuestionOption.vue'
import RichText from '@/components/common/RichText.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { confirm } = useConfirm()

/** 会话中的题目行：userAnswer / isCorrect 由后端 answers 合并进来，仅运行期赋值 */
interface QuestionRow extends PracticeQuestion {
  userAnswer?: string | null
  isCorrect?: boolean | null
  /** 编程题配置（答题者视角，脱敏：仅公开样例） */
  programming?: ProgrammingAnswerView | null
  /** 填空题逐空判分明细（后端 saveAnswer 响应扩展，运行期赋值） */
  fillDetail?: FillBlankDetail[] | null
}

/** 填空逐空判分明细（后端契约：每空对错 + 开放空标记） */
interface FillBlankDetail {
  /** 该空是否确定性命中 */
  hit: boolean
  /** 是否开放空（无标准答案，待 AI 评估） */
  open?: boolean
}

/** filterParams JSON 展开 */
interface FilterParams {
  sourceType?: string
  bankIds?: number[]
  types?: string[]
  tagIds?: string[]
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
/** 单选/判断：当前选中的 option_id（未选为 null） */
const selectedId = ref<number | null>(null)
/** 多选：已选 option_id 集合 */
const selectedIds = ref<number[]>([])
/** 填空：当前题逐空作答（与【空N】顺序对齐） */
const fillBlankAnswers = ref<string[]>([])
/** 简答：当前题富文本草稿 */
const shortAnswerDraft = ref('')
const answered = ref(false)
const submitting = ref(false)
const loading = ref(true)
const result = ref<ResultView | null>(null)
const filterParams = ref<FilterParams | null>(null)

const currentQuestion = computed<QuestionRow | null>(() => questions.value[currentIndex.value] || null)

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
  const questionId = currentQuestion.value?.id
  if (!questionId) return
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
  const questionId = currentQuestion.value?.id
  if (!questionId || !noteCanSave.value) return
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
  const questionId = currentQuestion.value?.id
  if (!questionId) return
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

// 切题时重置笔记标记（dot 惰性更新，回显以打开抽屉为准）
watch(currentIndex, () => {
  hasNote.value = false
  noteContent.value = ''
})

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

/** 解析 options 为 OptionItem[]（对象数组/JSON 字符串统一收敛）；判断题缺 options 时兜底 正确/错误 */
const parsedOptions = computed<OptionItem[]>(() => {
  const q = currentQuestion.value
  if (!q) return []
  const list = parseOptionList(q.options)
  if (!list.length && q.type === 'TRUE_FALSE') {
    // 判断题后端固定物化 {id:0 正确, id:1 错误}；老快照缺 options 时前端兜底同款
    return [
      { id: TRUE_FALSE_TRUE_ID, text: '正确' },
      { id: TRUE_FALSE_FALSE_ID, text: '错误' }
    ]
  }
  // 作答态保持快照乱序（防背题）；提交反馈后回落 id 升序（题库原序），
  // 使展示字母与解析文本按存库字母（id 0=A）书写的引用对齐
  return answered.value ? sortOptionsById(list) : list
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
    case 'PROGRAMMING': return 'bg-primary-50 text-primary-600'
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
  // 填空答案展示改为答案组格式：① color/Color ② #fff ③（开放）
  if (type === 'FILL_BLANK') return formatFillAnswer(answer) || answer
  return formatAnswerView(answer, type, parsedOptions.value) || answer
}

function formatDuration(seconds?: number): string {
  if (seconds == null) return '-'
  if (seconds < 60) return `${seconds} 秒`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分钟`
}

/** 该展示位是否命中标准答案（按 option_id 集合比较，与展示顺序无关） */
function isCorrectOption(index: number): boolean {
  const q = currentQuestion.value
  if (!q) return false
  const opt = parsedOptions.value[index]
  if (!opt) return false
  return parseAnswerIds(q.answer).includes(opt.id)
}

// ==================== 填空题（多空行内作答 + 逐空反馈 + AI 建议） ====================

/** 题干：填空保留【空N】原文由 RichText fill-blanks 渲染徽章（方案 C） */
const practiceStem = computed(() => currentQuestion.value?.content ?? '')

/** 填空空位序列（1..N，与题干徽章编号一致），驱动下方横线输入框列表 */
const fillBlanks = computed(() =>
  currentQuestion.value?.type === 'FILL_BLANK' ? parseFillBlanks(currentQuestion.value.content).blanks : []
)

function updateFillBlank(bi: number, value: string) {
  const arr = [...fillBlankAnswers.value]
  arr[bi] = value
  fillBlankAnswers.value = arr
  saveLocalAnswer()
}

/** 当前题是否为填空题且已提交（用于逐空明细渲染分流） */
const isFillAnswered = computed(
  () => answered.value && currentQuestion.value?.type === 'FILL_BLANK'
)

/** 填空逐空明细行（无明细/非填空题为空数组，横幅回落通用文案） */
const fillDetailRows = computed(() => {
  if (!isFillAnswered.value) return []
  const q = currentQuestion.value as QuestionRow
  const groups = parseFillAnswer(q.answer)
  const user = parseFillUserAnswerList(q.userAnswer)
  const detail = q.fillDetail
  const n = Math.max(groups.length, user.length, detail?.length ?? 0)
  const rows: { no: number; user: string; correct: string; hit: boolean; open: boolean }[] = []
  for (let i = 0; i < n; i++) {
    const group = groups[i] || []
    // 后端逐空明细优先；缺省（旧格式会话）时本地确定性预判兜底
    const d = detail?.[i]
    const hit = d ? d.hit === true : gradeFillBlanks([group], [user[i] ?? ''])[0]
    rows.push({
      no: i + 1,
      user: user[i] ?? '',
      correct: group.length ? group.join(' / ') : '（开放）',
      hit,
      open: d?.open === true || (!d && group.length === 0)
    })
  }
  return rows
})

/** 是否存在未判定空（开放空或后端未给出逐空判定的未命中空） */
const fillPending = computed(() =>
  isFillAnswered.value && currentQuestion.value?.isCorrect == null && fillDetailRows.value.some((r) => !r.hit)
)

/** AI 给分建议按钮显隐：填空已答且有未判定空；或简答题已作答（主观题一律待 AI/自评） */
const isShortAnswered = computed(
  () => currentQuestion.value?.type === 'SHORT_ANSWER' && Boolean(currentQuestion.value?.userAnswer)
)
const showAiSuggest = computed(
  () => aiSuggestAvailable.value && (fillPending.value || isShortAnswered.value)
)
/** 判分横幅状态机：填空待评估 / 简答待自评 / 对 / 错 */
const bannerTone = computed(() => {
  const q = currentQuestion.value
  const isShort = q?.type === 'SHORT_ANSWER' && answered.value && q.isCorrect == null && !q.userAnswer?.startsWith('<span')
  if (q?.isCorrect) {
    return { state: 'correct', label: '回答正确', cls: 'bg-success-50 border-success-200', color: 'var(--color-success-500)', text: 'text-success-700' }
  }
  if (fillPending.value || isShort) {
    return { state: 'pending', label: isShort ? '主观题待自评：可对照参考答案，或点「AI 给分建议」辅助判断' : '部分命中，其余待评估', cls: 'bg-warning-50 border-warning-200', color: 'var(--color-warning-500)', text: 'text-warning-700' }
  }
  return { state: 'wrong', label: '回答错误', cls: 'bg-error-50 border-error-200', color: 'var(--color-error-500)', text: 'text-error-700' }
})

/** 简答自评：主观题由用户自己判定掌握与否（写入本地练习状态，仅标记，不影响统计口径） */
const selfAssessed = ref<Record<number, boolean>>({})
function selfAssess(correct: boolean) {
  const idx = currentIndex.value
  selfAssessed.value = { ...selfAssessed.value, [idx]: correct }
  const q = questions.value[idx]
  if (q) q.isCorrect = correct
  message.info(correct ? '已标记为掌握' : '已标记为未掌握，将进入错题本')
}

/** 简答作答工具栏禁用项（与考试侧 answerDisabledMenus 同口径） */
const shortDisabledMenus = ['title', 'quote', 'code', 'table', 'hr', 'link', 'clear', 'sub', 'sup']

/** 简答待自评（对答案环节，未自评过） */
const isShortPending = computed(() => {
  const q = currentQuestion.value
  return q?.type === 'SHORT_ANSWER' && answered.value && q.isCorrect == null && selfAssessed.value[currentIndex.value] === undefined
})

/** 简答草稿变更：本地暂存（整卷模式，不判分） */
function handleShortDraftChange(v: string) {
  shortAnswerDraft.value = v
  saveLocalAnswer()
}

const aiSuggestShow = ref(false)
const aiSuggestLoading = ref(false)
const aiSuggestResult = ref<{ suggestedScore: number; reasoning: string } | null>(null)
/** AI 报过错（未配置/失败）后本题降级隐藏按钮，避免反复触发 */
const aiSuggestAvailable = ref(true)

async function handleAiSuggest() {
  const q = currentQuestion.value
  if (!q) return
  aiSuggestLoading.value = true
  try {
    const res = await aiSuggest(sessionId, currentIndex.value)
    aiSuggestResult.value = res.data
    aiSuggestShow.value = true
  } catch {
    // AI 未配置/调用失败：降级隐藏按钮，不影响作答主流程
    aiSuggestAvailable.value = false
    message.error('AI 建议暂不可用')
  } finally {
    aiSuggestLoading.value = false
  }
}

/** yourAnswer（JSON 字符串数组）→ string[]；旧格式纯文本按单空容错 */
function parseFillUserAnswerList(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map((v) => (typeof v === 'string' ? v : ''))
  } catch {
    // 旧格式纯文本按单空
  }
  return [raw]
}

function optionSelected(index: number): boolean {
  const opt = parsedOptions.value[index]
  if (!opt) return false
  return currentQuestion.value?.type === 'MULTIPLE'
    ? selectedIds.value.includes(opt.id)
    : selectedId.value === opt.id
}

/** 提交后：用户选中但选错的选项标红 */
function optionWrong(index: number): boolean {
  return answered.value && optionSelected(index) && !isCorrectOption(index)
}

/** 提交后：非正确且非选错的选项变灰不可点（其余半透明） */
function optionDisabled(index: number): boolean {
  if (!answered.value) return false
  return !isCorrectOption(index) && !optionWrong(index)
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

function selectAnswer(id: number) {
  selectedId.value = id
  selectedIds.value = []
  // 整卷模式：点选即暂存并自动跳下一题（判分统一在完成练习时进行）
  saveLocalAnswer()
  nextQuestion()
}

function toggleMultiple(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
  saveLocalAnswer()
}

/** 按题型把当前作答控件状态物化为提交串；null=该题尚未作答有效内容 */
function buildAnswerPayload(q: QuestionRow): string | null {
  const isMultiple = q.type === 'MULTIPLE'
  if (isMultiple) {
    return selectedIds.value.length ? formatAnswerIds(selectedIds.value) : null
  }
  if (q.type === 'FILL_BLANK') {
    const payload = fillBlankAnswers.value.map((v) => v ?? '')
    if (payload.every((v) => v.trim() === '')) return null
    return JSON.stringify(payload)
  }
  if (q.type === 'SHORT_ANSWER') {
    const content = shortAnswerDraft.value.trim()
    return content || null
  }
  // SINGLE / TRUE_FALSE
  if (selectedId.value == null) return null
  return formatAnswerIds([selectedId.value])
}

/** 作答暂存（牛客式整卷模式）：仅写本地状态，不调后端、不判分；完成练习时统一提交 */
function saveLocalAnswer() {
  const q = currentQuestion.value
  if (!q) return
  const answer = buildAnswerPayload(q)
  if (answer == null) return
  const target = questions.value[currentIndex.value]
  if (target) {
    target.userAnswer = answer
    target.isCorrect = null
    target.fillDetail = null
  }
}

/**
 * 填空提交结果回填：后端返回 boolean（全对/全错）或对象（含 isCorrect + 逐空明细）。
 * 明细缺省时由 fillDetailRows 的本地确定性预判兜底。
 */
function applyFillAnswerResult(q: QuestionRow, answer: string, data: unknown) {
  answered.value = true
  q.userAnswer = answer
  if (data && typeof data === 'object') {
    const obj = data as { isCorrect?: boolean | null; fillDetail?: FillBlankDetail[] }
    q.isCorrect = obj.isCorrect ?? null
    q.fillDetail = Array.isArray(obj.fillDetail) ? obj.fillDetail : null
  } else if (typeof data === 'boolean') {
    q.isCorrect = data
    q.fillDetail = null
  } else {
    q.isCorrect = null
    q.fillDetail = null
  }
}

// ==================== 编程题 ====================

/** 编程题草稿自动保存定时器（编辑防抖 1s，切题/退出不丢代码） */
let progSaveTimer: ReturnType<typeof setTimeout> | null = null

/** 编辑触发：防抖保存草稿（saveAnswer 编程题分支只存代码不判题，isCorrect=null） */
function onProgrammingChange(payload: { code: string; languageId: string | null }) {
  if (progSaveTimer) clearTimeout(progSaveTimer)
  progSaveTimer = setTimeout(async () => {
    const target = questions.value[currentIndex.value]
    if (!target || !payload.code) return
    try {
      await submitPracticeAnswer(sessionId, { index: currentIndex.value, answer: payload.code })
      target.userAnswer = payload.code
    } catch {
      // 草稿保存失败静默（提交判题时 submit-code 会补建记录）
    }
  }, 1000)
}

/** 提交判题成功：锁定本题，回填 userAnswer（判题结果由面板内展示） */
function onProgrammingAnswered(payload: { code: string; languageId: string; submissionId: string }) {
  if (progSaveTimer) clearTimeout(progSaveTimer)
  answered.value = true
  const target = questions.value[currentIndex.value]
  if (target) {
    target.userAnswer = payload.code
    target.isCorrect = null // 判题异步回写，完成练习后以最新为准
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    saveLocalAnswer()
    currentIndex.value--
    resetAnswer()
  }
}

function nextQuestion() {
  if (currentIndex.value >= questions.value.length - 1) return
  const q = currentQuestion.value
  // 主观题(填空/简答)未作答内容 → 弹框确认（可强制跳过）
  if (q && (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER')) {
    const payload = buildAnswerPayload(q)
    if (payload == null) {
      confirm({
        title: '本题尚未作答',
        content: '确定跳过本题继续下一题吗？',
        positiveText: '跳过',
        negativeText: '返回作答',
        onPositiveClick: () => {
          currentIndex.value++
          resetAnswer()
        }
      })
      return
    }
  }
  saveLocalAnswer()
  currentIndex.value++
  resetAnswer()
}

function resetAnswer() {
  selectedId.value = null
  selectedIds.value = []
  fillBlankAnswers.value = []
  shortAnswerDraft.value = ''
  answered.value = false
  // 重置 AI 建议状态（每题独立；切换后按当前题重新判定按钮显隐）
  aiSuggestShow.value = false
  aiSuggestResult.value = null
  aiSuggestAvailable.value = true
  // 恢复已答题目的状态（userAnswer 为 option_id JSON 数组字符串 / 填空 JSON 字符串数组 / 简答富文本）
  const q = questions.value[currentIndex.value]
  if (q && q.userAnswer) {
    if (q.type === 'MULTIPLE') {
      selectedIds.value = parseAnswerIds(q.userAnswer)
    } else if (q.type === 'FILL_BLANK') {
      fillBlankAnswers.value = parseFillUserAnswerList(q.userAnswer)
    } else if (q.type === 'SHORT_ANSWER') {
      shortAnswerDraft.value = q.userAnswer
    } else if (q.type !== 'PROGRAMMING') {
      // 编程题：代码与语言由面板内部状态承载，此处仅标记已作答
      selectedId.value = parseAnswerIds(q.userAnswer)[0] ?? null
    }
    // 整卷模式：作答暂存不判分，answered 仅在完成练习后的对答案环节为 true
  }
}

async function finishPractice() {
  try {
    // 整卷模式：完成时把所有本地作答统一提交后端判分（saveAnswer 幂等，重复提交覆盖）
    for (let i = 0; i < questions.value.length; i++) {
      const q = questions.value[i]
      if (!q.userAnswer) continue
      const res = await submitPracticeAnswer(sessionId, { index: i, answer: q.userAnswer })
      // 判分结果回填（对答案环节展示）：填空题返回 isCorrect + 逐空明细
      if (q.type === 'FILL_BLANK') {
        applyFillAnswerResult(q, q.userAnswer, res.data)
      } else if (typeof res.data === 'boolean') {
        q.isCorrect = res.data
      } else {
        q.isCorrect = null
      }
    }
    const res = await completePractice(sessionId)
    result.value = res.data
    // 进入对答案环节：从第 1 题开始回放，显示对错/解析/逐空明细/AI 建议
    currentIndex.value = 0
    resetAnswer()
    answered.value = true
    message.success('练习完成，进入对答案环节')
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

onBeforeUnmount(() => {
  if (progSaveTimer) clearTimeout(progSaveTimer)
})
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
/* 填空作答区：题干徽章之下独立横线输入框列表，逐空一条 */
.fill-lines {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 4px;
}
.fill-line-input {
  min-width: 120px;
}
.fill-line-input :deep(.n-input) {
  border-bottom: 1.5px solid var(--border-default);
  border-radius: 0;
  background: transparent;
}
.fill-line-input :deep(.n-input:not(.n-input--disabled):hover),
.fill-line-input :deep(.n-input:not(.n-input--disabled).n-input--focus) {
  border-bottom-color: var(--border-brand);
}
.fill-line-input :deep(.n-input--disabled) {
  border-bottom-color: var(--border-strong);
  background: transparent;
}
</style>
