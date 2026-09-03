# Quick Study 页面设计规格文档

> 本文档覆盖全部 16 个页面的布局结构、组件清单、数据接口、交互逻辑与响应式适配。
> 基于 mockup HTML 与现有 Vue 源码（router/index.ts、各 views 文件、api/ 目录）编写。
> 技术术语保留英文，正文使用中文。

---

## 目录

| 编号 | 页面名称 | 路由 | Mockup |
|------|---------|------|--------|
| 00 | 登录/注册 | /login, /register | 00-login.html |
| 01 | 首页/Dashboard | / | 01-home.html |
| 02 | 题库列表 | /banks | 02-bank-list.html |
| 03 | 题库详情 | /banks/:id | 03-bank-detail.html |
| 04 | 题目管理 | /questions | 04-question-list.html |
| 05 | 试卷列表 | /papers | 05-paper-list.html |
| 06 | 考试答题 | /papers/:id/exam | 06-exam-page.html |
| 07 | 随机练习 | /practice/sessions/:id | 07-practice-page.html |
| 08 | 考试结果 | /exam/sessions/:id/result | 08-exam-result.html |
| 09 | 统计面板 | /statistics | 09-statistics.html |
| 10 | 错题本 | /wrong-questions | 10-wrong-questions.html |
| 11 | 做题记录 | /records | 11-records.html |
| 12 | 搜索 | /search | 12-search.html |
| 13 | 通知中心 | /notifications | 13-notifications.html |
| 14 | 个人中心 | /profile | 14-profile.html |
| 15 | 用户管理 | /admin/users | 15-admin-users.html |

---

## 全局布局说明

### 布局类型

| 类型 | 说明 | 使用页面 |
|------|------|---------|
| **Sidebar + Header** | 左侧固定 Sidebar（240px），顶部 Header（64px），主内容区可滚动 | 01-05, 08-15 |
| **Full-screen** | 全屏沉浸式布局，无 Sidebar，有简化的顶部栏 | 06, 07 |
| **Auth** | 全屏渐变背景 + 居中卡片，无导航 | 00 |

### 全局 Shell 结构（Sidebar + Header 布局）

```
┌──────────────────────────────────────────┐
│ Sidebar (240px) │ Header (64px)           │
│                 ├────────────────────────┤
│  - Logo         │ Breadcrumb ... Notif │ Avatar │
│  - Nav (分组)   ├────────────────────────┤
│  - Logout       │                        │
│                 │   Main Content          │
│                 │   (scrollable)          │
└─────────────────┴────────────────────────┘
```

### Sidebar 导航分组

| 分组 | 菜单项 | 可见性 |
|------|--------|--------|
| 资源管理 | 首页、题库、题目、试卷 | 全部用户 |
| 学习中心 | 练习、错题本、做题记录、搜索、统计、通知 | 登录用户（搜索游客可见） |
| 管理 | 用户管理、审核列表 | 管理员 |

### Vue Layout 组件映射

| Layout | Vue 文件 | 说明 |
|--------|---------|------|
| MainLayout | `src/layout/MainLayout.vue` | Naive UI `n-layout` + `n-layout-sider` + `n-layout-header` |
| AuthLayout | `src/layout/AuthLayout.vue` | 全屏渐变背景 + `n-card` |

---

## 00. 登录/注册

- **路由**: `/login`（登录）, `/register`（注册）
- **Vue 文件**: `src/views/Login.vue`, `src/views/Register.vue`
- **Mockup**: `mockups/00-login.html`
- **布局**: Auth（全屏渐变背景 + 居中卡片）
- **权限**: public（已登录用户访问会重定向到首页）

### 页面结构

