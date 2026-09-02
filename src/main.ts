import { createApp } from 'vue'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { logger } from '@/utils/logger'
import './style.css'

const app = createApp(App)

app.use(naive)
app.use(createPinia())
app.use(router)

// Vue 组件渲染 / 生命周期内未捕获错误统一落日志
app.config.errorHandler = (err, _instance, info) => {
  logger.error(`Vue 运行错误 [${info}]`, err)
}

// 全局未捕获异常（非 Vue 层）
window.addEventListener('error', ev => {
  logger.error('全局未捕获异常', ev.message, ev.filename, ev.lineno)
})

// 未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', ev => {
  logger.error('未处理的 Promise 拒绝', ev.reason)
})

app.mount('#app')
