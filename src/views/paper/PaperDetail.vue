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

      <!-- 题目列表（只读快照） -->
      <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-neutral-200">
          <span class="text-base font-semibold text-neutral-900">题目列表</span>
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
            class="flex items-start gap-3 px-5 py-4 border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors"
          >
            <span class="text-sm text-neutral-500 font-mono flex-shrink-0 mt-0.5">#{{ index + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="typeTagClass(q.type)"
                >
                  {{ typeLabel(q.type) }}
                </span>
                <span class="text-sm text-neutral-500">{{ q.score }} 分</span>
              </div>
              <div class="text-sm text-neutral-900 whitespace-pre-line">{{ stripHtml(q.content) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 作答统计（出卷人视角） -->
      <div v-if="canManage" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="总作答人数" :value="sessionStats?.totalSessions || 0" tone="brand" />
        <StatCard label="平均分" :value="sessionStats?.avgScore?.toFixed(1) || '-'" />
        <StatCard label="最高分" :value="sessionStats?.maxScore || '-'" tone="success" />
        <StatCard label="最低分" :value="sessionStats?.minScore || '-'" tone="error" />
      </div>

      <!-- 作答记录列表（仅出卷人可见） -->
      <div v-if="canManage" class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div class="px-5 py-4 border-b border-neutral-200">
          <span class="text-base font-semibold text-neutral-900">作答记录</span>
        </div>
        <n-data-table
          remote
          :columns="sessionColumns"
          :data="sessions"
          :loading="sessionsLoading"
          :pagination="sessionPagination"
          size="small"
          @update:page="handleSessionPageChange"
        />
      </div>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getPaperDetail, getPaperSessions, getSessionsSummary, updateGrader } from '@/api/paper'
import type { ExamPaper, PaperQuestion, GradingSession } from '@/types'
import { QUESTION_TYPE_MAP } from '@/utils/constants'
import dayjs from 'dayjs'
import LoadError from '@/components/LoadError.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import UserSearchSelect from '@/components/common/UserSearchSelect.vue'
import { DocumentTextOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

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

const sessionColumns: DataTableColumn<SessionRow>[] = [
  {
    title: '作答者',
    key: 'userName',
    width: 140,
    ellipsis: { tooltip: true },
    render(row) { return row.userName || row.userNickname || '-' }
  },
  { title: '得分', key: 'totalScore', width: 80, align: 'center' },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render(row) {
      const item = sessionStatusMap[row.status] || { label: row.status, cls: 'bg-neutral-100 text-neutral-600' }
      return h('span', { class: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.cls}` }, item.label)
    }
  },
  {
    title: '提交时间',
    key: 'submittedAt',
    width: 170,
    render(row) { return row.submittedAt ? dayjs(row.submittedAt).format('YYYY-MM-DD HH:mm') : '-' }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render(row) {
      // 已提交/批改中的会话可进入详情（后端允许批改人与出卷人只读查看）
      const viewable = ['SUBMITTED', 'GRADING', 'GRADED'].includes(row.status)
      if (!viewable) return '-'
      return h(
        'a',
        {
          class: 'text-primary-500 hover:text-primary-600 text-sm font-medium cursor-pointer',
          onClick: () => router.push(`/grading/sessions/${row.id}`)
        },
        '查看详情'
      )
    }
  }
]

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
