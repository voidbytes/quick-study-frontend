<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">通知</h1>
      <n-button size="small" @click="handleReadAll">全部已读</n-button>
    </div>

    <div class="flex gap-4 mb-4">
      <n-select
        v-model:value="filterIsRead"
        :options="readFilterOptions"
        placeholder="筛选"
        style="width: 120px"
        clearable
        @update:value="handleSearch"
      />
    </div>

    <n-empty v-if="notifications.length === 0" description="暂无通知" />

    <n-list v-else>
      <n-list-item v-for="notif in notifications" :key="notif.id">
        <template #prefix>
          <n-icon :size="22" :color="getTypeColor(notif.type)">
            <component :is="getTypeIcon(notif.type)" />
          </n-icon>
        </template>
        <n-thing
          :title="notif.title"
          :description="notif.content"
        >
          <template #footer>
            <span class="text-xs text-gray-400">{{ dayjs(notif.createdAt).format('YYYY-MM-DD HH:mm') }}</span>
          </template>
        </n-thing>
        <template #suffix>
          <div class="flex flex-col gap-1 items-end">
            <n-button
              v-if="!notif.isRead"
              size="tiny"
              quaternary
              @click="handleMarkRead(notif)"
            >
              标记已读
            </n-button>
            <n-button
              size="tiny"
              quaternary
              type="error"
              @click="handleDelete(notif)"
            >
              删除
            </n-button>
          </div>
        </template>
      </n-list-item>
    </n-list>

    <div v-if="pagination.itemCount > pagination.pageSize" class="flex justify-center mt-4">
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
import { ref, reactive, h, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { getNotifications, markRead, markReadAll, deleteNotification } from '@/api/notification'
import { Notifications, CheckmarkCircle, Warning, Information } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const message = useMessage()

const filterIsRead = ref<boolean | null>(null)
const notifications = ref<any[]>([])

const readFilterOptions = [
  { label: '未读', value: false },
  { label: '已读', value: true }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

function getTypeColor(type: string) {
  const map: Record<string, string> = { INFO: '#1890ff', SUCCESS: '#52c41a', WARNING: '#faad14', ERROR: '#ff4d4f' }
  return map[type] || '#999'
}

function getTypeIcon(type: string) {
  const map: Record<string, any> = { INFO: Information, SUCCESS: CheckmarkCircle, WARNING: Warning, ERROR: Notifications }
  return map[type] || Notifications
}

async function fetchList() {
  try {
    const res = await getNotifications({
      page: pagination.page,
      size: pagination.pageSize,
      isRead: filterIsRead.value ?? undefined
    })
    notifications.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载通知失败')
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

async function handleDelete(notif: any) {
  try {
    await deleteNotification(notif.id)
    notifications.value = notifications.value.filter(n => n.id !== notif.id)
    message.success('已删除')
  } catch {
    message.error('删除失败')
  }
}

onMounted(() => { fetchList() })
</script>