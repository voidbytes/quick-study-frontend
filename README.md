# Quick Study Frontend

基于 Vue 3 + TypeScript + Vite 的在线刷题系统前端。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **类型系统**: TypeScript 5
- **UI 组件库**: Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **样式**: Tailwind CSS
- **测试**: Vitest + Vue Test Utils
- **编辑器**: @kangc/v-md-editor (Markdown)
- **图表**: ECharts + vue-echarts
- **数学公式**: KaTeX

## 快速开始（本地开发）

```bash
npm install
npm run dev
```

开发环境 API 走 Vite 代理（`/api/v1` → `http://localhost:8080`，见 `vite.config.ts`），浏览器内同源无跨域；后端地址可用环境变量覆盖：

```bash
VITE_PROXY_TARGET=http://192.168.1.10:8080 npm run dev
```

## 构建部署（纯静态托管）

适用于 GitHub Pages / Cloudflare Pages 等无反向代理的纯静态托管：API 地址在**构建时**通过 `VITE_API_BASE_URL` 注入绝对地址，前端运行时不再感知后端域名。

```bash
# 示例（占位域名）：前端部署到 your-app.example.com，后端在 api.example.com
VITE_API_BASE_URL=https://api.example.com/api/v1 npm run build
```

- 产物输出到 `dist/`，整个目录上传到静态托管即可；`VITE_API_BASE_URL` 结尾不要带 `/`。
- 未设置 `VITE_API_BASE_URL` 时默认 `/api/v1`（仅适用于同域反向代理场景，如 Nginx 反代 `/api` 到后端）。
- **部署前提**：后端 CORS 需允许前端站点来源（本项目后端已全局放行，见后端 `WebMvcConfig`）。
- **路由**：项目使用 history 模式（`createWebHistory`），静态托管必须配置 SPA fallback——所有路径回退到 `index.html`：
  - Cloudflare Pages / Netlify：根目录放 `_redirects` 文件，内容 `/* /index.html 200`（需在 `public/` 下）；
  - Nginx：`location / { try_files $uri $uri/ /index.html; }`；
  - Caddy：`try_files {path} /index.html`。

## 测试

```bash
npm test                # 单元测试（Vitest，覆盖 API 拦截器、组件、页面）
npm run test:watch      # 监听模式
npm run test:coverage   # 覆盖率报告
```

## 环境变量

| 变量 | 作用 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 生产 API 绝对地址（构建时注入） | `/api/v1` |
| `VITE_PROXY_TARGET` | dev 代理目标后端 | `http://localhost:8080` |

---

## 目录结构

```
src/
├── api/              # API 请求层
├── components/       # 公共组件
├── composables/      # 组合式函数
├── layout/           # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── test-utils/       # 测试工具
├── theme/            # Naive UI 主题定制
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
```

---

## src/api — API 请求层

封装所有后端接口调用，统一使用 axios 实例。

| 文件 | 说明 |
|------|------|
| `request.ts` | axios 实例封装，含请求/响应拦截器、Token 注入、错误处理 |
| `auth.ts` | 登录、注册、登出、获取当前用户信息 |
| `user.ts` | 用户管理（CRUD、角色权限） |
| `bank.ts` | 题库管理（增删改查、协作者） |
| `question.ts` | 题目管理（增删改查、批量操作） |
| `tag.ts` | 标签管理 |
| `paper.ts` | 试卷管理（创建、编辑、发布、关闭） |
| `exam.ts` | 考试会话（开始答题、提交、查成绩） |
| `grading.ts` | 主观题批改（列表、详情、提交评分） |
| `practice.ts` | 练习会话（开始练习、提交答案、查询进度） |
| `record.ts` | 做题记录（列表、统计） |
| `wrongQuestion.ts` | 错题本（列表、快照） |
| `favorite.ts` | 收藏夹（增删、列表、统计） |
| `search.ts` | 全局搜索（题目/题库） |
| `statistics.ts` | 数据统计（概览、准确率、试卷统计） |
| `judge.ts` | 在线判题（代码题自动评测） |
| `review.ts` | 题目审核（审核列表、通过/驳回） |
| `notification.ts` | 消息通知（列表、已读、未读数） |
| `file.ts` | 文件上传（图片、附件） |
| `importExport.ts` | 导入导出（题库/题目 JSON 格式） |
| `admin.ts` | 管理员接口（用户管理、审核管理） |

---

## src/components — 公共组件

### src/components/common — 通用业务组件

