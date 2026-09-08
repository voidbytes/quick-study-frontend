<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="我的笔记" subtitle="沉淀你在一道道题目上的思考与总结" />

    <!-- 统计卡 -->
    <div class="grid grid-cols-2 gap-3 mb-4 md:max-w-md">
      <StatCard label="笔记总数" :value="stats.total" />
      <StatCard label="本周新增" :value="stats.weeklyNew" />
    </div>

    <!-- 筛选 -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索笔记内容"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
      <n-select
        v-model:value="filterBankId"
        :options="bankOptions"
        placeholder="题库"
        style="width: 180px"
        clearable
        filterable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterType"
        :options="typeOptions"
        placeholder="题型"
        style="width: 140px"
        clearable
        @update:value="handleSearch"
      />
      <n-button quaternary @click="handleReset">重置</n-button>
    </div>

    <!-- 列表 -->
    <n-spin :show="loading">
      <EmptyState
        v-if="!loading && !items.length"
        title="还没有笔记"
        description="在练习或题目详情页点击笔记按钮，开始记录你的思考"
      />
      <div v-else class="grid gap-3">
        <div
          v-for="item in items"
          :key="item.noteId"
          class="bg-white border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
          @click="openEdit(item)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <n-tag v-if="item.questionType" size="small" round :bordered="false" type="info">
                  {{ typeLabels[item.questionType] || item.questionType }}
                </n-tag>
                <span class="text-xs text-neutral-500">{{ item.bankName }}</span>
                <n-tag v-if="!item.hasOriginal" size="small" round :bordered="false" type="warning">
                  原题已删除
                </n-tag>
              </div>
              <div class="text-sm font-medium text-neutral-900 mb-1 line-clamp-2">
                {{ item.questionPreview || '（原题已删除）' }}
              </div>
              <div class="text-sm text-neutral-600 line-clamp-2 whitespace-pre-wrap">{{ item.contentPreview }}</div>
            </div>
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <span class="text-xs text-neutral-400">{{ formatTime(item.updatedAt) }}</span>
              <div class="flex gap-1">
                <n-button
                  v-if="item.hasOriginal"
                  size="tiny"
                  quaternary
                  type="info"
                  @click.stop="goOriginal(item)"
                >
                  查看原题
                </n-button>
                <n-tooltip v-else>
                  <template #trigger>
                    <n-button size="tiny" quaternary disabled>查看原题</n-button>
                  </template>
                  原题已删除
                </n-tooltip>
                <n-button size="tiny" quaternary type="error" @click.stop="handleDelete(item)">
                  删除
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.itemCount > pagination.pageSize" class="flex justify-center mt-4">
        <n-pagination
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.itemCount"
          @update:page="handlePageChange"
        />
      </div>
    </n-spin>

    <!-- 编辑抽屉 -->
    <n-drawer v-model:show="showEditor" :width="520" placement="right">
      <n-drawer-content :title="editingTitle" closable>
        <div class="flex flex-col h-full">
          <MarkdownEditor
            v-model="editingContent"
            mode="edit"
            height="340px"
            :disable-image="true"
            placeholder="记录这道题的易错点、思路、口诀……（支持 Markdown，不支持图片）"
          />
          <div class="flex items-center justify-between mt-2 text-xs" :class="overLimit ? 'text-red-500' : 'text-neutral-400'">
            <span v-if="imageDetected" class="text-red-500">笔记不支持图片，请移除图片内容</span>
            <span>{{ editingContent.length }} / 16000</span>
          </div>
          <div class="flex-1" />
          <div class="flex gap-2 pt-3">
            <n-button type="primary" class="flex-1" :loading="saving" :disabled="!canSave" @click="handleSave">
              保存
            </n-button>
            <n-button v-if="editingNoteId" quaternary type="error" @click="handleDeleteFromEditor">
              删除笔记
            </n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NButton, NTag, NTooltip } from 'naive-ui'
