<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- 欢迎信息 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ authStore.isAuthenticated ? `欢迎回来，${authStore.userInfo?.nickname || authStore.userInfo?.username || '用户'}` : '欢迎光临' }}
      </h1>
      <p class="text-gray-500 mt-1">{{ authStore.isAuthenticated ? '今天也要加油学习哦！' : '登录后即可开始练习和考试' }}</p>
    </div>

    <!-- 快速入口卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <n-card
        v-for="entry in quickEntries"
        :key="entry.title"
        hoverable
        class="cursor-pointer"
        @click="router.push(entry.path)"
      >
        <div class="flex flex-col items-center gap-2 py-2">
          <n-icon :size="32" :color="entry.color">
            <component :is="entry.icon" />
          </n-icon>
          <span class="text-sm font-medium">{{ entry.title }}</span>
        </div>
      </n-card>
    </div>

    <!-- 游客可见：公开题库列表 -->
    <n-card title="公开题库" class="mb-8" v-if="!authStore.isAuthenticated">
      <n-data-table
        :columns="publicBankColumns"
        :data="publicBanks"
        :loading="loadingBanks"
        :bordered="false"
        size="small"
      />
      <div class="text-right mt-2">
        <n-button text type="primary" @click="router.push('/banks')">查看全部题库 &rarr;</n-button>
      </div>
    </n-card>

    <!-- 游客可见：公开试卷列表 -->
    <n-card title="公开试卷" class="mb-8" v-if="!authStore.isAuthenticated">
      <n-data-table
        :columns="publicPaperColumns"
        :data="publicPapers"
        :loading="loadingPapers"
        :bordered="false"
        size="small"
      />
      <div class="text-right mt-2">
        <n-button text type="primary" @click="router.push('/papers')">查看全部试卷 &rarr;</n-button>
      </div>
    </n-card>

    <!-- 统计概览（仅登录用户） -->
    <n-card title="统计概览" class="mb-8" v-if="authStore.isAuthenticated">
      <n-grid :cols="4" :x-gap="16" :y-gap="16">
        <n-grid-item>
          <n-statistic label="练习场次" :value="overview?.totalPractices || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="总题数" :value="overview?.totalQuestions || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="正确率">
            <template #default>
              {{ overview?.correctRate != null ? overview.correctRate.toFixed(1) + '%' : '-' }}
            </template>
          </n-statistic>
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="错题数" :value="overview?.wrongCount || 0" />
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 最近活动（仅登录用户） -->
    <n-card title="最近活动" v-if="authStore.isAuthenticated">
      <n-empty v-if="recentActivities.length === 0" description="暂无活动记录" />
      <n-list v-else>
        <n-list-item v-for="activity in recentActivities" :key="activity.id">
          <template #prefix>
            <n-tag :type="activity.type === 'practice' ? 'success' : 'info'" size="small">
              {{ activity.type === 'practice' ? '练习' : '考试' }}
            </n-tag>
          </template>
          <n-thing :title="activity.title" :description="activity.time" />
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getStatisticsOverview } from '@/api/statistics'
import { getBankList } from '@/api/bank'
import { getPaperList } from '@/api/paper'
import { Library, DocumentText, GameController, CloseCircle, Time, Search } from '@vicons/ionicons5'
import type { OverviewResponse } from '@/api/statistics'
import type { DataTableColumn } from 'naive-ui'
import dayjs from 'dayjs'

interface QuickEntry {
  title: string
  path: string
  icon: any
  color: string
}

const router = useRouter()
const authStore = useAuthStore()

const overview = ref<OverviewResponse | null>(null)
const recentActivities = ref<any[]>([])

// 游客可见的公开数据
const loadingBanks = ref(false)
const loadingPapers = ref(false)
const publicBanks = ref<any[]>([])
const publicPapers = ref<any[]>([])

const publicBankColumns: DataTableColumn<any>[] = [
  { title: '名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '题目数', key: 'questionCount', width: 70, align: 'center' },
  {
    title: '操作', key: 'actions', width: 70,
    render(row) {
      return h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/banks/${row.id}`) }, '查看')
    }
  }
]

const publicPaperColumns: DataTableColumn<any>[] = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '题目数', key: 'questionCount', width: 70, align: 'center' },
  { title: '总分', key: 'totalScore', width: 60, align: 'center' },
  {
    title: '操作', key: 'actions', width: 70,
    render(row) {
      return h('a', { class: 'text-primary cursor-pointer', onClick: () => router.push(`/papers/${row.id}`) }, '查看')
    }
  }
]

// 游客只能看到可匿名使用的入口；需登录的功能（练习/错题本/记录）仅登录后展示
const quickEntries = computed<QuickEntry[]>(() => {
  if (!authStore.isAuthenticated) {
    return [
      { title: '题库浏览', path: '/banks', icon: Library, color: '#1890ff' },
      { title: '试卷浏览', path: '/papers', icon: DocumentText, color: '#52c41a' },
      { title: '搜索', path: '/search', icon: Search, color: '#13c2c2' }
    ]
  }
  return [
    { title: '题库管理', path: '/banks', icon: Library, color: '#1890ff' },
    { title: '试卷管理', path: '/papers', icon: DocumentText, color: '#52c41a' },
    { title: '随机练习', path: '/practice', icon: GameController, color: '#faad14' },
    { title: '错题本', path: '/wrong-questions', icon: CloseCircle, color: '#ff4d4f' },
    { title: '做题记录', path: '/records', icon: Time, color: '#722ed1' }
  ]
})

async function fetchPublicBanks() {
  loadingBanks.value = true
  try {
    const res = await getBankList({ page: 1, size: 10, isPublic: true, isOfficial: undefined })
    publicBanks.value = (res.data.records || []).slice(0, 5)
  } catch {
    // ignore
  } finally {
    loadingBanks.value = false
  }
}

async function fetchPublicPapers() {
  loadingPapers.value = true
  try {
    const res = await getPaperList({ page: 1, size: 10, shareType: 'PUBLIC', status: 'PUBLISHED' })
    publicPapers.value = (res.data.records || []).slice(0, 5)
  } catch {
    // ignore
  } finally {
    loadingPapers.value = false
  }
}

async function fetchOverview() {
  try {
    const res = await getStatisticsOverview()
    overview.value = res.data
  } catch {
    // ignore
  }
}

onMounted(() => {
  // 游客加载公开数据
  if (!authStore.isAuthenticated) {
    fetchPublicBanks()
    fetchPublicPapers()
  } else {
    fetchOverview()
  }
})
</script>