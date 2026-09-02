import { ref, computed, type Ref } from 'vue'
import type { PageResult } from '@/types'

/**
 * 分页列表通用逻辑。
 * 用法：
 *   const { page, pageSize, itemCount, fetchList, paginationProps } = usePagination(async (p) => {
 *     const res = await api.list({ page: p.page, size: p.pageSize })
 *     return res.data
 *   })
 */
interface UsePaginationReturn<T> {
  /** 当前页码（1 起） */
  page: Ref<number>
  /** 每页条数 */
  pageSize: Ref<number>
  /** 总记录数 */
  itemCount: Ref<number>
  /** 是否加载中 */
  loading: Ref<boolean>
  /** 数据列表 */
  data: Ref<T[]>
  /** 触发拉取（不重置页码，用于搜索后回到第 1 页时传 true） */
  fetchList: (reset?: boolean) => Promise<void>
  /** 供 n-pagination 直接绑定的 props */
  pagination: Ref<{ page: number; pageSize: number; itemCount: number }>
}

export function usePagination<T>(
  fetcher: (params: { page: number; pageSize: number }) => Promise<PageResult<T>>
): UsePaginationReturn<T> {
  const page = ref(1)
  const pageSize = ref(10)
  const itemCount = ref(0)
  const loading = ref(false)
  const data = ref<T[]>([]) as Ref<T[]>

  async function fetchList(reset = false) {
    if (reset) page.value = 1
    loading.value = true
    try {
      const result = await fetcher({ page: page.value, pageSize: pageSize.value })
      data.value = result.records
      itemCount.value = result.total
    } finally {
      loading.value = false
    }
  }

  const pagination = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    itemCount: itemCount.value
  }))

  return { page, pageSize, itemCount, loading, data, fetchList, pagination }
}
