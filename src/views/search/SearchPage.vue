<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">搜索</h1>

    <div class="flex gap-4 mb-6">
      <n-input
        v-model:value="keyword"
        placeholder="搜索题库、题目、试卷..."
        clearable
        size="large"
        style="width: 400px"
        @keyup.enter="handleSearch"
      />
      <n-select
        v-model:value="filterType"
        :options="typeOptions"
        placeholder="类型"
        style="width: 120px"
        @update:value="handleSearch"
      />
      <n-button type="primary" @click="handleSearch">搜索</n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="searchResults"
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
import { search } from '@/api/search'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()

const keyword = ref('')
const filterType = ref<string | null>(null)
const loading = ref(false)
const searchResults = ref<any[]>([])

const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '题库', value: 'bank' },
  { label: '题目', value: 'question' },
  { label: '试卷', value: 'paper' }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const typeLabels: Record<string, string> = { bank: '题库', question: '题目', paper: '试卷' }

const columns: DataTableColumn<any>[] = [
  {
    title: '类型',
    key: 'type',
    width: 70,
    align: 'center',
    render(row) {
      return h('n-tag', { size: 'small', type: row.type === 'bank' ? 'info' : row.type === 'question' ? 'success' : 'warning' as any }, () => typeLabels[row.type] || row.type)
    }
  },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render(row) {
      const path = row.type === 'bank' ? `/banks/${row.id}` : row.type === 'paper' ? `/papers/${row.id}` : ''
      return path ? h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(path) }, '查看') : null
    }
  }
]

async function handleSearch() {
  if (!keyword.value.trim()) {
    message.warning('请输入搜索关键词')
    return
  }
  loading.value = true
  pagination.page = 1
  try {
    const res = await search({
      keyword: keyword.value,
      type: filterType.value === 'all' ? undefined : (filterType.value as any),
      page: pagination.page,
      size: pagination.pageSize
    })
    searchResults.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch {
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  handleSearch()
}

onMounted(() => {
  // 从 URL 参数中读取 keyword
  const params = new URLSearchParams(window.location.search)
  const q = params.get('q')
  if (q) {
    keyword.value = q
    handleSearch()
  }
})
</script>