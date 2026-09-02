<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="auth-logo-icon">QS</div>
        <div class="auth-title">题库与组卷练习系统</div>
        <div class="auth-subtitle">快学 · 每一道题都算数</div>
      </div>

      <!-- 登录 / 注册 Tab -->
      <div class="auth-tabs mb-6">
        <div
          class="auth-tab"
          :class="{ active: isLogin }"
          @click="go('/login')"
        >登录</div>
        <div
          class="auth-tab"
          :class="{ active: !isLogin }"
          @click="go('/register')"
        >注册</div>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isLogin = computed(() => route.path.startsWith('/login'))

function go(path: string) {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-brand);
  padding: var(--space-6);
}
.auth-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 420px;
  padding: var(--space-8);
}
.auth-logo {
  text-align: center;
  margin-bottom: var(--space-6);
}
.auth-logo-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--gradient-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-bold);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-3);
}
.auth-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}
.auth-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.auth-tabs {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
  gap: var(--space-1);
}
.auth-tab {
  flex: 1;
  text-align: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}
.auth-tab.active {
  background: var(--bg-card);
  color: var(--text-brand);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
}
</style>
