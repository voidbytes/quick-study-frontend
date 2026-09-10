<template>
  <div>
    <n-spin :show="loading">
      <!-- 用户信息横幅（品牌渐变欢迎区） -->
      <div class="relative overflow-hidden bg-white border border-neutral-200 rounded-xl mb-6">
        <div class="h-24 bg-brand-soft" />
        <div class="px-5 sm:px-8 pb-5 sm:pb-6">
          <div class="relative flex items-end gap-4 sm:gap-5 -mt-10 z-10">
            <div
              class="w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ring-4 ring-white shadow-md"
            >
              {{ avatarText }}
            </div>
            <div class="min-w-0 flex-1 pb-0.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xl font-bold text-neutral-900">{{ displayName }}</span>
                <span
                  v-if="roleLabel"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600"
                >
                  {{ roleLabel }}
                </span>
              </div>
              <div class="text-sm text-neutral-500 mt-1">@{{ profile.username || '—' }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-neutral-200">
            <div>
              <div class="text-xs text-neutral-500 mb-1">加入时间</div>
              <div class="text-sm font-semibold text-neutral-900">{{ joinedAt }}</div>
            </div>
            <div>
              <div class="text-xs text-neutral-500 mb-1">邮箱</div>
              <div class="text-sm font-semibold text-neutral-900 truncate">{{ profile.email || '未设置' }}</div>
            </div>
            <div>
              <div class="text-xs text-neutral-500 mb-1">账号状态</div>
              <div class="text-sm font-semibold text-success-600">正常</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 两栏布局 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <!-- 左栏：资料 + 密码 -->
        <div class="lg:col-span-2 space-y-4">
          <!-- 基本信息 -->
          <div class="bg-white border border-neutral-200 rounded-lg">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <span class="text-base font-semibold text-neutral-900">基本信息</span>
            </div>
            <div class="p-5">
              <n-form
                ref="profileFormRef"
                :model="profile"
                :rules="profileRules"
                label-placement="top"
              >
                <n-form-item label="用户名">
                  <n-input :value="profile.username" disabled />
                </n-form-item>
                <n-form-item label="昵称" path="nickname">
                  <n-input v-model:value="profile.nickname" :maxlength="50" placeholder="请输入昵称" />
                </n-form-item>
                <n-form-item label="邮箱">
                  <n-input v-model:value="profile.email" :maxlength="100" placeholder="选填，用于找回密码" />
                </n-form-item>
                <div class="flex justify-end">
                  <n-button type="primary" :loading="savingProfile" @click="handleSaveProfile">
                    保存修改
                  </n-button>
                </div>
              </n-form>
            </div>
          </div>

          <!-- 修改密码 -->
          <div class="bg-white border border-neutral-200 rounded-lg">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <span class="text-base font-semibold text-neutral-900">修改密码</span>
            </div>
            <div class="p-5">
              <n-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-placement="top"
              >
                <n-form-item label="当前密码" path="oldPassword">
                  <n-input
                    v-model:value="passwordForm.oldPassword"
                    type="password"
                    show-password-on="click"
                    placeholder="请输入当前密码"
                  />
                </n-form-item>
                <n-form-item label="新密码" path="newPassword">
                  <n-input
                    v-model:value="passwordForm.newPassword"
                    type="password"
                    show-password-on="click"
                    :maxlength="64"
                    placeholder="密码长度 8-64 位"
                  />
                </n-form-item>
                <n-form-item label="确认新密码" path="confirmPassword">
                  <n-input
                    v-model:value="passwordForm.confirmPassword"
                    type="password"
                    show-password-on="click"
                    placeholder="请再次输入新密码"
                  />
                </n-form-item>
                <div class="flex justify-end">
                  <n-button type="primary" :loading="savingPassword" @click="handleChangePassword">
                    修改密码
                  </n-button>
                </div>
              </n-form>
            </div>
          </div>
        </div>

        <!-- 右栏：AI Key + 账号安全 -->
        <div class="space-y-4">
          <!-- AI Key 配置 -->
          <div class="bg-white border border-neutral-200 rounded-lg">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <span class="text-base font-semibold text-neutral-900">AI Key 配置</span>
            </div>
            <div class="p-5">
              <p class="text-sm text-neutral-600 mb-4">
                配置你的 AI API Key 以使用 AI 评分建议功能
              </p>

              <template v-if="aiKeyInfo?.hasKey">
                <div class="flex items-center gap-3 mb-4">
                  <code class="flex-1 px-3 py-2 rounded-md bg-neutral-100 border border-neutral-200 font-mono text-sm text-neutral-700 truncate">
                    {{ aiKeyInfo.maskedKey || 'sk-****' }}
                  </code>
                  <n-tag size="small" type="success" :bordered="false">已配置</n-tag>
                </div>
                <div class="flex gap-3 mb-4">
                  <n-button size="small" type="error" quaternary @click="handleDeleteAiKey">
                    <template #icon>
                      <n-icon :component="TrashOutline" />
                    </template>
                    删除 Key
                  </n-button>
                </div>
              </template>
              <template v-else>
                <n-input
                  v-model:value="newAiKey"
                  type="password"
                  show-password-on="click"
                  placeholder="输入 API Key"
                  class="mb-4"
                  @keyup.enter="handleSetAiKey"
                />
                <div class="flex justify-end mb-4">
                  <n-button size="small" type="primary" :disabled="!newAiKey.trim()" @click="handleSetAiKey">
                    设置 Key
                  </n-button>
                </div>
              </template>

              <p class="flex items-start gap-2 text-xs text-neutral-500">
                <n-icon :size="15" :component="InformationCircleOutline" class="mt-0.5 flex-shrink-0" />
                API Key 加密存储，仅用于 AI 评分建议
              </p>
            </div>
          </div>

          <!-- 账号安全 -->
          <div class="bg-white border border-neutral-200 rounded-lg">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <span class="text-base font-semibold text-neutral-900">账号安全</span>
            </div>
            <div class="p-5">
              <div class="divide-y divide-neutral-200 text-sm">
                <div class="flex items-center justify-between py-3">
                  <span class="text-neutral-500">账号用户名</span>
                  <span class="font-medium text-neutral-900">{{ profile.username || '—' }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-neutral-500">角色</span>
                  <span class="font-medium text-neutral-900">{{ roleLabel || '—' }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-neutral-500">账号状态</span>
                  <span class="font-medium text-success-600">正常</span>
                </div>
              </div>

              <div class="text-xs font-semibold tracking-wide text-error-600 uppercase pt-4 mt-1 border-t border-neutral-200">
                账号注销
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <n-button size="small" type="error" quaternary @click="handleDeactivate">
                  <template #icon>
                    <n-icon :component="CloseCircleOutline" />
                  </template>
                  注销账号
                </n-button>
                <span class="text-xs text-neutral-500">注销后不可恢复，私有数据将被清除</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { getProfile, updateProfile, changePassword, getAiKey, setAiKey, deleteAiKey, deactivateAccount } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import { TrashOutline, InformationCircleOutline, CloseCircleOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const message = useMessage()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { confirmDanger } = useConfirm()

const loading = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const profileFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)

const profile = reactive({
  username: '',
  nickname: '',
  email: ''
})

const profileRole = ref('')
const profileCreatedAt = ref('')

const profileRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 50, message: '昵称不超过50字符', trigger: 'blur' }
  ]
}

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 64, message: '密码长度在 8-64 字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (_rule, value) => value === passwordForm.newPassword || new Error('两次密码不一致'), trigger: 'blur' }
  ]
}

