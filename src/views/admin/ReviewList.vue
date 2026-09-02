<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="审核管理" subtitle="审核用户提交的题目" />

    <!-- 审核卡片列表 -->
    <n-spin :show="loading">
      <div v-if="reviewList.length > 0" class="space-y-3">
        <div
          v-for="review in reviewList"
          :key="review.id"
          class="bg-white border border-neutral-200 rounded-lg p-4 flex items-center gap-4 hover:border-primary-300 transition-colors"
        >
          <div class="w-10 h-10 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0">
            <n-icon :component="DocumentTextOutline" size="20" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-sm font-semibold text-neutral-900 truncate">{{ review.bankName }}</span>
              <n-tag :type="statusTag(review.status)" size="small" round :bordered="false" class="flex-shrink-0">
                {{ statusLabel(review.status) }}
              </n-tag>
            </div>
            <div class="flex items-center text-xs text-neutral-500">
              <n-icon :component="PersonOutline" class="mr-1 flex-shrink-0" />
              <span class="truncate">{{ review.submitterName }}</span>
              <span class="mx-2 text-neutral-300">·</span>
              <span class="flex-shrink-0">{{ formatTime(review.createdAt) }}</span>
            </div>
          </div>

          <n-button size="small" type="primary" secondary class="flex-shrink-0" @click="handleViewDetail(review)">
            审核
          </n-button>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.itemCount > 0" class="flex justify-between items-center pt-2">
          <span class="text-sm text-neutral-500">共 {{ pagination.itemCount }} 条记录</span>
          <n-pagination
            :page="pagination.page"
            :page-size="pagination.pageSize"
            :item-count="pagination.itemCount"
            @update:page="handlePageChange"
          />
        </div>
      </div>

      <div v-else-if="!loading" class="bg-white border border-neutral-200 rounded-lg">
        <EmptyState title="暂无待审核题目" description="当前没有需要审核的题目" />
      </div>
    </n-spin>

    <!-- 审核详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="审核详情" style="width: 720px">
      <n-spin :show="detailLoading">
        <template v-if="currentReview">
          <!-- 头部信息 -->
          <div class="border-b border-neutral-100 pb-4 mb-4">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <h3 class="text-lg font-semibold text-neutral-900 mb-1 truncate">{{ currentReview?.bankName }}</h3>
                <p class="flex items-center text-xs text-neutral-500">
                  <n-icon :component="PersonOutline" class="mr-1" />
                  <span>{{ currentReview?.submitterName }}</span>
                  <span class="mx-2 text-neutral-300">·</span>
                  <span>{{ formatTime(currentReview?.createdAt) }}</span>
                </p>
              </div>
              <n-tag :type="statusTag(currentReview?.status)" size="small" round :bordered="false" class="flex-shrink-0">
                {{ statusLabel(currentReview?.status) }}
              </n-tag>
            </div>
          </div>

          <!-- 题目内容 -->
          <div class="rounded-lg border border-neutral-200 p-4 mb-4">
            <div class="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">题目内容</div>
            <RichText :content="currentReview?.question?.content" />
          </div>

          <!-- 选项 -->
          <div v-if="questionOptionList.length" class="rounded-lg border border-neutral-200 p-4 mb-4">
            <div class="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">选项</div>
            <div v-for="(opt, idx) in questionOptionList" :key="idx" class="flex items-start gap-2 py-1">
              <span
                class="w-5 h-5 rounded-full bg-primary-50 text-primary-600 text-xs flex items-center justify-center flex-shrink-0 font-medium mt-0.5"
              >
                {{ String.fromCharCode(65 + idx) }}
              </span>
              <span class="text-sm text-neutral-700">{{ opt }}</span>
            </div>
          </div>

          <!-- 答案与解析 -->
          <div class="rounded-lg border border-neutral-200 p-4 mb-4">
            <div class="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">参考答案</div>
            <p class="text-sm text-neutral-800">{{ currentReview?.question?.answer || '无' }}</p>
          </div>

          <div class="rounded-lg border border-neutral-200 p-4 mb-4">
            <div class="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">解析</div>
            <RichText :content="currentReview?.question?.analysis || '无'" />
          </div>

          <!-- 操作 -->
          <div class="flex items-center justify-between gap-3 pt-2">
            <n-input
              v-model:value="reviewComment"
              placeholder="审核意见（驳回必填）"
              clearable
              style="max-width: 420px"
            />
            <div class="flex gap-2 flex-shrink-0">
              <n-button type="success" @click="handleApprove">审核通过</n-button>
              <n-button type="error" @click="handleReject">驳回</n-button>
            </div>
          </div>
        </template>
      </n-spin>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { getReviewList, getReviewDetail, approveReview, rejectReview } from '@/api/review'
import type { ReviewResponse } from '@/api/review'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RichText from '@/components/common/RichText.vue'
import { DocumentTextOutline, PersonOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const message = useMessage()

const loading = ref(false)
const detailLoading = ref(false)
const reviewList = ref<ReviewResponse[]>([])
const showDetail = ref(false)
const currentReview = ref<ReviewResponse | null>(null)
const reviewComment = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

type TagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

/** 审核状态：待审核 warning / 通过 success / 拒绝 error */
const STATUS_META: Record<string, { label: string; tag: TagType }> = {
  PENDING: { label: '待审核', tag: 'warning' },
  APPROVED: { label: '通过', tag: 'success' },
  REJECTED: { label: '拒绝', tag: 'error' }
}

function statusLabel(status?: string): string {
  return (status && STATUS_META[status]?.label) || status || '待审核'
}

function statusTag(status?: string): TagType {
  return (status && STATUS_META[status]?.tag) || 'default'
}

function formatTime(time?: string): string {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '—'
}

/** 详情接口 options 运行时为 JSON 字符串（类型声明滞后为数组），此处做本地收敛 */
function parseOptions(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter((o): o is string => typeof o === 'string')
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((o): o is string => typeof o === 'string') : []
    } catch {
      return []
    }
  }
  return []
}

const questionOptionList = computed<string[]>(() =>
  parseOptions(currentReview.value?.question?.options)
)

async function fetchList() {
  loading.value = true
  try {
    const res = await getReviewList({
      page: pagination.page,
      size: pagination.pageSize,
      status: 'PENDING'
    })
    reviewList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载审核列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchList()
}

async function handleViewDetail(row: ReviewResponse) {
  showDetail.value = true
  detailLoading.value = true
  reviewComment.value = ''
  try {
    const res = await getReviewDetail(row.id)
    currentReview.value = res.data
  } catch {
    message.error('加载审核详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleApprove() {
  if (!currentReview.value) return
  try {
    await approveReview(currentReview.value.id, { comment: reviewComment.value || undefined })
    message.success('审核通过')
    showDetail.value = false
    fetchList()
  } catch {
    message.error('操作失败')
  }
}

async function handleReject() {
  if (!currentReview.value) return
  if (!reviewComment.value.trim()) {
    message.warning('驳回时请填写审核意见')
    return
  }
  try {
    await rejectReview(currentReview.value.id, { comment: reviewComment.value })
    message.success('已驳回')
    showDetail.value = false
    fetchList()
  } catch {
    message.error('操作失败')
  }
}

onMounted(() => { fetchList() })
</script>
