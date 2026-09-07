# Quick Study 页面设计规格文档

> 本文档覆盖全部页面 / 弹窗 / 抽屉的布局结构、组件清单、数据接口、交互逻辑与响应式适配。
> 以 mockup HTML 与现有 Vue 源码（router/index.ts、各 views 文件、api/ 目录）为唯一事实源编写。
> 技术术语保留英文，正文使用中文。
> 维护说明：本文档随 design ↔ src 同步流程更新；代码与设计稿冲突时以代码为准。

---

## 目录

| 编号 | 页面名称 | 路由 | Mockup |
|------|---------|------|--------|
| 00 | 登录/注册 | `/login`、`/register` | mockups/00-login.html |
| 01 | 首页/Dashboard | `/` | mockups/01-home.html |
| 02 | 题库列表 | `/banks`（name: `BankList`） | mockups/02-bank-list.html |
| 03 | 题库详情 | `/banks/:id`（name: `BankDetail`） | mockups/03-bank-detail.html |
| 04 | 题目管理 | `/questions`（name: `QuestionManage`） | mockups/04-question-list.html |
| 04.1 | 题库内题目列表 | `/banks/:id/questions`（name: `QuestionList`） | mockups/04-question-list.html |
| 04.2 | 题目预览抽屉 | 无（抽屉，`QuestionPreviewDrawer`） | mockups/04-question-list.html |
| 05 | 试卷列表 | `/papers` | mockups/05-paper-list.html |
| 06 | 考试答题 | `/papers/:id/exam` | mockups/06-exam-page.html |
| 07 | 随机练习 | `/practice/sessions/:id`（路由名 `PracticePage`，`route.params.id` 为 sessionId） | mockups/07-practice-page.html |
| 08 | 考试结果 | `/exam/sessions/:id/result` | mockups/08-exam-result.html |
| 09 | 统计面板 | `/statistics`（路由名 `StatisticsPage`，MainLayout 子路由，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`） | mockups/09-statistics.html |
| 10 | 错题本 | `/wrong-questions`（路由名 `WrongQuestionList`，MainLayout 子路由，无 `meta` → `requiresAuth !== false`，需登录；无 `requiresAdmin`） | mockups/10-wrong-questions.html |
| 10b | 错题快照 | `/wrong-questions/snapshot/:id`（路由名 `WrongQuestionSnapshot`，MainLayout 子路由，无 `meta` → 需登录） | mockups/10-wrong-questions.html |
| 11 | 做题记录 | `/records`（路由名 `RecordList`，MainLayout 子路由，无 `meta` → `requiresAuth !== false`，需登录；无 `requiresAdmin`） | mockups/11-records.html |
| 12 | 搜索 | `/search`（路由名 `SearchPage`，`MainLayout` 子路由，`meta: { requiresAuth: false }`） | mockups/12-search.html |
| 13 | 通知中心 | `/notifications`（路由名 `NotificationList`，MainLayout 子路由，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`） | mockups/13-notifications.html |
| 14 | 个人中心 | `/profile`（路由名 `UserProfile`，MainLayout 子路由，`router/index.ts:187`，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`） | mockups/14-profile.html |
| 15 | 用户管理 | `/admin/users`（MainLayout 子路由，`meta: { requiresAdmin: true }` → 需登录且需管理员角色） | mockups/15-admin-users.html |
| 16 | 确认弹窗（全局 useConfirm） | - | mockups/16-confirm-dialog.html |
| 17 | 骨架屏（SkeletonList） | - | mockups/17-skeleton-loading.html |
| 18 | 收藏题目 | `/favorites`（路由名 `FavoritesPage`，MainLayout 子路由，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`） | mockups/18-favorites.html |
| 19 | 代码运行台 | `/playground` | mockups/19-playground.html |
| 20 | 考试记录 | `/exam-records` | mockups/20-exam-records.html |
| 21 | 待批改列表 | `/grading`（路由名 `GradingList`，`src/router/index.ts`；`/grading/sessions/:id` 为批改详情） | mockups/21-grading-list.html |
| 22 | 批改详情 | `/grading/:id`（列表卡片 `router.push('/grading/' + row.sessionId)`；PageHeader 返回 `router.back()`；完成批改 `router.push('/grading')`） | mockups/22-grading-detail.html |
| 23 | 创建练习弹窗 | /practice（弹窗，由 `PracticeCreateDialog` 组件以 `:show` 控制显隐；创建成功跳 `/practice/sessions/:id`） | mockups/23-practice-create-dialog.html |
| 24 | 练习记录列表 | `/practice`（路由名 `PracticeList`，置于 MainLayout 外壳；新建入口弹出 `PracticeCreateDialog` 弹窗，创建成功跳 `/practice/sessions/:id`） | mockups/24-practice-list.html |
| 25 | 试卷创建 / 编辑 | `/papers/create`、`/papers/:id/edit` | mockups/25-paper-form.html |
| 26 | 题目创建 / 编辑 | `/banks/:id/questions/create`（`QuestionCreate`）、`/banks/:id/questions/:qid/edit`（`QuestionEdit`） | mockups/26-question-create.html |
| 27 | 导入题库弹窗 | 无（弹窗，入口在 `/banks` 的「导入题库」按钮，需登录） | mockups/27-bank-import-dialog.html |
| 28 | 导入题目弹窗 | 无（弹窗，入口在 `/questions` 与 `/banks/:id/questions` 的「导入题目」按钮） | mockups/28-question-import-dialog.html |
| 29 | 标签管理弹窗 | 无（弹窗，入口在 `/questions` 的「标签管理」按钮） | mockups/29-tag-manage-modal.html |
| 30 | 试卷详情 | `/papers/:id` | mockups/30-paper-detail.html |
| 31 | 审核列表 | /admin/reviews | mockups/31-admin-reviews.html |


---

## 全局布局说明

### 布局类型

| 类型 | 说明 | 使用页面 |
|------|------|---------|
| **Sidebar + Header** | 左侧固定 Sidebar（240px，可收起 64px），顶部 Header（64px，sticky），主内容区自适应 | 绝大多数页面 |
| **Full-screen** | 全屏沉浸式布局，无 Sidebar（视代码实际而定） | 06 考试答题（若为全屏） |
| **Auth** | 全屏渐变背景 + 居中卡片，无导航 | 00 |

### 全局 Shell 结构（Sidebar + Header 布局）

```
┌──────────────────────────────────────────┐
│ Sidebar (240px) │ Header (64px)           │
│                 ├────────────────────────┤
│  - Logo QS      │ 当前页标题 · 搜索 · 通知·头像 │
│  - Nav (分组)    ├────────────────────────┤
│  - 退出登录      │                        │
│                 │   Main Content          │
│                 │   (max-width 内容区)     │
└─────────────────┴────────────────────────┘
```

### Sidebar 导航分组（以 src/layout/MainLayout.vue 为准）

| 分组 | 菜单项 | 可见性 |
|------|--------|--------|
| （无标题） | 首页、题库、题目、试卷 | 全部用户 |
| 学习中心 | 练习、代码运行台、错题本、收藏题目、做题记录、考试记录、统计、通知、搜索 | 登录用户；搜索未登录也可见 |
| 管理 | 用户管理、审核列表 | 管理员 |

> 注意：`/exam-records`、`/grading`、`/profile` 不在侧边栏菜单中；`/exam-records` 的顶栏标题会回退显示「首页」。

### Vue Layout 组件映射

| Layout | Vue 文件 | 说明 |
|--------|---------|------|
| MainLayout | `src/layout/MainLayout.vue` | 自定义 `.app-shell` + `.sidebar` + `.app-header` + `.app-content`（非 n-layout） |
| AuthLayout | `src/layout/AuthLayout.vue` | 全屏渐变背景 + 居中卡片 |

---


## 00. 登录/注册

- **路由**: `/login`、`/register`
- **Vue 文件**: `layout/AuthLayout.vue`（外壳 Tab）、`views/Login.vue`、`views/Register.vue`
- **Mockup**: `mockups/00-login.html`
- **布局**: Auth（全屏渐变背景 + 居中白卡）
- **权限**: 公开（游客可访问）

### 页面结构

```
auth-page（渐变背景）
└─ auth-card（白卡，max-width 420px）
   ├─ auth-logo（QS · 题库与组卷练习系统 · 快学 · 每一道题都算数）
   ├─ auth-tabs（登录 / 注册）  → 点击 router.push 切换 /login、/register
   └─ router-view
        ├─ /login   → Login.vue 表单
        └─ /register → Register.vue 表单
```

登录表单：
```
用户名
密码
验证码（captchaEnabled 为 true 时渲染）
[登录]
```
注册表单：
```
用户名（失焦校验用户名是否可用）
密码
确认密码
昵称
邮箱（可选）
验证码（captchaEnabled 为 true 时渲染）
[注册]
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 表单 | `n-form` / `n-form-item` | label-placement=top |
| 输入框 | `n-input` | 用户名/密码(maxlength 64,show-password-on=click)/确认密码/昵称/邮箱 |
| 验证码框 | `n-input` + 自定义占位框 | dashed 边框、等宽字体，显示 captchaPlaceholder（有图→ABCD，无图→已关闭），点击刷新 |
| 提交按钮 | `n-button` | type=primary、block、size=large，文案「登录」/「注册」，:loading |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/auth/login` | POST | 登录，返回 token 与 userInfo |
| `/auth/register` | POST | 注册新账号 |
| `/auth/captcha` | GET | 获取验证码（captchaEnabled 时） |
| `/auth/check-username` | GET | 注册时校验用户名是否已被占用 |

### 交互逻辑

- 顶部 Tab 点击通过 `router.push` 在 `/login` 与 `/register` 间切换路由。
- 登录：校验通过后调用 `authStore.login`，成功跳回 `redirect` 或 `/`；失败按错误码提示（10102 验证码错误、10103 账户已锁定、10104 用户名或密码错误）。
- 注册：校验两次密码一致、用户名失焦查重；成功后跳 `/`。
- 验证码仅在 `captchaEnabled` 时渲染，本地默认关闭，占位显示「已关闭」。

### 空态 / 加载态 / 错误态

- 加载态：登录/注册按钮 `:loading` 禁用并显示加载。
- 错误态：表单校验失败、验证码错误、用户名已存在/已被使用等均以 `message` 提示，并刷新验证码。
- 无独立空态（表单页）。

### 响应式

- `auth-card` 最大宽 420px、居中；窄屏 `padding` 自适应收缩。


## 01. 首页/Dashboard

- **路由**: `/`
- **Vue 文件**: `views/Home.vue` + `components/common/StatCard.vue`、`EmptyState.vue`、`SkeletonList.vue`
- **Mockup**: `mockups/01-home.html`
- **布局**: Main（侧边栏 + 顶栏 + 内容区）
- **权限**: 公开；游客态与登录态渲染不同内容

### 页面结构

```
欢迎横幅
  ├─ 游客：欢迎光临 / 登录后即可开始练习和考试
  └─ 登录：欢迎回来，{昵称} / 今天也要加油学习哦！
快速入口（游客 3 项 / 登录 5 项，点击跳对应路由）
── 游客态 ──
  公开题库（card-section，查看全部 → /banks）
      列表：名称 / 描述(无则「暂无描述」) / 「X 题」标签
  公开试卷（card-section，查看全部 → /papers）
      列表：标题 / 「X 题 · 总分 Y」 / 「查看」按钮
── 登录态 ──
  统计概览（4 张 StatCard：练习场次 / 总题数 / 正确率(绿) / 错题数(红)）
  最近活动（card-section，全部记录 → /records）
      列表：练习|考试 标签 + 标题 + 时间(MM-DD HH:mm) + 箭头
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 欢迎横幅 | `div.welcome-banner` | 品牌渐变背景 |
| 快速入口 | `div` 网格 | 图标卡片，点击 `router.push` 对应路径 |
| 统计卡片 | `StatCard` | label/value/tone，正确率 tone=success、错题数 tone=error |
| 空态 | `EmptyState` | 最近活动空态带「去练习」「去考试」操作 |
| 骨架 | `SkeletonList` | 公开题库/试卷加载时 `:count=3 :cols=1` |
| 题数标签 | `n-tag` type=info | 「X 题」 |
| 查看按钮 | `n-button` text type=primary | 试卷行内「查看」 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/statistics/overview` | GET | 登录态统计概览 |
| `/banks`(isPublic=true) | GET | 游客公开题库（取前 5） |
| `/papers`(shareType=PUBLIC,status=PUBLISHED) | GET | 游客公开试卷（取前 5） |
| `/practice/sessions`(status=COMPLETED) | GET | 最近练习活动 |
| `/exam/sessions`(mine) | GET | 最近考试活动（合并取前 6 条） |

### 交互逻辑

- 游客：展示公开题库/试卷与 3 项入口（题库浏览/试卷浏览/搜索）；点击跳 `/banks`、`/papers`、`/search`。
- 登录：展示统计概览与最近活动；活动为练习会话(仅 COMPLETED) + 考试会话(非 IN_PROGRESS) 按时间倒序合并取前 6 条，练习→`/practice`、考试→成绩页。
- 快速入口点击 `router.push` 到对应路径。

### 空态 / 加载态 / 错误态

- 加载态：公开题库/试卷使用 `SkeletonList(:count=3,:cols=1)`；活动加载期间保持空。
- 空态：公开题库「暂无公开题库」、公开试卷「暂无公开试卷」、最近活动「暂无活动记录」（带去练习/去考试引导）。
- 错误态：数据请求失败静默（catch 忽略），页面保持默认空/零值。

### 响应式

- 快速入口 `grid-cols-2` / `md:3` / `lg:5`；统计 `2` / `4` 列；公开题库/试卷列表窄屏单列。

## 02. 题库列表

- **路由**: `/banks`（name: `BankList`）
- **Vue 文件**: `views/bank/BankList.vue`；子组件 `BankCreateDialog.vue`、`components/importExport/BankImportDialog.vue`
- **Mockup**: `mockups/02-bank-list.html`
- **布局**: Sidebar + Header（侧边栏高亮「题库」，顶栏标题「题库」）
- **权限**: `meta.requiresAuth = false`，**游客可见**。未登录时不渲染「导入题库 / 创建题库」按钮，卡片底部操作行整体不渲染（isAdmin 与 isCreator 均为 false）；「导出」对创建者可见，「设为公开/设为私有」与「删除」仅管理员。

### 页面结构

```
PageHeader  题库 / 浏览、搜索并管理题库      [导入题库] [创建题库]
FilterBar   [搜索题库名称... 260px] [全部可见性 150px]
───────────────────────────────────────────────
题库卡片网格（1 / md:2 / xl:3 列，gap-4）
┌ 卡片 ─────────────────────────────┐
│ 名称（truncate）        官方|公开|私有 │
│ 描述（2 行截断，空→「暂无描述」）     │
│ 📄 N 题   🔁 N 练习                  │
│ [标签 chips]（有标签时）             │
│ ─────────────────────────────────  │
│ (头像) 创建者名 或 匿名用户   创建日期 │
│ 设为私有/设为公开  导出  删除         │ ← 管理员或创建者可见
└────────────────────────────────────┘
分页（右对齐，仅 itemCount > pageSize 时渲染）
── 弹窗 ──
创建题库：名称* / 描述 / 封面图 / 公开题库开关 → 取消 · 创建
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页头 | `PageHeader` | title=题库，subtitle=浏览、搜索并管理题库 |
| 筛选栏 | `FilterBar` + `n-input`、`n-select` | 关键词回车触发；可见性选项 公开(1)/私有(0)/官方(2) |
| 卡片网格 | `div.grid` | 白底 + 1px 边框 + 12px 圆角，hover 主色边框 + shadow-sm |
| 可见性标签 | `span.pill` | 官方 = warning、公开 = success、私有 = neutral |
| 统计 | `n-icon` + 文本 | `N 题`（DocumentTextOutline）、`N 练习`（RepeatOutline） |
| 标签 | `span.tag-chip` | 品牌浅底药丸 |
| 行内操作 | `a` 文本链接 | 设为私有/设为公开（管理员）、导出、删除（管理员，error 色） |
| 分页 | `n-pagination` | 无总数文案、无页大小选择器 |
| 骨架 | `SkeletonList` | `:count="6" :cols="3"` |
| 空态 | `EmptyState` | icon = LibraryOutline |
| 创建弹窗 | `n-modal`（preset=card，480px） | BankCreateDialog |
| 封面上传 | `FileUpload` → `n-upload` | 「选择文件」按钮，上传地址 `/api/v1/files/upload` |
| 导入弹窗 | `n-modal`（540px） | BankImportDialog，见第 08 节 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/banks` | GET | 分页查询题库（page/size/keyword/isPublic/isOfficial） |
| `/banks` | POST | 创建题库（name/description/coverUrl/isPublic） |
| `/banks/:id` | DELETE | 删除题库（管理员） |
| `/banks/:id/visibility?isPublic=` | PUT | 切换公开/私有（管理员） |
| `/banks/:id/export` | POST | 导出题库为 JSON（Blob 下载） |
| `/banks/import` | POST | 导入题库文件 |
| `/api/v1/files/upload` | POST | 封面图上传 |

### 交互逻辑

- 关键词回车、可见性下拉变更都会重置到第 1 页并重新拉取；搜索与筛选参数直接透传给列表接口（`isPublic: 1→true / 0→false`，`isOfficial: 2→true`）。
- 卡片点击 → `/banks/:id`；卡片内的操作链接使用 `@click.stop` 阻止冒泡。
- 切换可见性：`toggleVisibility(id, !isPublic)` → 成功提示「操作成功」并刷新。
- 删除：`confirmDanger`（标题「确认删除」，正文「确定要删除题库「{名称}」吗？该操作不可撤销。」，确认按钮「确定删除」）→ `deleteBank` →「删除成功」。
- 导出：先提示「正在生成导出文件…」，下载文件名 `{题库名}_{时间戳}.json`。
- 创建题库成功 / 导入成功后均刷新列表（导入回调 `handleBankImported`）。

### 空态 / 加载态 / 错误态

- 加载态：`SkeletonList(:count=6, :cols=3)` 骨架卡片网格。
- 空态：`EmptyState`「暂无题库 / 没有找到匹配的题库，换个关键词试试」。
- 错误态：列表请求失败 `message.error('加载题库列表失败')`；删除失败「删除失败」；导出失败取后端 message。

### 响应式

- 卡片网格 `grid-cols-1 → md:2 → xl:3`；筛选栏 `flex-wrap`，窄屏换行；分页右对齐。


## 03. 题库详情

- **路由**: `/banks/:id`（name: `BankDetail`）
- **Vue 文件**: `views/bank/BankDetail.vue`；内嵌 `views/question/QuestionList.vue`
- **Mockup**: `mockups/03-bank-detail.html`
- **布局**: Sidebar + Header（`/banks/:id` 命中 `/banks` → 侧边栏高亮「题库」，顶栏标题「题库」）
- **权限**: `meta.requiresAuth = false`，**游客可见**。页头「导出题库」需登录；「编辑」「转让」仅管理员；「协作人」统计卡与其管理弹窗仅管理员或题库创建者可见（其他用户不发协作人请求）。

### 页面结构

```
PageHeader  ← 返回   题库名称 / 题库描述        [导出题库][编辑][转让]
元信息卡
  [官方][公开|私有]（round tag）
  描述（空→「暂无描述」）
  👤 创建者：XXX     🕒 更新于 YYYY-MM-DD HH:mm
统计卡（2 / lg:4 列）
  题目数(品牌色) | 练习次数 | 协作人 N + [管理] | 创建时间 YYYY-MM-DD
题目列表区块（section-card）
  ┌ 题目列表 ──────────────────────────────┐
  │ QuestionList.vue（筛选 + 批量条 + 列表 + 分页）│
  └────────────────────────────────────────┘
── 弹窗 ──
协作人管理（460px）｜转让题库（400px）｜编辑题库（480px）
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页头 | `PageHeader`（`showBack`） | title = 题库名，subtitle = 描述，返回 = `router.back()` |
| 可见性标签 | `n-tag`（size=small, round） | 官方 = warning；公开 = success / 私有 = default |
| 元信息 | `n-icon` + 文本 | PersonOutline「创建者：」、TimeOutline「更新于 」 |
| 统计卡 | `StatCard` | 题目数 `tone="brand"`、练习次数、协作人（内含「管理」按钮）、创建时间 |
| 题目列表 | `QuestionList`（props: bankId、bankName） | 组件本身无 PageHeader，见第 05 节 |
| 协作人弹窗 | `n-modal`（460px） | 头像 + 昵称/用户 #id + 角色标签 + 移除；底部「添加协作人（用户ID）」+ 添加 |
| 转让弹窗 | `n-modal`（400px） | 「目标用户ID」输入 + 确认转让 |
| 编辑弹窗 | `n-modal`（480px） | 名称*（≤100）、描述（≤500）、取消 / 保存 |
| 加载 | `n-spin` | 覆盖详情内容 |
| 错误 | `LoadError` | `n-result` status=error，标题「加载失败」 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/banks/:id` | GET | 题库详情（`isOfficial` / `creatorName` / `practiceCount` 由 BankResponse 提供） |
| `/banks/:id/collaborators` | GET | 协作人列表（创建者/管理员才有权限） |
| `/banks/:id/collaborators` | POST | 添加协作人（body: userId） |
| `/banks/:id/collaborators/:userId` | DELETE | 移除协作人 |
| `/banks/:id/transfer` | POST | 转让题库（body: targetUserId） |
| `/banks/:id` | PUT | 编辑题库（name / description） |
| `/banks/:id/export` | POST | 导出题库 JSON |

### 交互逻辑

- 挂载时拉取详情；仅当 `canManageCollaborators`（管理员或 `creatorId === 当前用户`）为真时才拉取协作人列表。
- 点「管理」打开协作人弹窗并重新拉取列表；角色标签：EDITOR=编辑者(info)、REVIEWER=审阅者(warning)、VIEWER=查看者(default)。
- 添加/移除协作人成功后刷新列表；未填用户 ID 时 `message.warning('请输入用户ID')`。
- 转让：未填 ID 提示「请输入目标用户ID」；成功后「转让成功」并关闭弹窗（不刷新详情）。
- 编辑：打开时回填当前名称/描述；校验规则「请输入题库名称」「名称不超过100字符」；保存成功提示「保存成功」并重新拉取详情。
- 导出题库：Blob 下载 `{题库名}_{时间戳}.json`。
- 题目列表导入成功后通过 `@imported` 回调刷新题库统计。

### 空态 / 加载态 / 错误态

- 加载态：`n-spin` 包裹整个详情内容（首屏列表为空时骨架由内部 QuestionList 提供）。
- 空态：协作人列表为空显示「暂无协作人」。
- 错误态：`loadError` 非空时渲染 `LoadError`，description 取 `err.response.data.message / err.message / '加载题库详情失败'`，底部「重试 / 返回上一页」。

### 响应式

- 统计卡 `grid-cols-2 → lg:4`；元信息行 `flex-wrap`；题目列表区块 always 单列。


## 04. 题目管理

- **路由**: `/questions`（name: `QuestionManage`）
- **Vue 文件**: `views/question/QuestionManage.vue`
- **Mockup**: `mockups/04-question-list.html`（形态一）
- **布局**: Sidebar + Header（侧边栏高亮「题目」，顶栏标题「题目」）
- **权限**: `meta.requiresAuth = false`，**游客可见**。「标签管理」「导入题目」「编辑」「删除」仅管理员；「创建题目」按钮 `disabled`（点击提示「请先在题库详情页中创建题目」）；「批量导出」需登录。

### 页面结构

