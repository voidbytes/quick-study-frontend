/**
 * 前端分层日志工具 —— 大厂标准：级别分级 / 命名空间 / 环境收敛 / 统一格式化。
 *
 * - 级别：debug < info < warn < error
 * - 命名空间：`createLogger('http')` → logger.info('GET /xx 200') 输出 `[http] ...`
 * - 环境收敛：DEV 输出 debug/info；非 DEV 只输出 warn/error，避免生产泄漏与噪音
 * - 可扩展：生产可替换 reporter 上报远端（此处保留 console 出口）
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

/** 当前环境的输出阈值级别 */
function resolveMinLevel(): LogLevel {
  if (import.meta.env.DEV) return 'debug'
  // 非 dev（build/preview/prod）默认只留 warn 及以上
  return 'warn'
}

const MIN_LEVEL = resolveMinLevel()

/** 是否允许输出指定级别 */
function enabled(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL]
}

function formatArgs(level: LogLevel, namespace: string, args: unknown[]): unknown[] {
  // 简单着色便于 dev 区分（生产不额外开销样式，直接返回）
  if (!import.meta.env.DEV) return args
  const ts = new Date().toISOString().slice(11, 23)
  const color =
    level === 'error' ? '#F0503C' : level === 'warn' ? '#FFA42B' : level === 'info' ? '#5B5FE9' : '#8A8A96'
  return [
    `%c${ts} [${namespace}] ${level.toUpperCase()}`,
    `color:${color};font-weight:600`,
    ...args
  ]
}

export interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

/** 创建一个带命名空间的日志器，如 createLogger('auth') */
export function createLogger(namespace: string): Logger {
  const log = (level: LogLevel, args: unknown[]) => {
    if (!enabled(level)) return
    const formatted = formatArgs(level, namespace, args)
    // eslint-disable-next-line no-console
    console[level](...formatted)
  }

  return {
    debug: (...a) => log('debug', a),
    info: (...a) => log('info', a),
    warn: (...a) => log('warn', a),
    error: (...a) => log('error', a)
  }
}

/** 全局默认 logger（通用命名空间） */
export const logger = createLogger('app')
