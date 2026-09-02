<template>
  <div class="p-6 max-w-6xl mx-auto">
    <n-button quaternary @click="router.back()" class="mb-4">
      ← 返回
    </n-button>

    <n-spin v-if="!loadError" :show="loading">
      <!-- 题库基本信息 -->
      <n-card class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xl font-bold">{{ bank?.name }}</span>
              <n-tag v-if="bank?.isOfficial" type="warning" size="small" class="ml-2">官方</n-tag>
              <n-tag v-else :type="bank?.isPublic ? 'success' : 'default'" size="small" class="ml-2">
                {{ bank?.isPublic ? '公开' : '私有' }}
              </n-tag>
            </div>
            <div class="flex gap-2">
              <n-button v-if="authStore.isAdmin" size="small" @click="handleEdit">编辑</n-button>
              <n-button v-if="authStore.isAdmin" size="small" @click="showTransfer = true">转让</n-button>
            </div>
          </div>
        </template>
        <p class="text-gray-500">{{ bank?.description || '暂无描述' }}</p>
        <div class="flex gap-6 mt-4 text-sm text-gray-500">
          <span>题目数：{{ bank?.questionCount || 0 }}</span>
          <span>练习次数：{{ bank?.practiceCount || 0 }}</span>
          <span>创建者：{{ bank?.creatorName }}</span>
        </div>
      </n-card>

      <!-- 协作人管理 -->
      <n-card title="协作人" class="mb-6">
        <template #header-extra>
          <n-button v-if="authStore.isAdmin" size="small" @click="showAddCollaborator = true">添加协作人</n-button>
        </template>
        <n-empty v-if="collaborators.length === 0" description="暂无协作人" />
        <n-list v-else>
          <n-list-item v-for="col in collaborators" :key="col.userId">
            <span>{{ col.nickname }}</span>
            <n-tag size="small" class="ml-2">{{ col.role }}</n-tag>
            <template #suffix>
              <n-button v-if="authStore.isAdmin" size="tiny" quaternary type="error" @click="handleRemoveCollaborator(col.userId)">
                移除
              </n-button>
            </template>
          </n-list-item>
        </n-list>
      </n-card>

      <!-- 题目列表 -->
      <n-card title="题目列表">
        <QuestionList :bank-id="bankId" />
      </n-card>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />

    <!-- 转让题库弹窗 -->
    <n-modal v-model:show="showTransfer" title="转让题库" preset="card" style="width: 400px">
      <n-form>
        <n-form-item label="目标用户ID">
          <n-input v-model:value="transferUserId" placeholder="输入用户ID" />
        </n-form-item>
        <n-button type="primary" block :loading="transferLoading" @click="handleTransfer">
          确认转让
        </n-button>
      </n-form>
    </n-modal>

    <!-- 添加协作人弹窗 -->
    <n-modal v-model:show="showAddCollaborator" title="添加协作人" preset="card" style="width: 400px">
      <n-form>
        <n-form-item label="用户ID">
          <n-input v-model:value="newCollaboratorUserId" placeholder="输入用户ID" />
        </n-form-item>
        <n-form-item label="角色">
          <n-select v-model:value="newCollaboratorRole" :options="collaboratorRoleOptions" />
        </n-form-item>
        <n-button type="primary" block :loading="addColLoading" @click="handleAddCollaborator">
          添加
        </n-button>
      </n-form>
    </n-modal>

    <!-- 编辑题库弹窗 -->
    <n-modal v-model:show="showEditDialog" title="编辑题库" preset="card" style="width: 480px">
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
            :rows="3"
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, type FormRules, type FormInst } from 'naive-ui'
import { getBankDetail, getCollaborators, addCollaborator, removeCollaborator, transferBank, updateBank } from '@/api/bank'
import { useAuthStore } from '@/stores/auth'
import QuestionList from '@/views/question/QuestionList.vue'
import LoadError from '@/components/LoadError.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const bankId = route.params.id as string
const loading = ref(false)
const loadError = ref('')
const bank = ref<any>(null)
const collaborators = ref<any[]>([])

const showTransfer = ref(false)
const transferUserId = ref('')
const transferLoading = ref(false)

const showAddCollaborator = ref(false)
const newCollaboratorUserId = ref('')
const newCollaboratorRole = ref('EDITOR')
const addColLoading = ref(false)
const collaboratorRoleOptions = [
  { label: '编辑者', value: 'EDITOR' },
  { label: '查看者', value: 'VIEWER' }
]

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
    // ignore
  }
}

async function handleTransfer() {
  if (!transferUserId.value) {
    message.warning('请输入目标用户ID')
    return
  }
  transferLoading.value = true
  try {
    await transferBank(bankId, Number(transferUserId.value))
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
    await addCollaborator(bankId, {
      userId: Number(newCollaboratorUserId.value),
      role: newCollaboratorRole.value
    })
    message.success('添加成功')
    showAddCollaborator.value = false
    fetchCollaborators()
  } catch {
    message.error('添加失败')
  } finally {
    addColLoading.value = false
  }
}

async function handleRemoveCollaborator(userId: number) {
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
  fetchCollaborators()
})
</script>