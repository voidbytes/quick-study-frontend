<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">审核管理</h1>

    <n-data-table
      :columns="columns"
      :data="reviewList"
      :loading="loading"
      :pagination="pagination"
      :bordered="true"
      @update:page="handlePageChange"
    />

    <!-- 审核详情弹窗 -->
    <n-modal v-model:show="showDetail" title="审核详情" preset="card" style="width: 700px">
      <n-spin :show="detailLoading">
        <template v-if="currentReview">
          <n-descriptions :column="2" bordered class="mb-4">
            <n-descriptions-item label="题库">{{ currentReview.bankName }}</n-descriptions-item>
            <n-descriptions-item label="提交者">{{ currentReview.submitterName }}</n-descriptions-item>
            <n-descriptions-item label="提交时间">{{ dayjs(currentReview.createdAt).format('YYYY-MM-DD HH:mm') }}</n-descriptions-item>
            <n-descriptions-item label="状态">{{ currentReview.status === 'PENDING' ? '待审核' : currentReview.status }}</n-descriptions-item>
          </n-descriptions>

          <n-card title="题目内容" size="small" class="mb-4">
            <div v-html="currentReview.question?.content" />
          </n-card>

          <div v-if="currentReview.question?.options" class="mb-4">
            <span class="font-bold">选项：</span>
            <div v-for="(opt, idx) in currentReview.question.options" :key="idx" class="ml-4">
              {{ String.fromCharCode(65 + idx) }}. {{ opt }}
            </div>
          </div>

          <n-descriptions :column="1" bordered class="mb-4">
            <n-descriptions-item label="答案">{{ currentReview.question?.answer || '无' }}</n-descriptions-item>
            <n-descriptions-item label="解析">
              <span v-html="currentReview.question?.analysis || '无'" />
            </n-descriptions-item>
          </n-descriptions>

          <div class="flex justify-end gap-2">
            <n-input
              v-model:value="reviewComment"
              placeholder="审核意见（驳回必填）"
              style="width: 300px"
            />
            <n-button type="success" @click="handleApprove">审核通过</n-button>
            <n-button type="error" @click="handleReject">驳回</n-button>
          </div>
        </template>
      </n-spin>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getReviewList, getReviewDetail, approveReview, rejectReview } from '@/api/review'
import dayjs from 'dayjs'

const message = useMessage()

const loading = ref(false)
const detailLoading = ref(false)
const reviewList = ref<any[]>([])
const showDetail = ref(false)
const currentReview = ref<any>(null)
const reviewComment = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const columns: DataTableColumn<any>[] = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '题库', key: 'bankName', width: 150, ellipsis: { tooltip: true } },
  { title: '提交者', key: 'submitterName', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row) {
      const map: Record<string, string> = { PENDING: '待审核', APPROVED: '已通过', REJECTED: '已驳回' }
      const colors: Record<string, string> = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error' }
      return h('n-tag', { size: 'small', type: colors[row.status] || 'default' as any }, () => map[row.status] || row.status)
    }
  },
  {
    title: '提交时间',
    key: 'createdAt',
    width: 160,
    render(row) { return dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render(row) {
      return h('a', { class: 'text-primary cursor-pointer', onClick: () => handleViewDetail(row) }, '审核')
    }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getReviewList({
      page: pagination.page,
      size: pagination.pageSize,
      status: 'PENDING'
    })
    reviewList.value = res.data.records || []
    pagination.total = res.data.total || 0
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

async function handleViewDetail(row: any) {
  showDetail.value = true
  detailLoading.value = true
  reviewComment.value = ''
  try {
    const res = await getReviewDetail(row.id)
    currentReview.value = res
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