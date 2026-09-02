<template>
  <div class="empty-state">
    <n-icon :size="56" class="es-icon">
      <component :is="icon" />
    </n-icon>
    <h3 class="es-title">{{ title }}</h3>
    <p v-if="description" class="es-desc">{{ description }}</p>
    <div class="es-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CubeOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    icon?: any
  }>(),
  { title: '暂无数据', description: '', icon: CubeOutline }
)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
}
.es-icon {
  color: var(--color-neutral-300);
  margin-bottom: var(--space-4);
}
.es-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin: 0 0 var(--space-1);
}
.es-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}
.es-action {
  margin-top: var(--space-5);
}
</style>
