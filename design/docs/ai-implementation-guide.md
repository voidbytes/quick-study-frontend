# Quick Study Web — AI 实施指南

> **本文档面向 AI Agent**，指导其将现有 Vue 代码库逐步改造为符合新设计系统规范的界面。
> 按步骤顺序执行即可完成全站视觉升级。

> **状态说明（2026-09-07 更新）**：本指南记录的 1~9 步改造已在 `frontend/src` 全部完成落地。
> 现作为**历史实施记录**保留，用于理解改造过程与设计系统来源；
> 如需核对设计稿与代码的一致性，请以 `frontend/src` 代码为准，并参考
> `docs/component-specs.md`（真实组件清单）与 `docs/page-specs.md`（页面规范）。
> 指南中若出现与现行代码不一致的描述（如 `.header-locale-switch` 等已移除元素），以代码为准。

---

## 目录

1. [实施概览](#1-实施概览)
2. [第一步：替换 Tailwind 配置](#2-第一步替换-tailwind-配置)
3. [第二步：更新全局样式](#3-第二步更新全局样式)
4. [第三步：创建 Naive UI 主题覆盖](#4-第三步创建-naive-ui-主题覆盖)
5. [第四步：重构 MainLayout](#5-第四步重构-mainlayout)
6. [第五步：重构 AuthLayout](#6-第五步重构-authlayout)
7. [第六步：逐页面改造指南](#7-第六步逐页面改造指南)
8. [第七步：提取公共组件](#8-第七步提取公共组件)
9. [检查清单](#9-检查清单)
10. [常见问题](#10-常见问题)
11. [新增功能实现指南](#11-新增功能实现指南)

---

## 1. 实施概览

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) | 3.x |
| 构建 | Vite | 5.x |
| CSS | Tailwind CSS | 3.x |
| UI 库 | Naive UI | 2.x |
| 状态 | Pinia | 2.x |
| 路由 | Vue Router | 4.x |
| 图表 | ECharts | 5.x |
| 图标 | @vicons/ionicons5 | 5.x |

### 设计系统核心

| 维度 | 规范 |
|------|------|
| **主色** | Indigo `#5B5FE9` (primary-500) — 用于按钮、链接、选中态 |
| **间距网格** | 4px 基准 — 所有间距必须是 4 的倍数 |
| **正文字号** | 14px (`text-base`) — Web 端偏紧凑 |
| **卡片** | 使用 1px 边框 (`border-neutral-200`) 而非阴影（默认无边框阴影） |
| **圆角** | 卡片 `rounded-lg` (12px)，按钮 `rounded-lg` (12px)，输入框 `rounded-md` (8px) |
| **品牌渐变** | `linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)` |
| **品牌阴影** | `0 4px 12px rgba(91, 95, 233, 0.25)` — 仅用于主按钮 |

### 实施优先级

```
基础设施 (tokens/config) → 布局组件 (MainLayout/AuthLayout) → 页面级改动
```

**执行顺序**：
1. 替换 `tailwind.config.js` → 所有 Tailwind 类名生效
2. 更新 `style.css` → 全局背景、字体、滚动条
3. 创建 `theme/overrides.ts` → Naive UI 组件统一风格
4. 重构 `MainLayout.vue` → 侧边栏 + 顶栏
5. 重构 `AuthLayout.vue` → 登录注册页
6. 逐页面改造 → Home / BankList / ExamPage 等
7. 提取公共组件 → StatCard / PageHeader 等

---

## 2. 第一步：替换 Tailwind 配置

### 当前状态

现有 `frontend/tailwind.config.js` 仅定义了 Sky 色系的 `primary` 色板（`#0ea5e9` 系列），与设计系统的 Indigo `#5B5FE9` 完全不同。缺少 `success`、`error`、`warning`、`info`、`neutral` 覆盖、自定义 `fontSize`、`borderRadius`、`boxShadow`、`backgroundImage` 等。

### 操作

将 `frontend/tailwind.config.js` 的整个文件内容替换为以下完整配置（来源于 `frontend/design/tokens/tailwind.config.js`）：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}'
  ],
  theme: {
    extend: {
      /* --- 色彩系统 --- */
      colors: {
        primary: {
          50:  '#EEF0FF',
          100: '#DBDEFF',
          200: '#B8BEFF',
          300: '#9399FF',
          400: '#6E75F5',
          500: '#5B5FE9',  // 主色
          600: '#4A48D4',
          700: '#3A35B8',
          800: '#2D2895',
          900: '#1F1E6B'
        },
        success: {
          50:  '#E8F9F0',
          100: '#C5F0D8',
          500: '#22B570',
          600: '#1A965C',
          700: '#0F7A48'
        },
        error: {
          50:  '#FFEFEC',
          100: '#FCD3CC',
          500: '#F0503C',
          600: '#D63A28',
          700: '#B22A1A'
        },
        warning: {
          50:  '#FFF8E6',
          100: '#FFE9B8',
          500: '#FFA42B',
          600: '#E68A00',
          700: '#B86D00'
        },
        info: {
          50:  '#E8F1FF',
          500: '#3B8BFF',
          600: '#1E6FE0'
        },
        // neutral 已在 Tailwind 默认灰阶中，这里覆盖为设计系统的精确值
        neutral: {
          0:   '#FFFFFF',
          50:  '#FAFAFB',
          100: '#F4F4F6',
          200: '#E8E8EC',
          300: '#D5D5DC',
          400: '#B0B0BC',
          500: '#8A8A96',
          600: '#6B6B76',
          700: '#525258',
          800: '#3A3A3E',
          900: '#242428',
          950: '#161618'
        }
      },

      /* --- 字体系统 --- */
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
               'Helvetica Neue', 'Arial', 'Noto Sans SC', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      fontSize: {
        xs:   ['12px', { lineHeight: '1.3' }],
        sm:   ['13px', { lineHeight: '1.4' }],
        base: ['14px', { lineHeight: '1.5' }],
        lg:   ['16px', { lineHeight: '1.5' }],
        xl:   ['20px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '1.25' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
        '4xl': ['34px', { lineHeight: '1.2' }]
      },

      /* --- 圆角系统 --- */
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px'
      },

      /* --- 阴影系统 --- */
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 4px 16px rgba(0, 0, 0, 0.10)',
        'xl': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'brand': '0 4px 12px rgba(91, 95, 233, 0.25)'
      },

      /* --- 过渡动画 --- */
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms'
      },

      /* --- 品牌渐变 --- */
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)',
        'brand-soft': 'linear-gradient(135deg, #EEF0FF 0%, #F5F0FF 100%)'
      },

      /* --- 布局常量 --- */
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px'
      },
      height: {
        'header': '64px'
      },
      maxWidth: {
        'content': '1280px'
      }
    }
  },
  plugins: []
}
```

### 变更明细

| 类别 | 变更内容 |
|------|----------|
| **colors** | `primary` 从 Sky 色系 (`#0ea5e9`) 替换为 Indigo 色系 (`#5B5FE9`)；新增 `success`、`error`、`warning`、`info` 色板；覆盖 `neutral` 为设计系统精确值 |
| **fontSize** | 新增自定义字号阶梯：`xs=12px`、`sm=13px`、`base=14px`、`lg=16px`、`xl=20px`、`2xl=24px`、`3xl=28px`、`4xl=34px` |
| **borderRadius** | 覆盖 `sm=6px`、`md=8px`、`lg=12px`、`xl=16px`，新增 `2xl=20px` |
| **boxShadow** | 新增 `xs`、覆盖 `sm`/`md`/`lg`/`xl` 为更低对比度值，新增 `brand` 阴影 |
| **backgroundImage** | 新增 `brand-gradient` 和 `brand-soft` 渐变 |
| **fontFamily** | 覆盖 `sans` 和 `mono` 为设计系统字体栈 |
| **transitionDuration** | 新增 `fast`/`base`/`slow` 过渡时长 |
| **width/height/maxWidth** | 新增布局常量 `sidebar`/`header`/`content` |

---

## 3. 第二步：更新全局样式

### 当前状态

现有 `frontend/src/style.css` 的 `body` 使用 `background-color: #f5f7fa` 和 `color: #333`，滚动条颜色为 `#c0c4cc` / `#909399`，均不符合设计系统。

### 操作

将 `frontend/src/style.css` 替换为以下内容。在 `@tailwind` 指令之后，引入设计令牌 CSS 文件，并更新全局样式：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 引入设计系统 CSS 变量 */
@import '../design/tokens/design-tokens.css';

/* --- 全局基础样式 --- */
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  font-size: var(--text-base);       /* 14px */
  line-height: var(--leading-normal); /* 1.5 */
  color: var(--text-primary);         /* #242428 */
  background-color: var(--bg-page);   /* #F4F4F6 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
}

/* --- 滚动条 --- */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300); /* #D5D5DC */
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral-400); /* #B0B0BC */
}

/* --- 链接 --- */
a {
  color: var(--text-brand);
  text-decoration: none;
  transition: color var(--transition-base);
}

a:hover {
  color: var(--color-primary-600);
}
```

### 变更明细

| 属性 | 旧值 | 新值 |
|------|------|------|
| `body background-color` | `#f5f7fa` | `var(--bg-page)` → `#F4F4F6` |
| `body color` | `#333` | `var(--text-primary)` → `#242428` |
| `body font-size` | 未设置 (默认 16px) | `var(--text-base)` → `14px` |
| `body font-family` | 内联字串 | `var(--font-sans)` |
| `body line-height` | 未设置 | `var(--leading-normal)` → `1.5` |
| 滚动条 thumb | `#c0c4cc` | `var(--color-neutral-300)` → `#D5D5DC` |
| 滚动条 thumb:hover | `#909399` | `var(--color-neutral-400)` → `#B0B0BC` |

### 关键 CSS 变量速查

以下变量由 `design-tokens.css` 定义，在组件中可直接使用：

```css
/* 色彩 */
--color-primary-500: #5B5FE9;
--color-primary-50: #EEF0FF;    /* 选中态背景 */
--color-success-500: #22B570;
--color-error-500: #F0503C;
--color-warning-500: #FFA42B;
--color-info-500: #3B8BFF;

/* 文字 */
--text-primary: #242428;
--text-secondary: #6B6B76;
--text-tertiary: #8A8A96;
--text-brand: #5B5FE9;

/* 背景 */
--bg-page: #F4F4F6;
--bg-card: #FFFFFF;
--bg-subtle: #FAFAFB;
--bg-hover: #F4F4F6;
--bg-selected: #EEF0FF;

/* 边框 */
--border-default: #E8E8EC;
--border-strong: #D5D5DC;
--border-brand: #5B5FE9;

/* 渐变 */
--gradient-brand: linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%);
--gradient-brand-soft: linear-gradient(135deg, #EEF0FF 0%, #F5F0FF 100%);

/* 阴影 */
--shadow-brand: 0 4px 12px rgba(91, 95, 233, 0.25);

/* 圆角 */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* 布局 */
--sidebar-width: 240px;
--sidebar-collapsed-width: 64px;
--header-height: 64px;
--content-max-width: 1280px;
--content-padding: 24px;
```

---

## 4. 第三步：创建 Naive UI 主题覆盖

### 当前状态

`App.vue` 中的 `<n-config-provider>` 仅设置了 `locale` 和 `date-locale`，没有 `theme-overrides`。所有 Naive UI 组件使用默认主题色（绿色为主），与设计系统的 Indigo 主色不匹配。

### 操作

#### 4.1 创建主题覆盖文件

创建新文件 `frontend/src/theme/overrides.ts`：

