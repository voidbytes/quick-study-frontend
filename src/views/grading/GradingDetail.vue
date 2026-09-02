<template>
  <div class="max-w-content mx-auto w-full">
    <PageHeader :title="paperTitle" :subtitle="subtitle" showBack>
      <template #actions>
        <n-button
          type="primary"
          :loading="completing"
          :disabled="!session || answers.length === 0"
          @click="handleComplete"
        >
          完成批改
        </n-button>
      </template>
    </PageHeader>

    <n-spin v-if="!loadError" :show="loading">
      <template v-if="session">
        <!-- 会话概览 -->
        <div class="bg-white border border-neutral-200 rounded-lg px-5 py-4 mb-4 flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2 text-sm text-neutral-500">
            <n-icon :size="16"><PersonOutline /></n-icon>
            作答者
            <span class="text-neutral-900 font-medium">{{ session.user?.nickname || '未知用户' }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-neutral-500">
            <n-icon :size="16"><DocumentTextOutline /></n-icon>
            试卷
            <span class="text-neutral-900 font-medium">{{ session.paper?.title || '未知试卷' }}</span>
          </div>
          <span class="ml-auto text-xs text-neutral-400">共 {{ answers.length }} 题</span>
        </div>

        <!-- 逐题批改 -->
        <div class="flex flex-col gap-4" v-if="answers.length > 0">
          <div
            v-for="(answer, index) in answers"
            :key="answer.id ?? `idx-${index}`"
            class="bg-white border border-neutral-200 rounded-lg overflow-hidden"
          >
            <!-- 题号 + 题型 -->
            <div class="px-5 py-4 border-b border-neutral-200 flex items-center gap-3 flex-wrap">
              <div
                class="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0"
              >
                {{ index + 1 }}
              </div>
              <span class="font-semibold text-neutral-900">第 {{ index + 1 }} 题</span>
              <n-tag size="small" round :type="typeTagType(answer.type)">{{ typeLabel(answer.type) }}</n-tag>
              <span v-if="answer.maxScore != null" class="ml-auto text-xs text-neutral-400">
                满分 {{ answer.maxScore }} 分
              </span>
            </div>

            <div class="px-5 py-4 space-y-4">
              <!-- 题干 -->
              <section>
                <h3 class="text-sm font-medium text-neutral-500 mb-2">题干</h3>
                <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <RichText :content="questionContent(answer)" />
                </div>
              </section>

              <!-- 用户答案 / 参考答案 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section>
                  <h3 class="text-sm font-medium text-neutral-500 mb-2">用户答案</h3>
                  <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4 min-h-[56px]">
                    <RichText v-if="answer.userAnswer" :content="answer.userAnswer" />
                    <span v-else class="text-neutral-400 text-sm">未作答</span>
                  </div>
                </section>
                <section>
                  <h3 class="text-sm font-medium text-neutral-500 mb-2">参考答案</h3>
                  <div class="bg-success-50 border border-success-100 rounded-lg p-4 min-h-[56px]">
                    <RichText v-if="answer.referenceAnswer" :content="answer.referenceAnswer" />
                    <span v-else class="text-neutral-400 text-sm">无</span>
                  </div>
                </section>
              </div>

              <!-- 评分工具 -->
              <section class="border-t border-neutral-100 pt-4">
                <div class="flex items-end gap-3 flex-wrap">
                  <div style="width: 130px">
                    <span class="block text-sm font-medium text-neutral-500 mb-1">得分</span>
                    <n-input-number
                      v-model:value="answer.score"
                      :min="0"
                      :max="answer.maxScore ?? undefined"
                      size="small"
                      :disabled="answer.id == null"
                      placeholder="未评分"
                    />
                  </div>
                  <div class="flex gap-2 ml-auto">
                    <n-button
                      size="small"
                      :loading="aiLoadingId === answerKey(answer)"
                      :disabled="answer.id == null"
                      @click="handleAiSuggest(answer)"
                    >
                      AI 评分建议
                    </n-button>
                    <n-button
                      size="small"
                      :loading="kwLoadingId === answerKey(answer)"
                      :disabled="answer.id == null"
                      @click="handleKeywordSuggest(answer)"
                    >
                      关键词评分
                    </n-button>
                    <n-button
                      size="small"
                      type="primary"
                      :loading="saveLoadingId === answerKey(answer)"
                      :disabled="answer.id == null"
                      @click="handleSaveScore(answer)"
                    >
                      保存得分
                    </n-button>
                  </div>
                </div>

                <!-- 建议理由 -->
                <div
                  v-if="suggestionTexts[answerKey(answer)]"
                  class="mt-3 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 text-sm text-neutral-700 leading-relaxed"
                >
                  {{ suggestionTexts[answerKey(answer)] }}
                </div>
              </section>
            </div>
          </div>
        </div>
      </template>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { PersonOutline, DocumentTextOutline } from '@vicons/ionicons5'
import { getGradingSession, saveScore, completeGrading, aiSuggest, keywordSuggest } from '@/api/grading'
import type { GradingAnswerDetail, GradingSessionDetail } from '@/api/grading'
import { QUESTION_TYPE_MAP } from '@/utils/constants'
import type { QuestionType } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import RichText from '@/components/common/RichText.vue'
import LoadError from '@/components/LoadError.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const sessionId = route.params.id as string
const loading = ref(false)
const loadError = ref('')
const completing = ref(false)
const session = ref<GradingSessionDetail | null>(null)

const aiLoadingId = ref('')
const kwLoadingId = ref('')
const saveLoadingId = ref('')
const suggestionTexts = ref<Record<string, string>>({})

const answers = computed(() => session.value?.answers ?? [])

const paperTitle = computed(() => session.value?.paper?.title || '批改详情')
const subtitle = computed(() => {
  if (!session.value) return ''
  const user = session.value.user?.nickname || '未知用户'
  return `${user} 的作答 · ${answers.value.length} 题`
})

type TagColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const TYPE_TAG: Record<QuestionType, TagColor> = {
  SINGLE: 'info',
  MULTIPLE: 'warning',
  TRUE_FALSE: 'success',
  FILL_BLANK: 'default',
  SHORT_ANSWER: 'primary'
}

function typeKeyOf(raw: string | null | undefined): QuestionType | null {
  if (!raw) return null
  const key = raw as QuestionType
  return key in TYPE_TAG ? key : null
}

function typeLabel(raw: string | null | undefined): string {
  const key = typeKeyOf(raw)
  return key ? QUESTION_TYPE_MAP[key] : raw || '未知题型'
}

function typeTagType(raw: string | null | undefined): TagColor {
  const key = typeKeyOf(raw)
  return key ? TYPE_TAG[key] : 'default'
}

function answerKey(answer: GradingAnswerDetail): string {
  return answer.id != null ? String(answer.id) : ''
}

/** 题干：content 为整段快照 JSON 时提取其中 content 字段，其余情况原样展示 */
function questionContent(answer: GradingAnswerDetail): string {
  const raw = answer.content
  if (!raw) return ''
  try {
    const obj: unknown = JSON.parse(raw)
    if (obj && typeof obj === 'object') {
      const text = (obj as { content?: unknown }).content
      if (typeof text === 'string') return text
    }
  } catch {
    // 非 JSON，走原样
  }
  return raw
}

async function fetchDetail() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getGradingSession(sessionId)
    session.value = res.data
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || err?.message || '加载批改详情失败'
  } finally {
    loading.value = false
  }
}