```
PageHeader  题目 / 跨题库管理所有题目，支持按题型、难度、标签筛选
            [标签管理] [创建题目(disabled)]
筛选卡（白卡 px-5 py-4）
  [所属题库 180][题型 120][难度 100][状态 100][标签（可多选）200][搜索题干... 200]
  [批量导出|导出选中(N)] [导入题目] [搜索] [重置]
批量操作条  ☐ 全选本页   已选 N 题   未勾选时「批量导出」将导出当前筛选条件下的全部题目
题目列表（白卡 + divide-y）
  ☐ #001  题干（单行截断，点击进详情）
        [单选题][简单][已发布] 题库名 [标签 chips]
                          2026-08-15  [查看][编辑][删除]
分页（右对齐） [10/20/50/100 条/页] 共 N 道
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页头 | `PageHeader` | 创建题目按钮 `disabled` |
| 筛选 | `n-select` ×5 + `n-input` | 题库 / 题型 / 难度 / 状态 / 标签(多选) / 关键词；标签选项由 `buildGroupedTagOptions` 分组 |
| 操作按钮 | `n-button` | 批量导出（文案随勾选数变化）、导入题目（管理员）、搜索、重置 |
| 批量条 | `n-checkbox` + 文本 | 全选本页（仅当前页范围） |
| 题干 | `RichText` | `.question-stem-ellipsis` 单行截断，DOMPurify + KaTeX |
| 标签 | `n-tag`（round） | 题型：SINGLE=info/MULTIPLE=warning/TRUE_FALSE=success/FILL_BLANK=default/SHORT_ANSWER=primary；难度：EASY=success/MEDIUM=warning/HARD=error；状态：DRAFT=default/PENDING_REVIEW=warning/PUBLISHED=success |
| 标签 chips | `span.tag-chip` | 品牌浅底 |
| 分页 | `n-pagination`（`show-size-picker`） | pageSizes [10,20,50,100]，右侧「共 N 道」 |
| 导入弹窗 | `QuestionImportDialog` | 未传 bankId → 弹窗内选择题库 |
| 标签管理 | `TagManageModal` | 见第 10 节 |
| 骨架 / 空态 | `SkeletonList(:count=6,:cols=1)` / `EmptyState` | icon = DocumentTextOutline |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/questions` | GET | 跨题库分页查询（bankId/type/difficulty/status/tagIds/keyword） |
| `/banks` | GET | 题库下拉（page=1,size=1000） |
| `/tags` | GET | 标签下拉（分组） |
| `/questions/export` | POST | 按 questionIds 或筛选条件导出 JSON |
| `/banks/:bankId/questions/import` | POST | 导入题目到选中题库（QuestionImportDialog 内部指定 bankId） |
| `/banks/:bankId/questions/:questionId` | DELETE | 删除题目 |
| `/banks/:bankId/questions/:questionId` | — | 查看/编辑跳转路由 |

### 交互逻辑

- 任一筛选控件变更即触发查询；「搜索」按钮同样触发，「重置」清空全部筛选并回到第 1 页。
- 翻页 / 改页大小 / 搜索都会清空勾选（`selectedIds = []`）。
- 批量导出：未勾选且无任何筛选条件时 `message.warning('请先勾选题目，或设置筛选条件（如选择题库）后再批量导出')`；否则按勾选 ID 导出或按筛选条件导出，文件名 `题目导出_{时间戳}.json`。
- 题干点击 → `/banks/{bankId}/questions/{id}`；编辑 → `/banks/{bankId}/questions/{id}/edit`。
- 删除：`confirmDanger`（「确定要删除该题目吗？题干：{去 HTML 后 30 字}...」）→ `deleteQuestion`。

### 空态 / 加载态 / 错误态

- 加载态：`SkeletonList(:count=6, :cols=1)`。
- 空态：「暂无题目 / 当前筛选条件下没有题目，试试调整筛选条件」。
- 错误态：加载失败 `message.error('加载题目列表失败')`；导出失败取后端 message；题库/标签下拉失败静默忽略。

### 响应式

- 筛选行 `flex-wrap`，操作组 `ml-auto` 右对齐；窄屏题干单行截断，操作列不换行。

### 04.1 题库内题目列表（/banks/:id/questions）

- **路由**: `/banks/:id/questions`（name: `QuestionList`）；同时作为组件内嵌于题库详情页「题目列表」区块
- **Vue 文件**: `views/question/QuestionList.vue`
- **Mockup**: `mockups/04-question-list.html`（形态二）、`mockups/03-bank-detail.html`（内嵌形态）
- **布局**: Sidebar + Header（`/banks/:id/questions` 命中 `/banks` → 侧边栏高亮「题库」，顶栏标题「题库」）
- **权限**: `meta.requiresAuth = false`，**游客可见**。「导入题目」「创建题目」「编辑」「删除」仅管理员；「导出题目」需登录且有数据时才渲染。

### 页面结构

```
FilterBar  [搜索题干... 220][题型 120][难度 100][状态 100][标签（可多选）200]
           [导出题目|导出选中(N)][导入题目][创建题目]
批量操作条  ☐ 全选本页   已选 N 题   （未勾选提示 / 已勾选「仅导出勾选的题目」）
题目列表（白卡 + divide-y，无「所属题库」列）
  ☐ #001  题干（单行截断） [题型][难度][状态] [标签 chips]
                     日期  [查看][编辑][删除]
分页（右对齐；无页大小选择器、无总数文案）
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 筛选栏 | `FilterBar` + `n-input`、`n-select` ×4 | 无「所属题库」筛选项（题库由 props 决定） |
| 导出按钮 | `n-button` | 文案 `导出选中（N）` / `导出题目`，导出中 disabled |
| 批量条 | `n-checkbox` + 文本 | 与 QuestionManage 一致，提示文案为「未勾选时「导出题目」将导出当前筛选条件下的全部题目」 |
| 题号 | `span.font-mono` | `#` + 3 位序号（跨页连续） |
| 题干 | `RichText` | 单行截断 |
| 标签 | `n-tag`（round）×3 + `span.tag-chip` | 同第 04 节枚举 |
| 分页 | `n-pagination` | 仅 `itemCount > pageSize` 时渲染 |
| 导入弹窗 | `QuestionImportDialog`（`:bank-id` `:bank-name`） | 目标题库固定，弹窗内不再选择题库 |
| 骨架 / 空态 | `SkeletonList(:count=5,:cols=1)` / `EmptyState` | 空态文案「当前筛选条件下没有题目」 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/banks/:bankId/questions` | GET | 题库内题目分页（type/difficulty/status/tagIds/keyword） |
| `/tags` | GET | 标签下拉（此处不做分组，直接 label/value） |
| `/questions/export` | POST | 导出（勾选 ID 或当前筛选条件） |
| `/banks/:id/questions/import` | POST | 导入题目到当前题库 |
| `/banks/:bankId/questions/:questionId` | DELETE | 删除题目 |

### 交互逻辑

- 导出按钮仅在 `isAuthenticated && questionList.length > 0` 时渲染；无勾选时按当前筛选条件导出全部。
- 创建题目 → `/banks/:bankId/questions/create`；查看 → `/banks/:bankId/questions/:id`。
- 导入成功后 `handleImportDone` 刷新列表并向父级 emit `imported`（题库详情页据此刷新题目数统计）。
- 其余勾选/翻页/删除逻辑与第 04 节一致。

### 空态 / 加载态 / 错误态

- 加载态：`SkeletonList(:count=5, :cols=1)`。
- 空态：「暂无题目 / 当前筛选条件下没有题目」。
- 错误态：加载失败 `message.error('加载题目列表失败')`；标签下拉失败静默忽略。

### 响应式

- 筛选栏 `flex-wrap`；列表项操作列右对齐、不换行；窄屏题干单行截断。


### 04.2 题目预览抽屉

- **路由**: 无（组件，供题目选择 / 组卷回填等场景复用）
- **Vue 文件**: `components/common/QuestionPreviewDrawer.vue`
- **Mockup**: `mockups/04-question-list.html`（底部抽屉区块）
- **布局**: `n-drawer`（width 520px，右侧滑出，`n-drawer-content` closable）
- **权限**: 无独立权限；传入项缺答案时内部调用 `/questions/:id` 补全，详情不可见时按已有字段降级展示。

### 页面结构

```
题目预览 #{id}                                       ×
[单选题][简单]                        题库名
题干      富文本（中性灰底）
选项      A/B/C/D … 正确项绿色高亮（仅单选/多选）
正确答案  判断题→「正确」/「错误」标签；其它→绿色底富文本
参考答案（有则展示）
解析（有则展示，warning 浅底）
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 抽屉 | `n-drawer` + `n-drawer-content` | 标题 `题目预览 #{id}`，无数据时标题为「题目预览」 |
| 标签 | `n-tag`（round） | 仅题型 + 难度（无状态标签） |
| 富文本 | `RichText` | 与题目详情一致 |
| 加载 | `n-spin` | 仅在需要补全详情时触发 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/questions/:id` | GET | 传入项 `answer` 为 null（组卷回填场景）时补全详情 |

### 交互逻辑

- 监听 `question` prop：先浅拷贝展示；若 `answer == null` 则拉取详情合并（`{...q, ...res.data}`）。
- 选项解析与正确项判定逻辑与 QuestionDetail 一致。

### 空态 / 加载态 / 错误态

- 加载态：`n-spin`（`fetching`）。
- 空态：`detail` 为空时仅显示头部。
- 错误态：详情拉取失败静默，按已有字段展示。

### 响应式

- 宽 520px 固定；内容纵向滚动。

## 05. 试卷列表

- **路由**: `/papers`
- **Vue 文件**: `src/views/paper/PaperList.vue`
- **Mockup**: `mockups/05-paper-list.html`
- **布局**: Sidebar + Header
- **权限**: `requiresAuth: false`（游客可浏览）

### 页面结构

```
PageHeader[试卷 | 创建试卷(仅管理员)]
FilterBar[搜索标题 / 分享类型(全部·私有·链接·密码·公开) / 状态(全部·草稿·已发布·已关闭)]
试卷卡片网格 (xl: 2 列)
  ┌─ 卡片 ────────────────┐
  │ 标题 ............ [状态] │
  │ 描述(2 行截断)          │
  │ 题目数 | 总分 | 时限    │
  │ 头像 创建者      日期   │
  │ [开始考试?][查看详情]   │
  │ [编辑?][发布?][删除?] [分享类型] │
  └────────────────────────┘
n-pagination (itemCount > pageSize 时)
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| PageHeader | 自定义 | 标题「试卷」+ 副标题，actions 仅管理员显示「创建试卷」 |
| FilterBar | 自定义 | 搜索框 + 两个 n-select 筛选 |
| 卡片 | 原生 div + section-card | 每张试卷一个卡片 |
| SkeletonList | 自定义 | `loading` 时占位（count=4, cols=2） |
| EmptyState | 自定义 | `paperList.length === 0` |
| n-pagination | Naive UI | 仅 `itemCount > pageSize` 时渲染 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getPaperList` | GET `/papers` | 分页+关键词+shareType+status 拉取列表 |
| `deletePaper` | DELETE `/papers/:id` | 删除（confirmDanger 二次确认） |
| `publishPaper` | POST `/papers/:id/publish` | 发布草稿/已关闭试卷 |

### 交互逻辑

- 搜索框回车、筛选 select 变更均触发 `handleSearch`（重置到第 1 页）。
- 分页改变 `handlePageChange`。
- 卡片按钮可见性：状态 `PUBLISHED` 且已登录 → 显示「开始考试」；管理员始终可见「编辑」，非 `PUBLISHED` 额外显示「发布」，管理员可见「删除」。
- 分享类型用 `shareTypeLabels`：PRIVATE 私有 / LINK 链接 / PASSWORD 密码 / PUBLIC 公开。
- 状态用 `PAPER_STATUS_MAP`：DRAFT 草稿 / PUBLISHED 已发布 / CLOSED 已关闭。

### 空态 / 加载态 / 错误态

- 加载：`SkeletonList` 骨架（4 张）。
- 空：`EmptyState` 标题「暂无试卷」。
- 错误：`message.error('加载试卷列表失败')`（无独立错误页）。

### 响应式

- 卡片网格 `xl:grid-cols-2`，低于 xl 为单列。
- 统计行 `flex` 内联，窄屏自动换行。

---


## 06. 考试答题

- **路由**: `/papers/:id/exam`
- **Vue 文件**: `src/views/exam/ExamPage.vue`
- **Mockup**: `mockups/06-exam-page.html`
- **布局**: Full-screen（无侧边栏，全屏沉浸式；`min-h-screen bg-neutral-100`）
- **权限**: 路由无 meta，`requiresAuth` 默认 true；且「开始考试」要求 `authStore.isAuthenticated`

### 页面结构

```
sticky 顶部条
  [试卷标题]  已答 X / Y 题   [MM:SS 倒计时]  [交卷]
max-w-content 双栏 (lg 以上)
  ┌─ 左: 题目导航 (hidden lg:block) ─┐  ┌─ 右: 答题主区 ──────────┐
  │ 题目导航                          │  │ 第 N 题 / 共 M 题        │
  │ [1][2][3]...[20] 状态网格        │  │ [题型][难度][标记待检查] │
  │ 图例: 当前/已答/未答/待检查       │  │ 题干(RichText)           │
  │ 汇总 已答/未答                    │  │ 作答区(选项/判断/填空/简答)│
  └──────────────────────────────────┘  │ [上一题][下一题/完成作答] │
                                         └──────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| QuestionNavGrid | 自定义 | 题号状态网格：current/answered/review/未答 |
| QuestionOption | 自定义 | 客观题选项（marker A/B/C/D、√/×） |
| RichText | 自定义 | 题干/选项富文本（DOMPurify + KaTeX） |
| MarkdownEditor | 自定义 | 简答题作答（仅 SHORT_ANSWER） |
| n-button | Naive UI | 交卷 / 上一题 / 下一题 / 完成作答 / 标记待检查 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `startSession` | POST `/papers/:id/sessions` | 开始作答，返回 sessionId/questions/deadline |
| `getSession` | GET `/sessions/:id` | 恢复断网答案 |
| `saveAnswers` | POST `/sessions/:id/answers` | 自动保存草稿 |
| `submitSession` | POST `/sessions/:id/submit` | 交卷 |
| `reportCheat` | POST `/sessions/:id/cheat` | 切屏作弊上报 |

### 交互逻辑

- 倒计时：剩余 ≤300s 转 `text-error-500 animate-pulse`；归零自动交卷。
- 标记待检查：点击切换 `review` 状态（按钮文案「标记待检查」↔「✓ 已标记待检查」）。
- 导航网格状态优先级：current > review > answered > unanswered。
- 客观题（SINGLE/MULTIPLE）用 QuestionOption；TRUE_FALSE 用 √/×；FILL_BLANK 文本域；SHORT_ANSWER 富文本编辑器（最多 9 图）。
- 交卷二次确认：有未答题时提示未答数量，确认后 `submitSession` → 跳结果页。
- 草稿写入 `localStorage`（key `exam_${sessionId}`）；切屏 `visibilitychange` 上报作弊，超限强制交卷。
- 题型 chip 颜色：SINGLE/MULTIPLE→primary，FILL_BLANK/SHORT_ANSWER→info，TRUE_FALSE→default；难度：EASY→success / MEDIUM→warning / HARD→error。

### 空态 / 加载态 / 错误态

- 开始失败：`message.error` 后 `router.push('/papers')`；无独立空态。
- 作答区本身无空态（始终有题目或加载中）。

### 响应式

- 题目导航 `hidden lg:block`（<1024px 隐藏）。
- 判断题作答区 `grid-cols-1 sm:grid-cols-2`。
- 顶部「已答 X/Y 题」`hidden md:inline`。

---


## 07. 随机练习

- **路由**: `/practice/sessions/:id`（路由名 `PracticePage`，`route.params.id` 为 sessionId）
- **Vue 文件**: `src/views/practice/PracticePage.vue`
- **Mockup**: `mockups/07-practice-page.html`
- **布局**: 内容页，置于 MainLayout 外壳（侧边栏 + 顶栏）内；页面内含一条 sticky 练习子栏（`top: var(--header-height)`），下方为 `max-w-4xl`(56rem) 居中内容区。本页**不使用** `QuestionNavGrid`，无题卡导航网格（故无 `review` 标记态）。
- **权限**: 登录用户（「练习」位于侧边栏「学习中心」分组，需登录可见；进入会话前需先有练习 session）。

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar(240) │ Header(64)                                     │
│               ├─ 练习 sticky 子栏：品牌图标+随机练习+题号/进度  │
│               │   已答 X/N 题 · 退出练习 · 进度条              │
│               ├─ 练习条件 pills（来源/题库/题型/正确率/优先…）  │
│               ├─ 答题卡                                        │
│               │   题头：第N题/共M题 · 题型pill · 难度pill      │
│               │   题干（RichText 富文本）                      │
│               │   选项 A/B/C/D（QuestionOption，选中/正确/错误/禁用）│
│               │   判分横幅（提交后：回答正确/错误+你的答案±正确答案）│
│               │   解析（answered && analysis，bulb 图标）      │
│               │   底部：上一题 · 提交答案(未答) · 下一题(已答) · 完成练习│
│               └─ 结果视图(result≠null)：PageHeader+条件+成绩hero │
│                  +StatCard×3+答题回顾列表(答案对比+解析)        │
└─────────────────────────────────────────────────────────────┘
   加载态：卡片头"随机练习" + 居中 n-spin
   空态：EmptyState「暂无题目」+ 返回练习列表
   弹窗：确认提交(完成练习) / 退出练习(useConfirm)
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 加载指示 | `n-spin`(size=large) | `loading` 为真时居中显示 |
| 退出 / 翻页 / 提交 / 完成 | `n-button` | 退出=quaternary+CloseOutline；提交=primary(仅未答)；完成=success 常驻；返回=primary |
| 选项 | `QuestionOption` | A–D 字母标记；态：selected/correct/wrong/disabled(opacity .6) |
| 题干 / 解析 / 答案 | `RichText` | 经 DOMPurify 净化 + KaTeX 公式渲染 |
| 结果页标题 | `PageHeader` | title「练习结果」subtitle「本套练习的作答统计与逐题回顾」 |
| 成绩统计卡 | `StatCard` | 答对题数(success) / 总题数(brand) / 用时(warning) |
| 空态 | `EmptyState` | title「暂无题目」+ 返回练习列表按钮 |
| 确认弹窗 | `useConfirm` composable | 完成练习「确认提交」/ 退出练习「退出练习」 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getPracticeSession(id)` → `/practice/sessions/:id` | GET | 加载会话题目、filterParams、已答答案（断点恢复）、COMPLETED 直接出结果 |
| `submitPracticeAnswer(id, {index, answer})` → `/practice/sessions/:id/answers` | POST | 提交当前题答案，返回布尔判分 |
| `completePractice(id)` → `/practice/sessions/:id/complete` | POST | 完成练习，返回统计（正确率/答对/总题/用时） |

### 交互逻辑

- 进入即 `onMounted(loadSession)`；若 `session.status==='COMPLETED'` 直接渲染结果视图。
- 单选/判断共用单选交互（`selectAnswer`），多选 `toggleMultiple`（逗号拼接提交）；未选提交提示「请先选择答案」。
- 提交后 `answered=true`，选项锁定：正确项绿底、用户错选项红底、其余变灰禁用；横幅显示「回答正确/错误」与你的答案，错误时附「正确答案」。
- 进度 `progressPercent = round(已答数/总题数*100)`；`currentIndex` 越界回退到末题避免空白。
- 「完成练习」`handleComplete`：有未答→「还有 X 道题未作答，确定提交吗？」正「确定提交」反「继续作答」；全答→「已完成所有题目，确定提交吗？」正「确定」反「取消」。
- 「退出练习」`handleExit`：正「退出」反「继续练习」，退出跳 `/practice`，进度保留可续做。

### 空态 / 加载态 / 错误态

- **加载态**：`loading` 真 → 卡片头「随机练习」+ 居中 spinner。
- **空态**：`questions.length===0` → EmptyState「暂无题目 / 本次练习没有生成题目，请返回练习列表重新开始」+「返回练习列表」。
- **错误态**：`loadSession` 失败 → `message.error('加载练习会话失败')` 并跳回 `/practice`；提交/完成失败 → toast 错误提示（不阻塞页面）。

### 响应式

- 内容区 `max-w-4xl`(56rem) 居中；子栏「已答 X/N 题」在 `md`(≥768) 以上显示，移动端隐藏。
- 侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open` + overlay）；答案对比 `grid-cols-2` 在 `sm` 起两列，更窄单列。
- 结果 hero 的 StatCard 三列在 `sm` 起三列，窄屏单列。


## 08. 考试结果

- **路由**: `/exam/sessions/:id/result`
- **Vue 文件**: `src/views/exam/ExamResult.vue`
- **Mockup**: `mockups/08-exam-result.html`
- **布局**: Sidebar + Header（路由不在 MENU_TITLES，顶栏回退「首页」）
- **权限**: 路由无 meta，`requiresAuth` 默认 true

### 页面结构

```
PageHeader[考试结果 | 查看本次考试得分与逐题作答详情]
成绩总览 hero
  [状态徽标]  87(最终得分)  客观题得分 | 主观题得分 | 作答状态
答题详情 (card)
  逐题卡片: #N [题型][正确/错误/待批改]
            题干
            [你的答案] [正确答案(仅 correctAnswer 存在)]
            [解析](仅 analysis 存在)
            得分: 数字 | 待批改
[返回记录]
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| PageHeader | 自定义 | 标题 + 副标题 |
| StatCard | 自定义 | hero 内 客观题/主观题/作答状态 |
| RichText | 自定义 | 题干/答案/解析富文本 |
| n-number-animation | Naive UI | 得分数字动画 |
| EmptyState | 自定义 | 无题目详情时 |
| n-result | Naive UI | 错误态（loadError） |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getResult` | GET `/sessions/:id/result` | 拉取成绩与逐题结果 |

### 交互逻辑

- 状态徽标按 `status`：`GRADED 已批改`(success) / `SUBMITTED 待批改` / `IN_PROGRESS 进行中` / `AUTO_SUBMITTED 自动交卷` / `CHEAT_SUBMITTED 切屏交卷`（error）等。
- 类型 chip 固定 `bg-info-50 text-info-600`（代码硬编码）。
- 正确/错误/待批改徽标：isCorrect true→success、false→error、null→warning。
- 答案框：正确→success 底、错误→error 底、待批改→warning 底；简答题用 RichText。
- 得分显示 `q.score`（原始分）或「待批改」。
- 「返回记录」→ `/records`。

### 空态 / 加载态 / 错误态

- 加载：`n-spin` 大号（hero 区占位）。
- 错误：`n-result status=error`，描述=loadError，按钮「返回记录」。
- 空：`EmptyState` 仅当 `questions.length === 0`。

### 响应式

- hero stats `sm:grid-cols-3`。
- 答案对比块 `grid-cols-1 sm:grid-cols-2`。

---


## 09. 统计面板

- **路由**: `/statistics`（路由名 `StatisticsPage`，MainLayout 子路由，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`）
- **Vue 文件**: `src/views/statistics/StatisticsPage.vue`
- **Mockup**: `mockups/09-statistics.html`
- **布局**: Sidebar + Header
- **权限**: 登录用户（「统计」属侧边栏「学习中心」分组，需登录可见；未登录访问被守卫重定向到 `/login?redirect=/statistics`）

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=统计) │ Header(64): 统计                   │
│               ├─ PageHeader: 学习统计                          │
│               │   subtitle「查看练习场次、正确率与各题库表现」   │
│               ├─ n-spin(:show=loading) 包裹以下全部            │
│               │   ├─ StatCard ×4（grid-cols-2 md:grid-cols-4） │
│               │   │   练习场次(brand) · 总题数(default)         │
│               │   │   正确率(success) · 错题数(error)           │
│               │   ├─ 区块卡「各题库统计」                       │
│               │   │   n-data-table(size=small, bordered=false) │
│               │   │   列：题库名称 | 做题数(100,居中) | 正确率(220)│
│               │   │   正确率=进度条(≥60绿/≥30橙/否则红)+右对齐 % │
│               │   └─ grid-cols-1 lg:grid-cols-2                │
│               │       左「各题库正确率」ECharts bar 300px        │
│               │       右「各题库练习次数」ECharts bar 300px      │
└─────────────────────────────────────────────────────────────┘
   加载态：n-spin 遮罩覆盖概览卡+表格+图表
   空态：bankStats 为空 → 表格「无数据」；renderCharts 提前 return → 图表留空
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader` | `title="学习统计"` `subtitle="查看练习场次、正确率与各题库表现"`；无 `actions` 插槽内容 |
| 加载遮罩 | `n-spin`（`:show="loading"`） | 包裹概览卡、表格与两个图表；无 `size` 配置 |
| 概览卡 | `StatCard` ×4 | `label/value/tone`：练习场次=`totalPractices`(brand)、总题数=`totalQuestions`(default)、正确率=`correctRate.toFixed(1)+'%'`(success)、错题数=`wrongCount`(error)；值为空时取 `0`，`correctRate == null` 显示 `-` |
| 区块卡片 | `div`（`bg-white border border-neutral-200 rounded-lg`） | 「各题库统计」与两个图表卡；卡片头 `px-5 py-4 border-b`，标题 `text-base font-semibold` |
| 题库统计表 | `n-data-table`（`size="small"` `:bordered="false"`） | 数据 `bankStats`；列见下 |
| 列名：题库名称 | `{ title:'题库名称', key:'bankName', ellipsis:{ tooltip:true } }` | 超长省略 + tooltip |
| 列名：做题数 | `{ title:'做题数', key:'count', width:100, align:'center' }` | 居中 |
| 列名：正确率 | `{ title:'正确率', key:'correctRate', width:220, render }` | `renderCorrectRate`：`flex items-center gap-2`；轨道 `flex-1 h-2 rounded-full bg-neutral-100`；填充 `≥60 bg-success-500` / `≥30 bg-warning-500` / 否则 `bg-error-500`；右侧 `w-12 text-right text-sm text-neutral-600` 显示 `toFixed(1)+'%'`；`correctRate == null` 直接返回 `-` |
| 图表：各题库正确率 | `echarts`（`type:'bar'`） | 容器 `height:300px` + `p-2`；`xAxis.type='category'` data=`bankStats[].bankName`（`axisLabel.rotate=30`）；`yAxis.name='正确率(%)'`；`series[0].data=bankStats[].correctRate`；柱 `barMaxWidth=40`、`borderRadius[4,4,0,0]`、渐变 `#5B5FE9 → #3A35B8` |
| 图表：各题库练习次数 | `echarts`（`type:'bar'`） | 同上配置；`yAxis.name='次数'`；`series[0].data=bankStats[].count`；渐变 `#22B570 → #0F7A48` |
| 图表 tooltip | `tooltip`（`trigger:'axis'`） | 白底 `#FFFFFF`、描边 `#E8E8EC`、文字 `#242428`/13；`axisPointer.type='shadow'`，阴影 `rgba(91,95,233,0.06)` |
| 失败提示 | `useMessage().error` | 文案「加载统计数据失败」 |