```
┌─────────────────────────────────────┐
│  (全屏渐变背景 + 装饰圆形 blob)        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Auth Card                   │    │
│  │  ┌───────────────────────┐  │    │
│  │  │ Logo "QS"             │  │    │
│  │  │ Title: 题库与组卷练习系统│  │    │
│  │  │ Subtitle: 登录你的账号..│  │    │
│  │  └───────────────────────┘  │    │
│  │                              │    │
│  │  ┌── Tab Switcher ────────┐  │    │
│  │  │ [登录]  [注册]          │  │    │
│  │  └───────────────────────┘  │    │
│  │                              │    │
│  │  用户名 Input (leading icon)  │    │
│  │  密码 Input (trailing icon)   │    │
│  │  验证码 Input + Captcha Image │    │
│  │                              │    │
│  │  [✓ 记住我]    [忘记密码?]   │    │
│  │                              │    │
│  │  [ 登录 ] (btn-primary lg)   │    │
│  │                              │    │
│  │  还没有账号？立即注册         │    │
│  └──────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Auth Card | `n-card` (`:bordered="false"`) | 居中，max-width 448px |
| Logo Icon | 自定义 div `QS` | 40x40 圆角方块，brand gradient |
| Tab Switcher | `n-tabs` 或自定义 flex | 登录/注册切换 |
| Username Input | `n-input` + prefix slot | leading person icon |
| Password Input | `n-input` + prefix/suffix | 密码可见性切换 |
| Captcha Input | `n-input` + `n-button`/图片 | 验证码图片可点击刷新 |
| Remember Me | `n-checkbox` | |
| Forgot Password | `n-button` text type | |
| Submit Button | `n-button` type=primary block size=large | |
| Footer Link | `n-button` text type | 切换到注册/登录 |

### 数据接口

| API 函数 | 文件 | 端点 | 方法 |
|---------|------|------|------|
| `login(data)` | `api/auth.ts` | `POST /auth/login` | 用户名+密码+验证码 |
| `register(data)` | `api/auth.ts` | `POST /auth/register` | 注册参数 |
| `getCaptcha()` | `api/auth.ts` | `GET /auth/captcha` | 获取验证码图片 |
| `checkUsername(username)` | `api/auth.ts` | `GET /auth/check-username` | 注册时检查用户名 |

### 交互逻辑

1. **Tab 切换**: 登录/注册切换，内部不跳路由，切换表单字段（注册增加昵称、确认密码、邮箱）
2. **验证码刷新**: 点击 captcha 图片重新请求 `getCaptcha()`
3. **密码可见性**: 点击 trailing eye icon 切换 `type="password"` / `type="text"`
4. **登录提交**: 校验 -> `login()` -> 存储 token 到 localStorage -> 根据 `redirect` query 跳转
5. **注册提交**: 校验用户名唯一 -> `register()` -> 注册成功后自动登录或跳转登录页
6. **记住我**: 控制是否持久化 token（localStorage vs sessionStorage）

### 响应式适配

- **Desktop**: 卡片 max-width 448px，居中显示
- **Tablet**: 同 Desktop，padding 缩小
- **Mobile**: 全宽，padding 进一步缩小，卡片几乎占满屏幕宽度

---

## 01. 首页/Dashboard

- **路由**: `/`
- **Vue 文件**: `src/views/Home.vue`
- **Mockup**: `mockups/01-home.html`
- **布局**: Sidebar + Header
- **权限**: public（游客与登录用户看到不同内容）

### 页面结构

```
┌─────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 首页)           │
│         ├───────────────────────────────────┤
│         │                                    │
│         │  ┌─ Welcome Banner (brand gradient)─┐│
│         │  │ 欢迎回来，张同学   练习场次 128   ││
│         │  │ 今天也要加油学习..  正确率 85.2% ││
│         │  └────────────────────────────────┘│
│         │                                    │
│         │  ┌─ Quick Entry Grid (5 cols) ─────┐│
│         │  │ [题库管理] [试卷管理] [随机练习] ││
│         │  │ [错题本]   [做题记录]            ││
│         │  └────────────────────────────────┘│
│         │                                    │
│         │  ┌─ Statistics Overview (4 cols) ──┐│
│         │  │ 练习场次  │ 总题数  │ 正确率 │错题数│
│         │  └────────────────────────────────┘│
│         │                                    │
│         │  ┌─ Recent Activity Card ──────────┐│
│         │  │ [tag] 活动标题     活动描述  时间 ││
│         │  │ [tag] ...                      ││
│         │  └────────────────────────────────┘│
└─────────┴────────────────────────────────────┘
```

**游客模式差异**: Welcome Banner 显示"欢迎光临"+"登录后即可开始练习"；Quick Entry 仅显示 3 个入口（题库浏览、试卷浏览、搜索）；显示"公开题库"和"公开试卷" DataTable 替代统计概览。

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Welcome Banner | 自定义 div + brand gradient | 含统计数据行 |
| Quick Entry Grid | `n-grid` :cols=5 + `n-card` hoverable | icon + label 卡片 |
| Stat Card | `n-statistic` + `n-grid-item` | 4 列统计概览 |
| Recent Activity | `n-list` + `n-list-item` + `n-thing` | 含 tag + title + time |
| Public Bank Table | `n-data-table` | 游客模式，简化列 |
| Public Paper Table | `n-data-table` | 游客模式，简化列 |
| Empty State | `n-empty` | 无活动记录时显示 |
| View All Link | `n-button` text type=primary | 跳转列表页 |

### 数据接口

| API 函数 | 文件 | 端点 | 调用条件 |
|---------|------|------|---------|
| `getStatisticsOverview()` | `api/statistics.ts` | `GET /statistics/overview` | 登录用户 |
| `getBankList({ isPublic: true })` | `api/bank.ts` | `GET /banks` | 游客 |
| `getPaperList({ shareType: 'PUBLIC', status: 'PUBLISHED' })` | `api/paper.ts` | `GET /papers` | 游客 |

### 交互逻辑

1. **Quick Entry 点击**: 根据 entry.path 执行 `router.push(path)`
2. **入口动态显示**: `computed quickEntries` 根据 `authStore.isAuthenticated` 返回不同入口列表
3. **查看全部**: 点击"查看全部题库/试卷"跳转 `/banks` 或 `/papers`
4. **数据加载**: `onMounted` 中根据登录状态分别调用 `fetchPublicBanks()` + `fetchPublicPapers()` 或 `fetchOverview()`

### 响应式适配

- **Desktop**: Quick Entry 5 列，统计 4 列，Welcome Banner 横排
- **Tablet**: Quick Entry 3 列，统计 2 列
- **Mobile**: Quick Entry 2 列，统计 1-2 列，Welcome Banner 数据行改为竖排

---

## 02. 题库列表

- **路由**: `/banks`
- **Vue 文件**: `src/views/bank/BankList.vue`
- **Mockup**: `mockups/02-bank-list.html`
- **布局**: Sidebar + Header
- **权限**: public

### 页面结构

```
┌────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 题库)              │
│         ├──────────────────────────────────────┤
│         │  标题"题库"          [创建题库 btn]     │
│         │                                       │
│         │  [🔍 搜索框]  [可见性 Select]          │
│         │                                       │
│         │  ┌── Bank Card Grid (3 cols) ────────┐│
│         │  │ ┌──────┐ ┌──────┐ ┌──────┐        ││
│         │  │ │ Bank │ │ Bank │ │ Bank │        ││
│         │  │ │ Card │ │ Card │ │ Card │        ││
│         │  │ └──────┘ └──────┘ └──────┘        ││
│         │  │ ┌──────┐ ┌──────┐ ┌──────┐        ││
│         │  │ │ Bank │ │ Bank │ │ Bank │        ││
│         │  │ └──────┘ └──────┘ └──────┘        ││
│         │  └──────────────────────────────────┘│
│         │                                       │
│         │  [< 1 2 3 ... >]  共 18 个题库        │
└─────────┴───────────────────────────────────────┘
```

### Bank Card 结构

```
┌─────────────────────────────────────┐
│ 题库名称(bold)        [官方/公开/私有] │
│ 描述文本 (line-clamp-2)...           │
│                                      │
│ 📄 156 题    🔄 1.2k 练习             │
│──────────────────────────────────── │
│ [Avatar] 创建者名      查看详情 →     │
└──────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Search Input | `n-input` + prefix icon | 带 search leading icon |
| Visibility Select | `n-select` | 全部/公开/私有/官方 |
| Bank Card Grid | `n-grid` :cols=3 + `n-card` hoverable | 卡片网格 |
| Bank Card | 自定义 card 布局 | 名称、tag、描述、meta、footer |
| Visibility Tag | `n-tag` | warning(官方)/success(公开)/default(私有) |
| Avatar | `n-avatar` size=small | 创建者头像 |
| View Detail Link | `n-button` text type=primary | 跳转题库详情 |
| Create Bank Button | `n-button` type=primary | 登录用户可见 |
| BankCreateDialog | `src/views/bank/BankCreateDialog.vue` | 创建题库弹窗 |
| Pagination | 自定义分页 | 或 `n-pagination` |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getBankList(params)` | `api/bank.ts` | `GET /banks` | page, size, keyword, isPublic, isOfficial |
| `deleteBank(id)` | `api/bank.ts` | `DELETE /banks/:id` | 管理员操作 |
| `toggleVisibility(id, isPublic)` | `api/bank.ts` | `PUT /banks/:id/visibility` | 管理员操作 |
| `createBank(data)` | `api/bank.ts` | `POST /banks` | 创建题库 |

### 交互逻辑

1. **搜索**: 输入关键词回车 -> 重置到第 1 页 -> `fetchList()`
2. **筛选**: 切换可见性 select -> 重置到第 1 页 -> `fetchList()`
3. **分页**: 切换页码 -> `fetchList()`
4. **点击卡片**: `router.push('/banks/' + id)` 跳转详情
5. **创建题库**: 点击按钮 -> 打开 `BankCreateDialog` -> 创建成功后刷新列表
6. **管理员操作**: 管理员可见"设为私有/公开"和"删除"操作（基于 `authStore.isAdmin`）

### 响应式适配

- **Desktop**: 3 列卡片网格
- **Tablet**: 2 列卡片网格
- **Mobile**: 1 列卡片网格，筛选栏改为竖排

---

## 03. 题库详情

- **路由**: `/banks/:id`
- **Vue 文件**: `src/views/bank/BankDetail.vue`
- **Mockup**: `mockups/03-bank-detail.html`
- **布局**: Sidebar + Header
- **权限**: public

### 页面结构

```
┌───────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 题库 › Java基础...)   │
│         ├─────────────────────────────────────────┤
│         │  [← 返回题库列表]                          │
│         │                                            │
│         │  ┌─ Bank Hero Card ─────────────────────┐│
│         │  │ [Avatar J]  题库名称(2xl bold)        ││
│         │  │            [官方] [公开]              ││
│         │  │ 描述文本...                           ││
│         │  │ 📄 156题  🔄 1234次  📅 2026-08-28   ││
│         │  │                    创建者: 王老师     ││
│         │  │              [开始练习] [创建题目]    ││
│         │  └─────────────────────────────────────┘│
│         │                                            │
│         │  ┌─ Filter Card ───────────────────────┐│
│         │  │ 题型: [全部][单选][多选][判断]...     ││
│         │  │ 难度: [全部][简单][中等][困难]        ││
│         │  │ 标签: [面向对象][集合框架]...        ││
│         │  └─────────────────────────────────────┘│
│         │                                            │
│         │  ┌─ Question Table ────────────────────┐│
│         │  │ 题号 │ 题干 │ 题型 │ 难度 │ 标签 │日期│操作││
│         │  │ 001  │ ...  │ 单选 │ 简单 │ ...  │... │查看││
│         │  └─────────────────────────────────────┘│
│         │                                            │
│         │  [< 1 2 3 ... >]  共 156 道题目           │
└─────────┴───────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Back Button | `n-button` quaternary size=small | 返回列表 |
| Bank Hero Card | `n-card` | 题库信息头部 |
| Avatar LG | `n-avatar` size=large | 题库首字母头像 |
| Status Tags | `n-tag` | 官方/公开标签 |
| Meta Items | 自定义 flex | 题目数、练习次数、更新时间 |
| Start Practice Button | `n-button` type=primary | 需登录 |
| Create Question Button | `n-button` type=secondary | 需权限 |
| Filter Chips | 自定义 tab-chip | 题型/难度/标签筛选 |
| Question Table | `n-data-table` remote | 题目列表 |
| Pagination | `n-pagination` 或自定义 | |
| View Button | `n-button` quaternary size=small | 查看题目详情 |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getBankDetail(id)` | `api/bank.ts` | `GET /banks/:id` | 获取题库信息 |
| `getQuestionList(bankId, params)` | `api/question.ts` | `GET /banks/:bankId/questions` | 分页+筛选 |
| `createQuestion(bankId, data)` | `api/question.ts` | `POST /banks/:bankId/questions` | 创建题目 |
| `createPractice(data)` | `api/practice.ts` | `POST /practice/sessions` | 开始练习 |

### 交互逻辑

1. **返回**: 点击返回按钮 `router.back()` 或 `router.push('/banks')`
2. **筛选**: 点击题型/难度/标签 chip -> 切换 active -> 重新请求题目列表
3. **开始练习**: 需登录 -> 可直接创建练习 session 或弹出练习配置 dialog
4. **创建题目**: 跳转 `/banks/:id/questions/create`
5. **查看题目**: 点击行内"查看" -> `router.push('/banks/:id/questions/:qid')`

### 响应式适配

- **Desktop**: Hero card 左右布局，表格全列显示
- **Tablet**: Hero card 改为上下布局，表格隐藏部分列
- **Mobile**: 筛选 chip 横向滚动，表格简化为卡片列表

---

## 04. 题目管理

- **路由**: `/questions`
- **Vue 文件**: `src/views/question/QuestionManage.vue`
- **Mockup**: `mockups/04-question-list.html`
- **布局**: Sidebar + Header
- **权限**: public

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 题目)                     │
│         ├────────────────────────────────────────────┤
│         │  题目(2xl)               [创建题目 btn]       │
│         │  跨题库管理所有题目...                        │
│         │                                               │
│         │  ┌─ Filter Card ────────────────────────────┐│
│         │  │ [🔍 搜索] [题库 Select] [题型 Select]      ││
│         │  │ [难度 Select]                              ││
│         │  │ ──────────────────────────────           ││
│         │  │ 标签: [Java✓] [Python✓] [算法] [数据库]... ││
│         │  │              [全部][草稿][已发布]         ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Table Toolbar ─────────────────────────┐│
│         │  │ 共 128 道题目                    [导出]   ││
│         │  ├──────────────────────────────────────────┤│
│         │  │ 题号│题干│题型│难度│标签│题库│状态│时间│操作││
│         │  │#001 │... │单选│简单│Java│...│发布│... │👁✏🗑││
│         │  └──────────────────────────────────────────┘│
│         │  [< 1 2 3 4 ... 13 >]                        │
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Page Header | 自定义 flex | 标题 + 副标题 + 按钮 |
| Filter Search | `n-input` + prefix | 搜索题干、标签 |
| Bank Select | `n-select` | 筛选题库 |
| Type Select | `n-select` | 筛选题型 |
| Difficulty Select | `n-select` | 筛选难度 |
| Tag Chips | 自定义 tag-chip | 多选标签筛选 |
| Status Tabs | 自定义 status-tab | 全部/草稿/已发布 |
| Data Table | `n-data-table` remote | 题目列表 |
| Table Toolbar | 自定义 flex | 计数 + 导出按钮 |
| Type Tag | `n-tag` | 单选(info)/多选(warning)/判断(success)/填空(default)/简答(primary) |
| Difficulty Tag | `n-tag` | 简单(success)/中等(warning)/困难(error) |
| Status Tag | `n-tag` | 已发布(success)/草稿(default) |
| Icon Buttons | `n-button` quaternary size=small | 详情(eye)/编辑(create)/删除(trash) |
| Export Button | `n-button` quaternary size=small | 导出题目 |
| Pagination | `n-pagination` 或自定义 | |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getAllQuestions(params)` | `api/question.ts` | `GET /questions` | page, pageSize, bankId, type, difficulty, keyword, tagIds, status |
| `deleteQuestion(bankId, qid)` | `api/question.ts` | `DELETE /banks/:bankId/questions/:qid` | 删除题目 |
| `downloadTemplate()` | `api/question.ts` | `GET /questions/import-template` | 导出模板 |

