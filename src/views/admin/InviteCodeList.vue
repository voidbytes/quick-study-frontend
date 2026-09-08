<template>
  <div>
    <!-- 页头 -->
    <PageHeader title="邀请码管理" subtitle="生成并管理注册邀请码，控制谁可以注册本站账号">
      <template #actions>
        <n-button type="primary" @click="openGenerate">
          <template #icon>
            <n-icon :component="AddOutline" />
          </template>
          生成邀请码
        </n-button>
      </template>
    </PageHeader>

    <!-- 统计卡 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <StatCard v-for="s in summaryCards" :key="s.label" :label="s.label" :value="s.value" />
    </div>

    <!-- 筛选 -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索码 / 备注"
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
      <n-button quaternary @click="handleReset">重置</n-button>
    </div>

    <!-- 邀请码表格 -->
    <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <n-data-table
        remote
        :columns="columns"
        :data="codeList"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :row-key="(row: InviteCodeItem) => row.id"
        @update:page="handlePageChange"
      />
    </div>

    <!-- 生成弹窗 -->
    <n-modal v-model:show="showGenerate" title="生成邀请码" preset="card" style="width: 560px">
      <!-- 表单形态 -->
      <n-form v-if="!generateResult.length" label-placement="top">
        <div class="grid grid-cols-2 gap-x-4">
          <n-form-item label="生成数量" path="count">
            <n-input-number v-model:value="generateForm.count" :min="1" :max="50" class="w-full" />
          </n-form-item>
          <n-form-item label="最大使用次数" path="maxUses">
            <n-input-number v-model:value="generateForm.maxUses" :min="1" :max="9999" class="w-full" />
          </n-form-item>
          <n-form-item label="有效期" path="validPreset">
            <n-select
              v-model:value="generateForm.validPreset"
              :options="validPresetOptions"
              @update:value="generateForm.customExpireAt = null"
            />
          </n-form-item>
          <n-form-item label="注册后角色" path="grantRole">
            <n-radio-group v-model:value="generateForm.grantRole">
              <n-radio value="USER">普通用户</n-radio>
              <n-tooltip :disabled="isSuperAdmin">
                <template #trigger>
                  <n-radio value="ADMIN" :disabled="!isSuperAdmin">管理员</n-radio>
                </template>
                仅超级管理员可选
              </n-tooltip>
            </n-radio-group>
          </n-form-item>
        </div>
        <n-form-item v-if="generateForm.validPreset === 'custom'" label="过期时间">
          <n-date-picker
            v-model:value="generateForm.customExpireAt"
            type="datetime"
            class="w-full"
            :is-date-disabled="(ts: number) => ts <= Date.now()"
          />
        </n-form-item>
        <n-form-item :label="generateForm.grantRole === 'ADMIN' ? '备注（必填）' : '备注（可选）'" path="remark">
          <n-input
            v-model:value="generateForm.remark"
            type="textarea"
            :maxlength="200"
            show-count
            placeholder="用途说明，如：2026 秋季内测"
          />
        </n-form-item>
        <n-alert v-if="generateForm.grantRole === 'ADMIN'" type="warning" class="mb-3" :show-icon="true">
          管理员邀请码注册即为 ADMIN 角色，默认一次性，请妥善保管。
        </n-alert>
        <n-button type="primary" block :loading="generating" @click="handleGenerate">生成</n-button>
      </n-form>

      <!-- 结果形态 -->
      <div v-else>
        <n-alert type="success" class="mb-3">
          已生成 {{ generateResult.length }} 个邀请码，请妥善保存（码明文可在列表随时复制）
        </n-alert>
        <div class="border rounded divide-y mb-3">
          <div
            v-for="item in generateResult"
            :key="item.id"
            class="flex items-center justify-between px-3 py-2"
          >
            <span class="font-mono text-sm tracking-wide">{{ item.codeDisplay }}</span>
            <n-button text size="small" type="primary" @click="copyCode(item.code)">复制</n-button>
          </div>
        </div>
        <div class="flex gap-2">
          <n-button class="flex-1" @click="copyAllCodes">复制全部</n-button>
          <n-button class="flex-1" @click="downloadCodes">下载 .txt</n-button>
          <n-button type="primary" class="flex-1" @click="closeGenerate">关闭</n-button>
        </div>
      </div>
    </n-modal>

    <!-- 使用记录弹窗 -->
    <n-modal v-model:show="showUsages" title="使用记录" preset="card" style="width: 640px">
      <n-spin :show="usagesLoading">
        <n-empty v-if="!usages.length" description="该邀请码尚未被使用" class="py-8" />
        <div v-else class="divide-y">
          <div v-for="u in usages" :key="u.id" class="flex items-center gap-3 py-3">
            <div
              class="w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-semibold flex-shrink-0"
            >
              {{ (u.usedByNickname || u.usedByUsername || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-neutral-900 truncate">
                {{ u.usedByNickname || '-' }}
                <span class="text-neutral-500 font-normal">@{{ u.usedByUsername || '-' }}</span>
              </div>
              <div class="text-xs text-neutral-500">{{ u.usedAt || '-' }} · IP {{ u.registerIp || '-' }}</div>
            </div>
            <n-tag
              size="small"
              round
              :bordered="false"
              :type="u.userStatus === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ u.userStatus === 'ACTIVE' ? '正常' : '已禁用' }}
            </n-tag>
          </div>
        </div>
      </n-spin>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue'
import { useMessage, useDialog, NTag, NButton, NIcon } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import {
  fetchInviteCodes,
  generateInviteCodes,
  updateInviteCodeStatus,
  fetchInviteCodeUsages,
  deleteInviteCode,
  type InviteCodeItem
} from '@/api/inviteCode'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import { SearchOutline, AddOutline, CopyOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const message = useMessage()
const { confirmDanger } = useConfirm()
const authStore = useAuthStore()
const isSuperAdmin = authStore.userInfo?.role === 'SUPER_ADMIN'

const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref<string | null>(null)
const codeList = ref<InviteCodeItem[]>([])
const summary = reactive({ total: 0, available: 0, exhausted: 0, expired: 0, disabled: 0 })

const summaryCards = computed(() => [
  { label: '全部', value: summary.total },
  { label: '可用', value: summary.available },
  { label: '已用尽', value: summary.exhausted },
  { label: '已过期', value: summary.expired },
  { label: '已禁用', value: summary.disabled }
])

const statusOptions = [
  { label: '可用', value: 'AVAILABLE' },
  { label: '已用尽', value: 'EXHAUSTED' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '已禁用', value: 'DISABLED' }
]

const pagination = reactive({ page: 1, pageSize: 20, itemCount: 0 })

const STATUS_TAG: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  AVAILABLE: 'success',
  EXHAUSTED: 'info',
  EXPIRED: 'warning',
  DISABLED: 'default'
}

const columns: DataTableColumn<InviteCodeItem>[] = [
  {
    title: '邀请码',
    key: 'code',
    width: 220,
    render(row) {
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'font-mono text-sm tracking-wide' }, row.codeDisplay),
        h(
          NButton,
          {
            size: 'tiny',
            quaternary: true,
            onClick: () => copyCode(row.code)
          },
          { icon: () => h(NIcon, { component: CopyOutline }) }
        )
      ])
    }
  },
  {
    title: '使用次数',
    key: 'usedCount',
    width: 90,
    render(row) {
      return h('span', { class: 'text-sm' }, `${row.usedCount}/${row.maxUses}`)
    }
  },
  {
    title: '状态',
    key: 'displayStatus',
    width: 90,
    align: 'center',
    render(row) {
      return h(
        NTag,
        { size: 'small', round: true, bordered: false, type: STATUS_TAG[row.displayStatus] || 'default' },
        { default: () => row.statusLabel }
      )
    }
  },
  {
    title: '有效期',
    key: 'expireAt',
    width: 150,
    render(row) {
      return h('span', { class: 'text-sm' }, row.expireAt ? dayjs(row.expireAt).format('YYYY-MM-DD HH:mm') : '永久')
    }
  },
  {
    title: '授权角色',
    key: 'grantRole',
    width: 90,
    align: 'center',
    render(row) {
      const isAdmin = row.grantRole !== 'USER'
      return h(
        NTag,
        { size: 'small', round: true, bordered: false, type: isAdmin ? 'warning' : 'default' },
        { default: () => (isAdmin ? '管理员' : '用户') }
      )
    }
  },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true } },
  { title: '创建人', key: 'createdByNickname', width: 100, ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 150,
    render(row) {
      return row.createdAt ? dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      const ops: any[] = []
      // 管理员角色码仅超管可操作（后端 95203 兜底）
      const adminGrantLocked = row.grantRole !== 'USER' && !isSuperAdmin
      if (!adminGrantLocked) {
        ops.push(
          h(
            NButton,
            {
              size: 'tiny',
              quaternary: true,
              type: row.status === 'ACTIVE' ? 'warning' : 'success',
              onClick: () => handleToggleStatus(row)
            },
            { default: () => (row.status === 'ACTIVE' ? '禁用' : '启用') }
          )
        )
      }
      ops.push(
        h(
          NButton,
          { size: 'tiny', quaternary: true, type: 'info', onClick: () => handleShowUsages(row) },
          { default: () => '使用记录' }
        )
      )
      if (isSuperAdmin && row.usedCount === 0 && !adminGrantLocked) {
        ops.push(
          h(
            NButton,
            { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) },
            { default: () => '删除' }
          )
        )
      }
      return h('div', { class: 'flex items-center gap-1' }, ops)
    }
  }
]