> 说明：本页**没有**时间范围 / 题库筛选控件（代码未渲染 `FilterBar` 或任何 `n-select`/`n-date-picker`），也**没有**导出按钮、图例、题型正确率分布等元素。

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getStatisticsOverview()` → `/statistics/overview` | GET | 唯一调用接口，返回 `OverviewStats`：`totalPractices`、`totalQuestions`、`correctRate`、`wrongCount`、`bankStats[{ bankId, bankName, count, correctRate }]`；`res.data` 直接赋给 `overview` |

> `src/api/statistics.ts` 中的 `getQuestionAccuracy`（`/statistics/question-accuracy`，支持 `bankId/startDate/endDate`）与 `getPaperStatistics`（`/statistics/papers/{paperId}`）本页**未使用**。

### 交互逻辑

- `onMounted` → `fetchData()`（`loading=true` → `getStatisticsOverview()` → `overview.value = res.data` → `finally loading=false`）→ `renderCharts()`。
- 请求失败：`catch` → `message.error('加载统计数据失败')`，页面保持空值（概览卡显示 `0` / `-`）。
- `renderCharts()`：`bankStats` 为空则直接 `return`（两个图表容器保持空白，不 init）；否则 `nextTick` 内 `echarts.init` 两个容器并 `setOption`（无 resize 监听、无销毁逻辑）。
- 正确率进度条配色阈值：`≥60` 绿、`≥30` 橙、其余红（与 `renderCorrectRate` 一致）。

### 空态 / 加载态 / 错误态

- **加载态**：`loading=true` → `n-spin` 遮罩覆盖概览卡 + 各题库统计表 + 两个图表（无骨架屏）。
- **空态**：`bankStats` 为空 → `n-data-table` 显示 zhCN 默认空文案「无数据」；两个 300px 图表容器保持空白（不 init ECharts）；概览卡仍显示 `0` / `-`。
- **正确率为空**：`row.correctRate == null` → 单元格渲染为纯文本 `-`。
- **错误态**：请求异常 → `message.error('加载统计数据失败')`（顶部 toast），不阻塞已渲染内容。

### 响应式

- 概览卡：`grid-cols-2`，≥768px（`md`）起 `grid-cols-4`，`gap-4`。
- 图表区：`grid-cols-1`，≥1024px（`lg`）起 `grid-cols-2`，`gap-4`；图表容器固定 `height:300px`，X 轴标签 `rotate:30`。
- 内容区 `.app-content` `max-w-content` 居中；侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open` + overlay），顶栏 <768px 显示汉堡按钮并隐藏搜索框。


## 10. 错题本

- **路由**: `/wrong-questions`（路由名 `WrongQuestionList`，MainLayout 子路由，无 `meta` → `requiresAuth !== false`，需登录；无 `requiresAdmin`）
- **Vue 文件**: `src/views/wrongquestion/WrongQuestionList.vue`
- **Mockup**: `mockups/10-wrong-questions.html`
- **布局**: Sidebar + Header
- **权限**: 登录用户（侧边栏「学习中心」分组高亮「错题本」；顶栏标题「错题本」来自 `MENU_TITLES`）

### 页面结构

```
┌───────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=错题本) │ Header(64): 错题本                │
│         ├─ PageHeader: 错题本                                   │
│         │   subtitle = `共 ${itemCount} 道错题`（0 时不渲染）    │
│         ├─ FilterBar: n-select「按题库筛选」200px                │
│         │             n-select「按标签筛选」200px                │
│         │   （均 clearable + filterable；无题型/时间/搜索按钮）   │
│         ├─ [loading && list 为空] SkeletonList(count=3, cols=1) │
│         ├─ [list 非空] wq-list（flex-col gap-3）                │
│         │   ├─ 序号块 32x32（(page-1)*pageSize+index+1）         │
│         │   ├─ 题干（plainContent，truncate；缺失→（内容已缺失））│
│         │   │   元信息行：题型 tag · 难度 tag · 题库名 ·         │
│         │   │   「最近错于 YYYY-MM-DD HH:mm · 累计错 N 次」       │
│         │   │   （errorCount>=3 时该文案转 warning-600 加粗）     │
│         │   └─ 操作：n-button「查看详情」(primary quaternary)    │
│         │            + 垃圾桶图标按钮（tooltip「移除」）         │
│         ├─ [itemCount > pageSize] flex justify-end mt-5         │
│         │   n-pagination（无卡片包裹、无总数文案）               │
│         └─ [list 为空] 白底边框卡 + EmptyState                   │
│             title「暂无错题」/ desc「做错的题目会自动收录到这里， │
│             方便你反复巩固」/ icon CloseCircleOutline            │
└───────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader`（无 `showBack`，无 actions） | `title="错题本"`；`subtitle` 仅 `itemCount` 非 0 时显示 `共 N 道错题` |
| 筛选栏 | `FilterBar` + `n-select` ×2 | 题库 / 标签；`style="width: 200px"`、`clearable`、`filterable`；`@update:value="handleSearch"` |
| 骨架 | `SkeletonList`（`:count="3" :cols="1"`） | 条件 `loading && wrongList.length === 0` |
| 列表项 | `div`（`bg-white border border-neutral-200 rounded-lg px-5 py-4 flex items-center gap-4`，hover `border-primary-300 shadow-sm`） | 每行：序号 / 题干+标签 / 操作区 |
| 题型标签 | `n-tag`（`size="small" round`） | `SINGLE→info`、`MULTIPLE→warning`、`TRUE_FALSE→success`、`FILL_BLANK→default`、`SHORT_ANSWER→primary`；文案取 `QUESTION_TYPE_MAP`，空值 `-` |
| 难度标签 | `n-tag`（`size="small" round`，`v-if="row.difficulty"`） | `EASY→success`、`MEDIUM→warning`、`HARD→error`；文案取 `DIFFICULTY_MAP` |
| 题库名 | `span` + `n-icon`（`LibraryOutline`, size 13） | `v-if="row.bankName"`，`text-xs text-neutral-400` |
| 错误统计文案 | `span` | `最近错于 {formatTime} · 累计错 {errorCount} 次`；`errorCount>=3` 用 `text-warning-600 font-medium`，否则 `text-neutral-400` |
| 操作按钮 | `n-button`（`size="small" type="primary" quaternary`）+ `n-tooltip` 包裹的图标按钮（`TrashOutline`） | 「查看详情」→ 跳快照页；垃圾桶 → `confirmDanger` 后删除，tooltip 文案「移除」 |
| 分页 | `n-pagination` | `v-if="itemCount > pageSize"`，容器 `flex justify-end mt-5` |
| 空态 | `EmptyState` | `title="暂无错题"`、`description="做错的题目会自动收录到这里，方便你反复巩固"`、`:icon="CloseCircleOutline"`；外层白底边框卡 |
| 删除确认 | `useConfirm().confirmDanger` | 标题「移除错题」、内容「确定要从错题本中移除该题目吗？」、确认按钮「移除」 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `list(params)` → `/wrong-questions` | GET | 分页查询错题；入参 `page / size / bankId / tagId`（`null` 转 `undefined`）；`res.data.records` 经 `toRow` 展开，`res.data.total` 写入 `itemCount` |
| `deleteWrongQuestion(id)` → `/wrong-questions/{id}` | DELETE | 移除错题；成功后 `message.success('已移除')` 并 `fetchList()` |
| `getBankList({ page:1, size:200 })` | GET | 题库下拉选项（`label=name, value=id`） |
| `getTagList()` | GET | 标签下拉选项（`label=name, value=id`） |

> `sortBy` 为接口参数类型中存在的字段，但本页未传（无排序控件）。

### 交互逻辑

- `onMounted` → `loadOptions()`（并行拉题库 + 标签，异常静默 ignore）+ `fetchList()`。
- `handleSearch()`：筛选变化时 `page=1` 后重新拉取；`handlePageChange(page)`：改页后重新拉取。
- `toRow(q)`：`JSON.parse(questionSnapshot)` 取 `type / difficulty / content`（解析失败则三项为空），`stripHtml` 去标签与 `&nbsp;` 得到 `plainContent`；`plainContent` 为空时列表显示「（内容已缺失）」。
- 点击题干区 → `handleViewOriginal`：有 `bankId && questionId` 跳 `/banks/{bankId}/questions/{questionId}`，否则 `message.warning('无法跳转原题')`。
- 点击「查看详情」→ `router.push('/wrong-questions/snapshot/{id}')`。
- 点击垃圾桶 → `confirmDanger` 确认 → `deleteWrongQuestion` → 成功 `已移除` / 失败 `移除失败`。
- 请求失败：`catch` → `message.error('加载错题失败')`（toast，无页面级错误块）。
- 分页：`pageSize` 固定 20，无每页条数切换、无快速跳页（mockup 不呈现这些控件）。

### 空态 / 加载态 / 错误态

- **加载态**：`loading && wrongList.length === 0` → `SkeletonList(count=3, cols=1)`，单列三张白底边框卡（每卡 1 条 20px 骨架 + 3 条文本骨架 + 1 条 40% 宽骨架）。
- **空态**：`wrongList.length === 0` → 白底边框卡内 `EmptyState`：图标 `CloseCircleOutline`（56px，`neutral-300`），标题「暂无错题」，描述「做错的题目会自动收录到这里，方便你反复巩固」，无操作按钮。
- **无筛选结果**：代码未区分「无数据」与「筛选无结果」，空态文案不变。
- **错误态**：无独立错误块，仅 `message.error('加载错题失败')`；`loading` 在 `finally` 置 false，列表保持上一次结果或走空态。

### 响应式

- 列表项恒为单行横向布局（序号 / 题干区 `flex-1 min-w-0` / 操作区 `flex-shrink-0`），代码未设置任何断点，窄屏靠 `truncate` 与 `flex-wrap` 元信息行自适应。
- 元信息行 `flex-wrap`，标签与统计文案在空间不足时换行。
- 筛选栏 `FilterBar` 为 `flex-wrap`，宽度不足时下拉换行；每个下拉固定 200px。
- 分页容器 `flex justify-end`，窄屏仍右对齐。
- 外壳：侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open`），顶栏 <768px 显示汉堡按钮并隐藏搜索框；内容区 `.app-content` 居中（`max-w-content`）。

---


## 10b. 错题快照

> 与列表页差异明显（独立路由 + 独立页面），已在同一个 mockup `mockups/10-wrong-questions.html` 中以分组标题「形态四」呈现（未另建 `31-wrong-question-snapshot.html`）。

- **路由**: `/wrong-questions/snapshot/:id`（路由名 `WrongQuestionSnapshot`，MainLayout 子路由，无 `meta` → 需登录）
- **Vue 文件**: `src/views/wrongquestion/WrongQuestionSnapshot.vue`
- **Mockup**: `mockups/10-wrong-questions.html`（形态四，含判断题变体与错误态）
- **布局**: Sidebar + Header
- **权限**: 登录用户；`activeMenu` 用 `path.startsWith(key)` 匹配，本路径命中 `/wrong-questions` → 顶栏标题「错题本」、侧边栏高亮「错题本」

### 页面结构

```
┌───────────────────────────────────────────────────────────────┐
│ Sidebar(240) │ Header(64)                                      │
│    ├─ PageHeader: 错题详情（showBack=true，左侧返回圆钮）       │
│    │   subtitle = `${bankName||'未知题库'} · 错 ${errorCount} 次 ·
│    │              最近做错于 ${formatTime(lastWrongTime)}`      │
│    ├─ n-spin(:show=loading) 包裹白底边框卡                     │
│    │   ├─ 标签行（px-6 py-4 border-b）：题型 tag · 难度 tag     │
│    │   │   右对齐「所属题库：xxx」（品牌色链接，点击跳题库）     │
│    │   └─ 内容区（px-6 py-6 space-y-6）                        │
│    │       ├─ 题干（灰底卡 + RichText）                        │
│    │       ├─ 选项（仅 SINGLE / MULTIPLE）：正确项绿框绿底+对勾 │
│    │       ├─ 正确答案（TRUE_FALSE）：「正确」/「错误」圆角 tag  │
│    │       ├─ 正确答案（非判断题，有 answer）：绿底卡           │
│    │       └─ 解析（有 analysis）：黄底卡                       │
│    └─ [loadError] LoadError：加载失败 + 重试 / 返回上一页       │
└───────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader`（`showBack` 为 true） | `title="错题详情"`；副标题三段式 `题库 · 错 N 次 · 最近做错于 时间`；未加载时 subtitle 为空串 |
| 加载容器 | `n-spin`（`:show="loading"`） | 条件 `v-if="!loadError"`，详情页无骨架屏 |
| 标签行 | `n-tag` ×2 + 右对齐 `span` | 题型 tag（同列表色映射）、难度 tag（`v-if="snapshot.difficulty"`）、`所属题库：` + 品牌色链接 |
| 题干 | `RichText` + 容器 `bg-neutral-50 border rounded-lg p-4` | 小标题 `text-sm font-medium text-neutral-500` 文案「题干」 |
| 选项 | 自绘行（`border rounded-lg p-4`） | 仅 `SINGLE`/`MULTIPLE`；正确项 `border-success-500 bg-success-50` + 白色圆标 + `CheckmarkOutline`（`#22B570`）；序号 A/B/C/D 由 `String.fromCharCode(65+index)` 生成 |
| 判断题答案 | `n-tag`（`round`） | `answer === 'A'` → `success` + 「正确」，否则 `error` + 「错误」 |
| 非判断题答案 | `RichText` + 容器 `bg-success-50 border-success-100 rounded-lg p-4` | `answerLabel`：单选 `B. 选项内容`；多选按 `,` 拆分并以「；」连接 |
| 解析 | `RichText` + 容器 `bg-warning-50 border-warning-100 rounded-lg p-4` | `v-if="snapshot.analysis"` |
| 错误态 | `LoadError` | `n-result status="error"`，标题「加载失败」，`description=loadError`，底部「重试」+「返回上一页」 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getWrongQuestionById(id)` → `/wrong-questions/{id}` | GET | 获取单条错题记录；`res.data` 存入 `wrongQuestion`，`questionSnapshot` 经 `parseSnapshot` 展开 |

> 本页不调用列表接口，也不调用题库/标签接口。

### 交互逻辑

- `onMounted` → `fetchDetail()`；`route.params.id` 缺失 → `message.error('缺少错题记录ID')` 并 return。
- `parseSnapshot`：解析失败返回 `null` → `message.warning('该错题记录没有可用的快照数据')`，页面仍渲染（题干为空 rich-box，选项/答案/解析均不渲染）。
- `isCorrectOption`：单选按字母精确匹配，多选按 `,` 拆分匹配；`parsedOptions` 支持 `options` 为 JSON 字符串、数组、`[{content|text|value}]` 对象数组三种形态。
- 「所属题库」链接 → `router.push('/banks/{bankId}')`；返回按钮 → `router.back()`。
- 无「移除错题」「再来一次」等其它操作按钮（代码不存在）。

### 空态 / 加载态 / 错误态

- **加载态**：`n-spin` 遮罩覆盖整张详情卡（无骨架屏）。
- **快照缺失**：toast `该错题记录没有可用的快照数据`，题干区空白，选项/答案/解析不渲染。
- **错误态**：`LoadError` 整卡替换，图标 error、标题「加载失败」、描述取 `err.response.data.message || err.message || '加载错题快照失败'`，按钮「重试」（带 loading）+「返回上一页」。
- **空态**：无列表型空态；各 section 由 `v-if` 控制，数据缺失即不渲染。

### 响应式

- 详情卡内容区 `px-6 py-6 space-y-6`，未设置断点；选项行 `flex items-start gap-3`，窄屏靠文本换行自适应。
- 标签行 `flex-wrap`，「所属题库」用 `ml-auto` 右对齐，空间不足时换行。
- 外壳同列表页：侧边栏 <1024px 抽屉化，顶栏 <768px 显示汉堡按钮并隐藏搜索框。


## 11. 做题记录

- **路由**: `/records`（路由名 `RecordList`，MainLayout 子路由，无 `meta` → `requiresAuth !== false`，需登录；无 `requiresAdmin`）
- **Vue 文件**: `src/views/record/RecordList.vue`
- **Mockup**: `mockups/11-records.html`
- **布局**: Sidebar + Header
- **权限**: 登录用户（侧边栏「学习中心」分组高亮「做题记录」；顶栏标题「做题记录」来自 `MENU_TITLES`）

### 页面结构

```
┌────────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=做题记录) │ Header(64): 做题记录            │
│         ├─ PageHeader: 做题记录                                  │
│         │   subtitle = `共 ${pagination.itemCount} 条练习记录`    │
│         │   仅 activeTab==='practice' 且 itemCount 非 0 时渲染    │
│         ├─ n-tabs type="line"：练习记录 | 考试记录（默认 practice）│
│         │                                                        │
│         ├─ [练习记录] FilterBar                                  │
│         │   n-select「按题库筛选」200px（clearable + filterable）  │
│         │   n-select「按来源筛选」140px（练习 / 考试，clearable）  │
│         │   n-date-picker「选择时间范围」daterange 260px          │
│         ├─ [loading && 列表为空] SkeletonList(count=3, cols=1)    │
│         ├─ [列表非空] flex-col gap-3 卡片行                       │
│         │   ├─ 40x40 圆角图标块：                                 │
│         │   │   正确 → bg-success-50 + CheckmarkDoneOutline       │
│         │   │   错误 → bg-error-50   + CloseCircleOutline         │
│         │   │   待判定 → bg-neutral-100 + RemoveOutline           │
│         │   ├─ 题干 plainContent（truncate；空 →「（内容已缺失）」）│
│         │   │   元信息行：题库名（LibraryOutline，v-if bankName）  │
│         │   │            · 时间 YYYY-MM-DD HH:mm（TimeOutline）   │
│         │   └─ 右：结果角标「回答正确 / 回答错误 / 待判定」        │
│         │       + 「来源：练习」或「来源：考试」                   │
│         ├─ [itemCount > pageSize(20)] flex justify-end mt-5      │
│         │   n-pagination（无卡片包裹、无总数文案）                │
│         └─ [列表为空] 白底边框卡 + EmptyState                     │
│             「暂无做题记录」/「完成练习或考试后，你的作答记录会展示在这里」│
│             icon DocumentTextOutline，无操作按钮                  │
│                                                                  │
│         ├─ [考试记录] 无 FilterBar                                │
│         │   ├─ [examLoading && 空] SkeletonList(count=3, cols=1)  │
│         │   ├─ 卡片行：40x40 状态图标 + 试卷标题（空→（试卷已删除））│
│         │   │   元信息：第 N 次作答 · 提交时间（空 →「未提交」）   │
│         │   │   右：状态角标（进行中/已提交/批改中/已批改/已过期/  │
│         │   │   自动交卷）+ 得分（`${totalScore} 分` primary-600， │
│         │   │   totalScore 为 null →「暂无成绩」neutral-400）     │
│         │   ├─ [itemCount > 20] 右对齐 n-pagination              │
│         │   └─ 空态：白底边框卡 + EmptyState「暂无考试记录」      │
│         │       + 主按钮「去参加考试」→ /papers                   │
└────────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader`（无 `showBack`，无 actions 插槽） | `title="做题记录"`；`:subtitle` 为 `activeTab === 'practice' && pagination.itemCount ? \`共 ${pagination.itemCount} 条练习记录\` : undefined` |
| Tab 切换 | `n-tabs`（`type="line"`，`class="mb-4"`） | `v-model:value="activeTab"`，`练习记录` / `考试记录`；`@update:value="handleTabChange"` |
| 筛选栏 | `FilterBar` + `n-select` ×2 + `n-date-picker` | 题库（200px，`clearable`+`filterable`，选项来自 `getBankList({page:1,size:200})`）；来源（140px，练习 / 考试）；时间范围（`type="daterange"`，260px，`clearable`）；三者均 `@update:value="handleSearch"` |
| 骨架 | `SkeletonList`（`:count="3" :cols="1"`） | 练习：`loading && recordList.length === 0`；考试：`examLoading && examList.length === 0` |
| 列表项 | `div`（`bg-white border border-neutral-200 rounded-lg px-5 py-4 flex items-center gap-4`，hover `border-primary-300 shadow-sm`） | 两个 Tab 共用同一卡片样式；题干区 `cursor-pointer` 才可点击（练习→原题，考试→结果/继续作答） |
| 结果图标 | `n-icon`（size 20，`:color` 由 `resultColor` 给出） | `true`→`CheckmarkDoneOutline`（`--color-success-500`）；`false`→`CloseCircleOutline`（`--color-error-500`）；`null`→`RemoveOutline`（`--color-neutral-400`） |
| 结果角标 | 自绘 `span`（`px-2 py-0.5 rounded text-xs font-semibold`） | `回答正确`→`bg-success-50 text-success-600`；`回答错误`→`bg-error-50 text-error-600`；`待判定`→`bg-neutral-100 text-neutral-500` |
| 来源文案 | `span`（`text-xs text-neutral-400`） | `来源：${sourceLabel(sourceType)}`，`PRACTICE_SESSION→练习`、`EXAM→考试`，其它原样输出，空 → `-` |
| 考试状态角标 | 自绘 `span` | `IN_PROGRESS 进行中`(info)、`SUBMITTED 已提交`(neutral-600)、`GRADING 批改中`(warning)、`GRADED 已批改`(success)、`EXPIRED 已过期`(neutral-500)、`AUTO_SUBMITTED 自动交卷`(warning)；未知状态回退 `bg-neutral-100 text-neutral-600` + 原 status 文案 |
| 考试状态图标 | `n-icon`（size 20） | 依次为 `HourglassOutline` / `CreateOutline` / `CreateOutline` / `CheckmarkCircleOutline` / `BanOutline` / `CreateOutline`；未知 → `DocumentTextOutline` |
| 成绩 | `span`（`text-sm font-semibold`） | `totalScore != null` → `${totalScore} 分`（`text-primary-600`）；否则 `暂无成绩`（`text-neutral-400`） |
| 分页 | `n-pagination` | 两个 Tab 各自一份，`v-if="itemCount > pageSize"`，容器 `flex justify-end mt-5`，`pageSize` 均为 20 |
| 空态 | `EmptyState` | 练习：`暂无做题记录` / `完成练习或考试后，你的作答记录会展示在这里`；考试：`暂无考试记录` / `参加考试后，历史试卷与成绩会展示在这里`，`#action` 为 `n-button type="primary"`「去参加考试」；两者 `:icon="DocumentTextOutline"` |