### 交互逻辑

1. **搜索**: 输入关键词 -> 回车或 debounce -> 重置页码 -> 刷新
2. **筛选联动**: 题库/题型/难度/标签/状态任一变化 -> 重置页码 -> 刷新
3. **标签多选**: 点击 tag-chip 切换 selected 状态 -> 加入/移除 tagIds
4. **创建题目**: 跳转创建题目页面（需先选择题库）
5. **行操作**: 详情跳转 `/banks/:bankId/questions/:qid`；编辑跳转 edit 页；删除弹确认 dialog
6. **导出**: 调用导出接口下载文件

### 响应式适配

- **Desktop**: 完整 9 列表格，筛选栏单行排列
- **Tablet**: 表格隐藏标签/题库列，筛选栏换行
- **Mobile**: 表格转为卡片列表，筛选改为下拉折叠面板

---

## 05. 试卷列表

- **路由**: `/papers`
- **Vue 文件**: `src/views/paper/PaperList.vue`
- **Mockup**: `mockups/05-paper-list.html`
- **布局**: Sidebar + Header
- **权限**: public

### 页面结构

```
┌──────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 试卷)                │
│         ├────────────────────────────────────────┤
│         │  试卷(2xl)            [创建试卷 btn]      │
│         │  创建、管理试卷...                        │
│         │                                           │
│         │  ┌─ Filter Card ───────────────────────┐│
│         │  │ [🔍 搜索]  [全部][草稿][已发布][已关闭]││
│         │  │                       [共享类型 Select]││
│         │  └──────────────────────────────────────┘│
│         │                                           │
│         │  ┌── Paper Grid (2 cols) ───────────────┐│
│         │  │ ┌──────────┐  ┌──────────┐           ││
│         │  │ │ Paper Card│  │ Paper Card│          ││
│         │  │ └──────────┘  └──────────┘           ││
│         │  │ ┌──────────┐  ┌──────────┐           ││
│         │  │ │ Paper Card│  │ Paper Card│          ││
│         │  │ └──────────┘  └──────────┘           ││
│         │  └──────────────────────────────────────┘│
│         │                                           │
│         │  [< 1 2 3 >]                              │
└─────────┴───────────────────────────────────────────┘
```

### Paper Card 结构

```
┌──────────────────────────────────────┐
│ 试卷标题(2xl bold)      [已发布] tag  │
│ 描述(line-clamp-2)...                  │
│ ──────────────────────────────────── │
│ 50题   100分   120分钟                 │
│ ──────────────────────────────────── │
│ [Avatar] 张老师 · 2026-08-20 创建      │
│ ──────────────────────────────────── │
│ [开始考试] [查看详情]      [公开] tag   │
└──────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Search Input | `n-input` + prefix | 搜索试卷名称 |
| Status Tabs | 自定义 status-tabs | 全部/草稿/已发布/已关闭 |
| Share Type Select | `n-select` | 全部/公开/私有+密码/私有+链接 |
| Paper Grid | `n-grid` :cols=2 | 试卷卡片网格 |
| Paper Card | `n-card` hoverable | 试卷信息卡片 |
| Paper Title | 自定义 | 标题 + 状态 tag |
| Paper Stats | 自定义 flex | 题目数/总分/时限 |
| Paper Meta | 自定义 flex | 创建者 + 创建时间 |
| Status Tag | `n-tag` | 已发布(success)/草稿(default)/已关闭(warning) |
| Share Type Tag | `n-tag` | 公开(success)/私有+密码(warning)/私有+链接(info) |
| Action Buttons | `n-button` | 开始考试(primary)/查看详情(ghost)/继续编辑(secondary) |
| Pagination | `n-pagination` 或自定义 | |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getPaperList(params)` | `api/paper.ts` | `GET /papers` | page, size, keyword, shareType, status |
| `createPaper(data)` | `api/paper.ts` | `POST /papers` | 创建试卷 |
| `deletePaper(id)` | `api/paper.ts` | `DELETE /papers/:id` | 删除试卷 |
| `verifyPassword(id, pwd)` | `api/paper.ts` | `POST /papers/:id/verify-password` | 私有+密码验证 |

### 交互逻辑

1. **搜索/筛选**: 搜索或切换状态/共享类型 -> 重置页码 -> 刷新
2. **开始考试**: 已发布 -> 登录用户 -> 私有+密码试卷需先验证密码 -> `startSession(paperId)` -> 跳转 `/papers/:id/exam`
3. **查看详情**: 跳转 `/papers/:id`
4. **继续编辑**: 草稿状态 -> 跳转 `/papers/:id/edit`
5. **创建试卷**: 跳转 `/papers/create`
6. **已关闭**: 按钮禁用，显示"已关闭"

### 响应式适配

- **Desktop**: 2 列卡片网格
- **Tablet**: 2 列卡片网格（缩小间距）
- **Mobile**: 1 列卡片，筛选栏换行

---

## 06. 考试答题

- **路由**: `/papers/:id/exam`
- **Vue 文件**: `src/views/exam/ExamPage.vue`
- **Mockup**: `mockups/06-exam-page.html`
- **布局**: Full-screen（无 Sidebar，有 sticky exam header）
- **权限**: requiresAuth

### 页面结构

