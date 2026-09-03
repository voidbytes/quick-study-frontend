<template>
  <div v-if="result">
    <!-- 汇总统计 -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-center">
        <div class="text-2xl font-semibold text-success-600">{{ result.successCount }}</div>
        <div class="text-xs text-neutral-500 mt-0.5">成功导入</div>
      </div>
      <div class="rounded-lg bg-warning-50 border border-warning-200 px-4 py-3 text-center">
        <div class="text-2xl font-semibold text-warning-600">{{ result.skipCount }}</div>
        <div class="text-xs text-neutral-500 mt-0.5">重复跳过</div>
      </div>
      <div class="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-center">
        <div class="text-2xl font-semibold text-error-600">{{ result.failCount }}</div>
        <div class="text-xs text-neutral-500 mt-0.5">导入失败</div>
      </div>
    </div>

    <div v-if="result.bankName" class="text-sm text-neutral-500 mb-3">
      已导入到题库「<span class="text-neutral-800 font-medium">{{ result.bankName }}</span>」
    </div>

    <n-empty
      v-if="result.failCount === 0 && result.skipCount === 0"
      description="全部题目导入成功"
      size="small"
      class="mb-3"
    />

    <!-- 失败明细 -->
    <template v-if="result.errors.length > 0">
      <div class="text-sm font-medium text-neutral-800 mb-2">失败明细（{{ result.errors.length }}）</div>
      <div class="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 divide-y divide-neutral-200 mb-4">
        <div v-for="(err, i) in result.errors" :key="'e' + i" class="px-3 py-2 text-xs flex gap-2">
          <span class="text-neutral-400 font-mono flex-shrink-0 w-10">#{{ err.index + 1 }}</span>
          <span class="text-error-600">{{ err.message }}</span>
        </div>
      </div>
    </template>

    <!-- 跳过明细 -->
    <template v-if="result.skipped.length > 0">
      <div class="text-sm font-medium text-neutral-800 mb-2">跳过明细（{{ result.skipped.length }}）</div>
      <div class="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 divide-y divide-neutral-200">
        <div v-for="(skip, i) in result.skipped" :key="'s' + i" class="px-3 py-2 text-xs flex gap-2 items-start">
          <span class="text-neutral-400 font-mono flex-shrink-0 w-10">#{{ skip.index + 1 }}</span>
          <div class="flex-1 min-w-0">
            <div class="text-neutral-700 line-clamp-2">{{ skip.content }}</div>
            <div class="text-warning-600 mt-0.5">{{ skip.reason }}</div>
          </div>
        </div>
      </div>
    </template>

    <div class="flex justify-end gap-2 pt-3">
      <n-button type="primary" @click="emit('done')">完成</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImportResult } from '@/types'

defineProps<{
  result: ImportResult | null
}>()

const emit = defineEmits<{
  done: []
}>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
