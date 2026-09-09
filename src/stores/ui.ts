import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 全局 UI 态：承载登录模态框的开关与登录后的跳转意图。
 *
 * 组件内入口（MainLayout 登录按钮 / 退出登录、Profile 注销账号）调用 openLoginModal 打开弹窗，
 * 全局 LoginModal 挂载于 App.vue（Provider 内部），401 等非组件上下文仍走 /login 独立页兜底。
 */
export const useUiStore = defineStore('ui', () => {
  const showLoginModal = ref(false)
  /** 登录成功后的跳转目标；null 表示关闭弹窗留在当前页 */
  const redirectAfterLogin = ref<string | null>(null)

  function openLoginModal(redirect?: string) {
    redirectAfterLogin.value = redirect && redirect.startsWith('/') ? redirect : null
    showLoginModal.value = true
  }

  function closeLoginModal() {
    showLoginModal.value = false
    redirectAfterLogin.value = null
  }

  return { showLoginModal, redirectAfterLogin, openLoginModal, closeLoginModal }
})
