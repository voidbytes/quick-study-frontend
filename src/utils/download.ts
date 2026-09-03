import dayjs from 'dayjs'

/**
 * 触发浏览器下载 Blob。
 * @param blob 文件内容
 * @param fileName 下载文件名（含扩展名）
 */
export function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 生成导出文件名时间戳：20260903_193012 */
export function nowStamp(): string {
  return dayjs().format('YYYYMMDD_HHmmss')
}

/** 生成 ISO 时间字符串，用于导出文件内 exportedAt（与后端约定 ISO_LOCAL_DATE_TIME） */
export function nowIso(): string {
  return dayjs().format('YYYY-MM-DDTHH:mm:ss')
}