| 文件 | 说明 |
|------|------|
| `EmptyState.vue` | 空状态占位图（无数据时展示） |
| `FilterBar.vue` | 筛选工具栏（标签/类型/难度多条件筛选） |
| `PageHeader.vue` | 页面标题栏（面包屑 + 操作按钮） |
| `ProviderBridge.vue` | Naive UI Provider 桥接组件（主题/按需注入） |
| `QuestionNavGrid.vue` | 题目导航网格（答题卡式快速跳转） |
| `QuestionOption.vue` | 题目选项组件（单选/多选/判断填空题渲染） |
| `QuestionPreviewDrawer.vue` | 题目预览抽屉（侧边滑出查看题目详情） |
| `RichText.vue` | 富文本渲染器（Markdown + KaTeX 公式） |
| `SkeletonList.vue` | 骨架屏加载列表 |
| `StatCard.vue` | 统计数据卡片 |
| `TagManageModal.vue` | 标签管理弹窗（新增/编辑/删除标签） |
| `UserSearchSelect.vue` | 用户搜索选择器（搜索并选择协作成员） |
| `questionNav.ts` | 题目导航逻辑（选答题号、状态标记） |

### src/components/importExport — 导入导出组件

| 文件 | 说明 |
|------|------|
| `BankImportDialog.vue` | 题库导入弹窗（JSON 文件上传、解析、预览） |
| `ImportResultPanel.vue` | 导入结果面板（成功/跳过/失败统计） |
| `QuestionImportDialog.vue` | 题目导入弹窗（单题或多题批量导入） |

### src/components — 其他组件

| 文件 | 说明 |
|------|------|
| `FileUpload.vue` | 文件上传组件（拖拽/点击上传，图片预览） |
| `LoadError.vue` | 加载失败兜底组件（错误状态 + 重试按钮） |
| `MarkdownEditor.vue` | Markdown 编辑器（基于 v-md-editor，支持公式） |

---

## src/composables — 组合式函数

| 文件 | 说明 |
|------|------|
| `useBankOptions.ts` | 获取题库下拉选项列表（缓存 + 防重复请求） |
| `useConfirm.ts` | 统一确认弹窗 Hook（封装 naive-ui 的 confirm） |
| `usePagination.ts` | 通用分页逻辑 Hook（页码、每页条数、总数管理） |

---

## src/layout — 布局组件

| 文件 | 说明 |
|------|------|
| `AuthLayout.vue` | 认证页布局（登录/注册居中卡片样式） |
| `MainLayout.vue` | 主布局（顶部导航栏 + 侧边菜单 + 内容区） |

---

## src/router — 路由配置

| 文件 | 说明 |
|------|------|
| `index.ts` | 路由表定义、路由守卫（登录校验、管理员权限校验）、懒加载 |

---

## src/stores — 状态管理

| 文件 | 说明 |
|------|------|
| `auth.ts` | 认证状态（Token、用户信息、登录/登出、权限判断） |

---

## src/theme — 主题定制

| 文件 | 说明 |
|------|------|
| `overrides.ts` | Naive UI 组件样式覆盖（颜色、圆角、阴影等设计令牌适配） |

---

## src/types — TypeScript 类型定义

| 文件 | 说明 |
|------|------|
| `index.ts` | 全量类型定义：用户、题库、题目、试卷、考试会话、练习会话、错题、收藏、通知、批改、统计等全部接口类型 |

---

## src/utils — 工具函数

| 文件 | 说明 |
|------|------|
| `constants.ts` | 全局常量（Token Key、API 基础路径、枚举映射等） |
| `format.ts` | 格式化工具（时间格式化、分数/百分比转换） |
| `download.ts` | 文件下载（Blob/URL 生成，导出 Excel/JSON） |
| `importFile.ts` | 文件读取工具（文件选择、内容解析） |
| `logger.ts` | 日志工具（分级日志：debug/info/warn/error） |
| `notificationRoute.ts` | 通知跳转路由映射（根据通知类型生成对应路由） |
| `practiceTitle.ts` | 练习会话标题生成（从 filterParams 解析出可读名称） |
| `tagOptions.ts` | 标签选项映射（标签 ID 到名称/颜色的转换） |

---

## src/views — 页面组件

### 入口页

| 文件 | 说明 |
|------|------|
| `Home.vue` | 首页（公告、推荐题库、快捷入口） |
| `Login.vue` | 登录页 |
| `Register.vue` | 注册页 |

### bank — 题库模块

