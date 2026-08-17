<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">做题记录</h1>

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
        v-model:value="filterSourceType"
        :options="sourceTypeOptions"
        placeholder="按来源筛选"
        style="width: 130px"
        clearable
        @update:value="handleSearch"
      />
      <n-date-picker
        v-model:value="dateRange"
        type="daterange"
        placeholder="选择时间范围"
        clearable
        style="width: 240px"
        @update:value="handleSearch"
      />
    </div>

    <n-data-table
      :columns="columns"
      :data="recordList"
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
import { getRecordList } from '@/api/record'
import { getBankList } from '@/api/bank'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const filterBankId = ref<number | null>(null)
const filterSourceType = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)
const recordList = ref<any[]>([])
const bankOptions = ref<{ label: string; value: number }[]>([])

const sourceTypeOptions = [
  { label: '练习', value: 'PRACTICE_SESSION' },
  { label: '考试', value: 'EXAM' }
]

/** 从 questionSnapshot JSON 中提取内容 */
function parseContent(row: any): string {
  if (!row.questionSnapshot) return ''
  try {
    const snapshot = JSON.parse(row.questionSnapshot)
    return snapshot.content?.replace(/<[^>]+>/g, '').substring(0, 80) || ''
  } catch {
    return ''
  }
}

function handleViewOriginal(row: any) {
  const bankId = row.bankId
  const questionId = row.questionId
  if (bankId && questionId) {
    router.push(`/banks/${bankId}/questions/${questionId}`)
  }
}

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
      const text = parseContent(row)
      return h('a', {
        class: 'text-primary cursor-pointer hover:underline truncate block max-w-xs',
        onClick: () => handleViewOriginal(row)
      }, text)
    }
  },
  { title: '你的答案', key: 'userAnswer', width: 120, ellipsis: { tooltip: true } },
  {
    title: '是否正确',
    key: 'isCorrect',
    width: 80,
    align: 'center',
    render(row) {
      return row.isCorrect === true
        ? h('span', { class: 'text-success' }, '正确')
        : row.isCorrect === false
          ? h('span', { class: 'text-error' }, '错误')
          : '-'
    }
  },
  {
    title: '来源',
    key: 'sourceType',
    width: 80,
    align: 'center',
    render(row) {
      return row.sourceType === 'PRACTICE_SESSION' ? '练习' : row.sourceType === 'EXAM' ? '考试' : row.sourceType
    }
  },
  {
    title: '时间',
    key: 'createdAt',
    width: 160,
    render(row) { return dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getRecordList({
      page: pagination.page,
      size: pagination.pageSize,
      bankId: filterBankId.value ?? undefined,
      type: filterSourceType.value || undefined,
      startDate: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endDate: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })
    recordList.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch {
    message.error('加载做题记录失败')
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const res = await getBankList({ page: 1, size: 200 })
    bankOptions.value = (res.data.records || []).map((b: any) => ({ label: b.name, value: b.id }))
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

onMounted(() => {
  loadOptions()
  fetchList()
})
</script>