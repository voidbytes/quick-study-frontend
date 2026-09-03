# Quick Study Web — UI 设计稿

> 大厂级 UI 重设计 · 16 个核心页面 · AI 可读结构化输出

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
│   ├── 00-login.html                   # 登录 / 注册
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
│   └── 15-admin-users.html             # 用户管理
└── docs/                               # 设计文档
    ├── design-system.md                # 设计系统文档 (色彩/字体/间距/圆角/阴影/布局/Naive UI 主题)
    ├── component-specs.md              # 组件规范 (17 个组件的 HTML 结构 + Naive UI 映射)
    ├── page-specs.md                   # 页面规范 (16 个页面的布局/组件/接口/交互)
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
