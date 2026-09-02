import type { GlobalThemeOverrides } from 'naive-ui'

/**
 * Quick Study Web — Naive UI 全局主题覆盖
 *
 * 将 Naive UI 默认绿色主题替换为设计系统的 Indigo #5B5FE9 主题。
 * 所有取值来源于 design/tokens/design-tokens.css 与 design/docs/design-system.md，
 * 组件级细节（按钮圆角/字重、卡片标题字号、弹窗圆角）以 mockups 实际视觉为准。
 */
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
