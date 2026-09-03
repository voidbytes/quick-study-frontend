<template>
  <n-select
    :value="modelValue ?? null"
    :options="options"
    :placeholder="placeholder"
    filterable
    clearable
    remote
    :loading="searching"
    @search="handleSearch"
    @update:value="handleUpdate"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { searchUsers, type UserSearchItem } from '@/api/user'

/**
 * 用户远程搜索选择器（按 username / nickname 模糊搜索）。
 * 用于批改人指定等场景：输入关键字即搜，选项展示「昵称 (username)」。
 */
const props = defineProps<{
  modelValue: number | null
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const options = ref<{ label: string; value: number }[]>([])
const searching = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

/** 当前选中项的展示名（父组件确认页直接展示用） */
const currentLabel = computed(() =>
  options.value.find((o) => o.value === props.modelValue)?.label ?? null
)

function labelOf(u: UserSearchItem): string {
  return u.nickname ? `${u.nickname} (${u.username})` : u.username
}

async function doSearch(keyword: string) {
  if (!keyword || !keyword.trim()) {
    options.value = []
    return
  }
  searching.value = true
  try {
    const res = await searchUsers(keyword.trim(), 20)
    options.value = (res.data || []).map((u) => ({ label: labelOf(u), value: u.id }))
  } catch {
    // 搜索失败静默处理，保留已有选项
  } finally {
    searching.value = false
  }
}

/** 300ms 防抖，避免逐字打请求 */
function handleSearch(keyword: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => doSearch(keyword), 300)
}

function handleUpdate(value: number | null) {
  emit('update:modelValue', value)
}

function handleClear() {
  emit('update:modelValue', null)
}

/**
 * 预置选中项（编辑场景：已知 id 与展示名，无需再搜索）。
 */
function preset(id: number, label: string) {
  if (!options.value.some((o) => o.value === id)) {
    options.value = [{ label, value: id }, ...options.value]
  }
}

defineExpose({ preset, currentLabel })

onMounted(() => {
  // 初始不加载任何选项，等用户输入再搜索
})
</script>
