<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">错题本</h1>

    <div class="flex gap-4 mb-4 flex-wrap">
      <n-select
        v-model:value="filterBankId"
        :options="bankOptions"
        placeholder="按题库筛选"
        style="width: 200px"
        clearable
        filterable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterTagId"
        :options="tagOptions"
        placeholder="按标签筛选"
        style="width: 200px"
        clearable
        filterable
        @update:value="handleSearch"
      />
    </div>

    <n-data-table
      :columns="columns"
      :data="wrongList"
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
import { list as getWrongQuestionList, deleteWrongQuestion } from '@/api/wrongQuestion'
import { getBankList } from '@/api/bank'
import { getTagList } from '@/api/tag'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const filterBankId = ref<number | null>(null)
const filterTagId = ref<number | null>(null)
const wrongList = ref<any[]>([])
const bankOptions = ref<{ label: string; value: number }[]>([])
const tagOptions = ref<{ label: string; value: number }[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const columns: DataTableColumn<any>[] = [
  {
    title: '题目内容',
    key: 'content',
    ellipsis: { tooltip: true },
    render(row) {
      return h('span', { class: 'truncate block max-w-sm' }, row.content?.replace(/<[^>]+>/g, '').substring(0, 100) || '')
    }
  },
  {
    title: '题型',
    key: 'type',
    width: 70,
    align: 'center',
    render(row) {
      const labels: Record<number, string> = { 0: '单选', 1: '多选', 2: '判断', 3: '填空', 4: '简答' }
      return labels[row.type] || '-'
    }
  },
  { title: '错误次数', key: 'wrongCount', width: 80, align: 'center' },
  {
    title: '最近做错',
    key: 'lastWrongAt',
    width: 160,
    render(row) { return row.lastWrongAt ? dayjs(row.lastWrongAt).format('YYYY-MM-DD HH:mm') : '-' }
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render(row) {
      const actions = []
      if (row.type === 0 || row.type === 1 || row.type === 2) {
        actions.push(h('a', { class: 'text-primary cursor-pointer', onClick: () => handleRedo(row) }, '错题重做'))
      }
      actions.push(h('a', { class: 'text-error cursor-pointer ml-2', onClick: () => handleRemove(row) }, '移除'))
      return h('div', {}, actions)
    }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getWrongQuestionList({
      page: pagination.page,
      size: pagination.pageSize,
      bankId: filterBankId.value ?? undefined,
      tagId: filterTagId.value ?? undefined
    })
    wrongList.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch {
    message.error('加载错题失败')
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const [bankRes, tagRes] = await Promise.all([
      getBankList({ page: 1, size: 200 }),
      getTagList()
    ])
    bankOptions.value = (bankRes.data.records || []).map((b: any) => ({ label: b.name, value: b.id }))
    tagOptions.value = (tagRes.data || []).map((t: any) => ({ label: t.name, value: t.id }))
  } catch {
    // ignore
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

function handleRedo(row: any) {
  message.info('错题重做功能')
}

function handleRemove(row: any) {
  dialog.warning({
    title: '移除错题',
    content: '确定要移除该错题吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteWrongQuestion(row.id)
        message.success('已移除')
        fetchList()
      } catch {
        message.error('移除失败')
      }
    }
  })
}

onMounted(() => {
  loadOptions()
  fetchList()
})
</script>