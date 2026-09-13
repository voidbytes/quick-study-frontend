<template>
  <div class="nf-wrap">
    <div class="nf-code">404</div>
    <h1 class="nf-title">页面走丢了</h1>
    <p class="nf-desc">你访问的页面不存在，或已被移除。</p>
    <div class="nf-actions">
      <n-button type="primary" @click="router.push('/')">回首页</n-button>
      <n-button quaternary @click="router.back()">返回上一页</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.nf-wrap {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
}
.nf-code {
  font-size: 96px;
  font-weight: var(--font-bold);
  line-height: 1;
  color: var(--color-primary-300);
  letter-spacing: 4px;
  margin-bottom: var(--space-4);
}
.nf-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2);
}
.nf-desc {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  margin: 0 0 var(--space-6);
}
.nf-actions {
  display: flex;
  gap: var(--space-3);
}
</style>
