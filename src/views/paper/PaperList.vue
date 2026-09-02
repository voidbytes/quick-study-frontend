<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">试卷管理</h1>
      <n-button v-if="authStore.isAdmin" type="primary" @click="router.push('/papers/create')">
        创建试卷
      </n-button>
    </div>

    <!-- 搜索与筛选 -->
    <div class="flex gap-4 mb-4 flex-wrap">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索试卷标题..."
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      />
      <n-select
        v-model:value="filterShareType"
        :options="shareTypeOptions"
        placeholder="分享类型"
        style="width: 130px"
        clearable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="状态"
        style="width: 100px"
        clearable
        @update:value="handleSearch"
      />
    </div>

    <n-data-table
      remote
      :columns="columns"
      :data="paperList"
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
import { useMessage, useDialog } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getPaperList, deletePaper, publishPaper } from '@/api/paper'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterShareType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const paperList = ref<any[]>([])

const shareTypeOptions = [
  { label: '私有', value: 'PRIVATE' },
  { label: '链接', value: 'LINK' },
  { label: '密码', value: 'PASSWORD' },
  { label: '公开', value: 'PUBLIC' }
]

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

const shareTypeLabels: Record<string, string> = {
  PRIVATE: '私有', LINK: '链接', PASSWORD: '密码', PUBLIC: '公开'
}

const columns: DataTableColumn<any>[] = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '发布者', key: 'creatorName', width: 100, align: 'center', ellipsis: { tooltip: true } },
  { title: '题目数', key: 'questionCount', width: 80, align: 'center' },
  { title: '总分', key: 'totalScore', width: 70, align: 'center' },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row) {
      return row.status === 'PUBLISHED'
        ? h('span', { class: 'text-green-500' }, '已发布')
        : h('span', { class: 'text-gray-500' }, '草稿')
    }
  },
  {
    title: '分享类型',
    key: 'shareType',
    width: 80,
    align: 'center',
    render(row) { return shareTypeLabels[row.shareType] || row.shareType }
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
    width: 200,
    render(row) {
      const actions = [
        h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/papers/${row.id}`) }, '详情')
      ]
      // 已发布的试卷，所有登录用户可作答
      if (row.status === 'PUBLISHED' && authStore.isAuthenticated) {
        actions.push(
          h('a', { class: 'text-success cursor-pointer', onClick: () => router.push(`/papers/${row.id}/exam`) }, '开始考试')
        )
      }
      if (authStore.isAdmin) {
        actions.push(
          h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/papers/${row.id}/edit`) }, '编辑')
        )
        if (row.status !== 'PUBLISHED') {
          actions.push(h('a', { class: 'text-success cursor-pointer', onClick: () => handlePublish(row) }, '发布'))
        }
        actions.push(h('a', { class: 'text-error cursor-pointer', onClick: () => handleDelete(row) }, '删除'))
      }
      return h('div', { class: 'flex gap-2' }, actions)
    }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getPaperList({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      shareType: filterShareType.value || undefined,
      status: filterStatus.value || undefined
    })
    paperList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载试卷列表失败')
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

async function handlePublish(row: any) {
  try {
    await publishPaper(row.id)
    message.success('发布成功')
    fetchList()
  } catch {
    message.error('发布失败')
  }
}

function handleDelete(row: any) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除试卷「${row.title}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deletePaper(row.id)
        message.success('删除成功')
        fetchList()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => { fetchList() })
</script>