> 代码中**没有**统计卡片、导出按钮、搜索框、题型/答案/得分列的数据表格等区块（练习记录无得分概念，仅考试记录显示 `totalScore`）。

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getRecordList(params)` → `/practice-records` | GET | 练习记录分页；参数 `page` / `size` / `bankId` / `type`（来源枚举）/ `startDate` / `endDate`（`YYYY-MM-DD`） |
| `getMyExamSessions({page,size})` → `/my/exam-sessions` | GET | 考试记录分页（无筛选参数） |
| `getBankList({page:1,size:200})` | GET | 构造题库下拉选项（`{label: b.name, value: b.id}`），失败静默忽略 |

### 交互逻辑

- `onMounted` → `loadOptions()` + `fetchList()`；考试列表**不在挂载时加载**，切到「考试记录」且列表为空、未在加载时才 `fetchExamList()`。
- 任一筛选控件 `update:value` → `handleSearch()`：重置 `pagination.page = 1` 后重新拉取；时间范围用 `dayjs` 转 `YYYY-MM-DD` 传给 `startDate` / `endDate`。
- 切换分页 → `handlePageChange` / `handleExamPageChange`，只更新对应 `page` 并重新请求。
- `toRow()` 把 `questionSnapshot`（JSON 字符串）解析出 `content`，再 `stripHtml()` 去掉标签/`&nbsp;`/多余空白；解析失败或缺失 → `plainContent` 为空，列表显示「（内容已缺失）」。
- 点击题干（练习）：`bankId && questionId` 存在 → `router.push('/banks/{bankId}/questions/{questionId}')`，否则 `message.warning('无法跳转原题')`。
- 点击试卷标题（考试）：`IN_PROGRESS` → `/papers/{paperId}/exam`；`submittedAt` 存在 → `/exam/sessions/{id}/result`；其余（如已过期且未提交）无跳转。
- 时间统一 `dayjs(time).format('YYYY-MM-DD HH:mm')`，空值显示 `-`（考试未提交显示「未提交」）。
- 空态按钮「去参加考试」→ `router.push('/papers')`。

### 空态 / 加载态 / 错误态

- **加载态**：首次加载（`loading && recordList.length === 0`）显示 3 条单列骨架卡；已有数据时翻页/筛选不显示骨架（无遮罩）。
- **练习空态**：白底边框卡 + `EmptyState`，`暂无做题记录` / `完成练习或考试后，你的作答记录会展示在这里`，无操作按钮。
- **考试空态**：同结构 + `暂无考试记录` / `参加考试后，历史试卷与成绩会展示在这里`，带主按钮「去参加考试」。
- **错误态**：无 `LoadError` 组件；请求失败仅 `message.error('加载做题记录失败')` / `message.error('加载考试记录失败')`，页面表现为空态。

### 响应式

- 外层 `max-w-content mx-auto w-full`，内容区由 `MainLayout` 控制最大宽度。
- 行内三段式布局（图标 / 中间信息 / 右侧结果）：中间 `flex-1 min-w-0` + `truncate`，右侧 `flex-shrink-0`；元信息行 `flex-wrap`，空间不足换行。
- 筛选栏 `FilterBar` 为 `flex-wrap`，窄屏自动换行；日期选择器固定 260px。
- Tab 为 `type="line"`，无断点切换；分页右对齐 `mt-5`。
- 外壳同列表页：侧边栏 <1024px 抽屉化，顶栏 <768px 显示汉堡按钮并隐藏搜索框。

---


## 12. 搜索

- **路由**: `/search`（路由名 `SearchPage`，`MainLayout` 子路由，`meta: { requiresAuth: false }`）
- **Vue 文件**: `src/views/search/SearchPage.vue`
- **Mockup**: `mockups/12-search.html`
- **布局**: Sidebar + Header
- **权限**: **游客可见**。`meta.requiresAuth === false` → 守卫 `requiresAuth = to.meta.requiresAuth !== false` 为假，未登录也不重定向到 `/login`；侧边栏未登录时「搜索」仍会出现（单独一组、无分组标题），已登录时位于「学习中心」分组末位（MainLayout.vue `menuGroups`）；顶栏标题「搜索」来自 `MENU_TITLES['/search']`

### 页面结构

```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=搜索) │ Header(64): 搜索                    │
│        ├─ PageHeader: 搜索 / 搜索题库、题目、试卷（无 actions） │
│        ├─ 搜索区卡（white + border + rounded-xl                │
│        │   px-5 py-6 / sm:px-8 sm:py-8，mb-6）                 │
│        │   └─ flex-col sm:flex-row gap-3 max-w-3xl mx-auto     │
│        │      ├─ n-input（round / large / clearable /          │
│        │      │   prefix SearchOutline，flex-1，回车即搜索）    │
│        │      │   placeholder「搜索题库、题目、试卷...」        │
│        │      └─ flex gap-3                                    │
│        │         ├─ n-select「类型」120px（全部/题库/题目/试卷）│
│        │         └─ n-button primary large「搜索」(带搜索图标)  │
│        ├─ [v-if loading] SkeletonList(count=4, cols=1)         │
│        ├─ [v-else-if 结果为空] EmptyState（无卡片包裹）        │
│        │   SearchOutline / 暂无结果 / 换个关键词或类型试试吧    │
│        ├─ [v-else] 结果卡（white + border + rounded-lg          │
│        │   divide-y，单一扁平列表，不按类型分组）              │
│        │   └─ 每条：40x40 类型图标（bank/question/paper 三色）  │
│        │      ├─ 标题（关键词高亮分段）+ n-tag 类型标签        │
│        │      ├─ 描述（line-clamp-2，关键词高亮）              │
│        │      ├─ 元信息：TimeOutline + 「ID {id}」             │
│        │      └─ 右：n-button tiny quaternary「查看」          │
│        │         （仅 bank/paper 有，question 无）             │
│        └─ [itemCount > pageSize] flex justify-end mt-4         │
│            n-pagination（无总数文案）                          │
└──────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader`（无 `showBack`，无 `actions` 插槽） | `title="搜索"`、`subtitle="搜索题库、题目、试卷"`；subtitle 为静态文案，恒显示（不随结果数变化） |
| 搜索输入框 | `n-input`（`round` `size="large"` `clearable` `class="flex-1"`） | `placeholder="搜索题库、题目、试卷..."`；`#prefix` 为 `SearchOutline`；`@keyup.enter="handleSearch"` |
| 类型筛选 | `n-select`（`style="width: 120px"`，`placeholder="类型"`） | 枚举 `typeOptions`：`{全部, all}`、`{题库, bank}`、`{题目, question}`、`{试卷, paper}`；初始 `filterType = null`（显示 placeholder）；`@update:value="handleSearch"` |
| 搜索按钮 | `n-button`（`type="primary"` `size="large"` `class="shrink-0"`） | 文案「搜索」，`#icon` 为 `SearchOutline`；`@click="handleSearch"` |
| 加载骨架 | `SkeletonList`（`:count="4"` `:cols="1"`） | 条件 `v-if="loading"`（本页不叠加「已有数据不显示骨架」的判断，翻页/改类型同样进骨架） |
| 空态 | `EmptyState`（**外层无卡片**） | `title="暂无结果"`、`description="换个关键词或类型试试吧"`、`:icon="SearchOutline"`；无 `#action` 按钮 |
| 结果容器 | `div`（`bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200 overflow-hidden`） | 扁平列表，`v-for="item in searchResults"`，`:key="\`${item.type}-${item.id}\`"` |
| 结果行 | `div`（`flex items-start gap-4 px-4 sm:px-5 py-4 transition-colors`） | `:class="resultPath(item) ? 'cursor-pointer hover:bg-neutral-50' : ''"`；`@click="goResult(item)"`（题目行无跳转也不加 hover） |
| 类型图标块 | `div` + `n-icon`（`:size="20"`） | `w-10 h-10 rounded-lg flex-shrink-0`；配色见下表 |
| 标题 | `span`（`text-base font-semibold text-neutral-900 truncate`） | 由 `highlightSegments(item.title)` 分段渲染，命中段加 `text-primary-500 font-semibold` |
| 类型标签 | `n-tag`（`size="small"` `round` `:bordered="false"`） | 文案 `typeMeta(item.type).label`，`:type` 取 `tagType` |
| 描述 | `p`（`text-sm text-neutral-600 line-clamp-2 mb-2`，`v-if="item.description"`） | 同样按 `highlightSegments` 分段高亮 |
| 元信息 | `span.inline-flex`（`text-xs text-neutral-500`，`gap-4`） | 仅一项：`n-icon(TimeOutline, 14)` + `ID {{ item.id }}` |
| 查看按钮 | `n-button`（`size="tiny"` `quaternary` `type="primary"`，`v-if="resultPath(item)"`） | 文案「查看」，`@click.stop="goResult(item)"` |
| 分页 | `n-pagination` | `v-if="pagination.itemCount > pagination.pageSize"`；容器 `flex justify-end mt-4`；`pageSize` 固定 20，无每页条数切换、无快速跳页 |
| 轻提示 | `useMessage()` | `warning('请输入搜索关键词')`、`error('搜索失败')` |

类型元数据（`TYPE_META` / `DEFAULT_META`）：

| type | label | 图标 | 图标底色 | tagType |
|------|-------|------|----------|---------|
| `bank` | 题库 | `LibraryOutline` | `bg-primary-50 text-primary-500` | `primary` |
| `question` | 题目 | `DocumentTextOutline` | `bg-success-50 text-success-600` | `success` |
| `paper` | 试卷 | `FileTrayFullOutline` | `bg-warning-50 text-warning-600` | `warning` |
| 其它/未知 | 其他 | `DocumentTextOutline` | `bg-neutral-100 text-neutral-500` | `default` |

> 结果项类型 `SearchResultItem` 含 `matchField` 字段，但页面**未渲染**（mockup 不展示「匹配字段」）。

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `search(params)` → `/search` | GET | 唯一接口；入参 `keyword`（必填，原样传不 trim）、`type`（`filterType === 'all'` 时传 `undefined`；`null` 时即传 `null`）、`page`、`size`；`res.data.records` → `searchResults`，`res.data.total` → `pagination.itemCount` |

### 交互逻辑

- `onMounted`：`route.query.keyword ?? route.query.q` 有值 → 回填 `keyword.value` 并立即 `handleSearch()`（**URL 关键词回填自动搜索**）；无值则不请求。
- `watch(() => route.query.keyword)`：外部跳转带来新关键词且与当前不同 → 回填并重新搜索（顶栏全局搜索回车即 `router.push('/search?keyword=xx')`，走这条链路）。
- `handleSearch()`：关键词 trim 后为空 → `message.warning('请输入搜索关键词')` 并 return（不发请求）；否则 `loading = true`、`page = 1`、请求、`finally loading = false`；请求后若 `route.query.keyword !== keyword` 则 `router.replace` 同步 URL（保留其它 query）。
- 类型下拉变化 → 同样走 `handleSearch()`（重置到第 1 页）。
- 高亮：`highlightSegments(text)` 按 `keyword.trim()` 做**大小写不敏感**的 `indexOf` 循环切片（不是全局替换、不转义正则），命中段加 `text-primary-500 font-semibold`；关键词为空或文本为空时整段不命中。
- 跳转：`resultPath(item)` → `bank` 到 `/banks/{id}`、`paper` 到 `/papers/{id}`，`question` 返回空串（整行不可点、无「查看」按钮，代码注释明确「题目保持不可点」）。
- 分页：`handlePageChange(page)` 更新页码后重新请求；`pageSize` 固定 20。

### 空态 / 加载态 / 错误态

- **加载态**：`loading = true` → `SkeletonList(count=4, cols=1)`（4 张单列骨架卡：1 条 20px 标题骨架 + 3 条文本骨架 + 1 条 40% 宽骨架），无 `n-spin` 遮罩。
- **空态（未搜索）**：直接进 `/search`（URL 无 `keyword`/`q`）→ 不请求、结果为空 → 与「无结果」**同一个** `EmptyState`：`暂无结果` / `换个关键词或类型试试吧` / `SearchOutline`，无操作按钮、无卡片包裹。
- **空态（无结果）**：已搜索但 `records` 为空 → 文案同上，代码不区分两种空态。
- **无结果计数文案**：页面**没有任何**「共 N 条结果 / 找到 N 个」类文案；`pagination.itemCount` 只用于分页页数计算。
- **错误态**：无 `LoadError`、无页面级错误块；请求异常仅 `message.error('搜索失败')`（顶部 toast），列表回落到空态。

### 响应式

- 搜索区：`flex-col` → `sm(≥640px)` 起 `flex-row items-center`；外卡内边距 `px-5 py-6` → `sm:px-8 sm:py-8`；搜索行 `max-w-3xl mx-auto`；类型下拉固定 120px、按钮 `shrink-0`，窄屏输入框与「下拉+按钮」上下堆叠。
- 结果行：内边距 `px-4` → `sm:px-5`，恒为「图标 + 内容 + 操作」横向布局，标题 `truncate`、描述 2 行截断。
- 分页：`flex justify-end mt-4`，窄屏仍右对齐，`itemCount ≤ 20` 时整块不渲染。
- 外壳：`.app-content` `max-w-content` 居中；侧边栏 <1024px 抽屉化（`.sidebar.mobile-open`），顶栏 <768px 显示汉堡按钮并隐藏搜索框。


## 13. 通知中心

- **路由**: `/notifications`（路由名 `NotificationList`，MainLayout 子路由，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`）
- **Vue 文件**: `src/views/notification/NotificationList.vue`
- **Mockup**: `mockups/13-notifications.html`
- **布局**: Sidebar + Header
- **权限**: 登录用户（侧边栏「学习中心」分组高亮「通知」；顶栏标题「通知」来自 `MENU_TITLES['/notifications']`）

> 本页**没有** `PageHeader` 组件：页头是自绘的 `flex items-center justify-between mb-6`，标题为 `h1.text-2xl.font-bold` 文案「通知中心」，
> 右侧为 `n-button size="small"`「全部标为已读」（图标 `CheckmarkDoneOutline`）。页面标题是「通知中心」，顶栏标题才是「通知」，两者不同。

### 页面结构

```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=通知) │ Header(64): 通知                   │
│        ├─ 页头行（自绘）：h1「通知中心」                       │
│        │   └─ 右：n-button small「全部标为已读」               │
│        ├─ 已读/未读分段控件（自绘胶囊，非 n-tabs）             │
│        │   全部(null) | 未读(false) | 已读(true)               │
│        ├─ n-spin(:show=loading)                                │
│        │   ├─ [空] EmptyState（无卡片包裹）                    │
│        │   │   title 默认「暂无数据」/ desc「暂无通知」        │
│        │   └─ [非空] space-y-3 通知卡列表                      │
│        │       ├─ 40x40 圆形类型图标（TYPE_META iconClass）    │
│        │       ├─ n-tag(small/round/bordered=false) + 标题     │
│        │       ├─ 内容 text-sm neutral-600                     │
│        │       ├─ 元信息：TimeOutline + YYYY-MM-DD HH:mm       │
│        │       │   + 「查看详情 ›」（仅可跳转时）              │
│        │       └─ 右列：未读圆点(仅未读)                       │
│        │           标记已读(仅未读) · 删除(恒有)               │
│        └─ [itemCount > 20] flex justify-center mt-6            │
│            n-pagination                                        │
└──────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页头标题 | `h1`（`text-2xl font-bold text-neutral-900`） | 文案「通知中心」；无 `PageHeader`、无 subtitle |
| 全部标为已读 | `n-button`（`size="small"`，默认 type） | `#icon` 为 `CheckmarkDoneOutline`；文案「全部标为已读」；无二次确认 |
| 已读/未读筛选 | 自绘 `button` ×3（**不是** `n-tabs` / `n-radio-group`） | 容器 `inline-flex items-center gap-1 p-1 rounded-full bg-neutral-100 mb-6`；选中态 `bg-white text-primary-600 font-semibold shadow-sm`，未选中 `text-neutral-600 hover:text-neutral-900`；`readTabs` = `全部(null)` / `未读(false)` / `已读(true)`；**无角标数字** |
| 加载容器 | `n-spin`（`:show="loading"`） | 遮罩覆盖列表区；本页**未使用** `SkeletonList`，无骨架屏 |
| 列表项 | `div`（`flex items-start gap-4 px-5 py-4 rounded-lg border transition-colors group`） | 未读 `bg-primary-50 border-primary-200`；已读 `bg-white border-neutral-200`；可跳转时额外 `cursor-pointer hover:border-primary-300 hover:shadow-sm`（**无左侧色条**） |
| 类型图标 | `div` + `n-icon`（`:size="20"`） | `w-10 h-10 rounded-full`，底色取自 `TYPE_META.iconClass` |
| 类型标签 | `n-tag`（`size="small" round :bordered="false"` `:type="tagType"`） | 文案 `typeMeta(type).label` |
| 标题 | `span`（`text-sm font-medium text-neutral-900`） | 与类型标签同行，`flex flex-wrap items-center gap-2 mb-1` |
| 内容 | `p`（`text-sm text-neutral-600 leading-relaxed mb-2`） | 原文输出，无截断 |
| 时间 | `span` + `n-icon`（`TimeOutline`, size 14） | `dayjs(createdAt).format('YYYY-MM-DD HH:mm')`；**不是**相对时间 |
| 查看详情 | `span` + `n-icon`（`ChevronForwardOutline`, size 14） | `v-if="resolveNotificationRoute(notif)"`；`text-xs font-medium text-primary-500 group-hover:text-primary-600`，`@click.stop="handleOpen(notif)"` |
| 未读圆点 | `span`（`w-2 h-2 rounded-full bg-primary-500`） | `v-if="!notif.isRead"` |
| 标记已读 | `n-button`（`size="tiny" quaternary type="primary"`） | `v-if="!notif.isRead"`；图标 `CheckmarkCircleOutline`；`@click.stop` |
| 删除 | `n-button`（`size="tiny" quaternary type="error"`） | **恒显示**（已读未读都有）；图标 `TrashOutline`；`@click.stop` |
| 分页 | `n-pagination` | `v-if="pagination.itemCount > pagination.pageSize"`，容器 `flex justify-center mt-6`（居中，非右对齐） |
| 空态 | `EmptyState`（无卡片包裹） | 只传 `description="暂无通知"`、`:icon="NotificationsOutline"`；`title` 用默认值「暂无数据」；无 `#action` |
| 删除确认 | `useConfirm().confirmDanger` | 标题「删除通知」、内容「确定要删除这条通知吗？」、确认按钮「删除」 |
| 轻提示 | `useMessage()` | 成功「已全部标记已读」「已删除」；失败「加载通知失败」「操作失败」「删除失败」 |

类型元数据（`TYPE_META`，未命中回落 `DEFAULT_META`）：

| type | label | 图标 | iconClass | tagType |
|------|-------|------|-----------|---------|
| `GRADING_PENDING` | 批改待办 | `CreateOutline` | `bg-warning-50 text-warning-600` | `warning` |
| `GRADING_ASSIGNED` | 被指定为批改人 | `PersonAddOutline` | `bg-info-50 text-info-500` | `info` |
| `GRADING_DONE` | 批改完成 | `CheckmarkCircleOutline` | `bg-success-50 text-success-600` | `success` |
| `GRADING_TIMEOUT` | 批改超时 | `AlertCircleOutline` | `bg-error-50 text-error-500` | `error` |
| `COLLAB_INVITE` | 协作邀请 | `PeopleOutline` | `bg-info-50 text-info-500` | `info` |
| `REVIEW_RESULT` | 审核结果 | `ShieldCheckmarkOutline` | `bg-success-50 text-success-600` | `success` |
| `BANK_TRANSFER` | 题库转让 | `SwapHorizontalOutline` | `bg-info-50 text-info-500` | `info` |
| 其它 / 未知 | 系统通知 | `NotificationsOutline` | `bg-neutral-100 text-neutral-500` | `default` |

> 代码中**没有**通知分类 Tab（按类型筛选）、未读数角标、批量操作、搜索框、已读/未读之外的任何筛选控件。

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getNotifications(params)` → `/notifications` | GET | 分页查询；入参 `page` / `pageSize` / `isRead`（`filterIsRead ?? undefined`，选「全部」时不传）；`res.data.records` → `notifications`，`res.data.total` → `pagination.itemCount` |
| `markRead(id)` → `/notifications/{id}/read` | PUT | 单条标记已读；成功后本地 `notif.isRead = true`（不重新拉列表） |
| `markReadAll()` → `/notifications/read-all` | PUT | 全部标记已读；成功后本地遍历置 `isRead = true` 并 `message.success('已全部标记已读')` |
| `deleteNotification(id)` → `/notifications/{id}` | DELETE | 删除单条；成功后本地 `filter` 移除并 `message.success('已删除')` |

> `src/api/notification.ts` 中的 `list`（与 `getNotifications` 同路径）、`getUnreadCount`（`/notifications/unread-count`）、`markAllRead`（与 `markReadAll` 同路径）本页**未使用**。

### 交互逻辑

- `onMounted` → `fetchList()`（`loading=true` → `getNotifications({page, pageSize, isRead})` → `finally loading=false`）。
- 分段控件 `handleTabChange(value)`：与当前值相同直接 return；否则写入 `filterIsRead` 并 `handleSearch()`（`page=1` 后重新拉取）。
- `handlePageChange(page)`：更新 `pagination.page` 后重新拉取；`pageSize` 固定 20，无每页条数切换、无快速跳页。
- `handleMarkRead(notif)`：`markRead(id)` → 本地置已读；失败 `message.error('操作失败')`。
- `handleReadAll()`：`markReadAll()` → 本地全部置已读 + `message.success('已全部标记已读')`；失败 `message.error('操作失败')`。**无确认弹窗**。
- `handleDelete(notif)`：`confirmDanger` 确认 → `deleteNotification` → 成功 `已删除` / 失败 `删除失败`。
- **点击通知（`handleOpen`）**：
  1. `resolveNotificationRoute(notif)` 返回空 → **直接 return**（整卡不可点、无「查看详情」，点击无反应）；
  2. 有路由且未读 → 先 `markRead(id)` 再跳转（阅读即消费；标记失败静默 `catch`，不阻断跳转）；
  3. `router.push(route)`。
- **`resolveNotificationRoute`（`src/utils/notificationRoute.ts`）跳转规则**：
  - `notif.link` 非空 → **直接返回 link**（服务端显式指定，覆盖一切约定）；
  - 否则按 `type + relatedId` 约定式兜底：
    - `GRADING_PENDING` → `/grading/sessions/{relatedId}`，无 `relatedId` → `/grading`
    - `GRADING_ASSIGNED` → `/grading`（固定，分配时可能尚无会话）
    - `GRADING_DONE` → `/exam/sessions/{relatedId}/result`，无 `relatedId` → `/records`
    - `GRADING_TIMEOUT` → `/papers`（固定，前端无法反查 paperId）
    - `REVIEW_RESULT` / `COLLAB_INVITE` / `BANK_TRANSFER` 及其它 → `null`（无法从 `relatedId` 单独构造，依赖后端 link）
- 时间统一 `dayjs(createdAt).format('YYYY-MM-DD HH:mm')`。

### 空态 / 加载态 / 错误态

- **加载态**：`loading=true` → `n-spin` 遮罩覆盖列表区（无骨架屏）；首次加载、切 Tab、翻页均走同一遮罩，不区分「已有数据」。
- **空态**：`!loading && notifications.length === 0` → `EmptyState`：图标 `NotificationsOutline`（56px，`neutral-300`），标题「暂无数据」（组件默认值）、描述「暂无通知」，无操作按钮、无卡片包裹。未读/已读 Tab 下无数据时文案不变（代码不区分）。
- **错误态**：无 `LoadError`、无页面级错误块；仅 `message.error('加载通知失败')`（顶部 toast），列表回落到空态或保留上一次结果。
- **无跳转通知**：`resolveNotificationRoute` 返回空时无 `cursor-pointer`、无 hover 效果、无「查看详情」，点击整卡不响应。

### 响应式

- 列表项恒为「图标 / 内容 / 右列操作」横向布局，代码未设断点；内容区 `flex-1 min-w-0`，标题行 `flex-wrap` 自适应换行。
- 右列操作 `flex-col items-end gap-2 flex-shrink-0 pt-0.5`，窄屏靠文本换行与 `min-w-0` 自适应。
- 分段控件为 `inline-flex` 胶囊组，宽度不足时整体不换行（文案固定为全部/未读/已读三档）。
- 分页 `flex justify-center mt-6`，`itemCount ≤ 20` 时整块不渲染。
- 外壳：`.app-content` `max-w-content` 居中；侧边栏 <1024px 抽屉化（`.sidebar.mobile-open`），顶栏 <768px 显示汉堡按钮并隐藏搜索框。


## 14. 个人中心

- **路由**: `/profile`（路由名 `UserProfile`，MainLayout 子路由，`router/index.ts:187`，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`）
- **Vue 文件**: `src/views/profile/Profile.vue`
- **Mockup**: `mockups/14-profile.html`
- **布局**: Sidebar + Header
- **权限**: 任意已登录角色（USER / ADMIN / SUPER_ADMIN 均可见，页面内无按角色隐藏的模块）；`/profile` **不在侧边栏菜单中**，故侧边栏无任何 `active` 项；顶栏标题「个人中心」取自 `MENU_TITLES['/profile']`（`MainLayout.vue:286`）。入口只来自顶栏头像下拉「个人中心」（`MainLayout.vue:265` → `router.push('/profile')`）