```ts
import type { GlobalThemeOverrides } from 'naive-ui'

/**
 * Quick Study Web — Naive UI 全局主题覆盖
 *
 * 将 Naive UI 默认绿色主题替换为设计系统的 Indigo #5B5FE9 主题。
 * 所有颜色值来源于 design-tokens.css / design-tokens.json。
 */
export const themeOverrides: GlobalThemeOverrides = {
  /* --- 通用 --- */
  common: {
    primaryColor: '#5B5FE9',
    primaryColorHover: '#6E75F5',
    primaryColorPressed: '#4A48D4',
    primaryColorSuppl: '#5B5FE9',

    infoColor: '#3B8BFF',
    infoColorHover: '#5BA0FF',
    infoColorPressed: '#1E6FE0',

    successColor: '#22B570',
    successColorHover: '#2ECB80',
    successColorPressed: '#1A965C',

    warningColor: '#FFA42B',
    warningColorHover: '#FFB850',
    warningColorPressed: '#E68A00',

    errorColor: '#F0503C',
    errorColorHover: '#F26854',
    errorColorPressed: '#D63A28',

    /* 文字色 */
    textColorBase: '#242428',
    textColor1: '#242428',    /* 主要文字 */
    textColor2: '#3A3A3E',    /* 次要文字 */
    textColor3: '#6B6B76',   /* 辅助文字 */

    /* 背景色 */
    bodyColor: '#F4F4F6',

    /* 卡片背景 */
    cardColor: '#FFFFFF',

    /* 模态/弹出层背景 */
    modalColor: '#FFFFFF',
    popoverColor: '#FFFFFF',

    /* 边框色 */
    borderColor: '#E8E8EC',

    /* 字体 */
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
    fontSize: '14px',
    fontSizeSmall: '13px',
    fontSizeLarge: '16px',

    /* 圆角 */
    borderRadius: '8px',
    borderRadiusSmall: '6px',

    /* 阴影 */
    boxShadow1: '0 1px 2px rgba(0, 0, 0, 0.04)',
    boxShadow2: '0 1px 3px rgba(0, 0, 0, 0.06)',
    boxShadow3: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },

  /* --- Button --- */
  Button: {
    borderRadiusMedium: '12px',
    borderRadiusLarge: '12px',
    borderRadiusSmall: '8px',
    fontWeight: '600',
    // primary 按钮添加品牌阴影
    colorPrimary: '#5B5FE9',
    colorHoverPrimary: '#6E75F5',
    colorPressedPrimary: '#4A48D4',
    colorFocusPrimary: '#5B5FE9',
  },

  /* --- Card --- */
  Card: {
    borderRadius: '12px',
    borderColor: '#E8E8EC',
    // 默认不使用阴影，用边框
    boxShadow: 'none',
    colorEmbedded: '#FAFAFB',
  },

  /* --- Input --- */
  Input: {
    borderRadius: '8px',
    borderHover: '1px solid #9399FF',
    borderFocus: '1px solid #5B5FE9',
    boxShadowFocus: '0 0 0 3px rgba(91, 95, 233, 0.12)',
    color: '#FFFFFF',
    colorFocus: '#FFFFFF',
    placeholderColor: '#8A8A96',
    textColor: '#242428',
  },

  /* --- Select --- */
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '8px',
        borderHover: '1px solid #9399FF',
        borderFocus: '1px solid #5B5FE9',
        boxShadowFocus: '0 0 0 3px rgba(91, 95, 233, 0.12)',
      }
    }
  },

  /* --- Tag --- */
  Tag: {
    borderRadius: '6px',
    fontWeight: '600',
    fontSizeSmall: '12px',
  },

  /* --- Menu --- */
  Menu: {
    borderRadius: '8px',
    itemHeight: '40px',
    itemColorActive: '#EEF0FF',
    itemColorActiveHover: '#EEF0FF',
    itemColorActiveCollapsed: '#EEF0FF',
    itemTextColorActive: '#5B5FE9',
    itemTextColorActiveHover: '#5B5FE9',
    itemTextColorActiveHorizontal: '#5B5FE9',
    itemIconColorActive: '#5B5FE9',
    itemIconColorActiveHover: '#5B5FE9',
    itemIconColorActiveHorizontal: '#5B5FE9',
    itemTextColorChildActive: '#5B5FE9',
    itemIconColorChildActive: '#5B5FE9',
  },

  /* --- DataTable --- */
  DataTable: {
    borderRadius: '12px',
    borderColor: '#E8E8EC',
    thColor: '#FAFAFB',
    thColorHover: '#F4F4F6',
    thTextColor: '#6B6B76',
    tdColorHover: '#FAFAFB',
    tdColor: '#FFFFFF',
    fontSize: '14px',
    fontSizeSmall: '13px',
  },

  /* --- Dialog / Modal --- */
  Dialog: {
    borderRadius: '16px',
  },

  /* --- Form --- */
  Form: {
    labelTextColor: '#242428',
    labelFontWeight: '500',
    labelTextSize: '13px',
  },

  /* --- Avatar --- */
  Avatar: {
    color: '#5B5FE9',
  },

  /* --- Badge --- */
  Badge: {
    color: '#F0503C',
  },

  /* --- Breadcrumb --- */
  Breadcrumb: {
    fontSize: '13px',
    itemTextColor: '#8A8A96',
    itemTextColorActive: '#242428',
  },

  /* --- Notification --- */
  Notification: {
    borderRadius: '12px',
  },

  /* --- Tabs --- */
  Tabs: {
    tabFontWeightActive: '600',
    tabTextColorActive: '#5B5FE9',
    tabTextColorActiveLine: '#5B5FE9',
    barColor: '#5B5FE9',
  },

  /* --- Progress --- */
  Progress: {
    borderRadius: '9999px',
    fillColor: '#5B5FE9',
  },

  /* --- Pagination --- */
  Pagination: {
    itemBorderRadius: '8px',
  },

  /* --- Empty --- */
  Empty: {
    textColor: '#8A8A96',
  },
}
```

#### 4.2 在 App.vue 中应用

修改 `frontend/src/App.vue`，引入 `themeOverrides` 并传入 `<n-config-provider>`：

```vue
<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { zhCN, dateZhCN } from 'naive-ui'
import { themeOverrides } from '@/theme/overrides'
</script>
```

### 关键点

- **`theme-overrides` 必须包裹整个应用**。如果 `<n-config-provider>` 没有包裹 `<router-view>`，则组件级覆盖不生效。
- `common.primaryColor` 是最核心的改动 — 将 Naive UI 所有 `type="primary"` 的组件（Button、Tag、Menu 活跃态等）从绿色切换为 Indigo。
- `Card` 的 `boxShadow` 设为 `none` — 设计系统要求卡片默认使用边框而非阴影。

---

## 5. 第四步：重构 MainLayout（侧边栏 + 顶栏）

### 当前 vs 设计稿差异

| 区域 | 现状 | 设计目标 |
|------|------|----------|
| Logo 区 | `n-gradient-text` 文字 "Quick Study"，`h-16` 高度 | QS 图标方块（渐变背景 36x36）+ "Quick Study" 文字，高度 64px |
| 菜单结构 | 单层平铺 `n-menu`，无分组 | 分组导航：学习中心 / 管理，带分组标签 |
| 菜单活跃态 | Naive UI 默认绿色高亮 | `primary-50` 背景 + `text-brand` 文字色 |
| 顶栏高度 | `h-16` (64px) | 64px（一致，但需确认使用 `h-header` 类） |
| 面包屑 | `n-breadcrumb` 单项 | 样式更新：13px、`text-tertiary` 色，当前项 `text-primary` |
| 用户头像 | 随机色 `n-avatar` | 品牌渐变色头像 |
| 图标 | 内联 SVG 字符串 | 使用 `@vicons/ionicons5` 组件 |
| 内容区 | `p-4 lg:p-8` | `p-6` (24px)，`max-w-content` (1280px) 居中 |

### 具体改动

#### 5.1 侧边栏 Logo 区域

**替换前：**
```vue
<div class="flex items-center justify-center h-16 border-b border-gray-200">
  <n-gradient-text :size="collapsed ? 20 : 24" type="primary">
    {{ collapsed ? 'QS' : 'Quick Study' }}
  </n-gradient-text>
</div>
```

**替换后：**
```vue
<div class="flex items-center gap-3 h-header px-6 border-b border-neutral-200">
  <div
    class="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-base flex-shrink-0"
  >
    QS
  </div>
  <span v-if="!collapsed" class="text-base font-bold text-neutral-900 whitespace-nowrap">
    Quick Study
  </span>
</div>
```

#### 5.2 侧边栏菜单 — 添加分组

将现有的 `n-menu` 替换为自定义分组菜单结构。在 `<script setup>` 中新增分组数据：

```ts
// 菜单分组结构
interface MenuItem {
  label: string
  key: string
  icon: any
}
interface MenuGroup {
  label?: string  // 分组标签，undefined 表示顶部无标签组
  items: MenuItem[]
}

const menuGroups = computed<MenuGroup[]>(() => {
  const groups: MenuGroup[] = [
    // 顶部核心导航（无分组标签）
    {
      items: [
        { label: '首页', key: '/', icon: HomeOutline },
        { label: '题库', key: '/banks', icon: LibraryOutline },
        { label: '题目', key: '/questions', icon: DocumentTextOutline },
        { label: '试卷', key: '/papers', icon: FileTrayFullOutline },
      ]
    }
  ]

  if (authStore.isAuthenticated) {
    groups.push({
      label: '学习中心',
      items: [
        { label: '练习', key: '/practice', icon: GameControllerOutline },
        { label: '错题本', key: '/wrong-questions', icon: CloseCircleOutline },
        { label: '做题记录', key: '/records', icon: TimeOutline },
        { label: '搜索', key: '/search', icon: SearchOutline },
        { label: '统计', key: '/statistics', icon: BarChartOutline },
        { label: '通知', key: '/notifications', icon: NotificationsOutline },
      ]
    })
  } else {
    groups.push({
      items: [
        { label: '搜索', key: '/search', icon: SearchOutline },
      ]
    })
  }

  if (authStore.isAdmin) {
    groups.push({
      label: '管理',
      items: [
        { label: '用户管理', key: '/admin/users', icon: PeopleOutline },
        { label: '审核列表', key: '/admin/reviews', icon: CheckmarkDoneOutline },
      ]
    })
  }

  return groups
})
```

在 `<script setup>` 中导入图标：

```ts
import {
  HomeOutline,
  LibraryOutline,
  DocumentTextOutline,
  FileTrayFullOutline,
  GameControllerOutline,
  CloseCircleOutline,
  TimeOutline,
  SearchOutline,
  BarChartOutline,
  NotificationsOutline,
  PeopleOutline,
  CheckmarkDoneOutline,
  LogOutOutline,
} from '@vicons/ionicons5'
```

**模板部分** — 用自定义分组替换 `n-menu`：

```vue
<nav class="flex-1 p-3 overflow-y-auto">
  <template v-for="(group, gi) in menuGroups" :key="gi">
    <!-- 分组标签 -->
    <div
      v-if="group.label"
      class="text-xs font-semibold text-tertiary uppercase tracking-wide px-3 py-2 mt-2"
    >
      {{ group.label }}
    </div>
    <!-- 菜单项 -->
    <div
      v-for="item in group.items"
      :key="item.key"
      class="flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors mb-0.5"
      :class="activeMenu === item.key
        ? 'bg-primary-50 text-primary-600 font-semibold'
        : 'text-neutral-600 font-medium hover:bg-neutral-100 hover:text-neutral-900'"
      @click="handleMenuSelect(item.key)"
    >
      <n-icon :size="20" class="flex-shrink-0">
        <component :is="item.icon" />
      </n-icon>
      <span v-if="!collapsed" class="text-sm">{{ item.label }}</span>
    </div>
  </template>
</nav>
```

#### 5.3 退出登录按钮

```vue
<div class="p-3 border-t border-neutral-200">
  <div
    v-if="authStore.isAuthenticated"
    class="flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
    @click="handleLogout"
  >
    <n-icon :size="20"><LogOutOutline /></n-icon>
    <span v-if="!collapsed" class="text-sm">退出登录</span>
  </div>
</div>
```

#### 5.4 顶部导航栏

