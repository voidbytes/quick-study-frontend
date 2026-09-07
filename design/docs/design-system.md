# Quick Study Web 设计系统

> 版本：1.0.0 | 更新日期：2026-09-03 | 框架：Vue 3 + Tailwind CSS + Naive UI

***

## 目录

1. [概述](#1-概述)
2. [色彩系统 (Color System)](#2-色彩系统-color-system)
3. [字体系统 (Typography)](#3-字体系统-typography)
4. [间距系统 (Spacing)](#4-间距系统-spacing)
5. [圆角系统 (Border Radius)](#5-圆角系统-border-radius)
6. [阴影系统 (Elevation)](#6-阴影系统-elevation)
7. [布局系统 (Layout)](#7-布局系统-layout)
8. [Naive UI 主题覆盖](#8-naive-ui-主题覆盖)
9. [Tailwind CSS 配置](#9-tailwind-css-配置)

***

## 1. 概述

本文档是 **Quick Study（题库与组卷练习系统）** Web 端的设计系统规范。

- **技术栈**：Vue 3 + Tailwind CSS + Naive UI

- **设计来源**：从移动端 App 的 Indigo 色系设计系统适配至 Web 端，保持品牌一致性

- **目标读者**：AI 代码生成器、前端开发者、UI 设计师

- **设计原则**：紧凑、专业、Indigo 品牌色驱动，Web 端偏紧凑（正文 14px），强调可读性与信息密度

本设计系统的所有令牌均以两种格式提供：

| 格式                    | 文件路径                               | 用途                              |
| --------------------- | ---------------------------------- | ------------------------------- |
| CSS Custom Properties | `design/tokens/design-tokens.css`  | Vue 组件中直接引用 `var(--token-name)` |
| JSON                  | `design/tokens/design-tokens.json` | AI 程序化读取、工具链集成                  |
| Tailwind Config       | `design/tokens/tailwind.config.js` | Tailwind 工具类映射                  |

***

## 2. 色彩系统 (Color System)

### 2.1 主色 / 品牌色 — Indigo

主色 `#5B5FE9`（primary-500）用于按钮、链接、选中态等品牌强调场景。

| Token                 | 值         | 语义        | 用途              |
| --------------------- | --------- | --------- | --------------- |
| `--color-primary-50`  | `#EEF0FF` | 最浅底色      | 选中态背景、品牌浅底      |
| `--color-primary-100` | `#DBDEFF` | 浅底色       | Hover 浅底、品牌徽章背景 |
| `--color-primary-200` | `#B8BEFF` | 浅色        | 品牌边框浅态          |
| `--color-primary-300` | `#9399FF` | 中浅色       | 辅助品牌色           |
| `--color-primary-400` | `#6E75F5` | Hover 色   | 主按钮 Hover 态     |
| `--color-primary-500` | `#5B5FE9` | **主色**    | 按钮、链接、选中态、品牌强调  |
| `--color-primary-600` | `#4A48D4` | Pressed 色 | 主按钮按下态          |
| `--color-primary-700` | `#3A35B8` | 深色        | 深色品牌文字          |
| `--color-primary-800` | `#2D2895` | 更深色       | 深色场景            |
| `--color-primary-900` | `#1F1E6B` | 最深色       | 深色品牌底           |

### 2.2 语义色

#### 成功 (Success / 正确)

| Token                 | 值         | 用途         |
| --------------------- | --------- | ---------- |
| `--color-success-50`  | `#E8F9F0` | 成功浅底       |
| `--color-success-100` | `#C5F0D8` | 成功徽章背景     |
| `--color-success-500` | `#22B570` | 成功主色（答对提示） |
| `--color-success-600` | `#1A965C` | 成功文字色      |
| `--color-success-700` | `#0F7A48` | 成功深色       |

#### 错误 (Error / 错误)

| Token               | 值         | 用途         |
| ------------------- | --------- | ---------- |
| `--color-error-50`  | `#FFEFEC` | 错误浅底       |
| `--color-error-100` | `#FCD3CC` | 错误徽章背景     |
| `--color-error-500` | `#F0503C` | 错误主色（答错提示） |
| `--color-error-600` | `#D63A28` | 错误文字色      |
| `--color-error-700` | `#B22A1A` | 错误深色       |

#### 警告 (Warning / 官方 / 倒计时)

| Token                 | 值         | 用途             |
| --------------------- | --------- | -------------- |
| `--color-warning-50`  | `#FFF8E6` | 警告浅底           |
| `--color-warning-100` | `#FFE9B8` | 警告徽章背景         |
| `--color-warning-500` | `#FFA42B` | 警告主色（倒计时、官方标记） |
| `--color-warning-600` | `#E68A00` | 警告文字色          |
| `--color-warning-700` | `#B86D00` | 警告深色           |

#### 信息 (Info)

| Token              | 值         | 用途    |
| ------------------ | --------- | ----- |
| `--color-info-50`  | `#E8F1FF` | 信息浅底  |
| `--color-info-500` | `#3B8BFF` | 信息主色  |
| `--color-info-600` | `#1E6FE0` | 信息文字色 |

### 2.3 中性灰 (Neutral)

| Token                 | 值         | 语义   | 用途                      |
| --------------------- | --------- | ---- | ----------------------- |
| `--color-neutral-0`   | `#FFFFFF` | 白色   | 卡片背景、反色文字               |
| `--color-neutral-50`  | `#FAFAFB` | 极浅灰  | 嵌套区域背景 (bg-subtle)      |
| `--color-neutral-100` | `#F4F4F6` | 浅灰   | 页面背景 (bg-page)、Hover 背景 |
| `--color-neutral-200` | `#E8E8EC` | 边框灰  | 默认边框色                   |
| `--color-neutral-300` | `#D5D5DC` | 强调边框 | 强调边框、分割线                |
| `--color-neutral-400` | `#B0B0BC` | 禁用色  | 禁用文字、禁用边框               |
| `--color-neutral-500` | `#8A8A96` | 辅助文字 | 辅助文字 (text-tertiary)    |
| `--color-neutral-600` | `#6B6B76` | 次要文字 | 次要文字 (text-secondary)   |
| `--color-neutral-700` | `#525258` | 深灰   | 深色辅助文字                  |
| `--color-neutral-800` | `#3A3A3E` | 极深灰  | 深色文字                    |
| `--color-neutral-900` | `#242428` | 主要文字 | 正文文字 (text-primary)     |
| `--color-neutral-950` | `#161618` | 最深灰  | 极深背景                    |

### 2.4 文字色映射

| 语义 Token           | 值         | 对应中性灰       | 用途               |
| ------------------ | --------- | ----------- | ---------------- |
| `--text-primary`   | `#242428` | neutral-900 | **主要文字** — 标题、正文 |
| `--text-secondary` | `#6B6B76` | neutral-600 | 次要文字 — 时间戳、描述    |
| `--text-tertiary`  | `#8A8A96` | neutral-500 | 辅助文字 — 占位符、提示    |
| `--text-disabled`  | `#B0B0BC` | neutral-400 | 禁用文字             |
| `--text-inverse`   | `#FFFFFF` | neutral-0   | 反色文字（深色/品牌背景上）   |
| `--text-brand`     | `#5B5FE9` | primary-500 | 品牌文字 — 链接、强调     |
| `--text-success`   | `#1A965C` | success-600 | 成功文字 — 答对提示      |
| `--text-error`     | `#D63A28` | error-600   | 错误文字 — 答错提示      |

### 2.5 背景色映射

| 语义 Token        | 值         | 对应色         | 用途               |
| --------------- | --------- | ----------- | ---------------- |
| `--bg-page`     | `#F4F4F6` | neutral-100 | **页面背景** — 最外层底色 |
| `--bg-card`     | `#FFFFFF` | neutral-0   | 卡片背景             |
| `--bg-subtle`   | `#FAFAFB` | neutral-50  | 三级背景 — 嵌套区域、表头   |
| `--bg-hover`    | `#F4F4F6` | neutral-100 | Hover 态背景        |
| `--bg-selected` | `#EEF0FF` | primary-50  | 选中态背景            |

### 2.6 边框色映射

| 语义 Token           | 值         | 对应色         | 用途           |
| ------------------ | --------- | ----------- | ------------ |
| `--border-default` | `#E8E8EC` | neutral-200 | 默认边框         |
| `--border-strong`  | `#D5D5DC` | neutral-300 | 强调边框、分割线     |
| `--border-brand`   | `#5B5FE9` | primary-500 | 品牌边框 — 选中态边框 |

### 2.7 品牌渐变

| Token                   | 值                                                   | 用途                    |
| ----------------------- | --------------------------------------------------- | --------------------- |
| `--gradient-brand`      | `linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)` | 品牌渐变 — Hero 区域、主按钮特殊态 |
| `--gradient-brand-soft` | `linear-gradient(135deg, #EEF0FF 0%, #F5F0FF 100%)` | 品牌柔和渐变 — 引导区域背景       |

### 2.8 色彩使用规则

1. **正文一律使用** **`--text-primary`（#242428），不要使用纯黑 #000000。** 纯黑对比度过高，不符合设计规范。
2. 品牌强调色文字使用 `--text-brand`（#5B5FE9），不要直接使用 `--color-primary-500`。
3. 选中态背景固定使用 `--bg-selected`（#EEF0FF），不要手动指定浅紫色。
4. 答对场景使用 success 系列色，答错场景使用 error 系列色，不要混用。
5. 警告色（warning）仅用于倒计时、官方标记场景，不要用于普通错误提示。
6. 深色/品牌背景上的文字一律使用 `--text-inverse`（#FFFFFF），不要使用浅灰色。
7. 禁用态文字使用 `--text-disabled`（#B0B0BC），不要降低透明度模拟禁用。

***

## 3. 字体系统 (Typography)

### 3.1 字体族

| Token         | 值                                                                                                                                                   | 用途         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `--font-sans` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'` | 全局默认字体     |
| `--font-mono` | `'SF Mono', 'JetBrains Mono', 'Fira Code', Consolas, monospace`                                                                                     | 代码、序号、数字统计 |

### 3.2 字号阶梯

| Token         | 值      | Tailwind 类  | 用途                 |
| ------------- | ------ | ----------- | ------------------ |
| `--text-xs`   | `12px` | `text-xs`   | 辅助文字、标签、角标         |
| `--text-sm`   | `13px` | `text-sm`   | 次要文字、描述            |
| `--text-base` | `14px` | `text-base` | **正文默认**（Web 端偏紧凑） |
| `--text-lg`   | `16px` | `text-lg`   | 小标题、按钮文字           |
| `--text-xl`   | `20px` | `text-xl`   | 卡片标题               |
| `--text-2xl`  | `24px` | `text-2xl`  | 页面标题               |
| `--text-3xl`  | `28px` | `text-3xl`  | 大数字                |
| `--text-4xl`  | `34px` | `text-4xl`  | 统计大数字              |

### 3.3 字重

| Token             | 值     | Tailwind 类      | 用途       |
| ----------------- | ----- | --------------- | -------- |
| `--font-normal`   | `400` | `font-normal`   | 正文默认     |
| `--font-medium`   | `500` | `font-medium`   | 强调正文     |
| `--font-semibold` | `600` | `font-semibold` | 小标题、卡片标题 |
| `--font-bold`     | `700` | `font-bold`     | 页面标题、大标题 |

### 3.4 行高

| Token               | 值       | 用途    |
| ------------------- | ------- | ----- |
| `--leading-tight`   | `1.3`   | 标题、标签 |
| `--leading-normal`  | `1.5`   | 正文    |
| `--leading-relaxed` | `1.625` | 长文本段落 |

### 3.5 文字样式组合

以下是预定义的文字样式组合，AI 在生成组件时应直接使用这些组合：

| 样式名          | 字号   | 字重  | 行高   | 用途    |
| ------------ | ---- | --- | ---- | ----- |
| `display`    | 34px | 700 | 1.2  | 统计大数字 |
| `headline`   | 24px | 700 | 1.25 | 页面大标题 |
| `title1`     | 20px | 600 | 1.3  | 卡片标题  |
| `title2`     | 16px | 600 | 1.35 | 小标题   |
| `body`       | 14px | 400 | 1.5  | 正文默认  |
| `bodyMedium` | 14px | 500 | 1.5  | 强调正文  |
| `caption`    | 13px | 400 | 1.4  | 辅助文字  |
| `label`      | 12px | 600 | 1.3  | 标签、角标 |

> 说明：上述为通用排版指引。`Naive UI` 组件的标题字号以其主题覆盖（第 8 节）为准。例如 `Card` 标题实际为 `16px`（覆盖默认 20px），`Dialog` 标题为 `18px`（见第 8 节差异说明）。

### 3.6 字体使用规则

1. 全局默认正文使用 `body` 样式（14px / 400 / 1.5），不要使用 16px 作为正文。
2. 页面标题使用 `headline`（24px / 700），卡片标题使用 `title1`（20px / 600）。
3. 数字统计场景使用 `display`（34px / 700），如答题正确率、题目总数。
4. 代码块和序号使用 `--font-mono` 字体族。
5. 不要使用 300 (light) 或 900 (black) 字重，不在设计系统范围内。
6. 标签和角标一律使用 `label` 样式（12px / 600），不要手动组合字号字重。

***

## 4. 间距系统 (Spacing)

### 4.1 基准网格

所有间距基于 **4px 基准网格**，所有间距值必须是 4 的倍数。

### 4.2 间距值

| Token        | 值      | 语义   | Tailwind 类      | 用途         |
| ------------ | ------ | ---- | --------------- | ---------- |
| `--space-0`  | `0`    | 无    | `p-0` / `m-0`   | 无间距        |
| `--space-1`  | `4px`  | xs   | `p-1` / `m-1`   | 标签内边距      |
| `--space-2`  | `8px`  | sm   | `p-2` / `m-2`   | 图标与文字间距    |
| `--space-3`  | `12px` | md   | `p-3` / `m-3`   | 列表项内边距     |
| `--space-4`  | `16px` | base | `p-4` / `m-4`   | 默认间距、卡片内边距 |
| `--space-5`  | `20px` | lg   | `p-5` / `m-5`   | 区块间距       |
| `--space-6`  | `24px` | xl   | `p-6` / `m-6`   | 区段间距       |
| `--space-8`  | `32px` | 2xl  | `p-8` / `m-8`   | 大区段间距      |
| `--space-10` | `40px` | 3xl  | `p-10` / `m-10` | 页面级大间距     |
| `--space-12` | `48px` | 4xl  | `p-12` / `m-12` | 超大间距       |
| `--space-16` | `64px` | —    | `p-16` / `m-16` | 特殊大间距      |

### 4.3 Tailwind 类映射

Tailwind 内置 spacing 系统已与设计系统对齐（4px 基准），可直接使用：

| Tailwind 类      | 值    | 常用场景         |
| --------------- | ---- | ------------ |
| `p-1` / `gap-1` | 4px  | 标签内边距、紧凑元素间距 |
| `p-2` / `gap-2` | 8px  | 图标与文字间距      |
| `p-3` / `gap-3` | 12px | 列表项内边距       |
| `p-4` / `gap-4` | 16px | 默认间距、卡片内边距   |
| `p-5` / `gap-5` | 20px | 卡片内边距（宽松）    |
| `p-6` / `gap-6` | 24px | 区段间距         |
| `p-8` / `gap-8` | 32px | 大区段间距        |

### 4.4 间距使用规则

1. **所有间距值必须是 4 的倍数**，不要使用 3px、5px、7px 等非标准值。
2. **卡片内边距**使用 `p-5`（20px）或 `p-6`（24px），不要使用 `p-4` 以下。
3. **列表项内边距**使用 `p-4`（16px），保持紧凑可读。
4. **区段间距**使用 `gap-6`（24px），不要使用 `gap-4` 以下。
5. **图标与文字间距**固定使用 `gap-2`（8px）。
6. **标签内边距**使用 `px-2 py-1`（水平 8px，垂直 4px）。
7. 页面内容容器使用 `p-6`（24px）内边距。

***

## 5. 圆角系统 (Border Radius)

| Token           | 值        | Tailwind 类     | 用途            |
| --------------- | -------- | -------------- | ------------- |
| `--radius-sm`   | `6px`    | `rounded-sm`   | 小标签           |
| `--radius-md`   | `8px`    | `rounded-md`   | 小按钮、选项、输入框    |
| `--radius-lg`   | `12px`   | `rounded-lg`   | **卡片、容器、大按钮** |
| `--radius-xl`   | `16px`   | `rounded-xl`   | 容器、Hero 区域、弹窗 |
| `--radius-2xl`  | `20px`   | `rounded-2xl`  | （tokens 中存在，当前代码未使用） |
| `--radius-full` | `9999px` | `rounded-full` | 头像、药丸标签       |

### 圆角使用规则

1. **卡片默认使用** **`rounded-lg`（12px）**，不要使用 6px 或 20px。
2. 输入框和小按钮使用 `rounded-md`（8px）。
3. 弹窗（Modal / Dialog）使用 `rounded-xl`（16px）。注意：代码 `src/theme/overrides.ts` 中 `Dialog` 与 `Modal` 的 `borderRadius` 均硬编码为 `16px`（对应 `--radius-xl`），并非 `radius-2xl`（20px），以代码为准。`Drawer` 组件未在主题覆盖中配置（**未实现**）。
4. 头像和药丸形标签使用 `rounded-full`。
5. 标签（Tag）使用 `rounded-sm`（6px）。
6. 不要使用 4px 或 10px 等非标准圆角值。
7. `--radius-2xl`（20px）在 tokens 中存在，但当前代码未在任何组件或主题覆盖中使用，请勿主动采用。

***

## 6. 阴影系统 (Elevation)

| Token            | 值                                    | Tailwind 类     | 用途            |
| ---------------- | ------------------------------------ | -------------- | ------------- |
| `--shadow-none`  | `none`                               | `shadow-none`  | 无阴影（默认）       |
| `--shadow-xs`    | `0 1px 2px rgba(0, 0, 0, 0.04)`      | `shadow-xs`    | 极浅阴影          |
| `--shadow-sm`    | `0 1px 3px rgba(0, 0, 0, 0.06)`      | `shadow-sm`    | **Hover 态阴影** |
| `--shadow-md`    | `0 2px 8px rgba(0, 0, 0, 0.08)`      | `shadow-md`    | 悬浮卡片、下拉菜单     |
| `--shadow-lg`    | `0 4px 16px rgba(0, 0, 0, 0.10)`     | `shadow-lg`    | **弹窗阴影**      |
| `--shadow-xl`    | `0 8px 32px rgba(0, 0, 0, 0.12)`     | `shadow-xl`    | 大型悬浮层         |
| `--shadow-brand` | `0 4px 12px rgba(91, 95, 233, 0.25)` | `shadow-brand` | **主按钮品牌阴影**   |

### 阴影使用规则

1. **默认态使用边框而非阴影**。卡片默认使用 `border border-neutral-200`，不使用阴影。
2. **Hover 态使用** **`shadow-sm`**，提升层次感。
3. **弹窗使用** **`shadow-lg`**，确保与背景有足够分离度。
4. **主按钮使用** **`shadow-brand`**，品牌色阴影增强品牌感（由 `src/style.css` 中的全局 CSS 注入到 `.n-button--primary-type`）。
5. 不要在默认态使用 `shadow-md` 以上阴影，保持界面扁平。
6. 下拉菜单、Popover 使用 `shadow-md`。

***

## 7. 布局系统 (Layout)

### 7.1 布局常量

| Token                       | 值        | 用途      |
| --------------------------- | -------- | ------- |
| `--sidebar-width`           | `240px`  | 侧边栏宽度   |
| `--sidebar-collapsed-width` | `64px`   | 侧边栏收起宽度 |
| `--header-height`           | `64px`   | 顶部栏高度   |
| `--content-max-width`       | `1280px` | 内容区最大宽度 |
| `--content-padding`         | `24px`   | 内容区内边距  |

### 7.2 布局结构

```
┌─────────────────────────────────────────────┐
│  Header (64px, sticky, z-index: 1100)       │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Content (max-width: 1280px)     │
│ (240px)  │  padding: 24px                   │
│          │                                  │
│          │  ┌────────────────────────────┐  │
│          │  │  Card (bg-white, p-6)       │  │
│          │  │  rounded-lg, border         │  │
│          │  └────────────────────────────┘  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### 7.3 响应式断点

项目未自定义 Tailwind `screens`，使用 Tailwind CSS 默认断点：

| 断点   | 值        | 用途          |
| ---- | -------- | ----------- |
| `sm` | `640px`  | 大手机 / 小平板竖屏 |
| `md` | `768px`  | 平板竖屏        |
| `lg` | `1024px` | 平板横屏 / 小桌面  |
| `xl` | `1280px` | 桌面标准        |

> 实际代码中主要使用 `md`（≥768px，头部搜索框显示）与 `lg`（≥1024px，侧边栏常驻、内容区内边距加大）。`sm` / `xl` 为 Tailwind 默认断点，项目未额外定义其它断点。

### 7.4 移动端适配

- **侧边栏变 Drawer**：在 `lg`（1024px）以下，侧边栏变为抽屉式（`position: fixed`），带遮罩层 (overlay)

- **遮罩层**：`z-index: 1200`（`--z-overlay`），半透明黑色背景（`bg-neutral-950/50`）

- **Header 保持**：Header 在所有断点保持 64px 高度

- **内容内边距缩减**：移动端内容区使用 `px-4`（16px），桌面端（`lg:`）使用 `px-6`（24px）；纵向 `py-6`（24px）固定（见 `MainLayout.vue`）

### 7.5 Z-Index 层级

| Token          | 值      | 用途            |
| -------------- | ------ | ------------- |
| `--z-base`     | `0`    | 基础内容          |
| `--z-dropdown` | `1000` | 下拉菜单          |
| `--z-sticky`   | `1100` | Sticky Header |
| `--z-overlay`  | `1200` | 遮罩层           |
| `--z-modal`    | `1300` | 弹窗            |
| `--z-toast`    | `1400` | Toast 通知      |

### 7.6 布局使用规则

1. **侧边栏宽度固定 240px**，收起时 64px，不要使用其他宽度。
2. **Header 高度固定 64px**，使用 `sticky top-0 z-sticky`。
3. **内容区最大宽度 1280px**，使用 `mx-auto max-w-content`。
4. **内容区内边距**：桌面端 `lg:px-6`（24px），移动端 `px-4`（16px），纵向 `py-6`（24px）。
5. 弹窗 z-index 固定使用 1300，Toast 固定使用 1400。

***

## 8. Naive UI 主题覆盖

以下 TypeScript 对象将设计令牌映射到 Naive UI 的主题系统，内容与 `src/theme/overrides.ts` **完全一致**。在 `src/App.vue` 中已通过 `<n-config-provider :theme-overrides="themeOverrides">` 注入，**无需再手动声明**。

```typescript
import type { GlobalThemeOverrides } from 'naive-ui'

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    /* ---- 品牌色 ---- */
    primaryColor: '#5B5FE9', // primary-500
    primaryColorHover: '#6E75F5', // primary-400
    primaryColorPressed: '#4A48D4', // primary-600
    primaryColorSuppl: '#5B5FE9',

    /* ---- 语义色 ---- */
    successColor: '#22B570',
    successColorHover: '#2ECB80',
    successColorPressed: '#1A965C',
    warningColor: '#FFA42B',
    warningColorHover: '#FFB850',
    warningColorPressed: '#E68A00',
    errorColor: '#F0503C',
    errorColorHover: '#F26854',
    errorColorPressed: '#D63A28',
    infoColor: '#3B8BFF',
    infoColorHover: '#5BA0FF',
    infoColorPressed: '#1E6FE0',

    /* ---- 文字色 ---- */
    textColorBase: '#242428', // neutral-900
    textColor1: '#242428', // text-primary
    textColor2: '#6B6B76', // text-secondary
    textColor3: '#8A8A96', // text-tertiary
    textColorDisabled: '#B0B0BC',
    placeholderColor: '#8A8A96',
    iconColor: '#6B6B76',
    iconColorHover: '#5B5FE9',

    /* ---- 背景色 ---- */
    bodyColor: '#F4F4F6', // bg-page
    cardColor: '#FFFFFF',
    modalColor: '#FFFFFF',
    popoverColor: '#FFFFFF',
    actionColor: '#FAFAFB', // bg-subtle
    hoverColor: '#F4F4F6', // bg-hover
    inputColor: '#FFFFFF',
    inputColorDisabled: '#FAFAFB',

    /* ---- 边框色 ---- */
    borderColor: '#E8E8EC', // border-default
    dividerColor: '#E8E8EC',

    /* ---- 字体 ---- */
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif",
    fontFamilyMono: "'SF Mono', 'JetBrains Mono', 'Fira Code', Consolas, monospace",
    fontSize: '14px',
    fontSizeMini: '12px',
    fontSizeTiny: '12px',
    fontSizeSmall: '13px',
    fontSizeMedium: '14px',
    fontSizeLarge: '16px',
    fontSizeHuge: '20px',
    fontWeightStrong: '600',

    /* ---- 圆角 ---- */
    borderRadius: '8px', // radius-md
    borderRadiusSmall: '6px', // radius-sm

    /* ---- 阴影 ---- */
    boxShadow1: '0 1px 2px rgba(0, 0, 0, 0.04)',
    boxShadow2: '0 1px 3px rgba(0, 0, 0, 0.06)',
    boxShadow3: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },

  /* ---- Button 按钮：圆角 12px、字重 600、品牌阴影（全局 CSS 注入） ---- */
  Button: {
    colorPrimary: '#5B5FE9',
    colorHoverPrimary: '#6E75F5',
    colorPressedPrimary: '#4A48D4',
    colorFocusPrimary: '#5B5FE9',
    textColorPrimary: '#FFFFFF',
    textColorHoverPrimary: '#FFFFFF',
    textColorPressedPrimary: '#FFFFFF',
    textColorFocusPrimary: '#FFFFFF',
    borderPrimary: '1px solid #5B5FE9',
    borderHoverPrimary: '1px solid #6E75F5',
    borderPressedPrimary: '1px solid #4A48D4',
    borderRadiusTiny: '6px',
    borderRadiusSmall: '8px',
    borderRadiusMedium: '12px',
    borderRadiusLarge: '12px',
    fontWeight: '600',
    heightTiny: '22px',
    heightSmall: '28px',
    heightMedium: '36px',
    heightLarge: '44px',
    paddingMedium: '0 16px',
    paddingLarge: '0 20px',
    paddingSmall: '0 12px'
  },

  /* ---- Card 卡片：边框优先、默认无阴影、标题 16px ---- */
  Card: {
    color: '#FFFFFF',
    colorEmbedded: '#FAFAFB',
    borderColor: '#E8E8EC',
    borderRadius: '12px',
    boxShadow: 'none',
    paddingSmall: '16px',
    paddingMedium: '20px',
    paddingLarge: '24px',
    titleFontSizeSmall: '14px',
    titleFontSizeMedium: '16px',
    titleFontSizeLarge: '16px',
    titleFontWeight: '600'
  },

  /* ---- Input 输入框 ---- */
  Input: {
    color: '#FFFFFF',
    colorDisabled: '#FAFAFB',
    textColor: '#242428',
    textColorDisabled: '#B0B0BC',
    caretColor: '#5B5FE9',
    placeholderColor: '#8A8A96',
    border: '1px solid #E8E8EC',
    borderHover: '1px solid #D5D5DC',
    borderFocus: '1px solid #5B5FE9',
    borderDisabled: '1px solid #E8E8EC',
    borderRadius: '8px',
    boxShadowFocus: '0 0 0 3px rgba(91, 95, 233, 0.12)',
    heightMedium: '36px',
    heightLarge: '44px',
    heightSmall: '28px'
  },

  /* ---- Select 选择器 ---- */
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '8px',
        border: '1px solid #E8E8EC',
        borderHover: '1px solid #D5D5DC',
        borderFocus: '1px solid #5B5FE9',
        borderActive: '1px solid #5B5FE9',
        boxShadowFocus: '0 0 0 3px rgba(91, 95, 233, 0.12)',
        boxShadowActive: '0 0 0 3px rgba(91, 95, 233, 0.12)',
        color: '#FFFFFF',
        colorActive: '#FFFFFF',
        textColor: '#242428',
        heightMedium: '36px'
      }
    }
  },

  /* ---- Tag 标签 ---- */
  Tag: {
    borderRadius: '6px',
    fontWeight: '600',
    fontSizeSmall: '12px',
    fontSizeMedium: '12px',
    heightSmall: '20px',
    heightMedium: '24px',
    // 品牌色 Tag（浅底深字）
    colorPrimary: '#EEF0FF',
    textColorPrimary: '#5B5FE9',
    borderPrimary: '1px solid #DBDEFF',
    colorSuccess: '#E8F9F0',
    textColorSuccess: '#1A965C',
    borderSuccess: '1px solid #C5F0D8',
    colorError: '#FFEFEC',
    textColorError: '#D63A28',
    borderError: '1px solid #FCD3CC',
    colorWarning: '#FFF8E6',
    textColorWarning: '#E68A00',
    borderWarning: '1px solid #FFE9B8',
    colorInfo: '#E8F1FF',
    textColorInfo: '#1E6FE0',
    borderInfo: '1px solid #B8D4FF',
    colorDefault: '#F4F4F6',
    textColorDefault: '#6B6B76',
    borderDefault: '1px solid #E8E8EC'
  },

  /* ---- Menu 菜单（侧边栏导航） ---- */
  Menu: {
    borderRadius: '8px',
    itemHeight: '44px',
    itemColorActive: '#EEF0FF',
    itemColorActiveHover: '#EEF0FF',
    itemColorActiveCollapsed: '#EEF0FF',
    itemTextColor: '#6B6B76',
    itemTextColorHover: '#242428',
    itemTextColorActive: '#5B5FE9',
    itemTextColorActiveHover: '#5B5FE9',
    itemTextColorChildActive: '#5B5FE9',
    itemIconColor: '#6B6B76',
    itemIconColorHover: '#242428',
    itemIconColorActive: '#5B5FE9',
    itemIconColorActiveHover: '#5B5FE9',
    itemIconColorChildActive: '#5B5FE9'
  },

  /* ---- DataTable 表格：表头 bg-subtle、行悬停 bg-subtle ---- */
  DataTable: {
    borderRadius: '12px',
    borderColor: '#E8E8EC',
    thColor: '#FAFAFB',
    thColorHover: '#F4F4F6',
    thTextColor: '#6B6B76',
    thFontWeight: '600',
    tdColor: '#FFFFFF',
    tdColorHover: '#FAFAFB',
    tdTextColor: '#242428',
    fontSizeSmall: '13px',
    fontSizeMedium: '14px',
    thPaddingSmall: '8px 12px',
    tdPaddingSmall: '8px 12px',
    thPaddingMedium: '12px 16px',
    tdPaddingMedium: '12px 16px'
  },

  /* ---- Dialog / Modal 弹窗：16px 圆角（mockup 视觉） ---- */
  Dialog: {
    borderRadius: '16px',
    titleFontSize: '18px',
    titleFontWeight: '600'
  },
  Modal: {
    borderRadius: '16px'
  },

  /* ---- Form 表单 ---- */
  Form: {
    labelTextColor: '#242428',
    labelFontWeight: '500',
    labelFontSizeMedium: '13px',
    labelFontSizeSmall: '13px',
    labelRequiredMarkColor: '#F0503C'
  },

  /* ---- Avatar 头像 ---- */
  Avatar: {
    color: '#5B5FE9',
    textColor: '#FFFFFF',
    borderRadius: '9999px'
  },

  /* ---- Badge 徽标 ---- */
  Badge: {
    color: '#F0503C',
    fontSize: '12px',
    fontWeight: '600'
  },

  /* ---- Breadcrumb 面包屑 ---- */
  Breadcrumb: {
    fontSize: '13px',
    itemTextColor: '#8A8A96',
    itemTextColorHover: '#5B5FE9',
    itemTextColorActive: '#242428',
    separatorColor: '#B0B0BC'
  },

  /* ---- Notification 通知 ---- */
  Notification: {
    borderRadius: '12px',
    titleFontSize: '16px',
    titleFontWeight: '600'
  },

  /* ---- Tabs 标签页 ---- */
  Tabs: {
    tabTextColor: '#6B6B76',
    tabTextColorHover: '#242428',
    tabTextColorActive: '#5B5FE9',
    tabTextColorActiveLine: '#5B5FE9',
    tabFontWeight: '500',
    tabFontWeightActive: '600',
    barColor: '#5B5FE9'
  },

  /* ---- Progress 进度条 ---- */
  Progress: {
    fillColor: '#5B5FE9',
    fillColorSuccess: '#22B570',
    fillColorError: '#F0503C',
    fillColorWarning: '#FFA42B',
    fillColorInfo: '#3B8BFF',
    railColor: '#E8E8EC',
    borderRadius: '9999px',
    fontSize: '12px',
    textColor: '#242428'
  },

  /* ---- Pagination 分页 ---- */
  Pagination: {
    itemBorderRadius: '8px',
    itemColor: 'transparent',
    itemColorHover: '#F4F4F6',
    itemColorActive: '#5B5FE9',
    itemColorDisabled: 'transparent',
    itemTextColor: '#6B6B76',
    itemTextColorHover: '#5B5FE9',
    itemTextColorActive: '#FFFFFF',
    itemTextColorDisabled: '#B0B0BC',
    itemBorder: '1px solid #E8E8EC',
    itemBorderHover: '1px solid #D5D5DC',
    itemBorderActive: '1px solid #5B5FE9',
    itemBorderDisabled: '1px solid #E8E8EC'
  },

  /* ---- Empty 空状态 ---- */
  Empty: {
    textColor: '#8A8A96',
    iconColor: '#D5D5DC'
  },

  /* ---- Spin 加载 ---- */
  Spin: {
    color: '#5B5FE9',
    textColor: '#6B6B76'
  },

  /* ---- Skeleton 骨架屏 ---- */
  Skeleton: {
    color: '#F4F4F6',
    colorEnd: '#E8E8EC',
    borderRadius: '8px'
  },

  /* ---- Alert 警告提示 ---- */
  Alert: {
    borderRadius: '8px',
    padding: '12px 16px',
    titleFontWeight: '600',
    colorSuccess: '#E8F9F0',
    colorSuccessTitle: '#0F7A48',
    colorSuccessText: '#1A965C',
    borderSuccess: '1px solid #C5F0D8',
    colorError: '#FFEFEC',
    colorErrorTitle: '#B22A1A',
    colorErrorText: '#D63A28',
    borderError: '1px solid #FCD3CC',
    colorWarning: '#FFF8E6',
    colorWarningTitle: '#B86D00',
    colorWarningText: '#E68A00',
    borderWarning: '1px solid #FFE9B8',
    colorInfo: '#E8F1FF',
    colorInfoTitle: '#1E6FE0',
    colorInfoText: '#1E6FE0',
    borderInfo: '1px solid #B8D4FF'
  }
}
```

### 与 tokens 的差异说明（以代码 `overrides.ts` 为准）

1. **`Dialog` 标题字号为 `18px`**：该值未出现在字号阶梯 tokens（`--text-lg`=16px、`--text-xl`=20px）中，是 `overrides.ts` 内的硬编码值。以代码为准。
2. **`Dialog` / `Modal` 圆角为 `16px`**（`--radius-xl`），而非 `radius-2xl`（20px）。以代码为准。
3. **`Input` / `Select` 聚焦态外阴影为 `0 0 0 3px rgba(91,95,233,0.12)`**：这是独立的聚焦光环，不属于第 6 节的 `shadow-*` 令牌。
4. **`common` 仅定义了 `boxShadow1/2/3`**，对应 `--shadow-xs/-sm/-md`；更高的 `--shadow-lg/-xl` 仅作为全局 CSS 类使用，未在 Naive `common` 中定义。
5. `Switch`、`Tooltip`、`Dropdown`、`Message`、`Checkbox`、`Radio`、`Drawer`、`Divider` 等组件**未在 `overrides.ts` 中配置，属于未实现的主题覆盖**，请勿在文档之外假定其存在。

### Naive UI 主题使用说明

1. `themeOverrides` 已在 `src/App.vue` 中通过 `<n-config-provider :theme-overrides="themeOverrides">` 注入，**无需重复声明**。
2. 以上对象为 `src/theme/overrides.ts` 的**完整、真实内容**，所有组件的关键视觉属性均已映射设计令牌。
3. **深色模式未实现**：当前设计系统仅提供浅色主题，文档不再描述深色模式覆盖方案。

***

## 9. Tailwind CSS 配置

### 9.1 配置文件说明

设计系统提供了专用的 Tailwind 配置文件：`design/tokens/tailwind.config.js`

该文件中的 `theme.extend` 部分应**替换**项目中 `frontend/tailwind.config.js` 的 `theme.extend` 内容，使 Tailwind 工具类与设计系统完全对齐。

### 9.2 配置内容

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}'
  ],
  theme: {
    extend: {
      // 色彩系统
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

      // 字体系统
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

      // 圆角系统
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px'
      },

      // 阴影系统
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 4px 16px rgba(0, 0, 0, 0.10)',
        'xl': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'brand': '0 4px 12px rgba(91, 95, 233, 0.25)'
      },

      // 过渡动画
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms'
      },

      // 品牌渐变
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)',
        'brand-soft': 'linear-gradient(135deg, #EEF0FF 0%, #F5F0FF 100%)'
      },

      // 布局常量
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

### 9.3 常用 Tailwind 类速查

| 场景     | Tailwind 类           | 对应值                  |
| ------ | -------------------- | -------------------- |
| 页面背景   | `bg-neutral-100`     | #F4F4F6              |
| 卡片背景   | `bg-white`           | #FFFFFF              |
| 嵌套背景   | `bg-neutral-50`      | #FAFAFB              |
| 选中态背景  | `bg-primary-50`      | #EEF0FF              |
| 主要文字   | `text-neutral-900`   | #242428              |
| 次要文字   | `text-neutral-600`   | #6B6B76              |
| 辅助文字   | `text-neutral-500`   | #8A8A96              |
| 品牌文字   | `text-primary-500`   | #5B5FE9              |
| 默认边框   | `border-neutral-200` | #E8E8EC              |
| 强调边框   | `border-neutral-300` | #D5D5DC              |
| 品牌渐变背景 | `bg-brand-gradient`  | linear-gradient(...) |
| 卡片圆角   | `rounded-lg`         | 12px                 |
| 主按钮阴影  | `shadow-brand`       | 品牌阴影                 |
| 卡片内边距  | `p-6`                | 24px                 |
| 列表项内边距 | `p-4`                | 16px                 |

### 9.4 应用步骤

1. 将 `design/tokens/tailwind.config.js` 中的 `theme.extend` 内容合并到项目 `frontend/tailwind.config.js`。
2. 在 `App.vue` 中引入 Naive UI `themeOverrides`（见第 8 节，已注入）。
3. 在 `main.ts` / `style.css` 中引入 `design-tokens.css`，使 CSS 变量全局可用（当前 `src/style.css` 已 `@import` 该文件）。
4. 组件中优先使用 Tailwind 工具类，复杂场景使用 `var(--token-name)` 引用 CSS 变量。

***

## 附录：设计令牌文件索引

| 文件          | 路径                                 | 说明                             |
| ----------- | ---------------------------------- | ------------------------------ |
| CSS 变量      | `design/tokens/design-tokens.css`  | 所有令牌的 CSS Custom Properties 定义 |
| JSON 格式     | `design/tokens/design-tokens.json` | 结构化 JSON，供 AI 程序化读取            |
| Tailwind 配置 | `design/tokens/tailwind.config.js` | Tailwind theme.extend 配置       |
| 本文档         | `design/docs/design-system.md`     | 设计系统完整规范文档                     |
