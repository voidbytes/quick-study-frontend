<template>
  <div>
    <PageHeader title="系统配置" subtitle="AI 批改 / 编程语言 / 运行时开关 / 启动期配置" />

    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- Tab 1: AI 批改 -->
      <n-tab-pane name="ai" tab="AI 批改">
        <n-spin :show="aiLoading">
          <div class="space-y-4 max-w-3xl pb-4">
            <div class="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
              <div class="flex items-center gap-3">
                <n-switch v-model:value="aiForm.enabled" />
                <span class="text-sm font-semibold">启用 AI 批改</span>
              </div>
              <n-grid :cols="2" :x-gap="12">
                <n-gi>
                  <n-form-item label="协议类型" required>
                    <n-input v-model:value="aiForm.protocolType" placeholder="OPENAI" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="模型 ID" required>
                    <n-input v-model:value="aiForm.modelId" />
                  </n-form-item>
                </n-gi>
                <n-gi :span="2">
                  <n-form-item label="API 地址" required>
                    <n-input v-model:value="aiForm.baseUrl" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="温度">
                    <n-input-number v-model:value="aiForm.temperature" :min="0" :max="2" :step="0.05" class="w-full" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="最大 Tokens">
                    <n-input-number v-model:value="aiForm.maxTokens" :min="1" class="w-full" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="超时（秒）">
                    <n-input-number v-model:value="aiForm.timeoutSeconds" :min="1" class="w-full" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="重试次数">
                    <n-input-number v-model:value="aiForm.retryCount" :min="0" class="w-full" />
                  </n-form-item>
                </n-gi>
              </n-grid>
              <n-form-item label="批改提示词模板">
                <n-input v-model:value="aiForm.gradingPrompt" type="textarea" :rows="10" />
              </n-form-item>
            </div>

            <div class="bg-white border border-neutral-200 rounded-lg p-5">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold">API Keys（脱敏展示）</span>
                <n-button size="small" @click="addKeyRow">新增 Key</n-button>
              </div>
              <p class="text-xs text-neutral-400 mb-3">
                未填写新明文的已有 Key 保存后保留原值；只有填写新明文才会覆盖。删除行 = 保存后从服务端删除。
              </p>
              <div
                v-for="(row, idx) in aiKeyRows"
                :key="row.id ?? `new-${idx}`"
                class="flex flex-wrap items-center gap-3 py-2.5 border-b border-neutral-100 last:border-b-0"
              >
                <span class="font-mono text-xs text-neutral-600 w-40 truncate" :title="row.maskedApiKey || ''">
                  {{ row.id ? row.maskedApiKey : '新 Key' }}
                </span>
                <n-input
                  v-if="row.plainEditing"
                  v-model:value="row.plainInput"
                  type="password"
                  show-password-on="click"
                  placeholder="输入新明文 Key"
                  style="width: 280px"
                />
                <n-button v-if="row.id && !row.plainEditing" size="tiny" @click="row.plainEditing = true">重置</n-button>
                <div class="flex items-center gap-2 ml-auto">
                  <span class="text-xs text-neutral-500">启用</span>
                  <n-switch v-model:value="row.enabled" size="small" />
                  <a class="text-error-600 cursor-pointer text-sm ml-2" @click="aiKeyRows.splice(idx, 1)">删除</a>
                </div>
              </div>
              <p v-if="aiKeyRows.length === 0" class="text-xs text-neutral-400 py-2">暂无 Key，点击「新增 Key」添加</p>
            </div>

            <n-button type="primary" :loading="aiSaving" @click="handleSaveAi">保存 AI 配置</n-button>
          </div>
        </n-spin>
      </n-tab-pane>

      <!-- Tab 2: 编程语言 -->
      <n-tab-pane name="languages" tab="编程语言">
        <div class="mb-3 flex justify-end">
          <n-button type="primary" size="small" @click="openLanguageModal()">新增语言</n-button>
        </div>
        <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <n-data-table
            :columns="languageColumns"
            :data="languages"
            :loading="languagesLoading"
            :bordered="false"
          />
        </div>
      </n-tab-pane>

      <!-- Tab 3: 运行时开关 -->
      <n-tab-pane name="runtime" tab="运行时开关">
        <n-spin :show="configLoading">
          <div class="space-y-4 pb-4">
            <div
              v-for="group in configGroups"
              :key="group.name"
              class="bg-white border border-neutral-200 rounded-lg p-5"
            >
              <div class="text-sm font-semibold mb-2">{{ groupLabel(group.name) }}</div>
              <div
                v-for="item in group.items"
                :key="item.configKey"
                class="flex flex-wrap items-center gap-3 py-2.5 border-b border-neutral-100 last:border-b-0"
              >
                <div class="min-w-0 flex-1">
                  <div class="text-sm">{{ item.description || item.configKey }}</div>
                  <div class="text-xs text-neutral-400 font-mono">{{ item.configKey }}</div>
                </div>
                <template v-if="item.editable">
                  <n-switch
                    v-if="item.valueType === 'BOOLEAN'"
                    :value="draftOf(item) === 'true'"
                    :loading="savingKey === item.configKey"
                    @update:value="(v: boolean) => saveSingle(item, v ? 'true' : 'false')"
                  />
                  <template v-else-if="item.valueType === 'INT'">
                    <n-input-number
                      :value="draftInt(item)"
                      size="small"
                      style="width: 140px"
                      @update:value="(v: number | null) => setDraft(item, v === null ? '' : String(v))"
                    />
                    <n-button size="tiny" type="primary" :loading="savingKey === item.configKey" @click="saveDraft(item)">
                      保存
                    </n-button>
                  </template>
                  <template v-else>
                    <n-input
                      :value="draftOf(item)"
                      size="small"
                      style="width: 200px"
                      @update:value="(v: string) => setDraft(item, v)"
                    />
                    <n-button size="tiny" type="primary" :loading="savingKey === item.configKey" @click="saveDraft(item)">
                      保存
                    </n-button>
                  </template>
                </template>
                <template v-else>
                  <span class="text-sm text-neutral-600 font-mono">{{ item.configValue }}</span>
                  <n-tag size="small" :bordered="false">只读</n-tag>
                </template>
              </div>
            </div>
            <p v-if="!configLoading && configItems.length === 0" class="text-sm text-neutral-400">暂无配置项</p>
          </div>
        </n-spin>
      </n-tab-pane>

      <!-- Tab 4: 启动期配置（只读） -->
      <n-tab-pane name="env" tab="启动期配置（只读）">
        <n-alert type="info" class="mb-3">
          以下为启动期配置（Bean 装配/连接类），修改需改配置文件并重启服务；敏感项不显示任何值。
        </n-alert>
        <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <n-data-table :columns="envColumns" :data="envItems" :loading="envLoading" :bordered="false" />
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 语言编辑弹窗 -->
    <n-modal
      v-model:show="languageModal"
      :title="languageForm.id ? '编辑语言' : '新增语言'"
      preset="card"
      style="width: 560px"
    >
      <n-form label-placement="top">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="语言代码（唯一，创建后不可改）" required>
              <n-input v-model:value="languageForm.code" :disabled="!!languageForm.id" placeholder="python3" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="展示名" required>
              <n-input v-model:value="languageForm.name" placeholder="Python 3" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="文件扩展名" required>
              <n-input v-model:value="languageForm.fileExtension" placeholder=".py" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="时间系数（0.1~10）">
              <n-input-number v-model:value="languageForm.timeMultiplier" :min="0.1" :max="10" :step="0.1" class="w-full" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="编译命令（{file} 占位文件名；解释型语言可留空）">
              <n-input v-model:value="languageForm.compileCommand" placeholder="g++ -std=c++17 -O2 -o main {file}" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="运行命令" required>
              <n-input v-model:value="languageForm.runCommand" placeholder="./main" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="高亮语言名">
              <n-input v-model:value="languageForm.highlightName" placeholder="python" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="固定文件名 Main.java">
              <n-switch v-model:value="languageForm.classnameRequired" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="启用">
              <n-switch v-model:value="languageForm.isEnabled" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="languageModal = false">取消</n-button>
          <n-button type="primary" :loading="languageSaving" @click="handleSaveLanguage">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue'
