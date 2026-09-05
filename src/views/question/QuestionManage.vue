<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="题目" subtitle="跨题库管理所有题目，支持按题型、难度、标签筛选">
      <template #actions>
        <n-button v-if="authStore.isAdmin" @click="showTagManage = true">标签管理</n-button>
        <n-button v-if="authStore.isAdmin" type="primary" disabled @click="handleCreateHint">
          创建题目
        </n-button>
      </template>
    </PageHeader>

    <!-- 筛选栏 -->
    <div class="bg-white border border-neutral-200 rounded-lg px-5 py-4 mb-5">
      <div class="flex flex-wrap items-center gap-3">
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
        <div class="flex items-center gap-2 ml-auto">
          <n-button
            v-if="authStore.isAuthenticated"
            :disabled="exporting"
            @click="handleExport"
          >
            {{ selectedIds.length > 0 ? `导出选中（${selectedIds.length}）` : '批量导出' }}
          </n-button>
          <n-button v-if="authStore.isAdmin" @click="showImportDialog = true">导入题目</n-button>
          <n-button type="primary" @click="handleSearch">搜索</n-button>
          <n-button @click="handleReset">重置</n-button>
        </div>
      </div>
    </div>

    <!-- 批量操作条 -->
    <div v-if="questionList.length > 0" class="flex items-center gap-2 mb-3 px-1">
      <n-checkbox :checked="allCurrentPageSelected" @update:checked="toggleSelectAll">全选本页</n-checkbox>
      <span class="text-xs text-neutral-400">已选 {{ selectedIds.length }} 题</span>
      <span v-if="selectedIds.length === 0" class="text-xs text-neutral-400">
        未勾选时「批量导出」将导出当前筛选条件下的全部题目
      </span>
      <span v-else class="text-xs text-primary-500">仅导出勾选的题目</span>
    </div>

    <!-- 题目卡片列表 -->
    <SkeletonList v-if="loading" :count="6" :cols="1" />
    <EmptyState
      v-else-if="questionList.length === 0"
      title="暂无题目"
      description="当前筛选条件下没有题目，试试调整筛选条件"
      :icon="DocumentTextOutline"
    />
    <div
      v-else
      class="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200"
    >
      <div
        v-for="(q, index) in questionList"
        :key="q.id"
        class="flex items-start gap-3 px-4 py-4 hover:bg-neutral-50 transition-colors"
      >
        <!-- 多选 -->
        <n-checkbox
          :checked="selectedIds.includes(q.id)"
          class="mt-1 flex-shrink-0"
          @update:checked="(v: boolean) => toggleSelect(q.id, v)"
        />
        <!-- 题号 -->
        <span class="text-sm font-mono text-neutral-400 w-10 flex-shrink-0 pt-0.5">
          #{{ String((pagination.page - 1) * pagination.pageSize + index + 1).padStart(3, '0') }}
        </span>

        <!-- 题干与元信息 -->
        <div class="flex-1 min-w-0">
          <div
            class="text-sm font-medium text-neutral-900 hover:text-primary-500 cursor-pointer"
            @click="router.push(`/banks/${q.bankId}/questions/${q.id}`)"
          >
            <RichText :content="q.content" class="question-stem-ellipsis" />
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
            <n-tag size="small" round :type="typeTagType(q.type)">{{ typeLabel(q.type) }}</n-tag>
            <n-tag size="small" round :type="difficultyTagType(q.difficulty)">
              {{ difficultyLabel(q.difficulty) }}
            </n-tag>
            <n-tag size="small" round :type="statusTagType(q.status)">{{ statusLabel(q.status) }}</n-tag>
            <span class="text-xs text-neutral-400">{{ q.bankName }}</span>
            <span v-for="tag in q.tags" :key="tag.id" class="tag-chip">{{ tag.name }}</span>
          </div>
        </div>

        <!-- 时间与操作 -->
        <div class="flex flex-col items-end gap-2 flex-shrink-0">
          <span class="text-xs text-neutral-400">{{ formatTime(q.createdAt) }}</span>
          <div class="flex items-center gap-1">
            <n-button
              size="tiny"
              quaternary
              type="primary"
              @click="router.push(`/banks/${q.bankId}/questions/${q.id}`)"
            >
              查看
            </n-button>
            <n-button
              v-if="authStore.isAdmin"
              size="tiny"
              quaternary
              @click="router.push(`/banks/${q.bankId}/questions/${q.id}/edit`)"
            >
              编辑
            </n-button>
            <n-button
              v-if="authStore.isAdmin"
              size="tiny"
              quaternary
              type="error"
              @click="handleDelete(q)"
            >
              删除
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.itemCount > 0" class="flex justify-end mt-4 items-center gap-4">
      <n-pagination
        :page="pagination.page"
        :item-count="pagination.itemCount"
        :page-size="pagination.pageSize"
        :page-sizes="pagination.pageSizes"
        show-size-picker
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
      <span class="text-sm text-neutral-400">共 {{ pagination.itemCount }} 道</span>
    </div>

    <!-- 导入题目弹窗（目标题库在弹窗内选择） -->
    <QuestionImportDialog v-model:show="showImportDialog" @imported="fetchList" />

    <!-- 标签管理（分组设置） -->
    <TagManageModal v-model:show="showTagManage" @updated="fetchTagOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import RichText from '@/components/common/RichText.vue'
