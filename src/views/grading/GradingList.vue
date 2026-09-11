<template>
  <div class="max-w-content mx-auto w-full">
    <PageHeader title="待批改" :subtitle="pagination.itemCount ? `共 ${pagination.itemCount} 份待批改` : undefined" />

    <!-- 加载骨架 -->
    <SkeletonList v-if="loading && pendingList.length === 0" :count="3" :cols="1" />

    <!-- 列表 -->
    <template v-else-if="pendingList.length > 0">
      <div class="flex flex-col gap-3">
        <div
          v-for="row in pendingList"
          :key="row.sessionId"
          class="bg-white border border-neutral-200 rounded-lg px-5 py-4 flex items-center gap-4 transition-all hover:border-primary-300 hover:shadow-sm cursor-pointer"
          @click="goDetail(row)"
        >
          <!-- 图标 -->
          <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
            <n-icon :size="20" color="var(--color-primary-500)"><DocumentTextOutline /></n-icon>
          </div>

          <!-- 主要信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-semibold text-neutral-900 truncate">
                {{ row.paperTitle || '未命名试卷' }}
              </span>
              <n-tag size="small" round type="warning">待批改</n-tag>
            </div>
            <div class="mt-1 flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
              <span class="inline-flex items-center gap-1">
                <n-icon :size="14"><PersonOutline /></n-icon>
                {{ row.userNickname || '未知用户' }}
              </span>
              <span class="inline-flex items-center gap-1">
                <n-icon :size="14"><TimeOutline /></n-icon>
                提交于 {{ formatTime(row.submitTime) }}
              </span>
            </div>
          </div>

          <!-- 操作 -->
          <n-button type="primary" size="small" quaternary class="flex-shrink-0" @click.stop="goDetail(row)">
            去批改
          </n-button>
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
        title="暂无待批改"
        description="有作答者提交试卷后，会显示在这里等待你批改"
        :icon="DocumentTextOutline"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { DocumentTextOutline, PersonOutline, TimeOutline } from '@vicons/ionicons5'
import { getGradingPending } from '@/api/grading'
import type { GradingPendingItem } from '@/api/grading'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const pendingList = ref<GradingPendingItem[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

function goDetail(row: GradingPendingItem) {
  router.push(`/grading/sessions/${row.sessionId}`)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getGradingPending({
      page: pagination.page,
      size: pagination.pageSize
    })
    pendingList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载待批改列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchList()
}

onMounted(() => { fetchList() })
</script>