async function loadList() {
  loading.value = true
  try {
    const res = await fetchInviteCodes({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      status: filterStatus.value || undefined
    })
    codeList.value = res.data.page.records
    pagination.itemCount = res.data.page.total
    Object.assign(summary, res.data.summary)
  } catch (e: any) {
    message.error(e?.response?.data?.message || '加载邀请码列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadList()
}

function handleReset() {
  searchKeyword.value = ''
  filterStatus.value = null
  handleSearch()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadList()
}

// ==================== 生成 ====================

const showGenerate = ref(false)
const generating = ref(false)
const generateResult = ref<InviteCodeItem[]>([])
const generateForm = reactive({
  count: 1,
  maxUses: 1,
  validPreset: '30',
  customExpireAt: null as number | null,
  grantRole: 'USER',
  remark: ''
})

const validPresetOptions = [
  { label: '7 天', value: '7' },
  { label: '30 天', value: '30' },
  { label: '90 天', value: '90' },
  { label: '永不过期', value: 'never' },
  { label: '自定义', value: 'custom' }
]

function openGenerate() {
  generateResult.value = []
  generateForm.count = 1
  generateForm.maxUses = 1
  generateForm.validPreset = '30'
  generateForm.customExpireAt = null
  generateForm.grantRole = 'USER'
  generateForm.remark = ''
  showGenerate.value = true
}

async function handleGenerate() {
  if (generateForm.grantRole === 'ADMIN' && !generateForm.remark.trim()) {
    message.error('生成管理员邀请码必须填写备注')
    return
  }
  if (generateForm.validPreset === 'custom' && !generateForm.customExpireAt) {
    message.error('请选择过期时间')
    return
  }
  generating.value = true
  try {
    const params: any = {
      count: generateForm.count,
      maxUses: generateForm.maxUses,
      grantRole: generateForm.grantRole,
      remark: generateForm.remark.trim() || undefined
    }
    if (generateForm.validPreset === 'never') {
      params.validDays = -1
    } else if (generateForm.validPreset === 'custom') {
      params.expireAt = dayjs(generateForm.customExpireAt!).format('YYYY-MM-DD HH:mm:ss')
    } else {
      params.validDays = Number(generateForm.validPreset)
    }
    const res = await generateInviteCodes(params)
    generateResult.value = res.data
    message.success(`已生成 ${res.data.length} 个邀请码`)
  } catch (e: any) {
    message.error(e?.response?.data?.message || '生成失败')
  } finally {
    generating.value = false
  }
}

function closeGenerate() {
  showGenerate.value = false
  handleSearch()
}

function copyCode(code: string) {
  navigator.clipboard
    .writeText(code)
    .then(() => message.success('已复制'))
    .catch(() => message.error('复制失败'))
}

function copyAllCodes() {
  const text = generateResult.value.map(i => i.code).join('\n')
  navigator.clipboard
    .writeText(text)
    .then(() => message.success('已复制全部'))
    .catch(() => message.error('复制失败'))
}

function downloadCodes() {
  const text = generateResult.value.map(i => i.codeDisplay).join('\n')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invite-codes-${dayjs().format('YYYYMMDD-HHmmss')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ==================== 启停 / 删除 / 使用记录 ====================

async function handleToggleStatus(row: InviteCodeItem) {
  const target = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  try {
    await updateInviteCodeStatus(row.id, target)
    message.success(target === 'DISABLED' ? '已禁用' : '已启用')
    loadList()
  } catch (e: any) {
    message.error(e?.response?.data?.message || '操作失败')
  }
}

async function handleDelete(row: InviteCodeItem) {
  confirmDanger({
    title: '确认删除',
    content: `确定删除邀请码 ${row.codeDisplay} 吗？已使用的邀请码不可删除。`,
    onPositiveClick: async () => {
      try {
        await deleteInviteCode(row.id)
        message.success('已删除')
        loadList()
      } catch (e: any) {
        message.error(e?.response?.data?.message || '删除失败')
      }
    }
  })
}

const showUsages = ref(false)
const usagesLoading = ref(false)
const usages = ref<any[]>([])

async function handleShowUsages(row: InviteCodeItem) {
  showUsages.value = true
  usagesLoading.value = true
  usages.value = []
  try {
    const res = await fetchInviteCodeUsages(row.id)
    usages.value = res.data
  } catch (e: any) {
    message.error(e?.response?.data?.message || '加载使用记录失败')
  } finally {
    usagesLoading.value = false
  }
}

onMounted(loadList)
</script>
