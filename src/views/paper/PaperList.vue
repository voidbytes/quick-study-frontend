<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="试卷" subtitle="创建、管理试卷，组织在线考试与练习">
      <template #actions>
        <n-button v-if="authStore.isAdmin" type="primary" @click="router.push('/papers/create')">
          创建试卷
        </n-button>
      </template>
    </PageHeader>

    <!-- 搜索与筛选 -->
    <FilterBar>
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索试卷标题..."
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
      <n-select
        v-model:value="filterShareType"
        :options="shareTypeOptions"
        placeholder="全部分享类型"
        style="width: 150px"
        clearable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="全部状态"
        style="width: 130px"
        clearable
        @update:value="handleSearch"
      />
    </FilterBar>

    <!-- 试卷卡片网格 -->
    <SkeletonList v-if="loading" :count="4" :cols="2" />
    <EmptyState
      v-else-if="paperList.length === 0"
      title="暂无试卷"
      description="没有找到匹配的试卷，换个关键词试试"
      :icon="DocumentTextOutline"
    />
    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div
        v-for="paper in paperList"
        :key="paper.id"
        class="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col transition-all hover:border-primary-300 hover:shadow-sm"
      >
        <!-- 卡片头部：标题 + 状态 -->
        <div class="flex items-start justify-between gap-3 mb-2">
          <h3
            class="text-base font-semibold text-neutral-900 truncate cursor-pointer"
            @click="router.push(`/papers/${paper.id}`)"
          >
            {{ paper.title }}
          </h3>
          <span
            class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="statusTagClass(paper.status)"
          >
            {{ statusLabel(paper.status) }}
          </span>
        </div>

        <!-- 描述 -->
        <p class="text-sm text-neutral-500 mb-4 line-clamp-2">
          {{ paper.description || '暂无描述' }}
        </p>

        <!-- 统计 -->
        <div class="flex items-center gap-6 py-3 border-y border-neutral-200 mb-4">
          <div class="flex flex-col gap-0.5">
            <span class="text-base font-bold text-neutral-900">{{ paper.questionCount ?? 0 }}<span class="text-xs font-normal text-neutral-500 ml-0.5">题</span></span>
            <span class="text-xs text-neutral-500">题目数</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base font-bold text-neutral-900">{{ paper.totalScore ?? 0 }}<span class="text-xs font-normal text-neutral-500 ml-0.5">分</span></span>
            <span class="text-xs text-neutral-500">总分</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-base font-bold text-neutral-900">{{ timeLimitText(paper.timeLimit) }}</span>
            <span class="text-xs text-neutral-500">时限</span>
          </div>
        </div>

        <!-- 底部：创建者 / 日期 -->
        <div class="flex items-center gap-2 mb-4">
          <div
            class="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          >
            {{ (paper.creatorName || '?').charAt(0).toUpperCase() }}
          </div>
          <span class="text-sm text-neutral-500 truncate">{{ paper.creatorName || '匿名用户' }}</span>
          <span class="text-sm text-neutral-400 ml-auto whitespace-nowrap">{{ formatDate(paper.createdAt) }}</span>
        </div>

        <!-- 操作区 -->
        <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 mt-auto flex-wrap">
          <template v-if="paper.status === 'PUBLISHED' && authStore.isAuthenticated">
            <n-button type="primary" size="small" @click="router.push(`/papers/${paper.id}/exam`)">
              开始考试
            </n-button>
          </template>
          <n-button size="small" quaternary @click="router.push(`/papers/${paper.id}`)">
            查看详情
          </n-button>
          <template v-if="authStore.isAdmin">
            <n-button size="small" quaternary @click="router.push(`/papers/${paper.id}/edit`)">
              编辑
            </n-button>
            <n-button
              v-if="paper.status !== 'PUBLISHED'"
              size="small"
              quaternary
              type="success"
              @click="handlePublish(paper)"
            >
              发布
            </n-button>
            <n-button size="small" quaternary type="error" @click="handleDelete(paper)">
              删除
            </n-button>
          </template>
          <span
            class="ml-auto flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="shareTagClass(paper.shareType)"
          >
            {{ shareTypeLabels[paper.shareType] || paper.shareType }}
          </span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.itemCount > pagination.pageSize" class="flex justify-end mt-6">
      <n-pagination
        :page="pagination.page"
        :item-count="pagination.itemCount"
        :page-size="pagination.pageSize"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getPaperList, deletePaper, publishPaper } from '@/api/paper'
import type { ExamPaper, PaperShareType, PaperStatus } from '@/types'
import { PAPER_STATUS_MAP } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { SearchOutline, DocumentTextOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const { confirmDanger } = useConfirm()

const loading = ref(false)
const searchKeyword = ref('')
const filterShareType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const paperList = ref<ExamPaper[]>([])

const shareTypeOptions = [
  { label: '私有', value: 'PRIVATE' },
  { label: '链接', value: 'LINK' },
  { label: '密码', value: 'PASSWORD' },
  { label: '公开', value: 'PUBLIC' }
]

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已关闭', value: 'CLOSED' }
]

const shareTypeLabels: Record<string, string> = {
  PRIVATE: '私有', LINK: '链接', PASSWORD: '密码', PUBLIC: '公开'
}

const pagination = reactive({
  page: 1,
  pageSize: 12,
  itemCount: 0
})

const SHARE_TAG_CLASS: Record<PaperShareType, string> = {
  PRIVATE: 'bg-neutral-100 text-neutral-600',
  LINK: 'bg-info-50 text-info-600',
  PASSWORD: 'bg-warning-50 text-warning-600',
  PUBLIC: 'bg-success-50 text-success-600'
}

function statusLabel(status: PaperStatus): string {
  return PAPER_STATUS_MAP[status]?.label ?? status
}

function statusTagClass(status: PaperStatus): string {
  const type = PAPER_STATUS_MAP[status]?.type
  if (type === 'success') return 'bg-success-50 text-success-600'
  if (type === 'error') return 'bg-error-50 text-error-600'
  return 'bg-neutral-100 text-neutral-600'
}

function shareTagClass(shareType: PaperShareType): string {
  return SHARE_TAG_CLASS[shareType] || SHARE_TAG_CLASS.PRIVATE
}

function timeLimitText(timeLimit?: number | null): string {
  return timeLimit ? timeLimit + '分钟' : '不限时'
}

function formatDate(time: string | undefined) {
  return time ? dayjs(time).format('YYYY-MM-DD') : '-'
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getPaperList({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      shareType: filterShareType.value || undefined,
      status: filterStatus.value || undefined
    })
    paperList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载试卷列表失败')
  } finally {
    loading.value = false
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

async function handlePublish(row: ExamPaper) {
  try {
    await publishPaper(row.id)
    message.success('发布成功')
    fetchList()
  } catch {
    message.error('发布失败')
  }
}

function handleDelete(row: ExamPaper) {
  confirmDanger({
    title: '确认删除',
    content: `确定要删除试卷「${row.title}」吗？该操作不可撤销。`,
    positiveText: '确定删除',
    onPositiveClick: async () => {
      try {
        await deletePaper(row.id)
        message.success('删除成功')
        fetchList()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