| 文件 | 说明 |
|------|------|
| `BankList.vue` | 题库列表（卡片/列表切换、搜索、标签筛选） |
| `BankDetail.vue` | 题库详情（题目列表、统计信息、协作者管理） |
| `BankCreateDialog.vue` | 创建题库弹窗 |

### question — 题目模块

| 文件 | 说明 |
|------|------|
| `QuestionList.vue` | 题库内题目列表（按题型/难度筛选、分页） |
| `QuestionManage.vue` | 个人题目管理（全部题目、搜索、批量删除） |
| `QuestionDetail.vue` | 题目详情页（完整内容、解析、相似题推荐） |
| `QuestionForm.vue` | 题目创建/编辑表单（支持四种题型、选项动态增减） |

### paper — 试卷模块

| 文件 | 说明 |
|------|------|
| `PaperList.vue` | 试卷列表（我的试卷/公开试卷、状态筛选） |
| `PaperDetail.vue` | 试卷详情（题目预览、考试规则说明） |
| `PaperForm.vue` | 试卷创建/编辑表单（组卷、设置时间限制/及格线） |

### exam — 考试模块

| 文件 | 说明 |
|------|------|
| `ExamPage.vue` | 在线考试页（倒计时、题目翻页、自动提交、防作弊检测） |
| `ExamResult.vue` | 考试成绩页（客观题得分、主观题待批改状态） |
| `ExamRecords.vue` | 历史考试记录（列表、分数趋势） |

### grading — 批改模块

| 文件 | 说明 |
|------|------|
| `GradingList.vue` | 待批改列表（按试卷筛选、批改人分配） |
| `GradingDetail.vue` | 批改详情页（逐题评分、批量提交） |

### practice — 练习模块

| 文件 | 说明 |
|------|------|
| `PracticeList.vue` | 练习会话列表（历史记录、正确率统计） |
| `PracticePage.vue` | 练习答题页（即时反馈、错题标记、进度保存） |
| `PracticeCreateDialog.vue` | 新建练习弹窗（从题库/标签/自定义选题） |
| `Playground.vue` | 代码 playground（在线编码 + 判题） |

### wrongquestion — 错题本模块

| 文件 | 说明 |
|------|------|
| `WrongQuestionList.vue` | 错题列表（按错误次数排序、批量练习） |
| `WrongQuestionSnapshot.vue` | 错题快照页（只看题目和正确答案） |

### favorite — 收藏夹模块

| 文件 | 说明 |
|------|------|
| `FavoriteList.vue` | 收藏列表（按题库分组、取消收藏） |

### record — 做题记录模块

| 文件 | 说明 |
|------|------|
| `RecordList.vue` | 做题历史（全部作答记录、正确率趋势） |

### search — 搜索模块

| 文件 | 说明 |
|------|------|
| `SearchPage.vue` | 全局搜索（题目/题库关键词搜索、高亮匹配） |

### statistics — 统计模块

| 文件 | 说明 |
|------|------|
| `StatisticsPage.vue` | 学习统计（总题数、正确率、各题库表现、题型分布图表） |

### notification — 通知模块

| 文件 | 说明 |
|------|------|
| `NotificationList.vue` | 消息通知列表（系统/考试/批改/协作通知、一键已读） |

### profile — 个人中心

| 文件 | 说明 |
|------|------|
| `Profile.vue` | 个人资料（头像、昵称、密码修改、账号信息） |

### admin — 管理员模块

| 文件 | 说明 |
|------|------|
| `UserList.vue` | 用户管理（列表、禁用/启用、角色变更） |
| `ReviewList.vue` | 题目审核（待审核列表、通过/驳回操作） |

---

## 项目根文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目依赖与脚本配置 |
| `vite.config.ts` | Vite 构建配置（别名、插件、代理） |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `postcss.config.js` | PostCSS 配置 |
| `tsconfig.json` | TypeScript 编译配置 |
| `tsconfig.node.json` | Node 端 TypeScript 配置 |
| `vitest.config.ts` | Vitest 测试配置 |
| `index.html` | 入口 HTML |
| `src/main.ts` | 应用入口（挂载 Vue 实例、全局错误处理） |
| `src/App.vue` | 根组件（RouterView） |
| `src/style.css` | 全局样式（Tailwind 指令 + 基础重置） |
| `components.d.ts` | 自动生成的组件类型声明 |
| `src/auto-imports.d.ts` | 自动导入的类型声明 |
| `src/env.d.ts` | 环境变量类型声明 |