import { useMessage, NTag } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { useConfirm } from '@/composables/useConfirm'
import dayjs from 'dayjs'
import {
  getSystemConfig,
  updateSystemConfig,
  getSystemConfigEnv,
  type SystemConfigItem,
  type EnvConfigItem
} from '@/api/systemConfig'
import { getAiConfig, saveAiConfig, type AiConfigKeySubmit } from '@/api/aiConfig'
import {
  listAdminLanguages,
  createAdminLanguage,
  updateAdminLanguage,
  deleteAdminLanguage,
  type AdminLanguage
} from '@/api/programmingLanguage'

const message = useMessage()
const { confirm } = useConfirm()

const activeTab = ref('ai')

/** 统一错误提示：403/5xx 由 request.ts 全局处理，这里只补业务消息 */
function showError(err: any, fallback: string) {
  if (err?.response?.status === 403) return
  if (err?.response?.status >= 500) return
  const msg = err?.response?.data?.message || err?.message
  message.error(msg || fallback)
}

// ==================== Tab 1: AI 批改 ====================

interface AiKeyRow {
  id?: string
  maskedApiKey?: string
  enabled: boolean
  plainEditing: boolean
  plainInput: string
}

const aiLoading = ref(false)
const aiSaving = ref(false)
const aiForm = reactive({
  enabled: false,
  protocolType: 'OPENAI',
  baseUrl: '',
  modelId: '',
  temperature: null as number | null,
  maxTokens: null as number | null,
  timeoutSeconds: null as number | null,
  retryCount: null as number | null,
  gradingPrompt: ''
})
const aiKeyRows = ref<AiKeyRow[]>([])