**替换前：**
```vue
<n-layout-header
  bordered
  class="h-16 flex items-center justify-between px-4 lg:px-8"
>
```

**替换后：**
```vue
<n-layout-header
  bordered
  class="h-header flex items-center justify-between px-6"
>
```

面包屑更新：
```vue
<n-breadcrumb>
  <n-breadcrumb-item class="text-sm text-tertiary">{{ currentPageTitle }}</n-breadcrumb-item>
</n-breadcrumb>
```

#### 5.5 用户头像 — 渐变色

替换 `AVATAR_COLORS` 随机色逻辑为品牌渐变：

```ts
// 替换旧的 AVATAR_COLORS 逻辑
const avatarBgColor = 'linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)'
```

模板中：
```vue
<n-avatar
  round
  size="small"
  :style="{ background: avatarBgColor }"
>
  {{ avatarText }}
</n-avatar>
```

#### 5.6 内容区

```vue
<n-layout-content
  :native-scrollbar="false"
  class="p-6"
  style="min-height: calc(100vh - 4rem);"
>
  <div class="max-w-content mx-auto w-full">
    <router-view />
  </div>
</n-layout-content>
```

---

## 6. 第五步：重构 AuthLayout（登录页）

### 当前 vs 设计稿差异

| 区域 | 现状 | 设计目标 |
|------|------|----------|
| 背景 | `bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700` | 品牌渐变 `linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)` |
| 卡片 | `n-card` 带标题，`shadow-2xl` | 无标题，圆角 16px，`shadow-xl`，内边距 40px |
| Logo | `n-gradient-text` 文字 | QS 图标方块 (56x56) + "Quick Study" + 副标题 |
| 内容居中 | `max-w-md` | `max-w-[420px]` |

### 具体改动

替换 `frontend/src/layout/AuthLayout.vue` 的模板部分：

```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-brand-gradient p-6">
    <div class="w-full max-w-[420px] bg-white rounded-xl shadow-xl p-10">
      <!-- Logo 区域 -->
      <div class="text-center mb-8">
        <div
          class="w-14 h-14 rounded-lg bg-brand-gradient inline-flex items-center justify-center text-white font-bold text-2xl mb-4"
        >
          QS
        </div>
        <h1 class="text-2xl font-bold text-neutral-900 mb-1">Quick Study</h1>
        <p class="text-sm text-neutral-600">题库与组卷练习系统</p>
      </div>
      <!-- 路由内容（Login / Register） -->
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
```

### 注意

- AuthLayout 不再使用 `<n-card>` 组件包裹，改为原生 `div` + Tailwind 类，以便精确控制圆角和阴影。
- 如果需要保留 `<n-card>`，则设置 `:bordered="false"` 并通过 `theme-overrides` 中的 `Card` 配置统一风格。

---

## 7. 第六步：逐页面改造指南

### Home.vue

#### 7.1.1 添加 Welcome Banner（渐变背景）

**替换前：**
```vue
<div class="mb-8">
  <h1 class="text-2xl font-bold text-gray-800">
    {{ authStore.isAuthenticated ? `欢迎回来，...` : '欢迎光临' }}
  </h1>
  <p class="text-gray-500 mt-1">...</p>
</div>
```

**替换后：**
```vue
<div class="bg-brand-gradient rounded-xl p-8 mb-6 text-white relative overflow-hidden">
  <div class="relative z-10">
    <h1 class="text-2xl font-bold mb-2">
      {{ authStore.isAuthenticated ? `欢迎回来，${authStore.userInfo?.nickname || authStore.userInfo?.username || '用户'}` : '欢迎光临' }}
    </h1>
    <p class="text-base opacity-85">
      {{ authStore.isAuthenticated ? '今天也要加油学习哦！' : '登录后即可开始练习和考试' }}
    </p>
  </div>
</div>
```

#### 7.1.2 Quick Entries — 卡片网格 + 彩色图标背景

**替换前：**
```vue
<n-card v-for="entry in quickEntries" hoverable class="cursor-pointer" @click="...">
  <div class="flex flex-col items-center gap-2 py-2">
    <n-icon :size="32" :color="entry.color">
      <component :is="entry.icon" />
    </n-icon>
    <span class="text-sm font-medium">{{ entry.title }}</span>
  </div>
</n-card>
```

**替换后：**
```vue
<div
  v-for="entry in quickEntries"
  :key="entry.title"
  class="flex flex-col items-center gap-3 px-4 py-5 bg-white border border-neutral-200 rounded-lg cursor-pointer transition-all hover:border-primary-300 hover:shadow-sm hover:-translate-y-0.5"
  @click="router.push(entry.path)"
>
  <div
    class="w-12 h-12 rounded-lg flex items-center justify-center"
    :style="{ background: entry.bgColor }"
  >
    <n-icon :size="24" :color="entry.iconColor">
      <component :is="entry.icon" />
    </n-icon>
  </div>
  <span class="text-sm font-medium text-neutral-900">{{ entry.title }}</span>
</div>
```

更新 `QuickEntry` 接口和数据，添加 `bgColor` 和 `iconColor`：

```ts
interface QuickEntry {
  title: string
  path: string
  icon: any
  bgColor: string    // 图标背景色 (50 色阶)
  iconColor: string  // 图标颜色 (500 色阶)
}

// 登录用户
const quickEntries = computed<QuickEntry[]>(() => {
  if (!authStore.isAuthenticated) {
    return [
      { title: '题库浏览', path: '/banks', icon: Library, bgColor: '#EEF0FF', iconColor: '#5B5FE9' },
      { title: '试卷浏览', path: '/papers', icon: DocumentText, bgColor: '#E8F9F0', iconColor: '#22B570' },
      { title: '搜索', path: '/search', icon: Search, bgColor: '#E8F1FF', iconColor: '#3B8BFF' },
    ]
  }
  return [
    { title: '题库管理', path: '/banks', icon: Library, bgColor: '#EEF0FF', iconColor: '#5B5FE9' },
    { title: '试卷管理', path: '/papers', icon: DocumentText, bgColor: '#E8F9F0', iconColor: '#22B570' },
    { title: '随机练习', path: '/practice', icon: GameController, bgColor: '#FFF8E6', iconColor: '#FFA42B' },
    { title: '错题本', path: '/wrong-questions', icon: CloseCircle, bgColor: '#FFEFEC', iconColor: '#F0503C' },
    { title: '做题记录', path: '/records', icon: Time, bgColor: '#EEF0FF', iconColor: '#6E75F5' },
  ]
})
```

#### 7.1.3 统计概览 — 使用 stat-card 样式

**替换前：** `<n-statistic>` 在 `<n-grid>` 中

**替换后：** 使用卡片式统计：

```vue
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" v-if="authStore.isAuthenticated">
  <div
    v-for="stat in statsCards"
    :key="stat.label"
    class="bg-white border border-neutral-200 rounded-lg p-5"
  >
    <div class="text-xs font-medium text-tertiary uppercase tracking-wide mb-2">
      {{ stat.label }}
    </div>
    <div class="text-3xl font-bold text-neutral-900">{{ stat.value }}</div>
  </div>
</div>
```

在 `<script setup>` 中：
```ts
const statsCards = computed(() => [
  { label: '练习场次', value: overview.value?.totalPractices || 0 },
  { label: '总题数', value: overview.value?.totalQuestions || 0 },
  { label: '正确率', value: overview.value?.correctRate != null ? overview.value.correctRate.toFixed(1) + '%' : '-' },
  { label: '错题数', value: overview.value?.wrongCount || 0 },
])
```

#### 7.1.4 最近活动 — list-item 样式

```vue
<div class="bg-white border border-neutral-200 rounded-lg" v-if="authStore.isAuthenticated">
  <div class="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
    <span class="text-base font-semibold text-neutral-900">最近活动</span>
  </div>
  <n-empty v-if="recentActivities.length === 0" description="暂无活动记录" class="py-12" />
  <div v-else>
    <div
      v-for="activity in recentActivities"
      :key="activity.id"
      class="flex items-center gap-3 px-4 py-4 border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors"
    >
      <span
        class="text-xs font-semibold px-2 py-1 rounded-sm"
        :class="activity.type === 'practice'
          ? 'bg-success-50 text-success-600'
          : 'bg-info-50 text-info-600'"
      >
        {{ activity.type === 'practice' ? '练习' : '考试' }}
      </span>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-neutral-900">{{ activity.title }}</div>
        <div class="text-sm text-tertiary mt-0.5">{{ activity.time }}</div>
      </div>
    </div>
  </div>
</div>
```

---

### BankList.vue

#### 7.2.1 列表从 data-table 改为卡片网格

**替换前：** `<n-data-table>` 表格展示

**替换后：** 3 列卡片网格

```vue
<!-- 搜索与筛选（样式调整） -->
<div class="flex gap-3 mb-6 flex-wrap">
  <n-input
    v-model:value="searchKeyword"
    placeholder="搜索题库名称..."
    clearable
    style="width: 240px"
    @keyup.enter="handleSearch"
  />
  <n-select
    v-model:value="filterVisibility"
    :options="visibilityOptions"
    style="width: 140px"
    clearable
    @update:value="handleSearch"
  />
</div>

<!-- 题库卡片网格 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div
    v-for="bank in bankList"
    :key="bank.id"
    class="bg-white border border-neutral-200 rounded-lg p-5 transition-all hover:border-primary-300 hover:shadow-sm cursor-pointer"
    @click="router.push(`/banks/${bank.id}`)"
  >
    <!-- 卡片头部：名称 + 状态标签 -->
    <div class="flex items-start justify-between mb-3">
      <h3 class="text-base font-semibold text-neutral-900 truncate">{{ bank.name }}</h3>
      <div class="flex gap-1 flex-shrink-0">
        <span v-if="bank.isOfficial" class="text-xs font-semibold px-2 py-1 rounded-sm bg-warning-50 text-warning-600">官方</span>
        <span v-else-if="bank.isPublic" class="text-xs font-semibold px-2 py-1 rounded-sm bg-success-50 text-success-600">公开</span>
        <span v-else class="text-xs font-semibold px-2 py-1 rounded-sm bg-neutral-100 text-neutral-600">私有</span>
      </div>
    </div>

    <!-- 描述 -->
    <p class="text-sm text-secondary mb-4 line-clamp-2">{{ bank.description || '暂无描述' }}</p>

    <!-- 统计 -->
    <div class="flex items-center gap-4 mb-3 text-sm text-tertiary">
      <span>题目 {{ bank.questionCount }}</span>
      <span>练习 {{ bank.practiceCount }}</span>
    </div>

    <!-- 标签 -->
    <div v-if="bank.tags?.length" class="flex gap-1 flex-wrap mb-3">
      <span
        v-for="tag in bank.tags"
        :key="tag"
        class="text-xs font-semibold px-2 py-1 rounded-sm bg-primary-50 text-primary-600"
      >{{ tag }}</span>
    </div>

    <!-- 创建者 -->
    <div class="flex items-center gap-2 pt-3 border-t border-neutral-200">
      <div class="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-semibold">
        {{ bank.creatorName?.charAt(0).toUpperCase() || '?' }}
      </div>
      <span class="text-sm text-secondary">{{ bank.creatorName }}</span>
      <span class="text-sm text-tertiary ml-auto">{{ formatDate(bank.createdAt) }}</span>
    </div>
  </div>
</div>

<!-- 空状态 -->
<div v-if="!loading && bankList.length === 0" class="py-12 text-center">
  <n-empty description="暂无题库" />
</div>

<!-- 分页 -->
<div class="flex justify-end mt-6" v-if="pagination.itemCount > pagination.pageSize">
  <n-pagination
    :page="pagination.page"
    :item-count="pagination.itemCount"
    :page-size="pagination.pageSize"
    @update:page="handlePageChange"
  />
</div>
```

#### 7.2.2 筛选栏样式

