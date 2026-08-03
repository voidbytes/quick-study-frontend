<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">题库管理</h1>
      <n-button v-if="authStore.isAdmin" type="primary" @click="showCreateDialog = true">
        创建题库
      </n-button>
    </div>

    <!-- 搜索与筛选 -->
    <div class="flex gap-4 mb-4 flex-wrap">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索题库名称..."
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      />
      <n-select
        v-model:value="filterVisibility"
        :options="visibilityOptions"
        style="width: 140px"
        clearable
        @update:value="handleSearch"
      />
    </div>

    <!-- 题库列表 -->
    <n-data-table
      :columns="columns"
      :data="bankList"
      :loading="loading"
      :pagination="pagination"
      :bordered="true"
      @update:page="handlePageChange"
    />

    <!-- 创建题库弹窗 -->
    <BankCreateDialog
      v-model:show="showCreateDialog"
      @created="handleBankCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getBankList, deleteBank, toggleVisibility } from '@/api/bank'
import { useAuthStore } from '@/stores/auth'
import BankCreateDialog from './BankCreateDialog.vue'
import dayjs from 'dayjs'

interface BankItem {
  id: number
  name: string
  description: string
  questionCount: number
  practiceCount: number
  creatorName: string
  isPublic: boolean
  isOfficial: boolean
  tags: string[]
  createdAt: string
}

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const loading = ref(false)
const showCreateDialog = ref(false)
const searchKeyword = ref('')
const filterVisibility = ref<number | null>(null)

const visibilityOptions = [
  { label: '公开', value: 1 },
  { label: '私有', value: 0 },
  { label: '官方', value: 2 }
]

const bankList = ref<BankItem[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  showSizePicker: false,
  pageSizes: [10, 20, 50]
})

const columns: DataTableColumn<BankItem>[] = [
  { title: '名称', key: 'name', width: 180, ellipsis: { tooltip: true } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '题目数', key: 'questionCount', width: 80, align: 'center' },
  { title: '练习次数', key: 'practiceCount', width: 90, align: 'center' },
  { title: '创建者', key: 'creatorName', width: 120 },
  {
    title: '状态',
    key: 'isPublic',
    width: 80,
    align: 'center',
    render(row) {
      if (row.isOfficial) {
        return h('span', { class: 'text-orange-500' }, '官方')
      }
      return row.isPublic
        ? h('span', { class: 'text-green-500' }, '公开')
        : h('span', { class: 'text-gray-500' }, '私有')
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      const actions = [
        h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/banks/${row.id}`) }, '详情')
      ]
      if (authStore.isAdmin) {
        actions.push(
          h('a', { class: 'text-primary cursor-pointer', onClick: () => handleToggleVisibility(row) }, row.isPublic ? '设为私有' : '设为公开'),
          h('a', { class: 'text-error cursor-pointer', onClick: () => handleDelete(row) }, '删除')
        )
      }
      return h('div', { class: 'flex gap-2' }, actions)
    }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getBankList({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      isPublic: filterVisibility.value === 1 ? true : (filterVisibility.value === 0 ? false : undefined),
      isOfficial: filterVisibility.value === 2 ? true : undefined
    })
    bankList.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch {
    message.error('加载题库列表失败')
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

function handleBankCreated() {
  showCreateDialog.value = false
  fetchList()
}

async function handleToggleVisibility(row: BankItem) {
  try {
    await toggleVisibility(row.id, !row.isPublic)
    message.success('操作成功')
    fetchList()
  } catch {
    message.error('操作失败')
  }
}

function handleDelete(row: BankItem) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除题库「${row.name}」吗？该操作不可撤销。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteBank(row.id)
        message.success('删除成功')
        fetchList()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>