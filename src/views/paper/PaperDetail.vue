<template>
  <div class="p-6 max-w-6xl mx-auto">
    <n-button quaternary @click="router.back()" class="mb-4">← 返回</n-button>

    <n-spin v-if="!loadError" :show="loading">
      <!-- 试卷基本信息 -->
      <n-card class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-xl font-bold">{{ paper?.title }}</span>
            <div class="flex items-center gap-2">
              <n-button v-if="paper?.status === 'PUBLISHED' && authStore.isAuthenticated" type="primary" size="small" @click="router.push(`/papers/${paperId}/exam`)">>
                开始考试
              </n-button>
              <n-tag v-if="paper?.status === 'PUBLISHED'" type="success">已发布</n-tag>
              <n-tag v-else>草稿</n-tag>
            </div>
          </div>
        </template>
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="描述">{{ paper?.description || '暂无' }}</n-descriptions-item>
          <n-descriptions-item label="总分">{{ paper?.totalScore }}</n-descriptions-item>
          <n-descriptions-item label="题目数">{{ paper?.questionCount }}</n-descriptions-item>
          <n-descriptions-item label="时间限制">{{ paper?.timeLimit ? paper.timeLimit + '分钟' : '不限' }}</n-descriptions-item>
          <n-descriptions-item label="发布者">{{ paper?.creatorName || '-' }}</n-descriptions-item>
          <n-descriptions-item label="分享类型">{{ shareTypeLabels[paper?.shareType] || paper?.shareType }}</n-descriptions-item>
          <n-descriptions-item label="作答次数">
            {{ attemptLimitLabel(paper?.attemptType, paper?.attemptLimit) }}
            <n-tag v-if="paper?.cheatEnabled" size="tiny" type="warning" class="ml-2">防作弊开启</n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 批改人管理（仅出卷人可见，与后端权限一致） -->
      <n-card v-if="canManage" title="批改人管理" class="mb-6">
        <div class="flex items-center gap-2">
          <n-input v-model:value="newGraderId" placeholder="输入用户ID" style="width: 200px" />
          <n-button size="small" @click="handleUpdateGrader">更换批改人</n-button>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          当前批改人ID：{{ paper?.graderId || '未设置' }}
        </div>
      </n-card>

      <!-- 题目列表（只读快照） -->
      <n-card title="题目列表" class="mb-6">
        <n-list>
          <n-list-item v-for="(q, index) in paperQuestions" :key="q.id">
            <template #prefix>
              <span class="text-gray-500 font-mono">#{{ index + 1 }}</span>
            </template>
            <n-thing :title="`${typeLabels[q.type] || '未知'} - ${q.score}分`">
              <span class="text-sm">{{ q.content?.replace(/<[^>]+>/g, '').substring(0, 100) }}</span>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-card>

      <!-- 作答统计（出卷人视角） -->
      <n-card v-if="canManage" title="作答统计" class="mb-6">
        <n-grid :cols="4" :x-gap="16">
          <n-grid-item>
            <n-statistic label="总作答人数" :value="sessionStats?.totalSessions || 0" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="平均分" :value="sessionStats?.avgScore?.toFixed(1) || '-'" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="最高分" :value="sessionStats?.maxScore || '-'" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="最低分" :value="sessionStats?.minScore || '-'" />
          </n-grid-item>
        </n-grid>
      </n-card>

      <!-- 作答记录列表（仅出卷人可见） -->
      <n-card v-if="canManage" title="作答记录">
        <n-data-table
          remote
          :columns="sessionColumns"
          :data="sessions"
          :loading="sessionsLoading"
          :pagination="sessionPagination"
          @update:page="handleSessionPageChange"
        />
      </n-card>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getPaperDetail, getPaperSessions, getSessionsSummary, updateGrader } from '@/api/paper'
import dayjs from 'dayjs'
import LoadError from '@/components/LoadError.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const paperId = route.params.id as string
const loading = ref(false)
const loadError = ref('')
const paper = ref<any>(null)
const paperQuestions = ref<any[]>([])
const sessions = ref<any[]>([])
const sessionsLoading = ref(false)
const sessionStats = ref<any>(null)
const newGraderId = ref('')

// 批改人管理/作答统计/作答记录仅出卷人可见（后端同权限校验：仅创建者）
const canManage = computed(() => {
  if (!authStore.isAuthenticated || !paper.value?.creatorId) return false
  return String(paper.value.creatorId) === String(authStore.userInfo?.id)
})

const shareTypeLabels: Record<string, string> = {
  PRIVATE: '私有', LINK: '链接', PASSWORD: '密码', PUBLIC: '公开'
}

function attemptLimitLabel(attemptType?: string, attemptLimit?: number): string {
  if (attemptType === 'UNLIMITED') return '不限次数'
  if (attemptLimit && attemptLimit > 0) return attemptLimit + '次'
  return '1次'
}

const typeLabels: Record<string, string> = {
  SINGLE: '单选题', MULTIPLE: '多选题', TRUE_FALSE: '判断题', FILL_BLANK: '填空题', SHORT_ANSWER: '简答题'
}

const sessionPagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

const sessionColumns: DataTableColumn<any>[] = [
  { title: '作答者', key: 'userNickname', width: 120 },
  { title: '得分', key: 'totalScore', width: 80, align: 'center' },
  {
    title: '状态',
    key: 'status',
    width: 90,
    align: 'center',
    render(row) {
      const map: Record<string, string> = { IN_PROGRESS: '进行中', SUBMITTED: '已提交', GRADING: '批改中', GRADED: '已批改' }
      return map[row.status] || row.status
    }
  },
  {
    title: '提交时间',
    key: 'submittedAt',
    width: 160,
    render(row) { return row.submittedAt ? dayjs(row.submittedAt).format('YYYY-MM-DD HH:mm') : '-' }
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
    message.warning('请输入批改人ID')
    return
  }
  try {
    await updateGrader(paperId, Number(newGraderId.value))
    message.success('批改人已更新')
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