```
┌────────────────────────────────────────────────────────┐
│ Exam Header (sticky)                                   │
│ [← 返回] │ Java基础测试卷(一)    ⏱ 01:32:45  [交卷]    │
├──────────────┬────────────────────────────────────────┤
│              │                                        │
│  Question    │  ┌─ Question Card ──────────────────┐ │
│  Navigation  │  │ 第 3 题 / 共 20 题  [单选] [中等]  │ │
│  ┌────────┐  │  │                          [标记]   │ │
│  │1✓ 2✓  │  │  │ 在 Java 中，以下哪个关键字...     │ │
│  │3● 4✓  │  │  │                                  │ │
│  │5✓ 6✓  │  │  │ ○ A. implements                  │ │
│  │7✓ 8✓  │  │  │ ○ B. interface                   │ │
│  │9○ 10○ │  │  │ ● C. extends  (selected)         │ │
│  │11○ 12○│  │  │ ○ D. inherits                    │ │
│  │...     │  │  │                                  │ │
│  └────────┘  │  │ [← 上一题]          [下一题 →]   │ │
│              │  └──────────────────────────────────┘ │
│  Legend:     │                                        │
│  ● 当前      │                                        │
│  ✓ 已答      │                                        │
│  ○ 未答      │                                        │
│  ⚑ 待检查    │                                        │
│              │                                        │
│  已答: 8/未答:12 │                                    │
└──────────────┴────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Exam Header | 自定义 sticky header | 返回+标题+计时器+交卷 |
| Back Button | `n-button` quaternary | 返回试卷列表 |
| Timer | 自定义 span | 倒计时，`exam-timer` class |
| Submit Button | `n-button` type=error | 交卷 |
| Question Nav Grid | 自定义 q-nav-grid | 20 个导航格子 |
| Nav Cell | 自定义 div | 4 种状态：current/answered/unanswered/marked |
| Nav Legend | 自定义 flex | 颜色图例 |
| Nav Summary | 自定义 | 已答/未答计数 |
| Question Card | `n-card` | 题目内容卡片 |
| Question Index | 自定义 | "第 N 题 / 共 M 题" |
| Type/Difficulty Tag | `n-tag` | 题型+难度标签 |
| Mark Button | `n-button` quaternary size=small | 标记待检查 |
| Question Content | 自定义 div | 题干文本 |
| Option Item | 自定义 | 选项（A/B/C/D marker + content） |
| Prev/Next Button | `n-button` | 上一题/下一题 |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `startSession(paperId, password?)` | `api/exam.ts` | `POST /papers/:paperId/sessions` | 开始考试 session |
| `getSession(sessionId)` | `api/exam.ts` | `GET /sessions/:sessionId` | 获取 session 状态+题目+已答 |
| `saveAnswers(sessionId, data)` | `api/exam.ts` | `POST /sessions/:sessionId/answers` | 保存答案 |
| `submitSession(sessionId)` | `api/exam.ts` | `POST /sessions/:sessionId/submit` | 交卷 |
| `reportCheat(sessionId)` | `api/exam.ts` | `POST /sessions/:sessionId/cheat` | 作弊检测报告 |

### 交互逻辑

1. **初始化**: `onMounted` -> `startSession(paperId)` -> 获取题目列表和 deadline
2. **选择选项**: 点击 option -> 更新 `currentAnswers` -> 自动保存（debounce `saveAnswers`）
3. **导航格子点击**: 点击题号 -> 切换当前题目
4. **上一题/下一题**: 切换当前题目索引
5. **标记待检查**: 切换 marked 状态 -> 更新导航格子显示
6. **计时器**: 每秒递减，到 0 自动交卷
7. **交卷**: 弹确认 dialog -> `submitSession()` -> 跳转结果页 `/exam/sessions/:id/result`
8. **返回**: 弹确认 dialog（确认放弃考试）-> 返回试卷列表
9. **防作弊**: 切屏/失焦触发 `reportCheat()`，超过限制自动交卷

### 响应式适配

- **Desktop**: 左侧导航 200px + 右侧题目区，max-width 1200px
- **Tablet**: 导航缩小或改为顶部横向滚动
- **Mobile**: 导航变为底部抽屉或折叠面板，题目区全宽

---

## 07. 随机练习

- **路由**: `/practice/sessions/:id`
- **Vue 文件**: `src/views/practice/PracticePage.vue`
- **Mockup**: `mockups/07-practice-page.html`
- **布局**: Full-screen（简化的 sticky header + 条件标签栏）
- **权限**: requiresAuth

### 页面结构

```
┌────────────────────────────────────────────────────────┐
│ Practice Header (sticky)                                │
│ [🎮] 随机练习                              [✕ 退出]    │
├────────────────────────────────────────────────────────┤
│ Condition Bar                                           │
│ 练习条件: [🔀随机] [📚3个题库] [📋单选多选判断] [20题] │
├────────────────────────────────────────────────────────┤
│                                                         │
│              ┌─ Question Card (max-w 880px) ────────┐  │
│              │ 第 5 题 / 共 20 题  [多选] [困难]     │  │
│              │                                        │  │
│              │ ████████░░░░░░░░  已答 4/20 题       │  │
│              │                                        │  │
│              │ 关于 Java 集合框架，以下说法正确的有？ │  │
│              │                                        │  │
│              │ ○ A. ArrayList 底层基于数组实现       │  │
│              │ ✓ B. LinkedList 同时实现 List 和 Deque │  │
│              │ ○ C. HashMap 是线程安全的              │  │
│              │ ✓ D. TreeMap 基于红黑树实现           │  │
│              │ ○ E. HashSet 底层使用 HashMap          │  │
│              │                                        │  │
│              │ ┌─ Result Alert (success) ───────────┐│  │
│              │ │ ✓ 回答正确！正确答案 B、D，用时42秒 ││  │
│              │ └────────────────────────────────────┘│  │
│              │                                        │  │
│              │ ┌─ Analysis ───────────────────────┐│  │
│              │ │ 💡 解析                           ││  │
│              │ │ LinkedList 同时实现了...          ││  │
│              │ └────────────────────────────────────┘│  │
│              │                                        │  │
│              │ [←上一题] [提交✓]    [下一题→] [完成⚑]│  │
│              └──────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Practice Header | 自定义 sticky header | logo + 标题 + 退出 |
| Close Button | `n-button` quaternary | 退出练习 |
| Condition Bar | 自定义 flex | 练习条件标签 |
| Condition Tag | `n-tag` round | 随机/题库/题型/题量 |
| Progress Bar | `n-progress` 或自定义 | 线性进度条 |
| Progress Text | 自定义 span | "已答 N/M 题" |
| Question Card | `n-card` | 题目卡片 |
| Question Header | 自定义 flex | 题号 + 题型 + 难度 |
| Question Content | 自定义 div | 题干 |
| Option Item | 自定义 | 选项（含 correct 状态） |
| Result Alert | `n-alert` type=success/error | 答题结果反馈 |
| Analysis Section | 自定义 div | 解析文本，border-left 高亮 |
| Action Buttons | `n-button` | 上一题/提交/下一题/完成 |
| Complete Button | `n-button` type=success | 完成练习 |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getPracticeSession(id)` | `api/practice.ts` | `GET /practice/sessions/:id` | 获取 session + 题目 |
| `submitPracticeAnswer(sessionId, data)` | `api/practice.ts` | `POST /practice/sessions/:id/answers` | 提交单题答案 |
| `completePractice(sessionId)` | `api/practice.ts` | `POST /practice/sessions/:id/complete` | 完成练习 |
| `abandonPractice(sessionId)` | `api/practice.ts` | `POST /practice/sessions/:id/abandon` | 放弃练习 |
| `reroll(sessionId)` | `api/practice.ts` | `POST /practice/sessions/:id/reroll` | 换题 |

### 交互逻辑

1. **初始化**: `onMounted` -> `getPracticeSession(id)` -> 加载题目列表
2. **选择选项**: 点击 option -> 标记选中（多选可多选）
3. **提交答案**: 点击"提交答案" -> `submitPracticeAnswer()` -> 返回正确性 + 解析
4. **查看解析**: 提交后显示 result alert + analysis section
5. **下一题**: 提交后才能进入下一题 -> 更新 currentIndex
6. **上一题**: 回看已答题目
7. **完成练习**: `completePractice()` -> 跳转练习结果或记录页
8. **退出**: 弹确认 dialog -> `abandonPractice()` -> 返回首页或练习列表
9. **进度更新**: 每次提交后更新 progress bar 和 progress text

### 响应式适配

- **Desktop**: 题目卡片 max-width 880px 居中
- **Tablet**: 同 Desktop，padding 缩小
- **Mobile**: 全宽，条件标签栏横向滚动，底部按钮改为全宽

---

## 08. 考试结果

- **路由**: `/exam/sessions/:id/result`
- **Vue 文件**: `src/views/exam/ExamResult.vue`
- **Mockup**: `mockups/08-exam-result.html`
- **布局**: Sidebar + Header
- **权限**: requiresAuth

### 页面结构

```
┌─────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 试卷 › 考试结果)         │
│         ├───────────────────────────────────────────┤
│         │                                            │
│         │  ┌─ Result Hero Card ─────────────────────┐│
│         │  │         ✓ 通过                         ││
│         │  │         87 / 100                       ││
│         │  │       最终得分                         ││
│         │  │  ──────────────────────────────────   ││
│         │  │ 客观题72/80 │ 主观题15/20 │ 第3名 │1h28m││
│         │  └────────────────────────────────────────┘│
│         │                                            │
│         │  ┌─ Answer Review Card ──────────────────┐│
│         │  │ 📄 答题回顾 共4题                       ││
│         │  │              [全部][正确][错误][待批改] ││
│         │  │ ────────────────────────────────────  ││
│         │  │ ┌─ Review Card: Q1 ───────────────┐  ││
│         │  │ │ [1] [单选][简单][正确]           │  ││
│         │  │ │ 题干内容...                     │  ││
│         │  │ │ 你的答案: B. String  │ 正确: B. String│  ││
│         │  │ │ 💡 解析...                      │  ││
│         │  │ │ 得分: 2/2                       │  ││
│         │  │ └────────────────────────────────┘  ││
│         │  │ ┌─ Review Card: Q2 (错误) ────────┐  ││
│         │  │ │ ...                              │  ││
│         │  │ └────────────────────────────────┘  ││
│         │  │ ┌─ Review Card: Q3 (待批改-简答) ──┐  ││
│         │  │ │ 你的作答...                     │  ││
│         │  │ │ 得分: 待批改                     │  ││
│         │  │ └────────────────────────────────┘  ││
│         │  └──────────────────────────────────────┘│
│         │                                            │
│         │  [← 返回试卷列表]  [查看试卷详情]          │
└─────────┴───────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Result Hero Card | 自定义 card | 带 radial gradient 装饰 |
| Pass Badge | 自定义 badge | 通过(success)/未通过(error) |
| Score Display | 自定义 | 大字号得分 + 总分 |
| Hero Stats Grid | `n-grid` :cols=4 | 客观题/主观题/排名/用时 |
| Review Card Container | `n-card` | 答题回顾 |
| Filter Tabs | 自定义 filter-tabs | 全部/正确/错误/待批改 |
| Review Card | 自定义 card | 单题回顾 |
| Review Q Num | 自定义 | 圆角方块序号 |
| Answer Block | `n-grid` :cols=2 | 你的答案 vs 正确答案 |
| Answer Box | 自定义 | correct(绿)/wrong(红)/pending(黄) 背景 |
| Essay Text | 自定义 | 简答题作答文本展示 |
| Analysis Block | 自定义 | 解析文本，info 背景 |
| Review Footer | 自定义 flex | 得分显示 |
| Score Value | 自定义 | success/warning/error 颜色 |
| Bottom Actions | `n-button` group | 返回+查看详情 |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getResult(sessionId)` | `api/exam.ts` | `GET /sessions/:sessionId/result` | 获取考试结果 |

### 交互逻辑

1. **初始化**: `onMounted` -> `getResult(sessionId)` -> 加载结果数据
2. **筛选**: 切换 全部/正确/错误/待批改 -> 过滤 review cards
3. **返回**: `router.push('/papers')`
4. **查看试卷详情**: `router.push('/papers/:paperId')`

### 响应式适配

- **Desktop**: Hero stats 4 列，答题回顾 answer block 2 列
- **Tablet**: Hero stats 2 列，answer block 1 列
- **Mobile**: 全部单列，Hero card 简化

---

## 09. 统计面板

- **路由**: `/statistics`
- **Vue 文件**: `src/views/statistics/StatisticsPage.vue`
- **Mockup**: `mockups/09-statistics.html`
- **布局**: Sidebar + Header
- **权限**: requiresAuth

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 统计)                    │
│         ├────────────────────────────────────────────┤
│         │  学习统计(2xl)                                │
│         │                                               │
│         │  ┌─ Overview Grid (4 cols) ────────────────┐│
│         │  │ ┌────────┐┌────────┐┌────────┐┌────────┐││
│         │  │ │🔄 128  ││📋 1536 ││✓ 85.2%││✕ 47   │││
│         │  │ │↑+12%  ││↑+8.5% ││↑+3.2% ││↓-15%  │││
│         │  │ │较上月  ││较上月  ││较上月  ││较上月  │││
│         │  │ └────────┘└────────┘└────────┘└────────┘││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Bank Statistics Table ──────────────────┐│
│         │  │ 各题库统计                    [导出]      ││
│         │  │ 题库│做题数│正确率(bar)│错题│最近练习  ││
│         │  │ Java│ 486 │███░ 87% │ 18│ 2小时前 ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌── Charts Grid (2 cols) ────────────────┐│
│         │  │ ┌─ 正确率 ──────┐ ┌─ 练习次数 ─────┐   ││
│         │  │ │  Bar Chart     │ │  Bar Chart      │  ││
│         │  │ │  各题库正确率   │ │  各题库练习次数 │  ││
│         │  │ └──────────────┘ └────────────────┘   ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Type Accuracy Card ───────────────────┐│
│         │  │ 题型正确率分布                           ││
│         │  │ 单选 ████████████░░ 88%                 ││
│         │  │ 多选 ██████████░░░░ 72%                 ││
│         │  │ 判断 █████████████░ 91%                 ││
│         │  │ 填空 ███████████░░░ 76%                 ││
│         │  │ 简答 ██████████░░░░ 65%                 ││
│         │  └──────────────────────────────────────────┘│
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Overview Grid | `n-grid` :cols=4 | 统计概览卡片 |
| Overview Card | 自定义 card | icon + label + value + trend |
| Stat Icon | 自定义 | brand/success/warning/error 配色 |
| Trend Indicator | 自定义 | up(success)/down(error) + 百分比 |
| Bank Table | `n-data-table` 或自定义 | 题库统计表 |
| Bank Icon SM | 自定义 | 题库图标 |
| Progress Cell | `n-progress` + text | 正确率进度条 |
| Export Button | `n-button` quaternary size=small | 导出统计数据 |
| Charts Grid | `n-grid` :cols=2 | 图表区域 |
| Bar Chart | 自定义 CSS bar-chart | 各题库正确率/练习次数 |
| Type Accuracy Card | `n-card` | 题型正确率 |
| Type Accuracy Row | 自定义 flex | label + bar + value |
| Type Accuracy Bar | `n-progress` 或自定义 | success/warning/error 填充 |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getStatisticsOverview()` | `api/statistics.ts` | `GET /statistics/overview` | 概览数据 |
| `getQuestionAccuracy(params)` | `api/statistics.ts` | `GET /statistics/question-accuracy` | 题型正确率 |
| `getPaperStatistics(paperId)` | `api/statistics.ts` | `GET /statistics/papers/:paperId` | 试卷统计 |