import {
  listNotes,
  getNote,
  saveNote,
  deleteNote,
  noteStats,
  NOTE_IMAGE_PATTERN,
  type NoteItem
} from '@/api/note'
import { useBankOptions } from '@/composables/useBankOptions'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import { SearchOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()
const { bankOptions, loadBankOptions } = useBankOptions()

const loading = ref(false)
const saving = ref(false)
const items = ref<NoteItem[]>([])
const searchKeyword = ref('')
const filterBankId = ref<number | null>(null)
const filterType = ref<string | null>(null)
const stats = reactive({ total: 0, weeklyNew: 0 })
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

const typeOptions = [
  { label: '单选题', value: 'SINGLE' },
  { label: '多选题', value: 'MULTIPLE' },
  { label: '判断题', value: 'TRUE_FALSE' },
  { label: '填空题', value: 'FILL_BLANK' },
  { label: '简答题', value: 'SHORT_ANSWER' },
  { label: '编程题', value: 'PROGRAMMING' }
]

const typeLabels: Record<string, string> = {
  SINGLE: '单选',
  MULTIPLE: '多选',
  TRUE_FALSE: '判断',
  FILL_BLANK: '填空',
  SHORT_ANSWER: '简答',
  PROGRAMMING: '编程'
}

const MAX_CONTENT_LENGTH = 16000

// ==================== 编辑抽屉 ====================

const showEditor = ref(false)
const editingNoteId = ref<string | null>(null)
const editingQuestionId = ref<string | null>(null)
const editingTitle = ref('')
const editingContent = ref('')

const overLimit = computed(() => editingContent.value.length > MAX_CONTENT_LENGTH)
const imageDetected = computed(() => NOTE_IMAGE_PATTERN.test(editingContent.value))
const canSave = computed(
  () => editingContent.value.trim().length > 0 && !overLimit.value && !imageDetected.value
)

async function openEdit(item: NoteItem) {
  editingNoteId.value = item.noteId
  editingQuestionId.value = item.questionId
  editingTitle.value = item.questionPreview || '编辑笔记'
  editingContent.value = ''
  showEditor.value = true
  try {
    const res = await getNote(item.questionId)
    if (res.data) {
      editingContent.value = res.data.content
    }
  } catch {
    // 回显失败保持空内容，保存时后端校验兜底
  }
}

async function handleSave() {
  if (!canSave.value || !editingQuestionId.value) return
  saving.value = true
  try {
    await saveNote(editingQuestionId.value, editingContent.value)
    message.success('笔记已保存')
    showEditor.value = false
    loadList()
    loadStats()
  } catch (e: any) {
    message.error(e?.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function handleDelete(item: NoteItem) {
  confirmDanger({
    title: '删除笔记',
    content: '确定删除这条笔记吗？删除后不可恢复。',
    onPositiveClick: async () => {
      try {
        await deleteNote(item.questionId)
        message.success('已删除')
        loadList()
        loadStats()
      } catch (e: any) {
        message.error(e?.response?.data?.message || '删除失败')
      }
    }
  })
}

function handleDeleteFromEditor() {
  if (!editingQuestionId.value) return
  confirmDanger({
    title: '删除笔记',
    content: '确定删除这条笔记吗？删除后不可恢复。',
    onPositiveClick: async () => {
      try {
        await deleteNote(editingQuestionId.value!)
        message.success('已删除')
        showEditor.value = false
        loadList()
        loadStats()
      } catch (e: any) {
        message.error(e?.response?.data?.message || '删除失败')
      }
    }
  })
}

function goOriginal(item: NoteItem) {
  // hasOriginal=false 的入口已置灰禁点，404 体验留在编辑抽屉外的其他场景
  router.push(`/banks/${item.bankId}/questions/${item.questionId}`)
}

function formatTime(time: string | null) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : ''
}

// ==================== 列表加载 ====================

async function loadList() {
  loading.value = true
  try {
    const res = await listNotes({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      bankId: filterBankId.value ?? undefined,
      type: filterType.value || undefined
    })
    items.value = res.data.records
    pagination.itemCount = res.data.total
  } catch (e: any) {
    message.error(e?.response?.data?.message || '加载笔记列表失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await noteStats()
    stats.total = res.data.total
    stats.weeklyNew = res.data.weeklyNew
  } catch {
    // 统计失败不影响主列表
  }
}

function handleSearch() {
  pagination.page = 1
  loadList()
}

function handleReset() {
  searchKeyword.value = ''
  filterBankId.value = null
  filterType.value = null
  handleSearch()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadList()
}

onMounted(() => {
  loadList()
  loadStats()
  loadBankOptions()
})
</script>
