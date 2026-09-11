<template>
  <div>
    <!-- 页头 -->
    <PageHeader
      show-back
      :title="paperTitle"
      :subtitle="paperSubtitle"
    >
      <template #actions>
        <n-button
          v-if="paper?.status === 'PUBLISHED' && authStore.isAuthenticated"
          type="primary"
          size="small"
          @click="router.push(`/papers/${paperId}/exam`)"
        >
          开始考试
        </n-button>
      </template>
    </PageHeader>

    <n-spin v-if="!loadError" :show="loading">
      <!-- 试卷基本信息 -->
      <div class="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-base font-semibold text-neutral-900">基本信息</span>
          <div class="flex items-center gap-2">
            <n-tag v-if="paper?.status === 'PUBLISHED'" type="success" size="small">已发布</n-tag>
            <n-tag v-else size="small">草稿</n-tag>
          </div>
        </div>
        <n-descriptions :column="2" bordered size="small">
          <n-descriptions-item label="描述">{{ paper?.description || '暂无' }}</n-descriptions-item>
          <n-descriptions-item label="总分">{{ paper?.totalScore }}</n-descriptions-item>
          <n-descriptions-item label="题目数">{{ paper?.questionCount }}</n-descriptions-item>
          <n-descriptions-item label="时间限制">{{ paper?.timeLimit ? paper.timeLimit + '分钟' : '不限' }}</n-descriptions-item>
          <n-descriptions-item label="发布者">{{ paper?.creatorName || '-' }}</n-descriptions-item>
          <n-descriptions-item label="批改人">{{ paper?.graderName || '暂无' }}</n-descriptions-item>
          <n-descriptions-item label="分享类型">{{ shareTypeLabel(paper?.shareType) }}</n-descriptions-item>
          <n-descriptions-item label="作答次数">
            {{ attemptLimitLabel(paper?.attemptType, paper?.attemptLimit) }}
            <n-tag v-if="paper?.cheatEnabled" size="tiny" type="warning" class="ml-2">防作弊开启</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="多选漏选给分">
            {{ multiplePartialLabel(paper?.multipleChoicePartial) }}
          </n-descriptions-item>
          <n-descriptions-item label="填空部分命中">
            {{ fillPartialLabel(paper?.fillBlankPartial) }}
          </n-descriptions-item>
        </n-descriptions>
      </div>

      <!-- 批改人管理（仅出卷人可见，与后端权限一致） -->
      <div v-if="canManage" class="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
        <div class="text-base font-semibold text-neutral-900 mb-4">批改人管理</div>
        <div class="flex items-center gap-2">
          <UserSearchSelect
            ref="graderSelectRef"
            v-model:model-value="newGraderId"
            placeholder="搜索用户名/昵称选择新批改人"
            class="w-72"
          />
          <n-button size="small" type="primary" :disabled="!newGraderId" @click="handleUpdateGrader">
            更换批改人
          </n-button>
        </div>
        <div class="mt-2 text-sm text-neutral-500">
          当前批改人：{{ paper?.graderName || '未设置' }}
        </div>
      </div>

      <!-- 作答统计（出卷人视角，置于题目列表上方）；字段与后端 SessionsSummaryResponse 对齐。
           totalParticipants 实为会话条数（同一人多次作答重复计入），故文案用「作答次数」 -->
      <div v-if="canManage" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="作答次数" :value="sessionStats?.totalParticipants ?? 0" tone="brand" />
        <StatCard label="平均分" :value="sessionStats ? (sessionStats.averageScore?.toFixed(1) || '0.0') : '-'" />
        <StatCard label="最高分" :value="sessionStats ? (sessionStats.maxScore || '-') : '-'" tone="success" />
        <StatCard label="最低分" :value="sessionStats ? (sessionStats.minScore || '-') : '-'" tone="error" />
      </div>

      <!-- 作答记录列表（仅出卷人可见，点击行进入批改详情） -->
      <div v-if="canManage" class="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <span class="text-base font-semibold text-neutral-900">作答记录</span>
          <span class="text-xs text-neutral-400">共 {{ sessionPagination.itemCount }} 条</span>
        </div>
        <EmptyState
          v-if="!sessionsLoading && sessions.length === 0"
          description="暂无作答记录"
          :icon="TimeOutline"
        />
        <div v-else>
          <div
            v-for="row in sessions"
            :key="row.id"
            class="flex items-center gap-4 px-5 py-4 border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer"
            @click="goSessionDetail(row)"
          >
            <div class="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <n-icon :size="18" color="var(--color-neutral-500)"><PersonOutline /></n-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-neutral-900">{{ row.userName || row.userNickname || '-' }}</span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="(sessionStatusMap[row.status] || { cls: 'bg-neutral-100 text-neutral-600' }).cls"
                >
                  {{ (sessionStatusMap[row.status] || { label: row.status }).label }}
                </span>
              </div>
              <div class="mt-0.5 text-xs text-neutral-500">
                提交于 {{ row.submittedAt ? dayjs(row.submittedAt).format('YYYY-MM-DD HH:mm') : '-' }}
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-base font-semibold text-neutral-900 tabular-nums">{{ row.totalScore ?? '-' }}</div>
              <div class="text-xs text-neutral-400">分</div>
            </div>
            <span
              v-if="['SUBMITTED', 'GRADING', 'GRADED'].includes(row.status)"
              class="text-primary-500 hover:text-primary-600 text-sm font-medium flex-shrink-0"
            >
              查看详情
            </span>
          </div>
          <!-- 分页 -->
          <div v-if="sessionPagination.itemCount > sessionPagination.pageSize" class="flex justify-end px-5 py-3 border-t border-neutral-200">
            <n-pagination
              :page="sessionPagination.page"
              :page-size="sessionPagination.pageSize"
              :item-count="sessionPagination.itemCount"
              size="small"
              @update:page="handleSessionPageChange"
            />
          </div>
        </div>
      </div>

      <!-- 题目列表（展开式：点行展开完整题干/选项/答案/解析） -->
      <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div class="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <span class="text-base font-semibold text-neutral-900">题目列表</span>
          <span class="text-xs text-neutral-400">共 {{ paperQuestions.length }} 题 · 点击展开详情</span>
        </div>
        <EmptyState
          v-if="!loading && paperQuestions.length === 0"
          description="暂无题目"
          :icon="DocumentTextOutline"
        />
        <div v-else>
          <div
            v-for="(q, index) in paperQuestions"
            :key="q.id"
            class="border-b border-neutral-200 last:border-b-0"
          >
            <!-- 行头：序号 / 题型 / 分值 / 题干摘要 / 展开箭头 -->
            <button
              class="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
              @click="toggleQuestion(index)"
            >
              <n-icon
                :size="16"
                class="text-neutral-400 transition-transform flex-shrink-0"
                :class="{ 'rotate-90': expandedQuestions.has(index) }"
              >
                <ChevronForwardOutline />
              </n-icon>
              <span class="text-sm text-neutral-500 font-mono flex-shrink-0">#{{ index + 1 }}</span>
              <span
                class="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="typeTagClass(q.type)"
              >
                {{ typeLabel(q.type) }}
              </span>
              <span class="flex-1 min-w-0 text-sm text-neutral-900 truncate">
                {{ questionSummary(q) }}
              </span>
              <span class="text-sm text-neutral-500 flex-shrink-0">{{ q.score }} 分</span>
            </button>
            <!-- 展开区：完整题干 / 选项 / 参考答案 / 解析 / 原题链接 -->
            <div v-if="expandedQuestions.has(index)" class="px-5 pb-5 pt-1 bg-neutral-50/60">
              <div class="practice-stem text-sm text-neutral-900 leading-relaxed mb-3">
                <RichText :content="q.content" fill-blanks />
              </div>
              <!-- 选项（选择题） -->
              <div v-if="parsedOptions(q).length" class="space-y-1.5 mb-3">
                <div
                  v-for="opt in parsedOptions(q)"
                  :key="opt.id"
                  class="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <span class="font-mono text-neutral-400 flex-shrink-0">{{ optionMarker(opt.id) }}.</span>
                  <RichText :content="opt.text" />
                </div>
              </div>
              <!-- 参考答案 / 解析（仅创建者可见，后端按权限下发） -->
              <div v-if="q.answer != null" class="mb-2 text-sm">
                <span class="text-neutral-500">参考答案：</span>
                <span class="text-success-700 font-medium">{{ formatAnswerView(q) }}</span>
              </div>
              <div v-if="q.analysis" class="text-sm mb-3">
                <span class="text-neutral-500">解析：</span>
                <RichText :content="q.analysis" />
              </div>
              <div v-if="!q.answer && canManage" class="mb-3 text-sm text-neutral-400">
                答案与解析未随本卷下发
              </div>
              <!-- 跳原题 -->
              <n-button
                v-if="q.questionId"
                size="tiny"
                quaternary
                type="primary"
                @click="goOriginalQuestion(q)"
              >
                查看原题 →
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getPaperDetail, getPaperSessions, getSessionsSummary, updateGrader } from '@/api/paper'
import type { ExamPaper, PaperQuestion, GradingSession } from '@/types'
import { QUESTION_TYPE_MAP } from '@/utils/constants'
import dayjs from 'dayjs'
import LoadError from '@/components/LoadError.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RichText from '@/components/common/RichText.vue'
import UserSearchSelect from '@/components/common/UserSearchSelect.vue'
import { DocumentTextOutline, ChevronForwardOutline, PersonOutline, TimeOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { parseAnswerIds, formatFillAnswer } from '@/utils/answer'
import type { OptionItem } from '@/types'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const paperId = route.params.id as string
const loading = ref(false)
const loadError = ref('')
const paper = ref<ExamPaper | null>(null)
const paperQuestions = ref<PaperQuestion[]>([])
/** 作答记录行：后端 PaperSessionResponse 返回 userName（昵称优先）与提交时间等展示字段 */
interface SessionRow extends GradingSession {
  userName?: string
  userNickname?: string
  submittedAt?: string
}
const sessions = ref<SessionRow[]>([])
const sessionsLoading = ref(false)
const sessionStats = ref<any>(null)
const newGraderId = ref<string | null>(null)
const graderSelectRef = ref<InstanceType<typeof UserSearchSelect> | null>(null)

const paperTitle = computed(() => paper.value?.title || '试卷详情')
const paperSubtitle = computed(() => (paper.value?.description ? paper.value.description : '查看试卷基本信息与作答情况'))

// 批改人管理/作答统计/作答记录仅出卷人可见（后端同权限校验：仅创建者）
const canManage = computed(() => {
  if (!authStore.isAuthenticated || !paper.value?.creatorId) return false
  return String(paper.value.creatorId) === String(authStore.userInfo?.id)
})

const shareTypeLabels: Record<string, string> = {
  PRIVATE: '私有', LINK: '链接', PASSWORD: '密码', PUBLIC: '公开'
}

function shareTypeLabel(shareType?: string): string {
  return shareType ? shareTypeLabels[shareType] || shareType : '-'
}

/** 多选漏选给分策略展示（历史数据/缺省回退 HALF，与后端默认一致） */
function multiplePartialLabel(strategy?: string | null): string {
  if (!strategy) return '漏选给一半分（HALF）'
  return strategy === 'ZERO' ? '漏选不给分（ZERO）' : '漏选给一半分（HALF）'
}

/** 填空部分命中策略展示（未知值/缺省回退 PER_BLANK，与后端 FillAnswerUtil.defaultStrategy 一致） */
function fillPartialLabel(strategy?: string | null): string {
  if (!strategy) return '按空给分（命中空累加）'
  return strategy === 'ALL_OR_NOTHING' ? '全对才给分' : '按空给分（命中空累加）'
}

function attemptLimitLabel(attemptType?: string, attemptLimit?: number | null): string {
  if (attemptType === 'UNLIMITED') return '不限次数'
  if (attemptLimit && attemptLimit > 0) return attemptLimit + '次'
  return '1次'
}

function typeLabel(type?: string): string {
  return (type && QUESTION_TYPE_MAP[type as keyof typeof QUESTION_TYPE_MAP]) || '未知'
}

function typeTagClass(type?: string): string {
  switch (type) {
    case 'SINGLE': return 'bg-info-50 text-info-600'
    case 'MULTIPLE': return 'bg-primary-50 text-primary-600'
    case 'TRUE_FALSE': return 'bg-warning-50 text-warning-600'
    case 'FILL_BLANK': return 'bg-success-50 text-success-600'
    case 'SHORT_ANSWER': return 'bg-error-50 text-error-600'
    default: return 'bg-neutral-100 text-neutral-600'
  }
}

function stripHtml(content?: string): string {
  return content?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() || ''
}

// ==================== 题目展开详情 ====================

const expandedQuestions = ref<Set<number>>(new Set())

function toggleQuestion(index: number) {
  const next = new Set(expandedQuestions.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  expandedQuestions.value = next
}

/** 行头摘要：去 HTML 标签的单行题干 */
function questionSummary(q: PaperQuestion): string {
  return stripHtml(q.content).slice(0, 60) || '（无题干）'
}

/** PaperQuestion.options(JSON 字符串) → OptionItem[] */
function parsedOptions(q: PaperQuestion): OptionItem[] {
  if (!q.options) return []
  try {
    const parsed: unknown = JSON.parse(q.options)
    if (Array.isArray(parsed)) {
      return parsed.filter((o): o is OptionItem =>
        typeof o === 'object' && o !== null && 'id' in o && 'text' in o)
    }
  } catch {
    // 旧格式忽略
  }
  return []
}

/** 选项展示序号（A/B/C…，与考试作答侧同规则：按 options 数组顺序） */
function optionMarker(id: number): string {
  return String.fromCharCode(65 + id)
}

/** 参考答案展示（按题型分派；选项答案 id → 字母） */
function formatAnswerView(q: PaperQuestion): string {
  const answer = q.answer ?? ''
  if (q.type === 'SINGLE' || q.type === 'MULTIPLE' || q.type === 'TRUE_FALSE') {
    const ids = parseAnswerIds(answer)
    if (!ids.length) return answer || '-'
    const opts = parsedOptions(q)
    return ids
      .map((id) => {
        const opt = opts.find((o) => o.id === id)
        return (opt ? optionMarker(opt.id) : String(id))
      })
      .join('、')
  }
  if (q.type === 'FILL_BLANK') {
    return formatFillAnswer(answer) || answer
  }
  return answer || '-'
}

/** 跳转原题（题库题目详情页，bankId 由试卷题目数据下发） */
function goOriginalQuestion(q: PaperQuestion) {
  if (q.bankId && q.questionId) {
    router.push(`/banks/${q.bankId}/questions/${q.questionId}`)
  }
}

function goSessionDetail(row: SessionRow) {
  if (['SUBMITTED', 'GRADING', 'GRADED'].includes(row.status)) {
    router.push(`/grading/sessions/${row.id}`)
  }
}

const sessionPagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

const sessionStatusMap: Record<string, { label: string; cls: string }> = {
  IN_PROGRESS: { label: '进行中', cls: 'bg-info-50 text-info-600' },
  SUBMITTED: { label: '已提交', cls: 'bg-neutral-100 text-neutral-600' },
  GRADING: { label: '批改中', cls: 'bg-warning-50 text-warning-600' },
  GRADED: { label: '已批改', cls: 'bg-success-50 text-success-600' }
}

async function fetchDetail() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getPaperDetail(paperId)
    paper.value = res.data
    paperQuestions.value = res.data.questions || []
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || err?.message || '加载试卷详情失败'
  } finally {
    loading.value = false
  }
}

async function fetchSessions() {
  sessionsLoading.value = true
  try {
    const res = await getPaperSessions(paperId, {
      page: sessionPagination.page,
      size: sessionPagination.pageSize
    })
    sessions.value = res.data.records || []
    sessionPagination.itemCount = res.data.total || 0
  } catch {
    // ignore
  } finally {
    sessionsLoading.value = false
  }
}

function handleSessionPageChange(page: number) {
  sessionPagination.page = page
  fetchSessions()
}

async function fetchStats() {
  try {
    const res = await getSessionsSummary(paperId)
    sessionStats.value = res.data
  } catch {
    // ignore
  }
}

async function handleUpdateGrader() {
  if (!newGraderId.value) {
    message.warning('请先搜索并选择新批改人')
    return
  }
  try {
    await updateGrader(paperId, newGraderId.value)
    message.success('批改人已更新')
    newGraderId.value = null
    await fetchDetail()
  } catch {
    message.error('更新失败')
  }
}

onMounted(async () => {
  await fetchDetail()
  // 非出卷人（含游客）不请求管理类接口，避免无谓的 403
  if (canManage.value) {
    fetchSessions()
    fetchStats()
  }
})
</script>