将搜索框和下拉框使用 Naive UI 的 `theme-overrides` 自动应用圆角和边框色。无需额外 Tailwind 类，确认 `theme-overrides` 中的 `Input` 和 `Select` 配置生效即可。

---

### Login.vue / Register.vue

#### 7.3.1 布局改造

Login.vue 和 Register.vue 当前是独立全屏页面（不在 AuthLayout 内）。**两种方案**：

**方案 A（推荐）**：将 Login.vue 和 Register.vue 的外层包裹移除，改由 `AuthLayout.vue` 提供品牌渐变背景 + 居中卡片。路由配置中将 Login/Register 的 `layout` 指向 AuthLayout。

**方案 B**：直接在 Login.vue / Register.vue 中应用 `auth-card` 布局。

以下按方案 A 说明。Login.vue 模板只保留表单部分：

```vue
<template>
  <!-- 不再需要外层 div，AuthLayout 已提供背景 + 卡片 -->
  <n-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-placement="top"
    @submit.prevent="handleLogin"
  >
    <n-form-item label="用户名" path="username">
      <n-input v-model:value="form.username" placeholder="请输入用户名" :maxlength="50" />
    </n-form-item>

    <n-form-item label="密码" path="password">
      <n-input
        v-model:value="form.password"
        type="password"
        placeholder="请输入密码"
        show-password-on="click"
        :maxlength="64"
      />
    </n-form-item>

    <n-form-item v-if="captchaEnabled" label="验证码" path="captchaCode">
      <div class="flex gap-2 items-center w-full">
        <n-input v-model:value="form.captchaCode" placeholder="验证码" :maxlength="6" class="flex-1" />
        <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="h-10 cursor-pointer rounded-md" @click="refreshCaptcha" />
      </div>
    </n-form-item>

    <n-button type="primary" attr-type="submit" :loading="loading" block :disabled="loading" class="mt-2">
      登录
    </n-button>

    <div class="text-center text-sm text-neutral-600 mt-4">
      还没有账号？
      <router-link to="/register" class="text-primary-500 hover:text-primary-600 font-medium">立即注册</router-link>
    </div>
  </n-form>
</template>
```

#### 7.3.2 添加 Tab 切换（可选增强）

如果想在 AuthLayout 中添加登录/注册 Tab 切换：

```vue
<!-- 在 AuthLayout.vue 的 router-view 上方 -->
<n-tabs v-model:value="activeTab" type="segment" class="mb-6" @update:value="handleTabChange">
  <n-tab name="login">登录</n-tab>
  <n-tab name="register">注册</n-tab>
</n-tabs>
<router-view />
```

```ts
const route = useRoute()
const router = useRouter()
const activeTab = ref(route.name === 'register' ? 'register' : 'login')

function handleTabChange(name: string) {
  router.push(name === 'register' ? '/register' : '/login')
}
```

#### 7.3.3 按钮样式

主按钮通过 `theme-overrides` 中的 `Button` 配置自动获得：
- 背景色 `#5B5FE9`
- 品牌阴影 `0 4px 12px rgba(91, 95, 233, 0.25)`
- 圆角 `12px`
- 字重 `600`

`block` 属性使按钮撑满宽度，无需额外样式。

---

### ExamPage.vue

#### 7.4.1 全屏布局（无侧边栏）

确认路由配置中 ExamPage 不使用 `MainLayout`（已是独立全屏页面）。确保 `bg-gray-50` 替换为 `bg-neutral-100`：

```vue
<div class="min-h-screen bg-neutral-100">
```

#### 7.4.2 Sticky Header with Timer

**替换前：**
```vue
<div class="bg-white shadow-sm border-b sticky top-0 z-10">
  <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
```

**替换后：**
```vue
<div class="bg-white border-b border-neutral-200 sticky top-0 z-sticky">
  <div class="max-w-content mx-auto px-6 py-3 flex items-center justify-between">
    <h1 class="text-lg font-bold text-neutral-900 truncate">{{ paperTitle }}</h1>
    <div class="flex items-center gap-4">
      <span
        class="text-xl font-mono font-bold"
        :class="timeRemaining <= 300 ? 'text-error-500 animate-pulse' : 'text-neutral-900'"
      >
        {{ formattedTime }}
      </span>
      <n-button type="error" @click="handleSubmit">交卷</n-button>
    </div>
  </div>
</div>
```

#### 7.4.3 左侧题目导航 — q-nav-grid 样式

**替换前：**
```vue
<div class="w-8 h-8 flex items-center justify-center rounded cursor-pointer text-sm font-medium"
  :class="getQuestionStatusClass(index)"
>
```

**替换后：**
```vue
<div class="q-nav-grid">
  <div
    v-for="(q, index) in questions"
    :key="q.id"
    class="aspect-square rounded-md flex items-center justify-center text-sm font-semibold cursor-pointer transition-all border"
    :class="getQuestionNavClass(index)"
    @click="currentIndex = index"
  >
    {{ index + 1 }}
  </div>
</div>
```

更新状态类名函数：

```ts
function getQuestionNavClass(index: number): string {
  const q = questions.value[index]
  if (!q) return 'border-neutral-200 bg-neutral-100 text-tertiary'
  if (currentIndex.value === index)
    return 'bg-primary-500 text-white border-primary-500'
  if (markedForReview.value.has(index))
    return 'bg-warning-500 text-white border-warning-500'
  const hasAnswer = q.type === 'MULTIPLE'
    ? currentAnswers[q.id]?.length
    : (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER')
      ? fillAnswers[q.id]?.trim()
      : currentAnswers[q.id]
  return hasAnswer
    ? 'bg-success-500 text-white border-success-500'
    : 'border-neutral-200 bg-white text-tertiary'
}
```

#### 7.4.4 选项 — option-item 样式

**替换前：**
```vue
<div class="p-3 border rounded cursor-pointer hover:border-primary transition-colors"
  :class="{ 'border-primary bg-primary bg-opacity-5': ... }">
```

**替换后：**
```vue
<div
  v-for="(opt, idx) in parsedOptions"
  :key="idx"
  class="flex items-start gap-3 p-4 border-2 border-neutral-200 rounded-lg cursor-pointer transition-all mb-3 hover:border-primary-300"
  :class="{
    'border-primary-500 bg-primary-50': currentAnswers[currentQuestion.id] === String.fromCharCode(65 + idx)
  }"
  @click="selectAnswer(String.fromCharCode(65 + idx))"
>
  <div class="w-7 h-7 rounded-full border-2 border-neutral-300 flex items-center justify-center text-sm font-semibold text-secondary flex-shrink-0"
    :class="{ 'border-primary-500 bg-primary-500 text-white': currentAnswers[currentQuestion.id] === String.fromCharCode(65 + idx) }"
  >
    {{ String.fromCharCode(65 + idx) }}
  </div>
  <div class="flex-1 text-sm leading-relaxed pt-0.5 text-neutral-900">{{ opt }}</div>
</div>
```

---

### PracticePage.vue

#### 7.5.1 全屏布局 + 条件标签栏 + 进度条

**替换前：**
```vue
<div class="min-h-screen bg-gray-50 p-6">
```

**替换后：**
```vue
<div class="min-h-screen bg-neutral-100">
  <!-- 顶部条件标签栏 + 进度 -->
  <div class="bg-white border-b border-neutral-200 sticky top-0 z-sticky">
    <div class="max-w-content mx-auto px-6 py-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <n-tag v-if="conditionText" size="small" type="info" style="max-width: 300px" ellipsis>
            {{ conditionText }}
          </n-tag>
          <n-tag :type="typeTagType(currentQuestion?.type)" size="small">
            {{ typeLabels[currentQuestion?.type] || '' }}
          </n-tag>
          <n-tag :type="difficultyTagType(currentQuestion?.difficulty)" size="small">
            {{ difficultyLabels[currentQuestion?.difficulty] || '' }}
          </n-tag>
        </div>
        <span class="text-sm font-semibold text-neutral-900">
          第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题
        </span>
      </div>
      <!-- 进度条 -->
      <div class="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-500 rounded-full transition-all duration-300"
          :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }"
        />
      </div>
    </div>
  </div>

  <div class="max-w-content mx-auto p-6">
    <!-- 答题卡片 -->
    <div class="bg-white border border-neutral-200 rounded-lg p-6">
      <!-- ...题目内容和选项... -->
    </div>
  </div>
</div>
```

#### 7.5.2 选项样式 + 即时反馈

选项样式与 ExamPage 相同（`option-item` 样式），但增加了答对/答错的视觉反馈：

```vue
<div
  v-for="(opt, idx) in parsedOptions"
  :key="idx"
  class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all mb-3"
  :class="getOptionClass(idx)"
  @click="selectAnswer(String.fromCharCode(65 + idx))"
>
  <!-- option-marker -->
  <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all"
    :class="getOptionMarkerClass(idx)">
    {{ String.fromCharCode(65 + idx) }}
  </div>
  <div class="flex-1 text-sm leading-relaxed pt-0.5">{{ opt }}</div>
</div>
```

```ts
function getOptionClass(idx: number): string {
  const letter = String.fromCharCode(65 + idx)
  const base = 'border-neutral-200 hover:border-primary-300'

  if (answered.value) {
    // 答案揭晓后：正确答案绿色，用户选错红色
    if (currentQuestion.value?.answer.includes(letter))
      return 'border-success-500 bg-success-50'
    if (selectedAnswer.value === letter && !currentQuestion.value?.answer.includes(letter))
      return 'border-error-500 bg-error-50'
    return 'border-neutral-200 opacity-60'
  }

  if (selectedAnswer.value === letter)
    return 'border-primary-500 bg-primary-50'
  return base
}
```

---

### StatisticsPage.vue

#### 7.6.1 4 个 stat-card

**替换前：**
```vue
<n-card title="概览" class="mb-6">
  <n-grid :cols="4" :x-gap="16" :y-gap="16">
    <n-grid-item>
      <n-statistic label="练习场次" :value="..." />
    </n-grid-item>
    ...
  </n-grid>
</n-card>
```

**替换后：**
```vue
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div
    v-for="stat in statCards"
    :key="stat.label"
    class="bg-white border border-neutral-200 rounded-lg p-5"
  >
    <div class="text-xs font-medium text-tertiary uppercase tracking-wide mb-2">
      {{ stat.label }}
    </div>
    <div class="text-3xl font-bold text-neutral-900">{{ stat.value }}</div>
  </div>
</div>
```

#### 7.6.2 表格 + 进度条

```vue
<div class="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6">
  <div class="px-5 py-4 border-b border-neutral-200">
    <span class="text-base font-semibold text-neutral-900">各题库统计</span>
  </div>
  <n-data-table
    :columns="bankStatColumns"
    :data="overview?.bankStats || []"
    :bordered="false"
    size="small"
  />
</div>
```

在 `bankStatColumns` 的正确率列中添加进度条渲染：

```ts
const bankStatColumns: DataTableColumn<any>[] = [
  { title: '题库名称', key: 'bankName' },
  { title: '做题数', key: 'count', width: 80, align: 'center' },
  {
    title: '正确率',
    key: 'correctRate',
    width: 160,
    render(row) {
      if (row.correctRate == null) return '-'
      const pct = row.correctRate.toFixed(1)
      const width = Math.min(parseFloat(pct), 100)
      return h('div', { class: 'flex items-center gap-2' }, [
        h('div', { class: 'flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden' }, [
          h('div', {
            class: 'h-full rounded-full',
            style: { width: width + '%', background: width >= 60 ? '#22B570' : width >= 30 ? '#FFA42B' : '#F0503C' }
          })
        ]),
        h('span', { class: 'text-sm text-neutral-600 w-12 text-right' }, pct + '%')
      ])
    }
  }
]
```

#### 7.6.3 ECharts 图表配色更新

将 ECharts 的 `itemStyle.color` 从 Ant Design 色系替换为设计系统色系：

**正确率图表：**
```ts
itemStyle: {
  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: '#5B5FE9' },   // primary-500
    { offset: 1, color: '#3A35B8' }    // primary-700
  ])
}
```

