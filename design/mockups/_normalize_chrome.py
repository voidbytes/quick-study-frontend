# -*- coding: utf-8 -*-
"""
将 design/mockups 下的设计稿「外壳」（侧边栏 + 顶栏）统一为 src/layout/MainLayout.vue 的当前实现。

变更点（均以代码为准）：
1. 删除代码里不存在的「暗色模式」切换按钮与「语言」切换器
2. 删除代码里不存在的「回到顶部」按钮及其滚动监听脚本
3. 侧边栏导航改为代码中的真实分组与顺序，去掉不存在的角标（错题本 47 / 通知 3）
4. 移动端汉堡菜单移到 header-left（代码中位于 app-header-left）
5. 顶栏搜索框占位符改为代码中的「搜索题目 / 题库 / 试卷」
6. 头像使用品牌渐变（代码 bg-brand-gradient）
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
MOCK = ROOT / "design" / "mockups"

# 文件名 -> 侧边栏高亮项（None 表示无高亮，对应代码中 activeMenu 回退或侧边栏无此入口的场景）
ACTIVE_MAP = {
    "01-home.html": "首页",
    "02-bank-list.html": "题库",
    "03-bank-detail.html": "题库",
    "04-question-list.html": "题目",
    "05-paper-list.html": "试卷",
    "08-exam-result.html": "首页",
    "09-statistics.html": "统计",
    "10-wrong-questions.html": "错题本",
    "11-records.html": "做题记录",
    "12-search.html": "搜索",
    "13-notifications.html": "通知",
    "14-profile.html": None,
    "15-admin-users.html": "用户管理",
}

# 侧边栏项：显示名 -> (图标, 跳转设计稿 or None)
NAV_GROUPS = [
    (None, [
        ("首页", "home-outline", "01-home.html"),
        ("题库", "library-outline", "02-bank-list.html"),
        ("题目", "document-text-outline", "04-question-list.html"),
        ("试卷", "file-tray-full-outline", "05-paper-list.html"),
    ]),
    ("学习中心", [
        ("练习", "game-controller-outline", "24-practice-list.html"),
        ("错题本", "close-circle-outline", "10-wrong-questions.html"),
        ("做题记录", "time-outline", "11-records.html"),
        ("统计", "bar-chart-outline", "09-statistics.html"),
        ("通知", "notifications-outline", "13-notifications.html"),
        ("搜索", "search-outline", "12-search.html"),
    ]),
    ("管理", [
        ("用户管理", "people-outline", "15-admin-users.html"),
        ("审核列表", "checkmark-done-outline", "28-admin-reviews.html"),
    ]),
]


def build_nav(active):
    lines = ['      <nav class="sidebar-nav">']
    for label, items in NAV_GROUPS:
        if label:
            lines.append(f'        <div class="sidebar-nav-label">{label}</div>')
        for name, icon, href in items:
            cls = "sidebar-nav-item active" if name == active else "sidebar-nav-item"
            jump = f" onclick=\"window.location.href='{href}'\"" if href else ""
            lines.append(
                f'        <div class="{cls}"{jump}>'
                f'<ion-icon name="{icon}"></ion-icon><span>{name}</span></div>'
            )
    lines.append("      </nav>")
    return "\n".join(lines)


HEADER_RIGHT = '''        <div class="app-header-right">
          <div class="header-search">
            <ion-icon name="search-outline"></ion-icon>
            <input class="input" type="text" placeholder="搜索题目 / 题库 / 试卷" readonly style="cursor:pointer;" onclick="window.location.href='12-search.html'">
          </div>
          <div style="position:relative;cursor:pointer;" onclick="window.location.href='13-notifications.html'">
            <ion-icon name="notifications-outline" style="font-size:22px;color:var(--text-secondary);"></ion-icon>
            <span class="badge" style="position:absolute;top:-4px;right:-4px;">3</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="window.location.href='14-profile.html'">
            <div class="avatar" style="background:var(--gradient-brand);">张</div>
            <span style="font-size:14px;font-weight:500;color:var(--text-primary);">张同学</span>
            <ion-icon name="chevron-down-outline" style="font-size:16px;color:var(--text-tertiary);"></ion-icon>
          </div>
        </div>'''

MOBILE_BTN = '<button class="mobile-menu-btn" onclick="document.querySelector(\'.sidebar\').classList.toggle(\'mobile-open\')"><ion-icon name="menu-outline"></ion-icon></button>'


def patch(text, name):
    # 1) 侧边栏整体替换
    new_nav = build_nav(ACTIVE_MAP.get(name))
    text, n = re.subn(
        r'      <nav class="sidebar-nav">.*?\n      </nav>',
        lambda m: new_nav,
        text,
        flags=re.S,
    )
    if n != 1:
        print(f"  ! {name}: 侧边栏未替换 (matched={n})")

    # 2) 顶栏右侧整体替换
    text, n = re.subn(
        r'        <div class="app-header-right">.*?\n        </div>\n      </header>',
        HEADER_RIGHT + "\n      </header>",
        text,
        flags=re.S,
    )
    if n != 1:
        print(f"  ! {name}: 顶栏未替换 (matched={n})")

    # 3) 汉堡菜单移到 header-left 首位
    text = re.sub(
        r'          <button class="mobile-menu-btn"[^>]*></ion-icon></button>\n',
        "",
        text,
        count=1,
    )
    text = re.sub(
        r'(        <div class="app-header-left">\n)',
        lambda m: m.group(1) + "          " + MOBILE_BTN + "\n",
        text,
        count=1,
    )

    # 4) 删除回到顶部按钮
    text = re.sub(
        r'<button class="back-to-top visible"[^>]*>.*?</button>\n',
        "",
        text,
        flags=re.S,
    )

    # 5) 删除回到顶部的滚动监听脚本
    text = re.sub(
        r'[ \t]*window\.addEventListener\("scroll",function\(\)\{var b=document\.querySelector\("\.back-to-top"\).*\n',
        "",
        text,
    )

    return text


def main():
    for name in sorted(ACTIVE_MAP):
        p = MOCK / name
        if not p.exists():
            print(f"  - {name}: 不存在，跳过")
            continue
        src = p.read_text(encoding="utf-8")
        out = patch(src, name)
        if out != src:
            p.write_text(out, encoding="utf-8")
            print(f"  ✓ {name}: 已更新外壳")
        else:
            print(f"  - {name}: 无变化")


if __name__ == "__main__":
    main()
