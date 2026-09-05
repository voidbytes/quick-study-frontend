<template>
  <div>
    <!-- 欢迎横幅（品牌渐变） -->
    <div class="welcome-banner mb-6">
      <h1 class="wb-title">
        {{
          authStore.isAuthenticated
            ? `欢迎回来，${authStore.userInfo?.nickname || authStore.userInfo?.username || '用户'}`
            : '欢迎光临'
        }}
      </h1>
      <p class="wb-subtitle">
        {{ authStore.isAuthenticated ? '今天也要加油学习哦！' : '登录后即可开始练习和考试' }}
      </p>
    </div>

    <!-- 快速入口卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <div
        v-for="entry in quickEntries"
        :key="entry.title"
        class="flex flex-col items-center gap-3 px-4 py-5 bg-white border border-neutral-200 rounded-lg cursor-pointer transition-all hover:border-primary-300 hover:shadow-sm hover:-translate-y-0.5"
        @click="router.push(entry.path)"
      >
        <div
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :style="{ background: entry.bgColor }"
        >
          <n-icon :size="24" :color="entry.iconColor">
            <component :is="entry.icon" />
          </n-icon>
        </div>
        <span class="text-sm font-medium text-neutral-900">{{ entry.title }}</span>
      </div>
    </div>

    <!-- 游客：公开题库 -->
    <div v-if="!authStore.isAuthenticated" class="card-section mb-6">
      <div class="card-head">
        <span class="card-title">公开题库</span>
        <span class="card-more" @click="router.push('/banks')">查看全部</span>
      </div>
      <SkeletonList v-if="loadingBanks" :count="3" :cols="1" />
      <EmptyState v-else-if="publicBanks.length === 0" description="暂无公开题库" :icon="LibraryOutline" />
      <div v-else>
        <div v-for="bank in publicBanks" :key="bank.id" class="list-row" @click="router.push(`/banks/${bank.id}`)">
          <div class="flex-1 min-w-0">
            <div class="list-row-title">{{ bank.name }}</div>
            <div class="list-row-desc">{{ bank.description || '暂无描述' }}</div>
          </div>
          <n-tag size="small" type="info">{{ bank.questionCount }} 题</n-tag>
        </div>
      </div>
    </div>

    <!-- 游客：公开试卷 -->
    <div v-if="!authStore.isAuthenticated" class="card-section mb-6">
      <div class="card-head">
        <span class="card-title">公开试卷</span>
        <span class="card-more" @click="router.push('/papers')">查看全部</span>
      </div>
      <SkeletonList v-if="loadingPapers" :count="3" :cols="1" />
      <EmptyState v-else-if="publicPapers.length === 0" description="暂无公开试卷" :icon="DocumentTextOutline" />
      <div v-else>
        <div v-for="paper in publicPapers" :key="paper.id" class="list-row" @click="router.push(`/papers/${paper.id}`)">
          <div class="flex-1 min-w-0">
            <div class="list-row-title">{{ paper.title }}</div>
            <div class="list-row-desc">{{ paper.questionCount }} 题 · 总分 {{ paper.totalScore }}</div>
          </div>
          <n-button text type="primary" @click.stop="router.push(`/papers/${paper.id}`)">查看</n-button>
        </div>
      </div>
    </div>

    <!-- 登录用户：统计概览 -->
    <div v-if="authStore.isAuthenticated" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="练习场次" :value="overview?.totalPractices || 0" />
      <StatCard label="总题数" :value="overview?.totalQuestions || 0" />
      <StatCard
        label="正确率"
        :value="overview?.correctRate != null ? overview.correctRate.toFixed(1) + '%' : '-'"
        tone="success"
      />
      <StatCard label="错题数" :value="overview?.wrongCount || 0" tone="error" />
    </div>

    <!-- 登录用户：最近活动 -->
    <div v-if="authStore.isAuthenticated" class="card-section">
      <div class="card-head">
        <span class="card-title">最近活动</span>
        <span class="card-more" @click="router.push('/records')">全部记录</span>
      </div>
      <!-- 空态：给出下一步行动引导，而非孤立链接 -->
      <EmptyState
        v-if="!loadingActivities && recentActivities.length === 0"
        title="暂无活动记录"
        description="去刷几道题或参加一场考试，这里会展示你的最新动态"
        :icon="TimeOutline"
      >
        <template #action>
          <div class="flex items-center gap-3">
            <n-button size="small" @click="router.push('/practice')">去练习</n-button>
            <n-button size="small" type="primary" @click="router.push('/papers')">去考试</n-button>
          </div>
        </template>
      </EmptyState>
      <div v-else>
        <div
          v-for="activity in recentActivities"
          :key="activity.key"
          class="list-row"
          @click="router.push(activity.link)"
        >
          <span
            class="text-xs font-semibold px-2 py-1 rounded-sm flex-shrink-0"
            :class="activity.kind === 'practice' ? 'bg-success-50 text-success-600' : 'bg-info-50 text-info-600'"
          >
            {{ activity.kind === 'practice' ? '练习' : '考试' }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="list-row-title">{{ activity.title }}</div>
            <div class="list-row-desc">{{ activity.time }}</div>
          </div>
          <n-icon :size="16" class="text-neutral-300 flex-shrink-0">
            <ChevronForwardOutline />
          </n-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getStatisticsOverview } from '@/api/statistics'