async function loadAi() {
  aiLoading.value = true
  try {
    const res = await getAiConfig()
    const data = res.data
    aiForm.enabled = !!data.enabled
    aiForm.protocolType = data.protocolType || 'OPENAI'
    aiForm.baseUrl = data.baseUrl || ''
    aiForm.modelId = data.modelId || ''
    aiForm.temperature = data.temperature
    aiForm.maxTokens = data.maxTokens
    aiForm.timeoutSeconds = data.timeoutSeconds
    aiForm.retryCount = data.retryCount
    aiForm.gradingPrompt = data.gradingPrompt || ''
    aiKeyRows.value = (data.keys || []).map(k => ({
      id: k.id,
      maskedApiKey: k.maskedApiKey,
      enabled: !!k.enabled,
      plainEditing: false,
      plainInput: ''
    }))
  } catch (err) {
    showError(err, '加载 AI 配置失败')
  } finally {
    aiLoading.value = false
  }
}

function addKeyRow() {
  aiKeyRows.value.push({ enabled: true, plainEditing: true, plainInput: '' })
}

function handleSaveAi() {
  if (!aiForm.protocolType.trim() || !aiForm.baseUrl.trim() || !aiForm.modelId.trim() || !aiForm.gradingPrompt.trim()) {
    message.warning('协议类型 / API 地址 / 模型 ID / 提示词模板为必填项')
    return
  }
  confirm({
    title: '保存 AI 配置',
    content: '保存后立即生效（无需重启）。确认保存吗？',
    positiveText: '保存',
    onPositiveClick: async () => {
      const keys: AiConfigKeySubmit[] = []
      let skippedNew = 0
      for (const row of aiKeyRows.value) {
        const plain = row.plainInput.trim()
        if (row.id) {
          const item: AiConfigKeySubmit = { id: row.id, enabled: row.enabled }
          if (row.plainEditing && plain) item.apiKey = plain
          keys.push(item)
        } else {
          if (!plain) {
            skippedNew++
            continue
          }
          keys.push({ apiKey: plain, enabled: row.enabled })
        }
      }
      if (skippedNew > 0) {
        message.warning(`${skippedNew} 个未填写明文的新 Key 已忽略`)
      }
      aiSaving.value = true
      try {
        await saveAiConfig({
          enabled: aiForm.enabled,
          protocolType: aiForm.protocolType.trim(),
          baseUrl: aiForm.baseUrl.trim(),
          modelId: aiForm.modelId.trim(),
          temperature: aiForm.temperature,
          maxTokens: aiForm.maxTokens,
          timeoutSeconds: aiForm.timeoutSeconds,
          retryCount: aiForm.retryCount,
          gradingPrompt: aiForm.gradingPrompt,
          keys
        })
        message.success('AI 配置已保存并生效')
        await loadAi()
      } catch (err) {
        showError(err, '保存 AI 配置失败')
      } finally {
        aiSaving.value = false
      }
    }
  })
}

// ==================== Tab 2: 编程语言 ====================

