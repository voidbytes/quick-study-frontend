<template>
  <div>
    <PageHeader title="搜索" subtitle="搜索题库、题目、试卷" />

    <!-- 搜索区 -->
    <div class="bg-white border border-neutral-200 rounded-xl px-5 py-6 sm:px-8 sm:py-8 mb-6">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl mx-auto">
        <n-input
          v-model:value="keyword"
          round
          size="large"
          clearable
          placeholder="搜索题库、题目、试卷..."
          class="flex-1"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <n-icon :component="SearchOutline" />
          </template>
        </n-input>
        <div class="flex gap-3">
          <n-select
            v-model:value="filterType"
            :options="typeOptions"
            placeholder="类型"
            style="width: 120px"
            @update:value="handleSearch"
          />
          <n-button type="primary" size="large" class="shrink-0" @click="handleSearch">
            <template #icon>
              <n-icon :component="SearchOutline" />
            </template>
            搜索
          </n-button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <SkeletonList v-if="loading" :count="4" :cols="1" />
    <EmptyState
      v-else-if="searchResults.length === 0"
      title="暂无结果"
      description="换个关键词或类型试试吧"
      :icon="SearchOutline"
    />
    <div
      v-else
      class="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200 overflow-hidden"
    >
      <div
        v-for="item in searchResults"
        :key="`${item.type}-${item.id}`"
        class="flex items-start gap-4 px-4 sm:px-5 py-4 transition-colors"
        :class="resultPath(item) ? 'cursor-pointer hover:bg-neutral-50' : ''"
        @click="goResult(item)"
      >
        <!-- 类型图标 -->
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="typeMeta(item.type).iconClass"
        >
          <n-icon :size="20">
            <component :is="typeMeta(item.type).icon" />
          </n-icon>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base font-semibold text-neutral-900 truncate">
              <template v-for="(seg, i) in highlightSegments(item.title)" :key="i">
                <span :class="seg.hit ? 'text-primary-500 font-semibold' : ''">{{ seg.text }}</span>
              </template>
            </span>
            <n-tag size="small" round :type="typeMeta(item.type).tagType" :bordered="false">
              {{ typeMeta(item.type).label }}
            </n-tag>
          </div>
          <p v-if="item.description" class="text-sm text-neutral-600 line-clamp-2 mb-2">
            <template v-for="(seg, i) in highlightSegments(item.description)" :key="i">
              <span :class="seg.hit ? 'text-primary-500 font-semibold' : ''">{{ seg.text }}</span>
            </template>
          </p>
          <div class="flex items-center gap-4 text-xs text-neutral-500">
            <span class="inline-flex items-center gap-1">
              <n-icon :size="14" :component="TimeOutline" />
              ID {{ item.id }}
            </span>
          </div>
        </div>

        <div class="flex-shrink-0 pt-1">
          <n-button
            v-if="resultPath(item)"
            size="tiny"
            quaternary
            type="primary"
            @click.stop="goResult(item)"
          >
            查看
          </n-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { Component } from 'vue'
import { search } from '@/api/search'
import type { SearchParams, SearchResultItem } from '@/api/search'
import PageHeader from '@/components/common/PageHeader.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  SearchOutline,
  LibraryOutline,
  DocumentTextOutline,
  FileTrayFullOutline,
  TimeOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const message = useMessage()

const keyword = ref('')
const filterType = ref<string | null>(null)
const loading = ref(false)
const searchResults = ref<SearchResultItem[]>([])

const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '题库', value: 'bank' },
  { label: '题目', value: 'question' },
  { label: '试卷', value: 'paper' }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

type SearchTypeMeta = { label: string; icon: Component; iconClass: string; tagType: 'default' | 'primary' | 'success' | 'warning' }

const TYPE_META: Record<string, SearchTypeMeta> = {
  bank: { label: '题库', icon: LibraryOutline, iconClass: 'bg-primary-50 text-primary-500', tagType: 'primary' },
  question: { label: '题目', icon: DocumentTextOutline, iconClass: 'bg-success-50 text-success-600', tagType: 'success' },
  paper: { label: '试卷', icon: FileTrayFullOutline, iconClass: 'bg-warning-50 text-warning-600', tagType: 'warning' }
}

const DEFAULT_META: SearchTypeMeta = { label: '其他', icon: DocumentTextOutline, iconClass: 'bg-neutral-100 text-neutral-500', tagType: 'default' }

function typeMeta(type: string): SearchTypeMeta {
  return TYPE_META[type] || DEFAULT_META
}

/** 仅保留原有可跳转类型（题库/试卷）的导航；题目保持不可点，避免运行时行为改变 */
function resultPath(item: SearchResultItem): string {
  if (item.type === 'bank') return `/banks/${item.id}`
  if (item.type === 'paper') return `/papers/${item.id}`
  return ''
}

function goResult(item: SearchResultItem) {
  const path = resultPath(item)
  if (path) router.push(path)
}

/** 将文本按关键词切成片段，命中段用 text-brand 高亮（不修改原文本，仅渲染高亮） */
function highlightSegments(text: string): { text: string; hit: boolean }[] {
  const kw = keyword.value.trim()
  if (!kw || !text) return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const k = kw.toLowerCase()
  const segs: { text: string; hit: boolean }[] = []
  let i = 0
  for (;;) {
    const idx = lower.indexOf(k, i)
    if (idx === -1) {
      if (i < text.length) segs.push({ text: text.slice(i), hit: false })
      break
    }
    if (idx > i) segs.push({ text: text.slice(i, idx), hit: false })
    segs.push({ text: text.slice(idx, idx + kw.length), hit: true })
    i = idx + kw.length
  }
  return segs.length ? segs : [{ text, hit: false }]
}

async function handleSearch() {
  if (!keyword.value.trim()) {
    message.warning('请输入搜索关键词')
    return
  }
  loading.value = true
  pagination.page = 1
  try {
    const res = await search({
      keyword: keyword.value,
      type: filterType.value === 'all' ? undefined : (filterType.value as SearchParams['type']),
      page: pagination.page,
      size: pagination.pageSize
    })
    searchResults.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
    // 同步 URL 参数，保证刷新/分享后结果可复现
    if (route.query.keyword !== keyword.value) {
      router.replace({ query: { ...route.query, keyword: keyword.value } })
    }
  } catch {
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  handleSearch()
}

onMounted(() => {
  // 从 URL 参数读取关键词（支持 keyword / q），有值则自动执行搜索
  const q = route.query.keyword ?? route.query.q
  if (q) {
    keyword.value = String(q)
    handleSearch()
  }
})

// 监听路由参数变化（如其他页面跳转携带新关键词时自动重新搜索）
watch(() => route.query.keyword, (val) => {
  const kw = val != null ? String(val) : ''
  if (kw && kw !== keyword.value) {
    keyword.value = kw
    handleSearch()
  }
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
