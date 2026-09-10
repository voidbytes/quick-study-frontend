<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <ProviderBridge>
              <router-view />
              <!-- 全局登录模态框：游客入口（导航按钮/退出登录/注销账号）打开，不再路由跳转 -->
              <LoginModal
                v-model:show="uiStore.showLoginModal"
                :redirect="uiStore.redirectAfterLogin"
              />
            </ProviderBridge>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { zhCN, dateZhCN } from 'naive-ui'
import { themeOverrides } from '@/theme/overrides'
import ProviderBridge from '@/components/common/ProviderBridge.vue'
import LoginModal from '@/components/auth/LoginModal.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>
