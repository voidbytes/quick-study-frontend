<template>
  <n-card>
    <n-result status="error" title="加载失败" :description="description || '请稍后重试'">
      <template #footer>
        <div class="flex justify-center gap-2">
          <n-button :loading="retrying" @click="$emit('retry')">重试</n-button>
          <n-button quaternary @click="router.back()">返回上一页</n-button>
        </div>
      </template>
    </n-result>
  </n-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

withDefaults(
  defineProps<{
    description?: string
    retrying?: boolean
  }>(),
  {
    description: '',
    retrying: false
  }
)

defineEmits<{ retry: [] }>()

const router = useRouter()
</script>
