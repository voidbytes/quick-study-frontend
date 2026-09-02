<template>
  <div>
    <!-- 筛选栏 -->
    <div class="flex gap-3 mb-4 flex-wrap items-center">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索题干..."
        clearable
        style="width: 200px"
        @keyup.enter="handleSearch"
      />
      <n-select
        v-model:value="filterType"
        :options="typeOptions"
        placeholder="题型"
        style="width: 120px"
        clearable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterDifficulty"
        :options="difficultyOptions"
        placeholder="难度"
        style="width: 100px"
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
      <n-select
        v-model:value="filterTagIds"
        :options="tagOptions"
        placeholder="标签（可多选）"
        multiple
        clearable
        style="width: 200px"
        @update:value="handleSearch"
      />
      <n-button v-if="authStore.isAdmin" type="primary" @click="router.push(`/banks/${bankId}/questions/create`)">
        创建题目
      </n-button>
      <n-button v-if="authStore.isAdmin" @click="handleBatchImport">批量导入</n-button>
      <n-button v-if="authStore.isAdmin" @click="handleDownloadTemplate">下载模板</n-button>
    </div>

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
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import type { DataTableColumn, SelectOption } from 'naive-ui'
import { getQuestionList, deleteQuestion, updateSort } from '@/api/question'
import { getTagList } from '@/api/tag'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const props = defineProps<{
  bankId: string
}>()

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref<string | null>(null)
const filterDifficulty = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const filterTagIds = ref<number[]>([])
const tagOptions = ref<SelectOption[]>([])
const questionList = ref<any[]>([])
const dragIndex = ref<number | null>(null)

// 与后端 QuestionType 枚举名保持一致
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

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

const typeLabels: Record<string, string> = {
  SINGLE: '单选题', MULTIPLE: '多选题', TRUE_FALSE: '判断题', FILL_BLANK: '填空题', SHORT_ANSWER: '简答题'
}
const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }
const difficultyColors: Record<string, string> = { EASY: 'success', MEDIUM: 'warning', HARD: 'error' }

const columns: DataTableColumn<any>[] = [
  {
    title: '排序',
    key: 'sortOrder',
    width: 60,
    align: 'center'
  },
  {
    title: '题干',
    key: 'content',
    ellipsis: { tooltip: true },
    render(row) {
      return h('span', { class: 'truncate block max-w-xs' }, row.content?.replace(/<[^>]+>/g, '').substring(0, 80) || '')
    }
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
      const map: Record<string, string> = { DRAFT: '草稿', PENDING_REVIEW: '待审核', PUBLISHED: '已发布' }
      return map[row.status] || row.status
    }
  },
  {
    title: '标签',
    key: 'tags',
    width: 160,
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
    width: 160,
    render(row) {
      const actions = [
        h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/banks/${props.bankId}/questions/${row.id}`) }, '查看')
      ]
      if (authStore.isAdmin) {
        actions.push(
          h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/banks/${props.bankId}/questions/${row.id}/edit`) }, '编辑'),
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
    const res = await getQuestionList(props.bankId, {
      page: pagination.page,
      size: pagination.pageSize,
      type: filterType.value ?? undefined,
      difficulty: filterDifficulty.value || undefined,
      status: filterStatus.value || undefined,
      tagIds: filterTagIds.value.length ? filterTagIds.value : undefined,
      keyword: searchKeyword.value || undefined
    })
    questionList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载题目列表失败')
  } finally {
    loading.value = false
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

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
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
        await deleteQuestion(props.bankId, row.id)
        message.success('删除成功')
        fetchList()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

function handleBatchImport() {
  message.info('批量导入功能')
}

function handleDownloadTemplate() {
  message.info('下载模板功能')
}

onMounted(() => {
  fetchTagOptions()
  fetchList()
})
</script>