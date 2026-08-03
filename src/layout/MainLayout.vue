<template>
  <n-layout position="absolute" has-sider>
    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuVisible"
      class="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
      @click="mobileMenuVisible = false"
    />

    <!-- 侧边栏 -->
    <n-layout-sider
      :width="240"
      :native-scrollbar="false"
      :collapsed="collapsed"
      :collapsed-width="64"
      :show-trigger="'bar'"
      @collapse="collapsed = true"
      @expand="collapsed = false"
      :class="[
        'fixed left-0 top-0 h-full z-20 lg:relative',
        mobileMenuVisible ? 'block' : 'hidden lg:block'
      ]"
      bordered
    >
      <div class="flex items-center justify-center h-16 border-b border-gray-200">
        <n-gradient-text :size="collapsed ? 20 : 24" type="primary">
          {{ collapsed ? 'QS' : 'Quick Study' }}
        </n-gradient-text>
      </div>

      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :value="activeMenu"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />

      <!-- 退出登录按钮 -->
      <div class="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-2">
        <n-button
          v-if="authStore.isAuthenticated"
          quaternary
          long
          class="justify-start"
          @click="handleLogout"
        >
          <template #icon>
            <n-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></n-icon>
          </template>
          <span class="hidden sm:inline text-sm">退出登录</span>
        </n-button>
      </div>
    </n-layout-sider>

    <!-- 主内容 -->
    <n-layout>
      <!-- 顶部导航栏 -->
      <n-layout-header
        bordered
        class="h-16 flex items-center justify-between px-4 lg:px-8"
        :class="{ 'z-30 relative': mobileMenuVisible }"
      >
        <div class="flex items-center gap-4">
          <n-button
            quaternary
            class="lg:hidden"
            @click="mobileMenuVisible = true"
          >
            <template #icon>
              <n-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg></n-icon>
            </template>
          </n-button>
          <n-breadcrumb>
            <n-breadcrumb-item>{{ currentPageTitle }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>

        <div class="flex items-center gap-4">
          <!-- 通知 -->
          <n-badge :value="unreadCount" :max="99">
            <n-button quaternary @click="router.push('/notifications')">
              <template #icon>
                <n-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></n-icon>
              </template>
            </n-button>
          </n-badge>

          <!-- 用户信息 / 登录按钮 -->
          <template v-if="authStore.isAuthenticated">
            <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
              <div class="flex items-center gap-2 cursor-pointer">
                <n-avatar
                  :src="authStore.userInfo?.avatar"
                  round
                  size="small"
                />
                <span class="hidden sm:inline text-sm">{{ authStore.userInfo?.nickname || authStore.userInfo?.username }}</span>
              </div>
            </n-dropdown>
          </template>
          <template v-else>
            <n-button quaternary @click="router.push('/login')">
              登录
            </n-button>
          </template>
        </div>
      </n-layout-header>

      <!-- 内容区 -->
      <n-layout-content
        :native-scrollbar="false"
        class="p-4 lg:p-8"
        style="min-height: calc(100vh - 4rem);"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessage, type MenuOption } from 'naive-ui'
import * as notificationApi from '@/api/notification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const message = useMessage()

const collapsed = ref(false)
const mobileMenuVisible = ref(false)
const unreadCount = ref(0)

const menuOptions = computed<MenuOption[]>(() => {
  const items: MenuOption[] = [
    { label: '首页', key: '/' },
    { label: '题库', key: '/banks' },
    { label: '题目', key: '/questions' },
    { label: '试卷', key: '/papers' }
  ]

  // 登录用户可见的功能
  if (authStore.isAuthenticated) {
    items.push(
      { label: '练习', key: '/practice' },
      { label: '错题本', key: '/wrong-questions' },
      { label: '做题记录', key: '/records' },
      { label: '搜索', key: '/search' },
      { label: '统计', key: '/statistics' },
      { label: '通知', key: '/notifications' }
    )
  } else {
    // 游客可见
    items.push({ label: '搜索', key: '/search' })
  }

  // 管理员可见
  if (authStore.isAdmin) {
    items.push(
      { label: '用户管理', key: '/admin/users' },
      { label: '审核列表', key: '/admin/reviews' }
    )
  }

  return items
})

const userMenuOptions = computed(() => [
  { label: '个人中心', key: 'profile' },
  { label: '退出登录', key: 'logout' }
])

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/banks')) return '/banks'
  if (path.startsWith('/questions')) return '/questions'
  if (path.startsWith('/papers')) return '/papers'
  if (path.startsWith('/practice')) return '/practice'
  if (path.startsWith('/wrong-questions')) return '/wrong-questions'
  if (path.startsWith('/records')) return '/records'
  if (path.startsWith('/search')) return '/search'
  if (path.startsWith('/statistics')) return '/statistics'
  if (path.startsWith('/notifications')) return '/notifications'
  if (path.startsWith('/admin')) return '/admin/users'
  return '/'
})

const currentPageTitle = computed(() => {
  const item = menuOptions.value.find(m => m.key === activeMenu.value)
  return (item?.label as string) || '首页'
})

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

function handleLogout() {
  authStore.logout()
  message.success('已退出登录')
  router.push('/login')
}

async function fetchUnreadCount() {
  try {
    const res = await notificationApi.getUnreadCount()
    unreadCount.value = res.data.count
  } catch {
    // 忽略错误
  }
}

onMounted(() => {
  // 只有登录用户才获取未读通知数
  if (authStore.isAuthenticated) {
    fetchUnreadCount()
  }
})
</script>