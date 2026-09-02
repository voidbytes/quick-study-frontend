<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold">题目管理</h2>
    </div>

    <!-- 筛选栏 -->
    <n-card class="mb-4" :bordered="true" size="small">
      <div class="flex gap-3 flex-wrap items-center">
        <n-select
          v-model:value="filter.bankId"
          :options="bankOptions"
          placeholder="所属题库"
          style="width: 180px"
          clearable
          @update:value="handleSearch"
        />
        <n-select
          v-model:value="filter.type"
          :options="typeOptions"
          placeholder="题型"
          style="width: 120px"
          clearable
          @update:value="handleSearch"
        />
        <n-select
          v-model:value="filter.difficulty"
          :options="difficultyOptions"
          placeholder="难度"
          style="width: 100px"
          clearable
          @update:value="handleSearch"
        />
        <n-select
          v-model:value="filter.status"
          :options="statusOptions"
          placeholder="状态"
          style="width: 100px"
          clearable
          @update:value="handleSearch"
        />
        <n-select
          v-model:value="filter.tagIds"
          :options="tagOptions"
          placeholder="标签（可多选）"
          multiple
          clearable
          style="width: 200px"
          @update:value="handleSearch"
        />
        <n-input
          v-model:value="filter.keyword"
          placeholder="搜索题干..."
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
      </div>
    </n-card>

    <!-- 题目表格 -->
    <n-data-table
      remote
      :columns="columns"
      :data="questionList"
      :loading="loading"
      :pagination="pagination"
      :bordered="true"
      :row-key="(row: any) => row.id"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import type { DataTableColumn, SelectOption } from 'naive-ui'
import { getAllQuestions, deleteQuestion } from '@/api/question'
import { getBankList } from '@/api/bank'
import { getTagList } from '@/api/tag'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const loading = ref(false)
const questionList = ref<any[]>([])
const bankOptions = ref<SelectOption[]>([])
const tagOptions = ref<SelectOption[]>([])

const filter = reactive({
  bankId: null as number | null,
  type: null as string | null,
  difficulty: null as string | null,
  status: null as string | null,
  tagIds: [] as number[],
  keyword: ''
})

const typeOptions = [
  { label: '单选题', value: 'SINGLE' },
  { label: '多选题', value: 'MULTIPLE' },
  { label: '判断题', value: 'TRUE_FALSE' },
  { label: '填空题', value: 'FILL_BLANK' },
  { label: '简答题', value: 'SHORT_ANSWER' }
]

const difficultyOptions = [
  { label: '简单', value: 'EASY' },
  { label: '中等', value: 'MEDIUM' },
  { label: '困难', value: 'HARD' }
]

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待审核', value: 'PENDING_REVIEW' },
  { label: '已发布', value: 'PUBLISHED' }
]

const typeLabels: Record<string, string> = {
  SINGLE: '单选题', MULTIPLE: '多选题', TRUE_FALSE: '判断题',
  FILL_BLANK: '填空题', SHORT_ANSWER: '简答题'
}
const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }
const difficultyColors: Record<string, string> = { EASY: 'success', MEDIUM: 'warning', HARD: 'error' }
const statusLabels: Record<string, string> = { DRAFT: '草稿', PENDING_REVIEW: '待审核', PUBLISHED: '已发布' }

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100],
  showSizePicker: true
})

const columns: DataTableColumn<any>[] = [
  {
    title: '题干',
    key: 'content',
    ellipsis: { tooltip: true },
    render(row) {
      return h('a', {
        class: 'text-primary cursor-pointer',
        onClick: () => router.push(`/banks/${row.bankId}/questions/${row.id}`)
      }, row.content?.replace(/<[^>]+>/g, '').substring(0, 80) || '')
    }
  },
  {
    title: '所属题库',
    key: 'bankName',
    width: 140,
    ellipsis: { tooltip: true }
  },
  {
    title: '题型',
    key: 'type',
    width: 80,
    align: 'center',
    render(row) { return typeLabels[row.type] || '-' }
  },
  {
    title: '难度',
    key: 'difficulty',
    width: 70,
    align: 'center',
    render(row) {
      return h('n-tag', { size: 'small', type: difficultyColors[row.difficulty] || 'default' as any }, () => difficultyLabels[row.difficulty] || '-')
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row) {
      return statusLabels[row.status] || row.status
    }
  },
  {
    title: '标签',
    key: 'tags',
    width: 150,
    ellipsis: { tooltip: true },
    render(row) {
      if (!row.tags || row.tags.length === 0) return '-'
      return row.tags.map((t: any) => t.name).join(', ')
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render(row) { return dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row) {
      const actions = [
        h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/banks/${row.bankId}/questions/${row.id}`) }, '查看')
      ]
      if (authStore.isAdmin) {
        actions.push(
          h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/banks/${row.bankId}/questions/${row.id}/edit`) }, '编辑'),
          h('a', { class: 'text-error cursor-pointer', onClick: () => handleDelete(row) }, '删除')
        )
      }
      return h('div', { class: 'flex gap-2' }, actions)
    }
  }
]

async function fetchBankOptions() {
  try {
    const res = await getBankList({ page: 1, size: 1000 })
    bankOptions.value = (res.data.records || []).map((b: any) => ({
      label: b.name,
      value: b.id
    }))
  } catch {
    // 忽略错误
  }
}

async function fetchTagOptions() {
  try {
    const res = await getTagList()
    tagOptions.value = (res.data || []).map((t: any) => ({
      label: t.name,
      value: t.id
    }))
  } catch {
    // 忽略错误
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.pageSize
    }
    if (filter.bankId) params.bankId = filter.bankId
    if (filter.type) params.type = filter.type
    if (filter.difficulty) params.difficulty = filter.difficulty
    if (filter.status) params.status = filter.status
    if (filter.tagIds.length) params.tagIds = filter.tagIds
    if (filter.keyword) params.keyword = filter.keyword

    const res = await getAllQuestions(params)
    questionList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载题目列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  filter.bankId = null
  filter.type = null
  filter.difficulty = null
  filter.status = null
  filter.tagIds = []
  filter.keyword = ''
  pagination.page = 1
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchList()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  fetchList()
}

function handleDelete(row: any) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除该题目吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteQuestion(row.bankId, row.id)
        message.success('删除成功')
        fetchList()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchBankOptions()
  fetchTagOptions()
  fetchList()
})
</script>