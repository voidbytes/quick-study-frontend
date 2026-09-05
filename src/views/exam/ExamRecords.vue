<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-xl font-semibold text-neutral-900 mb-4">考试记录</h1>

    <!-- 统计概览 -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <StatCard label="参加考试" :value="totalCount" tone="brand" />
      <StatCard label="已批改" :value="gradedCount" />
      <StatCard label="平均分" :value="avgScore ?? '-'" tone="success" />
    </div>

    <!-- 状态筛选 -->
    <div class="flex gap-2 mb-4">
      <span
        v-for="t in FILTERS"
        :key="t.key"
        class="px-4 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors"
        :class="filter === t.key ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'"
        @click="filter = t.key"
      >
        {{ t.label }}
      </span>
    </div>

    <n-spin :show="loading">
      <EmptyState
        v-if="!loading && records.length === 0"
        title="还没有参加过的考试"
        description="去首页挑一场考试开始吧"
      >
        <template #action>
          <n-button type="primary" @click="router.push('/papers')">去考试</n-button>
        </template>
      </EmptyState>

      <div v-else class="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200">
        <div
          v-for="r in filtered"
          :key="r.id"
          class="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
          @click="router.push(`/exam/sessions/${r.id}/result`)"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-neutral-900 truncate">{{ r.paperTitle }}</span>
              <n-tag size="small" round :type="statusTagType(r.status)">{{ statusLabel(r.status) }}</n-tag>
              <span v-if="(r.attemptNumber ?? 0) > 0" class="text-xs text-neutral-400">第 {{ r.attemptNumber }} 次</span>
            </div>
            <div class="text-xs text-neutral-400 mt-1">
              {{ formatTime(r.submittedAt || r.startTime) }}
            </div>
          </div>
          <div class="text-lg font-bold text-primary-600">{{ r.totalScore }} 分</div>
          <n-icon :size="16" class="text-neutral-300"><ChevronForwardOutline /></n-icon>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronForwardOutline } from '@vicons/ionicons5'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getMyExamSessions } from '@/api/exam'
import type { MyExamSession } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const records = ref<MyExamSession[]>([])
const loading = ref(false)
const totalCount = ref(0)
const filter = ref<'ALL' | 'GRADED' | 'GRADING' | 'UNFINISHED'>('ALL')

const FILTERS = [
  { key: 'ALL', label: '全部' },
  { key: 'GRADED', label: '已批改' },
  { key: 'GRADING', label: '批改中' },
  { key: 'UNFINISHED', label: '未完成' }
] as const

/** 终态会话才计入（进行中/未开始的会话不属于「记录」） */
function isTerminal(status: string): boolean {
  return status !== 'IN_PROGRESS'
}

const gradedCount = computed(
  () => records.value.filter((r) => r.status === 'GRADED' || r.status === 'COMPLETED').length
)

const avgScore = computed(() => {
  const graded = records.value.filter(
    (r) => (r.status === 'GRADED' || r.status === 'COMPLETED') && r.totalScore != null
  )
  if (graded.length === 0) return null
  const sum = graded.reduce((acc, r) => acc + (r.totalScore || 0), 0)
  return (sum / graded.length).toFixed(1)
})

const filtered = computed(() => {
  switch (filter.value) {
    case 'GRADED':
      return records.value.filter((r) => r.status === 'GRADED' || r.status === 'COMPLETED')
    case 'GRADING':
      return records.value.filter((r) => r.status === 'SUBMITTED' || r.status === 'GRADING')
    case 'UNFINISHED':
      return records.value.filter(
        (r) => r.status === 'EXPIRED' || r.status === 'ABANDONED' || r.status === 'CHEAT_SUBMITTED'
      )
    default:
      return records.value
  }
})

const STATUS_TAG: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  GRADED: 'success',
  COMPLETED: 'success',
  AUTO_SUBMITTED: 'info',
  SUBMITTED: 'warning',
  GRADING: 'warning',
  EXPIRED: 'error',
  ABANDONED: 'error',
  CHEAT_SUBMITTED: 'error'
}
const STATUS_LABEL: Record<string, string> = {
  GRADED: '已批改',
  COMPLETED: '已完成',
  AUTO_SUBMITTED: '到时自动交卷',
  SUBMITTED: '批改中',
  GRADING: '批改中',
  EXPIRED: '已超时',
  ABANDONED: '已放弃',
  CHEAT_SUBMITTED: '作弊提交'
}

function statusLabel(status: string) {
  return STATUS_LABEL[status] || status
}
function statusTagType(status: string) {
  return STATUS_TAG[status] || 'default'
}
function formatTime(time?: string | null) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getMyExamSessions({ page: 1, size: 100 })
    // 仅终态会话算「记录」
    records.value = (res.data.records || []).filter((r) => isTerminal(r.status))
    totalCount.value = records.value.length
  } finally {
    loading.value = false
  }
})
</script>
