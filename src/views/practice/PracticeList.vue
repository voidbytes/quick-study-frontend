<template>
  <div class="max-w-content mx-auto w-full">
    <PageHeader title="练习记录" :subtitle="pagination.itemCount ? `共 ${pagination.itemCount} 次练习` : undefined">
      <template #actions>
        <n-button type="primary" @click="showCreateDialog = true">
          <template #icon>
            <n-icon><GameControllerOutline /></n-icon>
          </template>
          开始练习
        </n-button>
      </template>
    </PageHeader>

    <!-- 筛选 -->
    <div class="flex gap-3 mb-5 flex-wrap">
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="状态"
        style="width: 150px"
        clearable
        @update:value="handleSearch"
      />
    </div>

    <!-- 加载骨架 -->
    <SkeletonList v-if="loading && sessionList.length === 0" :count="3" :cols="1" />

    <!-- 列表 -->
    <template v-else-if="sessionList.length > 0">
      <div class="flex flex-col gap-3">
        <div
          v-for="row in sessionList"
          :key="row.sessionId"
          class="bg-white border border-neutral-200 rounded-lg px-5 py-4 flex items-center gap-4 transition-all hover:border-primary-300 hover:shadow-sm"
        >
          <!-- 状态图标 -->
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="statusIconClass(row.status)"
          >
            <n-icon :size="20" :color="statusIconColor(row.status)">
              <GameControllerOutline v-if="row.status === 'IN_PROGRESS'" />
              <CheckmarkDoneOutline v-else-if="row.status === 'COMPLETED'" />
              <CloseCircleOutline v-else />
            </n-icon>
          </div>

          <!-- 主要信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-semibold text-neutral-900">{{ row.title || buildPracticeSessionTitleFromSummary(row) }}</span>
              <n-tag size="small" round :type="statusTagType(row.status)">
                {{ statusLabel(row.status) }}
              </n-tag>
            </div>
            <div class="mt-1 flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
              <span v-if="row.stats?.accuracy != null">
                正确率
                <span class="text-neutral-900 font-medium">{{ (row.stats.accuracy * 100).toFixed(1) }}%</span>
              </span>
              <span v-if="row.stats?.duration != null">
                用时 {{ formatDuration(row.stats.duration) }}
              </span>
              <span v-if="row.completedAt">
                完成于 {{ formatTime(row.completedAt) }}
              </span>
            </div>
          </div>

          <!-- 操作 -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <template v-if="row.status === 'IN_PROGRESS'">
              <n-button size="small" type="primary" quaternary @click="goSession(row)">
                继续
              </n-button>
              <n-button size="small" type="error" quaternary @click="handleAbandon(row)">
                放弃
              </n-button>
            </template>
            <n-button v-else-if="row.status === 'COMPLETED'" size="small" type="primary" quaternary @click="goSession(row)">
              查看详情
            </n-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.itemCount > pagination.pageSize" class="flex justify-end mt-5">
        <n-pagination
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.itemCount"
          @update:page="handlePageChange"
        />
      </div>
    </template>

    <!-- 空态 -->
    <div v-else class="bg-white border border-neutral-200 rounded-lg">
      <EmptyState title="暂无练习记录" description="点击右上角「开始练习」生成一套随机练习题">
        <template #action>
          <n-button type="primary" @click="showCreateDialog = true">开始练习</n-button>
        </template>
      </EmptyState>
    </div>

    <PracticeCreateDialog v-model:show="showCreateDialog" @created="handleCreated" />
  </div>
</template>

<script setup lang="ts">
import { buildPracticeSessionTitleFromSummary } from '@/utils/practiceTitle'
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  GameControllerOutline,
  CheckmarkDoneOutline,
  CloseCircleOutline
} from '@vicons/ionicons5'
import { getPracticeSessions, abandonPractice } from '@/api/practice'
import type { PracticeSessionSummary } from '@/types'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import PracticeCreateDialog from './PracticeCreateDialog.vue'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()

const loading = ref(false)
const showCreateDialog = ref(false)
const filterStatus = ref<string | null>(null)
const sessionList = ref<PracticeSessionSummary[]>([])

const statusOptions = [
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已过期', value: 'EXPIRED' }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

const statusLabels: Record<string, string> = {
  IN_PROGRESS: '进行中', COMPLETED: '已完成', EXPIRED: '已过期', ABANDONED: '已放弃'
}

function statusLabel(status?: string) {
  return status ? statusLabels[status] || status : '未知'
}

function statusTagType(status?: string): 'info' | 'success' | 'default' | 'warning' {
  switch (status) {
    case 'IN_PROGRESS': return 'info'
    case 'COMPLETED': return 'success'
    case 'ABANDONED': return 'warning'
    default: return 'default'
  }
}

function statusIconClass(status?: string): string {
  switch (status) {
    case 'IN_PROGRESS': return 'bg-primary-50'
    case 'COMPLETED': return 'bg-success-50'
    default: return 'bg-neutral-100'
  }
}

function statusIconColor(status?: string): string {
  switch (status) {
    case 'IN_PROGRESS': return 'var(--color-primary-500)'
    case 'COMPLETED': return 'var(--color-success-500)'
    default: return 'var(--color-neutral-400)'
  }
}

function formatDuration(seconds: number): string {
  if (seconds == null) return '-'
  if (seconds < 60) return `${seconds} 秒`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分钟`
}

function formatTime(time?: string | null) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

function goSession(row: PracticeSessionSummary) {
  router.push(`/practice/sessions/${row.sessionId}`)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getPracticeSessions({
      page: pagination.page,
      size: pagination.pageSize,
      status: filterStatus.value || undefined
    })
    sessionList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载练习记录失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchList()
}

function handleCreated() {
  showCreateDialog.value = false
  fetchList()
}

function handleAbandon(row: PracticeSessionSummary) {
  confirmDanger({
    title: '放弃练习',
    content: '确定要放弃该练习吗？放弃后本次进度将清空。',
    positiveText: '放弃',
    onPositiveClick: async () => {
      try {
        await abandonPractice(row.sessionId)
        message.success('已放弃')
        fetchList()
      } catch {
        message.error('操作失败')
      }
    }
  })
}

onMounted(() => { fetchList() })
</script>
