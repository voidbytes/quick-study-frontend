import request from './request'
import type { ApiResponse, OverviewStats, QuestionAccuracy, PaperStatistics } from '@/types'

export type OverviewResponse = OverviewStats

export function getOverview() {
  return request.get<ApiResponse<OverviewStats>>('/statistics/overview')
}

export function getStatisticsOverview() {
  return request.get<ApiResponse<OverviewStats>>('/statistics/overview')
}

export function getQuestionAccuracy(params?: { bankId?: string; startDate?: string; endDate?: string }) {
  return request.get<ApiResponse<QuestionAccuracy[]>>('/statistics/question-accuracy', { params })
}

export function getPaperStatistics(paperId: string) {
  return request.get<ApiResponse<PaperStatistics>>(`/statistics/papers/${paperId}`)
}