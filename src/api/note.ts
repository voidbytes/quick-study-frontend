import request from './request'
import type { ApiResponse, PageResult } from '@/types'

export interface NoteItem {
  noteId: string
  questionId: string
  bankId: string
  contentPreview: string
  questionType: string | null
  questionPreview: string | null
  bankName: string
  hasOriginal: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface NoteDetail {
  id: string
  questionId: string
  bankId: string
  content: string
  createdAt: string | null
  updatedAt: string | null
}

export interface NoteStats {
  total: number
  weeklyNew: number
}

export interface NoteListParams {
  page?: number
  size?: number
  bankId?: number
  type?: string
  keyword?: string
}

/** 查询我的某题笔记；无笔记 data 为 null（正常态） */
export function getNote(questionId: string | number) {
  return request.get<ApiResponse<NoteDetail | null>>(`/notes/questions/${questionId}`)
}

/** 保存笔记（upsert） */
export function saveNote(questionId: string | number, content: string) {
  return request.put<ApiResponse<NoteDetail>>(`/notes/questions/${questionId}`, { content })
}

/** 删除笔记（幂等） */
export function deleteNote(questionId: string | number) {
  return request.delete<ApiResponse<null>>(`/notes/questions/${questionId}`)
}

/** 我的笔记分页列表 */
export function listNotes(params?: NoteListParams) {
  return request.get<ApiResponse<PageResult<NoteItem>>>('/notes', { params })
}

/** 笔记统计（总数 / 本周新增） */
export function noteStats() {
  return request.get<ApiResponse<NoteStats>>('/notes/stats')
}

/** 笔记图片禁令校验正则（与后端 NoteServiceImpl.IMAGE_PATTERN 一致） */
export const NOTE_IMAGE_PATTERN = /!\[[^\]]*\]\([^)]*\)|<img\b/i
