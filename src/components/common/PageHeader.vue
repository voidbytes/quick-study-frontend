<template>
  <div class="page-header">
    <div class="ph-left">
      <n-button
        v-if="showBack"
        quaternary
        circle
        size="small"
        class="ph-back"
        @click="handleBack()"
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

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showBack?: boolean
    /** 返回目标（可选）：无浏览器历史可退时的兜底路由（如列表页），未传则不跳转 */
    backTo?: string
  }>(),
  { subtitle: '', showBack: false }
)

const router = useRouter()

function handleBack() {
  // 站内历史可退则 back；否则（直接输 URL / 新标签打开 / history 被替换）回退到 backTo
  if (window.history.length > 1 && window.history.state?.back) {
    router.back()
  } else if (props.backTo) {
    router.push(props.backTo)
  }
}
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
