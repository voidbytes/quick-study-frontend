<template>
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
            placeholder="3-50 字符"
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
          <div class="flex gap-3 items-center w-full">
            <n-input
              v-model:value="form.captchaCode"
              placeholder="请输入验证码"
              :maxlength="6"
              class="flex-1"
            />
            <div
              class="w-28 h-10 flex items-center justify-center bg-brand-soft border border-dashed border-primary-300 rounded-md font-mono text-xl font-bold tracking-widest text-brand cursor-pointer select-none flex-shrink-0"
              title="点击刷新验证码"
              @click="refreshCaptcha"
            >
              {{ captchaPlaceholder }}
            </div>
          </div>
        </n-form-item>

        <n-button
          type="primary"
          attr-type="submit"
          :loading="loading"
          block
          size="large"
          :disabled="loading"
          class="mt-2"
        >
          注册
        </n-button>
      </n-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { getCaptcha, checkUsername, getRegisterConfig } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const inviteRequired = ref(false)
const captchaImage = ref('')
const captchaId = ref('')
const usernameAvailable = ref<boolean | null>(null)

// 验证码占位（本地环境验证码被禁用时为提示文本）
const captchaPlaceholder = computed(() => (captchaImage.value ? 'ABCD' : '已关闭'))

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  captchaId: '',
  captchaCode: '',
  inviteCode: ''
})

/** 输入规范化：去空格与连字符、统一大写（用户粘贴带连字符的码也能过） */
function normalizeCode(v: string) {
  return (v || '').replace(/[\s-]/g, '').toUpperCase()
}

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
    { min: 3, max: 50, message: '用户名长度在 3-50 字符之间', trigger: 'blur' },
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
  if (!form.username || form.username.length < 3) return
  try {
    const res = await checkUsername(form.username)
    usernameAvailable.value = !res.data.exists
    if (res.data.exists) {
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
      captchaCode: captchaEnabled.value ? form.captchaCode : undefined,
      inviteCode: inviteRequired.value ? form.inviteCode : undefined
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
      case 95001:
        message.error('请输入邀请码')
        break
      case 95002:
        message.error('邀请码无效，请核对后重试')
        break
      case 95003:
        message.error('邀请码已被禁用')
        break
      case 95004:
        message.error('邀请码已过期')
        break
      case 95005:
        message.error('邀请码使用次数已用完')
        break
      default:
        message.error(msg)
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getRegisterConfig()
    inviteRequired.value = !!res.data.inviteCodeRequired
    captchaEnabled.value = !!res.data.captchaEnabled
  } catch {
    // 配置接口失败按默认（关闭）处理，后端仍会兜底校验
  }
  if (captchaEnabled.value) {
    refreshCaptcha()
  }
})
</script>