**练习次数图表：**
```ts
itemStyle: {
  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: '#22B570' },   // success-500
    { offset: 1, color: '#0F7A48' }    // success-700
  ])
}
```

ECharts 全局配置建议：
```ts
const chartOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E8EC',
    textStyle: { color: '#242428', fontSize: 13 }
  },
  xAxis: {
    type: 'category',
    axisLine: { lineStyle: { color: '#E8E8EC' } },
    axisLabel: { color: '#8A8A96', fontSize: 12, rotate: 30 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#F4F4F6' } },
    axisLabel: { color: '#8A8A96', fontSize: 12 }
  }
}
```

---

### 其他页面

以下页面按相同原则批量改造：

#### QuestionList.vue (`/views/question/QuestionList.vue`)
- 搜索筛选栏 → 使用 `FilterBar` 组件样式
- 题目列表 → 从 `n-data-table` 改为卡片列表，每个题目一张卡片
- 题型/难度标签 → 使用 `tag-primary` / `tag-warning` / `tag-error` 语义色
- 表格 `bordered` 设为 `false`，用外层卡片容器包裹

#### PaperList.vue (`/views/paper/PaperList.vue`)
- 同 BankList，从表格改为 3 列卡片网格
- 每个卡片：试卷标题、题目数、总分、状态标签、创建者

#### WrongQuestionList.vue (`/views/wrongquestion/WrongQuestionList.vue`)
- 列表项使用 `list-item` 样式
- 错题标签使用 `tag-error` 色
- 添加"重做"按钮，使用 `btn-secondary` 样式

#### RecordList.vue (`/views/record/RecordList.vue`)
- 从表格改为卡片列表
- 每条记录：类型标签、得分/正确率、用时、日期
- 正确率使用进度条展示

#### SearchPage.vue (`/views/search/SearchPage.vue`)
- 搜索框居中大号，使用 `auth-card` 类似的居中布局
- 搜索结果使用 `list-item` 样式
- 高亮关键词使用 `text-brand` 色

#### NotificationList.vue (`/views/notification/NotificationList.vue`)
- 未读通知使用 `bg-selected` (primary-50) 背景区分
- 通知项使用 `list-item` 样式
- 已读/未读标签使用 `tag-primary` / `tag-default`

#### Profile.vue (`/views/profile/Profile.vue`)
- 顶部用户信息卡使用 `welcome-banner` 渐变背景
- 头像使用 `avatar-lg` 渐变色
- 表单使用统一的 Input 主题覆盖样式

#### UserList.vue (`/views/admin/UserList.vue`)
- 保持表格布局，但使用设计系统表格样式（`theme-overrides` 中 `DataTable` 配置自动生效）
- 角色标签：管理员 `tag-error`、教师 `tag-warning`、学生 `tag-primary`
- 状态标签：正常 `tag-success`、禁用 `tag-default`

#### ReviewList.vue (`/views/admin/ReviewList.vue`)
- 审核项使用卡片列表
- 状态标签：待审核 `tag-warning`、通过 `tag-success`、拒绝 `tag-error`

#### BankDetail.vue / QuestionDetail.vue / PaperDetail.vue
- 详情页头部使用 `PageHeader` 组件（标题 + 返回按钮 + 操作按钮）
- 内容区使用卡片容器包裹
- 题目展示使用 `option-item` 样式

#### ExamResult.vue (`/views/exam/ExamResult.vue`)
- 成绩展示使用 `stat-card` 大号数字
- 及格/不及格使用 `bg-success-50` / `bg-error-50` 背景
- 题目回顾使用 `list-item` 样式 + 答对/答错标签

---

## 8. 第七步：提取公共组件

在改造页面的过程中，以下模式反复出现，应提取为可复用组件。

### 8.1 StatCard.vue

**路径**：`frontend/src/components/StatCard.vue`

```vue
<template>
  <div class="bg-white border border-neutral-200 rounded-lg p-5">
    <div class="text-xs font-medium text-tertiary uppercase tracking-wide mb-2">
      {{ label }}
    </div>
    <div class="text-3xl font-bold text-neutral-900">
      <slot>{{ value }}</slot>
    </div>
    <div v-if="$slots.suffix" class="text-sm text-tertiary mt-1">
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number
}>()
</script>
```

### 8.2 PageHeader.vue

**路径**：`frontend/src/components/PageHeader.vue`

```vue
<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <n-button v-if="showBack" quaternary @click="$router.back()">
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
      </n-button>
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-tertiary mt-1">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowBackOutline } from '@vicons/ionicons5'

defineProps<{
  title: string
  subtitle?: string
  showBack?: boolean
}>()
</script>
```

### 8.3 FilterBar.vue

**路径**：`frontend/src/components/FilterBar.vue`

```vue
<template>
  <div class="flex gap-3 mb-6 flex-wrap items-center">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>
```

### 8.4 EmptyState.vue

**路径**：`frontend/src/components/EmptyState.vue`

```vue
<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <n-icon :size="48" class="text-neutral-300 mb-4">
      <component :is="icon" />
    </n-icon>
    <h3 class="text-base font-semibold text-secondary mb-2">{{ title }}</h3>
    <p class="text-sm text-tertiary">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { CubeOutline } from '@vicons/ionicons5'

withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: any
}>(), {
  title: '暂无数据',
  description: '',
  icon: CubeOutline
})
</script>
```

### 8.5 QuestionOption.vue

**路径**：`frontend/src/components/QuestionOption.vue`

```vue
<template>
  <div
    class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all mb-3"
    :class="containerClass"
    @click="!disabled && $emit('select')"
  >
    <div
      class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all"
      :class="markerClass"
    >
      {{ marker }}
    </div>
    <div class="flex-1 text-sm leading-relaxed pt-0.5 text-neutral-900">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  marker: string
  selected?: boolean
  correct?: boolean | null
  wrong?: boolean | null
  disabled?: boolean
}>(), {
  selected: false,
  correct: null,
  wrong: null,
  disabled: false
})

defineEmits<{ select: [] }>()

const containerClass = computed(() => {
  if (props.correct === true) return 'border-success-500 bg-success-50'
  if (props.wrong === true) return 'border-error-500 bg-error-50'
  if (props.selected) return 'border-primary-500 bg-primary-50'
  return props.disabled
    ? 'border-neutral-200 opacity-60'
    : 'border-neutral-200 hover:border-primary-300'
})

const markerClass = computed(() => {
  if (props.correct === true) return 'border-success-500 bg-success-500 text-white'
  if (props.wrong === true) return 'border-error-500 bg-error-500 text-white'
  if (props.selected) return 'border-primary-500 bg-primary-500 text-white'
  return 'border-neutral-300 text-secondary'
})
</script>
```

---

## 9. 检查清单

完成所有改造后，逐项验证：

- [ ] **Tailwind 配置已替换** — `tailwind.config.js` 中 `primary-500` 为 `#5B5FE9`，`neutral`/`success`/`error`/`warning`/`info` 色板已定义
- [ ] **全局样式已更新** — `body` 背景为 `#F4F4F6`，文字色为 `#242428`，字号为 14px，`design-tokens.css` 已引入
- [ ] **Naive UI 主题覆盖已应用** — `App.vue` 中 `<n-config-provider :theme-overrides="themeOverrides">` 包裹整个应用
- [ ] **MainLayout 侧边栏样式已更新** — QS 渐变 Logo 图标、分组菜单标签、活跃态使用 `primary-50` 背景
- [ ] **AuthLayout 登录页已重构** — 品牌渐变背景、居中白色卡片、QS Logo
- [ ] **所有页面颜色使用设计系统令牌** — 不再出现 `text-gray-800`、`bg-gray-50`、`#1890ff` 等旧色值
- [ ] **间距遵循 4px 网格** — 使用 `p-3`(12px)、`p-4`(16px)、`p-5`(20px)、`p-6`(24px)、`gap-4`(16px) 等
- [ ] **按钮样式统一** — 主按钮 Indigo + 品牌阴影 + 圆角 12px，通过 `theme-overrides` 统一
- [ ] **卡片使用边框而非阴影（默认）** — `border border-neutral-200 rounded-lg`，悬停时可选 `hover:shadow-sm`
- [ ] **表格样式统一** — 表头 `bg-subtle`、字体 14px、行悬停 `bg-neutral-50`
- [ ] **标签颜色语义正确** — 成功 `success-50/success-600`、错误 `error-50/error-600`、官方 `warning-50/warning-600`
- [ ] **响应式布局正常** — 移动端侧边栏可折叠，卡片网格列数自适应，内容区 `max-w-content` 居中

### 快速颜色检查

在项目中搜索以下旧色值，确认已全部替换：

```bash
# 以下旧色值不应再出现在 .vue 文件中（design/ 目录除外）：
# text-gray-800, text-gray-700, text-gray-600, text-gray-500
# bg-gray-50, bg-gray-100
# #1890ff, #52c41a, #faad14, #722ed1
# #c0c4cc, #909399
# #f5f7fa, #333
```

---

## 10. 常见问题

### Q: Naive UI 组件样式不生效（仍然显示绿色主题）？

**A:** 确认以下两点：

1. `App.vue` 中 `<n-config-provider :theme-overrides="themeOverrides">` 正确包裹了 `<router-view />`，且 `themeOverrides` 已正确导入。
2. `frontend/src/theme/overrides.ts` 文件中 `common.primaryColor` 已设为 `#5B5FE9`。

```vue
<!-- 正确 -->
<n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
  <n-loading-bar-provider>
    ...
    <router-view />
    ...
  </n-loading-bar-provider>
</n-config-provider>
```

```vue
<!-- 错误 — theme-overrides 未传入 -->
<n-config-provider :locale="zhCN" :date-locale="dateZhCN">
  <router-view />
</n-config-provider>
```

---

### Q: Tailwind 颜色类不生效（如 `bg-primary-500` 仍为旧色）？

**A:** 确认以下三点：

1. `frontend/tailwind.config.js` 已完整替换为设计系统配置（包含 `colors.primary` Indigo 色板）。
2. `content` 路径正确覆盖了所有 Vue 文件：`'./src/**/*.{vue,ts,tsx}'`。
3. Vite 开发服务器已重启（修改 `tailwind.config.js` 后需要重启 dev server 才能生效）。

```bash
# 重启开发服务器
cd frontend
npm run dev
```

---

### Q: 图标不显示？

**A:** 确认 `@vicons/ionicons5` 已安装：

```bash
cd frontend
npm install @vicons/ionicons5
```

并在组件中正确导入：

```ts
import { HomeOutline, LibraryOutline } from '@vicons/ionicons5'
```

注意：`@vicons/ionicons5` 的图标名称使用 **PascalCase + Outline/Sharp 后缀**，如 `HomeOutline`、`LibraryOutline`。

---

### Q: 卡片仍然有阴影？

**A:** 两步排查：

1. 确认 `theme-overrides` 中 `Card.boxShadow` 设为 `'none'`。
2. 如果是自定义 `div` 卡片（非 `n-card`），检查是否使用了 Tailwind `shadow-*` 类。默认应只用 `border border-neutral-200 rounded-lg`，悬停时可选 `hover:shadow-sm`。

---

### Q: CSS 变量（如 `var(--bg-page)`）不生效？

