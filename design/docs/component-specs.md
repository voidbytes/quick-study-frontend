# Quick Study Web — 组件规格说明书 (Component Specifications)

> **文档目的**：本文档定义 `frontend/src` 下所有真实存在的可复用 UI 组件、组合式函数（composables）与 UI 相关工具函数（utils）的规格。AI 开发者在生成或修改代码时应以本文档与源码保持一致。
>
> **唯一事实源**：本文档内容全部依据 `frontend/src` 现有代码（`.vue` 组件、`composables/*`、`utils/*`）逐字整理，新增 / 删除组件以代码为准。任何与代码不符之处，以代码为最终依据；代码未实现的能力，本文如实标注「代码未实现」。
>
> **设计令牌**：组件内联样式引用的 CSS 变量均来自 `design/tokens/design-tokens.css`（如 `--space-*`、`--color-*`、`--text-*`、`--radius-*`、`--border-*`、`--bg-*`、`--font-*`、`--leading-*`、`--transition-base`）。Naive UI 组件自带主题，不在本文重复其样式令牌。
>
> **图标来源**：组件直接引用 `@vicons/ionicons5` 的图标组件，已用图标仅 `CubeOutline`、`ArrowBackOutline`、`CloudUploadOutline`、`DocumentTextOutline` 四种，其余请沿用代码内既有名称，勿臆造。
>
> **CSS 参考**：基础原子类（btn / card / tag / input / table 等）的说明见 `design/mockups/styles/mockup.css`，不在本文重复；本文只描述代码库中已封装为 SFC 的组件。

---

## 目录

