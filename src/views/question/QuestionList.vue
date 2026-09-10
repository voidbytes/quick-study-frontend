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
        placeholder="标签（可多选，支持搜索）"
        multiple
        clearable
        filterable
        style="width: 220px"
        @update:value="handleSearch"
      />
      <div class="ml-auto flex items-center gap-2">
        <n-dropdown
          v-if="authStore.isAdmin && questionList.length > 0"
          trigger="click"
          :options="questionExportOptions"
          @select="handleQuestionExportSelect"
        >
          <n-button :disabled="exporting">
            {{ selectedIds.length > 0 ? `导出选中（${selectedIds.length}）` : '导出' }}
          </n-button>
        </n-dropdown>
        <n-button v-if="authStore.isAdmin" @click="showImportDialog = true">导入题目</n-button>
        <n-button v-if="authStore.isAdmin" type="primary" @click="router.push(`/banks/${bankId}/questions/create`)">
          创建题目
        </n-button>
      </div>
    </FilterBar>

    <!-- 批量操作条（登录用户可见：勾选是为导出服务，未登录不展示） -->
    <div v-if="authStore.isAuthenticated && questionList.length > 0" class="flex items-center gap-2 mb-3 px-1">
      <n-checkbox :checked="allCurrentPageSelected" @update:checked="toggleSelectAll">全选本页</n-checkbox>
      <span class="text-xs text-neutral-400">已选 {{ selectedIds.length }} 题</span>
      <span v-if="selectedIds.length === 0" class="text-xs text-neutral-400">
        未勾选时点「导出」可选择导出全部题目或当前筛选结果
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
        <!-- 多选（登录用户可见：勾选为导出服务，未登录不展示） -->
        <n-checkbox
          v-if="authStore.isAuthenticated"
          :checked="selectedIds.includes(q.id)"
          class="mt-1 flex-shrink-0"
          @update:checked="(v: boolean) => toggleSelect(q.id, v)"
        />
        <!-- 题号 -->
        <span class="text-sm font-mono text-neutral-400 w-10 flex-shrink-0 pt-0.5">
          #{{ String((pagination.page - 1) * pagination.pageSize + index + 1).padStart(3, '0') }}
        </span>

        <!-- 题干与元信息（题干可点进详情，与题目管理页一致） -->
        <div class="flex-1 min-w-0">
          <div
            class="text-sm font-medium text-neutral-900 hover:text-primary-500 cursor-pointer"
            @click="router.push(`/banks/${bankId}/questions/${q.id}`)"
          >
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import type { Question, QuestionType, Difficulty } from '@/types'
import { getQuestionList, deleteQuestion } from '@/api/question'
import { getTagListByBank } from '@/api/tag'
import { exportQuestions, type ExportQuestionsParams } from '@/api/importExport'
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
const route = useRoute()
const message = useMessage()
const { confirmDanger } = useConfirm()
const authStore = useAuthStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref<QuestionType | null>(null)
const filterDifficulty = ref<Difficulty | null>(null)
const filterStatus = ref<string | null>(null)
// 标签 id 是雪花 long（后端 Jackson 序列化为字符串），全链路用 string 承载，禁止 Number() 转换（超 2^53 丢精度）
const filterTagIds = ref<string[]>([])
const tagOptions = ref<SelectOption[]>([])
const questionList = ref<Question[]>([])

/** 勾选（仅当前页范围） */
const selectedIds = ref<string[]>([])
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
  SHORT_ANSWER: 'primary',
  PROGRAMMING: 'primary'
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
    // 只拉当前题库实际用到的标签（全局池太大且多数与本库无关）
    const res = await getTagListByBank(props.bankId)
    tagOptions.value = (res.data || []).map((t) => ({
      label: t.name,
      value: String(t.id) // 雪花 long 超 2^53，n-select 的 value 必须字符串承载
    }))
  } catch {
    // 忽略错误
  }
}

function handleSearch() {
  pagination.page = 1
  selectedIds.value = []
  syncStateToQuery()
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
  selectedIds.value = []
  syncStateToQuery()
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

function toggleSelect(id: string, checked: boolean) {
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

/**
 * 导出下拉项：勾选时仅「导出选中」；未勾选时区分「全部题目」与「当前筛选结果」，
 * 明确"能否全部导出"的语义，避免误导出空文件。
 */
const questionExportOptions = computed(() => {
  if (selectedIds.value.length > 0) {
    return [{ label: `导出选中 ${selectedIds.value.length} 题（JSON）`, key: 'selected' }]
  }
  return [
    { label: '导出全部题目（JSON）', key: 'all' },
    { label: '导出当前筛选结果（JSON）', key: 'filter' }
  ]
})

function buildExportParams(key: string): ExportQuestionsParams {
  const params: ExportQuestionsParams = { bankId: props.bankId }
  if (key === 'filter') {
    params.type = filterType.value ?? undefined
    params.difficulty = filterDifficulty.value || undefined
    params.status = filterStatus.value || undefined
    params.tagIds = filterTagIds.value.length ? filterTagIds.value : undefined
    params.keyword = searchKeyword.value || undefined
  }
  return params
}

async function handleQuestionExportSelect(key: string) {
  exporting.value = true
  try {
    const params: ExportQuestionsParams =
      key === 'selected' ? { questionIds: selectedIds.value } : buildExportParams(key)
    const blob = await exportQuestions(params)
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

// ==================== 列表状态 ↔ URL query 同步 ====================
// 分页/筛选状态落 URL：从列表进详情再返回时（router.back 或浏览器返回），
// 组件重新挂载后从 query 恢复页码与筛选，不再重置回第 1 页。

/**
 * 解析 tags=1,2,3（容忍重复键数组形态），仅保留纯数字段并保持字符串原样。
 * 雪花 long 超出 JS Number 安全整数（2^53），禁止 Number() 转换（会精度失真成错误 id）。
 */
function parseTagIds(raw: unknown): string[] {
  const str = Array.isArray(raw) ? raw.join(',') : raw
  if (typeof str !== 'string' || !str) return []
  return str.split(',').filter((v) => /^\d+$/.test(v))
}

/** 从 route.query 恢复状态（非法值忽略走默认） */
function restoreStateFromQuery() {
  const q = route.query
  const page = Number(q.page)
  if (Number.isInteger(page) && page >= 1) pagination.page = page
  if (typeof q.type === 'string' && typeOptions.some((o) => o.value === q.type)) {
    filterType.value = q.type as QuestionType
  }
  if (typeof q.difficulty === 'string' && difficultyOptions.some((o) => o.value === q.difficulty)) {
    filterDifficulty.value = q.difficulty as Difficulty
  }
  if (typeof q.status === 'string' && statusOptions.some((o) => o.value === q.status)) {
    filterStatus.value = q.status
  }
  if (typeof q.keyword === 'string') searchKeyword.value = q.keyword
  filterTagIds.value = parseTagIds(q.tags)
}

/** 当前状态写回 route.query（page=1 且无筛选时清掉参数，保持 URL 干净） */
function syncStateToQuery() {
  const query: Record<string, string> = {}
  if (pagination.page > 1) query.page = String(pagination.page)
  if (filterType.value) query.type = filterType.value
  if (filterDifficulty.value) query.difficulty = filterDifficulty.value
  if (filterStatus.value) query.status = filterStatus.value
  if (searchKeyword.value) query.keyword = searchKeyword.value
  if (filterTagIds.value.length) query.tags = filterTagIds.value.join(',')
  router.replace({ query })
}

onMounted(() => {
  restoreStateFromQuery()
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