const languages = ref<AdminLanguage[]>([])
const languagesLoading = ref(false)
const languageModal = ref(false)
const languageSaving = ref(false)
const languageForm = reactive({
  id: '',
  code: '',
  name: '',
  fileExtension: '',
  compileCommand: '',
  runCommand: '',
  classnameRequired: false,
  timeMultiplier: 1,
  dockerImage: '',
  highlightName: '',
  isEnabled: true
})

const languageColumns: DataTableColumn<any>[] = [
  { title: '代码', key: 'code', width: 100, render: row => h('span', { class: 'font-mono text-xs' }, row.code) },
  { title: '名称', key: 'name', width: 130 },
  { title: '扩展名', key: 'fileExtension', width: 90 },
  {
    title: '编译命令',
    key: 'compileCommand',
    ellipsis: { tooltip: true },
    render: row => h('span', { class: 'font-mono text-xs' }, row.compileCommand || '（无）')
  },
  {
    title: '运行命令',
    key: 'runCommand',
    ellipsis: { tooltip: true },
    render: row => h('span', { class: 'font-mono text-xs' }, row.runCommand)
  },
  { title: '时间系数', key: 'timeMultiplier', width: 90, align: 'center' },
  {
    title: '状态',
    key: 'isEnabled',
    width: 80,
    align: 'center',
    render: row =>
      h(NTag, { size: 'small', bordered: false, type: row.isEnabled ? 'success' : 'default' },
        { default: () => (row.isEnabled ? '启用' : '停用') })
  },
  {
    title: '操作',
    key: 'actions',
    width: 130,
    render: row =>
      h('div', {}, [
        h('a', { class: 'text-primary-500 cursor-pointer', onClick: () => openLanguageModal(row) }, '编辑'),
        h('a', { class: 'text-error-600 cursor-pointer ml-3', onClick: () => handleDeleteLanguage(row) }, '删除')
      ])
  }
]

async function loadLanguages() {
  languagesLoading.value = true
  try {
    const res = await listAdminLanguages()
    languages.value = res.data || []
  } catch (err) {
    showError(err, '加载编程语言失败')
  } finally {
    languagesLoading.value = false
  }
}

function openLanguageModal(row?: AdminLanguage) {
  languageForm.id = row?.id || ''
  languageForm.code = row?.code || ''
  languageForm.name = row?.name || ''
  languageForm.fileExtension = row?.fileExtension || ''
  languageForm.compileCommand = row?.compileCommand || ''
  languageForm.runCommand = row?.runCommand || ''
  languageForm.classnameRequired = !!row?.classnameRequired
  languageForm.timeMultiplier = row?.timeMultiplier ?? 1
  languageForm.dockerImage = row?.dockerImage || ''
  languageForm.highlightName = row?.highlightName || ''
  languageForm.isEnabled = row ? !!row.isEnabled : true
  languageModal.value = true
}

async function handleSaveLanguage() {
  if (!languageForm.name.trim() || !languageForm.fileExtension.trim() || !languageForm.runCommand.trim()) {
    message.warning('展示名 / 扩展名 / 运行命令为必填项')
    return
  }
  if (!languageForm.id && !languageForm.code.trim()) {
    message.warning('新增语言必须填写语言代码')
    return
  }
  languageSaving.value = true
  try {
    const payload = {
      code: languageForm.code.trim().toLowerCase(),
      name: languageForm.name.trim(),
      fileExtension: languageForm.fileExtension.trim(),
      compileCommand: languageForm.compileCommand.trim(),
      runCommand: languageForm.runCommand.trim(),
      classnameRequired: languageForm.classnameRequired,
      timeMultiplier: languageForm.timeMultiplier,
      dockerImage: languageForm.dockerImage.trim(),
      highlightName: languageForm.highlightName.trim(),
      isEnabled: languageForm.isEnabled
    }
    if (languageForm.id) {
      await updateAdminLanguage(languageForm.id, payload)
    } else {
      await createAdminLanguage(payload)
    }
    message.success('已保存')
    languageModal.value = false
    await loadLanguages()
  } catch (err) {
    showError(err, '保存编程语言失败')
  } finally {
    languageSaving.value = false
  }
}

function handleDeleteLanguage(row: AdminLanguage) {
  confirm({
    title: '确认删除',
    content: `确定删除语言「${row.name}（${row.code}）」吗？被引用的语言无法删除，可改为停用。`,
    positiveText: '删除',
    onPositiveClick: async () => {
      try {
        await deleteAdminLanguage(row.id)
        message.success('已删除')
        await loadLanguages()
      } catch (err: any) {
        const code = err?.response?.data?.code
        if (code === 93013) {
          message.warning(err?.response?.data?.message || '该语言已被引用，无法删除，请改为停用')
        } else {
          showError(err, '删除失败')
        }
      }
    }
  })
}