**A:** 确认 `design-tokens.css` 已在 `style.css` 中通过 `@import` 引入，且 `@import` 语句在 `@tailwind` 指令之后：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '../design/tokens/design-tokens.css';
```

如果路径不正确，CSS 变量将不会被定义，所有 `var(--*)` 引用将回退为无效值。

---

### Q: ECharts 图表颜色未更新？

**A:** ECharts 的 `itemStyle.color` 是在 JS 中直接设置的，不受 CSS 或 Tailwind 影响。需要手动修改 `StatisticsPage.vue` 中 `renderCharts()` 函数里的颜色值为设计系统色值（参见 [7.6.3](#766-echarts-图表配色更新)）。

---

### Q: 侧边栏菜单图标在折叠模式下不显示？

**A:** 自定义菜单结构中，图标使用 `<n-icon>` 组件包裹 `<component :is="item.icon" />`。在折叠模式下，需要通过 `v-if="!collapsed"` 控制文字部分的显示，但图标应始终显示。检查模板中是否误将图标也包裹在 `v-if="!collapsed"` 条件中。

---

### Q: `bg-brand-gradient` 不生效？

**A:** 确认 `tailwind.config.js` 中 `backgroundImage` 扩展已包含 `'brand-gradient'` 键：

```js
backgroundImage: {
  'brand-gradient': 'linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)',
  'brand-soft': 'linear-gradient(135deg, #EEF0FF 0%, #F5F0FF 100%)'
}
```

Tailwind 生成的类名为 `bg-brand-gradient`。如果使用 `bg-gradient-to-br from-primary-500 to-primary-700` 则是旧写法，应替换为 `bg-brand-gradient`。

---

### Q: 移动端侧边栏不弹出？

**A:** 检查 `MainLayout.vue` 中移动端遮罩和侧边栏的响应式类名逻辑。`mobileMenuVisible` 状态控制移动端菜单的显示/隐藏，确保遮罩 `div` 的 `@click` 正确关闭菜单。

---

## 11. 新增功能实现指南

> 本节覆盖设计系统新增的 10 项交互功能。所有代码示例均使用 **TypeScript + Vue 3 Composition API (`<script setup>`)** 风格编写，AI Agent 可直接参照实现。

---

### 11.1 可折叠侧边栏 (Collapsible Sidebar)

#### 设计要点

侧边栏可在展开 (240px) 与折叠 (64px) 两种宽度间切换，折叠后仅保留图标。状态需持久化到 `localStorage`，刷新页面后保持上一次的选择。

#### CSS 类

在 `design-tokens.css` 或 `components.css` 中新增以下工具类：

```css
/* 折叠状态：侧边栏宽度收缩到 64px */
.sidebar-collapsed {
  width: var(--sidebar-collapsed-width) !important; /* 64px */
}

/* 主内容区跟随侧边栏偏移 */
.main-area-collapsed {
  margin-left: var(--sidebar-collapsed-width); /* 64px */
}

/* 折叠/展开按钮 */
.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  cursor: pointer;
  z-index: 10;
  transition: all var(--transition-base);
}

.sidebar-toggle:hover {
  border-color: var(--color-primary-400);
  color: var(--text-brand);
}
```

#### Vue 实现

在 `MainLayout.vue` 中使用 `collapsed` ref，监听变化并持久化：

```vue
<template>
  <n-layout has-sider class="h-screen">
    <n-layout-sider
      bordered
      :collapsed="collapsed"
      :collapsed-width="64"
      :width="240"
      collapse-mode="width"
      show-trigger
      @update:collapsed="handleCollapse"
    >
      <!-- Logo 区域 -->
      <div class="flex items-center gap-3 h-header px-6 border-b border-neutral-200">
        <div class="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          QS
        </div>
        <span v-if="!collapsed" class="text-base font-bold text-neutral-900 whitespace-nowrap">
          Quick Study
        </span>
      </div>
      <!-- 菜单区域... -->
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered class="h-header flex items-center justify-between px-6">
        <!-- 顶栏内容 -->
      </n-layout-header>
      <n-layout-content :native-scrollbar="false" class="p-6">
        <div class="max-w-content mx-auto w-full">
          <router-view />
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 从 localStorage 读取初始状态，默认展开
const collapsed = ref(
  localStorage.getItem('sidebar-collapsed') === 'true'
)

function handleCollapse(value: boolean) {
  collapsed.value = value
}

// 监听变化并持久化
watch(collapsed, (val) => {
  localStorage.setItem('sidebar-collapsed', String(val))
})
</script>
```

#### 关键点

- 使用 `n-layout-sider` 的 `:collapsed` 和 `@update:collapsed` 实现双向控制。
- `show-trigger` 属性会在侧边栏边缘渲染一个折叠按钮，点击触发 `@update:collapsed`。
- 菜单文字使用 `v-if="!collapsed"` 控制显隐，图标始终显示。
- 首次访问时 `localStorage` 无值，`collapsed` 默认为 `false`（展开）。

---

### 11.2 暗色模式 (Dark Mode)

#### 设计要点

暗色模式通过 `[data-theme="dark"]` 选择器覆盖所有语义 CSS 变量，切换时只需修改 `<html>` 元素的 `data-theme` 属性。首次访问时需尊重系统 `prefers-color-scheme`，用户手动切换后持久化到 `localStorage`。

#### CSS 实现

在 `design-tokens.css` 末尾新增暗色主题覆盖块：

```css
/* === 暗色主题变量覆盖 === */
[data-theme="dark"] {
  /* 文字 */
  --text-primary: #FAFAFB;
  --text-secondary: #B0B0BC;
  --text-tertiary: #8A8A96;
  --text-brand: #9399FF;

  /* 背景 */
  --bg-page: #161618;
  --bg-card: #242428;
  --bg-subtle: #2A2A2E;
  --bg-hover: #2A2A2E;
  --bg-selected: #2D2895;

  /* 边框 */
  --border-default: #3A3A3E;
  --border-strong: #525258;
  --border-brand: #9399FF;

  /* 渐变（暗色下适当提亮） */
  --gradient-brand: linear-gradient(135deg, #6E75F5 0%, #9355E8 100%);
  --gradient-brand-soft: linear-gradient(135deg, #2D2895 0%, #3A35B8 100%);

  /* 阴影 */
  --shadow-brand: 0 4px 12px rgba(110, 117, 245, 0.35);
}

/* 暗色模式下 Naive UI 滚动条 */
[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: var(--color-neutral-700);
}
[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral-600);
}
```

#### Vue 实现

创建 `src/composables/useTheme.ts` composable：

```ts
// src/composables/useTheme.ts
import { ref, watch } from 'vue'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'quick-study-theme'

function getInitialTheme(): ThemeMode {
  // 1. 优先读取 localStorage
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored

  // 2. 首次访问，尊重系统偏好
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function useTheme() {
  const isDark = ref(getInitialTheme() === 'dark')

  function applyTheme(dark: boolean) {
    const mode: ThemeMode = dark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  // 初始化时立即应用
  applyTheme(isDark.value)

  // 监听变化
  watch(isDark, (val) => applyTheme(val))

  return { isDark, toggleTheme }
}
```

#### 在 App.vue 中应用

引入 `darkTheme` 并在 `n-config-provider` 上动态绑定：

```vue
<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme-overrides="themeOverrides"
    :theme="isDark ? darkTheme : null"
  >
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { zhCN, dateZhCN, darkTheme } from 'naive-ui'
import { themeOverrides } from '@/theme/overrides'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>
```

#### 在顶栏中添加切换按钮

```vue
<n-button quaternary circle @click="toggleTheme">
  <template #icon>
    <n-icon :size="20">
      <component :is="isDark ? SunnyOutline : MoonOutline" />
    </n-icon>
  </template>
</n-button>
```

```ts
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5'
```

#### 关键点

- `[data-theme="dark"]` 必须定义在 `:root` 变量声明之后，确保覆盖优先级。
- `n-config-provider` 的 `:theme` 传入 `darkTheme` 时，Naive UI 组件自动切换为暗色。
- `useTheme()` 在 `App.vue` 初始化时立即调用 `applyTheme()`，避免首屏闪烁 (FOUC)。
- `themeOverrides` 中的颜色值在暗色下可能需要微调；可在 `themeOverrides` 中根据 `isDark` 动态返回不同覆盖对象。

---

### 11.3 多语言 (i18n)

#### 设计要点

使用 `vue-i18n` 实现中英文切换。语言文件按模块组织，语言切换器放在顶栏，选择持久化到 `localStorage`。

#### 安装依赖

```bash
cd frontend
npm install vue-i18n
```

#### 创建语言文件

`src/locales/zh-CN.json`：

```json
{
  "common": {
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索",
    "loading": "加载中...",
    "empty": "暂无数据"
  },
  "menu": {
    "home": "首页",
    "banks": "题库",
    "questions": "题目",
    "papers": "试卷",
    "practice": "练习",
    "wrongQuestions": "错题本",
    "records": "做题记录",
    "statistics": "统计",
    "notifications": "通知",
    "logout": "退出登录"
  },
  "home": {
    "welcomeBack": "欢迎回来，{name}",
    "welcomeGuest": "欢迎光临",
    "welcomeSubtitleUser": "今天也要加油学习哦！",
    "welcomeSubtitleGuest": "登录后即可开始练习和考试"
  },
  "exam": {
    "submit": "交卷",
    "nextQuestion": "下一题",
    "prevQuestion": "上一题",
    "flagQuestion": "标记本题"
  }
}
```

`src/locales/en-US.json`：

```json
{
  "common": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "loading": "Loading...",
    "empty": "No data"
  },
  "menu": {
    "home": "Home",
    "banks": "Question Banks",
    "questions": "Questions",
    "papers": "Papers",
    "practice": "Practice",
    "wrongQuestions": "Wrong Questions",
    "records": "Records",
    "statistics": "Statistics",
    "notifications": "Notifications",
    "logout": "Logout"
  },
  "home": {
    "welcomeBack": "Welcome back, {name}",
    "welcomeGuest": "Welcome",
    "welcomeSubtitleUser": "Let's study hard today!",
    "welcomeSubtitleGuest": "Log in to start practice and exams"
  },
  "exam": {
    "submit": "Submit",
    "nextQuestion": "Next",
    "prevQuestion": "Previous",
    "flagQuestion": "Flag"
  }
}
```

#### 创建 i18n 实例

`src/locales/index.ts`：

```ts
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import enUS from './en-US.json'

export type Locale = 'zh-CN' | 'en-US'

const STORAGE_KEY = 'quick-study-locale'

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored === 'zh-CN' || stored === 'en-US') return stored

  // 根据浏览器语言推断
  const lang = navigator.language
  return lang.startsWith('zh') ? 'zh-CN' : 'en-US'
}

