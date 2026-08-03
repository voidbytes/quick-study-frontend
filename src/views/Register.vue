<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <n-card class="w-full max-w-md" title="注册" :bordered="true">
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="top"
        @submit.prevent="handleRegister"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            v-model:value="form.username"
            placeholder="4-50 字符"
            :maxlength="50"
            @blur="handleCheckUsername"
          />
        </n-form-item>

        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="8-64 字符"
            show-password-on="click"
            :maxlength="64"
          />
        </n-form-item>

        <n-form-item label="确认密码" path="confirmPassword">
          <n-input
            v-model:value="form.confirmPassword"
            type="password"
            placeholder="再次输入密码"
            show-password-on="click"
            :maxlength="64"
          />
        </n-form-item>

        <n-form-item label="昵称" path="nickname">
          <n-input
            v-model:value="form.nickname"
            placeholder="1-50 字符"
            :maxlength="50"
          />
        </n-form-item>

        <n-form-item label="邮箱（可选）" path="email">
          <n-input
            v-model:value="form.email"
            placeholder="example@mail.com"
            :maxlength="100"
          />
        </n-form-item>

        <n-form-item v-if="captchaEnabled" label="验证码" path="captchaCode">
          <div class="flex gap-2 items-center">
            <n-input
              v-model:value="form.captchaCode"
              placeholder="验证码"
              :maxlength="6"
              class="flex-1"
            />
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="验证码"
              class="h-10 cursor-pointer rounded"
              @click="refreshCaptcha"
            />
          </div>
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            attr-type="submit"
            :loading="loading"
            block
            :disabled="loading"
          >
            注册
          </n-button>
        </n-form-item>
      </n-form>

      <div class="text-center text-sm text-gray-500">
        已有账号？
        <router-link to="/login" class="text-primary hover:underline">
          立即登录
        </router-link>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { getCaptcha, checkUsername } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const captchaImage = ref('')
const captchaId = ref('')
const usernameAvailable = ref<boolean | null>(null)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  captchaId: '',
  captchaCode: ''
})

function validatePasswordSame(_rule: any, value: string) {
  if (value !== form.password) {
    return new Error('两次密码输入不一致')
  }
  return true
}

function validateUsername(_rule: any, value: string) {
  if (usernameAvailable.value === false) {
    return new Error('该用户名已被使用')
  }
  return true
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 50, message: '用户名长度在 4-50 字符之间', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 64, message: '密码长度在 8-64 字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePasswordSame, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度在 1-50 字符之间', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  captchaCode: captchaEnabled.value
    ? [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    : []
}

async function handleCheckUsername() {
  if (!form.username || form.username.length < 4) return
  try {
    const res = await checkUsername(form.username)
    usernameAvailable.value = res.data.available
    if (!res.data.available) {
      message.warning('该用户名已被使用')
    }
  } catch {
    // ignore
  }
}

async function refreshCaptcha() {
  try {
    const res = await getCaptcha()
    captchaId.value = res.data.captchaId
    captchaImage.value = `data:image/png;base64,${res.data.captchaImage}`
    form.captchaId = res.data.captchaId
  } catch {
    message.error('获取验证码失败')
  }
}

async function handleRegister() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await authStore.register({
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      nickname: form.nickname,
      email: form.email || undefined,
      captchaId: captchaEnabled.value ? form.captchaId : undefined,
      captchaCode: captchaEnabled.value ? form.captchaCode : undefined
    })
    message.success('注册成功')
    router.push('/')
  } catch (err: any) {
    const code = err?.response?.data?.code
    const msg = err?.response?.data?.message || '注册失败'
    switch (code) {
      case 10101:
        message.error('用户名已存在')
        break
      case 10102:
        message.error('验证码错误')
        refreshCaptcha()
        break
      default:
        message.error(msg)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (captchaEnabled.value) {
    refreshCaptcha()
  }
})
</script>