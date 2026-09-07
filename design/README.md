# Quick Study Web — UI 设计稿

> 与 `frontend/src` 代码同步的 UI 设计稿 · 33 个页面/弹窗/抽屉 · AI 可读结构化输出
>
> **同步约定：`frontend/src` 是唯一事实源，设计稿（mockups / docs）跟随代码更新；
> 两者冲突时以代码为准。**

## 目录结构

```
frontend/design/
├── README.md                           # 本文件
├── tokens/                             # 设计令牌 (Design Tokens)
│   ├── design-tokens.css               # CSS 自定义属性 (可直接引入 Vue 项目)
│   ├── design-tokens.json              # JSON 格式 (供 AI 程序化读取)
│   └── tailwind.config.js              # Tailwind CSS 配置 (替换项目现有配置)
├── mockups/                            # HTML 高保真设计稿
│   ├── styles/
│   │   └── mockup.css                  # 共享样式文件 (所有 mockup 引用)
│   ├── index.html                      # 设计稿索引页
│   ├── 00-login.html                   # 登录 / 注册（注册含邀请码必填字段）
│   ├── 01-home.html                    # 首页 / Dashboard
│   ├── 02-bank-list.html               # 题库列表
│   ├── 03-bank-detail.html             # 题库详情
│   ├── 04-question-list.html           # 题目管理
│   ├── 05-paper-list.html              # 试卷列表
│   ├── 06-exam-page.html               # 考试答题
│   ├── 07-practice-page.html           # 随机练习
│   ├── 08-exam-result.html             # 考试结果
│   ├── 09-statistics.html              # 统计面板
│   ├── 10-wrong-questions.html         # 错题本
│   ├── 11-records.html                 # 做题记录
│   ├── 12-search.html                  # 搜索
│   ├── 13-notifications.html           # 通知中心
│   ├── 14-profile.html                 # 个人中心
│   ├── 18-favorites.html               # 收藏题目
│   ├── 19-playground.html              # 代码运行台 (Playground)
│   ├── 20-exam-records.html            # 考试记录
│   ├── 21-grading-list.html            # 待批改列表
│   ├── 22-grading-detail.html          # 批改详情
│   ├── 23-practice-create-dialog.html  # 创建练习弹窗
│   ├── 24-practice-list.html           # 练习记录列表
│   ├── 25-paper-form.html              # 创建/编辑试卷（组卷向导）
│   ├── 26-question-create.html         # 创建/编辑题目表单（含题目详情形态）
│   ├── 27-bank-import-dialog.html      # 导入题库弹窗
│   ├── 28-question-import-dialog.html  # 导入题目弹窗
│   ├── 29-tag-manage-modal.html        # 标签管理弹窗
│   ├── 30-paper-detail.html            # 试卷详情
│   ├── 31-admin-reviews.html           # 审核列表
│   ├── 32-invite-code-manage.html      # 邀请码管理（ADMIN+ 可见）
│   └── 33-invite-code-generate-dialog.html  # 生成邀请码 / 生成结果 / 使用记录弹窗
└── docs/                               # 设计文档
    ├── design-system.md                # 设计系统文档 (色彩/字体/间距/圆角/阴影/布局/Naive UI 主题)
    ├── component-specs.md              # 组件规范 (25 个真实组件 + 组合式函数 + 工具函数)
    ├── page-specs.md                   # 页面规范 (33 章的布局/组件/接口/交互)
    └── ai-implementation-guide.md      # AI 实现指南 (7 步改造流程 + 代码示例)
```

## 设计系统核心

| 维度 | 值 | 说明 |
|------|------|------|
| 主色 | `#5B5FE9` (Indigo) | 按钮、链接、选中态 |
| 品牌渐变 | `linear-gradient(135deg, #5B5FE9, #7C4FD4)` | 欢迎横幅、Logo、登录页 |
| 正文字号 | `14px` | Web 端紧凑排版 |
| 间距基准 | `4px` 网格 | 所有间距为 4 的倍数 |
| 卡片圆角 | `12px` | 统一容器圆角 |
| 卡片阴影 | 默认无阴影 (用边框) | 悬浮时 shadow-sm |
| 页面背景 | `#F4F4F6` | 中性灰 |
| 正文颜色 | `#242428` | 非纯黑 |
| 侧边栏宽 | `240px` | 可折叠至 64px |
| 顶栏高度 | `64px` | sticky 定位 |

## 如何使用

### 给 AI 的提示词

> 请阅读 `frontend/design/docs/ai-implementation-guide.md`，按照指南中的 7 个步骤，
> 逐步修改 `frontend/src/` 下的 Vue 代码，使 UI 与设计稿一致。
> 设计令牌在 `frontend/design/tokens/` 目录，
> 组件规范在 `frontend/design/docs/component-specs.md`，
> 页面规范在 `frontend/design/docs/page-specs.md`。

### 本地预览设计稿

```bash
# 用浏览器打开索引页
open frontend/design/mockups/index.html

# 或启动静态服务器
cd frontend/design/mockups && python3 -m http.server 8080
```

## 技术栈

- **前端框架**: Vue 3 + Vite
- **UI 库**: Naive UI 2.x
- **样式**: Tailwind CSS 3.x
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图表**: ECharts 5
- **图标**: @vicons/ionicons5 (Ionicons 5)

## 设计原则

1. **品牌一致性**: Web 端与移动端共用 Indigo 品牌色系
2. **边框优先**: 卡片默认用 1px 边框区分层级，不滥用阴影
3. **4px 网格**: 所有间距、尺寸遵循 4px 基准网格
4. **语义化色彩**: 正确用 success/error/warning，不混用 green/red
5. **信息密度**: Web 端适合更高信息密度，表格+卡片混合布局
6. **响应式**: 侧边栏在移动端转为抽屉，内容区自适应
