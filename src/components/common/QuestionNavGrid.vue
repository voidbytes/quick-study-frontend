<template>
  <div class="q-nav-grid">
    <button
      v-for="(item, index) in items"
      :key="index"
      type="button"
      class="q-nav-cell"
      :class="cellClass(item)"
      :disabled="disabled"
      @click="$emit('select', index)"
    >
      {{ index + 1 }}
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 答题导航网格 —— 展示题号状态。
 * status: unanswered(白) / answered(绿) / current(蓝实心) / review(橙实心/标记)
 */
import type { QuestionNavStatus } from './questionNav'

withDefaults(
  defineProps<{
    items: QuestionNavStatus[]
    disabled?: boolean
  }>(),
  { disabled: false }
)

defineEmits<{ select: [index: number] }>()

function cellClass(status: QuestionNavStatus): string {
  switch (status) {
    case 'current':
      return 'is-current'
    case 'answered':
      return 'is-answered'
    case 'review':
      return 'is-review'
    default:
      return 'is-unanswered'
  }
}
</script>

<style scoped>
.q-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: var(--space-2);
}
.q-nav-cell {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.q-nav-cell:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.is-unanswered {
  background: var(--bg-card);
  border-color: var(--border-default);
  color: var(--text-tertiary);
}
.is-unanswered:hover {
  border-color: var(--color-primary-300);
  color: var(--text-brand);
}
.is-answered {
  background: var(--color-success-50);
  border-color: var(--color-success-500);
  color: var(--color-success-600);
}
.is-current {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: #fff;
}
.is-review {
  background: var(--color-warning-500);
  border-color: var(--color-warning-500);
  color: #fff;
}
</style>