import type { Question, QuestionType, Difficulty } from '@/types'
import { getAllQuestions, deleteQuestion } from '@/api/question'
import { getBankList } from '@/api/bank'
import { getTagList } from '@/api/tag'
import { buildGroupedTagOptions } from '@/utils/tagOptions'
import { exportQuestions } from '@/api/importExport'
import { triggerBlobDownload, nowStamp } from '@/utils/download'
import {
  QUESTION_TYPE_MAP,
  QUESTION_TYPE_OPTIONS,
  DIFFICULTY_MAP,
  DIFFICULTY_OPTIONS,
  QUESTION_STATUS_OPTIONS
} from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { DocumentTextOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'
import QuestionImportDialog from '@/components/importExport/QuestionImportDialog.vue'

const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()
const authStore = useAuthStore()

const loading = ref(false)
const questionList = ref<Question[]>([])
const bankOptions = ref<SelectOption[]>([])
const tagOptions = ref<SelectOption[]>([])
const showTagManage = ref(false)

/** 勾选（仅当前页范围） */
const selectedIds = ref<number[]>([])
const exporting = ref(false)
const showImportDialog = ref(false)
const allCurrentPageSelected = computed(() => {
  return questionList.value.length > 0 && questionList.value.every((q) => selectedIds.value.includes(q.id))
})

const filter = reactive({
  bankId: null as number | null,
  type: null as QuestionType | null,
  difficulty: null as Difficulty | null,
  status: null as string | null,
  tagIds: [] as number[],
  keyword: ''
})

// 选项统一取自 @/utils/constants（全站唯一字典）
const typeOptions = QUESTION_TYPE_OPTIONS
const difficultyOptions = DIFFICULTY_OPTIONS
const statusOptions = QUESTION_STATUS_OPTIONS

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100]
})

type TagColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const TYPE_TAG: Record<QuestionType, TagColor> = {
  SINGLE: 'info',
  MULTIPLE: 'warning',
  TRUE_FALSE: 'success',
  FILL_BLANK: 'default',
  SHORT_ANSWER: 'primary'
}

const DIFFICULTY_TAG: Record<Difficulty, TagColor> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'error'
}

const STATUS_TAG: Record<string, TagColor> = {
  DRAFT: 'default',
  PENDING_REVIEW: 'warning',
  PUBLISHED: 'success'
}

function typeLabel(type: QuestionType): string {
  return QUESTION_TYPE_MAP[type] || '-'
}

function typeTagType(type: QuestionType): TagColor {
  return TYPE_TAG[type] || 'default'
}

function difficultyLabel(difficulty: Difficulty): string {
  return DIFFICULTY_MAP[difficulty] || '-'
}

function difficultyTagType(difficulty: Difficulty): TagColor {
  return DIFFICULTY_TAG[difficulty] || 'default'
}

function statusLabel(status: string): string {
  return QUESTION_STATUS_OPTIONS.find((o) => o.value === status)?.label || status || '-'
}

function statusTagType(status: string): TagColor {
  return STATUS_TAG[status] || 'default'
}

function stripHtml(html: string | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '')
}

function formatTime(time: string | undefined) {
  return time ? dayjs(time).format('YYYY-MM-DD') : '-'
}

async function fetchBankOptions() {
  try {
    const res = await getBankList({ page: 1, size: 1000 })
    bankOptions.value = (res.data.records || []).map((b) => ({
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
    tagOptions.value = buildGroupedTagOptions(res.data || [])
  } catch {
    // 忽略错误
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.pageSize,
      bankId: filter.bankId ?? undefined,
      type: filter.type ?? undefined,
      difficulty: filter.difficulty ?? undefined,
      status: filter.status ?? undefined,
      tagIds: filter.tagIds.length ? filter.tagIds : undefined,
      keyword: filter.keyword || undefined
    }
    const res = await getAllQuestions(params)
    questionList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载题目列表失败')
  } finally {
    loading.value = false
  }
}

function handleCreateHint() {
  message.info('请先在题库详情页中创建题目')
}

function handleSearch() {
  pagination.page = 1
  selectedIds.value = []
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
  selectedIds.value = []
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
  selectedIds.value = []
  fetchList()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  selectedIds.value = []
  fetchList()
}

function toggleSelect(id: number, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter((sid) => sid !== id)
  }
}

function toggleSelectAll(checked: boolean) {
  const currentIds = questionList.value.map((q) => q.id)
  if (checked) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...currentIds]))
  } else {
    const remain = new Set(selectedIds.value.filter((id) => !currentIds.includes(id)))
    selectedIds.value = Array.from(remain)
  }
}

async function handleExport() {
  const noSelection = selectedIds.value.length === 0
  const noFilter =
    !filter.bankId && !filter.type && !filter.difficulty && !filter.status &&
    filter.tagIds.length === 0 && !filter.keyword
  if (noSelection && noFilter) {
    message.warning('请先勾选题目，或设置筛选条件（如选择题库）后再批量导出')
    return
  }
  exporting.value = true
  try {
    const blob =
      selectedIds.value.length > 0
        ? await exportQuestions({ questionIds: selectedIds.value })
        : await exportQuestions({
            bankId: filter.bankId ?? undefined,
            type: filter.type ?? undefined,
            difficulty: filter.difficulty ?? undefined,
            status: filter.status ?? undefined,
            tagIds: filter.tagIds.length ? filter.tagIds : undefined,
            keyword: filter.keyword || undefined
          })
    triggerBlobDownload(blob, `题目导出_${nowStamp()}.json`)
    message.success('导出成功')
  } catch (err: any) {
    message.error(err?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

function handleDelete(q: Question) {
  confirmDanger({
    title: '确认删除',
    content: `确定要删除该题目吗？题干：${stripHtml(q.content).slice(0, 30)}...`,
    positiveText: '确定删除',
    onPositiveClick: async () => {
      try {
        await deleteQuestion(q.bankId, q.id)
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

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tag-chip {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  background: var(--bg-selected);
  color: var(--text-brand);
}
/* 受限单行展示：题干（含公式）截断为一行 */
.question-stem-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.question-stem-ellipsis :deep(p) {
  margin: 0;
}
</style>
