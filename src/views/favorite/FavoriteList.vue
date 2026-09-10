<template>
  <div class="max-w-content mx-auto w-full">
    <PageHeader title="收藏题目" :subtitle="pagination.itemCount ? `共 ${pagination.itemCount} 道收藏题目` : undefined">
      <template #actions>
        <n-button secondary :loading="exporting" @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template>
          批量导出
        </n-button>
      </template>
    </PageHeader>

    <!-- Summary Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="收藏总数" :value="stats.total" tone="brand">
        <template #suffix><n-icon :component="StarOutline" /></template>
      </StatCard>
      <StatCard label="本周新增" :value="stats.thisWeekNew" tone="success">
        <template #suffix><n-icon :component="AddCircleOutline" /></template>
      </StatCard>
      <StatCard label="本月练习" :value="stats.thisMonthPractice" tone="warning">
        <template #suffix><n-icon :component="BarChartOutline" /></template>
      </StatCard>
    </div>

    <!-- Filter Bar -->
    <FilterBar>
      <n-select
        v-model:value="filterBankId"
        :options="bankOptions"
        placeholder="全部题库"
        style="width: 200px"
        clearable
        filterable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterTagId"
        :options="tagOptions"
        placeholder="全部标签"
        style="width: 200px"
        clearable
        filterable
        @update:value="handleSearch"
      />
      <div class="w-px h-6 bg-neutral-200" />
      <n-radio-group
        :value="filterType"
        size="small"
        @update:value="(v: QuestionType | null) => { filterType = v; handleSearch() }"
      >
        <n-radio-button v-for="t in TYPE_OPTIONS" :key="t.value" :value="t.value">
          {{ t.label }}
        </n-radio-button>
      </n-radio-group>
      <div class="w-px h-6 bg-neutral-200" />
      <n-select
        v-model:value="sortBy"
        :options="SORT_OPTIONS"
        style="width: 160px"
        @update:value="handleSearch"
      />
    </FilterBar>

    <!-- 加载骨架 -->
    <SkeletonList v-if="loading && favList.length === 0" :count="4" :cols="1" />

    <!-- 列表 -->
    <template v-else-if="favList.length > 0">
      <div class="flex flex-col gap-3">
        <div
          v-for="(row, index) in favList"
          :key="row.id"
          class="bg-white border border-neutral-200 rounded-lg px-5 py-4 flex items-center gap-4 transition-all hover:border-primary-300 hover:shadow-sm"
        >
          <!-- 左侧：star 序号 + 题型/难度 -->
          <div class="flex items-center gap-3 flex-shrink-0" style="width: 180px">
            <div
              class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0"
            >
              <n-icon :size="18"><Star /></n-icon>
            </div>
            <div class="flex flex-col gap-1 items-start">
              <n-tag size="small" round :type="typeTagType(row.type)">{{ typeLabel(row.type) }}</n-tag>
              <n-tag v-if="row.difficulty" size="small" round :type="difficultyTagType(row.difficulty)">
                {{ difficultyLabel(row.difficulty) }}
              </n-tag>
            </div>
          </div>

          <!-- 题干与 meta -->
          <div class="flex-1 min-w-0 cursor-pointer" @click="handleViewOriginal(row)">
            <div class="text-neutral-900 font-medium truncate leading-relaxed">
              {{ row.plainContent || '（内容已缺失）' }}
            </div>
            <div class="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-neutral-400">
              <span v-if="row.bankName" class="inline-flex items-center gap-1">
                <n-icon :size="13"><LibraryOutline /></n-icon>
                {{ row.bankName }}
              </span>
              <span v-if="row.tagNames && row.tagNames.length" class="inline-flex items-center gap-1">
                <n-icon :size="13"><PricetagOutline /></n-icon>
                {{ row.tagNames.join('、') }}
              </span>
            </div>
          </div>

          <!-- 日期 + 操作 -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="text-xs text-neutral-400 whitespace-nowrap">{{ formatTime(row.favoritedAt) }}</span>
            <div class="flex items-center gap-1">
              <n-button size="small" type="primary" quaternary @click="handleViewOriginal(row)">查看详情</n-button>
              <n-button size="small" type="error" quaternary @click="handleCancel(row)">取消收藏</n-button>
            </div>
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
        title="暂无收藏题目"
        description="浏览题库或做题时点击收藏，题目会自动收录到这里，方便集中复习"
        :icon="StarOutline"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  StarOutline,
  Star,
  AddCircleOutline,
  BarChartOutline,
  LibraryOutline,
  PricetagOutline,
  DownloadOutline
} from '@vicons/ionicons5'
import { listFavorites, cancelFavorite, getFavoriteStats, exportFavorites } from '@/api/favorite'
import { getBankList } from '@/api/bank'
import { getTagList } from '@/api/tag'
import type { FavoriteItem, QuestionType, Difficulty } from '@/types'
import { triggerBlobDownload, nowStamp } from '@/utils/download'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP } from '@/utils/constants'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import StatCard from '@/components/common/StatCard.vue'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()