### 页面结构

```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar(240, 无高亮) │ Header(64): 个人中心                    │
│                      ├─ 无 PageHeader，直接进入横幅            │
│                      ├─ n-spin(:show=loading) 包裹以下全部      │
│                      │  ├─ 用户信息横幅(rounded-xl mb-6)       │
│                      │  │   ├─ 顶部 h-24 品牌浅渐变条          │
│                      │  │   ├─ 头像 80×80(首字母) -mt-10 叠压   │
│                      │  │   │  昵称 + 角色pill / 下一行 @用户名 │
│                      │  │   └─ 3 列：加入时间 | 邮箱 | 账号状态 │
│                      │  └─ grid-cols-1 lg:grid-cols-3 gap-4    │
│                      │      ├─ 左(lg:col-span-2) space-y-4     │
│                      │      │  ├─ 基本信息：用户名(disabled)    │
│                      │      │  │   昵称* / 邮箱 → 「保存修改」  │
│                      │      │  └─ 修改密码：当前密码* / 新密码*  │
│                      │      │      确认新密码* → 「修改密码」   │
│                      │      └─ 右 space-y-4                    │
│                      │         ├─ AI Key 配置                  │
│                      │         └─ 账号安全 → 账号注销           │
└──────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 加载遮罩 | `n-spin`（`:show="loading"`） | 包裹横幅 + 两栏全部内容；无骨架屏 |
| 用户信息横幅 | `div`（`bg-white border border-neutral-200 rounded-xl mb-6 relative overflow-hidden`） | 内嵌 `h-24 bg-brand-soft` 渐变条；内容区 `px-5 sm:px-8 pb-5 sm:pb-6` |
| 头像 | `div`（`w-20 h-20 rounded-full bg-brand-gradient ring-4 ring-white shadow-md`） | 纯首字母，无上传、无 `n-avatar`；`avatarText = (nickname \|\| username \|\| '?').charAt(0).toUpperCase()` |
| 显示名 | `span`（`text-xl font-bold`） | `displayName = nickname \|\| username \|\| '未设置昵称'` |
| 角色标签 | `span`（`px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600`） | `ROLE_LABELS`：`USER→普通用户`、`ADMIN→管理员`、`SUPER_ADMIN→超级管理员`；映射为空时不渲染 |
| 用户名 | `div`（`text-sm text-neutral-500 mt-1`） | `@{{ username \|\| '—' }}` |
| 三列信息 | `div`（`grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t`） | 加入时间 `dayjs(createdAt).format('YYYY-MM-DD')` 或 `—`；邮箱 `email \|\| '未设置'`；账号状态恒为「正常」（`text-success-600`） |
| 区块卡片 | `div`（`bg-white border border-neutral-200 rounded-lg`） | 卡头 `flex items-center justify-between px-5 py-4 border-b`，标题 `text-base font-semibold`；**无图标** |
| 资料表单 | `n-form`（`label-placement="top"`） | 用户名（`:value` + `disabled`）/ 昵称（`maxlength=50`）/ 邮箱（`maxlength=100`，placeholder「选填，用于找回密码」） |
| 密码表单 | `n-form`（`label-placement="top"`） | 三个 `n-input type="password" show-password-on="click"`；新密码 `maxlength=64`、placeholder「密码长度 8-64 位」 |
| 主按钮 | `n-button type="primary"` | 「保存修改」/「修改密码」，右对齐 `flex justify-end`，无图标 |
| AI Key（未配置） | `n-input password` + `n-button size="small" type="primary"` | placeholder「输入 API Key」，回车 `@keyup.enter="handleSetAiKey"`；按钮 `:disabled="!newAiKey.trim()"` |
| AI Key（已配置） | `code` + `n-tag size="small" type="success" :bordered="false"` + `n-button size="small" type="error" quaternary` | 显示 `maskedKey \|\| 'sk-****'` +「已配置」；仅「删除 Key」（`TrashOutline`），**无「更新 Key」** |
| AI Key 说明 | `p`（`flex items-start gap-2 text-xs text-neutral-500`）+ `n-icon` | `InformationCircleOutline`（15px）+「API Key 加密存储，仅用于 AI 评分建议」；**不是 alert 块** |
| 账号安全列表 | `div`（`divide-y divide-neutral-200 text-sm`） | 三行：账号用户名 / 角色 / 账号状态（「正常」`text-success-600`） |
| 注销区 | `div` + `n-button size="small" type="error" quaternary` | 小标题「账号注销」（`text-xs font-semibold uppercase text-error-600 pt-4 mt-1 border-t`）+「注销账号」（`CloseCircleOutline`）+ 提示「注销后不可恢复，私有数据将被清除」 |
| 二次确认 | `useConfirm().confirmDanger` → `dialog.error` | 删除 Key：标题「删除 AI Key」/「确定要删除当前配置的 AI Key 吗？」/ 主按钮「删除」；注销：标题「确认注销」/「确定要注销账号吗？此操作不可撤销！」/ 主按钮「确定注销」；负按钮默认「取消」 |
| 轻提示 | `useMessage()` | success / error / warning，均为顶部 toast |

> 说明：本页**没有** Tab 切换、**没有**头像上传、**没有**「编辑资料」按钮、**没有**个人简介与题库数 / 试卷数 / 练习次数等统计项，也**没有**最近登录、登录设备、两步验证等安全项 —— 以上均不在 `Profile.vue` 中。

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getProfile()` → `/user/profile` | GET | 页面唯一数据源，写入 `profile.username/nickname/email`、`profileRole`、`profileCreatedAt` |
| `updateProfile({ nickname, email })` → `/user/profile` | PUT | 「保存修改」；`email` 为空串时传 `undefined` |
| `changePassword({ oldPassword, newPassword, confirmPassword })` → `/user/password` | PUT | 「修改密码」，成功后清空三个字段 |
| `getAiKey()` → `/user/ai-key` | GET | 运行时实际返回 `{ hasKey, maskedKey }`（`api/user.ts` 类型声明为 `{ key }`，代码在 `Profile.vue:308` 处断言收敛） |
| `setAiKey({ apiKey })` → `/user/ai-key` | PUT | 运行时字段为 `apiKey`（类型声明为 `{ key }`，在 `Profile.vue:364` 处断言）；成功后清空输入并重新拉取 |
| `deleteAiKey()` → `/user/ai-key` | DELETE | 成功后本地 `aiKeyInfo = null`（回到未配置分支） |
| `deactivateAccount()` → `/user/account` | DELETE | 注销账号，成功后 `router.push('/login')` |

### 交互逻辑

- `onMounted` 并行 `fetchProfile()` 与 `fetchAiKey()`；`fetchProfile` 期间 `loading=true`，失败 `message.error('加载个人信息失败')`；`fetchAiKey` 失败静默 `catch` 忽略（`aiKeyInfo` 保持 `null` → 显示未配置分支）。
- 「保存修改」：`handleSaveProfile` **不调用** `validate()`，直接 `updateProfile`；成功 `message.success('保存成功')`、失败 `message.error('保存失败')`；`savingProfile` 控制按钮 loading。昵称校验只在 `blur` 时呈现 —— 即使昵称非法，点击仍会发起请求。
- 「修改密码」：先 `passwordFormRef.validate()`，失败直接 `return`；通过后 `changePassword`，成功 `message.success('密码修改成功')` 并清空表单；失败按 `err.response.data.code === 10106` 显示「旧密码错误」，否则「修改密码失败」。
- 「设置 Key」：空值先 `message.warning('请输入 API Key')` 返回；否则提交，成功 `message.success('设置成功')` 并刷新状态，失败 `message.error('设置失败')`。
- 「删除 Key」/「注销账号」：`confirmDanger` 二次确认；注销成功 `message.success('账号已注销')` 后跳 `/login`，失败 `code === 20501` → `message.error('你持有公开题库或试卷，请先转让所有权')`，否则「注销失败」。
- 头像为纯首字母展示，无任何上传 / 裁剪 / 预览交互。

### 空态 / 加载态 / 错误态

- **加载态**：`loading=true` → `n-spin` 遮罩覆盖横幅与两栏全部内容（无骨架屏）；此时横幅显示 `未设置昵称` / `@—` / 加入时间 `—` / 邮箱 `未设置`。
- **空态**：无列表，故无 EmptyState。邮箱为空显示「未设置」，用户名 / 角色为空显示 `—`，`createdAt` 为空显示 `—`，`roleLabel` 为空则角色 pill 整块不渲染。
- **AI Key 未配置**（`aiKeyInfo === null` 或 `hasKey === false`）：显示密码输入框 + 禁用的「设置 Key」按钮；已配置时显示掩码 Key +「已配置」+「删除 Key」。
- **错误态**：无页面级错误块；所有失败仅以 toast 呈现（`加载个人信息失败` / `保存失败` / `旧密码错误` / `修改密码失败` / `设置失败` / `删除失败` / `注销失败` / `你持有公开题库或试卷，请先转让所有权`）；校验错误则以内联红字反馈呈现。

### 响应式

- 横幅三列信息 `grid-cols-1`，≥640px（`sm`）起 `grid-cols-3`；内边距 `px-5 pb-5` → `sm:px-8 sm:pb-6`；头像与信息间距 `gap-4` → `sm:gap-5`。
- 主区 `grid-cols-1`，≥1024px（`lg`）起 `lg:grid-cols-3`（左 `lg:col-span-2` ≈ 2fr / 右 1fr），`gap-4`，列内 `space-y-4`。
- 表单为 `label-placement="top"` 单列，代码未用 `n-grid`，窄屏靠宽度自适应。
- 外壳：`.app-content` `max-w-content` 居中；侧边栏 <1024px 抽屉化（`.sidebar.mobile-open`），顶栏 <768px 显示汉堡按钮并隐藏搜索框。


## 15. 用户管理

- **路由**: `/admin/users`（MainLayout 子路由，`meta: { requiresAdmin: true }` → 需登录且需管理员角色）
- **Vue 文件**: `src/views/admin/UserList.vue`
- **Mockup**: `mockups/15-admin-users.html`
- **布局**: Sidebar + Header
- **权限**: 仅管理员可见（requiresAdmin）；页面内还有二级权限：`isSuperAdmin`（`role === 'SUPER_ADMIN'`）控制「新建管理员」入口与「移除管理员 / 删除」操作

### 页面结构

```
┌────────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=用户管理) │ Header(64): 用户管理              │
│               ├─ PageHeader: 用户管理                            │
│               │   subtitle「管理用户账号、角色与状态」             │
│               │   actions: 新建管理员(n-button primary,          │
│               │             v-if=isSuperAdmin, PersonAddOutline) │
│               ├─ 筛选行 flex flex-wrap gap-3                     │
│               │   ├─ n-input 搜索(260px, 前缀 SearchOutline,     │
│               │   │        placeholder「搜索用户名/昵称」,        │
│               │   │        clearable, 回车触发搜索)               │
│               │   ├─ n-select 状态(140px, clearable)             │
│               │   └─ n-select 角色(160px, clearable)             │
│               ├─ bg-white border rounded-lg 包裹                 │
│               │   n-data-table(remote, :loading, bordered=false) │
│               │   列：ID(80) | 用户(180, 头像+用户名+@username)   │
│               │       | 昵称(120, ellipsis tooltip) | 邮箱(ellipsis)│
│               │       | 角色(110, NTag round) | 状态(90, 居中NTag)│
│               │       | 注册时间(160, YYYY-MM-DD HH:mm)          │
│               │       | 操作(250)                                │
│               │   分页：page/pageSize=20/itemCount(remote)        │
│               └─ n-modal(480, preset=card)「新建管理员」           │
└────────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader` | `title="用户管理"` `subtitle="管理用户账号、角色与状态"`；`#actions` 插槽放新建管理员按钮 |
| 新建管理员按钮 | `n-button type=primary` | 图标 `PersonAddOutline`，文案「新建管理员」，`v-if="isSuperAdmin"`（仅超管可见） |
| 搜索框 | `n-input` | `v-model=searchKeyword`，placeholder「搜索用户名/昵称」，clearable，宽 260px，前缀 `SearchOutline`，`@keyup.enter=handleSearch` |
| 状态筛选 | `n-select` | 宽 140px，clearable，placeholder「状态」，`@update:value=handleSearch`；选项：正常=ACTIVE、禁用=DISABLED |
| 角色筛选 | `n-select` | 宽 160px，clearable，placeholder「角色」，`@update:value=handleSearch`；选项：用户=USER、管理员=ADMIN、超级管理员=SUPER_ADMIN |
| 用户表格 | `n-data-table` | `remote`、`bordered=false`、`:loading`、`:pagination`，外层 `bg-white border border-neutral-200 rounded-lg` |
| 角色标签 | `NTag`（h 渲染） | size=small、round、bordered=false；USER→primary「用户」、ADMIN→error「管理员」、SUPER_ADMIN→warning「超级管理员」 |
| 状态标签 | `NTag`（h 渲染） | size=small、round、bordered=false；ACTIVE→success「正常」、DISABLED→default「禁用」；列居中 |
| 用户列 | 自定义 render | 32px 圆形头像（`bg-brand-gradient`，昵称/用户名首字母大写）+ 用户名（加粗）+ `@username`（灰色小字） |
| 操作列 | 自定义 render（a 链接） | 无权限时显示灰色「—」；链接色照抄 class：重置密码=primary、禁用=warning/启用=success、移除管理员/删除=error |
| 新建管理员弹窗 | `n-modal`（preset=card, width 480px） | 表单：搜索用户（输入框+「搜索」按钮）、选择用户（n-select filterable，有结果才显示）、或直接输入用户ID、底部「确认」按钮（block，:loading=creatingAdmin） |
| 消息提示 | `useMessage` | 成功/失败/警告 message |
| 确认与信息弹窗 | `useDialog` + `useConfirm` | `confirmDanger`（删除用户）、`dialog.info`（重置密码结果） |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/admin/users` | GET | 分页获取用户列表（params: page、size、keyword、status、role），来自 `getUserList` |
| `/admin/users/{id}/status` | PUT | 启用/禁用用户（body: status=ACTIVE/DISABLED），来自 `updateUserStatus` |
| `/admin/users/{id}` | DELETE | 删除用户，来自 `deleteUser` |
| `/admin/users/{id}/password` | PUT | 重置密码，返回 `{ newPassword }`，来自 `resetPassword` |
| `/admin/admins` | POST | 新建管理员（body: userId），来自 `createAdmin` |
| `/admin/admins/{id}` | DELETE | 移除管理员，来自 `removeAdmin` |
| `/admin/users`（listUsers） | GET | 弹窗内按关键词搜索用户（page=1, size=20），用于「选择用户」下拉 |

### 交互逻辑

- 进入页面 `onMounted → fetchList()`；搜索/筛选变更会把 `page` 重置为 1 再拉取；`handlePageChange` 换页后重新拉取（remote 分页）。
- `canOperate(row)` 控制操作列：**不能操作自己**；普通管理员（ADMIN）只能操作 USER；超管（SUPER_ADMIN）不能操作同级超管。不满足时操作列渲染灰色「—」。
- 「重置密码」：调用 `resetPassword`，成功后 `dialog.info` 弹出「密码已重置 / 新密码：xxx / 已复制」；失败 message「重置密码失败」。
- 「禁用/启用」：按当前状态取反（ACTIVE↔DISABLED）调用 `updateUserStatus`，成功 message「操作成功」并刷新列表；失败 message「操作失败」。
- 「移除管理员」（仅超管且 row.role=ADMIN 可见）：调用 `removeAdmin`，成功 message「已移除管理员」并刷新；失败 message「移除失败」。
- 「删除」（仅超管可见）：`confirmDanger` 弹窗「确认删除 / 确定要删除用户「{username}」吗？/ 确定删除」；成功 message「删除成功」并刷新；后端 code=20501 时 message「该用户持有公开题库或试卷，无法删除」，其他失败 message「删除失败」。
- 「新建管理员」弹窗：可按用户名搜索（结果为空 message「未找到匹配的用户」，选项格式 `username (nickname) - ID: x`）或直接输入用户ID；两者取一作为 targetId，为空时 message.warning「请选择用户或输入用户ID」；成功 message「创建成功」并清空表单、关闭弹窗、刷新列表；失败 message「创建失败」。
- 角色筛选/状态筛选变更立即触发搜索；状态枚举文案：ACTIVE=正常、DISABLED=禁用；角色枚举文案：USER=用户、ADMIN=管理员、SUPER_ADMIN=超级管理员。

### 空态 / 加载态 / 错误态

- **加载态**：`fetchList` 期间 `loading=true`，`n-data-table` 显示自带加载遮罩（无骨架屏）。
- **空态**：`records` 为空时 `n-data-table` 显示默认空态（zhCN locale「无数据」）；表格区始终渲染外层白底卡片。
- **错误态**：列表加载失败 message.error「加载用户列表失败」；各操作失败均有对应错误 message（见交互逻辑）；无全局错误页。

### 响应式

- 外壳响应式与其他 MainLayout 页面一致：侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open`），顶栏 <768px 隐藏全局搜索框。
- 筛选行 `flex flex-wrap items-center gap-3 mb-4`：窄屏下搜索框（260px）、状态（140px）、角色（160px）自动换行。
- `n-data-table` 各列固定宽度（ID 80 / 用户 180 / 昵称 120 / 角色 110 / 状态 90 / 注册时间 160 / 操作 250），邮箱列弹性自适应；内容超长用 `ellipsis: { tooltip: true }` 截断（昵称、邮箱）。
- 新建管理员弹窗固定 480px 宽，小屏下受 `max-height: 90vh` 与滚动约束。


## 16. 确认弹窗（全局 useConfirm）

- **Vue 文件**: src/composables/useConfirm.ts
- **Mockup**: `mockups/16-confirm-dialog.html`
- **布局**: 弹窗（Modal）

### 页面结构

```
┌─ 宿主页面（任意页面，如通知/试卷/管理列表）─────────────┐
│  ┌─ 遮罩 .modal-overlay（rgba(0,0,0,.4)，全屏）───────┐  │
│  │  ┌─ 弹窗 .modal.confirm-dialog（400px，圆角16px）─┐│  │
│  │  │           ┌──────────────┐                    ││  │
│  │  │           │ confirm-icon │ 48px 圆形，类型配色 ││  │
│  │  │           └──────────────┘                    ││  │
│  │  │          confirm-title（居中，粗体）            ││  │
│  │  │          confirm-desc（居中，次级色）           ││  │
│  │  │   ┌──────────┐  ┌──────────────────┐          ││  │
│  │  │   │ negative │  │ positive(主/红)   │          ││  │
│  │  │   └──────────┘  └──────────────────┘          ││  │
│  │  └───────────────────────────────────────────────┘│  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

  confirm        → 图标 warning 色，positive 为品牌色按钮
  confirmDanger  → 图标 danger 色，positive 为红色按钮（type:'error'）
```

### 参数清单

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | confirm: '确认操作' / confirmDanger: '确认删除' | 弹窗标题 |
| content | string | confirm: '确定要执行此操作吗？' / confirmDanger: '此操作不可撤销，确定继续吗？' | 正文描述 |
| positiveText | string | confirm: '确认' / confirmDanger: '删除' | 确认按钮文案 |
| negativeText | string | '取消' | 取消按钮文案 |
| onPositiveClick | () => void \| Promise | — | 点击确认回调，支持 async |
| （固定注入）positiveButtonProps | { type: 'error' } | 仅 confirmDanger | 确认按钮呈红色 |
| （固定注入）style | 'border-radius: 16px;' | confirm / confirmDanger 均注入 | 容器圆角 |

> `ConfirmActionOptions = Partial<Pick<DialogOptions, 'title' | 'content' | 'positiveText' | 'negativeText' | 'onPositiveClick'>>`，全部可选。代码中不存在 confirmText 参数。

### 真实调用场景

- **删除通知（confirmDanger）** — `src/views/notification/NotificationList.vue`：
  `{ title: '删除通知', content: '确定要删除这条通知吗？', positiveText: '删除' }`；成功 `message.success('已删除')`，失败 `message.error('删除失败')`。
- **删除标签（confirmDanger，默认按钮文案）** — `src/components/common/TagManageModal.vue`：
  `{ title: '确认删除', content: '确认删除标签「{tag.name}」？' }`（positiveText/negativeText 未传，走默认「删除/取消」）；成功 `message.success('标签已删除')`，失败 `message.error('删除失败（仅管理员可删除未被引用的标签）')`。
- **确认交卷（confirm，普通确认）** — `src/views/exam/ExamPage.vue`：
  `{ title: '确认交卷', content, positiveText: '确认交卷' }`；content 按未答数动态拼接：有未答 → `已答 {answered} 题，还有 {remain} 道题未作答。确定要提交试卷吗？`，无未答 → `已答 {answered} 题，确定要提交试卷吗？`。

### 交互逻辑

- 使用形态：`const { confirm, confirmDanger } = useConfirm()`；依赖 App.vue 中的 `<n-dialog-provider>`。
- `confirm(opts)` 底层 `dialog.warning`：普通确认，主按钮品牌色；无 onPositiveClick 时点击确认仅关闭弹窗。
- `confirmDanger(opts)` 底层 `dialog.error`：危险操作确认，确认按钮红色（`positiveButtonProps: { type: 'error' }`）；点击确认执行 `onPositiveClick`（支持 async），成功后通常 `message.success` 并刷新列表，失败 `message.error`。
- 两个方法均注入 `style: 'border-radius: 16px;'`；negativeText 默认「取消」，点击取消直接关闭，无额外回调。


## 17. 骨架屏（SkeletonList）

- **Vue 文件**: `src/components/common/SkeletonList.vue`
- **Mockup**: `mockups/17-skeleton-loading.html`
- **布局**: 内容区占位组件（加载态通用）

### 页面结构

```
┌──────────────────────────────┐
│ .skeleton-list (grid, gap 16px) │
│  ┌─ .sk-item ──────────────┐ │
│  │  sk-line-head（1 行粗线） │ │
│  │  3 行文本线               │ │
│  │  40% 宽度文本线            │ │
│  └──────────────────────────┘ │
│  （重复 count 个，按 cols 分列） │
└──────────────────────────────┘
```

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| count | number | 3 | 骨架卡片数量 |
| cols | number | 3 | 网格列数（列表场景传 1） |

### 说明

- 每个 `.sk-item` 为白底卡片（1px 边框 + `--radius-lg` 圆角 + `--space-5` 内边距），内部为 `n-skeleton` 文本线：首行 1 条加粗线（`sk-line-head`，下边距 16px），中间 3 条文本线，末尾 1 条 40% 宽度文本线。
- 网格列数 class 为 `grid-cols-1/2/3`，`<768px` 时 `grid-cols-2/3` 回退为单列。
- 列表场景（题库、试卷、练习记录、收藏、待批改等）普遍以 `count=3~5, cols=1` 使用。

## 18. 收藏题目

- **路由**: `/favorites`（路由名 `FavoritesPage`，MainLayout 子路由，无 `meta` → `requiresAuth !== false` 成立，需登录；无 `requiresAdmin`）
- **Vue 文件**: `src/views/favorite/FavoriteList.vue`
- **Mockup**: `mockups/18-favorites.html`
- **布局**: Sidebar + Header
- **权限**: 登录用户（「收藏题目」属侧边栏「学习中心」分组，需登录可见；未登录访问被守卫重定向到 `/login?redirect=/favorites`）

### 页面结构

