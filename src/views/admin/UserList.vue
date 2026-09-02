<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="用户管理" subtitle="管理用户账号、角色与状态">
      <template #actions>
        <n-button v-if="isSuperAdmin" type="primary" @click="showCreateAdmin = true">
          <template #icon>
            <n-icon :component="PersonAddOutline" />
          </template>
          新建管理员
        </n-button>
      </template>
    </PageHeader>

    <!-- 筛选 -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索用户名/昵称"
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="状态"
        style="width: 140px"
        clearable
        @update:value="handleSearch"
      />
      <n-select
        v-model:value="filterRole"
        :options="roleOptions"
        placeholder="角色"
        style="width: 160px"
        clearable
        @update:value="handleSearch"
      />
    </div>

    <!-- 用户表格 -->
    <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <n-data-table
        remote
        :columns="columns"
        :data="userList"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        @update:page="handlePageChange"
      />
    </div>

    <!-- 新建管理员弹窗 -->
    <n-modal v-model:show="showCreateAdmin" title="新建管理员" preset="card" style="width: 480px">
      <n-form>
        <n-form-item label="搜索用户">
          <div class="flex gap-2 w-full">
            <n-input v-model:value="searchUserKeyword" placeholder="输入用户名搜索" @keyup.enter="handleSearchUser" />
            <n-button @click="handleSearchUser">搜索</n-button>
          </div>
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
import { useMessage, useDialog, NTag } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { getUserList, updateUserStatus, deleteUser, resetPassword, createAdmin, removeAdmin, listUsers } from '@/api/admin'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import { SearchOutline, PersonAddOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const { confirmDanger } = useConfirm()
const authStore = useAuthStore()

const isSuperAdmin = authStore.userInfo?.role === 'SUPER_ADMIN'
const currentUserId = authStore.userInfo?.id
const currentRole = authStore.userInfo?.role

/** 与后端规则一致：不能操作自己；普通管理员只能操作 USER；超管不能操作同级超管 */
function canOperate(row: any): boolean {
  if (String(row.id) === String(currentUserId)) return false
  if (currentRole === 'ADMIN' && row.role !== 'USER') return false
  if (currentRole === 'SUPER_ADMIN' && row.role === 'SUPER_ADMIN') return false
  return true
}

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
  itemCount: 0
})

const roleLabels: Record<string, string> = { USER: '用户', ADMIN: '管理员', SUPER_ADMIN: '超级管理员' }
const statusLabels: Record<string, string> = { ACTIVE: '正常', DISABLED: '禁用' }

type TagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const ROLE_TAG: Record<string, TagType> = { USER: 'primary', ADMIN: 'error', SUPER_ADMIN: 'warning' }
const STATUS_TAG: Record<string, TagType> = { ACTIVE: 'success', DISABLED: 'default' }

function renderRole(row: any) {
  return h(
    NTag,
    { size: 'small', round: true, bordered: false, type: ROLE_TAG[row.role] || 'default' },
    { default: () => roleLabels[row.role] || row.role }
  )
}

function renderStatus(row: any) {
  return h(
    NTag,
    { size: 'small', round: true, bordered: false, type: STATUS_TAG[row.status] || 'default' },
    { default: () => statusLabels[row.status] || row.status }
  )
}

const columns: DataTableColumn<any>[] = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '用户',
    key: 'username',
    width: 180,
    render(row) {
      const ch = (row.nickname || row.username || '?').charAt(0).toUpperCase()
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-semibold flex-shrink-0' }, ch),
        h('div', { class: 'flex flex-col min-w-0' }, [
          h('span', { class: 'text-sm font-semibold text-neutral-900 truncate' }, row.username),
          h('span', { class: 'text-xs text-neutral-500 truncate' }, `@${row.username}`)
        ])
      ])
    }
  },
  { title: '昵称', key: 'nickname', width: 120, ellipsis: { tooltip: true } },
  { title: '邮箱', key: 'email', ellipsis: { tooltip: true } },
  { title: '角色', key: 'role', width: 110, render: renderRole },
  { title: '状态', key: 'status', width: 90, align: 'center', render: renderStatus },
  {
    title: '注册时间',
    key: 'createdAt',
    width: 160,
    render(row) { return dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }
  },
  {
    title: '操作',
    key: 'actions',
    width: 250,
    render(row) {
      if (!canOperate(row)) return h('span', { class: 'text-neutral-300' }, '—')
      const actions = []
      actions.push(h('a', {
        class: 'text-primary-500 cursor-pointer',
        onClick: () => handleResetPassword(row)
      }, '重置密码'))
      actions.push(h('a', {
        class: row.status === 'ACTIVE' ? 'text-warning-600 cursor-pointer ml-3' : 'text-success-600 cursor-pointer ml-3',
        onClick: () => handleToggleStatus(row)
      }, row.status === 'ACTIVE' ? '禁用' : '启用'))
      if (isSuperAdmin && row.role === 'ADMIN') {
        actions.push(h('a', {
          class: 'text-error-600 cursor-pointer ml-3',
          onClick: () => handleRemoveAdmin(row)
        }, '移除管理员'))
      }
      if (isSuperAdmin) {
        actions.push(h('a', {
          class: 'text-error-600 cursor-pointer ml-3',
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
    pagination.itemCount = res.data.total || 0
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
  confirmDanger({
    title: '确认删除',
    content: `确定要删除用户「${row.username}」吗？`,
    positiveText: '确定删除',
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
