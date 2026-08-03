<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 p-4">
    <n-card
      class="w-full max-w-md shadow-2xl"
      :bordered="false"
    >
      <div class="text-center mb-6">
        <n-gradient-text :size="28" type="primary">
          题库与组卷练习系统
        </n-gradient-text>
      </div>
      <router-view />
    </n-card>
  </div>
</template>

<script setup lang="ts">
</script>