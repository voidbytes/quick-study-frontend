<template>
  <!-- 选项（客观题）—— 统一默认/选中/正确/错误态 -->
  <div
    class="q-option"
    :class="containerClass"
    @click="!disabled && emit('select')"
  >
    <div class="q-option-marker" :class="markerClass">
      <span>{{ marker }}</span>
    </div>
    <div class="q-option-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 选项序号字母：A / B / C ... */
    marker: string
    selected?: boolean
    /** 揭晓答案后：是否正确答案 */
    correct?: boolean | null
    /** 揭晓答案后：用户选中但错误 */
    wrong?: boolean | null
    disabled?: boolean
  }>(),
  { selected: false, correct: null, wrong: null, disabled: false }
)

const emit = defineEmits<{ select: [] }>()

const containerClass = computed(() => {
  if (props.correct === true) return 'is-correct'
  if (props.wrong === true) return 'is-wrong'
  if (props.selected) return 'is-selected'
  return props.disabled ? 'is-disabled' : 'is-idle'
})

const markerClass = computed(() => {
  if (props.correct === true) return 'marker-correct'
  if (props.wrong === true) return 'marker-wrong'
  if (props.selected) return 'marker-selected'
  return 'marker-idle'
})
</script>

<style scoped>
.q-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-default);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: var(--space-3);
}
.q-option-content {
  flex: 1;
  min-width: 0;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  padding-top: 2px;
  color: var(--text-primary);
}
.is-idle:hover {
  border-color: var(--color-primary-300);
}
.is-selected {
  border-color: var(--color-primary-500);
  background: var(--bg-selected);
}
.is-correct {
  border-color: var(--color-success-500);
  background: var(--color-success-50);
}
.is-wrong {
  border-color: var(--color-error-500);
  background: var(--color-error-50);
}
.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.q-option-marker {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  flex-shrink: 0;
  border: 2px solid var(--border-strong);
  color: var(--text-secondary);
  transition: all var(--transition-base);
}
.marker-selected,
.marker-correct,
.marker-wrong {
  color: #fff;
}
.marker-selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-500);
}
.marker-correct {
  border-color: var(--color-success-500);
  background: var(--color-success-500);
}
.marker-wrong {
  border-color: var(--color-error-500);
  background: var(--color-error-500);
}
</style>