import type { OverviewStats } from '@/types'
import { getBankList } from '@/api/bank'
import { getPaperList } from '@/api/paper'
import { getRecordList } from '@/api/record'
import { getMyExamSessions } from '@/api/exam'
import dayjs from 'dayjs'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import {
  LibraryOutline,
  DocumentTextOutline,
  GameControllerOutline,
  CloseCircleOutline,
  TimeOutline,
  SearchOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'

interface QuickEntry {
  title: string
  path: string
  icon: any
  bgColor: string
  iconColor: string
}

/** 最近活动条目：练习（题目维度）与考试（会话维度）归一化后的展示模型 */
interface RecentActivity {
  key: string
  kind: 'practice' | 'exam'
  title: string
  time: string
  /** 排序时间戳（毫秒） */
  ts: number
  link: string
}

const router = useRouter()
const authStore = useAuthStore()

const overview = ref<OverviewStats | null>(null)
const recentActivities = ref<RecentActivity[]>([])
const loadingActivities = ref(false)
const loadingBanks = ref(false)
const loadingPapers = ref(false)
const publicBanks = ref<any[]>([])
const publicPapers = ref<any[]>([])

const quickEntries = computed<QuickEntry[]>(() => {
  if (!authStore.isAuthenticated) {
    return [
      { title: '题库浏览', path: '/banks', icon: LibraryOutline, bgColor: '#EEF0FF', iconColor: '#5B5FE9' },
      { title: '试卷浏览', path: '/papers', icon: DocumentTextOutline, bgColor: '#E8F9F0', iconColor: '#22B570' },
      { title: '搜索', path: '/search', icon: SearchOutline, bgColor: '#E8F1FF', iconColor: '#3B8BFF' }
    ]
  }
  return [
    { title: '题库管理', path: '/banks', icon: LibraryOutline, bgColor: '#EEF0FF', iconColor: '#5B5FE9' },
    { title: '试卷管理', path: '/papers', icon: DocumentTextOutline, bgColor: '#E8F9F0', iconColor: '#22B570' },
    { title: '随机练习', path: '/practice', icon: GameControllerOutline, bgColor: '#FFF8E6', iconColor: '#FFA42B' },
    { title: '错题本', path: '/wrong-questions', icon: CloseCircleOutline, bgColor: '#FFEFEC', iconColor: '#F0503C' },
    { title: '做题记录', path: '/records', icon: TimeOutline, bgColor: '#EEF0FF', iconColor: '#6E75F5' }
  ]
})

function stripHtml(html?: string | null): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

/** 快照 JSON 里提取纯文本题干（与记录页口径一致） */
function snapshotTitle(questionSnapshot?: string | null): string {
  try {
    const obj: unknown = questionSnapshot ? JSON.parse(questionSnapshot) : null
    const content = obj && typeof obj === 'object' ? (obj as Record<string, unknown>).content : null
    const text = stripHtml(typeof content === 'string' ? content : '')
    return text || '练习了一道题'
  } catch {
    return '练习了一道题'
  }
}

/**
 * 拉取最近活动：练习记录（题目维度）+ 考试会话，按时间倒序合并取前 6 条。
 * 每条都带跳转目标：练习 → 原题；考试 → 成绩页（未提交则继续作答）。
 */
async function fetchRecentActivities() {
  loadingActivities.value = true
  try {
    const [recordRes, examRes] = await Promise.allSettled([
      getRecordList({ page: 1, size: 10 }),
      getMyExamSessions({ page: 1, size: 10 })
    ])

    const items: RecentActivity[] = []

    if (recordRes.status === 'fulfilled') {
      for (const r of recordRes.value.data.records || []) {
        const ts = r.createdAt ? dayjs(r.createdAt).valueOf() : 0
        items.push({
          key: `p-${r.id}`,
          kind: 'practice',
          title: snapshotTitle(r.questionSnapshot),
          time: r.createdAt ? dayjs(r.createdAt).format('MM-DD HH:mm') : '',
          ts,
          link: r.bankId && r.questionId ? `/banks/${r.bankId}/questions/${r.questionId}` : '/records'
        })
      }
    }

    if (examRes.status === 'fulfilled') {
      for (const s of examRes.value.data.records || []) {
        // 未完成（进行中）的考试不属于「活动记录」，不展示
        if (s.status === 'IN_PROGRESS') continue
        const time = s.submittedAt || s.startTime || null
        const ts = time ? dayjs(time).valueOf() : 0
        const scoreSuffix = s.totalScore != null ? ` · ${s.totalScore} 分` : ''
        items.push({
          key: `e-${s.id}`,
          kind: 'exam',
          title: `${s.paperTitle || '未命名试卷'}${scoreSuffix}`,
          time: time ? dayjs(time).format('MM-DD HH:mm') : '',
          ts,
          link: s.status === 'IN_PROGRESS' ? `/papers/${s.paperId}/exam` : `/exam/sessions/${s.id}/result`
        })
      }
    }

    recentActivities.value = items.sort((a, b) => b.ts - a.ts).slice(0, 6)
  } finally {
    loadingActivities.value = false
  }
}

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
  if (!authStore.isAuthenticated) {
    fetchPublicBanks()
    fetchPublicPapers()
  } else {
    fetchOverview()
    fetchRecentActivities()
  }
})
</script>

<style scoped>
.welcome-banner {
  background: var(--gradient-brand);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  color: #fff;
  position: relative;
  overflow: hidden;
}
.wb-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-1);
}
.wb-subtitle {
  font-size: var(--text-base);
  opacity: 0.9;
  margin: 0;
}
.card-section {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--border-default);
}
.card-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}
.card-more {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-brand);
  cursor: pointer;
  transition: opacity 0.15s;
}
.card-more:hover {
  opacity: 0.75;
}
.list-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-bottom: 1px solid var(--border-default);
  cursor: pointer;
  transition: background var(--transition-base);
}
.list-row:last-child {
  border-bottom: none;
}
.list-row:hover {
  background: var(--bg-subtle);
}
.list-row-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}
.list-row-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: 2px;
}
</style>
