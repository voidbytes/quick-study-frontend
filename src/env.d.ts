/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@kangc/v-md-editor' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@kangc/v-md-editor/lib/theme/vuepress.js'
declare module '@kangc/v-md-editor/lib/theme/style/vuepress.css'
declare module '@kangc/v-md-editor/lib/style/base-editor.css'
declare module '@kangc/v-md-editor/lib/plugins/katex/cdn'
declare module '@kangc/v-md-editor/lib/plugins/line-number/index'

// KaTeX auto-render（katex/dist 的 ESM 构建无内置类型）
declare module 'katex/dist/contrib/auto-render.mjs' {
  interface Delimiter {
    left: string
    right: string
    display: boolean
  }
  interface AutoRenderOptions {
    delimiters?: Delimiter[]
    throwOnError?: boolean
    ignoredTags?: string[]
    [key: string]: unknown
  }
  export default function renderMathInElement(
    element: HTMLElement,
    options?: AutoRenderOptions
  ): void
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Naive UI 全局反馈 API —— 由 App.vue 内的 ProviderBridge 在应用挂载时注入，
// 供 api/request.ts 等非组件上下文（拦截器）调用，替代 useMessage 不可达的场景。
interface Window {
  $message: import('naive-ui').MessageApi
  $dialog: import('naive-ui').DialogApi
  $notification: import('naive-ui').NotificationApi
  $loadingBar: import('naive-ui').LoadingBarApi
}