1. [EmptyState（空状态）](#1-emptystate空状态)
2. [FilterBar（筛选栏）](#2-filterbar筛选栏)
3. [PageHeader（页面标题栏）](#3-pageheader页面标题栏)
4. [ProviderBridge（Naive UI 反馈桥接）](#4-providerbridgenaive-ui-反馈桥接)
5. [QuestionNavGrid（答题导航网格）](#5-questionnavgrid答题导航网格)
6. [QuestionOption（答题选项）](#6-questionoption答题选项)
7. [QuestionPreviewDrawer（题目预览抽屉）](#7-questionpreviewdrawer题目预览抽屉)
8. [RichText（富文本安全渲染）](#8-richtext富文本安全渲染)
9. [SkeletonList（骨架列表）](#9-skeletonlist骨架列表)
10. [StatCard（统计卡片）](#10-statcard统计卡片)
11. [TagManageModal（标签管理弹窗）](#11-tagmanagemodal标签管理弹窗)
12. [UserSearchSelect（用户远程搜索选择器）](#12-usersearchselect用户远程搜索选择器)
13. [FileUpload（文件上传）](#13-fileupload文件上传)
14. [LoadError（加载失败）](#14-loaderror加载失败)
15. [MarkdownEditor（Markdown 编辑器）](#15-markdowneditormarkdown-编辑器)
16. [BankImportDialog（导入题库弹窗）](#16-bankimportdialog导入题库弹窗)
17. [ImportResultPanel（导入结果面板）](#17-importresultpanel导入结果面板)
18. [QuestionImportDialog（导入题目弹窗）](#18-questionimportdialog导入题目弹窗)
19. [useConfirm（确认弹窗组合式函数）](#19-useconfirm确认弹窗组合式函数)
20. [usePagination（分页列表组合式函数）](#20-usepagination分页列表组合式函数)
21. [useBankOptions（题库下拉选项组合式函数）](#21-usebankoptions题库下拉选项组合式函数)
22. [utils/format（格式化工具）](#22-utilsformat格式化工具)
23. [utils/tagOptions（标签分组选项工具）](#23-utilstagoptions标签分组选项工具)
24. [utils/practiceTitle（练习会话标题工具）](#24-utilspracticetitle练习会话标题工具)
25. [utils/constants（枚举字典）](#25-utilsconstants枚举字典)

---

## 1. EmptyState（空状态）

### 组件路径

`src/components/common/EmptyState.vue`

### 用途

列表无数据、搜索无结果、权限/内容缺失等场景下的占位展示。由图标、标题、描述（可选）与操作区插槽（可选）组成，整体垂直居中。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'暂无数据'` | 主标题 |
| `description` | `string` | `''` | 描述文字；为空时不渲染 `<p>` |
| `icon` | `any`（`Component`） | `CubeOutline` | 图标组件，经 `<component :is="icon" />` 渲染 |

> 默认图标 `CubeOutline` 来自 `@vicons/ionicons5`。

### Emits / Slots

- Emits：无。
- Slots：`action` —— 操作区（如"新建"按钮），渲染在描述下方。

### 关键实现要点

- 容器 `.empty-state` 使用 `display:flex; flex-direction:column; align-items:center; justify-content:center`，内边距 `var(--space-12) var(--space-6)`。
- 图标 `.es-icon` 颜色 `var(--color-neutral-300)`（中性灰 300），尺寸由 `<n-icon :size="56">` 控制。
- 标题 `.es-title`：`var(--text-base)`、`var(--font-semibold)`、`var(--text-secondary)`。
- 描述 `.es-desc`：`var(--text-sm)`、`var(--text-tertiary)`。
- 操作区 `.es-action` 上间距 `var(--space-5)`，仅当父级提供 `action` 插槽时存在。

### Naive UI 组件映射

- 图标渲染依赖 `<n-icon>`，传入组件而非 name。
- 非 `n-empty`：本组件为自定义 flex 布局，未使用 Naive UI 的空状态组件。

### 用法示例

```vue
<EmptyState title="暂无题目" description="该题库下还没有题目" :icon="DocumentTextOutline">
  <template #action>
    <n-button type="primary" @click="handleCreate">新建题目</n-button>
  </template>
</EmptyState>
```

---

## 2. FilterBar（筛选栏）

### 组件路径

`src/components/common/FilterBar.vue`

### 用途

筛选条件行的统一容器。仅提供一个带 `flex-wrap` 的横向布局插槽，本身不含任何业务逻辑或 Props。

### Props / Emits / Slots

- Props：无。
- Emits：无。
- Slots：`default` —— 筛选控件（如 `n-select`、`n-input`）直接放入即可。

### 关键实现要点

- `.filter-bar`：`display:flex; align-items:center; gap:var(--space-3); flex-wrap:wrap; margin-bottom:var(--space-5)`。
- 内部子元素之间的间距由 `gap` 自动处理，无需手动加 margin。

### Naive UI 组件映射

无（纯布局包裹）。内部通常放 `n-select`、`n-input` 等。

### 用法示例

```vue
<FilterBar>
  <n-select v-model:value="type" :options="typeOptions" placeholder="题型" clearable style="width: 160px" />
  <n-input v-model:value="keyword" placeholder="搜索" clearable style="width: 200px" />
  <n-button type="primary" @click="search">查询</n-button>
</FilterBar>
```

---

## 3. PageHeader（页面标题栏）

### 组件路径

`src/components/common/PageHeader.vue`

### 用途

各页面顶部的标题栏：左侧为返回按钮（可选）+ 标题 + 副标题，右侧为操作区插槽。返回按钮调用 `router.back()`。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | —（必填） | 页面主标题 |
| `subtitle` | `string` | `''` | 副标题；为空时不渲染 |
| `showBack` | `boolean` | `false` | 是否显示左上角返回按钮 |

### Emits / Slots

- Emits：无。
- Slots：`actions` —— 右侧操作按钮区。

### 关键实现要点

- `.page-header`：`display:flex; justify-content:space-between; align-items:center; gap:var(--space-4); margin-bottom:var(--space-6); flex-wrap:wrap`。
- 返回按钮用 `<n-button quaternary circle size="small">`，图标 `ArrowBackOutline`（来自 `@vicons/ionicons5`），点击 `router.back()`。
- 标题 `.ph-title`：`var(--text-2xl)`、`var(--font-bold)`、`var(--text-primary)`。
- 副标题 `.ph-subtitle`：`var(--text-sm)`、`var(--text-tertiary)`。

### Naive UI 组件映射

- 返回按钮：`<n-button quaternary circle size="small">` + `<n-icon><ArrowBackOutline /></n-icon>`。
- 操作区为普通插槽，通常放 `n-button`。

### 用法示例

```vue
<PageHeader title="题库详情" subtitle="共 120 道题目" :show-back="true">
  <template #actions>
    <n-button type="primary" @click="createQuestion">新建题目</n-button>
  </template>
</PageHeader>
```

---

## 4. ProviderBridge（Naive UI 反馈桥接）

### 组件路径

`src/components/common/ProviderBridge.vue`

### 用途

将 Naive UI 的 `useMessage` / `useDialog` / `useNotification` / `useLoadingBar` 实例挂载到 `window`，供组件上下文之外的模块（如 axios 拦截器 `api/request.ts`）调用全局反馈 API。

### Props / Emits / Slots

- Props：无。
- Emits：无。
- Slots：`default` —— 透传渲染（`<slot />`），本身不注入任何 DOM。

### 关键实现要点

- 必须在各 Naive UI Provider（`n-message-provider` / `n-dialog-provider` / `n-notification-provider` / `n-loading-bar-provider`）**内部**挂载，且只应挂载一次。
- 挂载内容：`window.$message`、`window.$dialog`、`window.$notification`、`window.$loadingBar`。
- 模板仅为 `<slot />`，无可见 UI；脚本在 `setup` 阶段同步执行挂载。

### Naive UI 组件映射

- 依赖 `useMessage`、`useDialog`、`useNotification`、`useLoadingBar`（均来自 `naive-ui`）。

### 用法示例

```vue
<!-- 在 App.vue 的 Provider 内部 -->
<n-message-provider>
  <n-dialog-provider>
    <n-notification-provider>
      <n-loading-bar-provider>
        <ProviderBridge />
        <RouterView />
      </n-loading-bar-provider>
    </n-notification-provider>
  </n-dialog-provider>
</n-message-provider>
```

---

## 5. QuestionNavGrid（答题导航网格）

### 组件路径

`src/components/common/QuestionNavGrid.vue`

### 用途

考试 / 练习页面侧边展示所有题目答题进度。每格显示题号，按状态着色；点击触发 `select` 事件跳题。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `QuestionNavStatus[]` | —（必填） | 每题状态数组，长度即题数 |
| `disabled` | `boolean` | `false` | 是否禁用点击（如交卷后） |

> `QuestionNavStatus` 类型定义于 `src/components/common/questionNav.ts`：
> `export type QuestionNavStatus = 'unanswered' | 'answered' | 'current' | 'review'`

### Emits / Slots

- Emits：`select: [index: number]` —— 点击某格时返回其下标（从 0 起）。
- Slots：无。

### 关键实现要点

- 单元格类名由 `cellClass(status)` 映射：
  - `current` → `is-current`
  - `answered` → `is-answered`
  - `review`（标记待复查）→ `is-review`
  - 默认 `unanswered` → `is-unanswered`

  > **与旧文档差异**：状态语义值为 `review`（非旧文档的 `marked`）；`current` / `answered` / `unanswered` 保留。
- 网格布局使用 `grid-template-columns: repeat(auto-fill, minmax(36px, 1fr))`（旧文档写死 5 列，代码为自适应列宽）。
- 单元格 `.q-nav-cell`：`aspect-ratio:1`、圆角 `var(--radius-md)`、字体 `var(--text-sm)`、`var(--font-semibold)`。
- 颜色令牌：
  - `is-unanswered`：背景 `var(--bg-card)`、边框 `var(--border-default)`、文字 `var(--text-tertiary)`，hover 边框 `var(--color-primary-300)`、文字 `var(--text-brand)`。
  - `is-answered`：背景 `var(--color-success-50)`、边框 `var(--color-success-500)`、文字 `var(--color-success-600)`。
  - `is-current`：背景 / 边框 `var(--color-primary-500)`、文字 `#fff`。
  - `is-review`：背景 / 边框 `var(--color-warning-500)`、文字 `#fff`。
- `disabled` 时 `:disabled` 生效，单元格 `cursor:not-allowed; opacity:0.6`。

### Naive UI 组件映射

无（纯自定义 `<button>` 网格）。

### 用法示例

```vue
<QuestionNavGrid
  :items="navStatusList"
  :disabled="submitted"
  @select="jumpTo"
/>
```

---

## 6. QuestionOption（答题选项）

### 组件路径

`src/components/common/QuestionOption.vue`

### 用途

客观题（单选 / 多选 / 判断）的单个选项。统一处理默认 / 选中 / 正确 / 错误 / 禁用态，选项内容经默认插槽渲染（通常配合 `RichText`）。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `marker` | `string` | —（必填） | 选项序号字母：`A` / `B` / `C` … |
| `selected` | `boolean` | `false` | 是否用户选中 |
| `correct` | `boolean \| null` | `null` | 揭晓答案后：是否为正确答案 |
| `wrong` | `boolean \| null` | `null` | 揭晓答案后：是否被用户选中但错误 |
| `disabled` | `boolean` | `false` | 是否禁用点击 |

### Emits / Slots

- Emits：`select: []` —— 点击选项时触发（仅在非 `disabled` 时）。
- Slots：`default` —— 选项内容（题干 / 选项文本）。

### 关键实现要点

- 容器类 `containerClass` 优先级：`correct === true` → `is-correct` > `wrong === true` → `is-wrong` > `selected` → `is-selected` > `disabled` → `is-disabled` > 否则 `is-idle`。
- 标记类 `markerClass`：`marker-correct` / `marker-wrong` / `marker-selected` / `marker-idle`。
- 状态色令牌：
  - `is-selected`：边框 `var(--color-primary-500)`、背景 `var(--bg-selected)`。
  - `is-correct`：边框 `var(--color-success-500)`、背景 `var(--color-success-50)`。
  - `is-wrong`：边框 `var(--color-error-500)`、背景 `var(--color-error-50)`。
  - `is-disabled`：`opacity:0.6; cursor:not-allowed`。
- `.q-option`：边框 `2px solid var(--border-default)`、圆角 `var(--radius-lg)`、内边距 `var(--space-4)`；`.q-option-marker` 为 28×28 圆形（`var(--radius-full)`），选中 / 正确 / 错误时填充对应语义色并白字。
- 选项内容 `.q-option-content`：`var(--text-base)`、行高 `var(--leading-normal)`。
- 点击逻辑：`@click="!disabled && emit('select')"`，正确 / 错误态下仍可点击（由父级决定是否忽略）。
- **代码未实现**：旧文档提到的对勾 / 叉号图标（`checkmark-outline` / `close-outline`）在代码中并未使用，标记区始终只显示 `marker` 字母，结果态仅靠背景 / 边框色区分。

### Naive UI 组件映射

无（纯自定义 div 选项）。

### 用法示例

```vue
<div v-for="(opt, i) in options" :key="i">
  <QuestionOption
    :marker="String.fromCharCode(65 + i)"
    :selected="isSelected(i)"
    :correct="revealed ? isCorrect(i) : null"
    :wrong="revealed ? (isSelected(i) && !isCorrect(i)) : null"
    :disabled="revealed"
    @select="choose(i)"
  >
    <RichText :content="opt" />
  </QuestionOption>
</div>
```

---

## 7. QuestionPreviewDrawer（题目预览抽屉）

### 组件路径

`src/components/common/QuestionPreviewDrawer.vue`

### 用途

在抽屉（`n-drawer`）中预览题目详情。支持传入最小字段（列表项 / 组卷回填项），缺答案等字段时自动拉取题目详情补全。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | —（必填） | 抽屉显隐，支持 `v-model:show` |
| `question` | `PreviewQuestion \| null` | —（必填） | 待预览题目 |

> `PreviewQuestion` 接口（`QuestionPreviewDrawer.vue` 内导出）：
> ```ts
> export interface PreviewQuestion {
>   id: number
>   type?: string | null
>   difficulty?: string | null
>   content?: string | null
>   options?: unknown
>   answer?: string | null
>   referenceAnswer?: string | null
>   analysis?: string | null
>   bankName?: string | null
> }
> ```

### Emits / Slots

- Emits：`update:show: [value: boolean]` —— 配合 `v-model:show`。
- Slots：无（内部复用 `RichText`）。

### 关键实现要点

- 抽屉宽度固定 `520px`，标题为 `题目预览 #${id}`（`detail` 为空时显示「题目预览」）。
- 标签行用 `n-tag round size="small"`，题型 / 难度映射见 `TYPE_TAG` / `DIFFICULTY_TAG`（`SINGLE→info`、`MULTIPLE→warning`、`TRUE_FALSE→success`、`FILL_BLANK→default`、`SHORT_ANSWER→primary`；难度 `EASY→success`、`MEDIUM→warning`、`HARD→error`）。
- 选项区仅当 `type` 为 `SINGLE` / `MULTIPLE` 渲染；`options` 支持字符串（JSON）或数组，正确项以 `border-success-500 bg-success-50` 高亮（`isCorrectOption` 按 `A/B/C` 字母比对 `answer`）。
- 正确答案区：判断题显示「正确 / 错误」`n-tag`；其余渲染 `answer` 文本。
- 内部标签 / 难度中文取自 `utils/constants` 的 `QUESTION_TYPE_MAP` / `DIFFICULTY_MAP`。
- 自动补全：`watch(props.question)`，当 `question.answer == null` 时调用 `getQuestionDetail(id)` 拉全字段；失败则按已有字段展示（权限变化场景）。
- 整体用 `<n-spin :show="fetching">` 包裹加载态。

### Naive UI 组件映射

- 容器：`n-drawer`（`width=520`）+ `n-drawer-content`（`title`、`closable`）。
- 加载：`n-spin`；标签：`n-tag`；富文本：`RichText`（见第 8 节）。

### 用法示例

```vue
<QuestionPreviewDrawer v-model:show="previewShow" :question="currentQuestion" />
```

---

## 8. RichText（富文本安全渲染）

### 组件路径

`src/components/common/RichText.vue`

### 用途

统一的富文本 / Markdown 渲染出口。所有 `v-html` 都应改用它：内容经 DOMPurify 净化防 XSS，数学公式经 KaTeX 自动渲染（`$...$` / `$$...$$` 等）。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string \| null` | `''` | 原始 HTML / Markdown 富文本 |

### Emits / Slots

- Emits：无。
- Slots：无（通过 `v-html` 渲染 `sanitized`）。

### 关键实现要点

- 纯文本兜底：若 `content` 不含 HTML 标签，则包 `<p>` 并转义 `&` / `<` / `>`、把 `\n` 转 `<br>`（避免 DOMPurify 丢弃裸文本前导文本的问题）。
- 净化：`DOMPurify.sanitize(normalized, { USE_PROFILES: { html: true }, ADD_ATTR: ['target'] })`。
- 公式：`renderMathInElement`（KaTeX `auto-render`），`throwOnError:false`，分隔符含 `$$`、`$`、`\(`、`\[`；失败仅降级为原文。
- 渲染监听：`watch(sanitized)` 与 `watch(root)` 后 `nextTick(renderMath)`。
- 容器类 `.markdown-body`（样式由 KaTeX / 全局 markdown 样式提供，本组件无 scoped 样式）。

### Naive UI 组件映射

无（纯 DOMPurify + KaTeX）。

### 用法示例

```vue
<RichText :content="question.content" />
```

---

## 9. SkeletonList（骨架列表）

### 组件路径

`src/components/common/SkeletonList.vue`

### 用途

列表 / 卡片加载占位。按 `count` 渲染若干骨架卡片，按 `cols` 控制网格列数。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `count` | `number` | `3` | 骨架卡片数量 |
| `cols` | `number` | `3` | 网格列数（`1`/`2`/`3` 三档） |

> 关键实现要点：`count` / `cols` 即旧需求提到的两个核心参数。

### Emits / Slots

- Emits：无。
- Slots：无。

### 关键实现要点

- 容器 `.skeleton-list`：`display:grid; gap:var(--space-4)`；列数类 `grid-cols-1/2/3` 仅支持这 3 档，分别 `repeat(1/2/3, 1fr)`。
- 响应式：`max-width:768px` 时 `grid-cols-2` 与 `grid-cols-3` 自动降为单列。
- 单卡 `.sk-item`：背景 `var(--bg-card)`、边框 `var(--border-default)`、圆角 `var(--radius-lg)`、内边距 `var(--space-5)`。
- 骨架条用 `<n-skeleton text>`：头部 1 条（`.sk-line-head`，下间距 `var(--space-4)`），正文 3 条，末条 `width:40%`。

### Naive UI 组件映射

- 骨架条：`<n-skeleton text :repeat="n">`。

### 用法示例

```vue
<!-- 卡片网格场景 -->
<SkeletonList :count="6" :cols="3" />

<!-- 列表（单列）场景 -->
<SkeletonList :count="5" :cols="1" />
```

---

## 10. StatCard（统计卡片）

### 组件路径

`src/components/common/StatCard.vue`

### 用途

展示关键数字指标（题目总数、正确率、练习次数等）。标签 + 数值 + 可选后缀，数值颜色按 `tone` 取语义色。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | —（必填） | 统计标签 |
| `value` | `string \| number` | `undefined` | 统计数值；缺省时由默认插槽渲染 |
| `tone` | `'default' \| 'brand' \| 'success' \| 'error' \| 'warning'` | `'default'` | 数值颜色主题 |

### Emits / Slots

- Emits：无。
- Slots：
  - `default` —— 覆盖 `value` 的自定义内容。
  - `suffix` —— 数值下方的后缀单位 / 说明。

### 关键实现要点

- 数值颜色 `TONE_COLORS`：
  - `default` → `var(--text-primary)`
  - `brand` → `var(--text-brand)`
  - `success` → `var(--color-success-600)`
  - `error` → `var(--color-error-600)`
  - `warning` → `var(--color-warning-600)`
- `.stat-card`：背景 `var(--bg-card)`、边框 `var(--border-default)`、圆角 `var(--radius-lg)`、内边距 `var(--space-5)`。
- `.stat-label`：`var(--text-xs)`、`var(--font-medium)`、`var(--text-tertiary)`、`text-transform:uppercase`、`letter-spacing:0.05em`。
- `.stat-value`：`var(--text-3xl)`、`var(--font-bold)`、行高 `1.2`。
- `.stat-suffix`：`var(--text-sm)`、`var(--text-tertiary)`，上间距 `var(--space-1)`。

### Naive UI 组件映射

无（纯自定义卡片 + CSS 变量）。

### 用法示例

```vue
<div class="grid grid-cols-4 gap-4">
  <StatCard label="题目总数" :value="1248" tone="brand" />
  <StatCard label="正确率" :value="85.2" tone="success">
    <template #suffix>%</template>
  </StatCard>
  <StatCard label="本周练习" :value="32" tone="warning" />
</div>
```

---

## 11. TagManageModal（标签管理弹窗）

### 组件路径

`src/components/common/TagManageModal.vue`

### 用途

管理标签：搜索、新建（管理员）、改分组、删除（管理员、未被引用）。弹窗内直接调用标签相关 API。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | —（必填） | 弹窗显隐，支持 `v-model:show` |

### Emits

- `update:show: [v: boolean]`
- `updated: []` —— 标签变更（增 / 改组 / 删）后触发，供父级刷新列表

> Emits 定义同时以类型签名 `(e: 'update:show', v: boolean): void` 与 `(e: 'updated'): void` 给出。

### 关键实现要点

- 容器 `<n-modal preset="card" title="标签管理" style="width:560px">`，`@update:show` 转交 `emit('update:show')`。
- 非管理员（`authStore.isAdmin === false`）仅能查看分组，无新建 / 改组 / 删除入口。
- 搜索：`keyword` 对 `name` 与 `groupName` 做不区分大小写包含过滤。
- 新建：管理员可填「新标签名」+「分组（可选）」，回车或点「添加」调用 `create`。
- 改组：点分组标签或「改组」进入编辑态，调用 `updateTagGroup`；清空保存即取消分组。
- 删除：调用 `useConfirm().confirmDanger` 二次确认；已使用（`usageCount > 0`）的标签禁用删除。
- 数据：`getTagList` 拉取，打开时（`watch(show)`）重载。
- 列表项展示 `name`、`usageCount` 与 `groupName`（已分组显示 `info` 色 `n-tag`，未分组显示「未分组」`default` 色）。

### Naive UI 组件映射

- 弹窗：`n-modal preset="card"`。
- 表单：`n-input`（搜索 / 新建 / 分组编辑）、`n-button`、`n-tag`、`n-empty`（代码未直接使用，列表为空用纯文本「暂无标签 / 无匹配标签」）。
- 校验 / 反馈：`useMessage` + `useConfirm`（见第 19 节）。

### 用法示例

```vue
<TagManageModal v-model:show="tagModalShow" @updated="reloadTags" />
```

---

## 12. UserSearchSelect（用户远程搜索选择器）

### 组件路径

`src/components/common/UserSearchSelect.vue`

### 用途

按 `username` / `nickname` 模糊远程搜索用户（如指定批改人）。输入即搜，选项展示「昵称 (username)」。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `number \| null` | —（必填） | 选中用户 id，支持 `v-model` |
| `placeholder` | `string` | — | 占位文字 |

### Emits

- `update:modelValue: [value: number | null]`

### 关键实现要点

- 内部基于 `<n-select>`：`filterable` `clearable` `remote` `@search` `@update:value` `@clear`。
- 远程搜索：`searchUsers(keyword, 20)`，`300ms` 防抖（`handleSearch` → `doSearch`）；失败时静默保留已有选项。
- 选项格式：`{ label: '${nickname} (${username})', value: id }`（无 nickname 时仅 username）。
- 预置：`defineExpose({ preset, currentLabel })`。
  - `preset(id, label)`：编辑场景下直接注入已选项，无需再搜索。
  - `currentLabel`（computed）：当前选中项的展示名，供父级确认页直接展示。

### Naive UI 组件映射

- `<n-select>`（`remote` + `filterable` + `clearable`）。

### 用法示例

```vue
<UserSearchSelect v-model="graderId" placeholder="选择批改人" />

<!-- 编辑场景预置 -->
<userSearchSelect ref="selector" v-model="graderId" />
<!-- setup: selector.value.preset(row.graderId, row.graderName) -->
```

---

## 13. FileUpload（文件上传）

### 组件路径

`src/components/FileUpload.vue`

### 用途

单文件上传，上传完成后把服务端返回的文件 URL 写入 `v-model`。支持图片预览与上传进度条。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | —（必填） | 已上传文件 URL，支持 `v-model` |
| `accept` | `string` | — | 限制的文件类型（传给 `n-upload` 的 `accept`） |

### Emits

- `update:modelValue: [value: string]`

### 关键实现要点

- 上传端点：`/api/v1/files/upload`（`action`），`headers` 带 `Authorization: Bearer ${authStore.token}`，`max=1`，默认不显示文件列表（`showFileList=false`）。
- 图标按钮：`CloudUploadOutline`（来自 `@vicons/ionicons5`）。
- 完成 `handleFinish`：解析响应取 `response.data.url` → `emit('update:modelValue', url)`，否则提示失败。
- 图片预览：`modelValue` 匹配图片扩展名时显示 `<img max-w-[200px] max-h-[200px]>`。
- 进度：`handleProgress` 置 `uploading=true` 并更新 `uploadProgress`，`<n-progress type="line" :height="4">` 展示。
- 失败 `handleError` / `handleFinish` 异常：提示「上传失败」并重置状态。

### Naive UI 组件映射

- `<n-upload>`（`action` / `headers` / `data` / `max` / `accept` / `show-file-list` + `@finish` / `@error` / `@progress`）。
- `<n-button>` + `<n-icon>`；进度：`<n-progress>`。

### 用法示例

```vue
<FileUpload v-model="avatarUrl" accept="image/*" />
```

---

## 14. LoadError（加载失败）

### 组件路径

`src/components/LoadError.vue`

### 用途

数据加载失败时占位：错误结果卡片 + 重试 / 返回按钮。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `description` | `string` | `''` | 失败描述；为空时回退 `n-result` 默认「请稍后重试」 |
| `retrying` | `boolean` | `false` | 重试按钮 loading 态 |

### Emits

- `retry: []`

### 关键实现要点

- 容器 `<n-card>` 内放 `<n-result status="error" title="加载失败" :description="...">`。
- 底部 `<template #footer>`：左侧「重试」`<n-button :loading="retrying" @click="$emit('retry')">`，右侧「返回上一页」`<n-button quaternary @click="router.back()">`。
- `router` 来自 `vue-router` 的 `useRouter()`。

### Naive UI 组件映射

- `<n-card>` + `<n-result status="error">`；按钮 `<n-button>`。

### 用法示例

```vue
<LoadError :description="errorMsg" :retrying="loading" @retry="reload" />
```

---

## 15. MarkdownEditor（Markdown 编辑器）

### 组件路径

`src/components/MarkdownEditor.vue`

### 用途

基于 `@kangc/v-md-editor`（VMdEditor）的 Markdown 编辑 / 预览组件。支持图片上传、KaTeX 公式、行号；答题场景可限制图片数与禁用部分工具栏。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | —（必填） | 编辑器内容，支持 `v-model` |
| `height` | `string` | `'400px'` | 编辑器高度 |
| `mode` | `'edit' \| 'editable' \| 'preview'` | 不传（`undefined`） | 形态：不传=编辑+预览双栏；`'edit'`=单栏编辑+工具栏（答题卡用）；`'preview'`=仅预览 |
| `placeholder` | `string` | `''` | 占位文字 |
| `disabledMenus` | `string[]` | `() => []` | 禁用的工具栏菜单（如答题模式禁用标题 / 表格） |
| `maxImages` | `number` | — | 图片张数上限（答题场景限制 9 张），不传则不限 |

### Emits

- `update:modelValue: [value: string]`

### 关键实现要点

- 插件：注册 `vuepressTheme`、KaTeX 插件、行号插件（模块加载阶段 `VMdEditor.use(...)`）。
- 外层 `.markdown-editor` 显式 `w-full`（否则在 `n-form-item-blank` flex 容器内会收缩到内容固有宽度）。
- 图片上传 `@upload-image`：构造 `FormData`，`fetch('/api/v1/files/upload')`，`headers.Authorization` 取自 `localStorage[TOKEN_KEY]`；成功后 `insertImage(url, '图片')`。
- 张数限制：`imageCount`（计算 `![...](...)` 与 `<img>` 数量）达 `maxImages` 时 `message.warning` 拦截。
- `@change` 直接透传最新文本给 `update:modelValue`。

### Naive UI 组件映射

无（第三方 `v-md-editor`）；反馈用 `useMessage`。

### 用法示例

```vue
<!-- 题目创建 / 编辑：双栏 -->
<MarkdownEditor v-model="content" />

<!-- 答题卡：单栏、限制 9 图、禁用部分菜单 -->
<MarkdownEditor
  v-model="answer"
  mode="edit"
  :max-images="9"
  :disabled-menus="['h1', 'h2', 'table']"
/>
```

---

## 16. BankImportDialog（导入题库弹窗）

### 组件路径

`src/components/importExport/BankImportDialog.vue`

### 用途

导入本系统导出的题库 JSON 文件，在其名下创建私有题库。两步流程：选文件预览 → 结果面板。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | —（必填） | 弹窗显隐，支持 `v-model:show` |

### Emits

- `update:show: [value: boolean]`
- `imported: []` —— 导入成功后触发

### 关键实现要点

- `<n-modal preset="card" style="width:540px; max-width:94vw" title="导入题库">`。
- 图标：`CloudUploadOutline`（上传区）、`DocumentTextOutline`（文件预览），均来自 `@vicons/ionicons5`。
- 步骤 `step: 'pick' | 'result'`。
  - `pick`：隐藏 `<input type="file" accept=".json,application/json">`，点击虚线区触发选择；`parseImportFile` 解析，若 `format !== 'quick-study-bank'` 提示「请使用『导入题目』功能」。
  - 预览展示 `bankName` / `questionCount` / `tagCount` / `bankDescription`。
  - `result`：渲染 `<ImportResultPanel :result="importResult" @done="close">`。
- 导入：`importBank(file)` → 写 `importResult` 切到 `result` 并 `emit('imported')`。
- 打开时（`watch(show)`）重置步骤、文件、解析结果与 `fileInput.value`。

### Naive UI 组件映射

- `<n-modal preset="card">`、`<n-icon>`、`<n-button>`、`<ImportResultPanel>`（第 17 节）。

### 用法示例

```vue
<BankImportDialog v-model:show="importBankShow" @imported="reloadBanks" />
```

---

## 17. ImportResultPanel（导入结果面板）

### 组件路径

`src/components/importExport/ImportResultPanel.vue`

### 用途

展示一次导入的结果汇总：成功 / 重复跳过 / 失败计数，及失败、跳过明细列表。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `result` | `ImportResult \| null` | —（必填） | 导入结果对象 |

> `ImportResult` 来自 `@/types`，含 `successCount` / `skipCount` / `failCount` / `bankName` / `errors[]`（`index` + `message`）/ `skipped[]`（`index` + `content` + `reason`）。

### Emits

- `done: []` —— 点「完成」关闭上层弹窗

### 关键实现要点

- 顶部三栏统计：`successCount`（绿）、`skipCount`（黄）、`failCount`（红），配 `bg-*-50` / `border-*-200` 背景令牌。
- 全部成功且无跳过时显示 `<n-empty description="全部题目导入成功" size="small">`。
- 失败明细：序号 `#index+1` + `err.message`（红色）。
- 跳过明细：序号 + `skip.content`（两行截断）+ `skip.reason`（黄）。
- 底部「完成」`<n-button type="primary" @click="emit('done')">`。
- 无任何 `result` 时不渲染（模板 `v-if="result"`）。

### Naive UI 组件映射

- 统计区为纯 div + Tailwind 类；`<n-empty>`；`<n-button>`。

### 用法示例

```vue
<ImportResultPanel :result="importResult" @done="close" />
```

---

## 18. QuestionImportDialog（导入题目弹窗）

### 组件路径

`src/components/importExport/QuestionImportDialog.vue`

### 用途

向指定题库导入题目 JSON（支持题目导出文件或题库导出文件中的题目）。两步流程同题库导入。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | —（必填） | 弹窗显隐，支持 `v-model:show` |
| `bankId` | `number \| string` | — | 指定目标题库（题库详情页场景）；为空则显示题库选择器 |
| `bankName` | `string` | — | 目标题库名称（展示用） |

### Emits

- `update:show: [value: boolean]`
- `imported: []`

### 关键实现要点

- `<n-modal preset="card" style="width:560px; max-width:94vw" title="导入题目">`。
- 图标同题库导入：`CloudUploadOutline`、`DocumentTextOutline`。
- 目标题库：若 `presetBankId`（即 `bankId` 非空且非 `''`）则只读展示 `bankName || bankId`；否则 `<n-select>` 拉 `getBankList` 筛选「我的题库」（管理员可见全部），空时 `<n-empty title="暂无可导入的题库">`。
- 文件解析：`parseImportFile`，预览展示 `questionCount` / `tagCount`；「题库导出」文件提示「将导入其中的全部题目」，并说明题干重复者跳过。
- 导入：`importQuestions(targetId, file)` → 结果写入 `ImportResultPanel`。
- 打开时重置并（非预设时）`fetchBankOptions()`；`onMounted` 同样在非预设且 `show` 时拉取。

### Naive UI 组件映射

- `<n-modal preset="card">`、`<n-select>`、`<n-empty>`、`<n-icon>`、`<n-button>`、`<ImportResultPanel>`。

### 用法示例

```vue
<!-- 通用入口 -->
<QuestionImportDialog v-model:show="importShow" @imported="reload" />

<!-- 题库详情页指定目标 -->
<QuestionImportDialog v-model:show="importShow" :bank-id="bank.id" :bank-name="bank.name" @imported="reload" />
```

---

## 19. useConfirm（确认弹窗组合式函数）

### 组件路径

`src/composables/useConfirm.ts`

### 用途

统一封装基于 Naive UI Dialog 的确认弹窗，注入设计系统视觉（品牌色主按钮、圆角 16px）。

### 类型

```ts
export type ConfirmActionOptions = Partial<
  Pick<DialogOptions, 'title' | 'content' | 'positiveText' | 'negativeText' | 'onPositiveClick'>
>
```

### 返回值

| 方法 | 签名 | 说明 |
|------|------|------|
| `confirm` | `(opts: ConfirmActionOptions) => void` | 普通确认，`dialog.warning`，主按钮品牌色，默认 `title='确认操作'`、`positiveText='确认'`、`negativeText='取消'` |
| `confirmDanger` | `(opts: ConfirmActionOptions) => void` | 危险确认，`dialog.error`，`positiveButtonProps:{type:'error'}`，默认 `title='确认删除'`、`positiveText='删除'` |

> 两者均注入 `style: 'border-radius: 16px;'`。依赖 `App.vue` 中的 `<n-dialog-provider>`。

### 用法示例

```ts
const { confirm, confirmDanger } = useConfirm()

confirm({
  title: '发布试卷',
  content: '发布后学生可开始考试',
  positiveText: '发布',
  onPositiveClick: () => publish()
})

confirmDanger({
  title: '确认删除',
  content: `确认删除标签「${tag.name}」？`,
  onPositiveClick: async () => { await deleteTag(tag.id) }
})
```

---

## 20. usePagination（分页列表组合式函数）

### 组件路径

`src/composables/usePagination.ts`

### 用途

分页列表通用逻辑：维护页码 / 页大小 / 总数 / 加载态 / 数据，对外提供 `n-pagination` 可直接绑定的 `pagination` 对象。

### 签名

```ts
function usePagination<T>(
  fetcher: (params: { page: number; pageSize: number }) => Promise<PageResult<T>>
): UsePaginationReturn<T>
```

### 返回值

| 字段 | 类型 | 默认值 / 说明 |
|------|------|--------------|
| `page` | `Ref<number>` | 当前页码，默认 `1` |
| `pageSize` | `Ref<number>` | 每页条数，默认 `10` |
| `itemCount` | `Ref<number>` | 总记录数 |
| `loading` | `Ref<boolean>` | 加载中 |
| `data` | `Ref<T[]>` | 数据列表 |
| `fetchList` | `(reset?: boolean) => Promise<void>` | 拉取；`reset=true` 时页码回到 1 |
| `pagination` | `Ref<{ page: number; pageSize: number; itemCount: number }>` | 供 `n-pagination` 绑定 |

> `PageResult<T>` 来自 `@/types`，含 `records: T[]` 与 `total: number`。

### 关键实现要点

- `fetchList`：`loading=true` 后调用 `fetcher`，结果写 `data.value=result.records`、`itemCount.value=result.total`，`finally` 复位 `loading`。
- 服务端分页：配合 `n-pagination` 的 `v-model:page` / `@update:page` 调用 `fetchList`。

### 用法示例

```ts
const { page, pageSize, itemCount, loading, data, fetchList, pagination } = usePagination(
  async (p) => {
    const res = await getQuestionList({ page: p.page, size: p.pageSize })
    return res.data
  }
)

onMounted(() => fetchList())
```

```vue
<n-data-table
  :columns="columns"
  :data="data"
  :loading="loading"
  :pagination="pagination"
  remote
/>
```

---

## 21. useBankOptions（题库下拉选项组合式函数）

### 组件路径

`src/composables/useBankOptions.ts`

### 用途

获取当前用户可用的题库下拉选项（`{ label: name, value: id }`）。

### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `bankOptions` | `Ref<SelectOption[]>` | 题库选项 |
| `loading` | `Ref<boolean>` | 加载中 |
| `loadBankOptions` | `() => Promise<void>` | 手动重载 |

### 关键实现要点

- `onMounted` 自动调用 `loadBankOptions()`。
- 拉取 `getBankList({ page: 1, size: 200 })`，映射为 `SelectOption[]`。
- 「全部 / 不限」选项是否插入由调用方决定（本 composable 不插入）。

### 用法示例

```ts
const { bankOptions, loading, loadBankOptions } = useBankOptions()
// <n-select :options="bankOptions" :loading="loading" />
```

---

## 22. utils/format（格式化工具）

### 组件路径

`src/utils/format.ts`

### 用途

通用展示格式化（依赖 `dayjs`）。

### 导出函数

| 函数 | 签名 | 说明 |
|------|------|------|
| `formatDate` | `(date, format='YYYY-MM-DD') => string` | 日期格式化；空值返回 `'-'` |
| `formatDateTime` | `(date) => string` | 等价于 `formatDate(date, 'YYYY-MM-DD HH:mm:ss')` |
| `formatDuration` | `(minutes: number \| null \| undefined) => string` | 时长：`<60` 输出「N分钟」，否则「N小时M分钟」；空值 `'-'` |
| `formatScore` | `(score: number \| null \| undefined) => string` | 分数：`score.toFixed(1)`；空值 `'-'` |
| `truncateText` | `(text, maxLength=50) => string` | 超长截断加 `...`；空值 `'-'` |

### 用法示例

```ts
import { formatDateTime, formatDuration, truncateText } from '@/utils/format'

formatDateTime(record.createdAt) // '2026-09-07 10:30:00'
formatDuration(95)              // '1小时35分钟'
truncateText(longText, 20)
```

---

## 23. utils/tagOptions（标签分组选项工具）

### 组件路径

`src/utils/tagOptions.ts`

### 用途

将标签列表转为 Naive UI 分组 `SelectOption[]`，用于标签筛选 / 选择器。

### 导出函数

| 函数 | 签名 | 说明 |
|------|------|------|
| `buildGroupedTagOptions` | `(tags: Tag[]) => SelectOption[]` | 有分组标签按 `groupName` 分区，未分组归入「未分组」分区放最后；`value` 仍为标签 id，筛选语义不变 |

### 关键实现要点

- 分组 key 形如 `tag-group-${label}`、未分组 `tag-group-ungrouped`。
- 仅做导航辅助层级，不改变多选筛选的 `value` 语义。

### 用法示例

```ts
import { buildGroupedTagOptions } from '@/utils/tagOptions'

const options = buildGroupedTagOptions(tagList)
// <n-select multiple :options="options" />
```

---

## 24. utils/practiceTitle（练习会话标题工具）

### 组件路径

`src/utils/practiceTitle.ts`

### 用途

按「题库 · 标签 · 题量 · 随机练习」组合生成练习会话标题。

### 类型

```ts
export interface PracticeTitleInput {
  bankNames?: string[] | null
  tagNames?: string[] | null
  totalCount?: number | null
}
```

### 导出函数

| 函数 | 签名 | 说明 |
|------|------|------|
| `buildPracticeSessionTitle` | `(input: PracticeTitleInput) => string` | 组合规则见下 |
| `buildPracticeSessionTitleFromSummary` | `(summary: Pick<PracticeSessionSummary,'bankNames'\|'tagNames'\|'totalCount'>) => string` | 便捷重载，直接吃会话列表行 |

### 组合规则

- 题库：取首名，多个时追加「等N个题库」。
- 标签：取首名，多个时追加「等N个标签」。
- 题量：`totalCount > 0` 时输出「N题」。
- 各段用「 · 」连接，末尾固定追加「随机练习」；前置全空时标题即「随机练习」。

### 用法示例

```ts
buildPracticeSessionTitle({ bankNames: ['高数'], tagNames: ['极限'], totalCount: 20 })
// '高数 · 极限 · 20题 · 随机练习'
```

---

## 25. utils/constants（枚举字典）

### 组件路径

`src/utils/constants.ts`

### 用途

全站唯一枚举字典（题型 / 难度 / 状态 label 与 Tag 语义色），取值与后端大写枚举一致，禁止页面内另写本地字典。

### 导出内容

| 导出 | 类型 / 结构 | 说明 |
|------|------------|------|
| `QUESTION_TYPE_OPTIONS` | `{ label; value: QuestionType }[]` | 题型下拉：`SINGLE` 单选 / `MULTIPLE` 多选 / `TRUE_FALSE` 判断 / `FILL_BLANK` 填空 / `SHORT_ANSWER` 简答 |
| `QUESTION_TYPE_MAP` | `Record<QuestionType, string>` | 题型中文映射 |
| `DIFFICULTY_OPTIONS` | `{ label; value: Difficulty }[]` | 难度下拉：`EASY` 简单 / `MEDIUM` 中等 / `HARD` 困难 |
| `DIFFICULTY_MAP` | `Record<Difficulty, string>` | 难度中文映射 |
| `QUESTION_STATUS_OPTIONS` | `{ label; value: string }[]` | 题目状态：`DRAFT` 草稿 / `PENDING_REVIEW` 待审核 / `PUBLISHED` 已发布 |
| `SESSION_STATUS_MAP` | `Record<SessionStatus, {label; type}>` | 练习会话状态：`IN_PROGRESS` 进行中(info) / `PENDING_REVIEW` 待批改(warning) / `COMPLETED` 已完成(success) / `ABANDONED` 已放弃(default) |
| `PAPER_STATUS_MAP` | `Record<PaperStatus, {label; type}>` | 试卷状态：`DRAFT` 草稿(default) / `PUBLISHED` 已发布(success) / `CLOSED` 已关闭(error) |
| `TOKEN_KEY` | `'quick-study-token'` | 登录 token 的 localStorage key |
| `REFRESH_TOKEN_KEY` | `'quick-study-refresh-token'` | 刷新 token key |
| `USER_INFO_KEY` | `'quick-study-user-info'` | 用户信息 key |

> `Tag` 语义色（题型 / 难度）在前端另有映射处：如 `QuestionPreviewDrawer` 的 `TYPE_TAG` / `DIFFICULTY_TAG`（见第 7 节），与 `constants` 的 label 映射互补，颜色字典以各组件内实现为准。

### 用法示例

```ts
import { QUESTION_TYPE_MAP, DIFFICULTY_MAP, SESSION_STATUS_MAP } from '@/utils/constants'

QUESTION_TYPE_MAP['SINGLE']   // '单选题'
DIFFICULTY_MAP['HARD']        // '困难'
SESSION_STATUS_MAP['COMPLETED'].label // '已完成'
```

---

## 附录 A：已用设计令牌核对

下列 CSS 变量被上述组件直接引用，均可在 `design/tokens/design-tokens.css` 中找到（未改动 tokens 文件）：

| 变量 | 用途 |
|------|------|
| `--space-1` / `--space-2` / `--space-3` / `--space-4` / `--space-5` / `--space-6` / `--space-12` | 间距 |
| `--color-neutral-300` | 空状态图标灰 |
| `--text-primary` / `--text-secondary` / `--text-tertiary` / `--text-brand` / `--text-xs` / `--text-sm` / `--text-base` / `--text-2xl` / `--text-3xl` | 文字色与字号 |
| `--font-medium` / `--font-semibold` / `--font-bold` / `--leading-normal` | 字重 / 行高 |
| `--radius-md` / `--radius-lg` / `--radius-full` | 圆角 |
| `--border-default` / `--border-strong` | 边框 |
| `--bg-card` / `--bg-selected` | 背景 |
| `--color-primary-300` / `--color-primary-500` / `--color-success-50` / `--color-success-500` / `--color-success-600` / `--color-error-50` / `--color-error-500` / `--color-warning-500` | 语义色 |
| `--transition-base` | 过渡 |

## 附录 B：组件清单（代码事实源）

- **common/（12）**：EmptyState、FilterBar、PageHeader、ProviderBridge、QuestionNavGrid、QuestionOption、QuestionPreviewDrawer、RichText、SkeletonList、StatCard、TagManageModal、UserSearchSelect
- **根级（3）**：FileUpload、LoadError、MarkdownEditor
- **importExport/（3）**：BankImportDialog、ImportResultPanel、QuestionImportDialog
- **composables/（3）**：useConfirm、usePagination、useBankOptions
- **utils/（4，UI 相关）**：format、tagOptions、practiceTitle、constants

> 旧文档中描述的原子组件（Button / Card / Tag / Input / Data Table / Pagination / Avatar / Badge / Sidebar / Header / Modal / Progress / Alert 等）均**未在 `src` 中封装为 SFC**，其 CSS 类规范见 `design/mockups/styles/mockup.css`，不在本文以组件章节形式收录。
