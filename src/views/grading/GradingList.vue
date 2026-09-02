<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">待批改列表</h1>

    <n-data-table
      remote
      :columns="columns"
      :data="pendingList"
      :loading="loading"
      :pagination="pagination"
      :bordered="true"
      @update:page="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getGradingPending } from '@/api/grading'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const pendingList = ref<any[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

const columns: DataTableColumn<any>[] = [
  { title: '试卷标题', key: 'paperTitle', ellipsis: { tooltip: true } },
  { title: '作答者', key: 'userNickname', width: 120 },
  {
    title: '提交时间',
    key: 'submittedAt',
    width: 160,
    render(row) { return dayjs(row.submittedAt).format('YYYY-MM-DD HH:mm') }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row) {
      return h('a', {
        class: 'text-primary cursor-pointer',
        onClick: () => router.push(`/grading/${row.sessionId}`)
      }, '批改')
    }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getGradingPending({
      page: pagination.page,
      size: pagination.pageSize
    })
    pendingList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载待批改列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchList()
}

onMounted(() => { fetchList() })
</script>