/** AI Key 状态：与后端运行时返回结构一致（{ hasKey, maskedKey }） */
type AiKeyInfo = { hasKey: boolean; maskedKey?: string }
const aiKeyInfo = ref<AiKeyInfo | null>(null)
const newAiKey = ref('')

const ROLE_LABELS: Record<string, string> = {
  USER: '普通用户',
  ADMIN: '管理员',
  SUPER_ADMIN: '超级管理员'
}

const roleLabel = computed(() => ROLE_LABELS[profileRole.value] || '')
const avatarText = computed(() => (profile.nickname || profile.username || '?').charAt(0).toUpperCase())
const displayName = computed(() => profile.nickname || profile.username || '未设置昵称')
const joinedAt = computed(() => (profileCreatedAt.value ? dayjs(profileCreatedAt.value).format('YYYY-MM-DD') : '—'))

async function fetchProfile() {
  loading.value = true
  try {
    const res = await getProfile()
    profile.username = res.data.username
    profile.nickname = res.data.nickname
    profile.email = res.data.email || ''
    profileRole.value = res.data.role || ''
    profileCreatedAt.value = res.data.createdAt || ''
  } catch {
    message.error('加载个人信息失败')
  } finally {
    loading.value = false
  }
}

async function fetchAiKey() {
  try {
    const res = await getAiKey()
    // api/user.ts 将 GET /user/ai-key 声明为 { key }，与后端实际返回 { hasKey, maskedKey } 不符（见 UserServiceImpl#getAiKey）
    const data = res.data as unknown as { hasKey: boolean; maskedKey: string | null }
    aiKeyInfo.value = { hasKey: data.hasKey, maskedKey: data.maskedKey ?? undefined }
  } catch {
    // ignore
  }
}

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    await updateProfile({
      nickname: profile.nickname,
      email: profile.email || undefined
    })
    message.success('保存成功')
  } catch {
    message.error('保存失败')
  } finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  savingPassword.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    message.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err: any) {
    const code = err?.response?.data?.code
    if (code === 10106) message.error('旧密码错误')
    else message.error('修改密码失败')
  } finally {
    savingPassword.value = false
  }
}

async function handleSetAiKey() {
  if (!newAiKey.value.trim()) {
    message.warning('请输入 API Key')
    return
  }
  try {
    // 后端 AiKeyRequest 字段实为 apiKey，而 api/user.ts 声明为 { key }；此处保留运行时字段名并在类型边界收敛
    await setAiKey({ apiKey: newAiKey.value } as unknown as { key: string })
    message.success('设置成功')
    newAiKey.value = ''
    fetchAiKey()
  } catch {
    message.error('设置失败')
  }
}

function handleDeleteAiKey() {
  confirmDanger({
    title: '删除 AI Key',
    content: '确定要删除当前配置的 AI Key 吗？',
    positiveText: '删除',
    onPositiveClick: async () => {
      try {
        await deleteAiKey()
        message.success('已删除')
        aiKeyInfo.value = null
      } catch {
        message.error('删除失败')
      }
    }
  })
}

function handleDeactivate() {
  confirmDanger({
    title: '确认注销',
    content: '确定要注销账号吗？此操作不可撤销！',
    positiveText: '确定注销',
    onPositiveClick: async () => {
      try {
        await deactivateAccount()
        authStore.logout()
        message.success('账号已注销')
        // 留在当前页并打开全局登录模态框（不再跳 /login）
        uiStore.openLoginModal()
      } catch (err: any) {
        const code = err?.response?.data?.code
        if (code === 20501) {
          message.error('你持有公开题库或试卷，请先转让所有权')
        } else {
          message.error('注销失败')
        }
      }
    }
  })
}

onMounted(() => {
  fetchProfile()
  fetchAiKey()
})
</script>
