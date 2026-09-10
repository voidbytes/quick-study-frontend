import { describe, it, expect } from 'vitest'
import { resolveNotificationRoute } from '@/utils/notificationRoute'

describe('resolveNotificationRoute 通知跳转统一解析', () => {
  it('link 优先：后端下发的 link 直接返回', () => {
    const notif = { type: 'GRADING_DONE', relatedId: '', link: '/exam/sessions/123/result' }
    expect(resolveNotificationRoute(notif)).toBe('/exam/sessions/123/result')
  })

  it('link 缺失时 GRADING_PENDING 兜底到批改详情（relatedId 为 sessionId）', () => {
    expect(resolveNotificationRoute({ type: 'GRADING_PENDING', relatedId: '456' })).toBe('/grading/sessions/456')
  })

  it('GRADING_PENDING 无 relatedId 时兜底到批改列表', () => {
    expect(resolveNotificationRoute({ type: 'GRADING_PENDING', relatedId: '0' })).toBe('/grading')
  })

  it('GRADING_ASSIGNED 兜底到批改列表（relatedId 是 paperId，不能误当 sessionId）', () => {
    expect(resolveNotificationRoute({ type: 'GRADING_ASSIGNED', relatedId: '789' })).toBe('/grading')
  })

  it('link 缺失时 GRADING_DONE 兜底到成绩详情（relatedId 为 sessionId）', () => {
    expect(resolveNotificationRoute({ type: 'GRADING_DONE', relatedId: '321' })).toBe('/exam/sessions/321/result')
  })

  it('GRADING_TIMEOUT 兜底到试卷列表（前端无法由 sessionId 反查 paperId）', () => {
    expect(resolveNotificationRoute({ type: 'GRADING_TIMEOUT', relatedId: '555' })).toBe('/papers')
  })

  it('REVIEW_RESULT 无 link 时返回 null（relatedId 是 questionId，无法构造详情路由）', () => {
    expect(resolveNotificationRoute({ type: 'REVIEW_RESULT', relatedId: '99' })).toBeNull()
  })

  it('未知类型且无 link 返回 null', () => {
    expect(resolveNotificationRoute({ type: 'COLLAB_INVITE', relatedId: '1' })).toBeNull()
  })

  it('空对象与 null 返回 null', () => {
    expect(resolveNotificationRoute({})).toBeNull()
    expect(resolveNotificationRoute(null)).toBeNull()
  })
})
