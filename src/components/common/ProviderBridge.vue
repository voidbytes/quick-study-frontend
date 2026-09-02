<template>
  <slot />
</template>

<script setup lang="ts">
/**
 * ProviderBridge —— 将 Naive UI 反馈类 API 挂载到 window。
 *
 * 背景：axios 拦截器（api/request.ts）运行在组件上下文之外，无法使用 useMessage。
 * 此组件必须置于各 Provider 内部，在应用挂载阶段完成一次性注入。
 */
import { useMessage, useDialog, useNotification, useLoadingBar } from 'naive-ui'

window.$message = useMessage()
window.$dialog = useDialog()
window.$notification = useNotification()
window.$loadingBar = useLoadingBar()
</script>
