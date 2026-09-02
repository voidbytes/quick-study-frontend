<template>
  <div>
    <!-- 页头 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-neutral-900">通知中心</h1>
      <n-button size="small" @click="handleReadAll">
        <template #icon>
          <n-icon :component="CheckmarkDoneOutline" />
        </template>
        全部标为已读
      </n-button>
    </div>

    <!-- 已读/未读筛选（全部/未读/已读） -->
    <div class="inline-flex items-center gap-1 p-1 rounded-full bg-neutral-100 mb-6">
      <button
        v-for="tab in readTabs"
        :key="String(tab.value)"
        type="button"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="isTabActive(tab.value)
          ? 'bg-white text-primary-600 font-semibold shadow-sm'
          : 'text-neutral-600 hover:text-neutral-900'"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <n-spin :show="loading">
      <EmptyState
        v-if="!loading && notifications.length === 0"
        description="暂无通知"
        :icon="NotificationsOutline"
      />
      <div v-else class="space-y-3">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="flex items-start gap-4 px-5 py-4 rounded-lg border transition-colors"
          :class="notif.isRead
            ? 'bg-white border-neutral-200'
            : 'bg-primary-50 border-primary-200'"
        >
          <!-- 类型图标 -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="typeMeta(notif.type).iconClass"
          >
            <n-icon :size="20">
              <component :is="typeMeta(notif.type).icon" />
            </n-icon>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <n-tag size="small" round :bordered="false" :type="typeMeta(notif.type).tagType">
                {{ typeMeta(notif.type).label }}
              </n-tag>
              <span class="text-sm font-medium text-neutral-900">{{ notif.title }}</span>
            </div>
            <p class="text-sm text-neutral-600 leading-relaxed mb-2">{{ notif.content }}</p>
            <span class="inline-flex items-center gap-1 text-xs text-neutral-500">
              <n-icon :size="14" :component="TimeOutline" />
              {{ dayjs(notif.createdAt).format('YYYY-MM-DD HH:mm') }}
            </span>
          </div>

          <div class="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
            <span v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary-500" />
            <n-button
              v-if="!notif.isRead"
              size="tiny"
              quaternary
              type="primary"
              @click="handleMarkRead(notif)"
            >
              <template #icon>
                <n-icon :component="CheckmarkCircleOutline" />
              </template>
              标记已读
            </n-button>
            <n-button
              size="tiny"
              quaternary
              type="error"
              @click="handleDelete(notif)"
            >
              <template #icon>
                <n-icon :component="TrashOutline" />
              </template>
              删除
            </n-button>
          </div>
        </div>
      </div>
    </n-spin>

    <!-- 分页 -->
    <div v-if="pagination.itemCount > pagination.pageSize" class="flex justify-center mt-6">
      <n-pagination
        :page="pagination.page"
        :page-size="pagination.pageSize"
        :item-count="pagination.itemCount"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { Component } from 'vue'
import { getNotifications, markRead, markReadAll, deleteNotification } from '@/api/notification'
import EmptyState from '@/components/common/EmptyState.vue'
import { useConfirm } from '@/composables/useConfirm'
import {
  NotificationsOutline,
  CheckmarkDoneOutline,
  CheckmarkCircleOutline,
  CreateOutline,
  PersonAddOutline,
  AlertCircleOutline,
  PeopleOutline,
  ShieldCheckmarkOutline,
  SwapHorizontalOutline,
  TrashOutline,
  TimeOutline
} from '@vicons/ionicons5'
import dayjs from 'dayjs'

const message = useMessage()
const { confirmDanger } = useConfirm()

const loading = ref(false)
const filterIsRead = ref<boolean | null>(null)
const notifications = ref<any[]>([])

const readTabs = [
  { label: '全部', value: null as boolean | null },
  { label: '未读', value: false },
  { label: '已读', value: true }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

type NotifTypeMeta = { label: string; icon: Component; iconClass: string; tagType: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' }

/** 类型映射与后端 NotificationType 枚举一致（GRADING_PENDING 等） */
const TYPE_META: Record<string, NotifTypeMeta> = {
  GRADING_PENDING: { label: '批改待办', icon: CreateOutline, iconClass: 'bg-warning-50 text-warning-600', tagType: 'warning' },
  GRADING_ASSIGNED: { label: '被指定为批改人', icon: PersonAddOutline, iconClass: 'bg-info-50 text-info-500', tagType: 'info' },
  GRADING_DONE: { label: '批改完成', icon: CheckmarkCircleOutline, iconClass: 'bg-success-50 text-success-600', tagType: 'success' },
  GRADING_TIMEOUT: { label: '批改超时', icon: AlertCircleOutline, iconClass: 'bg-error-50 text-error-500', tagType: 'error' },
  COLLAB_INVITE: { label: '协作邀请', icon: PeopleOutline, iconClass: 'bg-info-50 text-info-500', tagType: 'info' },
  REVIEW_RESULT: { label: '审核结果', icon: ShieldCheckmarkOutline, iconClass: 'bg-success-50 text-success-600', tagType: 'success' },
  BANK_TRANSFER: { label: '题库转让', icon: SwapHorizontalOutline, iconClass: 'bg-info-50 text-info-500', tagType: 'info' }
}

const DEFAULT_META: NotifTypeMeta = { label: '系统通知', icon: NotificationsOutline, iconClass: 'bg-neutral-100 text-neutral-500', tagType: 'default' }

function typeMeta(type: string): NotifTypeMeta {
  return TYPE_META[type] || DEFAULT_META
}

function isTabActive(value: boolean | null): boolean {
  return filterIsRead.value === value
}

function handleTabChange(value: boolean | null) {
  if (filterIsRead.value === value) return
  filterIsRead.value = value
  handleSearch()
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getNotifications({
      page: pagination.page,
      pageSize: pagination.pageSize,
      isRead: filterIsRead.value ?? undefined
    })
    notifications.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载通知失败')
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

async function handleMarkRead(notif: any) {
  try {
    await markRead(notif.id)
    notif.isRead = true
  } catch {
    message.error('操作失败')
  }
}

async function handleReadAll() {
  try {
    await markReadAll()
    notifications.value.forEach(n => { n.isRead = true })
    message.success('已全部标记已读')
  } catch {
    message.error('操作失败')
  }
}

function handleDelete(notif: any) {
  confirmDanger({
    title: '删除通知',
    content: '确定要删除这条通知吗？',
    positiveText: '删除',
    onPositiveClick: async () => {
      try {
        await deleteNotification(notif.id)
        notifications.value = notifications.value.filter(n => n.id !== notif.id)
        message.success('已删除')
      } catch {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => { fetchList() })
</script>
