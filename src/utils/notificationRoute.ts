import type { Notification } from '@/types'

type NotifLike = Partial<Omit<Notification, 'type'>> & { type?: string }

/**
 * 通知跳转路由统一解析（大厂通用方案）：
 * 1. 优先消费后端下发的 link（服务端显式指定，覆盖一切约定）
 * 2. link 缺失时按 type + relatedId 做约定式映射兜底，
 *    保证存量数据 / 后端漏传 link 时通知仍可跳转
 *
 * 注意 relatedId 语义与后端发送点保持一致：
 * - GRADING_PENDING / GRADING_DONE：examSessionId
 * - GRADING_ASSIGNED：paperId（分配时可能尚无会话，跳批改列表）
 * - GRADING_TIMEOUT：examSessionId（前端无法反查 paperId，跳试卷列表）
 * - REVIEW_RESULT：questionId（需 bankId 才能构造详情路由，无法兜底）
 */
export function resolveNotificationRoute(notif: NotifLike | null | undefined): string | null {
  if (!notif) return null
  if (notif.link) return notif.link

  const relatedId = notif.relatedId
  switch (notif.type) {
    case 'GRADING_PENDING':
      return relatedId ? `/grading/sessions/${relatedId}` : '/grading'
    case 'GRADING_ASSIGNED':
      return '/grading'
    case 'GRADING_DONE':
      return relatedId ? `/exam/sessions/${relatedId}/result` : '/records'
    case 'GRADING_TIMEOUT':
      return '/papers'
    default:
      // REVIEW_RESULT / COLLAB_INVITE / BANK_TRANSFER 等无法从 relatedId
      // 单独构造路由，依赖后端 link
      return null
  }
}
