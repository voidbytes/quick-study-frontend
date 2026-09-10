<template>
  <div class="max-w-content mx-auto w-full">
    <PageHeader title="错题本" :subtitle="pagination.itemCount ? `共 ${pagination.itemCount} 道错题` : undefined" />

    <!-- 筛选 -->
    <FilterBar>
      <n-input
        v-model:value="filterKeyword"
        placeholder="搜索题目内容"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
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
    </FilterBar>

    <!-- 加载骨架 -->
    <SkeletonList v-if="loading && wrongList.length === 0" :count="3" :cols="1" />

    <!-- 列表 -->
    <template v-else-if="wrongList.length > 0">
      <div class="flex flex-col gap-3">
        <div
          v-for="(row, index) in wrongList"
          :key="row.id"
          class="bg-white border border-neutral-200 rounded-lg px-5 py-4 flex items-center gap-4 transition-all hover:border-primary-300 hover:shadow-sm"
        >
          <!-- 序号（中性：错误语义由元信息行表达） -->
          <div
            class="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center text-sm font-bold flex-shrink-0"
          >
            {{ (pagination.page - 1) * pagination.pageSize + index + 1 }}
          </div>

          <!-- 题干与标签 -->
          <div class="flex-1 min-w-0 cursor-pointer" @click="handleViewOriginal(row)">
            <div class="text-neutral-900 font-medium truncate leading-relaxed">
              {{ row.plainContent || '（内容已缺失）' }}
            </div>
            <div class="mt-1.5 flex items-center gap-2 flex-wrap">
              <n-tag size="small" round :type="typeTagType(row.type)">
                {{ typeLabel(row.type) }}
              </n-tag>
              <n-tag v-if="row.difficulty" size="small" round :type="difficultyTagType(row.difficulty)">
                {{ difficultyLabel(row.difficulty) }}
              </n-tag>
              <span v-if="row.bankName" class="inline-flex items-center gap-1 text-xs text-neutral-400">
                <n-icon :size="13"><LibraryOutline /></n-icon>
                {{ row.bankName }}
              </span>
              <span class="text-xs" :class="row.errorCount >= 3 ? 'text-warning-600 font-medium' : 'text-neutral-400'">
                最近错于 {{ formatTime(row.lastWrongTime) }} · 累计错 {{ row.errorCount }} 次
              </span>
            </div>
          </div>

          <!-- 操作：主操作 + 弱化的破坏性操作 -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <n-button size="small" type="primary" quaternary @click="handleViewSnapshot(row)">
              查看详情
            </n-button>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button size="small" quaternary class="text-neutral-400 hover:text-error-500" @click="handleRemove(row)">
                  <n-icon :size="16"><TrashOutline /></n-icon>
                </n-button>
              </template>
              移除
            </n-tooltip>
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
        title="暂无错题"
        description="做错的题目会自动收录到这里，方便你反复巩固"
        :icon="CloseCircleOutline"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { CloseCircleOutline, LibraryOutline, TrashOutline } from '@vicons/ionicons5'
import { list as getWrongQuestionList, deleteWrongQuestion } from '@/api/wrongQuestion'
import { getBankList } from '@/api/bank'
import { getTagList } from '@/api/tag'
import type { WrongQuestion, QuestionType, Difficulty } from '@/types'
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP } from '@/utils/constants'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()

const loading = ref(false)
const filterBankId = ref<string | null>(null)
const filterKeyword = ref('')
const filterTagId = ref<number | null>(null)
const wrongList = ref<WrongRow[]>([])
const bankOptions = ref<{ label: string; value: string }[]>([])
const tagOptions = ref<{ label: string; value: string }[]>([])

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

/** 列表展示行：在 WrongQuestion 基础上展开快照中的题型 / 难度 / 纯文本题干 */
interface WrongRow extends WrongQuestion {
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

function toRow(q: WrongQuestion): WrongRow {
  let type: string | null = null
  let difficulty: string | null = null
  let content: string | null = null
  if (q.questionSnapshot) {
    try {
      const obj: unknown = JSON.parse(q.questionSnapshot)
      if (obj && typeof obj === 'object') {
        const raw = obj as Record<string, unknown>
        type = typeof raw.type === 'string' ? raw.type : null
        difficulty = typeof raw.difficulty === 'string' ? raw.difficulty : null
        content = typeof raw.content === 'string' ? raw.content : null
      }
    } catch {
      // 忽略解析失败，type/difficulty/content 保持为空
    }
  }
  return {
    ...q,
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
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

function handleViewOriginal(row: WrongRow) {
  if (row.bankId && row.questionId) {
    router.push(`/banks/${row.bankId}/questions/${row.questionId}`)
  } else {
    message.warning('无法跳转原题')
  }
}

function handleViewSnapshot(row: WrongRow) {
  router.push(`/wrong-questions/snapshot/${row.id}`)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getWrongQuestionList({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: filterKeyword.value.trim() || undefined,
      bankId: filterBankId.value ?? undefined,
      tagId: filterTagId.value ?? undefined
    })
    wrongList.value = (res.data.records || []).map(toRow)
    pagination.itemCount = res.data.total || 0
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

function handleRemove(row: WrongRow) {
  confirmDanger({
    title: '移除错题',
    content: '确定要从错题本中移除该题目吗？',
    positiveText: '移除',
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