### 交互逻辑

1. **初始化**: `onMounted` -> 并行调用 `getStatisticsOverview()` + `getQuestionAccuracy()`
2. **导出**: 点击导出按钮 -> 下载统计数据
3. **Bar Chart Hover**: 柱状图 hover 高亮效果
4. **题库表**: 可点击行跳转题库详情

### 响应式适配

- **Desktop**: Overview 4 列，Charts 2 列，表格全列
- **Tablet**: Overview 2 列，Charts 1 列
- **Mobile**: Overview 2 列或 1 列，Charts 单列堆叠，表格横向滚动

---

## 10. 错题本

- **路由**: `/wrong-questions`
- **Vue 文件**: `src/views/wrongquestion/WrongQuestionList.vue`
- **Mockup**: `mockups/10-wrong-questions.html`
- **布局**: Sidebar + Header
- **权限**: requiresAuth

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 错题本)                   │
│         ├────────────────────────────────────────────┤
│         │  错题本(2xl)                  [错题重做 btn]   │
│         │                                               │
│         │  ┌─ Summary Bar (4 cols) ───────────────────┐│
│         │  │ ✕错题47 │ ⚠待重做32 │ ✓已掌握15 │ ↑本周8││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Filter Bar ────────────────────────────┐│
│         │  │ [题库 Select][标签 Select] │ [全部][单选]││
│         │  │ [多选][判断][填空][简答] │ [最近做错▾]  ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Wrong Question List ───────────────────┐│
│         │  │ ┌── WQ Card ──────────────────────────┐││
│         │  │ │[1]│[单选][简单]│ 题干内容...  │错3次│││
│         │  │ │   │           │ 📚Java  🏷基础概念│日期│││
│         │  │ │   │           │              [详情][移除]││
│         │  │ └────────────────────────────────────┘││
│         │  │ ┌── WQ Card ──────────────────────────┐││
│         │  │ │ ...                                │││
│         │  │ └────────────────────────────────────┘││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  [共47条，每页10条]  [< 1 2 3 4 5 >]         │
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Rer Practice Button | `n-button` type=primary | 错题重做 |
| Summary Grid | `n-grid` :cols=4 | 汇总统计 |
| Summary Item | 自定义 card | icon + label + value |
| Filter Bar | 自定义 flex | 筛选栏 |
| Bank Select | `n-select` | 题库筛选 |
| Tag Select | `n-select` | 标签筛选 |
| Type Tabs | 自定义 type-tabs | 题型筛选 |
| Sort Select | `n-select` | 最近做错/错误次数最多 |
| WQ List | 自定义 flex column | 错题列表 |
| WQ Card | 自定义 card | 错题条目 |
| WQ Num | 自定义 | 序号方块（error 背景） |
| Type/Difficulty Tag | `n-tag` | 题型+难度 |
| WQ Content | 自定义 | 题干文本（ellipsis） |
| WQ Meta | 自定义 flex | 题库 + 标签 |
| Error Count Badge | `n-tag` error | "错 N 次" |
| Action Buttons | `n-button` text | 查看详情/移除 |
| Pagination | `n-pagination` 或自定义 | |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `list(params)` | `api/wrongQuestion.ts` | `GET /wrong-questions` | page, size, bankId, tagId, sortBy |
| `deleteWrongQuestion(id)` | `api/wrongQuestion.ts` | `DELETE /wrong-questions/:id` | 移除错题 |
| `getWrongQuestionById(id)` | `api/wrongQuestion.ts` | `GET /wrong-questions/:id` | 查看详情 |
| `createPractice(data)` | `api/practice.ts` | `POST /practice/sessions` | 错题重做 |

