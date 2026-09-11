import request from './request'
import type { ApiResponse, PageResult, FavoriteItem, FavoriteStats, QuestionType } from '@/types'
import { ensureBlob } from './importExport'

export interface FavoriteListParams {
  page?: number
  size?: number
  bankId?: string
  /** 标签 id（单库场景） */
  tagId?: string
  /** 标签名（跨库场景推荐，大小写不敏感；与 tagId 取并集） */
  tagNames?: string[]
  type?: QuestionType | null
  /** favoritedAt_desc（默认） | favoritedAt_asc */
  sortBy?: string
}

// 收藏列表（按题库 / 标签 / 题型筛选）
export function listFavorites(params?: FavoriteListParams) {
  return request.get<ApiResponse<PageResult<FavoriteItem>>>('/favorites', { params })
}

// 取消收藏（按收藏记录 ID）
export function cancelFavorite(id: string) {
  return request.delete<ApiResponse<null>>(`/favorites/${id}`)
}

// 收藏统计（总数 / 本周新增 / 本月练习 / 待复习）
export function getFavoriteStats() {
  return request.get<ApiResponse<FavoriteStats>>('/favorites/stats')
}

// 批量导出收藏题目（流式下载 JSON，格式与全站题目导出一致）
export function exportFavorites(params?: {
  bankId?: string
  tagId?: string
  tagNames?: string[]
  type?: QuestionType | null
}) {
  return ensureBlob(
    request.get<Blob>('/favorites/export', { params, responseType: 'blob' })
  )
}
