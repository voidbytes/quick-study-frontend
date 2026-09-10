<template>
  <div class="app-shell">
    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuVisible"
      class="fixed inset-0 bg-neutral-950/50 lg:hidden"
      style="z-index: var(--z-overlay)"
      @click="mobileMenuVisible = false"
    />

    <!-- 侧边栏 -->
    <aside
      class="sidebar"
      :class="[mobileMenuVisible ? 'mobile-open' : '', collapsed ? 'sidebar-collapsed' : '']"
    >

      <!-- Logo（收起时点击 Logo 也可展开） -->
      <div
        class="h-header flex items-center gap-3 border-b border-neutral-200"
        :class="collapsed ? 'flex-col justify-center gap-2 px-2' : 'px-5'"
      >
        <div
          class="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          :class="collapsed ? 'cursor-pointer hover:opacity-80' : ''"
          :title="collapsed ? '展开菜单' : undefined"
          @click="collapsed && toggleCollapsed()"
        >
          爱
        </div>
        <span v-if="!collapsed" class="text-base font-bold text-neutral-900 whitespace-nowrap">
          爱刷题
        </span>
        <div
          v-if="!collapsed"
          class="ml-auto cursor-pointer text-neutral-400 hover:text-neutral-900 hidden lg:flex"
          title="收起菜单"
          @click="toggleCollapsed()"
        >
          <n-icon :size="16"><ChevronBackOutline /></n-icon>
        </div>
      </div>
      <!-- 收起态：常驻展开按钮（图标栏模式下不会被裁剪） -->
      <div v-if="collapsed" class="hidden lg:flex justify-center py-2 border-b border-neutral-200">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
          title="展开菜单"
          @click="toggleCollapsed()"
        >
          <n-icon :size="16"><ChevronForwardOutline /></n-icon>
        </div>
      </div>

      <!-- 导航 -->
      <nav class="flex-1 p-3 overflow-y-auto">
        <template v-for="(group, gi) in menuGroups" :key="gi">
          <div
            v-if="group.label && !collapsed"
            class="text-xs font-semibold text-tertiary uppercase tracking-wider px-3 py-2 mt-1"
          >
            {{ group.label }}
          </div>
          <div
            v-for="item in group.items"
            :key="item.key"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5"
            :class="[(collapsed ? 'justify-center px-0' : ''), activeMenu === item.key
              ? 'bg-primary-50 text-primary-600 font-semibold'
              : 'text-neutral-600 font-medium hover:bg-neutral-100 hover:text-neutral-900']"
            :title="collapsed ? item.label : undefined"
            @click="handleMenuSelect(item.key)"
          >
            <n-icon :size="20" class="flex-shrink-0">
              <component :is="item.icon" />
            </n-icon>
            <span v-if="!collapsed" class="text-sm">{{ item.label }}</span>
          </div>
        </template>
      </nav>

      <!-- 底部：退出登录 -->
      <div v-if="authStore.isAuthenticated" class="p-3 border-t border-neutral-200">
        <div
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          :class="collapsed ? 'justify-center px-0' : ''"
          :title="collapsed ? '退出登录' : undefined"
          @click="handleLogout"
        >
          <n-icon :size="20"><LogOutOutline /></n-icon>
          <span v-if="!collapsed" class="text-sm">退出登录</span>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-area">
      <!-- 顶部栏 -->
      <header class="app-header">
        <div class="app-header-left">
          <!-- 移动端汉堡菜单 -->
          <button class="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:bg-neutral-100" @click="mobileMenuVisible = true">
            <n-icon :size="20"><MenuOutline /></n-icon>
          </button>
          <!-- 面包屑 / 当前页标题 -->
          <div class="breadcrumb">
            <span class="breadcrumb-current">{{ currentPageTitle }}</span>
          </div>
        </div>

        <div class="app-header-right">
          <!-- 全局搜索（桌面） -->
          <div class="hidden md:block header-search">
            <n-input
              v-model:value="headerKeyword"
              placeholder="搜索题目 / 题库 / 试卷"
              size="small"
              clearable
              @keyup.enter="handleHeaderSearch"
            >
              <template #prefix>
                <n-icon :component="SearchOutline" />
              </template>
            </n-input>
          </div>

          <!-- 通知 -->
          <n-badge :value="unreadCount" :max="99">
            <button class="flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:bg-neutral-100" @click="router.push('/notifications')">
              <n-icon :size="20"><NotificationsOutline /></n-icon>
            </button>
          </n-badge>

          <!-- 用户 / 登录 -->
          <template v-if="authStore.isAuthenticated">
            <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
              <div class="flex items-center gap-2 cursor-pointer select-none">
                <div
                  class="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                >
                  {{ avatarText }}
                </div>
                <span class="hidden sm:inline text-sm text-neutral-700">
                  {{ authStore.userInfo?.nickname || authStore.userInfo?.username }}
                </span>
              </div>
            </n-dropdown>
          </template>
          <template v-else>
            <n-button size="small" type="primary" @click="uiStore.openLoginModal()">登录</n-button>
          </template>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="app-content px-4 lg:px-6 py-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useMessage } from 'naive-ui'
import * as notificationApi from '@/api/notification'
import {
  HomeOutline,
  LibraryOutline,
  DocumentTextOutline,
  FileTrayFullOutline,
  GameControllerOutline,
  CodeSlashOutline,
  CloseCircleOutline,
  TimeOutline,
  SearchOutline,
  BarChartOutline,
  NotificationsOutline,
  PeopleOutline,
  CheckmarkDoneOutline,
  LogOutOutline,
  MenuOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  StarOutline,
  BookOutline,
  TicketOutline,
  SettingsOutline
} from '@vicons/ionicons5'