```
┌──────────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=收藏题目) │ Header(64): 收藏题目               │
│               ├─ PageHeader: 收藏题目                             │
│               │   subtitle「共 {itemCount} 道收藏题目」            │
│               │   actions: [批量导出](secondary, loading=exporting)│
│               ├─ StatCard ×3（grid-cols-2 lg:grid-cols-4）        │
│               │   收藏总数(brand,Star) · 本周新增(success,Add)     │
│               │   本月练习(warning,BarChart)                       │
│               ├─ FilterBar                                        │
│               │   题库下拉(全部题库) · 标签下拉(全部标签) · | ·    │
│               │   题型 radio-button(全部/单选/多选/判断/填空/简答)  │
│               │   · | · 排序下拉(最近收藏/收藏时间最早)             │
│               ├─ [v-if loading&&favList空] SkeletonList(4,1)      │
│               ├─ [v-else-if favList>0]                            │
│               │   fav-card ×N（flex-col gap-3）                   │
│               │   左180px: star图标 + 题型tag/难度tag(round)      │
│               │   中flex-1: 题干plainContent(点击跳原题)           │
│               │            meta: 题库名(Library) 标签名(Pricetag)  │
│               │   右: favoritedAt(YYYY-MM-DD) · 查看详情 · 取消收藏│
│               │   [itemCount>pageSize] n-pagination(右对齐)        │
│               └─ [v-else] EmptyState                              │
│                   「暂无收藏题目」(StarOutline 图标)               │
└──────────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader` | `title="收藏题目"`；`subtitle` 仅 `pagination.itemCount > 0` 时显示（`共 {itemCount} 道收藏题目`）；`actions` 插槽放批量导出按钮 |
| 导出按钮 | `n-button`（`secondary`，`:loading="exporting"`） | 图标 `DownloadOutline`，文案「批量导出」，点击 `handleExport`（导出 JSON：`收藏题目导出_{nowStamp}.json`） |
| 统计卡 | `StatCard` ×3 | `label/value/tone`：收藏总数=`stats.total`(brand, 后缀 StarOutline)、本周新增=`stats.thisWeekNew`(success, AddCircleOutline)、本月练习=`stats.thisMonthPractice`(warning, BarChartOutline)；接口失败保持 0 占位 |
| 筛选栏 | `FilterBar`（容器） | 内含 4 个控件，见下 |
| 筛选：题库 | `n-select`（`clearable filterable`，宽 200px） | `bankOptions` 来自 `getBankList({page:1,size:200})`；placeholder「全部题库」；变更即 `handleSearch` |
| 筛选：标签 | `n-select`（`clearable filterable`，宽 200px） | `tagOptions` 来自 `getTagList()`；placeholder「全部标签」；变更即 `handleSearch` |
| 筛选：题型 | `n-radio-group`（`size="small"`）+ `n-radio-button` | 选项 `TYPE_OPTIONS`：全部(null)/单选(SINGLE)/多选(MULTIPLE)/判断(TRUE_FALSE)/填空(FILL_BLANK)/简答(SHORT_ANSWER)；变更即 `handleSearch` |
| 筛选：排序 | `n-select`（宽 160px） | `SORT_OPTIONS`：最近收藏(`favoritedAt_desc`，默认) / 收藏时间最早(`favoritedAt_asc`)；变更即 `handleSearch` |
| 加载骨架 | `SkeletonList`（`:count="4"` `:cols="1"`） | 条件 `loading && favList.length === 0` |
| 列表项 | `div`（`bg-white border border-neutral-200 rounded-lg px-5 py-4`） | hover 加 `border-primary-300` + `shadow-sm`；三段布局见下 |
| 列表项·左 | `n-tag`（`size="small" round`）×2 | 题型 tag（`QUESTION_TYPE_MAP`：单选题/多选题/判断题/填空题/简答题/编程题；色：SINGLE=info/MULTIPLE=warning/TRUE_FALSE=success/FILL_BLANK=default/SHORT_ANSWER|PROGRAMMING=primary）+ 难度 tag（EASY=success/MEDIUM=warning/HARD=error，`v-if="row.difficulty"`）；左侧 32px 星形图标块（Star，primary-50 底） |
| 列表项·中 | 题干 + meta | 题干 `plainContent`（snapshot.content 去 HTML），为空显示「（内容已缺失）」，`truncate`；点击进原题 `/banks/{bankId}/questions/{questionId}`；meta：题库名（LibraryOutline，`v-if="row.bankName"`）、标签名「、」连接（PricetagOutline，`v-if tagNames.length`），`text-xs text-neutral-400` |
| 列表项·右 | `n-button`(size=small quaternary) ×2 | 日期 `formatTime(favoritedAt)`=`YYYY-MM-DD`；「查看详情」(primary) 与「取消收藏」(error)；**没有**做题/开始练习按钮 |
| 分页 | `n-pagination` | `v-if="pagination.itemCount > pagination.pageSize"`；右对齐（`justify-end mt-5`）；`page/pageSize=20/itemCount` |
| 空态 | `EmptyState`（icon=StarOutline） | 外层白卡包裹；title「暂无收藏题目」；description「浏览题库或做题时点击收藏，题目会自动收录到这里，方便集中复习」 |
| 确认弹窗 | `useConfirm().confirmDanger` | 取消收藏前确认：title「取消收藏」、content「确定要取消收藏该题目吗？」、positive「取消收藏」 |
| 提示 | `useMessage` | 成功「已取消收藏」/「导出成功」；失败「操作失败」/「导出失败」/「加载收藏失败」；跳原题缺参数时 warning「无法跳转原题」 |

> 说明：本页**没有**批量操作栏、收藏夹分组、开始做题按钮、手动刷新按钮；统计卡为 `getFavoriteStats`（后端就绪前显示 0 占位，代码标注 TODO）。

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `listFavorites({page,size,bankId,tagId,type,sortBy})` → `/favorites` | GET | 列表分页查询，返回 `PageResult<FavoriteItem>`；`size=20`，`sortBy` 默认 `favoritedAt_desc` |
| `cancelFavorite(id)` → `/favorites/{id}` | DELETE | 按收藏记录 ID 取消收藏，成功后 `fetchList()` 刷新 |
| `getFavoriteStats()` → `/favorites/stats` | GET | 统计卡数据（总数/本周新增/本月练习），失败静默保持 0 |
| `exportFavorites({bankId,tagId,type})` → `/favorites/export` | GET(blob) | 按当前筛选条件批量导出 JSON |
| `getBankList({page:1,size:200})` → 题库接口 | GET | 题库筛选下拉选项 |
| `getTagList()` → 标签接口 | GET | 标签筛选下拉选项 |

### 交互逻辑

- `onMounted` 并行触发 `loadOptions()` + `fetchStats()` + `fetchList()`。
- `fetchList`：`loading=true` → `listFavorites` → `records.map(toRow)`（从 `questionSnapshot` JSON 解析 `type/difficulty/content`，`stripHtml` 得 `plainContent`）→ 更新 `itemCount`；失败 `message.error('加载收藏失败')`。
- 筛选变更（题库/标签/题型/排序）统一走 `handleSearch()`：重置 `page=1` 后 `fetchList`。
- 行点击（题干区或「查看详情」）：`bankId && questionId` 存在 → 跳 `/banks/{bankId}/questions/{questionId}`，否则 warning「无法跳转原题」。
- 「取消收藏」：`confirmDanger` 二次确认 → `cancelFavorite(row.id)` → success「已取消收藏」→ `fetchList()`；失败「操作失败」。
- 「批量导出」：`exporting=true` → `exportFavorites`（携带当前筛选）→ blob 下载 `收藏题目导出_{nowStamp}.json` → success「导出成功」；失败「导出失败」；finally 复位 loading。
- 分页：`handlePageChange(page)` 更新 page 后 `fetchList`。

### 空态 / 加载态 / 错误态

- **加载态**：`loading && favList.length === 0` → `SkeletonList(count=4, cols=1)` 骨架屏（非 spin 遮罩）。
- **空态**：非 loading 且 `favList.length === 0` → 白卡内 `EmptyState`（StarOutline / 「暂无收藏题目」/ 引导文案）；此时 PageHeader subtitle 因 `itemCount=0` 一并隐藏，统计卡仍显示（可能为 0）。
- **错误态**：列表/导出/取消失败均为顶部 `message.error` toast，不阻塞已渲染内容；统计接口失败静默保持 0 占位；跳原题参数缺失走 warning toast。

### 响应式

- 统计卡：`grid-cols-2`，≥1024px（`lg`）起 `grid-cols-4`（本页仅 3 张），`gap-4`。
- 列表项：三段横排；左列固定 180px，中列 `flex-1 min-w-0` + `truncate`，右列 `flex-shrink-0`；窄屏靠题干截断自适应，代码未做行内断点处理。
- 筛选栏 `flex-wrap`；题库/标签下拉各 200px、排序 160px。
- 内容区 `.app-content` `max-w-content` 居中；侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open` + overlay），顶栏 <768px 显示汉堡按钮并隐藏搜索框。


## 19. 代码运行台

- **路由**: `/playground`
- **Vue 文件**: `src/views/practice/Playground.vue`
- **Mockup**: `mockups/19-playground.html`
- **布局**: Sidebar + Header（MainLayout 外壳；侧边栏高亮「代码运行台」，顶栏标题「代码运行台」）
- **权限**: 登录用户（位于侧边栏「学习中心」分组，需登录可见；不落库、不计分）

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar(240) │ Header(64): 代码运行台                         │
│               ├─ Page Header: 代码运行台 + Playground badge    │
│               │   副标题「编写并运行任意语言的代码片段…」        │
│               │   恢复示例(sparkles) · 清空(trash,quaternary)  │
│               ├─ Editor Card                                   │
│               │   工具栏: 语言选择(n-select) · 文件名标签 · 分隔 │
│               │        主题切换(圆形icon) · 复制代码 · 全屏     │
│               │   代码编辑区(CodeMirror, 行号)                 │
│               │   stdin 面板: 标准输入(terminal) + textarea    │
│               │   运行栏: 运行(primary,loading) · Ctrl+Enter    │
│               │          单次运行 ≤ 30s                        │
│               ├─ Output Card                                   │
│               │   头: 输出结果(terminal) · 状态pill · 清空/复制  │
│               │   体: 空态 / 编译错误(红框) / stdout+stderr+元信息│
│               ├─ 示例代码 chips(js/py/java/ts/cpp/go 可点)      │
│               └─ Info 提示: 安全沙箱·不保存不落库不计入学习记录  │
└─────────────────────────────────────────────────────────────┘
   加载态: 运行按钮 :loading + 状态 pill「正在运行…」(hourglass)
   空态: 无输出 → TerminalOutline + 「点击「运行」执行代码，输出将显示在这里」
   错误态: compileError 红框 / status error「运行失败」/ timedout「运行超时」
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 语言选择 | `n-select` (`:options="langOptions"`) | 列表来自 `getPlaygroundLanguages` API，默认 `langCode='js'` |
| 文件名标签 | `div.file-tab` | 显示 `currentLang.fileName`，默认 `main.js` |
| 主题切换 | `n-button` quaternary circle | `toggleTheme()` 切编辑器明暗（MoonOutline/SunnyOutline） |
| 复制代码 | `n-button` quaternary circle | `copyCode()` |
| 全屏编辑器 | `n-button` quaternary circle | `toggleFullscreen()` |
| 代码编辑区 | CodeMirror | 模式 JS/Python/clike/TS/C++/Go，行号，Ctrl/Cmd-Enter 运行 |
| 标准输入 | `textarea` (v-model stdin) | placeholder「标准输入：每行一个输入，行末自带换行」 |
| 运行 | `n-button type="primary" :loading="running"` | `run()` |
| 输出状态 | 动态 pill | `status`: idle / running / success / timedout / error |
| 编译错误 | `pre` 红框 | `compileError` |
| 标准输出 / 标准错误 | `pre` | `result.stdout` / `result.stderr`（stderr 红框） |
| 输出元信息 | `span`×3 | 退出码 `exitCode` / 耗时 `timeMs`(<0 显示「超时」) / `languageName` |
| 示例代码 chips | `n-tag` v-for `languages` | `insertSample(l.code)`；当前语言高亮 primary |
| 沙箱提示 | `n-alert type="info"` | 不保存、不落库、不计入学习记录 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getPlaygroundLanguages()` → `/playground/languages` | GET | 拉取支持语言列表（code/name/fileName/highlightName） |
| `runPlayground({languageCode, code, stdin})` → `/playground/run` | POST | 同步运行代码，返回 success/compileError/stdout/stderr/exitCode/timeMs/timedOut/languageName |

### 交互逻辑

- 进入页默认展示 JS 示例（`DEFAULT_SAMPLE_JS`），CodeMirror 初始化；语言列表异步加载，失败不阻塞（默认 JS 仍可用）。
- `onLangChange(lang)`：当前代码为空白或仍是任意语言示例模板时，自动填充新语言示例与配套 stdin（已编辑内容不覆盖）。
- `loadSample()`：按当前语言恢复示例 + 配套 stdin；`insertSample(lang)`：切换语言并填充示例 + stdin + 高亮 chip。
- `clearAll()`：清空代码与 stdin 并清输出；`clearOutput()`：result/compileError 置空、status 回 idle、显示空态。
- `run()`：空代码 `message.warning('请先编写代码')`；否则 `running=true`/status=running，调 `runPlayground`，按 `timedOut`/`success` 置 timedout/success/error；异常置 compileError=e.message、status=error。
- `copyCode()`/`copyOutput()`：写剪贴板并 toast。

### 空态 / 加载态 / 错误态

- **空态**：`hasOutput` 为假 → TerminalOutline + 「点击「运行」执行代码，输出将显示在这里」。
- **加载态**：运行按钮 `:loading="running"`；状态 pill running 显示「正在运行…」(HourglassOutline)，样式 warning。
- **错误态**：`compileError` 非空 → 红框显示「编译错误」；`result` 存在时 stderr 红框；状态 pill error「运行失败」/ timedout「运行超时」（均 warning 样式）。

### 响应式

- 内容区 `max-w-5xl` 居中；工具栏、运行栏、输出头部均 `flex-wrap` 窄屏换行。
- 编辑区最小高度 320px，代码超出滚动；stdout/stderr 框 `max-h-[220px]` 内滚动。
- 侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open`）；移动端顶栏显示汉堡按钮。


## 20. 考试记录

- **路由**: `/exam-records`
- **Vue 文件**: `src/views/exam/ExamRecords.vue`
- **Mockup**: `mockups/20-exam-records.html`
- **布局**: Sidebar + Header（顶栏回退「首页」且无侧边栏高亮，因 `/exam-records` 不在 MENU_TITLES）
- **权限**: `requiresAuth: false`

### 页面结构

```
h1[考试记录]
统计概览 (grid-cols-3): 参加考试 | 已批改 | 平均分
状态筛选药丸: 全部 / 已批改 / 批改中 / 未完成
记录列表 (card)
  行: [试卷标题][状态 tag][第 N 次?]  时间   得分   ›
（仅终态会话：IN_PROGRESS 被过滤）
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| StatCard | 自定义 | 参加考试(brand)/已批改/平均分(success) |
| EmptyState | 自定义 | 无记录时（action「去考试」） |
| n-spin | Naive UI | 加载 |
| n-button | Naive UI | 去考试 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getMyExamSessions` | GET `/my/exam-sessions` | 当前用户历史会话（仅终态计入） |

### 交互逻辑

- 状态筛选：全部 / 已批改(GRADED,COMPLETED) / 批改中(SUBMITTED,GRADING) / 未完成(EXPIRED,ABANDONED,CHEAT_SUBMITTED)。
- 点击行跳 `/exam/sessions/:id/result`。
- 状态 tag：`GRADED 已批改`/`COMPLETED 已完成`(success)、`SUBMITTED/GRADING 批改中`(warning)、`EXPIRED 已超时`/`ABANDONED 已放弃`/`CHEAT_SUBMITTED 作弊提交`(error)、`AUTO_SUBMITTED 到时自动交卷`(info)。
- `attemptNumber > 0` 时显示「第 N 次」。

### 空态 / 加载态 / 错误态

- 加载：`n-spin`。
- 空：`EmptyState`「还没有参加过的考试」，action 跳 `/papers`。
- 无独立错误页（接口异常仅中断加载）。

### 响应式

- 统计 `grid-cols-3`；记录行 `flex` 窄屏内部换行。

---


## 21. 待批改列表

- **路由**: `/grading`（路由名 `GradingList`，`src/router/index.ts`；`/grading/sessions/:id` 为批改详情）
- **Vue 文件**: `src/views/grading/GradingList.vue`
- **Mockup**: `mockups/21-grading-list.html`
- **布局**: Sidebar + Header（MainLayout 外壳；侧边栏无「批改」菜单项、无高亮，顶栏标题「批改」来自 `MENU_TITLES`）
- **权限**: 登录用户（`/grading` 未声明 `meta`，`requiresAuth` 默认 `true`；不要求管理员）

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar(240) │ Header(64): 批改                              │
│               ├─ PageHeader: 待批改                           │
│               │   subtitle 仅 itemCount>0 → 「共 N 份待批改」 │
│               ├─ 列表态（pendingList.length>0）               │
│               │   卡片×N（flex-col gap-3）                    │
│               │   左: DocumentTextOutline(primary-50 圆角底)  │
│               │   中: 试卷名(text-base/semibold)              │
│               │       + n-tag round warning「待批改」         │
│               │       提交人 PersonOutline · 时间 TimeOutline  │
│               │   右: 「去批改」n-button primary+quaternary     │
│               │   整卡 cursor-pointer → /grading/sessions/:id │
│               │   分页 n-pagination（itemCount>pageSize 才显示）│
│               ├─ 空态（pendingList===0 且非加载）              │
│               │   EmptyState「暂无待批改」+ 描述               │
│               └─ 加载态（loading && pendingList===0）          │
│                   SkeletonList(:count=3,:cols=1) 骨架×3       │
└─────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader` | `title="待批改"`；`:subtitle` 仅 `itemCount>0` 时显示「共 N 份待批改」 |
| 列表卡片 | `div.card` + `card-hover` | 每行一个 session；hover → `border-primary-300` + `shadow-sm`；整卡 `cursor-pointer` |
| 状态标签 | `n-tag`（`type="warning"` `round` `size="small"`） | 「待批改」圆角 warning 标签 |
| 图标 | `n-icon` `DocumentTextOutline` / `PersonOutline` / `TimeOutline` | 文档图标主色；提交人/时间用次色 |
| 去批改按钮 | `n-button`（`type="primary"` `quaternary` `size="small"`） | 跳转 `/grading/sessions/:id`，`@click.stop` 防整卡重复触发 |
| 分页 | `n-pagination` | 仅 `itemCount > pageSize`(=20) 渲染，右对齐；`@update:page` 切页 |
| 空态 | `EmptyState` | `title="暂无待批改"` `description="有作答者提交试卷后，会显示在这里等待你批改"` `:icon="DocumentTextOutline"` |
| 加载骨架 | `SkeletonList` | `:count="3"` `:cols="1"`，`loading && pendingList.length===0` 时显示 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getGradingPending({page, size})` → `/grading/pending` | GET | 拉取待批改分页列表，`res.data.records` 为行、`res.data.total` 为总数 |

### 交互逻辑

- `onMounted` 调 `fetchList()`；`page` 默认 1、`pageSize` 固定 20。
- 卡片整卡点击与「去批改」按钮均 `router.push('/grading/' + row.sessionId)` 进入批改详情；按钮用 `@click.stop` 避免冒泡重复跳转。
- 切页 `handlePageChange(page)`：更新 `pagination.page` 并重新 `fetchList()`。
- 行字段：`paperTitle`（缺省「未命名试卷」）、`userNickname`（缺省「未知用户」）、`submitTime` 经 `dayjs` 格式化为 `YYYY-MM-DD HH:mm`（空显「-」）。
- 请求失败 `message.error('加载待批改列表失败')`。

### 空态 / 加载态 / 错误态

- **加载态**：`loading && pendingList.length===0` → `SkeletonList`×3 骨架卡片。
- **空态**：`pendingList.length===0`（且非加载）→ `EmptyState`「暂无待批改 / 有作答者提交试卷后，会显示在这里等待你批改」。
- **错误态**：`fetchList` catch → `message.error('加载待批改列表失败')`（不影响已渲染内容）。

### 响应式

- 内容区 `max-w-content`(1280px) 居中；卡片 `flex` 在窄屏 `flex-wrap` 换行，图标与按钮 `flex-shrink:0`。
- 侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open` + overlay）；顶栏 <768px 显示汉堡按钮并隐藏搜索框。


## 22. 批改详情

- **路由**: `/grading/:id`（列表卡片 `router.push('/grading/' + row.sessionId)`；PageHeader 返回 `router.back()`；完成批改 `router.push('/grading')`）
- **Vue 文件**: `src/views/grading/GradingDetail.vue`
- **Mockup**: `mockups/22-grading-detail.html`
- **布局**: Sidebar + Header（MainLayout；顶栏标题「批改」，侧边栏无对应高亮项）
- **权限**: 需登录且具备批改权限（教师 / 管理员），经 MainLayout 守卫

### 页面结构

```
┌──────────────┬──────────────────────────────────────────────┐
│ Sidebar      │ Header: [批改]   [搜索题目/题库/试卷][🔔][王] │
│ (无高亮项)    ├──────────────────────────────────────────────┤
│              │ PageHeader: ← 标题(试卷名) / 副标题(用户·N题)  │
│              │              [完成批改](primary, 置灰条件见下) │
│              │ ┌─ 会话概览 card ──────────────────────────┐  │
│              │ │ 作答者(昵称)   试卷(标题)   共 N 题       │  │
│              │ └──────────────────────────────────────────┘  │
│              │ ┌─ Q1 card ────────────────────────────────┐  │
│              │ │ #1 第1题 [题型pill] 满分X分               │  │
│              │ │ 题干 │ 用户答案 │ 参考答案(双列)          │  │
│              │ │ 得分[input] [AI评分][关键词][保存得分]    │  │
│              │ │ 建议理由: 关键词✓/✗ tags + 推理文本       │  │
│              │ └──────────────────────────────────────────┘  │
│              │ ┌─ Q2 card ── (同结构, 未评分) ────────────┐  │
│              │ ┌─ Q3 card ── (同结构, 未作答→"未作答") ──┐  │
│              │ 关键词评分弹窗 (n-modal preset=card)         │
└──────────────┴──────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| PageHeader | `common/PageHeader` | 标题=试卷名(`paperTitle`)、副标题=`${user} 的作答 · ${N} 题`、showBack、右侧「完成批改」 |
| 加载包裹 | `n-spin :show="loading"` | 覆盖主视图（spinner，无骨架） |
| 会话概览 | `n-card` / 区块 | 作答者·试卷·共 N 题 |
| 题型标签 | `n-tag` round | `typeTagType()` 取色：单选=info/多选=warning/判断=success/填空=default/简答=primary |
| 题干/答案 | `RichText` | `题干`=`content`(JSON 快照取 `.content`)、`用户答案`=`userAnswer`(空显「未作答」)、`参考答案`=`referenceAnswer`(空显「无」) |
| 得分输入 | `n-input-number` | `:min="0" :max="maxScore??undefined"`、placeholder「未评分」、`id==null` 时 disabled |
| 评分按钮 | `n-button` | 幽灵「AI 评分建议」「关键词评分」+ 主「保存得分」；三者 `id==null` 时 disabled |
| 建议理由 | `rich-box-brand` | `suggestionTexts[key]` 存在时渲染；含命中关键词 tag(`found?'✓':'✗'`) + 推理文本 |
| 关键词弹窗 | `n-modal preset="card"` | title「关键词评分」、textarea(placeholder「例：组合式 API，setup，响应式」)、取消/开始匹配 |
| 错误态 | `LoadError` | `:description="loadError" @retry="fetchDetail"`，标题「加载失败」+ 重试/返回上一页 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getGradingSession(id)` → `/grading/sessions/{sessionId}` | GET | 拉取会话详情（user/paper/answers） |
| `saveScore(sessionId, answerId, {score})` → `/grading/sessions/{sessionId}/answers/{answerId}` | PUT | 保存单题得分 |
| `completeGrading(sessionId)` → `/grading/sessions/{sessionId}/complete` | POST | 完成批改（成功后跳 `/grading`） |
| `aiSuggest(sessionId, answerId)` → `.../answers/{answerId}/ai-suggest` | POST | AI 评分建议（回写 score + reasoning） |
| `keywordSuggest(sessionId, answerId, {keywords?})` → `.../keyword-suggest` | POST | 关键词匹配（keywords 可省，后端自动抽取） |

### 交互逻辑

- `onMounted` 调 `fetchDetail()`；`sessionId = route.params.id`。
- 完成批改 `handleComplete`：`completeGrading` → `message.success('批改完成')` → `router.push('/grading')`；按钮 `:disabled="!session || answers.length===0"`、`:loading="completing"`。
- 保存得分 `handleSaveScore`：`id==null` → `message.warning('该题暂无作答记录，无法评分')`；否则 `saveScore` → `message.success('得分已保存')`。
- AI 评分建议 `handleAiSuggest`：`aiSuggest` 回写 `answer.score` 与 `suggestionTexts[key]`；异常走 `handleAiError`（60601 未配置 Key / 60602 调用失败 / 60604 无可用关键词）。
- 关键词评分 `handleKeywordSuggest`：打开 `kwDialogShow` 弹窗；`confirmKeywordSuggest` 解析输入（逗号/顿号/分号/空白分隔）→ `keywordSuggest` → 回写 score、`suggestionTexts`、`matchedKeywords`，关闭弹窗。
- `questionContent()`：若 `content` 为 JSON 快照则提取 `.content` 字段，否则原样展示。
- 题型文案 `typeLabel()` 取 `QUESTION_TYPE_MAP`；非法/未知值回退原串或「未知题型」。