function handleAiError(err: unknown) {
  const e = err as { response?: { data?: { code?: number; message?: string } } }
  const code = e?.response?.data?.code
  if (code === 60601) message.error('未配置 AI Key')
  else if (code === 60602) message.error('AI 调用失败')
  else message.error(e?.response?.data?.message || '获取 AI 建议失败')
}

async function handleSaveScore(answer: GradingAnswerDetail) {
  const key = answerKey(answer)
  if (!key) {
    message.warning('该题暂无作答记录，无法评分')
    return
  }
  saveLoadingId.value = key
  try {
    await saveScore(sessionId, answer.id as number, { score: answer.score as number })
    message.success('得分已保存')
  } catch {
    message.error('保存失败')
  } finally {
    saveLoadingId.value = ''
  }
}

async function handleAiSuggest(answer: GradingAnswerDetail) {
  const key = answerKey(answer)
  if (!key) {
    message.warning('该题暂无作答记录，无法评分')
    return
  }
  aiLoadingId.value = key
  try {
    const res = await aiSuggest(sessionId, answer.id as number)
    answer.score = res.data.suggestedScore
    suggestionTexts.value[key] = res.data.reasoning || ''
    message.success(`AI 建议得分：${res.data.suggestedScore}`)
  } catch (err) {
    handleAiError(err)
  } finally {
    aiLoadingId.value = ''
  }
}

async function handleKeywordSuggest(answer: GradingAnswerDetail) {
  const key = answerKey(answer)
  if (!key) {
    message.warning('该题暂无作答记录，无法评分')
    return
  }
  kwLoadingId.value = key
  try {
    const res = await keywordSuggest(sessionId, answer.id as number)
    answer.score = res.data.suggestedScore
    suggestionTexts.value[key] = res.data.reasoning || ''
    message.success(`关键词匹配建议得分：${res.data.suggestedScore}`)
  } catch (err) {
    handleAiError(err)
  } finally {
    kwLoadingId.value = ''
  }
}

async function handleComplete() {
  completing.value = true
  try {
    await completeGrading(sessionId)
    message.success('批改完成')
    router.push('/grading')
  } catch {
    message.error('完成批改失败')
  } finally {
    completing.value = false
  }
}

onMounted(() => { fetchDetail() })
</script>
