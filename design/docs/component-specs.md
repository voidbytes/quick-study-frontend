# Quick Study Web — 组件规格说明书 (Component Specifications)

> **文档目的**：本文档详细定义 Quick Study Web 应用中每一个可复用 UI 组件的 HTML 结构、CSS 类名、视觉状态、Naive UI 组件映射及 Tailwind 工具类映射。AI 开发者在生成 Vue 组件代码时应严格遵循本文档的约定。
>
> **设计令牌**：所有组件样式基于 `design-tokens.css` 中定义的 CSS 自定义属性。Tailwind 工具类基于 `tailwind.config.js` 中扩展的设计令牌。
>
> **CSS 参考**：所有类名与样式规则来源于 `mockups/styles/mockup.css`。

---

## 目录

1. [按钮 (Button)](#1-按钮-button)
2. [卡片 (Card)](#2-卡片-card)
3. [标签 (Tag)](#3-标签-tag)
4. [输入框 (Input)](#4-输入框-input)
5. [表格 (Data Table)](#5-表格-data-table)
6. [分页 (Pagination)](#6-分页-pagination)
7. [统计卡片 (Stat Card)](#7-统计卡片-stat-card)
8. [答题选项 (Question Option)](#8-答题选项-question-option)
9. [题目导航网格 (Question Nav Grid)](#9-题目导航网格-question-nav-grid)
10. [头像 (Avatar)](#10-头像-avatar)
11. [徽章 (Badge)](#11-徽章-badge)
12. [侧边栏 (Sidebar)](#12-侧边栏-sidebar)
13. [顶部导航栏 (Header)](#13-顶部导航栏-header)
14. [模态框 (Modal)](#14-模态框-modal)
15. [空状态 (Empty State)](#15-空状态-empty-state)
16. [进度条 (Progress)](#16-进度条-progress)
17. [警告提示 (Alert)](#17-警告提示-alert)

---

## 1. 按钮 (Button)

### 组件描述

按钮是应用中最基础的交互元素，用于触发操作。支持多种语义变体（主操作、次操作、幽灵、危险、成功）和尺寸（小、默认、大、块级）。

### 视觉状态

| 状态 | 描述 |
|------|------|
| `default` | 默认可点击状态 |
| `hover` | 鼠标悬停，背景色加深 |
| `disabled` | 禁用，`opacity: 0.5`，`cursor: not-allowed` |
| `loading` | 加载中，显示旋转图标，禁用交互 |

### 变体 (Variants)

| 变体 | 背景色 | 文字色 | 适用场景 |
|------|--------|--------|----------|
| `btn-primary` | `--color-primary-500` (#5B5FE9) | 白色 | 主操作（提交、保存、开始考试） |
| `btn-secondary` | `--bg-card` (白色) | `--text-primary` | 次操作（取消、返回） |
| `btn-ghost` | 透明 | `--text-secondary` | 辅助操作（筛选、排序） |
| `btn-danger` | `--color-error-500` (#F0503C) | 白色 | 危险操作（删除） |
| `btn-success` | `--color-success-500` (#22B570) | 白色 | 成功操作（通过审核） |

### 尺寸 (Sizes)

| 尺寸 | 内边距 | 字号 | 圆角 |
|------|--------|------|------|
| `btn-sm` | 8px 12px | `--text-sm` (13px) | `--radius-md` (8px) |
| 默认 | 12px 20px | `--text-base` (14px) | `--radius-lg` (12px) |
| `btn-lg` | 16px 24px | `--text-lg` (16px) | `--radius-lg` (12px) |
| `btn-block` | 同默认 | 同默认 | 同默认 (width: 100%) |

### Props 定义

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | 按钮语义变体 |
| `size` | `'sm' \| 'default' \| 'lg' \| 'block'` | `'default'` | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否加载中 |
| `icon` | `string` | — | Ionicons 图标名称 |

### HTML 结构示例

```html
<!-- 主按钮 -->
<button class="btn btn-primary">
  <ion-icon name="save-outline"></ion-icon>
  <span>保存</span>
</button>

<!-- 次按钮 + 小尺寸 -->
<button class="btn btn-secondary btn-sm">取消</button>

<!-- 危险按钮 -->
<button class="btn btn-danger">
  <ion-icon name="trash-outline"></ion-icon>
  <span>删除</span>
</button>

<!-- 幽灵按钮 -->
<button class="btn btn-ghost">筛选</button>

<!-- 块级按钮 -->
<button class="btn btn-primary btn-block">提交试卷</button>

<!-- 禁用 -->
<button class="btn btn-primary" disabled>不可用</button>
```

### Naive UI 组件映射

```vue
<n-button type="primary" size="medium" :loading="loading" :disabled="disabled">
  <template #icon>
    <n-icon><SaveOutline /></n-icon>
  </template>
  保存
</n-button>
```

| Mockup 变体 | Naive UI `type` | Naive UI `ghost` | 说明 |
|-------------|-----------------|-------------------|------|
| `btn-primary` | `"primary"` | `false` | 主操作 |
| `btn-secondary` | `"default"` | `false` | Naive UI 默认 type 即为次按钮 |
| `btn-ghost` | `"default"` | `true` | 幽灵按钮 |
| `btn-danger` | `"error"` | `false` | 危险操作 |
| `btn-success` | `"success"` | `false` | Naive UI 支持 success type |

| Mockup 尺寸 | Naive UI `size` |
|-------------|-----------------|
| `btn-sm` | `"small"` |
| 默认 | `"medium"` |
| `btn-lg` | `"large"` |
| `btn-block` | `"medium"` + `block` prop |

### Tailwind 工具类映射

```html
<!-- 等效 Tailwind 写法（使用 @apply 或原生类） -->
<button class="btn btn-primary">保存</button>
<button class="btn btn-secondary btn-sm">取消</button>
<button class="btn btn-danger">删除</button>
<button class="btn btn-ghost">筛选</button>
<button class="btn btn-success">通过</button>
<button class="btn btn-primary btn-block">提交试卷</button>
```

> **Tailwind 类名**：`btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `btn-success`, `btn-sm`, `btn-lg`, `btn-block`
>
> 这些类名应在 Tailwind 配置的 `components` 层或全局 CSS 中通过 `@layer components` 定义，引用设计令牌变量。

### AI 实现指南

- `variant` prop 映射到 CSS 类 `btn-{variant}`，通过 computed 属性拼接。
- `size` 为 `'default'` 时不追加尺寸类名，其余追加 `btn-{size}`。
- `btn-block` 与其他尺寸可组合使用（先加尺寸类，再加 block 类）。
- `loading` 状态时在按钮内部最前方插入旋转的 `ion-icon name="refresh-outline"` 或使用 Naive UI 内置 loading 图标，同时设置 `disabled` 防止重复提交。
- 图标使用 Ionicons 5.5.2，通过 `<ion-icon>` Web Component 渲染。
- 按钮内文字与图标之间使用 `gap: var(--space-2)` 间距。

---

## 2. 卡片 (Card)

### 组件描述

卡片是承载内容的容器组件，用于分组相关信息。支持默认样式和可悬停（hoverable）样式。由卡片头部（标题 + 操作区）和卡片主体组成。

### 视觉状态

| 状态 | 描述 |
|------|------|
| `default` | 白色背景，默认边框 |
| `hoverable` | 悬停时边框变为主题色浅色，出现小阴影 |

### HTML 结构示例

```html
<!-- 基础卡片 -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">题目列表</h3>
    <div class="flex gap-2">
      <button class="btn btn-ghost btn-sm">导出</button>
      <button class="btn btn-primary btn-sm">新建</button>
    </div>
  </div>
  <div class="card-body">
    <p>卡片内容区域</p>
  </div>
</div>

<!-- 可悬停卡片（无头部） -->
<div class="card card-hover">
  <div class="card-body">
    <p>悬停我试试</p>
  </div>
</div>

<!-- 紧凑卡片（小内边距） -->
<div class="card">
  <div class="card-body card-body-sm">
    <p>紧凑内容</p>
  </div>
</div>
```

### Naive UI 组件映射

```vue
<n-card title="题目列表" :bordered="true" :hoverable="false">
  <template #header-extra>
    <n-button size="small" @click="handleCreate">新建</n-button>
  </template>
  <p>卡片内容区域</p>
</n-card>
```

| Mockup 类 | Naive UI Prop | 说明 |
|-----------|---------------|------|
| `card` | 默认渲染 | Naive UI `n-card` 默认带边框 |
| `card-hover` | `:hoverable="true"` | 悬停高亮效果 |
| `card-header` | `#header` + `#header-extra` slot | 头部标题与操作区 |
| `card-title` | `title` prop | 卡片标题 |
| `card-body` | 默认 slot | 卡片主体内容 |
| `card-body-sm` | `content-style` 调整 padding | 紧凑模式 |

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `card` | 卡片容器：白底、边框、圆角 12px |
| `card-hover` | 悬停修饰类 |
| `card-header` | 头部区域：flex 两端对齐、底部边框 |
| `card-title` | 标题：16px、semibold |
| `card-body` | 主体：padding 20px |
| `card-body-sm` | 紧凑主体：padding 16px |

### AI 实现指南

- 卡片头部 (`card-header`) 使用 `flex` + `justify-between` 布局，左侧放 `card-title`，右侧放操作按钮组。
- `card-hover` 作为修饰类追加在 `card` 之后，不单独使用。
- 无头部的卡片直接使用 `card` > `card-body` 结构。
- 卡片圆角为 `--radius-lg` (12px)，`overflow: hidden` 确保内部元素不溢出圆角。
- 使用 Naive UI 时，通过 `#header-extra` slot 实现右侧操作区。

---

## 3. 标签 (Tag)

### 组件描述

标签用于标记状态、类型或分类信息。在 Quick Study 中广泛用于题目类型标记、难度标记和状态标记。

### 视觉状态

| 变体 | 背景色 | 文字色 | 用途 |
|------|--------|--------|------|
| `tag-primary` | `--color-primary-50` (#EEF0FF) | `--text-brand` (#5B5FE9) | 简答题类型 |
| `tag-success` | `--color-success-50` (#E8F9F0) | `--color-success-600` (#1A965C) | 判断题 / 简单难度 / 已发布 |
| `tag-error` | `--color-error-50` (#FFEFEC) | `--color-error-600` (#D63A28) | 困难难度 |
| `tag-warning` | `--color-warning-50` (#FFF8E6) | `--color-warning-600` (#E68A00) | 多选题 / 中等难度 / 已关闭 |
| `tag-info` | `--color-info-50` (#E8F1FF) | `--color-info-600` (#1E6FE0) | 单选题 |
| `tag-default` | `--color-neutral-100` (#F4F4F6) | `--text-secondary` (#6B6B76) | 填空题 / 草稿状态 |

### 业务映射规则

**题目类型标签**

| 题型 | Tag 变体 | 显示文字 |
|------|----------|----------|
| 单选题 | `tag-info` | 单选 |
| 多选题 | `tag-warning` | 多选 |
| 判断题 | `tag-success` | 判断 |
| 填空题 | `tag-default` | 填空 |
| 简答题 | `tag-primary` | 简答 |

**难度标签**

| 难度 | Tag 变体 | 显示文字 |
|------|----------|----------|
| 简单 | `tag-success` | 简单 |
| 中等 | `tag-warning` | 中等 |
| 困难 | `tag-error` | 困难 |

**状态标签**

| 状态 | Tag 变体 | 显示文字 |
|------|----------|----------|
| 已发布 | `tag-success` | 已发布 |
| 草稿 | `tag-default` | 草稿 |
| 已关闭 | `tag-warning` | 已关闭 |

### HTML 结构示例

```html
<!-- 题目类型标签 -->
<span class="tag tag-info">单选</span>
<span class="tag tag-warning">多选</span>
<span class="tag tag-success">判断</span>
<span class="tag tag-default">填空</span>
<span class="tag tag-primary">简答</span>

<!-- 难度标签 -->
<span class="tag tag-success">简单</span>
<span class="tag tag-warning">中等</span>
<span class="tag tag-error">困难</span>

<!-- 状态标签 -->
<span class="tag tag-success">已发布</span>
<span class="tag tag-default">草稿</span>
<span class="tag tag-warning">已关闭</span>
```

### Naive UI 组件映射

```vue
<n-tag :type="tagType" :bordered="false" size="small">
  {{ label }}
</n-tag>
```

| Mockup 变体 | Naive UI `type` |
|-------------|-----------------|
| `tag-primary` | `"primary"` |
| `tag-success` | `"success"` |
| `tag-error` | `"error"` |
| `tag-warning` | `"warning"` |
| `tag-info` | `"info"` |
| `tag-default` | `"default"` |

> 使用 `:bordered="false"` 关闭边框，保持与 mockup 一致的浅色背景填充风格。

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `tag` | 基础标签：inline-flex、圆角 6px、字号 12px、semibold |
| `tag-primary` | 主色变体 |
| `tag-success` | 成功变体 |
| `tag-error` | 错误变体 |
| `tag-warning` | 警告变体 |
| `tag-info` | 信息变体 |
| `tag-default` | 默认变体 |

### AI 实现指南

- 建议封装一个 `<QuestionTypeTag :type="questionType" />` 组件，内部通过映射表自动选择正确的 tag 变体。
- 同理封装 `<DifficultyTag :level="difficulty" />` 和 `<StatusTag :status="status" />`。
- 标签内边距为 `2px 8px`，行高 1.4，字体大小 12px。
- 所有标签变体均使用浅色背景 + 深色文字的组合（non-solid 风格）。
- 在 Naive UI 中配合 `:bordered="false"` 和 `size="small"` 以匹配 mockup 视觉。

---

## 4. 输入框 (Input)

### 组件描述

输入框用于接收用户文本输入。支持标签、占位符、前缀/后缀图标、错误状态和帮助文字。包含文本输入 (`input`)、文本域 (`textarea`) 和下拉选择 (`select`) 三种形态。

### 视觉状态

| 状态 | 边框色 | 阴影 | 说明 |
|------|--------|------|------|
| `default` | `--border-default` (#E8E8EC) | 无 | 默认可输入 |
| `focus` | `--color-primary-500` (#5B5FE9) | `0 0 0 3px rgba(91,95,233,0.12)` | 聚焦输入 |
| `error` | `--color-error-500` (#F0503C) | `0 0 0 3px rgba(240,80,60,0.12)` (聚焦时) | 校验失败 |
| `disabled` | `--border-default` | — | 不可输入 |

### HTML 结构示例

```html
<!-- 基础输入框 -->
<div class="input-group">
  <label class="input-label">用户名<span class="req">*</span></label>
  <input type="text" class="input" placeholder="请输入用户名" />
  <p class="input-hint">3-20 个字符</p>
</div>

<!-- 错误状态 -->
<div class="input-group">
  <label class="input-label">邮箱<span class="req">*</span></label>
  <input type="email" class="input input-error" placeholder="请输入邮箱" />
  <p class="input-hint" style="color: var(--color-error-600);">邮箱格式不正确</p>
</div>

<!-- 密码输入 -->
<div class="input-group">
  <label class="input-label">密码</label>
  <input type="password" class="input" placeholder="请输入密码" />
</div>

<!-- 文本域 -->
<div class="input-group">
  <label class="input-label">题目解析</label>
  <textarea class="textarea" placeholder="请输入解析内容"></textarea>
</div>

<!-- 下拉选择 -->
<div class="input-group">
  <label class="input-label">题目类型</label>
  <select class="select">
    <option value="">请选择</option>
    <option value="single">单选题</option>
    <option value="multiple">多选题</option>
  </select>
</div>

<!-- 带前缀图标的输入框（自定义实现） -->
<div class="input-group">
  <label class="input-label">搜索</label>
  <div style="position: relative;">
    <ion-icon name="search-outline"
      style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--text-tertiary);">
    </ion-icon>
    <input type="text" class="input" placeholder="搜索题目..."
      style="padding-left: 40px;" />
  </div>
</div>
```

### Naive UI 组件映射

```vue
<!-- 基础输入框 -->
<n-form-item label="用户名" :feedback="errorMessage" :validation-status="errorMessage ? 'error' : undefined">
  <n-input
    v-model:value="username"
    placeholder="请输入用户名"
    :maxlength="20"
    clearable
  />
</n-form-item>

<!-- 密码输入框 -->
<n-input
  v-model:value="password"
  type="password"
  show-password-on="click"
  placeholder="请输入密码"
/>

<!-- 文本域 -->
<n-input
  v-model:value="analysis"
  type="textarea"
  placeholder="请输入解析内容"
  :autosize="{ minRows: 4 }"
/>

<!-- 带前缀图标 -->
<n-input v-model:value="keyword" placeholder="搜索题目...">
  <template #prefix>
    <n-icon><SearchOutline /></n-icon>
  </template>
</n-input>
```

| Mockup 类 | Naive UI 组件 | 对应 Prop / Slot |
|-----------|---------------|-------------------|
| `input-group` | `n-form-item` | 容器组件 |
| `input-label` | `n-form-item` `label` prop | 标签文字 |
| `input` | `n-input` | 文本输入 |
| `textarea` | `n-input type="textarea"` | 多行文本 |
| `select` | `n-select` | 下拉选择 |
| `input-error` | `n-form-item` `validation-status="error"` | 错误状态 |
| `input-hint` | `n-form-item` `feedback` prop | 帮助/错误文字 |
| `.req` (必填星号) | `n-form-item` `required` prop | 必填标记 |

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `input-group` | 输入组容器，底部 margin 16px |
| `input-label` | 标签：13px、medium、底部 margin 8px |
| `input` | 输入框：全宽、内边距 12px 16px、圆角 8px |
| `textarea` | 文本域：最小高度 100px、垂直可调 |
| `select` | 下拉框：同 input 样式 |
| `input-error` | 错误修饰类：红色边框 |
| `input-hint` | 提示文字：12px、tertiary 色 |

### AI 实现指南

- 必填字段的标签后添加 `<span class="req">*</span>`，颜色为 `--color-error-500`。
- 前缀/后缀图标通过绝对定位实现，需调整 input 的 `padding-left` / `padding-right`。
- `focus` 状态的阴影为品牌色半透明 ring 效果，使用 `box-shadow` 而非 `outline`。
- `textarea` 设置 `resize: vertical` 仅允许垂直调整大小。
- 使用 Naive UI 时，校验状态通过 `n-form-item` 的 `validation-status` prop 控制，错误信息通过 `feedback` prop 传入。
- `clearable` prop 对应 mockup 中的清空按钮功能。

---

## 5. 表格 (Data Table)

### 组件描述

数据表格用于展示结构化列表数据，如题目列表、试卷列表、用户列表等。支持文本列、标签列、操作列及不同对齐方式的列。

### 视觉状态

| 区域 | 背景色 | 说明 |
|------|--------|------|
| 表头 (`thead`) | `--bg-subtle` (#FAFAFB) | 大写字母、semibold |
| 表体行 (默认) | `--bg-card` (白色) | 默认行 |
| 表体行 (悬停) | `--bg-subtle` (#FAFAFB) | 悬停高亮 |
| 最后一行 | 无底边框 | 去除多余分割线 |

### HTML 结构示例

```html
<div class="table-wrapper">
  <table class="data-table">
    <thead>
      <tr>
        <th>题目内容</th>
        <th>类型</th>
        <th>难度</th>
        <th class="col-center">状态</th>
        <th class="col-narrow col-right">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>以下哪个不是 JavaScript 的数据类型？</td>
        <td><span class="tag tag-info">单选</span></td>
        <td><span class="tag tag-success">简单</span></td>
        <td class="col-center"><span class="tag tag-success">已发布</span></td>
        <td class="col-right">
          <button class="btn btn-ghost btn-sm">编辑</button>
          <button class="btn btn-ghost btn-sm">删除</button>
        </td>
      </tr>
      <tr>
        <td>请简述 MVC 架构模式的核心思想。</td>
        <td><span class="tag tag-primary">简答</span></td>
        <td><span class="tag tag-error">困难</span></td>
        <td class="col-center"><span class="tag tag-default">草稿</span></td>
        <td class="col-right">
          <button class="btn btn-ghost btn-sm">编辑</button>
          <button class="btn btn-ghost btn-sm">删除</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 列类型说明

| 列类型 | 对齐类 | 说明 |
|--------|--------|------|
| 文本列 | 默认左对齐 | 题目内容、名称等 |
| 标签列 | `col-center` | 类型、难度、状态标签居中 |
| 操作列 | `col-right` + `col-narrow` | 编辑、删除按钮右对齐 |
| 数字列 | `col-right` | 分数、数量等右对齐 |

### Naive UI 组件映射

```vue
<n-data-table
  :columns="columns"
  :data="data"
  :pagination="paginationConfig"
  :bordered="false"
/>
```

```typescript
// columns 配置示例
const columns: DataTableColumns<Question> = [
  {
    title: '题目内容',
    key: 'content',
    ellipsis: { tooltip: true },
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    align: 'center',
    render(row) {
      const typeMap: Record<string, { label: string; type: string }> = {
        single:   { label: '单选', type: 'info' },
        multiple: { label: '多选', type: 'warning' },
        judge:    { label: '判断', type: 'success' },
        fill:     { label: '填空', type: 'default' },
        short:    { label: '简答', type: 'primary' },
      }
      const item = typeMap[row.type]
      return h(NTag, { type: item.type, bordered: false, size: 'small' }, { default: () => item.label })
    },
  },
  {
    title: '难度',
    key: 'difficulty',
    width: 80,
    align: 'center',
    render(row) {
      const diffMap: Record<string, { label: string; type: string }> = {
        easy:   { label: '简单', type: 'success' },
        medium: { label: '中等', type: 'warning' },
        hard:   { label: '困难', type: 'error' },
      }
      const item = diffMap[row.difficulty]
      return h(NTag, { type: item.type, bordered: false, size: 'small' }, { default: () => item.label })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'right',
    render(row) {
      return h('div', { class: 'flex gap-2 justify-end' }, [
        h(NButton, { size: 'small', quaternary: true, onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ])
    },
  },
]
```

| Mockup 类 | Naive UI 配置 | 说明 |
|-----------|---------------|------|
| `table-wrapper` | `n-data-table` 外层自动渲染 | 带边框圆角容器 |
| `col-center` | `align: 'center'` | 列居中对齐 |
| `col-right` | `align: 'right'` | 列右对齐 |
| `col-narrow` | `width: number` + `ellipsis` | 窄列，不换行 |
| `data-table th` | Naive UI 默认表头样式 | 大写、semibold |

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `table-wrapper` | 表格容器：白底、边框、圆角 12px、溢出隐藏 |
| `data-table` | 表格本体：全宽、border-collapse |
| `col-center` | 列居中 |
| `col-right` | 列右对齐 |
| `col-narrow` | 窄列：宽度自适应、不换行 |

### AI 实现指南

- 表格必须包裹在 `.table-wrapper` 中以获得圆角和边框。
- 表头文字使用 `text-transform: uppercase` + `letter-spacing: 0.03em`。
- 标签列和操作列使用 `render` 函数返回自定义 VNode。
- 使用 Naive UI 的 `n-data-table` 时，`:bordered="false"` 去除内部竖线，保持与 mockup 一致。
- 长文本列配置 `ellipsis: { tooltip: true }` 实现省略号 + 悬停提示。
- 行悬停高亮由 Naive UI 内置实现，无需额外配置。

---

## 6. 分页 (Pagination)

### 组件描述

分页组件用于表格数据分页导航，通常位于表格底部。包含页码按钮、上一页/下一页按钮，以及当前页高亮状态。

### 视觉状态

| 状态 | 描述 |
|------|------|
| `default` | 默认按钮：白底、默认边框、灰色文字 |
| `hover` | 悬停：边框变主题色浅色、文字变品牌色 |
| `active` | 当前页：品牌色背景、白色文字 |
| `disabled` | 禁用（首页/末页）：`opacity: 0.4` |

### HTML 结构示例

```html
<div class="pagination">
  <button class="page-btn" disabled>
    <ion-icon name="chevron-back-outline"></ion-icon>
  </button>
  <button class="page-btn active">1</button>
  <button class="page-btn">2</button>
  <button class="page-btn">3</button>
  <button class="page-btn">4</button>
  <button class="page-btn">5</button>
  <button class="page-btn">
    <ion-icon name="chevron-forward-outline"></ion-icon>
  </button>
</div>
```

### Naive UI 组件映射

**方式一：内嵌于 n-data-table（推荐）**

```vue
<n-data-table
  :columns="columns"
  :data="data"
  :pagination="{
    page: currentPage,
    pageSize: pageSize,
    itemCount: total,
    showSizePicker: false,
    prefix: ({ itemCount }) => `共 ${itemCount} 条`,
  }"
  remote
  @update:page="handlePageChange"
/>
```

**方式二：独立使用 n-pagination**

```vue
<n-pagination
  v-model:page="currentPage"
  :page-count="totalPages"
  :page-slot="5"
  show-quick-jumper
/>
```

| Mockup 类 | Naive UI 配置 | 说明 |
|-----------|---------------|------|
| `pagination` | `n-data-table` 的 `pagination` prop | 分页配置 |
| `page-btn` | Naive UI 内置分页按钮 | 自动渲染 |
| `active` | Naive UI 内置当前页样式 | 自动高亮 |
| `disabled` | Naive UI 内置禁用样式 | 首末页自动禁用 |

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `pagination` | 分页容器：flex 右对齐、gap 8px、顶部边框 |
| `page-btn` | 页码按钮：32x32px、圆角 8px、边框 |
| `active` | 当前页修饰类：品牌色背景 |

### AI 实现指南

- 分页组件通常与 `table-wrapper` 配合使用，位于表格底部，通过 `border-top` 分隔。
- 在使用 Naive UI `n-data-table` 时，分页通过 `pagination` prop 配置，无需单独引入 `n-pagination`。
- 服务端分页需设置 `remote` 属性，并在 `@update:page` 事件中重新请求数据。
- 分页容器默认 `justify-content: flex-end`（右对齐）。
- 页码按钮最小宽度 32px，高度 32px，圆角 8px。

---

## 7. 统计卡片 (Stat Card)

### 组件描述

统计卡片用于展示关键数字指标，如题目总数、正确率、练习次数等。由标签（描述）和数值组成，可附加后缀单位和趋势指示器。

### 视觉状态

| 变体 | 描述 |
|------|------|
| 基础 | 标签 + 数值 |
| 带后缀 | 标签 + 数值 + 后缀单位（如 %、道、次） |
| 带趋势 | 标签 + 数值 + 趋势指示器（上升/下降箭头） |
| 小尺寸 | 使用 `stat-value-sm` 替代 `stat-value` |

### HTML 结构示例

```html
<!-- 基础统计卡片 -->
<div class="stat-card">
  <div class="stat-label">题目总数</div>
  <div class="stat-value">1,248</div>
</div>

<!-- 带后缀 -->
<div class="stat-card">
  <div class="stat-label">正确率</div>
  <div class="stat-value">85.2<span class="stat-suffix">%</span></div>
</div>

<!-- 带趋势指示器 -->
<div class="stat-card">
  <div class="stat-label">本周练习</div>
  <div class="flex items-center gap-2">
    <div class="stat-value">32</div>
    <span class="tag tag-success">
      <ion-icon name="trending-up-outline"></ion-icon>
      +12%
    </span>
  </div>
</div>

<!-- 小尺寸数值 -->
<div class="stat-card">
  <div class="stat-label">平均分</div>
  <div class="stat-value stat-value-sm">78.5</div>
</div>
```

### Naive UI 组件映射

```vue
<n-card :bordered="true" size="small">
  <n-statistic label="题目总数" :value="1248" />
</n-card>

<!-- 带后缀 -->
<n-card :bordered="true" size="small">
  <n-statistic label="正确率" :value="85.2">
    <template #suffix>
      <span style="font-size: 14px; color: var(--text-tertiary);">%</span>
    </template>
  </n-statistic>
</n-card>
```

| Mockup 类 | Naive UI 组件 | 说明 |
|-----------|---------------|------|
| `stat-card` | `n-card` + `n-statistic` | 卡片容器 |
| `stat-label` | `n-statistic` `label` prop | 统计标签 |
| `stat-value` | `n-statistic` `value` prop | 统计数值 |
| `stat-suffix` | `n-statistic` `#suffix` slot | 后缀单位 |
| `stat-value-sm` | 自定义 `tabular-numbers` class | 小号数值 |

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `stat-card` | 容器：白底、边框、圆角 12px、padding 20px |
| `stat-label` | 标签：12px、medium、tertiary、大写、字间距 |
| `stat-value` | 数值：28px、bold、primary 色 |
| `stat-value-sm` | 小数值：24px、bold |
| `stat-suffix` | 后缀：14px、normal、tertiary、左间距 4px |

### AI 实现指南

- 标签使用 `text-transform: uppercase` + `letter-spacing: 0.03em` 营造数据仪表盘风格。
- 数值默认为 28px (`--text-3xl`)，小尺寸为 24px (`--text-2xl`)。
- 后缀单位紧跟数值，使用较小字号和较细字重以区分主次。
- 趋势指示器可使用 `tag` 组件 + Ionicons 箭头图标组合实现。
- 多个统计卡片通常在页面顶部以网格排列（如 `grid grid-cols-4 gap-4`）。

---

## 8. 答题选项 (Question Option)

### 组件描述

答题选项是考试/练习页面中展示题目选项的核心交互组件。每个选项由圆形标记和选项内容组成，支持选中、正确、错误等多种状态。

### 视觉状态

| 状态 | 边框色 | 背景色 | 标记样式 | 说明 |
|------|--------|--------|----------|------|
| `default` | `--border-default` | 透明 | 灰色边框 | 未选择 |
| `hover` | `--color-primary-300` | 透明 | — | 悬停预选 |
| `selected` | `--color-primary-500` | `--color-primary-50` | 品牌色填充 + 白字 | 已选择 |
| `correct` | `--color-success-500` | `--color-success-50` | 成功色填充 + 白字 | 正确答案 |
| `wrong` | `--color-error-500` | `--color-error-50` | 错误色填充 + 白字 | 错误选择 |

### HTML 结构示例

```html
<!-- 默认状态 -->
<div class="option-item">
  <div class="option-marker">A</div>
  <div class="option-content">选项 A 的内容</div>
</div>

<!-- 选中状态 -->
<div class="option-item selected">
  <div class="option-marker">B</div>
  <div class="option-content">选项 B 的内容</div>
</div>

<!-- 正确状态（答题结果展示） -->
<div class="option-item correct">
  <div class="option-marker">
    <ion-icon name="checkmark-outline"></ion-icon>
  </div>
  <div class="option-content">选项 C 的内容（正确答案）</div>
</div>

<!-- 错误状态（答题结果展示） -->
<div class="option-item wrong">
  <div class="option-marker">
    <ion-icon name="close-outline"></ion-icon>
  </div>
  <div class="option-content">选项 D 的内容（你的选择）</div>
</div>
```

### CSS 类说明

| 类名 | 用途 |
|------|------|
| `option-item` | 选项容器：flex、2px 边框、圆角 12px、padding 16px、底部间距 12px |
| `option-marker` | 圆形标记：28x28px、圆形、2px 边框、居中 |
| `option-content` | 选项内容：flex-1、14px、行高 1.5 |
| `selected` | 选中状态修饰类 |
| `correct` | 正确状态修饰类 |
| `wrong` | 错误状态修饰类 |

> **注意**：`selected`、`correct`、`wrong` 作为修饰类追加在 `option-item` 上，同时影响 `option-marker` 的样式（通过 `.option-item.selected .option-marker` 选择器）。

### Naive UI 组件映射

```vue
<!-- 使用自定义组件实现，不直接映射到单一 Naive UI 组件 -->
<template>
  <div
    class="option-item"
    :class="optionClass"
    @click="handleSelect"
  >
    <div class="option-marker">
      <ion-icon v-if="status === 'correct'" name="checkmark-outline" />
      <ion-icon v-else-if="status === 'wrong'" name="close-outline" />
      <template v-else>{{ marker }}</template>
    </div>
    <div class="option-content">{{ content }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  marker: string      // 'A' | 'B' | 'C' | 'D'
  content: string
  status?: 'default' | 'selected' | 'correct' | 'wrong'
}>()

const optionClass = computed(() => {
  if (props.status && props.status !== 'default') {
    return props.status
  }
  return ''
})
</script>
```

### AI 实现指南

- `option-item` 使用 2px 边框（比普通 1px 更粗）以增强选中态的视觉反馈。
- `option-marker` 为 28x28px 圆形，默认灰色边框，选中/正确/错误时变为对应颜色填充 + 白色文字。
- 答题模式下只有 `selected` 状态可切换；查看结果模式下 `correct` 和 `wrong` 为只读展示。
- 选项标记在结果模式下用对勾 (`checkmark-outline`) 和叉号 (`close-outline`) 图标替代字母。
- 多选题的标记可改为方形圆角以区分单选/多选（可扩展 `option-marker-square` 修饰类）。
- 此组件不直接映射到 Naive UI 组件，建议作为自定义组件实现。

---

## 9. 题目导航网格 (Question Nav Grid)

### 组件描述

题目导航网格在考试/练习页面侧边展示所有题目的答题进度。以 5 列网格排列，通过颜色区分当前题、已答、未答和标记题。

### 视觉状态

| 状态 | 背景色 | 文字色 | 说明 |
|------|--------|--------|------|
| `default` | `--bg-card` (白色) | `--text-secondary` | 默认状态 |
| `current` | `--color-primary-500` (#5B5FE9) | 白色 | 当前所在题目 |
| `answered` | `--color-success-500` (#22B570) | 白色 | 已作答题目 |
| `unanswered` | `--color-neutral-100` (#F4F4F6) | `--text-tertiary` | 未作答题目 |
| `marked` | `--color-warning-500` (#FFA42B) | 白色 | 标记待复查题目 |

> **优先级**：`current` > `marked` > `answered` > `unanswered` > `default`。当前题始终以品牌色高亮，即使该题已答或已标记。

### HTML 结构示例

```html
<div class="q-nav-grid">
  <div class="q-nav-cell current">1</div>
  <div class="q-nav-cell answered">2</div>
  <div class="q-nav-cell answered">3</div>
  <div class="q-nav-cell unanswered">4</div>
  <div class="q-nav-cell marked">5</div>
  <div class="q-nav-cell unanswered">6</div>
  <div class="q-nav-cell answered">7</div>
  <div class="q-nav-cell unanswered">8</div>
  <div class="q-nav-cell answered">9</div>
  <div class="q-nav-cell unanswered">10</div>
</div>

<!-- 图例说明 -->
<div class="nav-legend">
  <div class="nav-legend-item">
    <span class="nav-legend-dot" style="background: var(--color-primary-500);"></span>
    当前
  </div>
  <div class="nav-legend-item">
    <span class="nav-legend-dot" style="background: var(--color-success-500);"></span>
    已答
  </div>
  <div class="nav-legend-item">
    <span class="nav-legend-dot" style="background: var(--color-neutral-100); border: 1px solid var(--border-default);"></span>
    未答
  </div>
  <div class="nav-legend-item">
    <span class="nav-legend-dot" style="background: var(--color-warning-500);"></span>
    标记
  </div>
</div>
```

### CSS 类说明

| 类名 | 用途 |
|------|------|
| `q-nav-grid` | 网格容器：CSS Grid、5 列等宽、gap 8px |
| `q-nav-cell` | 单元格：正方形 (`aspect-ratio: 1`)、圆角 8px、居中文字 |
| `current` | 当前题修饰类 |
| `answered` | 已答题修饰类 |
| `unanswered` | 未答题修饰类 |
| `marked` | 标记题修饰类 |

### Naive UI 组件映射

```vue
<!-- 使用自定义组件实现 -->
<template>
  <div class="q-nav-grid">
    <div
      v-for="(question, index) in questions"
      :key="question.id"
      class="q-nav-cell"
      :class="getCellClass(index)"
      @click="$emit('jump', index)"
    >
      {{ index + 1 }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface QuestionState {
  answered: boolean
  marked: boolean
}

const props = defineProps<{
  questions: QuestionState[]
  currentIndex: number
}>()

defineEmits<{
  jump: [index: number]
}>()

function getCellClass(index: number): string {
  if (index === props.currentIndex) return 'current'
  const q = props.questions[index]
  if (q.marked) return 'marked'
  if (q.answered) return 'answered'
  return 'unanswered'
}
</script>
```

### AI 实现指南

- 网格固定 5 列 (`grid-template-columns: repeat(5, 1fr)`)，题目数量多时自动换行。
- 每个 cell 使用 `aspect-ratio: 1` 保持正方形，无需手动设置高度。
- 点击 cell 跳转到对应题目（通过 emit 事件或路由跳转）。
- 状态优先级逻辑：先判断 `current`，再判断 `marked`，再判断 `answered`，最后 `unanswered`。
- 图例 (`nav-legend`) 不是 CSS 类库中的标准组件，在 mockup 中通过内联样式实现。建议封装为独立小组件。

---

## 10. 头像 (Avatar)

### 组件描述

头像用于展示用户标识。当用户无自定义头像时，根据姓名首字符自动生成带背景色的圆形头像。支持四种尺寸。

### 尺寸规格

| 尺寸类 | 宽高 | 字号 | 使用场景 |
|--------|------|------|----------|
| `avatar-sm` | 28px | `--text-xs` (12px) | 表格内、列表项 |
| 默认 | 32px | `--text-sm` (13px) | 顶部导航栏、评论 |
| `avatar-lg` | 48px | `--text-lg` (16px) | 个人资料卡片 |
| `avatar-xl` | 72px | `--text-2xl` (24px) | 个人资料页大头像 |

### 颜色生成算法

当无图片头像时，根据姓名首字符的 charCode 哈希选择预设背景色：

```typescript
const AVATAR_COLORS = [
  '#5B5FE9', // primary-500
  '#22B570', // success-500
  '#FFA42B', // warning-500
  '#F0503C', // error-500
  '#3B8BFF', // info-500
  '#7C4FD4', // 紫色
  '#E68A00', // warning-600
  '#1A965C', // success-600
]

function getAvatarColor(name: string): string {
  const charCode = name.charCodeAt(0)
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length]
}

function getAvatarInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}
```

### HTML 结构示例

```html
<!-- 不同尺寸 -->
<div class="avatar avatar-sm" style="background: #5B5FE9;">张</div>
<div class="avatar" style="background: #22B570;">李</div>
<div class="avatar avatar-lg" style="background: #FFA42B;">王</div>
<div class="avatar avatar-xl" style="background: #F0503C;">赵</div>

<!-- 顶部导航栏中使用 -->
<div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
  <div class="avatar" style="background: #5B5FE9;">张</div>
  <span style="font-size: 14px; font-weight: 500;">张同学</span>
  <ion-icon name="chevron-down-outline" style="font-size: 16px; color: var(--text-tertiary);"></ion-icon>
</div>
```

### Naive UI 组件映射

```vue
<!-- 文字头像 -->
<n-avatar
  round
  :size="avatarSize"
  :color="getAvatarColor(user.name)"
  :style="{ backgroundColor: getAvatarColor(user.name) }"
>
  {{ user.name.charAt(0) }}
</n-avatar>

<!-- 图片头像 -->
<n-avatar
  round
  :size="avatarSize"
  :src="user.avatar"
  fallback-src="/default-avatar.png"
/>

<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'default' | 'lg' | 'xl'
}>()

const avatarSize = computed(() => {
  const sizeMap = { sm: 28, default: 32, lg: 48, xl: 72 }
  return sizeMap[props.size ?? 'default']
})
</script>
```

| Mockup 尺寸 | Naive UI `size` |
|-------------|-----------------|
| `avatar-sm` | `28` |
| 默认 | `32` |
| `avatar-lg` | `48` |
| `avatar-xl` | `72` |

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `avatar` | 基础头像：32x32px、圆形、白色文字、居中 |
| `avatar-sm` | 小尺寸：28x28px |
| `avatar-lg` | 大尺寸：48x48px |
| `avatar-xl` | 超大尺寸：72x72px |

### AI 实现指南

- 头像始终使用 `border-radius: var(--radius-full)` (9999px) 呈现为圆形。
- 文字颜色固定为白色，通过背景色提供对比度。
- 姓名首字符应转为大写。
- 使用 Naive UI `n-avatar` 时，`round` prop 对应圆形。
- 尺寸通过数字（像素）传递给 Naive UI 的 `size` prop。
- 头像与用户名通常组合使用，中间间距为 `var(--space-2)` (8px)。

---

## 11. 徽章 (Badge)

### 组件描述

徽章用于展示通知未读数量等数字信息，通常叠加在图标右上角。使用红色背景的圆形/胶囊形小标签。

### 视觉状态

| 状态 | 描述 |
|------|------|
| 数字 | 显示具体数字（如 3、99+） |
| 圆点 | 不显示数字，仅显示红点（无未读数详情时） |

### HTML 结构示例

```html
<!-- 通知图标上的数字徽章 -->
<div style="position: relative; cursor: pointer;">
  <ion-icon name="notifications-outline"
    style="font-size: 22px; color: var(--text-secondary);">
  </ion-icon>
  <span class="badge"
    style="position: absolute; top: -4px; right: -4px;">3</span>
</div>

<!-- 大数字显示为 99+ -->
<div style="position: relative; cursor: pointer;">
  <ion-icon name="mail-outline"
    style="font-size: 22px; color: var(--text-secondary);">
  </ion-icon>
  <span class="badge"
    style="position: absolute; top: -4px; right: -4px;">99+</span>
</div>
```

### Naive UI 组件映射

```vue
<n-badge :value="unreadCount" :max="99">
  <n-icon size="22" :color="themeVars.textColor2">
    <NotificationsOutline />
  </n-icon>
</n-badge>

<!-- 圆点模式 -->
<n-badge dot :show="hasUnread">
  <n-icon size="22">
    <MailOutline />
  </n-icon>
</n-badge>
```

| Mockup 类 | Naive UI 组件 | 说明 |
|-----------|---------------|------|
| `badge` | `n-badge` `:value` | 数字徽章 |
| `badge` (无数字) | `n-badge` `dot` | 圆点模式 |

### Tailwind 工具类映射

| 类名 | 用途 |
|------|------|
| `badge` | 徽章：最小宽 18px、高 18px、圆角 9999px、红色背景、白字、11px bold |

### AI 实现指南

- 徽章默认背景色为 `--color-error-500` (#F0503C)，文字为白色。
- 使用绝对定位 (`position: absolute`) 叠加在父元素右上角，偏移量 `top: -4px; right: -4px`。
- 数字超过 99 时显示 `99+`（Naive UI 的 `max` prop 自动处理）。
- 最小宽度 18px，当数字为单字符时保持圆形；多字符时变为胶囊形（`padding: 0 5px`）。
- 字号为 11px、bold。
- 使用 Naive UI `n-badge` 时，`value` 为 0 时自动隐藏徽章。

---

## 12. 侧边栏 (Sidebar)

### 组件描述

侧边栏是应用的主导航容器，固定在页面左侧。由 Logo 区、导航菜单和底部区域组成。菜单项支持分组标签，当前页对应的菜单项高亮显示。在移动端以抽屉形式展开。

### 视觉状态

| 元素 | 状态 | 样式 |
|------|------|------|
| 菜单项 | `default` | 透明背景、`--text-secondary` 文字 |
| 菜单项 | `hover` | `--bg-hover` 背景、`--text-primary` 文字 |
| 菜单项 | `active` | `--bg-selected` 背景、`--text-brand` 文字、semibold |

### HTML 结构示例

```html
<aside class="sidebar">
  <!-- Logo 区域 -->
  <div class="sidebar-logo">
    <div class="sidebar-logo-icon">QS</div>
    <span class="sidebar-logo-text">Quick Study</span>
  </div>

  <!-- 导航菜单 -->
  <nav class="sidebar-nav">
    <!-- 第一组 -->
    <div class="sidebar-nav-section">
      <div class="sidebar-nav-item active">
        <ion-icon name="home-outline"></ion-icon>
        <span>首页</span>
      </div>
      <div class="sidebar-nav-item">
        <ion-icon name="library-outline"></ion-icon>
        <span>题库</span>
      </div>
      <div class="sidebar-nav-item">
        <ion-icon name="document-text-outline"></ion-icon>
        <span>题目</span>
      </div>
      <div class="sidebar-nav-item">
        <ion-icon name="file-tray-full-outline"></ion-icon>
        <span>试卷</span>
      </div>
    </div>

    <!-- 分组标签 -->
    <div class="sidebar-nav-label">学习中心</div>
    <div class="sidebar-nav-item">
      <ion-icon name="game-controller-outline"></ion-icon>
      <span>练习</span>
    </div>
    <div class="sidebar-nav-item">
      <ion-icon name="close-circle-outline"></ion-icon>
      <span>错题本</span>
    </div>
    <div class="sidebar-nav-item">
      <ion-icon name="time-outline"></ion-icon>
      <span>做题记录</span>
    </div>

    <!-- 管理组标签 -->
    <div class="sidebar-nav-label">管理</div>
    <div class="sidebar-nav-item">
      <ion-icon name="people-outline"></ion-icon>
      <span>用户管理</span>
    </div>
  </nav>

  <!-- 底部区域 -->
  <div class="sidebar-footer">
    <div class="sidebar-nav-item">
      <ion-icon name="log-out-outline"></ion-icon>
      <span>退出登录</span>
    </div>
  </div>
</aside>
```

### Naive UI 组件映射

```vue
<n-layout has-sider>
  <!-- 桌面端侧边栏 -->
  <n-layout-sider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    show-trigger
    @collapse="collapsed = true"
    @expand="collapsed = false"
  >
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">QS</div>
      <span v-if="!collapsed" class="sidebar-logo-text">Quick Study</span>
    </div>

    <!-- 菜单 -->
    <n-menu
      v-model:value="activeKey"
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
  </n-layout-sider>

  <n-layout>
    <!-- 主内容区域 -->
    <n-layout-header bordered>...</n-layout-header>
    <n-layout-content>...</n-layout-content>
  </n-layout>
</n-layout>

<!-- 移动端抽屉 -->
<n-drawer v-model:show="mobileSidebarVisible" :width="240" placement="left">
  <n-drawer-content>
    <n-menu v-model:value="activeKey" :options="menuOptions" />
  </n-drawer-content>
</n-drawer>
```

```typescript
// 菜单配置
const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: 'home',
    icon: () => h(NIcon, null, { default: () => h(HomeOutline) }),
  },
  {
    label: '题库',
    key: 'bank',
    icon: () => h(NIcon, null, { default: () => h(LibraryOutline) }),
  },
  {
    type: 'group',
    label: '学习中心',
    key: 'study-group',
    children: [
      {
        label: '练习',
        key: 'practice',
        icon: () => h(NIcon, null, { default: () => h(GameControllerOutline) }),
      },
      {
        label: '错题本',
        key: 'wrong-questions',
        icon: () => h(NIcon, null, { default: () => h(CloseCircleOutline) }),
      },
    ],
  },
]
```

| Mockup 类 | Naive UI 组件 | 说明 |
|-----------|---------------|------|
| `sidebar` | `n-layout-sider` | 侧边栏容器 |
| `sidebar-logo` | 自定义 div | Logo 区域 |
| `sidebar-nav` | `n-menu` | 导航菜单 |
| `sidebar-nav-item` | `n-menu` `menu-item` | 菜单项 |
| `sidebar-nav-label` | `n-menu` `type: 'group'` | 分组标签 |
| `sidebar-footer` | 自定义 div | 底部区域 |
| `active` | `n-menu` `v-model:value` | 当前激活项 |

### CSS 类完整列表

| 类名 | 用途 |
|------|------|
| `sidebar` | 容器：宽 240px、白底、固定定位、flex-col |
| `sidebar-logo` | Logo 区：高 64px、flex 居中、底部边框 |
| `sidebar-logo-icon` | Logo 图标：36x36px、品牌渐变背景、圆角 12px |
| `sidebar-logo-text` | Logo 文字：16px、bold |
| `sidebar-nav` | 导航区：flex-1、padding 12px、可滚动 |
| `sidebar-nav-section` | 分组容器：底部间距 |
| `sidebar-nav-label` | 分组标签：12px、semibold、tertiary、大写 |
| `sidebar-nav-item` | 菜单项：flex、gap 12px、padding 12px、圆角 8px |
| `sidebar-nav-item.active` | 激活态：选中背景 + 品牌色文字 |
| `sidebar-footer` | 底部区：padding 12px、顶部边框 |

### 响应式设计

| 断点 | 行为 |
|------|------|
| 桌面 (>= 768px) | 侧边栏固定显示，宽度 240px |
| 移动 (< 768px) | 侧边栏隐藏，通过汉堡菜单触发 `n-drawer` 抽屉 |

### AI 实现指南

- 侧边栏使用 `position: fixed` 固定在左侧，主内容区通过 `margin-left: var(--sidebar-width)` 避让。
- Logo 图标使用 `--gradient-brand` 渐变背景。
- 菜单项图标大小固定 20px，与文字间距 12px (`--space-3`)。
- 激活态使用 `--bg-selected` (#EEF0FF) 浅色背景而非品牌色实色填充，保持轻量感。
- 使用 Naive UI `n-menu` 时，分组通过 `type: 'group'` 的菜单项实现 `sidebar-nav-label` 效果。
- 移动端通过监听窗口宽度切换为 `n-drawer` 模式，抽屉打开时需添加半透明遮罩层。
- 底部 "退出登录" 项使用与普通菜单项相同的样式，放在 `sidebar-footer` 中通过顶部边框分隔。

---

## 13. 顶部导航栏 (Header)

### 组件描述

顶部导航栏是主内容区的头部，固定在页面顶部。左侧展示面包屑导航，右侧展示通知图标（带徽章）和用户菜单（头像 + 下拉菜单）。

### HTML 结构示例

```html
<header class="app-header">
  <!-- 左侧：面包屑 -->
  <div class="app-header-left">
    <div class="breadcrumb">
      <span>题库</span>
      <ion-icon name="chevron-forward-outline" style="font-size: 14px;"></ion-icon>
      <span class="breadcrumb-current">题目列表</span>
    </div>
  </div>

  <!-- 右侧：通知 + 用户菜单 -->
  <div class="app-header-right">
    <!-- 通知图标 -->
    <div style="position: relative; cursor: pointer;">
      <ion-icon name="notifications-outline"
        style="font-size: 22px; color: var(--text-secondary);">
      </ion-icon>
      <span class="badge"
        style="position: absolute; top: -4px; right: -4px;">3</span>
    </div>

    <!-- 用户菜单 -->
    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
      <div class="avatar" style="background: #5B5FE9;">张</div>
      <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">张同学</span>
      <ion-icon name="chevron-down-outline"
        style="font-size: 16px; color: var(--text-tertiary);">
      </ion-icon>
    </div>
  </div>
</header>
```

### Naive UI 组件映射

```vue
<n-layout-header bordered class="app-header">
  <!-- 左侧面包屑 -->
  <div class="app-header-left">
    <n-breadcrumb>
      <n-breadcrumb-item @click="$router.push('/banks')">题库</n-breadcrumb-item>
      <n-breadcrumb-item>题目列表</n-breadcrumb-item>
    </n-breadcrumb>
  </div>

  <!-- 右侧操作区 -->
  <div class="app-header-right">
    <!-- 通知 -->
    <n-badge :value="unreadCount" :max="99">
      <n-icon size="22" style="cursor: pointer;" @click="$router.push('/notifications')">
        <NotificationsOutline />
      </n-icon>
    </n-badge>

    <!-- 用户下拉菜单 -->
    <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
      <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <n-avatar round :size="32" :style="{ backgroundColor: getAvatarColor(userName) }">
          {{ userName.charAt(0) }}
        </n-avatar>
        <span style="font-size: 14px; font-weight: 500;">{{ userName }}</span>
        <n-icon size="16"><ChevronDownOutline /></n-icon>
      </div>
    </n-dropdown>
  </div>
</n-layout-header>
```

```typescript
const userMenuOptions: DropdownOption[] = [
  { label: '个人资料', key: 'profile', icon: () => h(NIcon, null, { default: () => h(PersonOutline) }) },
  { label: '我的设置', key: 'settings', icon: () => h(NIcon, null, { default: () => h(SettingsOutline) }) },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout', icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }) },
]
```

| Mockup 类 | Naive UI 组件 | 说明 |
|-----------|---------------|------|
| `app-header` | `n-layout-header` | 顶部栏容器 |
| `breadcrumb` | `n-breadcrumb` | 面包屑导航 |
| `breadcrumb-current` | 最后一个 `n-breadcrumb-item` | 当前页（无链接） |
| `badge` | `n-badge` | 通知徽章 |
| `avatar` | `n-avatar` | 用户头像 |
| 用户菜单 | `n-dropdown` | 下拉菜单 |

### CSS 类完整列表

| 类名 | 用途 |
|------|------|
| `app-header` | 容器：高 64px、白底、底部边框、flex 两端对齐、sticky 定位 |
| `app-header-left` | 左侧区域：flex、gap 12px |
| `app-header-right` | 右侧区域：flex、gap 16px |
| `breadcrumb` | 面包屑：flex、gap 8px、13px、tertiary 色 |
| `breadcrumb-current` | 当前页：primary 色、medium |

### AI 实现指南

- Header 高度为 `--header-height` (64px)，使用 `position: sticky; top: 0` 固定。
- 面包屑中非当前页可点击跳转，当前页不可点击（无链接）。
- 通知图标与徽章组合使用绝对定位，徽章偏移 `top: -4px; right: -4px`。
- 用户菜单通过 `n-dropdown` 实现，触发器为头像 + 用户名 + 下拉箭头的组合。
- Header 的 `z-index` 为 `--z-sticky` (1100)，确保在内容之上。
- 左右区域通过 `justify-content: space-between` 分离。

---

## 14. 模态框 (Modal)

### 组件描述

模态框用于在当前页面之上展示需要用户关注的内容或表单，如确认删除、编辑表单等。由遮罩层、模态框容器、头部、主体和底部操作区组成。

### 视觉状态

| 元素 | 描述 |
|------|------|
| `modal-overlay` | 半透明黑色遮罩 (`rgba(0,0,0,0.4)`)，居中弹窗 |
| `modal` | 白色圆角容器，最大宽度 480px，最大高度 90vh |
| `modal-header` | 标题 + 关闭按钮，底部边框分隔 |
| `modal-body` | 主体内容区，padding 24px |
| `modal-footer` | 底部操作按钮区，右对齐，顶部边框分隔 |

### HTML 结构示例

```html
<div class="modal-overlay">
  <div class="modal">
    <!-- 头部 -->
    <div class="modal-header">
      <h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold);">删除题目</h3>
      <button class="btn btn-ghost btn-sm" style="padding: 4px;">
        <ion-icon name="close-outline" style="font-size: 20px;"></ion-icon>
      </button>
    </div>

    <!-- 主体 -->
    <div class="modal-body">
      <p>确定要删除这道题目吗？此操作不可撤销。</p>
    </div>

    <!-- 底部 -->
    <div class="modal-footer">
      <button class="btn btn-secondary">取消</button>
      <button class="btn btn-danger">确认删除</button>
    </div>
  </div>
</div>
```

### Naive UI 组件映射

```vue
<n-modal v-model:show="showModal" preset="card" :style="{ maxWidth: '480px' }" :title="modalTitle">
  <p>确定要删除这道题目吗？此操作不可撤销。</p>

  <template #footer>
    <div class="flex justify-end gap-3">
      <n-button @click="showModal = false">取消</n-button>
      <n-button type="error" @click="handleConfirm">确认删除</n-button>
    </div>
  </template>
</n-modal>
```

| Mockup 类 | Naive UI 配置 | 说明 |
|-----------|---------------|------|
| `modal-overlay` | `n-modal` 内置遮罩 | 自动渲染 |
| `modal` | `n-modal preset="card"` | 卡片预设 |
| `modal-header` | `preset="card"` 的 `title` prop | 头部标题 |
| `modal-body` | `n-modal` 默认 slot | 主体内容 |
| `modal-footer` | `#footer` slot | 底部操作区 |

### CSS 类完整列表

| 类名 | 用途 |
|------|------|
| `modal-overlay` | 遮罩层：fixed 全屏、黑色半透明、flex 居中、z-index 1300 |
| `modal` | 模态框：白底、圆角 16px、大阴影、最大宽 480px、最大高 90vh |
| `modal-header` | 头部：padding 20px 24px、flex 两端对齐、底部边框 |
| `modal-body` | 主体：padding 24px |
| `modal-footer` | 底部：padding 16px 24px、flex 右对齐、gap 12px、顶部边框 |

### AI 实现指南

- 模态框 `z-index` 为 `--z-modal` (1300)，在所有内容之上。
- 使用 Naive UI `n-modal` 时，`preset="card"` 自动生成带标题栏和关闭按钮的卡片式弹窗，与 mockup 结构一致。
- 模态框最大宽度默认 480px，大表单可调整为 640px 或更宽。
- 底部按钮区使用 `justify-content: flex-end` 右对齐，按钮间 gap 为 `--space-3` (12px)。
- 确认类操作（删除、提交）放在最右侧，取消按钮在其左侧。
- 模态框内容超过 `max-height: 90vh` 时，`overflow-y: auto` 自动出现滚动条。

---

## 15. 空状态 (Empty State)

### 组件描述

空状态用于在列表无数据、搜索无结果等场景下展示占位内容。由图标、标题和描述文字组成，居中排列。

### 视觉状态

| 元素 | 样式 |
|------|------|
| 图标 | 48px、`--color-neutral-300` 灰色 |
| 标题 | 16px、semibold、`--text-secondary` |
| 描述 | 13px、`--text-tertiary` |

### HTML 结构示例

```html
<div class="empty-state">
  <ion-icon name="document-text-outline" class="empty-state-icon"></ion-icon>
  <div class="empty-state-title">暂无题目</div>
  <div class="empty-state-desc">该题库下还没有题目，点击上方按钮新建题目</div>
</div>

<!-- 带操作按钮的空状态 -->
<div class="empty-state">
  <ion-icon name="search-outline" class="empty-state-icon"></ion-icon>
  <div class="empty-state-title">未找到匹配结果</div>
  <div class="empty-state-desc">试试调整搜索条件或清除筛选器</div>
  <button class="btn btn-secondary btn-sm mt-4">清除筛选</button>
</div>
```

### Naive UI 组件映射

```vue
<n-empty description="该题库下还没有题目，点击上方按钮新建题目">
  <template #icon>
    <n-icon :size="48" :color="themeVars.textColor3">
      <DocumentTextOutline />
    </n-icon>
  </template>
  <template #extra>
    <n-button size="small" @click="handleCreate">新建题目</n-button>
  </template>
</n-empty>
```

| Mockup 类 | Naive UI 组件 | 说明 |
|-----------|---------------|------|
| `empty-state` | `n-empty` | 空状态容器 |
| `empty-state-icon` | `#icon` slot | 图标 |
| `empty-state-title` | 内置标题样式 | 标题 |
| `empty-state-desc` | `description` prop | 描述文字 |

### CSS 类完整列表

| 类名 | 用途 |
|------|------|
| `empty-state` | 容器：flex-col、居中、padding 48px 24px、文字居中 |
| `empty-state-icon` | 图标：48px、灰色、底部间距 16px |
| `empty-state-title` | 标题：16px、semibold、secondary 色 |
| `empty-state-desc` | 描述：13px、tertiary 色 |

### AI 实现指南

- 空状态整体垂直居中排列，水平居中对齐。
- 图标颜色为 `--color-neutral-300` (#D5D5DC)，保持低调不抢眼。
- 可在描述下方添加操作按钮（如"新建"、"清除筛选"），按钮上方添加 `mt-4` (16px) 间距。
- 通常放在卡片内部或列表区域中央替代无数据时的空白。
- 使用 Naive UI `n-empty` 时，`description` prop 对应描述文字，`#extra` slot 放置操作按钮。

---

## 16. 进度条 (Progress)

### 组件描述

进度条用于展示任务完成度、考试进度、上传进度等。由轨道和填充条组成，支持不同语义颜色变体。

### 视觉状态

| 变体 | 填充色 | 用途 |
|------|--------|------|
| `default` | `--color-primary-500` (#5B5FE9) | 默认进度 |
| `success` | `--color-success-500` (#22B570) | 完成/通过 |
| `warning` | `--color-warning-500` (#FFA42B) | 接近超时/低分 |
| `error` | `--color-error-500` (#F0503C) | 失败/超时 |

### HTML 结构示例

```html
<!-- 默认进度条 -->
<div class="progress">
  <div class="progress-bar" style="width: 45%;"></div>
</div>

<!-- 成功进度条 -->
<div class="progress">
  <div class="progress-bar success" style="width: 100%;"></div>
</div>

<!-- 警告进度条 -->
<div class="progress">
  <div class="progress-bar warning" style="width: 75%;"></div>
</div>

<!-- 错误进度条 -->
<div class="progress">
  <div class="progress-bar error" style="width: 30%;"></div>
</div>

<!-- 带标签的进度条 -->
<div class="flex items-center justify-between mb-2">
  <span style="font-size: var(--text-sm); color: var(--text-secondary);">答题进度</span>
  <span style="font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-primary);">9/20</span>
</div>
<div class="progress">
  <div class="progress-bar" style="width: 45%;"></div>
</div>
```

### Naive UI 组件映射

```vue
<n-progress
  type="line"
  :percentage="percentage"
  :status="progressStatus"
  :height="8"
  :border-radius="4"
  :show-indicator="false"
/>

<script setup lang="ts">
const props = defineProps<{
  current: number
  total: number
}>()

const percentage = computed(() => Math.round((props.current / props.total) * 100))

const progressStatus = computed<'default' | 'success' | 'warning' | 'error'>(() => {
  if (percentage.value >= 100) return 'success'
  return 'default'
})
</script>
```

| Mockup 变体 | Naive UI `status` |
|-------------|-------------------|
| `default` | `"default"` |
| `success` | `"success"` |
| `warning` | `"warning"` |
| `error` | `"error"` |

### CSS 类完整列表

| 类名 | 用途 |
|------|------|
| `progress` | 轨道：高 8px、灰色背景、圆角 9999px、溢出隐藏 |
| `progress-bar` | 填充条：高 100%、品牌色、圆角 9999px、宽度过渡动画 |
| `progress-bar.success` | 成功色填充 |
| `progress-bar.warning` | 警告色填充 |
| `progress-bar.error` | 错误色填充 |

### AI 实现指南

- 进度条高度固定 8px，使用 `border-radius: var(--radius-full)` (9999px) 呈现为胶囊形。
- 填充条宽度通过内联 `style="width: X%"` 或 Naive UI `percentage` prop 控制。
- 宽度变化使用 `transition: width var(--transition-slow)` (300ms) 实现平滑动画。
- `success` / `warning` / `error` 作为修饰类追加在 `progress-bar` 上。
- 使用 Naive UI 时，`:show-indicator="false"` 隐藏内置百分比文字，保持与 mockup 一致的纯条形样式。
- 进度条上方通常搭配文字标签（如"答题进度 9/20"），使用 flex 布局水平排列。

---

## 17. 警告提示 (Alert)

### 组件描述

警告提示用于在页面内展示重要的提示信息，如操作成功/失败通知、表单校验汇总等。支持四种语义变体，每种使用浅色背景 + 对应语义色文字。

### 视觉状态

| 变体 | 背景色 | 文字色 | 用途 |
|------|--------|--------|------|
| `alert-info` | `--color-info-50` (#E8F1FF) | `--color-info-600` (#1E6FE0) | 一般提示 |
| `alert-success` | `--color-success-50` (#E8F9F0) | `--color-success-600` (#1A965C) | 成功提示 |
| `alert-warning` | `--color-warning-50` (#FFF8E6) | `--color-warning-600` (#E68A00) | 警告提示 |
| `alert-error` | `--color-error-50` (#FFEFEC) | `--color-error-600` (#D63A28) | 错误提示 |

### HTML 结构示例

```html
<!-- 信息提示 -->
<div class="alert alert-info">
  <ion-icon name="information-circle-outline" style="font-size: 20px; flex-shrink: 0;"></ion-icon>
  <span>该试卷包含 50 道题目，考试时长 90 分钟。</span>
</div>

<!-- 成功提示 -->
<div class="alert alert-success">
  <ion-icon name="checkmark-circle-outline" style="font-size: 20px; flex-shrink: 0;"></ion-icon>
  <span>试卷已成功发布，学生可以开始考试。</span>
</div>

<!-- 警告提示 -->
<div class="alert alert-warning">
  <ion-icon name="warning-outline" style="font-size: 20px; flex-shrink: 0;"></ion-icon>
  <span>距离考试结束还有 5 分钟，请尽快完成答题。</span>
</div>

<!-- 错误提示 -->
<div class="alert alert-error">
  <ion-icon name="close-circle-outline" style="font-size: 20px; flex-shrink: 0;"></ion-icon>
  <span>提交失败，网络连接异常，请重试。</span>
</div>
```

### Naive UI 组件映射

```vue
<n-alert :type="alertType" :bordered="false">
  {{ message }}
</n-alert>

<!-- 带图标 -->
<n-alert :type="alertType" :bordered="false" show-icon>
  {{ message }}
</n-alert>
```

| Mockup 变体 | Naive UI `type` |
|-------------|-----------------|
| `alert-info` | `"info"` |
| `alert-success` | `"success"` |
| `alert-warning` | `"warning"` |
| `alert-error` | `"error"` |

### CSS 类完整列表

| 类名 | 用途 |
|------|------|
| `alert` | 基础样式：flex、gap 12px、padding 12px 16px、圆角 12px、13px |
| `alert-info` | 信息变体：蓝色浅底 + 蓝色文字 |
| `alert-success` | 成功变体：绿色浅底 + 绿色文字 |
| `alert-warning` | 警告变体：黄色浅底 + 黄色文字 |
| `alert-error` | 错误变体：红色浅底 + 红色文字 |

### AI 实现指南

- Alert 使用浅色背景 + 深色文字的配色方案（非实色填充），保持页面整体轻盈。
- 图标位于文字左侧，使用 `gap: var(--space-3)` (12px) 间距，图标大小 20px。
- 使用 `align-items: flex-start` 确保多行文字时图标顶部对齐。
- 使用 Naive UI `n-alert` 时，`:bordered="false"` 去除边框，`show-icon` 自动添加对应语义图标。
- Alert 不是自动消失的 Toast，它持续展示直到用户关闭或条件变化。
- 圆角为 `--radius-lg` (12px)，与卡片保持一致。

---

## 附录：CSS 类名速查表

### 布局类

| 类名 | 说明 |
|------|------|
| `app-shell` | 应用外壳：flex、最小高度 100vh |
| `main-area` | 主内容区：flex-1、左边距 240px |
| `app-content` | 内容区：padding 24px、最大宽 1280px、居中 |

### 组件类

| 类名 | 说明 |
|------|------|
| `btn`, `btn-{variant}`, `btn-{size}` | 按钮 |
| `card`, `card-hover`, `card-header`, `card-title`, `card-body` | 卡片 |
| `tag`, `tag-{variant}` | 标签 |
| `input`, `textarea`, `select`, `input-error` | 表单控件 |
| `table-wrapper`, `data-table`, `col-{align}` | 表格 |
| `pagination`, `page-btn`, `active` | 分页 |
| `stat-card`, `stat-label`, `stat-value` | 统计卡片 |
| `option-item`, `option-marker`, `option-content` | 答题选项 |
| `q-nav-grid`, `q-nav-cell` | 题目导航网格 |
| `avatar`, `avatar-{size}` | 头像 |
| `badge` | 徽章 |
| `empty-state`, `empty-state-icon` | 空状态 |
| `progress`, `progress-bar` | 进度条 |
| `modal`, `modal-overlay`, `modal-header` | 模态框 |
| `alert`, `alert-{variant}` | 警告提示 |

### 侧边栏/头部类

| 类名 | 说明 |
|------|------|
| `sidebar`, `sidebar-logo`, `sidebar-nav`, `sidebar-footer` | 侧边栏 |
| `sidebar-nav-item`, `sidebar-nav-label` | 菜单项/分组标签 |
| `app-header`, `app-header-left`, `app-header-right` | 顶部导航栏 |
| `breadcrumb`, `breadcrumb-current` | 面包屑 |

### 设计令牌速查

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--color-primary-500` | #5B5FE9 | 主色 |
| `--color-success-500` | #22B570 | 成功色 |
| `--color-error-500` | #F0503C | 错误色 |
| `--color-warning-500` | #FFA42B | 警告色 |
| `--color-info-500` | #3B8BFF | 信息色 |
| `--text-primary` | #242428 | 主文字 |
| `--text-secondary` | #6B6B76 | 次文字 |
| `--text-tertiary` | #8A8A96 | 辅助文字 |
| `--bg-card` | #FFFFFF | 卡片背景 |
| `--bg-page` | #F4F4F6 | 页面背景 |
| `--border-default` | #E8E8EC | 默认边框 |
| `--radius-lg` | 12px | 卡片圆角 |
| `--radius-md` | 8px | 按钮/输入框圆角 |
| `--space-4` | 16px | 默认间距 |
| `--header-height` | 64px | 顶部栏高度 |
| `--sidebar-width` | 240px | 侧边栏宽度 |