### 空态 / 加载态 / 错误态

- **加载态**：`loading=true` → `n-spin` 包裹主视图（spinner 覆盖，非骨架屏）。
- **空态**：无独立 EmptyState；`answers.length===0` 时逐题区块不渲染，仅会话概览显示「共 0 题」；「完成批改」置灰。
- **错误态**：`fetchDetail` catch → `loadError` 非空，整体替换为 `LoadError`（标题「加载失败」+ 描述 + 重试 / 返回上一页）。

### 响应式

- 内容区 `max-w-content`(1280px) 居中；逐题卡片全宽，用户答案/参考答案为 `grid-cols-2`（mockup 维持二列，窄屏不强制单列）。
- 侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open` + overlay）；顶栏 <768px 显汉堡按钮并隐藏搜索框。


## 23. 创建练习弹窗

- **路由**: /practice（弹窗，由 `PracticeCreateDialog` 组件以 `:show` 控制显隐；创建成功跳 `/practice/sessions/:id`）
- **Vue 文件**: `src/views/practice/PracticeCreateDialog.vue`
- **Mockup**: `mockups/23-practice-create-dialog.html`
- **布局**: 弹窗（Modal，封装于 MainLayout 外壳内；侧边栏高亮「练习」、顶栏标题「练习」）
- **权限**: 登录用户（「练习」位于侧边栏「学习中心」分组，需登录可见；弹窗本身无额外权限校验）

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar(240,active=练习) │ Header(64): 练习                    │
│ MainLayout 外壳（仅作场景衬托，saturate 弱化）                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ 遮罩 .modal-overlay (rgba(0,0,0,.4))
                            │  .modal (width:560px;max-width:90vw)
                            │   ┌─ .modal-header: 创建练习  [×关闭]
                            │   ├─ .modal-body (n-form label-placement=top)
                            │   │   题量            n-input-number(1–200) 默认 10
                            │   │   题库选择         n-select multiple+filterable（默认空）
                            │   │   题型选择         n-select multiple（默认空）选项见下
                            │   │   标签选择         n-select multiple+filterable（默认空）
                            │   │   ┌ n-grid cols=2 ┐
                            │   │   │ 最低正确率     │ n-input-number 0–100 step5 + %
                            │   │   │ 最高正确率     │ n-input-number 0–100 step5 + %
                            │   │   └──────────────┘
                            │   │   优先未做题       n-switch（默认关）
                            │   │   优先易错题       n-switch（默认关）
                            │   └─ .modal-footer: [取消] [开始练习](primary,:loading)
                            └─────────────────────────────────────
   题型选项: 单选题(SINGLE) / 多选题(MULTIPLE) / 判断题(TRUE_FALSE)
   遮罩点击不关闭(:mask-closable="false")；关闭仅由 × / 取消 触发
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 弹窗容器 | `n-modal`（`preset="card"` `title="创建练习"` `:mask-closable="false"` `style="width:560px;max-width:90vw"`） | 由 `show` prop 控制；`@update:show` 关闭 |
| 表单 | `n-form`（`ref="formRef"` `:model="form"` `label-placement="top"` `@submit.prevent="handleCreate"`） | 标签置顶 |
| 题量 | `n-input-number`（`v-model="form.count"` `:min="1" ``:max="200"` `style="width:120px"`） | 默认 `10` |
| 题库选择 | `n-select`（`v-model="form.bankIds"` `:options="bankOptions"` `multiple` `filterable`） | placeholder「不限题库则留空」；选项来自 `getBankList` |
| 题型选择 | `n-select`（`v-model="form.types"` `:options="typeOptions"` `multiple`） | placeholder「不选则全部题型」；选项写死 `typeOptions` |
| 标签选择 | `n-select`（`v-model="form.tagIds"` `:options="tagOptions"` `multiple` `filterable`） | placeholder「不选则不限制」；选项来自 `getTagList` |
| 最低/最高正确率 | `n-input-number`（`v-model="form.correctRateMin/Max"` `:min="0"` `:max="100"` `:step="5"` 后缀 `%`） | 默认 `undefined`（空） |
| 优先未做题 / 优先易错题 | `n-switch`（`v-model="form.priorUnanswered/priorWrong"`） | 默认 `false`（关） |
| 二列栅格 | `n-grid`（`:cols="2"` `:x-gap="16"`） | 包裹最低/最高正确率 |
| 取消 | `n-button`（`@click` emit `update:show=false`） | 文案「取消」 |
| 开始练习 | `n-button`（`type="primary"` `attr-type="submit"` `:loading="loading"`） | 文案「开始练习」，提交时转圈 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getBankList({page:1,size:200})` → `/banks` | GET | `onMounted` 加载题库下拉（`{label:b.name,value:b.id}`） |
| `getTagList()` → `/tags` | GET | `onMounted` 加载标签下拉（`{label:t.name,value:t.id}`） |
| `createPractice(params)` → `/practice/sessions` | POST | 提交建练习；成功返回 `res.data.sessionId` 并跳转会话页 |

> `typeOptions` 为组件内写死常量：`单选题=SINGLE` / `多选题=MULTIPLE` / `判断题=TRUE_FALSE`；无「难度」字段。

### 交互逻辑

- `onMounted` → `loadOptions()` 并行拉取题库与标签；失败静默（`catch` 忽略，选项留空）。
- 「开始练习」`handleCreate`：组装参数——空数组（`bankIds/types/tagIds` 长度为 0）与 `undefined`（正确率）、`false`（开关）均不传，仅传有效值；正确率除以 100 转小数。
- 成功 → `message.success('创建成功')` → `emit('created', sessionId)` → `router.push('/practice/sessions/'+sessionId)`。
- 失败 → 读 `err.response.data.code`：`70501` → `message.error('符合条件的题目不足')`；其它 → `message.error('创建练习失败')`。`loading` 在 `finally` 复位。

### 空态 / 加载态 / 错误态

- **加载态**：提交中「开始练习」按钮 `:loading="loading"` 转圈；题库/标签加载无独立骨架，失败则下拉为空（静默忽略）。
- **空态**：表单默认值即空态——题库/题型/标签均为空（仅 placeholder）；正确率为空；两个开关默认关；题量默认 10。
- **错误态**：建练习失败以 `message.error` toast 提示（不阻塞弹窗，可重试）；关闭后由 `show` 复位。

### 响应式

- 弹窗 `width:560px;max-width:90vw`，窄屏占 90vw 且不超视口；`max-height:90vh` 内容超长内部滚动。
- 最低/最高正确率 `n-grid cols=2` 在 `≤768px` 折叠为单列（共享 `.form-grid` 媒体查询）。
- 外壳侧边栏 `<1024px` 收为抽屉（`.sidebar.mobile-open` + overlay）；顶栏 `<768px` 显汉堡按钮并隐藏搜索框。


## 24. 练习记录列表

- **路由**: `/practice`（路由名 `PracticeList`，置于 MainLayout 外壳；新建入口弹出 `PracticeCreateDialog` 弹窗，创建成功跳 `/practice/sessions/:id`）
- **Vue 文件**: `src/views/practice/PracticeList.vue`
- **Mockup**: `mockups/24-practice-list.html`
- **布局**: Sidebar + Header（MainLayout 外壳；侧边栏高亮「练习」，顶栏标题「练习」）
- **权限**: 登录用户（「练习」位于侧边栏「学习中心」分组，需登录可见；接口由 MainLayout 守卫保护）

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar(240,active=练习) │ Header(64): 练习                    │
│               ├─ PageHeader: 练习记录                          │
│               │   subtitle 仅 itemCount>0 → 「共 N 次练习」     │
│               │   actions: [开始练习](primary, 打开 23 弹窗)    │
│               ├─ 筛选栏: n-select(状态, clearable, 150px)       │
│               │   选项 进行中/已完成/已过期 → 切换重查          │
│               ├─ 列表态（sessionList.length>0）                 │
│               │   卡片×N（flex-col gap-3，整卡不可点击）         │
│               │   左: 状态图标(40×40 圆角底)                    │
│               │       IN_PROGRESS→primary-50/game-controller   │
│               │       COMPLETED →success-50/checkmark-done     │
│               │       其它(EXPIRED/ABANDONED)→neutral-100/close │
│               │   中: 标题(buildPracticeSessionTitleFromSummary)│
│               │       + n-tag round: 进行中(info)/已完成(success)│
│               │         已过期(default)/已放弃(warning)         │
│               │       正确率%(accuracy*100) · 用时(秒格式化)     │
│               │       · 完成于(completedAt, YYYY-MM-DD HH:mm)   │
│               │   右: IN_PROGRESS→[继续]+[放弃(error)]          │
│               │       COMPLETED→[查看详情] 其它→无按钮          │
│               │   分页 n-pagination(仅 itemCount>pageSize=20)   │
│               ├─ 空态（sessionList===0 且非加载）                │
│               │   EmptyState(默认 CubeOutline)「暂无练习记录」   │
│               │   + 描述 + 引导按钮[开始练习]                    │
│               └─ 加载态（loading && sessionList===0）            │
│                   SkeletonList(:count=3, :cols=1) 骨架×3        │
└─────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader` | `title="练习记录"`；`:subtitle` 仅 `itemCount>0` 时显示「共 N 次练习」 |
| 新建入口 | `n-button`（`type="primary"`） | 文案「开始练习」+ GameControllerOutline 图标；`@click` 置 `showCreateDialog=true` 打开 `PracticeCreateDialog` |
| 状态筛选 | `n-select`（`clearable` `placeholder="状态"` `style="width:150px"` `@update:value="handleSearch"`） | 选项 进行中=IN_PROGRESS/已完成=COMPLETED/已过期=EXPIRED（无 ABANDONED）；清空即查全部 |
| 列表卡片 | `div.card` + `card-hover` | 每行一个 session；hover → `border-primary-300` + `shadow-sm`；**整卡无点击**（仅按钮触发） |
| 状态图标 | `n-icon`（`GameControllerOutline`/`CheckmarkDoneOutline`/`CloseCircleOutline`） | 底色/色由 `statusIconClass`/`statusIconColor` 决定；尺寸 20 |
| 状态标签 | `n-tag`（`type` round `size="small"`） | `statusTagType`：IN_PROGRESS=info/COMPLETED=success/ABANDONED=warning/其它(EXPIRED)=default |
| 标题文案 | `buildPracticeSessionTitleFromSummary` | 规则：题库 · 标签 · N题 · 随机练习（多题库/标签追加「等N个…」） |
| 继续/放弃 | `n-button`（`quaternary` `size="small"`） | 仅 IN_PROGRESS：继续=primary→`/practice/sessions/:id`；放弃=error→`confirmDanger` |
| 查看详情 | `n-button`（`type="primary"` `quaternary` `size="small"`） | 仅 COMPLETED → `/practice/sessions/:id` |
| 分页 | `n-pagination` | 仅 `itemCount > pageSize(=20)` 渲染，右对齐；`@update:page="handlePageChange"` |
| 空态 | `EmptyState` | `title="暂无练习记录"` `description="点击右上角「开始练习」生成一套随机练习题"` `icon=CubeOutline`（默认）；`#action` 槽 = 「开始练习」按钮 |
| 加载骨架 | `SkeletonList` | `:count="3"` `:cols="1"`，`loading && sessionList.length===0` 时显示 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getPracticeSessions({page, size, status})` → `/practice/sessions` | GET | 拉取练习记录分页列表，`res.data.records` 为行、`res.data.total` 为总数 |
| `abandonPractice(sessionId)` → `/practice/sessions/{sessionId}/abandon` | POST | 「放弃」确认后调用；成功 `message.success('已放弃')` 并刷新列表 |

### 交互逻辑

- `onMounted` 调 `fetchList()`；`page` 默认 1、`pageSize` 固定 20；`loading` 包裹请求，catch → `message.error('加载练习记录失败')`。
- 状态筛选 `handleSearch`：重置 `page=1` 后重新拉取（`status` 空则传 `undefined` 查全部）。
- 切页 `handlePageChange(page)`：更新 `pagination.page` 并重新 `fetchList()`。
- 卡片操作 `goSession(row)`：`router.push('/practice/sessions/' + row.sessionId)`；进入会话页（07）。
- 「放弃」`handleAbandon`：`confirmDanger`（title「放弃练习」content「确定要放弃该练习吗？放弃后本次进度将清空。」，正「放弃」）→ `abandonPractice` → `message.success('已放弃')` → 刷新；失败 `message.error('操作失败')`。
- 新建成功 `handleCreated`：关闭弹窗并刷新列表（`PracticeCreateDialog` 自身负责跳会话页）。
- 标题 `buildPracticeSessionTitleFromSummary`：题库取首项（多则「等N个题库」）、标签取首项（多则「等N个标签」）、`totalCount>0` 输出「N题」，各段以「 · 」连接并固定追加「随机练习」。
- 「用时」用组件内 `formatDuration(seconds)`（秒→「X 秒 / X 分 Y 秒 / X 分钟」），「完成于」用 `dayjs` 格式化为 `YYYY-MM-DD HH:mm`；「正确率」为 `accuracy*100` 保留 1 位小数。

### 空态 / 加载态 / 错误态

- **加载态**：`loading && sessionList.length===0` → `SkeletonList`×3 骨架卡片（覆盖列表区，分页不渲染）。
- **空态**：`sessionList.length===0`（且非加载）→ `EmptyState`「暂无练习记录 / 点击右上角「开始练习」生成一套随机练习题」+「开始练习」引导按钮（打开创建弹窗）。
- **错误态**：`fetchList` catch → `message.error('加载练习记录失败')`（不阻塞已渲染内容；列表区保持上一状态或空态）。

### 响应式

- 内容区 `max-w-content`(1280px) 居中；卡片 `flex` 在窄屏 `flex-wrap` 换行，状态图标与按钮 `flex-shrink:0`。
- 侧边栏 <1024px 收为抽屉（`.sidebar.mobile-open` + overlay）；顶栏 <768px 显示汉堡按钮并隐藏搜索框。

## 25. 试卷创建 / 编辑

- **路由**: `/papers/create`、`/papers/:id/edit`
- **Vue 文件**: `src/views/paper/PaperForm.vue`
- **Mockup**: `mockups/25-paper-form.html`
- **布局**: Sidebar + Header（/papers/create 与 /papers/:id/edit 均命中 MENU_TITLES['/papers'] → 顶栏「试卷」）
- **权限**: 路由无 meta，`requiresAuth` 默认 true；创建入口「创建试卷」仅在管理员可见

### 页面结构

```
PageHeader[创建试卷 | 按 4 步完成组卷：基本信息 → 选题 → 设置分值 → 确认发布]
n-steps: 基本信息 / 选题 / 设置分值 / 确认
step 0 基本信息 (n-card)
  标题* 描述 时间限制 作答次数 及格线 开始时间 结束时间 批改人 分享类型* 访问密码(PASSWORD) 防作弊
step 1 选题 (双栏穿梭)
  筛选: 题库/题型/难度/搜索题干 + 搜索/重置
  左: 候选(全选本页) 右: 已选清单(清空/移除)
step 2 设置分值 (拖拽排序 + 每题 input-number，实时总分)
step 3 确认 (n-descriptions + 题目列表 + 创建/保存修改)
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| PageHeader | 自定义 | 标题随 isEdit 变化 |
| n-steps / n-step | Naive UI | 4 步向导 |
| n-card / n-form | Naive UI | 每步容器 |
| n-input / n-input-number / n-date-picker / n-select / n-switch | Naive UI | 表单控件 |
| UserSearchSelect | 自定义 | 批改人远程搜索 |
| FilterBar | 自定义 | 第二步筛选 |
| SkeletonList / EmptyState | 自定义 | 候选加载 / 无题 |
| QuestionPreviewDrawer | 自定义 | 题目预览 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `createPaper` | POST `/papers` | 新建 |
| `updatePaper` | PUT `/papers/:id` | 编辑保存 |
| `getPaperDetail` | GET `/papers/:id` | 编辑回填 |
| `getBankList` | GET `/banks` | 题库筛选下拉 |
| `getAllQuestions` | GET `/questions` | 候选题目（status=PUBLISHED） |

### 交互逻辑

- 向导：第一步标题必填才能进下一步；第二步至少选 1 题；第三步拖拽排序、设分，总分实时 `reduce`；第四步确认后保存。
- 分享类型 `PASSWORD` 时显示「访问密码」；`attemptType` 由次数推导（0/留空→UNLIMITED，1→ONCE，>1→MULTIPLE）。
- 批改人留空默认创建者本人（`graderLabel || '默认（创建者本人）'`）。
- 保存成功跳 `/papers`。

### 空态 / 加载态 / 错误态

- 候选加载：`SkeletonList`；无题：`EmptyState`。
- 已选为空：`EmptyState`「尚未选题」。
- 保存/加载失败：`message.error`。

### 响应式

- 基本信息 `n-grid cols=2`（<768px 单列）。
- 选题双栏 `flex-col lg:flex-row`（右栏宽 300px）。

---


## 26. 题目创建 / 编辑

- **路由**: `/banks/:id/questions/create`（`QuestionCreate`）、`/banks/:id/questions/:qid/edit`（`QuestionEdit`）
- **Vue 文件**: `views/question/QuestionForm.vue`
- **Mockup**: `mockups/26-question-create.html`
- **布局**: Sidebar + Header（命中 `/banks` → 侧边栏高亮「题库」，顶栏标题「题库」）；内容 `max-w-5xl mx-auto`
- **权限**: 两条路由**均未声明 `meta.requiresAuth: false`** → 需要登录（未登录跳转 `/login?redirect=`）；未做管理员限制。

### 页面结构

```
PageHeader ← 返回  创建题目|编辑题目 / 向题库中添加新题目|修改已有题目
白卡 p-6（n-spin 包裹）
  题型* 下拉（编辑态 disabled）
  题干* MarkdownEditor
  选项（仅单选/多选）
     ⠿ A. [输入] [删除]  ← 可拖拽排序，选项 ≤2 时删除禁用
     [添加选项]
  正确答案*
     单选→下拉（A. xxx）；多选→多选下拉；判断→正确/错误 单选组；其它→多行文本域「输入答案」
  参考答案 MarkdownEditor
  解析 MarkdownEditor
  难度* 单选组：简单 / 中等 / 困难（默认 中等）
  标签 多选可筛选（分组）
  状态* 单选组：草稿 / 已发布（不含「待审核」）
  [编辑态且 paperRefCount>0] warning 提示条：该题目已被 N 份试卷引用，修改后可能影响已有试卷。
                                            [取消] [保存]
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页头 | `PageHeader`（`showBack`） | 标题/副标题随 isEdit 切换 |
| 表单 | `n-form`（`label-placement="top"`） | 校验：请选择题型 / 请输入题干 / 请输入正确答案 / 请选择难度 / 请选择状态 |
| 题型 | `n-select`（`QUESTION_TYPE_OPTIONS`） | 编辑态 `:disabled="isEdit"` |
| 题干 / 参考答案 / 解析 | `MarkdownEditor` | `v-md-editor`（vuepress 主题 + KaTeX + 行号），默认 400px 编辑+预览双栏 |
| 选项行 | `div[draggable]` + `n-input` + `n-button` | 拖拽手柄 ReorderTwoOutline；`A.`/`B.`… 由索引生成 |
| 正确答案 | `n-select` / `n-radio-group` / `n-input(textarea)` | 按题型切换控件 |
| 难度 / 状态 | `n-radio-group` | 难度 `DIFFICULTY_OPTIONS`；状态为 `QUESTION_STATUS_OPTIONS` 过滤掉 `PENDING_REVIEW` 后的结果 |
| 标签 | `n-select`（multiple + filterable） | 选项 `buildGroupedTagOptions` |
| 提示条 | `n-alert`（type=warning） | 仅编辑态且 paperRefCount > 0 |
| 加载 | `n-spin` | 编辑态拉取详情时 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/tags` | GET | 标签下拉（分组） |
| `/questions/:id` | GET | 编辑态回填表单（options 运行时为 JSON 字符串） |
| `/banks/:bankId/questions` | POST | 创建题目 |
| `/banks/:bankId/questions/:qid` | PUT | 更新题目 |
| `/api/v1/files/upload` | POST | MarkdownEditor 插图上传 |

### 交互逻辑

- `isEdit = !!route.params.qid`；编辑态挂载时调用详情接口回填 type/content/options/answer/referenceAnswer/analysis/difficulty/tagIds/status/paperRefCount。
- 切换题型会清空答案，并在单选/多选时保证至少有 2 个空选项。
- 选项支持拖拽排序，少于等于 2 项时禁止删除。
- 提交：校验通过后组装 payload（单选/多选的 options 以 `JSON.stringify` 提交，其余题型不传 options），创建/保存成功后 `router.back()`。
- 「取消」同样执行 `router.back()`。
- 失败提示：加载详情「加载题目详情失败」；提交「保存失败」。

### 空态 / 加载态 / 错误态

- 加载态：编辑态 `n-spin` 覆盖表单；保存按钮 `:loading`。
- 空态：无（表单页）。
- 错误态：表单校验失败停留在页面；接口失败以 message 提示。

### 响应式

- 内容 `max-w-5xl` 居中；MarkdownEditor 双栏在窄屏挤压，宽度自适应（`w-full`）。

### 26.1 题目详情（QuestionDetail）

- **路由**: `/banks/:bankId/questions/:questionId`（name: `QuestionDetail`）
- **Vue 文件**: `views/question/QuestionDetail.vue`
- **Mockup**: `mockups/26-question-create.html`（题目详情展示形态）
- **布局**: Sidebar + Header（命中 `/banks` → 侧边栏高亮「题库」，顶栏标题「题库」）
- **权限**: `meta.requiresAuth = false`，**游客可见**；「编辑」按钮仅管理员。

### 页面结构

```
PageHeader ← 返回  题目详情 / 所属题库：XXX        [编辑]（管理员）
白卡
  标签行 [单选题][简单][已发布]          所属题库：题库名（点击进题库）
  题干      富文本（中性灰底）
  选项（仅单选/多选）A/B/C… 正确项绿色高亮 + 对勾
  正确答案  判断题→「正确」/「错误」标签；其它→绿色底富文本（A. 选项内容）
  参考答案（有则展示）
  解析（有则展示，warning 浅底）
  标签（有则展示）
  ─────────────────────────────
  🕒 创建时间：YYYY-MM-DD HH:mm   🕒 更新时间：YYYY-MM-DD HH:mm
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页头 | `PageHeader`（`showBack`） | title 固定「题目详情」，subtitle = `所属题库：{bankName}`（无则空） |
| 标签行 | `n-tag`（size=small, round） | 题型 / 难度 / 状态；右侧为题库名链接 |
| 富文本 | `RichText` | DOMPurify 净化 + KaTeX 公式 |
| 选项 | 自定义 div | 正确项 `border-success-500 + bg-success-50`，序号圆标 `String.fromCharCode(65+i)` |
| 判断题答案 | `n-tag`（medium, round） | `answer === 'true'` → success「正确」，否则 error「错误」 |
| 正确答案 | `RichText`（success 浅底） | 单选 `A. 内容`；多选 `A. 内容；B. 内容` |
| 加载 / 错误 | `n-spin` / `LoadError` | 同第 03 节 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/questions/:id` | GET | 题目详情（options 运行时为 JSON 字符串，本地解析为字符串数组） |

### 交互逻辑

- 挂载即拉取详情；`options` 兼容 JSON 字符串与对象数组两种形态。
- 正确选项判定：单选 `answer === 'A'|'B'…`；多选按 `,` 拆分后包含判断。
- 「所属题库」链接 → `/banks/:bankId`；「编辑」→ `/banks/:bankId/questions/:questionId/edit`。
- 失败时 `loadError` 取后端 message，渲染 LoadError + 重试。

### 空态 / 加载态 / 错误态

- 加载态：`n-spin` 包裹整卡。
- 空态：无独立空态（加载失败时才有 LoadError）。
- 错误态：`LoadError`（「加载失败」+ description + 重试 / 返回上一页）。

### 响应式

- 单列白卡；元信息行 `flex-wrap`。


## 27. 导入题库弹窗

- **路由**: 无（弹窗，入口在 `/banks` 的「导入题库」按钮，需登录）
- **Vue 文件**: `components/importExport/BankImportDialog.vue` + `ImportResultPanel.vue`
- **Mockup**: `mockups/27-bank-import-dialog.html`
- **布局**: `n-modal`（preset=card，width 540px / max-width 94vw）
- **权限**: 入口按钮需 `isAuthenticated`；导入后在本人名下创建私有题库。

### 页面结构

