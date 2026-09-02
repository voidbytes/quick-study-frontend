<template>
  <div class="page-header">
    <div class="ph-left">
      <n-button
        v-if="showBack"
        quaternary
        circle
        size="small"
        class="ph-back"
        @click="router.back()"
      >
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
      </n-button>
      <div>
        <h1 class="ph-title">{{ title }}</h1>
        <p v-if="subtitle" class="ph-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="ph-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowBackOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showBack?: boolean
  }>(),
  { subtitle: '', showBack: false }
)

const router = useRouter()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
  flex-wrap: wrap;
}
.ph-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.ph-back {
  margin-right: var(--space-1);
}
.ph-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.25;
  margin: 0;
}
.ph-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 4px 0 0;
}
.ph-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}
</style>
