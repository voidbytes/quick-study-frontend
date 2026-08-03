import dayjs from 'dayjs'

export function formatDate(date: string | Date | undefined | null, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date | undefined | null): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

export function formatDuration(minutes: number | undefined | null): string {
  if (minutes === undefined || minutes === null) return '-'
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null) return '-'
  return score.toFixed(1)
}

export function truncateText(text: string | undefined | null, maxLength: number = 50): string {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}