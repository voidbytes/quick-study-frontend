/**
 * Quick Study Web — Tailwind CSS 配置 (设计令牌扩展)
 *
 * 本文件应替换 frontend/tailwind.config.js 中的 theme.extend 部分。
 * AI 可直接读取此文件并应用到项目中。
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}'
  ],
  theme: {
    extend: {
      /* --- 色彩系统 --- */
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
        // neutral 已在 Tailwind 默认灰阶中，这里覆盖为设计系统的精确值
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

      /* --- 字体系统 --- */
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

      /* --- 圆角系统 --- */
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px'
      },

      /* --- 阴影系统 --- */
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 4px 16px rgba(0, 0, 0, 0.10)',
        'xl': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'brand': '0 4px 12px rgba(91, 95, 233, 0.25)'
      },

      /* --- 过渡动画 --- */
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms'
      },

      /* --- 品牌渐变 --- */
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5B5FE9 0%, #7C4FD4 100%)',
        'brand-soft': 'linear-gradient(135deg, #EEF0FF 0%, #F5F0FF 100%)'
      },

      /* --- 布局常量 --- */
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