### 交互逻辑

1. **筛选**: 题库/标签/题型/排序任一变化 -> 重置页码 -> 刷新列表
2. **查看详情**: 跳转 `/wrong-questions/snapshot/:id` 或弹窗显示
3. **移除**: 弹确认 dialog -> `deleteWrongQuestion(id)` -> 刷新列表
4. **错题重做**: 点击按钮 -> `createPractice({ priorWrong: true, ... })` -> 跳转练习页
5. **分页**: 切换页码 -> 刷新列表

### 响应式适配

- **Desktop**: Summary 4 列，WQ Card 横向布局
- **Tablet**: Summary 2 列，WQ Card 简化
- **Mobile**: Summary 2 列，WQ Card 改为竖向堆叠，meta 换行

---

## 11. 做题记录

- **路由**: `/records`
- **Vue 文件**: `src/views/record/RecordList.vue`
- **Mockup**: `mockups/11-records.html`
- **布局**: Sidebar + Header
- **权限**: requiresAuth

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 做题记录)                │
│         ├────────────────────────────────────────────┤
│         │  做题记录(2xl)                                │
│         │                                               │
│         │  ┌─ Filter Bar ────────────────────────────┐│
│         │  │ [时间 Select]│[全部][练习][考试]│[题库Sel]││
│         │  │ [🔍 搜索题目内容]                       ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Summary Grid (3 cols) ─────────────────┐│
│         │  │ 📋总记录1536 │ 🎮练习1408 │ 📄考试128   ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Records Table ─────────────────────────┐│
│         │  │时间│类型│题干│题型│你的答案│正确答案│结果│得分│操作││
│         │  │09-03│练习│...│单选│ B   │ B   │正确│+2 │详情││
│         │  │09-03│练习│...│多选│B,C  │B,D  │错误│ 0 │详情││
│         │  │09-03│考试│...│判断│正确 │正确 │正确│+2 │详情││
│         │  │09-02│考试│...│简答│已提交│  —  │待批│ — │详情││
│         │  └──────────────────────────────────────────┘│
│         │  [共1536条]  [< 1 2 3 4 ... 154 >]           │
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Filter Bar | 自定义 flex | 筛选栏 |
| Time Select | `n-select` | 全部时间/今天/本周/本月 |
| Type Tabs | 自定义 type-tabs | 全部/练习/考试 |
| Bank Select | `n-select` | 题库筛选 |
| Search Input | `n-input` + prefix | 搜索题目内容 |
| Summary Grid | `n-grid` :cols=3 | 汇总卡片 |
| Summary Card | 自定义 card | icon + label + value |
| Records Table | `n-data-table` remote | 记录列表 |
| Time Cell | 自定义 | 时间格式化 |
| Summary Cell | 自定义 | 题干摘要（ellipsis） |
| Answer Cell | 自定义 mono font | 答案展示 |
| Result Tag | `n-tag` | 正确(success)/错误(error)/待批改(warning) |
| Score Cell | 自定义 | 得分，颜色区分 |
| Action Link | `n-button` text type=primary | 查看详情 |
| Pagination | `n-pagination` 或自定义 | |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getRecordList(params)` | `api/record.ts` | `GET /practice-records` | page, size, bankId, type, startDate, endDate |
| `list(params)` | `api/record.ts` | `GET /records` | 备用 |
| `getById(id)` | `api/record.ts` | `GET /records/:id` | 记录详情 |

### 交互逻辑

1. **筛选**: 时间/类型/题库任一变化 -> 重置页码 -> 刷新
2. **搜索**: 输入关键词 -> debounce -> 刷新
3. **查看详情**: 点击行内"查看详情" -> 跳转记录详情或弹窗
4. **分页**: 切换页码 -> 刷新

### 响应式适配

- **Desktop**: 完整 9 列表格
- **Tablet**: 隐藏部分列（题型、正确答案）
- **Mobile**: 表格转为卡片列表，筛选栏折叠

---

## 12. 搜索

- **路由**: `/search`
- **Vue 文件**: `src/views/search/SearchPage.vue`
- **Mockup**: `mockups/12-search.html`
- **布局**: Sidebar + Header
- **权限**: public

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 搜索)                   │
│         ├────────────────────────────────────────────┤
│         │  ┌─ Search Hero ──────────────────────────┐│
│         │  │     [🔍 Java_____________] [搜索]       ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Category Tabs ─────────────────────────┐│
│         │  │ [全部 10] [题库 3] [题目 5] [试卷 2]      ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Result: 题库 (3 results) ──────────────┐│
│         │  │ 📚 题库                      查看更多 → ││
│         │  │ ──────────────────────────────────────  ││
│         │  │ [icon] 官方Java题库 [官方]               ││
│         │  │        涵盖 Java 基础语法...             ││
│         │  │        📄1245题 🔄8932次 ⭐4.8评分      ││
│         │  │ [icon] Java高级特性                      ││
│         │  │        ...                              ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Result: 题目 (5 results) ──────────────┐│
│         │  │ 📝 题目                      查看更多 → ││
│         │  │ [icon] Java 中以下哪个关键字...          ││
│         │  │        [单选][简单] 来源:官方Java题库   ││
│         │  │ [icon] 关于 Java 集合框架...            ││
│         │  │        [多选][困难] 来源:Java高级特性   ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Result: 试卷 (2 results) ──────────────┐│
│         │  │ 📄 试卷                      查看更多 → ││
│         │  │ [icon] Java基础测试卷 [已发布]           ││
│         │  │        覆盖 Java 基础语法...             ││
│         │  │        📄50题 🏆100分 ⏱90分钟           ││
│         │  └──────────────────────────────────────────┘│
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Search Hero | `n-card` | 搜索英雄区 |
| Search Input Box | `n-input` + prefix | 圆角边框，brand 边色 |
| Search Button | `n-button` type=primary size=large | 圆角 |
| Category Tabs | 自定义 cat-tab | 全部/题库/题目/试卷，带计数 |
| Result Section | 自定义 | 分类型结果区域 |
| Result Section Header | `n-card` header | icon + 标题 + 计数 + 查看更多 |
| Search Item | 自定义 flex | 搜索结果条目 |
| Search Item Icon | 自定义 | 类型图标 |
| Search Item Title | 自定义 | 标题 + 关键词高亮 |
| Search Item Desc | 自定义 | 描述，line-clamp-2 |
| Search Item Meta | 自定义 flex | 统计信息 |
| Keyword Highlight | 自定义 span | brand 颜色高亮 |
| See More Link | `n-button` text | 查看更多 |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `search(params)` | `api/search.ts` | `GET /search` | keyword, type, page, size |

### 交互逻辑

1. **搜索提交**: 输入关键词 -> 回车或点击按钮 -> `search()` -> 展示结果
2. **分类切换**: 点击 category tab -> 按类型过滤或重新请求
3. **查看更多**: 点击"查看更多" -> 跳转对应列表页（题库/题目/试卷）
4. **点击结果项**: 跳转对应详情页
5. **关键词高亮**: 搜索结果中的关键词用 brand 颜色高亮显示
6. **空状态**: 无结果时显示 empty 提示

### 响应式适配

- **Desktop**: 结果区域全宽，搜索框 max-width 720px 居中
- **Tablet**: 同 Desktop，间距缩小
- **Mobile**: 搜索框全宽，结果条目改为竖向堆叠

---

## 13. 通知中心

- **路由**: `/notifications`
- **Vue 文件**: `src/views/notification/NotificationList.vue`
- **Mockup**: `mockups/13-notifications.html`
- **布局**: Sidebar + Header
- **权限**: requiresAuth

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 通知)                   │
│         ├────────────────────────────────────────────┤
│         │  通知中心(2xl)            [全部标为已读 btn]   │
│         │                                               │
│         │  ┌─ Filter Tabs ───────────────────────────┐│
│         │  │ [全部 5] [未读 3] [已读 12]              ││
│         │  └──────────────────────────────────────────┘│
│         │  ┌─ Type Chips ────────────────────────────┐│
│         │  │ [全部] [✏批改待办] [👤被指定批改人]       ││
│         │  │ [✓批改完成] [⚠批改超时] [👥协作邀请]      ││
│         │  │ [🛡审核结果] [🔄题库转让]                ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Notification List ────────────────────┐│
│         │  │ ┌── Notif Item (unread) ──────────────┐││
│         │  │ │ [✏icon] [批改待办] 张同学提交了...   │││
│         │  │ │         张同学完成了「Java基础测试卷」│││
│         │  │ │         ⏱ 5 分钟前              ●  │││
│         │  │ └────────────────────────────────────┘││
│         │  │ ┌── Notif Item (read) ───────────────┐││
│         │  │ │ [🛡icon] [审核结果] 题目已审核通过   │││
│         │  │ │         审核管理员已通过...          │││
│         │  │ │         ⏱ 2 天前                   │││
│         │  │ └────────────────────────────────────┘││
│         │  └──────────────────────────────────────────┘│
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Mark All Read Button | `n-button` quaternary size=small | 全部标为已读 |
| Filter Tabs | 自定义 filter-tabs | 全部/未读/已读，带计数 |
| Type Chips | 自定义 type-chip | 8 种通知类型筛选 |
| Notif List | 自定义 flex column | 通知列表 |
| Notif Item | 自定义 card | 通知条目，unread 高亮 |
| Notif Icon | 自定义 circle | 类型图标，按类型配色 |
| Notif Title | 自定义 | type-label tag + 标题文本 |
| Notif Content | 自定义 | 通知详情文本 |
| Notif Time | 自定义 | 相对时间显示 |
| Unread Dot | 自定义 | 未读小圆点 |

### 通知类型映射

| 类型 | 图标 | 配色 | Tag Type |
|------|------|------|----------|
| 批改待办 | pencil | warning | warning |
| 被指定为批改人 | person-add | info | info |
| 批改完成 | checkmark-circle | success | success |
| 批改超时 | alert-circle | error | error |
| 协作邀请 | people | info | info |
| 审核结果 | shield-checkmark | success | success |
| 题库转让 | swap-horizontal | info | info |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getNotifications(params)` | `api/notification.ts` | `GET /notifications` | page, pageSize, isRead |
| `markRead(id)` | `api/notification.ts` | `PUT /notifications/:id/read` | 标记单条已读 |
| `markAllRead()` | `api/notification.ts` | `PUT /notifications/read-all` | 全部标为已读 |
| `getUnreadCount()` | `api/notification.ts` | `GET /notifications/unread-count` | 未读计数 |
| `deleteNotification(id)` | `api/notification.ts` | `DELETE /notifications/:id` | 删除通知 |

