<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">练习记录</h1>
      <n-button type="primary" @click="showCreateDialog = true">开始练习</n-button>
    </div>

    <!-- 筛选 -->
    <div class="flex gap-4 mb-4">
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="状态"
        style="width: 130px"
        clearable
        @update:value="handleSearch"
      />
    </div>

    <n-data-table
      :columns="columns"
      :data="sessionList"
      :loading="loading"
      :pagination="pagination"
      :bordered="true"
      @update:page="handlePageChange"
    />

    <PracticeCreateDialog v-model:show="showCreateDialog" @created="handleCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getPracticeSessions, abandonPractice, completePractice } from '@/api/practice'
import PracticeCreateDialog from './PracticeCreateDialog.vue'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const showCreateDialog = ref(false)
const filterStatus = ref<string | null>(null)
const sessionList = ref<any[]>([])

const statusOptions = [
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已过期', value: 'EXPIRED' }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const statusLabels: Record<string, string> = {
  IN_PROGRESS: '进行中', COMPLETED: '已完成', EXPIRED: '已过期', ABANDONED: '已放弃'
}
const statusColors: Record<string, string> = {
  IN_PROGRESS: 'info', COMPLETED: 'success', EXPIRED: 'default', ABANDONED: 'warning'
}

const columns: DataTableColumn<any>[] = [
  { title: '条件', key: 'conditions', ellipsis: { tooltip: true } },
  { title: '题目数', key: 'totalCount', width: 80, align: 'center' },
  {
    title: '正确率',
    key: 'accuracy',
    width: 80,
    align: 'center',
    render(row) {
      return row.accuracy != null ? (row.accuracy * 100).toFixed(1) + '%' : '-'
    }
  },
  { title: '耗时(秒)', key: 'duration', width: 80, align: 'center' },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row) {
      return h('n-tag', { size: 'small', type: statusColors[row.status] || 'default' as any }, () => statusLabels[row.status] || row.status)
    }
  },
  {
    title: '完成时间',
    key: 'completedAt',
    width: 160,
    render(row) { return row.completedAt ? dayjs(row.completedAt).format('YYYY-MM-DD HH:mm') : '-' }
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render(row) {
      const actions = []
      if (row.status === 'IN_PROGRESS') {
        actions.push(h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/practice/sessions/${row.sessionId}`) }, '继续'))
        actions.push(h('a', { class: 'text-error cursor-pointer ml-2', onClick: () => handleAbandon(row) }, '放弃'))
      } else if (row.status === 'COMPLETED') {
        actions.push(h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/practice/sessions/${row.sessionId}`) }, '查看详情'))
      }
      return h('div', {}, actions)
    }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getPracticeSessions({
      page: pagination.page,
      size: pagination.pageSize,
      status: filterStatus.value || undefined
    })
    sessionList.value = res.data.records || []
    pagination.total = res.data.total || 0
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

function handleAbandon(row: any) {
  dialog.warning({
    title: '放弃练习',
    content: '确定要放弃该练习吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await abandonPractice(row.id)
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