const i18n = createI18n({
  legacy: false,                 // 使用 Composition API 模式
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
}

export default i18n
```

在 `main.ts` 中注册：

```ts
import { createApp } from 'vue'
import i18n from './locales'

const app = createApp(App)
app.use(i18n)
// app.use(pinia).use(router)...
app.mount('#app')
```

#### 在组件中使用

```vue
<template>
  <span>{{ t('menu.home') }}</span>
  <h1>{{ t('home.welcomeBack', { name: userName }) }}</h1>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

#### 语言切换器（放在顶栏）

```vue
<template>
  <n-dropdown :options="localeOptions" @select="handleLocaleChange">
    <n-button quaternary>
      <template #icon>
        <n-icon><LanguageOutline /></n-icon>
      </template>
      {{ currentLabel }}
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LanguageOutline } from '@vicons/ionicons5'
import { setLocale, type Locale } from '@/locales'

const { locale } = useI18n()

const localeOptions = [
  { label: '中文', key: 'zh-CN' },
  { label: 'English', key: 'en-US' },
]

const currentLabel = computed(() =>
  locale.value === 'zh-CN' ? '中文' : 'English'
)

function handleLocaleChange(key: string) {
  setLocale(key as Locale)
}
</script>
```

#### 关键点

- `legacy: false` 必须设置，否则 `useI18n()` 的 `t` 函数无法在 `<script setup>` 中使用。
- 菜单标签等动态文案需全部替换为 `t('menu.xxx')` 调用。
- 语言切换后无需刷新页面，`vue-i18n` 会自动响应 `locale.value` 变化。

---

### 11.4 侧边栏徽章 (Sidebar Badges)

#### 设计要点

在侧边栏导航项右侧显示数字徽章（如错题数量、未读通知数），徽章数据从 API 获取并实时更新。

#### CSS 类

```css
.sidebar-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  border-radius: var(--radius-full);
  background: var(--color-error-500);
  color: #fff;
  margin-left: auto;
}

/* 品牌色徽章（如通知未读数） */
.sidebar-badge.brand {
  background: var(--color-primary-500);
}

/* 折叠模式下徽章显示为小圆点 */
.sidebar-collapsed .sidebar-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 8px;
  height: 8px;
  padding: 0;
  font-size: 0;
}
```

#### Vue 实现

在 `MainLayout.vue` 中获取徽章数据并渲染：

```vue
<template>
  <nav class="flex-1 p-3 overflow-y-auto">
    <template v-for="(group, gi) in menuGroups" :key="gi">
      <!-- 分组标签 -->
      <div
        v-if="group.label"
        class="text-xs font-semibold text-tertiary uppercase tracking-wide px-3 py-2 mt-2"
      >
        {{ group.label }}
      </div>
      <!-- 菜单项 -->
      <div
        v-for="item in group.items"
        :key="item.key"
        class="relative flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors mb-0.5"
        :class="activeMenu === item.key
          ? 'bg-primary-50 text-primary-600 font-semibold'
          : 'text-neutral-600 font-medium hover:bg-neutral-100 hover:text-neutral-900'"
        @click="handleMenuSelect(item.key)"
      >
        <n-icon :size="20" class="flex-shrink-0">
          <component :is="item.icon" />
        </n-icon>
        <span v-if="!collapsed" class="text-sm">{{ item.label }}</span>
        <!-- 徽章 -->
        <span
          v-if="badgeCounts[item.key] > 0 && !collapsed"
          class="sidebar-badge"
          :class="{ 'brand': item.badgeType === 'brand' }"
        >
          {{ badgeCounts[item.key] }}
        </span>
        <span
          v-if="badgeCounts[item.key] > 0 && collapsed"
          class="sidebar-badge"
          :class="{ 'brand': item.badgeType === 'brand' }"
        />
      </div>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 徽章计数：key 为菜单 key，value 为数量
const badgeCounts = ref<Record<string, number>>({})

async function fetchBadgeCounts() {
  if (!authStore.isAuthenticated) return
  try {
    const [wrongRes, notifRes] = await Promise.all([
      fetch('/api/wrong-questions/count').then(r => r.json()),
      fetch('/api/notifications/unread-count').then(r => r.json()),
    ])
    badgeCounts.value = {
      '/wrong-questions': wrongRes.data?.count ?? 0,
      '/notifications': notifRes.data?.count ?? 0,
    }
  } catch {
    // 静默失败，徽章不显示
  }
}

onMounted(fetchBadgeCounts)
</script>
```

#### 关键点

- 徽章数量为 0 时不渲染 (`v-if="badgeCounts[key] > 0"`)。
- 折叠模式下徽章变为小圆点，通过 `.sidebar-collapsed .sidebar-badge` 样式覆盖。
- API 返回数据后赋值给 `badgeCounts`，Vue 响应式自动更新视图。
- 可在路由切换或 `onMounted` 时刷新徽章数据。

---

### 11.5 键盘快捷键 (Keyboard Shortcuts)

#### 设计要点

在考试/练习页面支持键盘操作：`A/B/C/D` 选择选项，`ArrowLeft/ArrowRight` 切换题目，`F` 标记本题，`Enter` 进入下一题。使用 VueUse 的 `useEventListener` 绑定全局键盘事件。

#### CSS 类

```css
/* 键盘按键提示样式 */
.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  box-shadow: 0 1px 0 var(--border-default);
}

/* 快捷键提示区域 */
.kbd-hints {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 选项上的键盘标记 */
.option-kbd {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  opacity: 0.5;
  transition: opacity var(--transition-base);
}

.option-item:hover .option-kbd {
  opacity: 1;
}
```

#### Vue 实现

在 `ExamPage.vue`（或 `PracticePage.vue`）中添加键盘监听：

```vue
<template>
  <div class="min-h-screen bg-neutral-100" tabindex="0" ref="rootRef">
    <!-- 顶部 sticky header -->
    <div class="bg-white border-b border-neutral-200 sticky top-0 z-sticky">
      <div class="max-w-content mx-auto px-6 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold text-neutral-900 truncate">{{ paperTitle }}</h1>
        <!-- 快捷键提示 -->
        <div class="kbd-hints">
          <span><kbd class="kbd">A-D</kbd> 选择</span>
          <span><kbd class="kbd">←</kbd>/<kbd class="kbd">→</kbd> 切换</span>
          <span><kbd class="kbd">F</kbd> 标记</span>
          <span><kbd class="kbd">Enter</kbd> 下一题</span>
        </div>
      </div>
    </div>

    <!-- 答题区域 -->
    <div class="max-w-content mx-auto p-6">
      <div class="bg-white border border-neutral-200 rounded-lg p-6">
        <!-- 选项 -->
        <div
          v-for="(opt, idx) in parsedOptions"
          :key="idx"
          class="option-item relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all mb-3"
          :class="getOptionClass(idx)"
          @click="selectAnswer(String.fromCharCode(65 + idx))"
        >
          <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {{ String.fromCharCode(65 + idx) }}
          </div>
          <div class="flex-1 text-sm leading-relaxed pt-0.5">{{ opt }}</div>
          <kbd class="kbd option-kbd">{{ String.fromCharCode(65 + idx) }}</kbd>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const rootRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const currentAnswers = ref<Record<string, string>>({})
const markedForReview = ref<Set<number>>(new Set())
const questions = ref<any[]>([])

const currentQuestion = computed(() => questions.value[currentIndex.value])
const parsedOptions = computed(() => {
  // 解析当前题目的选项
  return currentQuestion.value?.options || []
})

function selectAnswer(letter: string) {
  if (currentQuestion.value) {
    currentAnswers.value[currentQuestion.value.id] = letter
  }
}

function goToIndex(index: number) {
  if (index >= 0 && index < questions.value.length) {
    currentIndex.value = index
  }
}

function nextQuestion() {
  goToIndex(currentIndex.value + 1)
}

function prevQuestion() {
  goToIndex(currentIndex.value - 1)
}

function toggleFlag() {
  const idx = currentIndex.value
  if (markedForReview.value.has(idx)) {
    markedForReview.value.delete(idx)
  } else {
    markedForReview.value.add(idx)
  }
}

function handleKeydown(e: KeyboardEvent) {
  // 如果焦点在输入框中，不拦截键盘事件
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

  const key = e.key.toUpperCase()
  switch (key) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
      e.preventDefault()
      selectAnswer(key)
      break
    case 'ARROWLEFT':
      e.preventDefault()
      prevQuestion()
      break
    case 'ARROWRIGHT':
      e.preventDefault()
      nextQuestion()
      break
    case 'F':
      e.preventDefault()
      toggleFlag()
      break
    case 'ENTER':
      e.preventDefault()
      nextQuestion()
      break
  }
}

onMounted(() => {
  rootRef.value?.focus()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
```

#### 使用 VueUse 的 `useEventListener`（推荐写法）

如果项目中已安装 `@vueuse/core`，可简化事件绑定与自动清理：

```ts
import { useEventListener } from '@vueuse/core'

// 自动在 onUnmounted 时移除监听
useEventListener(window, 'keydown', handleKeydown)
```

#### 关键点

- 页面根元素设置 `tabindex="0"` 确保可获焦，但键盘事件绑定在 `window` 上以避免焦点丢失。
- 当焦点在 `input` / `textarea` 中时跳过快捷键，避免影响输入。
- 选项上的 `<kbd class="kbd option-kbd">` 标记在 hover 时增强可见度。
- `e.preventDefault()` 阻止浏览器默认行为（如 ArrowLeft 滚动页面）。

---

### 11.6 回到顶部 (Back to Top)

#### 设计要点

页面滚动超过 400px 时显示"回到顶部"按钮，点击平滑滚动回顶部。使用 VueUse 的 `useScroll` 或原生 scroll listener 实现。

#### CSS 类

```css
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  color: var(--text-secondary);
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: all var(--transition-base);
  z-index: 100;
}

.back-to-top:hover {
  border-color: var(--color-primary-400);
  color: var(--text-brand);
  box-shadow: var(--shadow-brand);
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

#### Vue 实现（使用 VueUse `useScroll`）

创建 `src/components/BackToTop.vue`：

```vue
<template>
  <div
    v-show="show"
    class="back-to-top"
    :class="{ visible: show }"
    @click="scrollToTop"
  >
    <n-icon :size="20">
      <ArrowUpOutline />
    </n-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScroll } from '@vueuse/core'
import { ArrowUpOutline } from '@vicons/ionicons5'

// 监听 window 滚动
const { y } = useScroll(window)

const show = computed(() => y.value > 400)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
```

#### Vue 实现（原生 scroll listener，无需 VueUse）

```vue
<template>
  <div
    v-show="show"
    class="back-to-top"
    :class="{ visible: show }"
    @click="scrollToTop"
  >
    <n-icon :size="20"><ArrowUpOutline /></n-icon>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUpOutline } from '@vicons/ionicons5'

const show = ref(false)

function handleScroll() {
  show.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>
```

#### 使用

在 `MainLayout.vue` 的内容区底部放置该组件：

```vue
<n-layout-content :native-scrollbar="false" class="p-6">
  <div class="max-w-content mx-auto w-full">
    <router-view />
  </div>
  <BackToTop />
</n-layout-content>
```

#### 关键点

- `useScroll` 的 `{ passive: true }` 选项避免阻塞滚动性能。
- 按钮通过 `.visible` 类控制透明度和位移，实现淡入淡出动画。
- `window.scrollTo({ behavior: 'smooth' })` 实现平滑滚动。
- 如果内容区使用 Naive UI 的 `native-scrollbar="false"`（虚拟滚动），需监听 Naive UI 滚动容器的 scroll 事件而非 window。

---

### 11.7 Toast 消息提示 (Toast Notifications)

#### 设计要点

提供 success / error / info / warning 四种消息提示。推荐直接使用 Naive UI 的 `useMessage()` composable；如需自定义样式，可创建独立的 toast store。

#### CSS 类（自定义 toast 样式时使用）

```css
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 2000;
  animation: toast-in var(--transition-base) ease;
}

.toast-success { background: var(--color-success-50); color: var(--color-success-700); border: 1px solid var(--color-success-100); }
.toast-error   { background: var(--color-error-50);   color: var(--color-error-700);   border: 1px solid var(--color-error-100); }
.toast-info    { background: var(--color-info-50);    color: var(--color-info-600);    border: 1px solid var(--color-info-50); }
.toast-warning { background: var(--color-warning-50); color: var(--color-warning-700); border: 1px solid var(--color-warning-100); }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

#### 方案 A：使用 Naive UI `useMessage()`（推荐）

Naive UI 的 `useMessage()` 已在 `App.vue` 的 `<n-message-provider>` 中全局注册，组件内直接调用：

```vue
<template>
  <n-button @click="handleSave">保存</n-button>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'

const message = useMessage()

function handleSave() {
  // API 调用成功
  message.success('保存成功')
  // API 调用失败
  message.error('保存失败，请重试')
  // 普通提示
  message.info('请填写完整信息')
  // 警告提示
  message.warning('该操作不可撤销')
}
</script>
```

#### 方案 B：创建全局 toast composable

如果需要在非组件上下文（如 axios 拦截器）中使用，创建一个封装 composable：

```ts
// src/composables/useToast.ts
import { useMessage } from 'naive-ui'

let messageApi: ReturnType<typeof useMessage> | null = null

export function setMessageInstance(instance: ReturnType<typeof useMessage>) {
  messageApi = instance
}

export function useToast() {
  const message = messageApi ?? useMessage()

  return {
    success: (content: string) => message.success(content),
    error: (content: string) => message.error(content),
    info: (content: string) => message.info(content),
    warning: (content: string) => message.warning(content),
  }
}
```

