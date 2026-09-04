<template>
  <div>
    <!-- 筛选栏 -->
    <FilterBar>
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索题干..."
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
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
      <div class="ml-auto flex items-center gap-2">
        <n-button
          v-if="authStore.isAuthenticated && questionList.length > 0"
          :disabled="exporting"
          @click="handleExport"
        >
          {{ selectedIds.length > 0 ? `导出选中（${selectedIds.length}）` : '导出题目' }}
        </n-button>
        <n-button v-if="authStore.isAdmin" @click="showImportDialog = true">导入题目</n-button>
        <n-button v-if="authStore.isAdmin" type="primary" @click="router.push(`/banks/${bankId}/questions/create`)">
          创建题目
        </n-button>
      </div>
    </FilterBar>

    <!-- 批量操作条 -->
    <div v-if="questionList.length > 0" class="flex items-center gap-2 mb-3 px-1">
      <n-checkbox :checked="allCurrentPageSelected" @update:checked="toggleSelectAll">全选本页</n-checkbox>
      <span class="text-xs text-neutral-400">已选 {{ selectedIds.length }} 题</span>
      <span v-if="selectedIds.length === 0" class="text-xs text-neutral-400">
        未勾选时「导出题目」将导出当前筛选条件下的全部题目
      </span>
      <span v-else class="text-xs text-primary-500">仅导出勾选的题目</span>
    </div>

    <!-- 题目卡片列表 -->
    <SkeletonList v-if="loading" :count="5" :cols="1" />
    <EmptyState
      v-else-if="questionList.length === 0"
      title="暂无题目"
      description="当前筛选条件下没有题目"
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
          <div class="text-sm font-medium text-neutral-900">
            <RichText :content="q.content" class="question-stem-ellipsis" />
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
            <n-tag size="small" round :type="typeTagType(q.type)">{{ typeLabel(q.type) }}</n-tag>
            <n-tag size="small" round :type="difficultyTagType(q.difficulty)">
              {{ difficultyLabel(q.difficulty) }}
            </n-tag>
            <n-tag size="small" round :type="statusTagType(q.status)">{{ statusLabel(q.status) }}</n-tag>
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
              @click="router.push(`/banks/${bankId}/questions/${q.id}`)"
            >
              查看
            </n-button>
            <n-button
              v-if="authStore.isAdmin"
              size="tiny"
              quaternary
              @click="router.push(`/banks/${bankId}/questions/${q.id}/edit`)"
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
    <div v-if="pagination.itemCount > pagination.pageSize" class="flex justify-end mt-4">
      <n-pagination
        :page="pagination.page"
        :item-count="pagination.itemCount"
        :page-size="pagination.pageSize"
        @update:page="handlePageChange"
      />
    </div>

    <!-- 导入题目弹窗（目标题库固定为当前题库） -->
    <QuestionImportDialog
      v-model:show="showImportDialog"
      :bank-id="bankId"
      :bank-name="bankName"
      @imported="handleImportDone"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import type { Question, QuestionType, Difficulty } from '@/types'
import { getQuestionList, deleteQuestion } from '@/api/question'
import { getTagList } from '@/api/tag'
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
import FilterBar from '@/components/common/FilterBar.vue'
import RichText from '@/components/common/RichText.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { SearchOutline, DocumentTextOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'
import QuestionImportDialog from '@/components/importExport/QuestionImportDialog.vue'

const props = defineProps<{
  bankId: string
  /** 所属题库名称（透传给导入弹窗展示，可选） */
  bankName?: string
}>()

const emit = defineEmits<{
  /** 导入题目成功后通知父级刷新题库统计 */
  imported: []
}>()

const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()
const authStore = useAuthStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref<QuestionType | null>(null)
const filterDifficulty = ref<Difficulty | null>(null)
const filterStatus = ref<string | null>(null)
const filterTagIds = ref<number[]>([])
const tagOptions = ref<SelectOption[]>([])
const questionList = ref<Question[]>([])

/** 勾选（仅当前页范围） */
const selectedIds = ref<number[]>([])
const exporting = ref(false)
const showImportDialog = ref(false)
const allCurrentPageSelected = computed(() => {
  return questionList.value.length > 0 && questionList.value.every((q) => selectedIds.value.includes(q.id))
})

// 选项统一取自 @/utils/constants（全站唯一字典）
const typeOptions = QUESTION_TYPE_OPTIONS
const difficultyOptions = DIFFICULTY_OPTIONS
const statusOptions = QUESTION_STATUS_OPTIONS

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
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
    tagOptions.value = (res.data || []).map((t) => ({
      label: t.name,
      value: t.id
    }))
  } catch {
    // 忽略错误
  }
}

function handleSearch() {
  pagination.page = 1
  selectedIds.value = []
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
  selectedIds.value = []
  fetchList()
}

function handleDelete(q: Question) {
  confirmDanger({
    title: '确认删除',
    content: `确定要删除该题目吗？题干：${stripHtml(q.content).slice(0, 30)}...`,
    positiveText: '确定删除',
    onPositiveClick: async () => {
      try {
        await deleteQuestion(props.bankId, q.id)
        message.success('删除成功')
        fetchList()
      } catch {
        message.error('删除失败')
      }
    }
  })
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
  exporting.value = true
  try {
    const blob =
      selectedIds.value.length > 0
        ? await exportQuestions({ questionIds: selectedIds.value })
        : await exportQuestions({
            bankId: props.bankId,
            type: filterType.value ?? undefined,
            difficulty: filterDifficulty.value || undefined,
            status: filterStatus.value || undefined,
            tagIds: filterTagIds.value.length ? filterTagIds.value : undefined,
            keyword: searchKeyword.value || undefined
          })
    triggerBlobDownload(blob, `题目导出_${nowStamp()}.json`)
    message.success('导出成功')
  } catch (err: any) {
    message.error(err?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

function handleImportDone() {
  fetchList()
  emit('imported')
}

onMounted(() => {
  fetchTagOptions()
  fetchList()
})
</script>

<style scoped>
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
.tag-chip {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  background: var(--bg-selected);
  color: var(--text-brand);
}
</style>
