<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">个人中心</h1>

    <n-spin :show="loading">
      <!-- 个人信息 -->
      <n-card title="个人信息" class="mb-6">
        <n-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-placement="left"
          label-width="100"
        >
          <n-form-item label="用户名">
            <n-input :value="profileForm.username" disabled />
          </n-form-item>
          <n-form-item label="昵称" path="nickname">
            <n-input v-model:value="profileForm.nickname" :maxlength="50" />
          </n-form-item>
          <n-form-item label="邮箱">
            <n-input v-model:value="profileForm.email" :maxlength="100" />
          </n-form-item>
          <n-form-item label="个人简介">
            <n-input v-model:value="profileForm.bio" type="textarea" :rows="3" :maxlength="200" />
          </n-form-item>
          <n-button type="primary" :loading="savingProfile" @click="handleSaveProfile">
            保存修改
          </n-button>
        </n-form>
      </n-card>

      <!-- 修改密码 -->
      <n-card title="修改密码" class="mb-6">
        <n-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-placement="left"
          label-width="120"
        >
          <n-form-item label="旧密码" path="oldPassword">
            <n-input
              v-model:value="passwordForm.oldPassword"
              type="password"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item label="新密码" path="newPassword">
            <n-input
              v-model:value="passwordForm.newPassword"
              type="password"
              show-password-on="click"
              :maxlength="64"
            />
          </n-form-item>
          <n-form-item label="确认新密码" path="confirmPassword">
            <n-input
              v-model:value="passwordForm.confirmPassword"
              type="password"
              show-password-on="click"
            />
          </n-form-item>
          <n-button type="primary" :loading="savingPassword" @click="handleChangePassword">
            修改密码
          </n-button>
        </n-form>
      </n-card>

      <!-- AI Key 管理 -->
      <n-card title="AI Key 管理" class="mb-6">
        <div class="flex items-center gap-4">
          <template v-if="aiKeyInfo?.hasKey">
            <span class="text-sm">当前 Key：{{ aiKeyInfo.maskedKey }}</span>
            <n-button size="small" @click="handleDeleteAiKey">删除</n-button>
          </template>
          <template v-else>
            <n-input
              v-model:value="newAiKey"
              type="password"
              placeholder="输入 API Key"
              style="width: 300px"
              show-password-on="click"
            />
            <n-button size="small" type="primary" @click="handleSetAiKey">设置</n-button>
          </template>
        </div>
        <div class="mt-2 text-xs text-gray-400">
          AI Key 用于 AI 评分建议功能，AES 加密存储
        </div>
      </n-card>

      <!-- 注销账号 -->
      <n-card title="危险操作">
        <n-button type="error" @click="handleDeactivate">
          注销账号
        </n-button>
        <div class="mt-2 text-xs text-gray-400">
          注销后不可恢复，私有数据将被清除
        </div>
      </n-card>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { getProfile, updateProfile, changePassword, getAiKey, setAiKey, deleteAiKey, deactivateAccount } from '@/api/user'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const profileFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)

const profileForm = reactive({
  username: '',
  nickname: '',
  email: '',
  bio: ''
})

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

const aiKeyInfo = ref<{ hasKey: boolean; maskedKey?: string } | null>(null)
const newAiKey = ref('')

async function fetchProfile() {
  loading.value = true
  try {
    const res = await getProfile()
    profileForm.username = res.data.username
    profileForm.nickname = res.data.nickname
    profileForm.email = res.data.email || ''
    profileForm.bio = res.data.bio || ''
  } catch {
    message.error('加载个人信息失败')
  } finally {
    loading.value = false
  }
}

async function fetchAiKey() {
  try {
    const res = await getAiKey()
    aiKeyInfo.value = res.data
  } catch {
    // ignore
  }
}

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    await updateProfile({
      nickname: profileForm.nickname,
      email: profileForm.email || undefined,
      bio: profileForm.bio || undefined
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
      newPassword: passwordForm.newPassword
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
  if (!newAiKey.value) {
    message.warning('请输入 API Key')
    return
  }
  try {
    await setAiKey({ apiKey: newAiKey.value })
    message.success('设置成功')
    newAiKey.value = ''
    fetchAiKey()
  } catch {
    message.error('设置失败')
  }
}

async function handleDeleteAiKey() {
  try {
    await deleteAiKey()
    message.success('已删除')
    aiKeyInfo.value = null
  } catch {
    message.error('删除失败')
  }
}

function handleDeactivate() {
  dialog.warning({
    title: '确认注销',
    content: '确定要注销账号吗？此操作不可撤销！',
    positiveText: '确定注销',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deactivateAccount()
        message.success('账号已注销')
        router.push('/login')
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