interface MenuItem {
  label: string
  key: string
  icon: any
}
interface MenuGroup {
  label?: string
  items: MenuItem[]
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()
const message = useMessage()

const COLLAPSED_KEY = 'sidebar_collapsed'
const collapsed = ref(localStorage.getItem(COLLAPSED_KEY) === '1')

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  localStorage.setItem(COLLAPSED_KEY, collapsed.value ? '1' : '0')
}
const mobileMenuVisible = ref(false)
const unreadCount = ref(0)
const headerKeyword = ref('')

const avatarText = computed(() => {
  const name = authStore.userInfo?.nickname || authStore.userInfo?.username || '?'
  return name.charAt(0).toUpperCase()
})

const menuGroups = computed<MenuGroup[]>(() => {
  const groups: MenuGroup[] = [
    {
      items: [
        { label: '首页', key: '/', icon: HomeOutline },
        { label: '题库', key: '/banks', icon: LibraryOutline },
        { label: '题目', key: '/questions', icon: DocumentTextOutline },
        { label: '试卷', key: '/papers', icon: FileTrayFullOutline }
      ]
    }
  ]

  if (authStore.isAuthenticated) {
    groups.push({
      label: '学习中心',
      items: [
        { label: '练习', key: '/practice', icon: GameControllerOutline },
        { label: '代码运行台', key: '/playground', icon: CodeSlashOutline },
        { label: '错题本', key: '/wrong-questions', icon: CloseCircleOutline },
        { label: '收藏题目', key: '/favorites', icon: StarOutline },
        { label: '做题记录', key: '/records', icon: TimeOutline },
        { label: '我的笔记', key: '/notes', icon: BookOutline },
        { label: '考试记录', key: '/exam-records', icon: DocumentTextOutline },
        { label: '统计', key: '/statistics', icon: BarChartOutline },
        { label: '通知', key: '/notifications', icon: NotificationsOutline },
        { label: '搜索', key: '/search', icon: SearchOutline }
      ]
    })
  } else {
    groups.push({
      items: [{ label: '搜索', key: '/search', icon: SearchOutline }]
    })
  }

  if (authStore.isAdmin) {
    groups.push({
      label: '管理',
      items: [
        { label: '用户管理', key: '/admin/users', icon: PeopleOutline },
        { label: '题目管理', key: '/questions/manage', icon: SettingsOutline },
        { label: '审核列表', key: '/admin/reviews', icon: CheckmarkDoneOutline },
        { label: '邀请码', key: '/admin/invite-codes', icon: TicketOutline }
      ]
    })
  }
  return groups
})

const userMenuOptions = computed(() => [
  { label: '个人中心', key: 'profile' },
  { label: '退出登录', key: 'logout' }
])

// 由侧边栏 key（路由前缀）到标题的映射
const MENU_TITLES: Record<string, string> = {
  '/': '首页',
  '/banks': '题库',
  '/questions/manage': '题目管理',
  '/questions': '题目',
  '/papers': '试卷',
  '/practice': '练习',
  '/playground': '代码运行台',
  '/wrong-questions': '错题本',
  '/favorites': '收藏题目',
  '/records': '做题记录',
  '/notes': '我的笔记',
  '/statistics': '统计',
  '/notifications': '通知',
  '/search': '搜索',
  '/admin/users': '用户管理',
  '/admin/reviews': '审核列表',
  '/admin/invite-codes': '邀请码',
  '/grading': '批改',
  '/profile': '个人中心'
}

const activeMenu = computed(() => {
  const path = route.path
  const keys = Object.keys(MENU_TITLES).sort((a, b) => b.length - a.length)
  const matched = keys.find(k => path.startsWith(k))
  return matched || '/'
})

const currentPageTitle = computed(() => MENU_TITLES[activeMenu.value] || '首页')

function handleMenuSelect(key: string) {
  router.push(key)
  mobileMenuVisible.value = false
}

function handleUserMenuSelect(key: string) {
  if (key === 'profile') {
    router.push('/profile')
  } else if (key === 'logout') {
    handleLogout()
  }
}

function handleHeaderSearch() {
  const kw = headerKeyword.value.trim()
  if (kw) {
    router.push({ path: '/search', query: { keyword: kw } })
  }
}

function handleLogout() {
  authStore.logout()
  message.success('已退出登录')
  // 留在当前页并打开全局登录模态框（不再路由跳走）
  uiStore.openLoginModal()
}

async function fetchUnreadCount() {
  if (!authStore.isAuthenticated) return
  try {
    const res = await notificationApi.getUnreadCount()
    unreadCount.value = res.data.count
  } catch {
    // 忽略错误
  }
}

onMounted(fetchUnreadCount)
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  transition: width var(--transition-base);
  overflow: hidden;
}
.sidebar.mobile-open {
  transform: none;
}
@media (max-width: 1023px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: var(--z-sticky);
    transform: translateX(-100%);
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
@media (min-width: 1024px) {
  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
  }
  .sidebar.sidebar-collapsed {
    width: var(--sidebar-collapsed-width);
  }
}
.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-header {
  height: var(--header-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4) 0 var(--space-4);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}
.app-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.app-header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.breadcrumb {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}
.breadcrumb-current {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
.header-search {
  width: 240px;
}
.app-content {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
}
</style>
