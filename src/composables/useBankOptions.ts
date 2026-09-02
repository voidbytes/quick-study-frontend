import { ref, onMounted, type Ref } from 'vue'
import { getBankList } from '@/api/bank'
import type { SelectOption } from 'naive-ui'

/** 当前用户可用的题库下拉选项（含"全部/不限"场景由调用方决定是否插入）。 */
export function useBankOptions() {
  const bankOptions = ref<SelectOption[]>([])
  const loading = ref(false)

  async function loadBankOptions() {
    loading.value = true
    try {
      const res = await getBankList({ page: 1, size: 200 })
      bankOptions.value = (res.data.records || []).map(b => ({
        label: b.name,
        value: b.id
      }))
    } finally {
      loading.value = false
    }
  }

  onMounted(loadBankOptions)

  return { bankOptions, loading, loadBankOptions }
}
