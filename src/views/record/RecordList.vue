<template>
  <div class="max-w-content mx-auto w-full">
    <PageHeader title="做题记录" :subtitle="pagination.itemCount ? `共 ${pagination.itemCount} 条记录` : undefined" />

    <!-- 筛选 -->
    <FilterBar>
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
        style="width: 140px"
        clearable
        @update:value="handleSearch"
      />
      <n-date-picker
        v-model:value="dateRange"
        type="daterange"
        placeholder="选择时间范围"
        clearable
        style="width: 260px"
        @update:value="handleSearch"
      />
    </FilterBar>

    <!-- 加载骨架 -->
    <SkeletonList v-if="loading && recordList.length === 0" :count="3" :cols="1" />

    <!-- 列表 -->
    <template v-else-if="recordList.length > 0">
      <div class="flex flex-col gap-3">
        <div
          v-for="row in recordList"
          :key="row.id"
          class="bg-white border border-neutral-200 rounded-lg px-5 py-4 flex items-center gap-4 transition-all hover:border-primary-300 hover:shadow-sm"
        >
          <!-- 对错图标 -->
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="resultClass(row.isCorrect)"
          >
            <n-icon :size="20" :color="resultColor(row.isCorrect)">
              <CheckmarkDoneOutline v-if="row.isCorrect === true" />
              <CloseCircleOutline v-else-if="row.isCorrect === false" />
              <RemoveOutline v-else />
            </n-icon>
          </div>

          <!-- 题目信息 -->
          <div class="flex-1 min-w-0 cursor-pointer" @click="handleViewOriginal(row)">
            <div class="text-neutral-900 font-medium truncate leading-relaxed">
              {{ row.plainContent || '（内容已缺失）' }}
            </div>
            <div class="mt-1 flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
              <span v-if="row.bankName" class="inline-flex items-center gap-1">
                <n-icon :size="14"><LibraryOutline /></n-icon>
                {{ row.bankName }}
              </span>
              <span class="inline-flex items-center gap-1">
                <n-icon :size="14"><TimeOutline /></n-icon>
                {{ formatTime(row.createdAt) }}
              </span>
            </div>
          </div>

          <!-- 结果与来源 -->
          <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              class="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
              :class="resultChipClass(row.isCorrect)"
            >
              {{ resultLabel(row.isCorrect) }}
            </span>
            <span class="text-xs text-neutral-400 whitespace-nowrap">来源：{{ sourceLabel(row.sourceType) }}</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.itemCount > pagination.pageSize" class="flex justify-end mt-5">
        <n-pagination
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.itemCount"
          @update:page="handlePageChange"
        />
      </div>
    </template>

    <!-- 空态 -->
    <div v-else class="bg-white border border-neutral-200 rounded-lg">
      <EmptyState
        title="暂无做题记录"
        description="完成练习或考试后，你的作答记录会展示在这里"
        :icon="DocumentTextOutline"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  CheckmarkDoneOutline,
  CloseCircleOutline,
  RemoveOutline,
  DocumentTextOutline,
  LibraryOutline,
  TimeOutline
} from '@vicons/ionicons5'
import { getRecordList } from '@/api/record'
import { getBankList } from '@/api/bank'
import type { PracticeRecord } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const filterBankId = ref<number | null>(null)
const filterSourceType = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)
const recordList = ref<RecordRow[]>([])
const bankOptions = ref<{ label: string; value: number }[]>([])

const sourceTypeOptions = [
  { label: '练习', value: 'PRACTICE_SESSION' },
  { label: '考试', value: 'EXAM' }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

const SOURCE_LABELS: Record<string, string> = {
  PRACTICE_SESSION: '练习',
  EXAM: '考试'
}

/** 列表展示行：在 PracticeRecord 基础上展开快照纯文本题干 */
interface RecordRow extends PracticeRecord {
  plainContent: string
}

function stripHtml(html?: string | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toRow(record: PracticeRecord): RecordRow {
  let content: string | null = null
  if (record.questionSnapshot) {
    try {
      const obj: unknown = JSON.parse(record.questionSnapshot)
      if (obj && typeof obj === 'object') {
        const raw = obj as Record<string, unknown>
        content = typeof raw.content === 'string' ? raw.content : null
      }
    } catch {
      // 忽略解析失败
    }
  }
  return {
    ...record,
    plainContent: stripHtml(content)
  }
}

function resultLabel(isCorrect: boolean | null): string {
  if (isCorrect === true) return '回答正确'
  if (isCorrect === false) return '回答错误'
  return '待判定'
}

function resultClass(isCorrect: boolean | null): string {
  if (isCorrect === true) return 'bg-success-50'
  if (isCorrect === false) return 'bg-error-50'
  return 'bg-neutral-100'
}

function resultColor(isCorrect: boolean | null): string {
  if (isCorrect === true) return 'var(--color-success-500)'
  if (isCorrect === false) return 'var(--color-error-500)'
  return 'var(--color-neutral-400)'
}

function resultChipClass(isCorrect: boolean | null): string {
  if (isCorrect === true) return 'bg-success-50 text-success-600'
  if (isCorrect === false) return 'bg-error-50 text-error-600'
  return 'bg-neutral-100 text-neutral-500'
}

function sourceLabel(sourceType?: string): string {
  return sourceType ? SOURCE_LABELS[sourceType] || sourceType : '-'
}

function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

function handleViewOriginal(row: RecordRow) {
  if (row.bankId && row.questionId) {
    router.push(`/banks/${row.bankId}/questions/${row.questionId}`)
  } else {
    message.warning('无法跳转原题')
  }
}

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
    recordList.value = (res.data.records || []).map(toRow)
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载做题记录失败')
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const res = await getBankList({ page: 1, size: 200 })
    bankOptions.value = (res.data.records || []).map((b) => ({ label: b.name, value: b.id }))
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
