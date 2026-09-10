<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="题目" subtitle="跨题库浏览与筛选所有题目，筛选状态在地址栏中，可直接分享链接">
      <template #actions>
        <n-button v-if="authStore.isAdmin" @click="router.push('/questions/manage')">管理模式</n-button>
      </template>
    </PageHeader>

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
    </FilterBar>

    <!-- 题目卡片列表 -->
    <SkeletonList v-if="loading" :count="5" :cols="1" />
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
        <!-- 题号 -->
        <span class="text-sm font-mono text-neutral-400 w-10 flex-shrink-0 pt-0.5">
          #{{ String((pagination.page - 1) * pagination.pageSize + index + 1).padStart(3, '0') }}
        </span>

        <!-- 题干与元信息（题干可点进详情） -->
        <div class="flex-1 min-w-0">
          <div
            class="text-sm font-medium text-neutral-900 hover:text-primary-500 cursor-pointer"
            @click="goDetail(q)"
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
          <n-button size="tiny" quaternary type="primary" @click="goDetail(q)">查看</n-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.itemCount > 0" class="flex justify-end mt-4 items-center gap-4">
      <n-pagination
        :page="pagination.page"
        :item-count="pagination.itemCount"
        :page-size="pagination.pageSize"
        @update:page="handlePageChange"
      />
      <span class="text-sm text-neutral-400">共 {{ pagination.itemCount }} 道</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import type { Question, QuestionType, Difficulty } from '@/types'
import { getAllQuestions } from '@/api/question'
import { getTagList } from '@/api/tag'
import { buildGroupedTagOptions } from '@/utils/tagOptions'
import {
  QUESTION_TYPE_MAP,
  QUESTION_TYPE_OPTIONS,
  DIFFICULTY_MAP,
  DIFFICULTY_OPTIONS,
  QUESTION_STATUS_OPTIONS
} from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import RichText from '@/components/common/RichText.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { SearchOutline, DocumentTextOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref<QuestionType | null>(null)
const filterDifficulty = ref<Difficulty | null>(null)
const filterStatus = ref<string | null>(null)
/** 标签多选（跨库场景用全局 GET /tags 下拉）；雪花 long 超出 2^53，值按原始数字字符串传递 */
const filterTagIds = ref<string[]>([])
const tagOptions = ref<SelectOption[]>([])
const questionList = ref<Question[]>([])

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

function formatTime(time: string | undefined) {
  return time ? dayjs(time).format('YYYY-MM-DD') : '-'
}

function goDetail(q: Question) {
  router.push(`/banks/${q.bankId}/questions/${q.id}`)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getAllQuestions({
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
    // 跨库浏览：标签下拉用全局标签池（GET /tags），不限定单题库
    const res = await getTagList()
    tagOptions.value = buildGroupedTagOptions(res.data || [])
  } catch {
    // 忽略错误
  }
}

function handleSearch() {
  pagination.page = 1
  syncStateToQuery()
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
  syncStateToQuery()
  fetchList()
}

// ==================== 列表状态 ↔ URL query 同步 ====================
// 可分享性核心：全部筛选状态（tags/difficulty/type/status/keyword/page）落在 URL query，
// 复制地址栏即可让他人直达同一筛选结果；非法值一律忽略走默认。

/**
 * 解析 tags=1,2,3（容忍重复键数组形态），仅保留纯数字段、保持字符串原样。
 * 注意：id 是后端雪花 long，超出 JS Number 安全整数（2^53），必须按原始数字字符串
 * 传递，禁止 Number() 转换（会精度失真成错误 id）。与 n-select 的 string value 及 axios 序列化一致。
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
  const tagIds = parseTagIds(q.tags)
  if (tagIds.length) filterTagIds.value = tagIds
}

/** 由当前状态构建目标 query（page=1 且无筛选时清掉参数，保持 URL 干净） */
function buildQueryFromState(): Record<string, string> {
  const query: Record<string, string> = {}
  if (pagination.page > 1) query.page = String(pagination.page)
  if (filterType.value) query.type = filterType.value
  if (filterDifficulty.value) query.difficulty = filterDifficulty.value
  if (filterStatus.value) query.status = filterStatus.value
  if (searchKeyword.value) query.keyword = searchKeyword.value
  if (filterTagIds.value.length) query.tags = filterTagIds.value.join(',')
  return query
}

/** 当前状态写回 route.query */
function syncStateToQuery() {
  router.replace({ query: buildQueryFromState() })
}

// 同记录下的 query 变化（手动改地址栏 / 已在本页时打开分享链接）组件不会重挂载，
// 监听并恢复状态重新拉列表；自身 sync 引发的 replace 与目标一致，直接跳过避免双请求。
watch(
  () => route.query,
  (q) => {
    const target = buildQueryFromState()
    const incoming = q as Record<string, unknown>
    const keys = new Set([...Object.keys(incoming), ...Object.keys(target)])
    for (const k of keys) {
      const av = Array.isArray(incoming[k]) ? (incoming[k] as unknown[]).join(',') : incoming[k] ?? ''
      const bv = target[k] ?? ''
      if (av !== bv) {
        restoreStateFromQuery()
        fetchList()
        return
      }
    }
  }
)

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
