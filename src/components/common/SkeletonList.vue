<template>
  <div class="skeleton-list" :class="`grid-cols-${cols}`">
    <div v-for="i in count" :key="i" class="sk-item">
      <n-skeleton text :repeat="1" class="sk-line-head" />
      <n-skeleton text :repeat="3" />
      <n-skeleton text style="width: 40%" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 骨架卡片数量 */
    count?: number
    /** 网格列数（默认 3，列表场景传 1） */
    cols?: number
  }>(),
  { count: 3, cols: 3 }
)
</script>

<style scoped>
.skeleton-list {
  display: grid;
  gap: var(--space-4);
}
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3 { grid-template-columns: 1fr; }
}
.sk-item {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}
.sk-line-head {
  margin-bottom: var(--space-4);
}
</style>