在 `App.vue` 中初始化：

```vue
<template>
  <n-config-provider ...>
    <n-message-provider>
      <MessageBridge />
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { setMessageInstance } from '@/composables/useToast'

const MessageBridge = defineComponent({
  setup() {
    setMessageInstance(useMessage())
    return () => null
  }
})
</script>
```

在 axios 拦截器中使用：

```ts
import { useToast } from '@/composables/useToast'

const { error } = useToast()

// 响应拦截器
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    error(err.response?.data?.message || '网络错误，请稍后重试')
    return Promise.reject(err)
  }
)
```

#### 关键点

- `useMessage()` 必须在 `<n-message-provider>` 的子组件中调用，否则会报错。
- 方案 B 通过 `MessageBridge` 组件在 provider 内部获取实例并保存到模块变量，使非组件代码也能调用。
- 四种类型对应 Naive UI：`message.success()` / `message.error()` / `message.info()` / `message.warning()`。

---

### 11.8 骨架屏 (Skeleton Loading)

#### 设计要点

在数据加载期间显示骨架屏占位，避免页面空白闪烁。使用 `v-if/v-else` 在 `loading` 状态下切换骨架与真实内容。可使用 Naive UI 的 `n-skeleton` 组件，或自定义 CSS 类。

#### CSS 类

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-subtle) 25%,
    var(--bg-hover) 37%,
    var(--bg-subtle) 63%
  );
  background-size: 400% 100%;
  border-radius: var(--radius-md);
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-text {
  height: 14px;
  margin-bottom: 8px;
  border-radius: var(--radius-sm);
}

.skeleton-text:last-child {
  width: 60%;
}

.skeleton-card {
  height: 120px;
  border-radius: var(--radius-lg);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}

@keyframes skeleton-shimmer {
  0%   { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
```

#### Vue 实现（自定义骨架屏）

```vue
<template>
  <!-- 加载中：骨架屏 -->
  <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="i in 6"
      :key="i"
      class="bg-white border border-neutral-200 rounded-lg p-5"
    >
      <div class="flex items-start justify-between mb-3">
        <div class="skeleton skeleton-text" style="width: 60%; height: 20px;" />
        <div class="skeleton" style="width: 40px; height: 20px; border-radius: 6px;" />
      </div>
      <div class="skeleton skeleton-text" style="width: 100%;" />
      <div class="skeleton skeleton-text" style="width: 80%;" />
      <div class="flex items-center gap-4 mb-3 mt-3">
        <div class="skeleton" style="width: 60px; height: 14px;" />
        <div class="skeleton" style="width: 60px; height: 14px;" />
      </div>
      <div class="flex items-center gap-2 pt-3 border-t border-neutral-200">
        <div class="skeleton skeleton-avatar" />
        <div class="skeleton" style="width: 80px; height: 14px;" />
      </div>
    </div>
  </div>

  <!-- 加载完成：真实内容 -->
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="bank in bankList"
      :key="bank.id"
      class="bg-white border border-neutral-200 rounded-lg p-5"
    >
      <!-- 真实卡片内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const bankList = ref<any[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/api/banks').then(r => r.json())
    bankList.value = res.data || []
  } finally {
    loading.value = false
  }
})
</script>
```

#### 使用 Naive UI `n-skeleton`（推荐）

```vue
<template>
  <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <n-card v-for="i in 6" :key="i" class="!p-5">
      <template #header>
        <n-skeleton text :width="60" />
      </template>
      <n-skeleton text :repeat="2" />
      <div class="flex items-center gap-2 mt-3">
        <n-skeleton circle />
        <n-skeleton text :width="80" />
      </div>
    </n-card>
  </div>
  <div v-else>
    <!-- 真实内容 -->
  </div>
</template>
```

#### 关键点

- `skeleton-text:last-child` 设置 `width: 60%` 模拟段落末尾渐变收尾。
- 骨架数量建议与实际数据列表的预期行数一致（如 6 个卡片）。
- `n-skeleton` 的 `:repeat` 属性可快速生成多行占位。
- `loading` 状态在 API 请求完成后置为 `false`，触发 `v-if/v-else` 切换。

---

### 11.9 确认弹窗 (Confirm Dialog)

#### 设计要点

在执行不可逆操作（如删除、交卷）前弹出确认对话框。推荐使用 Naive UI 的 `useDialog()` composable；如需自定义视觉，可创建独立的 confirm 组件。

#### CSS 类（自定义 confirm 组件时使用）

```css
.confirm-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirm-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-warning-50);
  color: var(--color-warning-500);
  margin-bottom: 4px;
}

.confirm-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.confirm-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}
```

#### 方案 A：使用 Naive UI `useDialog()`（推荐）

```vue
<template>
  <n-button type="error" @click="handleDelete">删除题库</n-button>
  <n-button type="error" @click="handleSubmit">交卷</n-button>
</template>

<script setup lang="ts">
import { useDialog } from 'naive-ui'

const dialog = useDialog()

function handleDelete() {
  dialog.warning({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除该题库吗？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      // 执行删除
      deleteBank()
    },
  })
}

function handleSubmit() {
  dialog.warning({
    title: '确认交卷',
    content: '交卷后将无法修改答案，确定要提交吗？',
    positiveText: '确认交卷',
    negativeText: '再检查一下',
    onPositiveClick: () => {
      submitExam()
    },
  })
}

async function deleteBank() { /* ... */ }
async function submitExam() { /* ... */ }
</script>
```

#### 方案 B：创建全局 confirm composable

便于在非组件上下文（如 store action）中使用：

```ts
// src/composables/useConfirm.ts
import { useDialog } from 'naive-ui'

interface ConfirmOptions {
  title: string
  content: string
  positiveText?: string
  negativeText?: string
  onPositiveClick?: () => void | Promise<void>
}

let dialogApi: ReturnType<typeof useDialog> | null = null

export function setDialogInstance(instance: ReturnType<typeof useDialog>) {
  dialogApi = instance
}

export function useConfirm() {
  const dialog = dialogApi ?? useDialog()

  return function confirm(options: ConfirmOptions) {
    dialog.warning({
      title: options.title,
      content: options.content,
      positiveText: options.positiveText || '确认',
      negativeText: options.negativeText || '取消',
      onPositiveClick: options.onPositiveClick,
    })
  }
}
```

在 `App.vue` 中初始化（与 `MessageBridge` 类似）：

```vue
<n-dialog-provider>
  <DialogBridge />
  <router-view />
</n-dialog-provider>
```

```ts
import { useDialog } from 'naive-ui'
import { setDialogInstance } from '@/composables/useConfirm'

const DialogBridge = defineComponent({
  setup() {
    setDialogInstance(useDialog())
    return () => null
  }
})
```

#### 关键点

- `useDialog()` 必须在 `<n-dialog-provider>` 的子组件中调用。
- `dialog.warning()` 最适合确认操作；也可用 `dialog.error()` 表示危险操作。
- `onPositiveClick` 返回 `Promise` 时，确认按钮会显示 loading 直到 Promise resolve。
- 方案 B 的 `useConfirm()` 返回一个函数，调用时弹出确认框，便于在 store 中链式调用。

---

### 11.10 移动端适配 (Mobile Responsive)

#### 设计要点

在 `< 768px` 屏幕下：侧边栏变为抽屉式 (drawer) 配合遮罩层，卡片网格列数收缩，顶栏搜索框和语言切换器隐藏。通过 media query 和 Vue 状态检测实现。

#### CSS 实现

在 `style.css` 或 `components.css` 中新增移动端规则：

```css
/* === 移动端遮罩层 === */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-base), visibility var(--transition-base);
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* === 移动端菜单按钮 === */
.mobile-menu-btn {
  display: none;
}

/* === 响应式断点 < 768px === */
@media (max-width: 768px) {
  /* 移动端菜单按钮显示 */
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 顶栏搜索框隐藏 */
  .header-search {
    display: none;
  }

  /* 语言切换器隐藏 */
  .header-locale-switch {
    display: none;
  }

  /* 侧边栏变为固定定位抽屉 */
  .sidebar {
    position: fixed !important;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 60;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  /* 内容区全宽，无左边距 */
  .main-area {
    margin-left: 0 !important;
  }

  /* 卡片网格：3 列 → 1 列 */
  .grid-responsive-3 {
    grid-template-columns: 1fr !important;
  }

  /* 卡片网格：4 列 → 2 列 */
  .grid-responsive-4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* 卡片网格：5 列 → 2 列 */
  .grid-responsive-5 {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* 内容区内边距缩小 */
  .content-area {
    padding: 16px !important;
  }

  /* 顶栏内边距缩小 */
  .header-area {
    padding: 0 16px !important;
  }
}
```

#### Vue 实现

在 `MainLayout.vue` 中检测屏幕宽度并控制移动端侧边栏：

```vue
<template>
  <div class="h-screen flex">
    <!-- 移动端遮罩 -->
    <div
      class="sidebar-overlay"
      :class="{ active: mobileOpen }"
      @click="mobileOpen = false"
    />

    <!-- 侧边栏 -->
    <aside
      class="sidebar w-sidebar bg-white border-r border-neutral-200 flex flex-col"
      :class="{ 'mobile-open': mobileOpen }"
    >
      <!-- Logo + 菜单（同 11.1 / 11.4） -->
    </aside>

    <!-- 主区域 -->
    <div class="main-area flex-1 flex flex-col min-w-0">
      <!-- 顶栏 -->
      <header class="header-area h-header flex items-center justify-between px-6 bg-white border-b border-neutral-200">
        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn mr-3" @click="mobileOpen = true">
          <n-icon :size="24"><MenuOutline /></n-icon>
        </button>
        <!-- 面包屑 -->
        <n-breadcrumb class="flex-1">
          <n-breadcrumb-item class="text-sm text-tertiary">{{ currentPageTitle }}</n-breadcrumb-item>
        </n-breadcrumb>
        <!-- 右侧操作（搜索 + 语言切换在移动端隐藏） -->
        <div class="flex items-center gap-3">
          <div class="header-search">
            <n-input placeholder="搜索..." style="width: 200px;" />
          </div>
          <div class="header-locale-switch">
            <!-- 语言切换器 -->
          </div>
          <n-avatar round size="small" :style="{ background: avatarBgColor }">
            {{ avatarText }}
          </n-avatar>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="content-area flex-1 overflow-y-auto p-6">
        <div class="max-w-content mx-auto w-full">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MenuOutline } from '@vicons/ionicons5'

const mobileOpen = ref(false)
const isMobile = ref(false)

function checkScreen() {
  isMobile.value = window.innerWidth < 768
  // 切换到桌面端时关闭移动菜单
  if (!isMobile.value) mobileOpen.value = false
}

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})
</script>
```

#### 卡片网格响应式类名

在页面中使用 Tailwind 的响应式前缀实现网格列数收缩：

```vue
<!-- 3 列 → 1 列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 卡片 -->
</div>

<!-- 4 列 → 2 列 -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <!-- 卡片 -->
</div>

<!-- 5 列 → 2 列 -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
  <!-- 卡片 -->
</div>
```

#### 关键点

- 移动端侧边栏使用 `position: fixed` + `transform: translateX(-100%)` 隐藏，添加 `.mobile-open` 后 `translateX(0)` 滑入。
- 遮罩层 `.sidebar-overlay.active` 覆盖全屏，点击关闭侧边栏。
- 路由切换时应自动关闭移动端菜单：可在 `watch(route)` 中设置 `mobileOpen.value = false`。
- `.header-search` 和 `.header-locale-switch` 在 `@media (max-width: 768px)` 下 `display: none`。
- 卡片网格优先使用 Tailwind 响应式前缀 (`md:`/`lg:`)，仅在需要精确控制时使用自定义 `.grid-responsive-*` 类。

---

*本指南基于 Quick Study Web 设计系统 v1.0.0 编写。如设计令牌更新，请同步更新本指南中的色值和配置代码。*
