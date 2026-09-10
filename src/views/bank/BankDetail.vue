<template>
  <div>
    <!-- 页头：返回 + 题库名称 + 管理员操作 -->
    <PageHeader :title="bank?.name || '题库详情'" :subtitle="bank?.description || undefined" showBack>
      <template #actions>
        <n-dropdown
          v-if="authStore.isAdmin && bank"
          trigger="click"
          :options="bankExportOptions"
          @select="handleBankExportSelect"
        >
          <n-button size="small" :loading="exporting || exportingMarkdown">
            导出
          </n-button>
        </n-dropdown>
        <n-button v-if="authStore.isAdmin && bank" size="small" @click="handleEdit">编辑</n-button>
        <n-button v-if="authStore.isAdmin && bank" size="small" @click="showTransfer = true">转让</n-button>
      </template>
    </PageHeader>

    <n-spin v-if="!loadError" :show="loading">
      <template v-if="bank">
        <!-- 可见性 / 协作标签 + 元信息卡 -->
        <div class="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
          <div class="flex flex-wrap gap-2 mb-3">
            <n-tag v-if="bank.isOfficial" type="warning" size="small" round>官方</n-tag>
            <n-tag :type="bank.isPublic ? 'success' : 'default'" size="small" round>
              {{ bank.isPublic ? '公开' : '私有' }}
            </n-tag>
          </div>
          <p class="text-sm text-neutral-500 leading-relaxed mb-4">
            {{ bank.description || '暂无描述' }}
          </p>
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
            <span class="inline-flex items-center gap-1.5">
              <n-icon :size="15" :component="PersonOutline" />
              创建者：{{ bank.creatorName || '未知用户' }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <n-icon :size="15" :component="TimeOutline" />
              更新于 {{ formatTime(bank.updatedAt) }}
            </span>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="题目数" :value="bank.questionCount ?? 0" tone="brand" />
          <StatCard label="练习次数" :value="bank.practiceCount ?? 0" />
          <!-- 协作人：创建者/管理员可查看与管理；其他用户不展示该卡（接口无权访问） -->
          <StatCard v-if="canManageCollaborators" label="协作人" :value="collaborators.length">
            <template #actions>
              <n-button
                size="tiny"
                type="primary"
                secondary
                @click="openCollaboratorManager"
              >
                管理
              </n-button>
            </template>
          </StatCard>
          <StatCard label="创建时间" :value="formatDate(bank.createdAt)" />
        </div>

        <!-- 题目列表 -->
        <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6">
          <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <span class="text-base font-semibold text-neutral-900">题目列表</span>
          </div>
          <div class="p-4">
            <QuestionList :bank-id="bankId" :bank-name="bank?.name" @imported="fetchDetail" />
          </div>
        </div>
      </template>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />

    <!-- 协作人管理弹窗（管理员）：列表 + 添加 -->
    <n-modal v-model:show="showCollaboratorManager" preset="card" title="协作人管理" style="width: 460px">
      <div class="mb-4">
        <div
          v-for="col in collaborators"
          :key="col.userId"
          class="flex items-center gap-3 py-2.5 border-b border-neutral-100 last:border-b-0"
        >
          <div
            class="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          >
            {{ (col.nickname || `用户${col.userId}`).charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-neutral-900 truncate">
              {{ col.nickname || `用户 #${col.userId}` }}
            </div>
            <div class="text-xs text-neutral-500">ID: {{ col.userId }}</div>
          </div>
          <n-tag size="small" :type="roleTagType(col.role)" round>
            {{ roleLabel(col.role) }}
          </n-tag>
          <n-button size="tiny" quaternary type="error" @click="handleRemoveCollaborator(col.userId)">
            移除
          </n-button>
        </div>
        <div v-if="collaborators.length === 0" class="text-sm text-neutral-400 text-center py-4">
          暂无协作人
        </div>
      </div>
      <n-form label-placement="top">
        <n-form-item label="添加协作人（用户ID）">
          <n-input v-model:value="newCollaboratorUserId" placeholder="输入用户ID" />
        </n-form-item>
        <n-button type="primary" block :loading="addColLoading" @click="handleAddCollaborator">
          添加
        </n-button>
      </n-form>
    </n-modal>

    <!-- 转让题库弹窗 -->
    <n-modal v-model:show="showTransfer" preset="card" title="转让题库" style="width: 400px">
      <n-form>
        <n-form-item label="目标用户ID">
          <n-input v-model:value="transferUserId" placeholder="输入用户ID" />
        </n-form-item>
        <n-button type="primary" block :loading="transferLoading" @click="handleTransfer">
          确认转让
        </n-button>
      </n-form>
    </n-modal>

    <!-- 导出 Markdown 弹窗（管理员） -->
    <n-modal v-model:show="showMarkdownExportDialog" preset="card" title="导出 Markdown" style="width: 420px">
      <n-form label-placement="top">
        <n-form-item label="包含答案与解析">
          <n-switch v-model:value="markdownExportForm.withAnswer">
            <template #checked>含答案</template>
            <template #unchecked>练习题版（无答案）</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="题型筛选（可多选，留空=全部）">
          <n-select
            v-model:value="markdownExportForm.typeFilter"
            :options="markdownTypeOptions"
            multiple
            clearable
            placeholder="不选=全部题型"
          />
        </n-form-item>
        <n-button type="primary" block :loading="exportingMarkdown" @click="handleExportMarkdown">
          导出
        </n-button>
      </n-form>
    </n-modal>

    <!-- 编辑题库弹窗 -->
    <n-modal v-model:show="showEditDialog" preset="card" title="编辑题库" style="width: 480px">
      <n-form ref="editFormRef" :model="editForm" :rules="editRules" label-placement="top">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="editForm.name" placeholder="题库名称" :maxlength="100" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="editForm.description"
            type="textarea"
            placeholder="题库描述（可选）"
            :maxlength="500"
            :rows="4"
          />
        </n-form-item>
        <div class="flex justify-end gap-2">
          <n-button @click="showEditDialog = false">取消</n-button>
          <n-button type="primary" :loading="editLoading" @click="handleSaveEdit">保存</n-button>
        </div>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, type FormRules, type FormInst } from 'naive-ui'
import type { QuestionBank, BankCollaborator } from '@/types'
import { getBankDetail, getCollaborators, addCollaborator, removeCollaborator, transferBank, updateBank } from '@/api/bank'
import { exportBank, exportBankMarkdown, type MarkdownExportParams } from '@/api/importExport'
import { triggerBlobDownload, nowStamp } from '@/utils/download'
import { QUESTION_TYPE_OPTIONS } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import QuestionList from '@/views/question/QuestionList.vue'
import LoadError from '@/components/LoadError.vue'
import { PersonOutline, TimeOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

/** 后端 BankResponse 实际包含的展示字段（QuestionBank 类型声明滞后，本地补全） */
interface BankInfo extends QuestionBank {
  isOfficial?: boolean
  creatorName?: string | null
  practiceCount?: number
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const bankId = route.params.id as string
const loading = ref(false)
const loadError = ref('')
const bank = ref<BankInfo | null>(null)
const collaborators = ref<BankCollaborator[]>([])

/** 协作人管理权限：管理员或题库创建者（与后端校验口径一致） */
const canManageCollaborators = computed(() => {
  if (authStore.isAdmin) return true
  const uid = authStore.userInfo?.id
  return uid != null && bank.value?.creatorId === uid
})
const exporting = ref(false)

/** 页头「导出」下拉项：JSON 题库导出 / Markdown 导出 */
const bankExportOptions = [
  { label: '导出题库（JSON）', key: 'json' },
  { label: '导出题库（Markdown）', key: 'markdown' }
]

function handleBankExportSelect(key: string) {
  if (key === 'json') handleExportBank()
  else showMarkdownExportDialog.value = true
}

const showMarkdownExportDialog = ref(false)
const exportingMarkdown = ref(false)
const markdownExportForm = reactive<MarkdownExportParams>({
  withAnswer: true,
  typeFilter: []
})
const markdownTypeOptions = QUESTION_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))

const showTransfer = ref(false)
const transferUserId = ref('')
const transferLoading = ref(false)

const showCollaboratorManager = ref(false)
const newCollaboratorUserId = ref('')
const addColLoading = ref(false)

const showEditDialog = ref(false)
const editFormRef = ref<FormInst>()
const editLoading = ref(false)
const editForm = reactive({
  name: '',
  description: ''
})
const editRules: FormRules = {
  name: [
    { required: true, message: '请输入题库名称', trigger: 'blur' },
    { max: 100, message: '名称不超过100字符', trigger: 'blur' }
  ]
}

const ROLE_TAG: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error' | 'primary'> = {
  EDITOR: 'info',
  REVIEWER: 'warning',
  VIEWER: 'default'
}
const ROLE_LABEL: Record<string, string> = {
  EDITOR: '编辑者',
  REVIEWER: '审阅者',
  VIEWER: '查看者'
}

function roleLabel(role: BankCollaborator['role'] | string): string {
  return ROLE_LABEL[role] || role
}

function roleTagType(role: BankCollaborator['role'] | string) {
  return ROLE_TAG[role] || 'default'
}

function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

function formatDate(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD') : '-'
}

async function fetchDetail() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getBankDetail(bankId)
    bank.value = res.data
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || err?.message || '加载题库详情失败'
  } finally {
    loading.value = false
  }
}

