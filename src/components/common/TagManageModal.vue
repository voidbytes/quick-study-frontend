<template>
  <n-modal
    :show="show"
    preset="card"
    title="标签管理"
    style="width: 560px"
    @update:show="$emit('update:show', $event)"
  >
    <div class="flex flex-col gap-3">
      <!-- 搜索 -->
      <n-input v-model:value="keyword" placeholder="搜索标签..." clearable />

      <!-- 新建标签 -->
      <div v-if="authStore.isAdmin" class="flex items-center gap-2">
        <n-input v-model:value="newName" placeholder="新标签名" size="small" style="width: 180px" @keyup.enter="handleCreate" />
        <n-input v-model:value="newGroup" placeholder="分组（可选）" size="small" style="width: 160px" @keyup.enter="handleCreate" />
        <n-button size="small" type="primary" :loading="creating" @click="handleCreate">添加</n-button>
      </div>

      <!-- 标签列表 -->
      <div class="max-h-96 overflow-y-auto border border-neutral-200 rounded divide-y divide-neutral-100">
        <div v-if="filteredTags.length === 0" class="px-4 py-6 text-center text-neutral-400 text-sm">
          {{ tags.length === 0 ? '暂无标签' : '无匹配标签' }}
        </div>
        <div v-for="tag in filteredTags" :key="tag.id" class="flex items-center gap-2 px-3 py-2">
          <span class="text-sm truncate flex-1">{{ tag.name }}</span>
          <span class="text-xs text-neutral-400 shrink-0">使用 {{ tag.usageCount ?? 0 }}</span>

          <!-- 分组展示 / 编辑 -->
          <template v-if="authStore.isAdmin">
            <template v-if="editingId === tag.id">
              <n-input
                v-model:value="editingGroup"
                size="tiny"
                placeholder="分组名"
                style="width: 140px"
                @keyup.enter="saveGroup(tag)"
              />
              <n-button size="tiny" type="primary" :loading="saving" @click="saveGroup(tag)">保存</n-button>
              <n-button size="tiny" @click="cancelEdit">取消</n-button>
            </template>
            <template v-else>
              <n-tag :type="tag.groupName ? 'info' : 'default'" size="small" class="cursor-pointer" @click="startEdit(tag)">
                {{ tag.groupName || '未分组' }}
              </n-tag>
              <n-button size="tiny" quaternary @click="startEdit(tag)">改组</n-button>
              <n-button size="tiny" quaternary type="error" :disabled="(tag.usageCount ?? 0) > 0" @click="handleDelete(tag)">删除</n-button>
            </template>
          </template>
          <template v-else>
            <n-tag :type="tag.groupName ? 'info' : 'default'" size="small">{{ tag.groupName || '未分组' }}</n-tag>
          </template>
        </div>
      </div>

      <p v-if="authStore.isAdmin" class="text-xs text-neutral-400">
        分组仅用于展示导航（安卓端折叠、选择器分区），不影响筛选；点击分组标签可编辑，清空保存即取消分组。已使用的标签不可删除。
      </p>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import type { Tag } from '@/types'
import { getTagList, create, updateTagGroup, deleteTag } from '@/api/tag'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void
  (e: 'updated'): void
}>()

const message = useMessage()
const authStore = useAuthStore()
const { confirmDanger } = useConfirm()

const tags = ref<Tag[]>([])
const keyword = ref('')
const creating = ref(false)
const saving = ref(false)
const newName = ref('')
const newGroup = ref('')
const editingId = ref<number | null>(null)
const editingGroup = ref('')

const filteredTags = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return tags.value
  return tags.value.filter(
    (t) => t.name.toLowerCase().includes(kw) || (t.groupName || '').toLowerCase().includes(kw)
  )
})

watch(
  () => props.show,
  (v) => {
    if (v) load()
  }
)

async function load() {
  try {
    const res = await getTagList()
    tags.value = res.data || []
  } catch {
    // 忽略错误
  }
}

async function handleCreate() {
  const name = newName.value.trim()
  if (!name) {
    message.warning('请输入标签名')
    return
  }
  creating.value = true
  try {
    await create({ name, groupName: newGroup.value.trim() || undefined })
    message.success('标签已添加')
    newName.value = ''
    newGroup.value = ''
    await load()
    emit('updated')
  } catch {
    message.error('添加失败')
  } finally {
    creating.value = false
  }
}

function startEdit(tag: Tag) {
  editingId.value = tag.id
  editingGroup.value = tag.groupName || ''
}

function cancelEdit() {
  editingId.value = null
  editingGroup.value = ''
}

async function saveGroup(tag: Tag) {
  saving.value = true
  try {
    await updateTagGroup(tag.id, editingGroup.value.trim() || undefined)
    message.success('分组已更新')
    cancelEdit()
    await load()
    emit('updated')
  } catch {
    message.error('分组更新失败（仅管理员可操作）')
  } finally {
    saving.value = false
  }
}

async function handleDelete(tag: Tag) {
  confirmDanger({
    title: '确认删除',
    content: `确认删除标签「${tag.name}」？`,
    onPositiveClick: async () => {
      try {
        await deleteTag(tag.id)
        message.success('标签已删除')
        await load()
        emit('updated')
      } catch {
        message.error('删除失败（仅管理员可删除未被引用的标签）')
      }
    }
  })
}
</script>
