<template>
  <div>
    <!-- 配额用量 -->
    <div class="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm font-semibold">今日配额用量</div>
        <n-tag size="small" :bordered="false">{{ quota?.tier || '—' }}</n-tag>
      </div>
      <n-spin :show="quotaLoading">
        <template v-if="quota">
          <div class="flex items-center gap-3 mb-2">
            <n-progress
              type="line"
              :percentage="quotaPercentage"
              :status="quotaPercentage >= 100 ? 'error' : 'success'"
              style="flex: 1"
            />
            <span class="text-sm text-neutral-600 whitespace-nowrap">
              {{ Number(quota.dailyRemaining) < 0 ? '不限' : `${quota.dailyRemaining} / ${quota.dailyLimit} 次` }}
            </span>
          </div>
          <div class="text-xs text-neutral-400">
            单次执行 ≤ {{ Math.round(Number(quota.timeoutMs) / 1000) }}s · 内存 ≤ {{ quota.memoryMb }}MB ·
            输出 ≤ {{ quota.outputKb }}KB · 开放 API 频率
            {{ Number(quota.minuteLimit) > 0 ? `${quota.minuteLimit} 次/分钟` : '不限' }}
          </div>
        </template>
        <div v-else class="text-sm text-neutral-400">加载中…</div>
      </n-spin>
    </div>

    <!-- 凭证列表 -->
    <div class="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm font-semibold">
          API 凭证
          <span class="text-xs text-neutral-400 font-normal ml-2">
            {{ credentials?.activeCount ?? 0 }} / {{ credentials?.maxCount ?? 0 }}（多 key 共享同一配额账本）
          </span>
        </div>
        <n-button type="primary" size="small" @click="showCreate = true">生成凭证</n-button>
      </div>

      <n-data-table :columns="columns" :data="credentialItems" :loading="loading" :bordered="false" size="small" />
    </div>

    <!-- 接入说明 -->
    <div class="bg-white border border-neutral-200 rounded-xl p-5">
      <div class="text-sm font-semibold mb-3">快速接入</div>
      <div class="text-xs text-neutral-500 mb-2">Bearer 模式（个人脚本，依赖 HTTPS）：</div>
      <pre class="bg-neutral-50 rounded-lg p-3 text-xs overflow-x-auto mb-3">curl -X POST {{ apiBase }}/open/v1/sandbox/executions \
  -H "Authorization: Bearer qs-&lt;AK&gt;.&lt;SK&gt;" \
  -H "Content-Type: application/json" \
  -d '{"languageCode":"py3","code":"print(1+1)","wait":true}'</pre>
      <div class="text-xs text-neutral-500 mb-2">
        AK/SK 签名模式（服务端集成，防重放）：
        <code>X-QS-AK / X-QS-Timestamp / X-QS-Nonce / X-QS-Signature</code>
        （HMAC-SHA256：METHOD\npath\nquery\ntimestamp\nnonce）
      </div>
      <div class="text-xs text-neutral-400">
        异步执行返回 executionId，用
        <code>GET {{ apiBase }}/open/v1/sandbox/executions/&#123;executionId&#125;</code> 轮询（结果保留 24h）。
      </div>
    </div>

    <!-- 创建凭证 -->
    <n-modal v-model:show="showCreate" preset="dialog" title="生成 API 凭证" :show-icon="false">
      <div class="py-2">
        <div class="text-sm mb-2">凭证备注名（如 dev / 生产脚本）</div>
        <n-input v-model:value="newName" placeholder="dev" maxlength="64" />
      </div>
      <template #action>
        <n-button @click="showCreate = false">取消</n-button>
        <n-button type="primary" :loading="creating" @click="doCreate">生成</n-button>
      </template>
    </n-modal>

    <!-- SK 一次性展示 -->
    <n-modal v-model:show="showSecret" preset="dialog" title="请立即保存你的 Secret Key" :show-icon="false">
      <div class="py-2">
        <n-alert type="warning" class="mb-3">
          SK 明文仅此一次展示，关闭后无法再次查看（只能轮换）。请立即复制保存。
        </n-alert>
        <n-input :value="secretShown || ''" readonly type="textarea" :rows="2" />
      </div>
      <template #action>
        <n-button type="primary" @click="copySecret">复制并关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import dayjs from 'dayjs'
import { API_BASE_URL } from '@/utils/constants'
import {
  listCredentials,
  createCredential,
  rotateCredential,
  updateCredentialStatus,
  deleteCredential,
  getSandboxQuota,
  type ApiCredential,
  type ApiCredentialListResponse,
  type SandboxQuotaUsage
} from '@/api/openApi'

