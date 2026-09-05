<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="题库" subtitle="浏览、搜索并管理题库">
      <template #actions>
        <n-button v-if="authStore.isAuthenticated" @click="showImportDialog = true">
          导入题库
        </n-button>
        <n-button v-if="authStore.isAuthenticated" type="primary" @click="showCreateDialog = true">
          创建题库
        </n-button>
      </template>
    </PageHeader>

    <!-- 搜索与筛选 -->
    <FilterBar>
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索题库名称..."
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
      <n-select
        v-model:value="filterVisibility"
        :options="visibilityOptions"
        placeholder="全部可见性"
        style="width: 150px"
        clearable
        @update:value="handleSearch"
      />
    </FilterBar>

    <!-- 题库卡片网格 -->
    <SkeletonList v-if="loading" :count="6" :cols="3" />
    <EmptyState
      v-else-if="bankList.length === 0"
      title="暂无题库"
      description="没有找到匹配的题库，换个关键词试试"
      :icon="LibraryOutline"
    />
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="bank in bankList"
        :key="bank.id"
        class="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col transition-all hover:border-primary-300 hover:shadow-sm cursor-pointer"
        @click="router.push(`/banks/${bank.id}`)"
      >
        <!-- 卡片头部：名称 + 可见性标签 -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="text-base font-semibold text-neutral-900 truncate">{{ bank.name }}</h3>
          <span
            class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="visibilityTagClass(bank)"
          >
            {{ visibilityTagLabel(bank) }}
          </span>
        </div>

        <!-- 描述 -->
        <p class="text-sm text-neutral-500 mb-4 line-clamp-2">
          {{ bank.description || '暂无描述' }}
        </p>

        <!-- 统计 -->
        <div class="flex items-center gap-4 text-sm text-neutral-500 mb-4">
          <span class="inline-flex items-center gap-1">
            <n-icon :size="15" :component="DocumentTextOutline" />
            {{ bank.questionCount ?? 0 }} 题
          </span>
          <span class="inline-flex items-center gap-1">
            <n-icon :size="15" :component="RepeatOutline" />
            {{ bank.practiceCount ?? 0 }} 练习
          </span>
        </div>

        <!-- 标签 -->
        <div v-if="bank.tags?.length" class="flex gap-1 flex-wrap mb-4">
          <span
            v-for="tag in bank.tags"
            :key="tag.id"
            class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600"
          >
            {{ tag.name }}
          </span>
        </div>

        <!-- 底部：创建者 / 日期 / 管理员操作 -->
        <div class="pt-3 border-t border-neutral-200 mt-auto">
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            >
              {{ (bank.creatorName || '?').charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm text-neutral-500 truncate">{{ bank.creatorName || '匿名用户' }}</span>
            <span class="text-sm text-neutral-400 ml-auto whitespace-nowrap">
              {{ formatDate(bank.createdAt) }}
            </span>
          </div>
          <div v-if="authStore.isAdmin || isCreator(bank)" class="flex items-center gap-4 mt-2" @click.stop>
            <a
              v-if="authStore.isAdmin"
              class="text-xs text-primary-500 hover:text-primary-600 font-medium cursor-pointer select-none"
              @click="handleToggleVisibility(bank)"
            >
              {{ bank.isPublic ? '设为私有' : '设为公开' }}
            </a>
            <a
              class="text-xs text-primary-500 hover:text-primary-600 font-medium cursor-pointer select-none"
              @click="handleExport(bank)"
            >
              导出
            </a>
            <a
              v-if="authStore.isAdmin"
              class="text-xs text-error-500 hover:text-error-600 font-medium cursor-pointer select-none"
              @click="handleDelete(bank)"
            >
              删除
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div
      v-if="pagination.itemCount > pagination.pageSize"
      class="flex justify-end mt-6"
    >
      <n-pagination
        :page="pagination.page"
        :item-count="pagination.itemCount"
        :page-size="pagination.pageSize"
        @update:page="handlePageChange"
      />
    </div>

    <!-- 创建题库弹窗 -->
    <BankCreateDialog v-model:show="showCreateDialog" @created="handleBankCreated" />

    <!-- 导入题库弹窗 -->
    <BankImportDialog v-model:show="showImportDialog" @imported="handleBankImported" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getBankList, deleteBank, toggleVisibility } from '@/api/bank'
import { exportBank } from '@/api/importExport'
import { triggerBlobDownload, nowStamp } from '@/utils/download'
import type { QuestionBank } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BankCreateDialog from './BankCreateDialog.vue'
import BankImportDialog from '@/components/importExport/BankImportDialog.vue'
import {
  LibraryOutline,
  SearchOutline,
  DocumentTextOutline,
  RepeatOutline
} from '@vicons/ionicons5'
import dayjs from 'dayjs'

/** 列表接口实际返回的展示字段（后端 BankResponse）在 QuestionBank 基础上扩展 */
interface BankItem extends QuestionBank {
  creatorName?: string | null
  isOfficial?: boolean
  practiceCount?: number
}

const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()
const authStore = useAuthStore()

const loading = ref(false)
const showCreateDialog = ref(false)
const showImportDialog = ref(false)
const searchKeyword = ref('')
const filterVisibility = ref<number | null>(null)

const visibilityOptions = [
  { label: '公开', value: 1 },
  { label: '私有', value: 0 },
  { label: '官方', value: 2 }
]

const bankList = ref<BankItem[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 12,
  itemCount: 0
})

function visibilityTagLabel(bank: BankItem): string {
  if (bank.isOfficial) return '官方'
  return bank.isPublic ? '公开' : '私有'
}

function visibilityTagClass(bank: BankItem): string {
  if (bank.isOfficial) return 'bg-warning-50 text-warning-600'
  return bank.isPublic ? 'bg-success-50 text-success-600' : 'bg-neutral-100 text-neutral-600'
}

function formatDate(time: string | undefined) {
  return time ? dayjs(time).format('YYYY-MM-DD') : '-'
}

function isCreator(bank: BankItem): boolean {
  const me = authStore.userInfo?.id
  if (!me || bank.creatorId === undefined || bank.creatorId === null) return false
  return String(bank.creatorId) === String(me)
}

function handleBankImported() {
  fetchList()
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getBankList({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      isPublic: filterVisibility.value === 1 ? true : (filterVisibility.value === 0 ? false : undefined),
      isOfficial: filterVisibility.value === 2 ? true : undefined
    })
    bankList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载题库列表失败')
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

function handleBankCreated() {
  showCreateDialog.value = false
  fetchList()
}

async function handleToggleVisibility(row: BankItem) {
  try {
    await toggleVisibility(row.id, !row.isPublic)
    message.success('操作成功')
    fetchList()
  } catch {
    message.error('操作失败')
  }
}

function handleDelete(row: BankItem) {
  confirmDanger({
    title: '确认删除',
    content: `确定要删除题库「${row.name}」吗？该操作不可撤销。`,
    positiveText: '确定删除',
    onPositiveClick: async () => {
      try {
        await deleteBank(row.id)
        message.success('删除成功')
        fetchList()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

async function handleExport(row: BankItem) {
  try {
    message.info('正在生成导出文件…')
    const blob = await exportBank(row.id)
    triggerBlobDownload(blob, `${row.name || '题库'}_${nowStamp()}.json`)
    message.success('导出成功')
  } catch (err: any) {
    message.error(err?.message || '导出失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
