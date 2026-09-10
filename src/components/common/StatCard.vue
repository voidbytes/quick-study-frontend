<template>
  <div class="stat-card">
    <div v-if="$slots.actions" class="stat-actions">
      <slot name="actions" />
    </div>
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value" :style="{ color: valueColor }">
      <slot>{{ value }}</slot>
    </div>
    <div v-if="$slots.suffix" class="stat-suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value?: string | number
    /** 数值颜色主题：default 主文字 / brand 品牌色 / success / error / warning */
    tone?: 'default' | 'brand' | 'success' | 'error' | 'warning'
  }>(),
  { value: undefined, tone: 'default' }
)

const TONE_COLORS: Record<string, string> = {
  default: 'var(--text-primary)',
  brand: 'var(--text-brand)',
  success: 'var(--color-success-600)',
  error: 'var(--color-error-600)',
  warning: 'var(--color-warning-600)'
}
const valueColor = computed(() => TONE_COLORS[props.tone] || TONE_COLORS.default)
</script>

<style scoped>
.stat-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}
.stat-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}
.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: 1.2;
}
.stat-actions {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
}
.stat-suffix {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}
</style>