const message = useMessage()

const loading = ref(false)
const credentials = ref<ApiCredentialListResponse | null>(null)
const credentialItems = computed<ApiCredential[]>(() => credentials.value?.items ?? [])

const quota = ref<SandboxQuotaUsage | null>(null)
const quotaLoading = ref(false)

const showCreate = ref(false)
const newName = ref('')
const creating = ref(false)
const showSecret = ref(false)
const secretShown = ref('')
const apiBase = API_BASE_URL

const quotaPercentage = computed(() => {
  if (!quota.value) return 0
  // 后端 Long 契约为字符串，显式数值转换防弱类型隐患
  const remaining = Number(quota.value.dailyRemaining)
  const limit = Number(quota.value.dailyLimit)
  if (remaining < 0) return 0 // -1=不限
  if (limit <= 0) return 0
  const used = Number(quota.value.dailyUsed) / limit
  return Math.min(100, Math.round(used * 100))
})

function showError(err: any, fallback: string) {
  if (err?.response?.status === 403) return
  const msg = err?.response?.data?.message || err?.message
  message.error(msg || fallback)
}

async function loadAll() {
  loading.value = true
  quotaLoading.value = true
  try {
    const [credRes, quotaRes] = await Promise.all([
      listCredentials(),
      getSandboxQuota().catch(() => null)
    ])
    credentials.value = credRes.data
    quota.value = quotaRes?.data ?? null
  } catch (err) {
    showError(err, '加载凭证失败')
  } finally {
    loading.value = false
    quotaLoading.value = false
  }
}

async function doCreate() {
  creating.value = true
  try {
    const res = await createCredential(newName.value.trim() || 'default')
    showCreate.value = false
    newName.value = ''
    secretShown.value = res.data.plainSecret || ''
    showSecret.value = true
    await loadAll()
  } catch (err) {
    showError(err, '创建凭证失败')
  } finally {
    creating.value = false
  }
}

function copySecret() {
  if (secretShown.value) {
    navigator.clipboard?.writeText(secretShown.value).catch(() => {})
  }
  showSecret.value = false
  secretShown.value = ''
}

async function doRotate(row: ApiCredential) {
  try {
    const res = await rotateCredential(row.id)
    secretShown.value = res.data.plainSecret || ''
    showSecret.value = true
    await loadAll()
  } catch (err) {
    showError(err, '轮换失败')
  }
}

async function doToggle(row: ApiCredential) {
  try {
    await updateCredentialStatus(row.id, row.status !== 1)
    await loadAll()
  } catch (err) {
    showError(err, '操作失败')
  }
}

async function doDelete(row: ApiCredential) {
  try {
    await deleteCredential(row.id)
    message.success('已删除')
    await loadAll()
  } catch (err) {
    showError(err, '删除失败')
  }
}

const columns = computed<DataTableColumn[]>(() => [
  { title: '名称', key: 'name', width: 140, ellipsis: { tooltip: true } },
  {
    title: 'AK',
    key: 'accessKey',
    width: 220,
    render: (row: any) => h('span', { class: 'font-mono text-xs' }, row.accessKey)
  },
  {
    title: 'SK',
    key: 'maskedSecret',
    width: 140,
    render: (row: any) => h('span', { class: 'font-mono text-xs text-neutral-400' }, row.maskedSecret)
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(
        'span',
        row.status === 1 ? '启用' : '禁用'
      )
  },
  {
    title: '最近使用',
    key: 'lastUsedAt',
    width: 150,
    render: (row: any) => (row.lastUsedAt ? dayjs(row.lastUsedAt).format('YYYY-MM-DD HH:mm') : '—')
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    render: (row: any) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          'button',
          {
            class: 'text-xs text-neutral-600 hover:text-neutral-900',
            onClick: () => doToggle(row as ApiCredential)
          },
          row.status === 1 ? '禁用' : '启用'
        ),
        h(
          'button',
          {
            class: 'text-xs text-neutral-600 hover:text-neutral-900',
            onClick: () => doRotate(row as ApiCredential)
          },
          '轮换 SK'
        ),
        h(
          'button',
          {
            class: 'text-xs text-red-500 hover:text-red-600',
            onClick: () => doDelete(row as ApiCredential)
          },
          '删除'
        )
      ])
  }
])

onMounted(loadAll)
</script>