// ==================== Tab 3: 运行时开关 ====================

const configItems = ref<SystemConfigItem[]>([])
const configLoading = ref(false)
const savingKey = ref('')
const drafts = reactive<Record<string, string>>({})

interface ConfigGroup {
  name: string
  items: SystemConfigItem[]
}

const configGroups = computed<ConfigGroup[]>(() => {
  const order: string[] = []
  const map: Record<string, SystemConfigItem[]> = {}
  for (const item of configItems.value) {
    if (!map[item.configGroup]) {
      map[item.configGroup] = []
      order.push(item.configGroup)
    }
    map[item.configGroup].push(item)
  }
  return order.map(name => ({ name, items: map[name] }))
})

const GROUP_LABELS: Record<string, string> = {
  captcha: '验证码',
  'invite-code': '邀请码',
  'rate-limit': '限流限额'
}

function groupLabel(name: string) {
  return GROUP_LABELS[name] || name
}

function applyConfigList(items: SystemConfigItem[]) {
  configItems.value = items || []
  for (const key of Object.keys(drafts)) {
    delete drafts[key]
  }
  for (const item of configItems.value) {
    drafts[item.configKey] = item.configValue
  }
}

async function loadConfig() {
  configLoading.value = true
  try {
    const res = await getSystemConfig()
    applyConfigList(res.data || [])
  } catch (err) {
    showError(err, '加载系统配置失败')
  } finally {
    configLoading.value = false
  }
}

function draftOf(item: SystemConfigItem) {
  return drafts[item.configKey] ?? item.configValue
}

function setDraft(item: SystemConfigItem, value: string) {
  drafts[item.configKey] = value
}

function draftInt(item: SystemConfigItem) {
  const n = parseInt(draftOf(item), 10)
  return Number.isNaN(n) ? 0 : n
}

async function doUpdate(configKey: string, configValue: string) {
  savingKey.value = configKey
  try {
    const res = await updateSystemConfig([{ configKey, configValue }])
    applyConfigList(res.data || [])
    message.success('已生效')
  } catch (err) {
    showError(err, '保存失败')
  } finally {
    savingKey.value = ''
  }
}

function saveSingle(item: SystemConfigItem, value: string) {
  doUpdate(item.configKey, value)
}

function saveDraft(item: SystemConfigItem) {
  const value = (drafts[item.configKey] ?? '').trim()
  if (!value) {
    message.warning('配置值不能为空')
    return
  }
  if (value === item.configValue) {
    message.info('值未变化')
    return
  }
  doUpdate(item.configKey, value)
}

// ==================== Tab 4: 启动期配置（只读） ====================

const envItems = ref<EnvConfigItem[]>([])
const envLoading = ref(false)

const envColumns: DataTableColumn<any>[] = [
  { title: '配置键', key: 'key', width: 280, render: row => h('span', { class: 'font-mono text-xs' }, row.key) },
  { title: '说明', key: 'description' },
  { title: '分组', key: 'category', width: 110 },
  {
    title: '状态',
    key: 'configured',
    width: 100,
    align: 'center',
    render: row =>
      h(NTag, { size: 'small', bordered: false, type: row.configured ? 'success' : 'default' },
        { default: () => (row.configured ? '已配置' : '未配置') })
  },
  {
    title: '生效方式',
    key: 'restartRequired',
    width: 100,
    align: 'center',
    render: () => h(NTag, { size: 'small', bordered: false, type: 'warning' }, { default: () => '需重启' })
  },
  {
    title: '备注',
    key: 'sensitive',
    render: row =>
      row.sensitive
        ? h('span', { class: 'text-xs text-neutral-400' }, '敏感项不显示值')
        : h('span', { class: 'text-neutral-300' }, '—')
  }
]

async function loadEnv() {
  envLoading.value = true
  try {
    const res = await getSystemConfigEnv()
    envItems.value = res.data || []
  } catch (err) {
    showError(err, '加载启动期配置失败')
  } finally {
    envLoading.value = false
  }
}

onMounted(() => {
  loadAi()
  loadLanguages()
  loadConfig()
  loadEnv()
})
</script>
