<template>
  <div>
    <PageHeader title="操作日志" subtitle="重要管理操作审计（只读，仅超级管理员）" />

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <n-input
        v-model:value="filterAction"
        placeholder="操作类型，如 AI_CONFIG_UPDATE"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      />
      <n-input
        v-model:value="filterTargetType"
        placeholder="目标类型，如 USER"
        clearable
        style="width: 180px"
        @keyup.enter="handleSearch"
      />
      <n-input
        v-model:value="filterOperatorId"
        placeholder="操作人 ID"
        clearable
        style="width: 160px"
        @keyup.enter="handleSearch"
      />
      <n-date-picker v-model:value="range" type="datetimerange" clearable style="width: 360px" />
      <n-button type="primary" @click="handleSearch">查询</n-button>
      <n-button @click="handleReset">重置</n-button>
    </div>

    <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <n-data-table
        remote
        :columns="columns"
        :data="logs"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        @update:page="handlePageChange"
      />
    </div>

    <n-modal v-model:show="detailModal" title="变更详情" preset="card" style="width: 640px">
      <pre class="text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-4 overflow-auto max-h-96 whitespace-pre-wrap font-mono">{{ detailContent }}</pre>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useMessage, NTag } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import dayjs from 'dayjs'
import { getOperationLogs, type OperationLogItem } from '@/api/operationLog'

const message = useMessage()

const loading = ref(false)
const logs = ref<OperationLogItem[]>([])
const pagination = reactive({ page: 1, pageSize: 20, itemCount: 0 })

const filterAction = ref('')
const filterTargetType = ref('')
const filterOperatorId = ref('')
const range = ref<[number, number] | null>(null)

const detailModal = ref(false)
const detailContent = ref('')

const ROLE_TAG: Record<string, 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'> = {
  USER: 'primary',
  ADMIN: 'error',
  SUPER_ADMIN: 'warning'
}
const ROLE_LABELS: Record<string, string> = {
  USER: '用户',
  ADMIN: '管理员',
  SUPER_ADMIN: '超管'
}

const columns: DataTableColumn<any>[] = [
  {
    title: '时间',
    key: 'createdAt',
    width: 160,
    render: row => dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss')
  },
  {
    title: '操作人',
    key: 'operatorName',
    width: 170,
    render: row =>
      h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-sm' }, row.operatorName),
        h(NTag, { size: 'tiny', bordered: false, type: ROLE_TAG[row.operatorRole] || 'default' },
          { default: () => ROLE_LABELS[row.operatorRole] || row.operatorRole })
      ])
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    render: row =>
      h(NTag, { size: 'small', bordered: false, type: row.success ? 'info' : 'error' },
        { default: () => row.action })
  },
  {
    title: '目标',
    key: 'targetType',
    width: 200,
    ellipsis: { tooltip: true },
    render: row => h('span', { class: 'text-xs' }, `${row.targetType}${row.targetId ? `#${row.targetId}` : ''}`)
  },
  {
    title: '结果',
    key: 'success',
    width: 80,
    align: 'center',
    render: row =>
      h(NTag, { size: 'small', bordered: false, type: row.success ? 'success' : 'error' },
        { default: () => (row.success ? '成功' : '失败') })
  },
  {
    title: '耗时',
    key: 'costMs',
    width: 90,
    align: 'center',
    render: row => (row.costMs != null ? `${row.costMs}ms` : '—')
  },
  {
    title: 'requestId',
    key: 'requestId',
    width: 150,
    ellipsis: { tooltip: true },
    render: row => h('span', { class: 'font-mono text-xs text-neutral-500' }, row.requestId || '—')
  },
  {
    title: '详情',
    key: 'detail',
    width: 80,
    render: row =>
      row.detail
        ? h('a', { class: 'text-primary-500 cursor-pointer', onClick: () => showDetail(row) }, '查看')
        : h('span', { class: 'text-neutral-300' }, '—')
  }
]

function showDetail(row: OperationLogItem) {
  try {
    detailContent.value = JSON.stringify(JSON.parse(row.detail || ''), null, 2)
  } catch {
    detailContent.value = row.detail || ''
  }
  detailModal.value = true
}

async function fetchLogs() {
  loading.value = true
  try {
    const res = await getOperationLogs({
      page: pagination.page,
      size: pagination.pageSize,
      action: filterAction.value.trim() || undefined,
      targetType: filterTargetType.value.trim() || undefined,
      operatorId: filterOperatorId.value.trim() || undefined,
      startTime: range.value ? dayjs(range.value[0]).toISOString() : undefined,
      endTime: range.value ? dayjs(range.value[1]).toISOString() : undefined
    })
    logs.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch (err: any) {
    if (err?.response?.status !== 403 && err?.response?.status < 500) {
      message.error('加载操作日志失败')
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchLogs()
}

function handleReset() {
  filterAction.value = ''
  filterTargetType.value = ''
  filterOperatorId.value = ''
  range.value = null
  handleSearch()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchLogs()
}

onMounted(fetchLogs)
</script>
