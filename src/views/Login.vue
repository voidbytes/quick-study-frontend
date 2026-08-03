<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <n-card class="w-full max-w-md" title="登录" :bordered="true">
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="top"
        @submit.prevent="handleLogin"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            v-model:value="form.username"
            placeholder="请输入用户名"
            :maxlength="50"
          />
        </n-form-item>

        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
            :maxlength="64"
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
            登录
          </n-button>
        </n-form-item>
      </n-form>

      <div class="text-center text-sm text-gray-500">
        还没有账号？
        <router-link to="/register" class="text-primary hover:underline">
          立即注册
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
import { getCaptcha } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const captchaImage = ref('')
const captchaId = ref('')

const form = reactive({
  username: '',
  password: '',
  captchaId: '',
  captchaCode: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 50, message: '用户名长度在 4-50 字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 64, message: '密码长度在 8-64 字符之间', trigger: 'blur' }
  ],
  captchaCode: captchaEnabled.value
    ? [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    : []
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

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await authStore.login({
      username: form.username,
      password: form.password,
      captchaId: form.captchaId,
      captchaCode: form.captchaCode
    })
    message.success('登录成功')
    router.push('/')
  } catch (err: any) {
    const code = err?.response?.data?.code
    const msg = err?.response?.data?.message || '登录失败'
    switch (code) {
      case 10102:
        message.error('验证码错误')
        refreshCaptcha()
        break
      case 10103:
        message.error('账户已锁定，请稍后再试')
        break
      case 10104:
        message.error('用户名或密码错误')
        break
      default:
        message.error(msg)
    }
    if (code === 10102) {
      refreshCaptcha()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 验证码本地开发环境已禁用
})
</script>