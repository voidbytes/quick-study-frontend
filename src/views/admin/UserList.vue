<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">用户管理</h1>
      <n-button v-if="isSuperAdmin" type="primary" @click="showCreateAdmin = true">
        新建管理员
      </n-button>
    </div>

    <div class="flex gap-4 mb-4 flex-wrap">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索用户名/昵称"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      />
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="状态"
        style="width: 120px"
        clearable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterRole"
        :options="roleOptions"
        placeholder="角色"
        style="width: 120px"
        clearable
        @update:value="handleSearch"
      />
    </div>

    <n-data-table
      :columns="columns"
      :data="userList"
      :loading="loading"
      :pagination="pagination"
      :bordered="true"
      @update:page="handlePageChange"
    />

    <!-- 新建管理员弹窗 -->
    <n-modal v-model:show="showCreateAdmin" title="新建管理员" preset="card" style="width: 450px">
      <n-form>
        <n-form-item label="搜索用户">
          <n-input v-model:value="searchUserKeyword" placeholder="输入用户名搜索" @keyup.enter="handleSearchUser" />
          <n-button size="small" class="ml-2" @click="handleSearchUser">搜索</n-button>
        </n-form-item>
        <n-form-item v-if="searchUserResults.length > 0" label="选择用户">
          <n-select v-model:value="selectedUserId" :options="searchUserResults" placeholder="选择用户" filterable />
        </n-form-item>
        <n-form-item label="或直接输入用户ID">
          <n-input v-model:value="newAdminUserId" placeholder="输入用户ID" />
        </n-form-item>
        <n-button type="primary" block :loading="creatingAdmin" @click="handleCreateAdmin">
          确认
        </n-button>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getUserList, updateUserStatus, deleteUser, resetPassword, createAdmin, removeAdmin, listUsers } from '@/api/admin'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const isSuperAdmin = authStore.userInfo?.role === 'SUPER_ADMIN'

const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref<string | null>(null)
const filterRole = ref<string | null>(null)
const userList = ref<any[]>([])
const showCreateAdmin = ref(false)
const newAdminUserId = ref('')
const creatingAdmin = ref(false)
const searchUserKeyword = ref('')
const searchUserResults = ref<{ label: string; value: number }[]>([])
const selectedUserId = ref<number | null>(null)

const statusOptions = [
  { label: '正常', value: 'ACTIVE' },
  { label: '禁用', value: 'DISABLED' }
]

const roleOptions = [
  { label: '用户', value: 'USER' },
  { label: '管理员', value: 'ADMIN' },
  { label: '超级管理员', value: 'SUPER_ADMIN' }
]

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const roleLabels: Record<string, string> = { USER: '用户', ADMIN: '管理员', SUPER_ADMIN: '超级管理员' }
const statusLabels: Record<string, string> = { ACTIVE: '正常', DISABLED: '禁用' }

const columns: DataTableColumn<any>[] = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  { title: '邮箱', key: 'email', width: 150, ellipsis: { tooltip: true } },
  {
    title: '角色',
    key: 'role',
    width: 100,
    render(row) {
      const type = row.role === 'SUPER_ADMIN' ? 'warning' : row.role === 'ADMIN' ? 'info' : 'default'
      return h('n-tag', { size: 'small', type: type as any }, () => roleLabels[row.role] || row.role)
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 70,
    align: 'center',
    render(row) {
      return h('span', { class: row.status === 'ACTIVE' ? 'text-success' : 'text-error' }, statusLabels[row.status] || row.status)
    }
  },
  {
    title: '注册时间',
    key: 'createdAt',
    width: 160,
    render(row) { return dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      const actions = []
      actions.push(h('a', {
        class: 'text-primary cursor-pointer',
        onClick: () => handleResetPassword(row)
      }, '重置密码'))
      actions.push(h('a', {
        class: row.status === 'ACTIVE' ? 'text-warning cursor-pointer ml-2' : 'text-success cursor-pointer ml-2',
        onClick: () => handleToggleStatus(row)
      }, row.status === 'ACTIVE' ? '禁用' : '启用'))
      if (isSuperAdmin && row.role === 'ADMIN') {
        actions.push(h('a', {
          class: 'text-error cursor-pointer ml-2',
          onClick: () => handleRemoveAdmin(row)
        }, '移除管理员'))
      }
      if (isSuperAdmin) {
        actions.push(h('a', {
          class: 'text-error cursor-pointer ml-2',
          onClick: () => handleDeleteUser(row)
        }, '删除'))
      }
      return h('div', {}, actions)
    }
  }
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      status: filterStatus.value || undefined,
      role: filterRole.value || undefined
    })
    userList.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch {
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchList()
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  try {
    await updateUserStatus(row.id, newStatus)
    message.success('操作成功')
    fetchList()
  } catch {
    message.error('操作失败')
  }
}

async function handleResetPassword(row: any) {
  try {
    const res = await resetPassword(row.id)
    dialog.info({
      title: '密码已重置',
      content: `新密码：${res.data.newPassword}`,
      positiveText: '已复制'
    })
  } catch {
    message.error('重置密码失败')
  }
}

function handleDeleteUser(row: any) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除用户「${row.username}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteUser(row.id)
        message.success('删除成功')
        fetchList()
      } catch (err: any) {
        const code = err?.response?.data?.code
        if (code === 20501) message.error('该用户持有公开题库或试卷，无法删除')
        else message.error('删除失败')
      }
    }
  })
}

async function handleCreateAdmin() {
  const targetId = selectedUserId.value || Number(newAdminUserId.value)
  if (!targetId) {
    message.warning('请选择用户或输入用户ID')
    return
  }
  creatingAdmin.value = true
  try {
    await createAdmin(targetId)
    message.success('创建成功')
    showCreateAdmin.value = false
    newAdminUserId.value = ''
    searchUserKeyword.value = ''
    searchUserResults.value = []
    selectedUserId.value = null
    fetchList()
  } catch {
    message.error('创建失败')
  } finally {
    creatingAdmin.value = false
  }
}

async function handleSearchUser() {
  if (!searchUserKeyword.value.trim()) return
  try {
    const res = await listUsers({ keyword: searchUserKeyword.value, page: 1, size: 20 })
    searchUserResults.value = (res.data.records || []).map((u: any) => ({
      label: `${u.username} (${u.nickname}) - ID: ${u.id}`,
      value: u.id
    }))
    if (searchUserResults.value.length === 0) {
      message.info('未找到匹配的用户')
    }
  } catch {
    message.error('搜索用户失败')
  }
}

async function handleRemoveAdmin(row: any) {
  try {
    await removeAdmin(row.id)
    message.success('已移除管理员')
    fetchList()
  } catch {
    message.error('移除失败')
  }
}

onMounted(() => { fetchList() })
</script>