const loading = ref(false)
const exporting = ref(false)
const filterBankId = ref<number | null>(null)
const filterTagId = ref<number | null>(null)
const filterType = ref<QuestionType | null>(null)
const sortBy = ref<string>('favoritedAt_desc')
const favList = ref<FavRow[]>([])
const bankOptions = ref<{ label: string; value: number }[]>([])
const tagOptions = ref<{ label: string; value: string }[]>([])

const stats = reactive({ total: 0, thisWeekNew: 0, thisMonthPractice: 0 })

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

const TYPE_OPTIONS: { label: string; value: QuestionType | null }[] = [
  { label: '全部', value: null },
  { label: '单选', value: 'SINGLE' },
  { label: '多选', value: 'MULTIPLE' },
  { label: '判断', value: 'TRUE_FALSE' },
  { label: '填空', value: 'FILL_BLANK' },
  { label: '简答', value: 'SHORT_ANSWER' }
]

const SORT_OPTIONS = [
  { label: '最近收藏', value: 'favoritedAt_desc' },
  { label: '收藏时间最早', value: 'favoritedAt_asc' }
]

interface FavRow extends FavoriteItem {
  type?: string | null
  difficulty?: string | null
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

function toRow(f: FavoriteItem): FavRow {
  let type: string | null = null
  let difficulty: string | null = null
  let content: string | null = null
  if (f.questionSnapshot) {
    try {
      const obj: unknown = JSON.parse(f.questionSnapshot)
      if (obj && typeof obj === 'object') {
        const raw = obj as Record<string, unknown>
        type = typeof raw.type === 'string' ? raw.type : null
        difficulty = typeof raw.difficulty === 'string' ? raw.difficulty : null
        content = typeof raw.content === 'string' ? raw.content : null
      }
    } catch {
      // 忽略解析失败
    }
  }
  return {
    ...f,
    type,
    difficulty,
    plainContent: stripHtml(content)
  }
}

function typeLabel(type?: string | null): string {
  if (!type) return '-'
  const key = type as QuestionType
  return key in TYPE_TAG ? QUESTION_TYPE_MAP[key] : type
}
function typeTagType(type?: string | null): TagColor {
  if (!type) return 'default'
  const key = type as QuestionType
  return key in TYPE_TAG ? TYPE_TAG[key] : 'default'
}
function difficultyLabel(difficulty?: string | null): string {
  if (!difficulty) return '-'
  const key = difficulty as Difficulty
  return key in DIFFICULTY_TAG ? DIFFICULTY_MAP[key] : difficulty
}
function difficultyTagType(difficulty?: string | null): TagColor {
  if (!difficulty) return 'default'
  const key = difficulty as Difficulty
  return key in DIFFICULTY_TAG ? DIFFICULTY_TAG[key] : 'default'
}
function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD') : '-'
}

function handleViewOriginal(row: FavRow) {
  if (row.bankId && row.questionId) {
    router.push(`/banks/${row.bankId}/questions/${row.questionId}`)
  } else {
    message.warning('无法跳转原题')
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await listFavorites({
      page: pagination.page,
      size: pagination.pageSize,
      bankId: filterBankId.value ?? undefined,
      tagId: filterTagId.value ?? undefined,
      type: filterType.value ?? undefined,
      sortBy: sortBy.value
    })
    favList.value = (res.data.records || []).map(toRow)
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载收藏失败')
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  // TODO: 等待后端接口 — getFavoriteStats 后端就绪后返回真实统计
  try {
    const res = await getFavoriteStats()
    Object.assign(stats, res.data)
  } catch {
    // 忽略，保持 0 占位
  }
}

async function loadOptions() {
  try {
    const [bankRes, tagRes] = await Promise.all([
      getBankList({ page: 1, size: 200 }),
      getTagList()
    ])
    bankOptions.value = (bankRes.data.records || []).map((b) => ({ label: b.name, value: b.id }))
    tagOptions.value = tagRes.data.map((t) => ({ label: t.name, value: t.id }))
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

function handleCancel(row: FavRow) {
  confirmDanger({
    title: '取消收藏',
    content: '确定要取消收藏该题目吗？',
    positiveText: '取消收藏',
    onPositiveClick: async () => {
      try {
        await cancelFavorite(row.id)
        message.success('已取消收藏')
        fetchList()
      } catch {
        message.error('操作失败')
      }
    }
  })
}

function handleExport() {
  exporting.value = true
  exportFavorites({
    bankId: filterBankId.value ?? undefined,
    tagId: filterTagId.value ?? undefined,
    type: filterType.value ?? undefined
  })
    .then((blob) => {
      triggerBlobDownload(blob, `收藏题目导出_${nowStamp()}.json`)
      message.success('导出成功')
    })
    .catch(() => message.error('导出失败'))
    .finally(() => {
      exporting.value = false
    })
}

onMounted(() => {
  loadOptions()
  fetchStats()
  fetchList()
})
</script>