```
步骤一（step = pick）
  虚线拖拽区  点击选择导出的题库 JSON 文件 / 仅支持本系统导出的 .json 文件
  文件预览    文件名
              题库名称：X    题目数：N    标签引用：N
              题库描述（1 行截断）
  说明：导入后将在你的名下创建一个私有题库。若你已拥有同名题库，本次导入将被拒绝。
  页脚                        [取消] [开始导入]
步骤二（step = result）—— ImportResultPanel
  [成功导入 N][重复跳过 N][导入失败 N]
  已导入到题库「XXX」
  （fail=0 且 skip=0 → 「全部题目导入成功」空态）
  失败明细（N） #序号 + 错误信息
  跳过明细（N） #序号 + 题干 + 原因
                                          [完成]
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 弹窗 | `n-modal`（preset=card） | 标题「导入题库」 |
| 上传区 | `div` + 隐藏 `input[type=file]` | accept `.json,application/json` |
| 文件解析 | `parseImportFile`（utils/importFile） | 输出 bankName / questionCount / tagCount / bankDescription / format |
| 结果面板 | `ImportResultPanel` | 3 列统计块 + 明细列表（max-h-48） |
| 完成 | `n-button`（type=primary） | 触发 `done` → 关闭弹窗 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/banks/import` | POST | multipart 上传题库 JSON，返回 `ImportResult` |

### 交互逻辑

- 打开弹窗即重置：`step='pick'`，清空 parsed / 文件名 / 选中文件 / 结果。
- 文件格式不是 `quick-study-bank`（选到题目导出文件）时 `message.warning('该文件是「题目导出」文件，请使用「导入题目」功能')`，不进入预览。
- 未选择文件或解析失败时「开始导入」disabled；解析异常提示「文件解析失败」。
- 导入成功 → `step='result'`，同时 emit `imported` 让题库列表刷新；失败提示后端 message。

### 空态 / 加载态 / 错误态

- 加载态：「开始导入」按钮 `:loading`。
- 空态：结果面板在 `failCount === 0 && skipCount === 0` 时展示「全部题目导入成功」。
- 错误态：解析失败 / 导入失败均 message.error（取后端 message）。

### 响应式

- 弹窗 `max-width: 94vw`；结果统计 3 列在窄屏仍保持 3 列（数值较短）。


## 28. 导入题目弹窗

- **路由**: 无（弹窗，入口在 `/questions` 与 `/banks/:id/questions` 的「导入题目」按钮）
- **Vue 文件**: `components/importExport/QuestionImportDialog.vue` + `ImportResultPanel.vue`
- **Mockup**: `mockups/28-question-import-dialog.html`
- **布局**: `n-modal`（preset=card，width 560px / max-width 94vw）
- **权限**: 入口按钮仅管理员；目标题库需为当前用户自己的题库（管理员不限）。

### 页面结构

```
步骤一（step = pick）
  变体 A（无预设 bankId）
    导入到题库（需为你的题库） → n-select；[暂无可导入的题库 / 请先创建自己的题库]
  变体 B（预设 bankId，来自 /banks/:id/questions）
    导入到题库 → 灰底只读块（bankName || bankId）
  选择文件 → 虚线区：点击选择题库/题目导出的 JSON 文件 / 题库导出文件导入时只取其题目
  文件预览：题目数 N   标签引用 N
    检测为「题库导出」文件，将导入其中的全部题目（format === quick-study-bank 时）
    与目标题库已有题目题干重复的将被跳过
  页脚                        [取消] [开始导入]
步骤二（step = result）—— 同第 08 节 ImportResultPanel
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 弹窗 | `n-modal`（preset=card） | 标题「导入题目」 |
| 题库选择 | `n-select`（filterable, clearable） | 候选：管理员全部题库，普通用户仅 `creatorId === 自己` 的题库 |
| 空态 | `n-empty`（size=small） | 「暂无可导入的题库 / 请先创建自己的题库」 |
| 只读题库 | `div`（灰底） | 预设 bankId 时展示 |
| 上传区 | `div` + 隐藏 `input[type=file]` | 接受题库导出与题目导出两种文件 |
| 结果面板 | `ImportResultPanel` | 与题库导入共用 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/banks` | GET | 目标题库下拉（page=1,size=1000，按创建者过滤） |
| `/banks/:bankId/questions/import` | POST | multipart 上传题目 JSON，返回 `ImportResult` |

### 交互逻辑

- 打开弹窗重置状态；仅当没有预设 bankId 时才拉取题库下拉。
- 与题库导入不同：题目导入**不限制**文件格式（题库导出文件只取其中题目，并给出「检测为「题库导出」文件」提示）。
- 「开始导入」在 未解析文件 / 未选文件 / 未确定目标题库 时 disabled。
- 成功后进入结果步骤并 emit `imported`（列表刷新；题库详情页还会刷新题目数统计）。

### 空态 / 加载态 / 错误态

- 加载态：按钮 `:loading`；题库下拉加载中无占位。
- 空态：题库下拉为空时的 `n-empty`；结果全部成功时的「全部题目导入成功」。
- 错误态：解析失败「文件解析失败」、导入失败取后端 message。

### 响应式

- 弹窗 `max-width: 94vw`；预览信息 `flex-wrap`。


## 29. 标签管理弹窗

- **路由**: 无（弹窗，入口在 `/questions` 的「标签管理」按钮）
- **Vue 文件**: `components/common/TagManageModal.vue`
- **Mockup**: `mockups/29-tag-manage-modal.html`
- **布局**: `n-modal`（preset=card，width 560px）
- **权限**: 入口按钮仅管理员；弹窗内新建/改组/删除与底部说明文案同样 `v-if="authStore.isAdmin"`，非管理员为只读列表。

### 页面结构

```
标签管理
  [搜索标签...                              ]
  管理员：[新标签名 180][分组（可选）160][添加]
  列表（max-h-96，滚动，divide-y）
    标签名   使用 N   [分组|未分组]  改组   删除（使用数 > 0 时禁用）
    编辑中： [分组名 140] 保存  取消
  提示：分组仅用于展示导航（安卓端折叠、选择器分区），不影响筛选；点击分组标签可编辑，
        清空保存即取消分组。已使用的标签不可删除。
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 弹窗 | `n-modal`（preset=card） | 标题「标签管理」，打开即 load |
| 搜索 | `n-input`（clearable） | 按标签名 / 分组名过滤（不区分大小写） |
| 新建 | `n-input` ×2 + `n-button` | 名称必填，分组可选 |
| 列表 | `div` + `n-tag` + `n-button` | 分组标签 `info` / 未分组 `default`；管理态可点击分组进入编辑 |
| 编辑分组 | `n-input`（size=tiny）+ 保存 / 取消 | 清空保存即取消分组 |
| 删除 | `n-button`（quaternary, error） | `usageCount > 0` 时 disabled |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/tags` | GET | 标签列表（含 groupName、usageCount） |
| `/tags` | POST | 新建标签（query: name、groupName、color） |
| `/tags/:id/group` | PUT | 设置/清除分组（query: groupName，传空清除） |
| `/tags/:id` | DELETE | 删除未被引用的标签 |

### 交互逻辑

- 打开弹窗即 `load()`；新增/改组/删除成功后重新拉取并 emit `updated`（父级刷新标签下拉）。
- 新建：名称为空 → `message.warning('请输入标签名')`；成功「标签已添加」并清空输入。
- 改组：保存成功「分组已更新」；失败提示「分组更新失败（仅管理员可操作）」。
- 删除：`confirmDanger`（「确认删除标签「{名称}」？」）→ 成功「标签已删除」；失败「删除失败（仅管理员可删除未被引用的标签）」。

### 空态 / 加载态 / 错误态

- 加载态：添加 / 保存按钮 `:loading`。
- 空态：无标签「暂无标签」；搜索无结果「无匹配标签」。
- 错误态：均 message.error，不阻断弹窗。

### 响应式

- 弹窗宽 560px；列表 `max-h-96` 内部滚动；窄屏 `modal` 由外层 `max-width: 92vw` 兜底。

## 30. 试卷详情

- **路由**: `/papers/:id`
- **Vue 文件**: `src/views/paper/PaperDetail.vue`
- **Mockup**: `mockups/30-paper-detail.html`
- **布局**: Sidebar + Header（命中 MENU_TITLES['/papers'] → 顶栏「试卷」）
- **权限**: `requiresAuth: false`

### 页面结构

```
PageHeader[← 试卷标题 | 副标题]  [开始考试?(PUBLISHED+已登录)]
n-spin
  基本信息 (n-descriptions: 描述/总分/题目数/时间限制/发布者/批改人/分享类型/作答次数[防作弊开启?])
  批改人管理 (仅 canManage=创建者): UserSearchSelect + 更换批改人 + 当前批改人
  题目列表 (只读快照: #N [题型] 分值 题干)
  作答统计 (仅 canManage, grid-cols-4): 总作答人数/平均分/最高分/最低分
  作答记录 (仅 canManage, n-data-table): 作答者/得分/状态/提交时间/查看详情
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| PageHeader | 自定义 | show-back + actions |
| n-descriptions | Naive UI | 基本信息（column=2, bordered） |
| UserSearchSelect | 自定义 | 更换批改人 |
| StatCard | 自定义 | 作答统计 |
| n-data-table | Naive UI | 作答记录（remote） |
| EmptyState | 自定义 | 无题目 / 无作答记录 |
| LoadError | 自定义 | 错误态（重试） |
| n-spin | Naive UI | 加载 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `getPaperDetail` | GET `/papers/:id` | 试卷 + 题目 |
| `getPaperSessions` | GET `/papers/:id/sessions` | 作答记录（仅 canManage） |
| `getSessionsSummary` | GET `/papers/:id/sessions-summary` | 作答统计（仅 canManage） |
| `updateGrader` | PUT `/papers/:id/grader` | 更换批改人 |

### 交互逻辑

- `canManage` = 当前用户是创建者；仅此时显示「批改人管理 / 作答统计 / 作答记录」。
- 状态 tag：PUBLISHED 已发布(success) / 否则 草稿(default)。
- 题型 chip：`typeTagClass` SINGLE→info / MULTIPLE→primary / TRUE_FALSE→warning / FILL_BLANK→success / SHORT_ANSWER→error。
- 作答记录状态：`sessionStatusMap` 进行中/已提交/批改中/已批改；仅 SUBMITTED/GRADING/GRADED 可「查看详情」→ `/grading/sessions/:id`。
- 「开始考试」仅 PUBLISHED 且已登录。

### 空态 / 加载态 / 错误态

- 加载：`n-spin`（包裹主体）。
- 错误：`LoadError`（loadError 文案 + 重试）。
- 空：`EmptyState` 无题目 / 无作答记录。

### 响应式

- 作答统计 `grid-cols-2 md:grid-cols-4`。
- 题目列表 / 作答记录表格在窄屏横向滚动。

## 31. 审核列表

- **路由**: /admin/reviews
- **Vue 文件**: src/views/admin/ReviewList.vue
- **Mockup**: `mockups/31-admin-reviews.html`
- **布局**: Sidebar + Header
- **权限**: requiresAdmin

### 页面结构

```
┌────────────────────────────────────────────────────────────────┐
│ Sidebar(240, active=审核列表) │ Header(64): 审核列表              │
│               ├─ PageHeader: 审核管理                            │
│               │   subtitle「审核用户提交的题目」                   │
│               ├─ n-spin(:show=loading) 包裹以下全部              │
│               │   ├─ 审核卡片 ×N（space-y-3，逐条 v-for）         │
│               │   │   [图标40px DocumentText] bankName+状态tag    │
│               │   │   提交人PersonOutline · createdAt             │
│               │   │   右侧「审核」按钮(primary secondary small)    │
│               │   ├─ 分页行（itemCount>0 时）                     │
│               │   │   左「共 X 条记录」 右 n-pagination           │
│               │   └─ 空态卡 EmptyState（列表空且 !loading 时）     │
│               │       「暂无待审核题目」/「当前没有需要审核的题目」  │
│               └─ n-modal 审核详情（preset=card, 720px）           │
│                   ├─ 头部：bankName+提交人·时间 | 状态tag          │
│                   ├─ 「题目内容」RichText                          │
│                   ├─ 「选项」A/B/C… 圆形字母标 + 文本（有才渲染）    │
│                   ├─ 「参考答案」question.answer || '无'           │
│                   ├─ 「解析」RichText(question.analysis || '无')   │
│                   └─ 操作行：审核意见输入 | 审核通过(success) 驳回(error)│
└────────────────────────────────────────────────────────────────┘
```

### 组件清单

| 组件 | Naive UI 映射 | 说明 |
|------|--------------|------|
| 页面标题 | `PageHeader` | `title="审核管理"` `subtitle="审核用户提交的题目"` |
| 加载遮罩 | `n-spin`（`:show="loading"` / 详情内 `:show="detailLoading"`） | 包裹列表区；弹窗内单独一层 |
| 审核卡片 | `div`（`bg-white border border-neutral-200 rounded-lg p-4 flex items-center gap-4`） | hover 换 `border-primary-300`；无整卡点击，仅「审核」按钮触发详情 |
| 卡片图标 | `n-icon` + `DocumentTextOutline` | 40px 圆角块 `bg-primary-50 text-primary-500` |
| 状态标签 | `n-tag`（`size="small" round :bordered="false"`） | 由 `STATUS_META` 决定：`PENDING`→「待审核」warning、`APPROVED`→「通过」success、`REJECTED`→「拒绝」error；未知值回退 label=status / tag=default |
| 提交人/时间行 | `n-icon PersonOutline` + 文本 | `text-xs text-neutral-500`，格式 `YYYY-MM-DD HH:mm`（`formatTime`，空值显示 `—`），中间 `·` 分隔 |
| 审核按钮 | `n-button`（`size="small" type="primary" secondary`） | 文案「审核」，点击 `handleViewDetail` 打开弹窗并拉详情 |
| 分页 | `n-pagination` | `:page` `:page-size=20` `:item-count`，`@update:page` → `handlePageChange` 重新 `fetchList`；左侧「共 X 条记录」 |
| 空态 | `EmptyState` | `title="暂无待审核题目"` `description="当前没有需要审核的题目"` |
| 详情弹窗 | `n-modal`（`preset="card"` `title="审核详情"`） | `style="width: 720px"`，`v-model:show="showDetail"` |
| 富文本 | `RichText` | 题目内容与解析两处渲染 |
| 选项列表 | `span` 字母徽标（`String.fromCharCode(65+idx)`） | A/B/C… 20px 圆形 `bg-primary-50 text-primary-600`；`questionOptionList` 为空时整块不渲染 |
| 审核意见输入 | `n-input` | `placeholder="审核意见（驳回必填）"` `clearable`，`max-width: 420px` |
| 通过/驳回按钮 | `n-button type="success"` / `type="error"` | 「审核通过」「驳回」 |
| 消息提示 | `useMessage` | 见交互逻辑 |

### 数据接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/reviews?page&size&status` | GET | `getReviewList`；固定传 `status: 'PENDING'`，返回 `PageResult<ReviewResponse>`（`records`/`total`） |
| `/reviews/:id` | GET | `getReviewDetail`；打开详情弹窗时调用，填充 `currentReview` |
| `/reviews/:id/approve` | POST | `approveReview(id, { comment?: string })`；审核通过 |
| `/reviews/:id/reject` | POST | `rejectReview(id, { comment: string })`；驳回（comment 必填） |

### 交互逻辑

- 页面无 Tab/筛选控件：列表固定只拉 `status: 'PENDING'` 的待审核记录，`onMounted` 时 `fetchList`。
- 列表加载失败：`message.error('加载审核列表失败')`；详情加载失败：`message.error('加载审核详情失败')`。
- 点「审核」→ `showDetail=true`、清空 `reviewComment`、`detailLoading` 转圈，成功后渲染 `currentReview`。
- 「审核通过」：调 `approveReview`，`comment` 为空则传 `undefined`；成功 `message.success('审核通过')`、关弹窗并 `fetchList()` 刷新；失败 `message.error('操作失败')`。
- 「驳回」：先校验 `reviewComment.trim()` 非空，为空 `message.warning('驳回时请填写审核意见')` 并中止；通过则调 `rejectReview`，成功 `message.success('已驳回')`、关弹窗并刷新；失败 `message.error('操作失败')`。
- 分页切换：`handlePageChange(page)` 更新 `pagination.page`（pageSize 固定 20）后重新 `fetchList`。
- 详情内的 `question.options` 后端实际为 JSON 字符串，前端 `parseOptions` 兼容数组/字符串两种形态，解析失败按空数组处理（选项块隐藏）。

### 空态 / 加载态 / 错误态

- 加载态：`n-spin :show="loading"` 覆盖列表区；详情弹窗内 `n-spin :show="detailLoading"` 覆盖内容。mockup 中以骨架卡片示意列表加载。
- 空态：列表为空且非加载中 → `EmptyState`「暂无待审核题目 / 当前没有需要审核的题目」（整卡 `bg-white border rounded-lg` 包裹）。
- 错误态：无专门错误视图，统一 `useMessage` 弹 toast（文案见交互逻辑）。

### 响应式

- 卡片行 `flex items-center gap-4`，中间信息区 `flex-1 min-w-0`，长题库名/提交人 `truncate` 截断，右侧按钮 `flex-shrink-0`。
- 弹窗固定 720px 宽（小屏由 Naive UI card 弹窗自适应收窄）；底部操作行 `justify-between`，意见输入 `max-width: 420px`，窄屏下按钮组换行。
- 无独立移动端布局分支；外壳侧边栏 <1024px 折叠为抽屉（MainLayout 通用行为）。

## 32. 邀请码管理（`/admin/invite-codes`）

**文件**：`views/admin/InviteCodeList.vue` · **mockup**：`32-invite-code-manage.html`
**权限**：`ADMIN` / `SUPER_ADMIN`（侧边栏 `authStore.isAdmin` 控制 + 路由 `meta.requiresAdmin` + 后端 `@RequireRole`）

### 页面结构

| 区块 | 内容 |
|---|---|
| PageHeader | 标题「邀请码管理」+ 副标题「生成并管理注册邀请码，控制谁可以注册本站账号」+ 右上主按钮「生成邀请码」 |
| 统计概览 | `grid grid-cols-4 gap-4`：全部 / 可用（success 色）/ 已用尽（info 色）/ 已失效（过期+禁用，neutral 色） |
| 筛选行 | 搜索框（邀请码 / 备注，260px）+ 状态下拉（可用/已用尽/已过期/已禁用，140px）+ 创建人下拉（160px）+ 重置 |
| 数据表 | 邀请码 · 使用次数 · 状态 · 有效期 · 授权角色 · 备注 · 创建人 · 创建时间 · 操作 |
| 分页 | `n-data-table` 内置分页，右下角「共 N 条」，pageSize 20 |

### 列渲染规则

- **邀请码**：等宽字体（`--font-mono`）展示 `codeDisplay`（每 4 位插 `-`），右侧 `copy-outline` 图标，点击复制**不带连字符的原始码**，`message.success('已复制')`。
- **使用次数**：`usedCount / maxUses`，用尽时数字用 info 色强调。
- **状态**：后端下发 `displayStatus` / `statusLabel`，前端只做颜色映射 —— `AVAILABLE→success`、`EXHAUSTED→info`、`EXPIRED→warning`、`DISABLED→default`。前端不重复计算状态。
- **授权角色**：`USER→default` 标签「普通用户」；`ADMIN→warning` 标签「管理员」。
- **操作**：`禁用 / 启用`（按 `status` 切换文案与颜色：禁用=warning，启用=success）· `使用记录`（primary）· `删除`（error，仅 `isSuperAdmin && usedCount === 0` 显示）。
- **管理员角色码（`grant_role === 'ADMIN'`）的启停/删除仅超管可见**：`v-if="isSuperAdmin"`，非超管该行只保留「使用记录」。前端隐藏是体验，**后端以 `95203` 独立拦截**。

### 接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `/admin/invite-codes` | GET | `fetchInviteCodes({ page, size, keyword, status, createdBy })`，响应含 `list` 与 `summary` |
| `/admin/invite-codes/{id}/status` | PUT | `updateInviteCodeStatus(id, 'DISABLED' \| 'ACTIVE')` |
| `/admin/invite-codes/{id}` | DELETE | `deleteInviteCode(id)`，仅超管且 `usedCount === 0` |

### 交互逻辑

- `onMounted` → `loadList()`；筛选变更与分页切换均重新拉取（`remote` 分页）。
- 「生成邀请码」→ 打开生成弹窗（见第 33 章），成功后 `loadList()`。
- 「禁用 / 删除」走 `useConfirm()` / `confirmDanger()`，二次确认后调用接口，成功 `message.success` 并刷新。
- 复制失败（无 clipboard 权限）降级提示 `message.warning('复制失败，请手动选择复制')`。

### 空态 / 加载态 / 错误态

- 加载态：`n-spin :show="loading"` 覆盖表格区。
- 空态：`EmptyState`「还没有邀请码 / 生成第一个邀请码，用户才能注册本站账号」+ 主按钮。
- 错误态：统一 toast「加载邀请码列表失败」/「操作失败」。

### 响应式

- 统计卡 `grid-cols-4`，<1024px 由外层容器自然折行（沿用全站 `grid` 行为）。
- 表格外层 `table-card` 横向滚动；操作列文字链接 `white-space: nowrap`。

## 33. 邀请码弹窗（生成 / 生成结果 / 使用记录）

**mockup**：`33-invite-code-generate-dialog.html` · 均为 `n-modal preset="card"`

### 33.1 生成邀请码（560px）

| 字段 | 控件 | 默认值 | 校验 |
|---|---|---|---|
| 生成数量 | `n-input-number` | 1 | 1 ~ 50 |
| 最大使用次数 | `n-input-number` | 1 | 1 ~ 9999，hint「1 = 一次性」 |
| 有效期 | 分段选择（7/30/90 天、永不过期、自定义） | 30 天 | 自定义时出 `n-date-picker`，必须晚于当前 |
| 注册后角色 | `n-radio-group`（普通用户 / 管理员） | 普通用户 | 选管理员 → 备注必填；**非超管时「管理员」项 `disabled` + 提示「仅超级管理员可选」**（95203） |
| 备注 | `n-input` | 空 | ≤ 200 字 |

底部：取消 / 生成（primary）。请求 `POST /admin/invite-codes`，失败按错误码 toast（95201 数量超限、95202 参数非法、95203 非超管生成管理员码）。

**角色权限视角**：

| 登录角色 | 「管理员」单选项 | 说明 |
|---|---|---|
| `SUPER_ADMIN` | 可选 | 选中后备注必填，默认一次性 |
| `ADMIN` | `disabled` + 提示「仅超级管理员可选」 | 只能生成 `USER` 角色码；绕过前端提交仍被后端 `95203` 拦截 |

### 33.2 生成结果（原地切换，不关闭弹窗）

- 顶部 success 提示条「邀请码已生成，请立即复制保存。关闭本窗口后仍可在列表中查看与复制。」
- 只读码列表（等宽字体，逐行「复制」图标）
- 底部：复制全部 · 下载 .txt · 关闭（primary）
- 输出均为**无连字符的原始码**，换行分隔；关闭时 `emit('success')` 触发列表刷新。

### 33.3 使用记录（640px）

- 标题「使用记录」+ 副标题 `<code> · 已使用 N / M 次`
- 表格：序号 · 使用者（头像+昵称+@username）· 注册时间 · 来源 IP（后端脱敏，保留前两段）· 账号状态（正常 success / 已禁用 error）
- 空态：「该邀请码尚未被使用」+ 剩余额度与有效期
- 底部：关闭

## 34. 注册页邀请码字段（`/register`）

**文件**：`views/Register.vue` · **mockup**：`00-login.html`（注册形态）

- `onMounted` 调 `getRegisterConfig()` → `GET /auth/register-config`，取 `inviteCodeRequired`（同时可复用 `captchaEnabled` 替换现有硬编码 `false`）。
- 字段位置：邮箱之后、验证码之前；`v-if="inviteCodeRequired"`；label 带红色 `*`。
- 输入即时规范化：`v.replace(/[\s-]/g, '').toUpperCase()`，粘贴带连字符/小写也能通过。
- 校验：`required` + `max 32`；helper「注册需有效邀请码，请联系管理员获取」；底部补充「没有邀请码？请联系站点管理员。」
- 注册失败按错误码映射 toast：

| code | 文案 |
|---|---|
| 95001 | 请输入邀请码 |
| 95002 | 邀请码无效，请核对后重试 |
| 95003 | 邀请码已被禁用 |
| 95004 | 邀请码已过期 |
| 95005 | 邀请码使用次数已用完 |