### 交互逻辑

1. **筛选**: 切换全部/未读/已读 tab -> 刷新列表
2. **类型筛选**: 点击 type-chip -> 按类型过滤
3. **点击通知**: 标记已读 -> 根据通知类型跳转对应页面（批改待办->grading，批改完成->exam result）
4. **全部标为已读**: 点击按钮 -> `markAllRead()` -> 刷新列表 + 更新 header badge
5. **滚动加载**: 或分页加载更多通知

### 响应式适配

- **Desktop**: 通知项横向布局（icon + body + dot）
- **Tablet**: 同 Desktop
- **Mobile**: type-chips 横向滚动，通知项内容自适应

---

## 14. 个人中心

- **路由**: `/profile`
- **Vue 文件**: `src/views/profile/Profile.vue`
- **Mockup**: `mockups/14-profile.html`
- **布局**: Sidebar + Header
- **权限**: requiresAuth

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 个人中心)                │
│         ├────────────────────────────────────────────┤
│         │  ┌─ Profile Header Card ──────────────────┐│
│         │  │  (brand gradient top banner)            ││
│         │  │  [Avatar 88px]  张同学 @zhangstudent    ││
│         │  │                  [普通用户] [编辑资料]   ││
│         │  │  计算机科学与技术 · 坚持每日刷题...      ││
│         │  │  ────────────────────────────────────  ││
│         │  │  加入时间│题库数│试卷数│练习次数         ││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌── Two Column Layout (3fr : 2fr) ────────┐│
│         │  │ ┌─ Left Col ─────────┐ ┌─ Right Col ──┐││
│         │  │ │                    │ │               │││
│         │  │ │ ┌─ 基本信息 ─────┐ │ │ ┌─ AI Key ─┐ │││
│         │  │ │ │ 昵称  [____]   │ │ │ │ [sk-****] │ │││
│         │  │ │ │ 用户名[readonly]│ │ │ │ [已配置]  │ │││
│         │  │ │ │ 邮箱  [____]   │ │ │ │ [更新][删除]│ │││
│         │  │ │ │      [保存修改]│ │ │ └──────────┘ │││
│         │  │ │ └────────────────┘ │ │               │││
│         │  │ │                    │ │ ┌─ 账号安全 ─┐ │││
│         │  │ │ ┌─ 修改密码 ─────┐ │ │ │ 账号状态   │ │││
│         │  │ │ │ 当前密码[____] │ │ │ │ 正常       │ │││
│         │  │ │ │ 新密码  [____]  │ │ │ │ 最近登录   │ │││
│         │  │ │ │ 确认密码[____]  │ │ │ │ 登录设备   │ │││
│         │  │ │ │      [修改密码]│ │ │ │ ─────────  │ │││
│         │  │ │ └────────────────┘ │ │ │ 危险操作    │ │││
│         │  │ │                    │ │ │ [退出][注销]│ │││
│         │  │ └────────────────────┘ └──────────────┘││
│         │  └──────────────────────────────────────────┘│
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Profile Header Card | 自定义 card | 带 brand gradient top |
| Profile Avatar | `n-avatar` size=88 | 圆形头像，brand gradient |
| Profile Name | 自定义 | 姓名 + @username + role tag |
| Edit Profile Button | `n-button` type=secondary | 编辑资料 |
| Profile Stats | `n-grid` :cols=4 | 加入时间/题库数/试卷数/练习次数 |
| Two Col Layout | `n-grid` :cols=5 (3:2) | 左右分栏 |
| Basic Info Card | `n-card` | 基本信息表单 |
| Input Group | `n-input` + label | 昵称/用户名/邮箱 |
| Readonly Input | `n-input` :readonly | 用户名不可修改 |
| Save Button | `n-button` type=primary | 保存修改 |
| Password Card | `n-card` | 修改密码表单 |
| Password Input | `n-input` type=password | 当前/新/确认密码 |
| Change Password Button | `n-button` type=secondary | 修改密码 |
| AI Key Card | `n-card` | AI Key 配置 |
| AI Key Input | `n-input` readonly mono | 显示已配置 key |
| Key Status Tag | `n-tag` success | 已配置 |
| Update/Delete Key Button | `n-button` | 更新/删除 key |
| Info Alert | `n-alert` type=info | 加密存储提示 |
| Security Card | `n-card` | 账号安全 |
| Security List | 自定义 | 账号状态/最近登录/登录设备 |
| Danger Actions | `n-button` group | 退出登录/注销账号 |
| Deactivate Button | `n-button` error | 注销账号 |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getProfile()` | `api/user.ts` | `GET /user/profile` | 获取用户资料 |
| `updateProfile(data)` | `api/user.ts` | `PUT /user/profile` | 更新昵称/邮箱/头像 |
| `changePassword(data)` | `api/user.ts` | `PUT /user/password` | 修改密码 |
| `deactivate()` | `api/user.ts` | `DELETE /user/account` | 注销账号 |
| `getAiKey()` | `api/user.ts` | `GET /user/ai-key` | 获取 AI Key |
| `setAiKey(data)` | `api/user.ts` | `PUT /user/ai-key` | 更新 AI Key |
| `deleteAiKey()` | `api/user.ts` | `DELETE /user/ai-key` | 删除 AI Key |

### 交互逻辑

1. **初始化**: `onMounted` -> `getProfile()` + `getAiKey()` 加载数据
2. **保存资料**: 校验 -> `updateProfile()` -> 成功提示
3. **修改密码**: 校验（新密码=确认密码）-> `changePassword()` -> 成功提示 + 清空表单
4. **更新 AI Key**: 弹窗输入新 key -> `setAiKey()` -> 刷新状态
5. **删除 AI Key**: 确认 dialog -> `deleteAiKey()` -> 刷新状态
6. **退出登录**: `authStore.logout()` -> 跳转登录页
7. **注销账号**: 双重确认 dialog -> `deactivate()` -> 跳转登录页

### 响应式适配

- **Desktop**: 两栏布局 3:2
- **Tablet**: 两栏布局改为 1:1 或单列
- **Mobile**: 单列堆叠，profile header 改为竖向布局

---

## 15. 用户管理

- **路由**: `/admin/users`
- **Vue 文件**: `src/views/admin/UserList.vue`
- **Mockup**: `mockups/15-admin-users.html`
- **布局**: Sidebar + Header
- **权限**: requiresAdmin

### 页面结构

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header (Breadcrumb: 管理 › 用户管理)          │
│         ├────────────────────────────────────────────┤
│         │  用户管理(2xl)           [新建管理员 btn]     │
│         │                                               │
│         │  ┌─ Stats Grid (4 cols) ───────────────────┐│
│         │  │ 👥总用户1256 │ 📈活跃1089 │ 🚫已禁用12 │🛡管理员5││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ Filter Bar ────────────────────────────┐│
│         │  │ [🔍 搜索用户名、昵称...] [角色 Select] [状态Sel]││
│         │  └──────────────────────────────────────────┘│
│         │                                               │
│         │  ┌─ User Table ─────────────────────────────┐│
│         │  │ 用户│昵称│角色│状态│题库│注册│最近登录│操作  ││
│         │  │ [A]admin│系统管理员│超管│正常│15│2024│09-03│编辑││
│         │  │  系统管理员            │重置密码        ││
│         │  │ [王]teacher│王老师│管理员│正常│8│..│..│编辑││
│         │  │                        │禁用│重置│删除  ││
│         │  │ [张]zhang│张同学│普通│正常│5│..│..│编辑││
│         │  │                      │禁用│重置│删除    ││
│         │  └──────────────────────────────────────────┘│
│         │  [共1256条]  [< 1 2 3 ... 126 >]            │
└─────────┴───────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| Create Admin Button | `n-button` type=primary | 新建管理员 |
| Stats Grid | `n-grid` :cols=4 | 统计卡片 |
| Stat Card | 自定义 card | icon + label + value |
| Filter Bar | 自定义 flex | 筛选栏 |
| Search Input | `n-input` + prefix | 搜索用户名、昵称 |
| Role Select | `n-select` | 全部/普通用户/管理员/超级管理员 |
| Status Select | `n-select` | 全部/正常/已禁用 |
| User Table | `n-data-table` remote | 用户列表 |
| User Cell | 自定义 | avatar + name + @id |
| Role Tag | `n-tag` | 超级管理员(warning+shield)/管理员(primary)/普通用户(default) |
| Status Tag | `n-tag` | 正常(success)/已禁用(error) |
| Action Buttons | `n-button` text | 编辑/禁用/启用/重置密码/删除 |
| Pagination | `n-pagination` 或自定义 | |

### 数据接口

| API 函数 | 文件 | 端点 | 参数 |
|---------|------|------|------|
| `getUserList(params)` | `api/admin.ts` | `GET /admin/users` | page, size, keyword, role, status |
| `getUserDetail(id)` | `api/admin.ts` | `GET /admin/users/:id` | 用户详情 |
| `updateUserStatus(id, status)` | `api/admin.ts` | `PUT /admin/users/:id/status` | 禁用/启用 |
| `deleteUser(id)` | `api/admin.ts` | `DELETE /admin/users/:id` | 删除用户 |
| `resetPassword(id)` | `api/admin.ts` | `PUT /admin/users/:id/password` | 重置密码 |
| `createAdmin(userId)` | `api/admin.ts` | `POST /admin/admins` | 创建管理员 |
| `removeAdmin(id)` | `api/admin.ts` | `DELETE /admin/admins/:id` | 移除管理员 |

### 交互逻辑

1. **搜索/筛选**: 搜索或切换角色/状态 -> 重置页码 -> 刷新
2. **编辑**: 跳转编辑弹窗或页面 -> 修改用户信息
3. **禁用/启用**: 确认 dialog -> `updateUserStatus(id, 'DISABLED'/'ACTIVE')` -> 刷新
4. **重置密码**: 确认 dialog -> `resetPassword(id)` -> 显示新密码
5. **删除**: 双重确认 dialog -> `deleteUser(id)` -> 刷新
6. **新建管理员**: 弹窗选择用户 -> `createAdmin(userId)` -> 刷新
7. **操作按钮动态显示**: 超级管理员不可禁用/删除；已禁用用户显示"启用"替代"禁用"

### 响应式适配

- **Desktop**: 完整 8 列表格
- **Tablet**: 隐藏注册时间列
- **Mobile**: 表格转为卡片列表，操作按钮改为下拉菜单

---

## 附录：通用组件复用映射

| Mockup 中的组件 | Naive UI 组件 | 全局复用页面 |
|----------------|--------------|-------------|
| Card | `n-card` | 全部页面 |
| Button (primary/secondary/ghost) | `n-button` type=primary/secondary/quaternary | 全部页面 |
| Tag (default/info/success/warning/error) | `n-tag` | 全部页面 |
| Input | `n-input` | 全部表单页 |
| Select | `n-select` | 全部筛选页 |
| Data Table | `n-data-table` | 03, 04, 09, 11, 15 |
| Pagination | `n-pagination` 或自定义 | 全部列表页 |
| Avatar | `n-avatar` | 01, 02, 05, 14, 15 |
| Badge | `n-badge` | Header 通知角标 |
| Breadcrumb | `n-breadcrumb` | Header 全局 |
| Dropdown | `n-dropdown` | Header 用户菜单 |
| Grid | `n-grid` + `n-grid-item` | 01, 09, 10, 14 |
| Empty | `n-empty` | 01, 12 |
| Alert | `n-alert` | 07, 14 |
| Progress | `n-progress` | 07, 09 |
| Statistic | `n-statistic` | 01 |
| List | `n-list` + `n-list-item` | 01 |
| Checkbox | `n-checkbox` | 00 |
| Tabs | `n-tabs` | 00, 08 |
| Dialog | `useDialog()` / `n-modal` | 02, 04, 10, 15 |
| Message | `useMessage()` | 全部页面 |

---

## 附录：API 文件索引

| API 文件 | 端点前缀 | 主要页面 |
|---------|---------|---------|
| `api/auth.ts` | `/auth` | 00 |
| `api/bank.ts` | `/banks` | 01, 02, 03 |
| `api/question.ts` | `/questions`, `/banks/:id/questions` | 03, 04 |
| `api/paper.ts` | `/papers` | 01, 05, 06 |
| `api/exam.ts` | `/sessions` | 06, 08 |
| `api/practice.ts` | `/practice/sessions` | 03, 07, 10 |
| `api/wrongQuestion.ts` | `/wrong-questions` | 10 |
| `api/statistics.ts` | `/statistics` | 01, 09 |
| `api/record.ts` | `/practice-records`, `/records` | 11 |
| `api/search.ts` | `/search` | 12 |
| `api/notification.ts` | `/notifications` | 13, Header |
| `api/user.ts` | `/user` | 14 |
| `api/admin.ts` | `/admin` | 15 |

---

*文档基于 mockups/ 目录 16 个 HTML 文件与 `src/` 源码编写，用于指导 Vue 组件重构。*