async function fetchCollaborators() {
  try {
    const res = await getCollaborators(bankId)
    collaborators.value = res.data || []
  } catch {
    // ignore：无权限等情况静默
  }
}

function openCollaboratorManager() {
  showCollaboratorManager.value = true
  fetchCollaborators()
}

async function handleExportBank() {
  if (!bank.value?.questionCount) {
    message.warning('题库暂无题目，无需导出')
    return
  }
  exporting.value = true
  try {
    const blob = await exportBank(bankId)
    triggerBlobDownload(blob, `${bank.value?.name || '题库'}_${nowStamp()}.json`)
    message.success('导出成功')
  } catch (err: any) {
    message.error(err?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

async function handleExportMarkdown() {
  if (!bank.value?.questionCount) {
    message.warning('题库暂无题目，无需导出')
    return
  }
  exportingMarkdown.value = true
  try {
    const params: MarkdownExportParams = {
      withAnswer: markdownExportForm.withAnswer,
      typeFilter: markdownExportForm.typeFilter?.length ? markdownExportForm.typeFilter : undefined
    }
    const blob = await exportBankMarkdown(bankId, params)
    triggerBlobDownload(blob, `${bank.value?.name || '题库'}_${nowStamp()}.md`)
    message.success('导出成功')
    showMarkdownExportDialog.value = false
  } catch (err: any) {
    message.error(err?.message || '导出失败')
  } finally {
    exportingMarkdown.value = false
  }
}

async function handleTransfer() {
  if (!transferUserId.value) {
    message.warning('请输入目标用户ID')
    return
  }
  transferLoading.value = true
  try {
    await transferBank(bankId, transferUserId.value)
    message.success('转让成功')
    showTransfer.value = false
  } catch {
    message.error('转让失败')
  } finally {
    transferLoading.value = false
  }
}

async function handleAddCollaborator() {
  if (!newCollaboratorUserId.value) {
    message.warning('请输入用户ID')
    return
  }
  addColLoading.value = true
  try {
    // 当前 addCollaborator API 仅接收 userId，角色选择不再随请求提交
    await addCollaborator(bankId, newCollaboratorUserId.value)
    message.success('添加成功')
    newCollaboratorUserId.value = ''
    fetchCollaborators()
  } catch {
    message.error('添加失败')
  } finally {
    addColLoading.value = false
  }
}

async function handleRemoveCollaborator(userId: string) {
  try {
    await removeCollaborator(bankId, userId)
    message.success('移除成功')
    fetchCollaborators()
  } catch {
    message.error('移除失败')
  }
}

function handleEdit() {
  if (bank.value) {
    editForm.name = bank.value.name
    editForm.description = bank.value.description || ''
  }
  showEditDialog.value = true
}

async function handleSaveEdit() {
  try {
    await editFormRef.value?.validate()
  } catch {
    return
  }
  editLoading.value = true
  try {
    await updateBank(bankId, {
      name: editForm.name,
      description: editForm.description || undefined
    })
    message.success('保存成功')
    showEditDialog.value = false
    fetchDetail()
  } catch {
    message.error('保存失败')
  } finally {
    editLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
  // 协作人接口仅创建者/管理员可访问，其他用户不发请求（避免 403 噪音）
  if (canManageCollaborators.value) {
    fetchCollaborators()
  }
})
</script>
