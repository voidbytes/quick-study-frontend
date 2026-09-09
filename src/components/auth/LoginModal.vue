<template>
  <n-modal
    :show="show"
    preset="card"
    title="登录爱刷题"
    style="width: 420px"
    @update:show="$emit('update:show', $event)"
  >
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
        <div class="flex gap-3 items-center w-full">
          <n-input
            v-model:value="form.captchaCode"
            placeholder="请输入验证码"
            :maxlength="6"
            class="flex-1"
          />
          <img
            v-if="captchaImage"
            :src="captchaImage"
            class="w-28 h-10 object-cover bg-brand-soft border border-dashed border-primary-300 rounded-md cursor-pointer select-none flex-shrink-0"
            title="点击刷新验证码"
            @click="refreshCaptcha"
          />
          <div
            v-else
            class="w-28 h-10 flex items-center justify-center bg-brand-soft border border-dashed border-primary-300 rounded-md font-mono text-xl font-bold tracking-widest text-brand cursor-pointer select-none flex-shrink-0"
            title="点击刷新验证码"
            @click="refreshCaptcha"
          >
            {{ captchaPlaceholder }}
          </div>
        </div>
      </n-form-item>

      <n-checkbox v-model:checked="rememberMe" class="mb-3">记住我</n-checkbox>

      <n-button
        type="primary"
        attr-type="submit"
        :loading="loading"
        block
        size="large"
        :disabled="loading"
        class="mt-2"
      >
        登录
      </n-button>

      <div class="text-center text-sm text-neutral-500 mt-3">
        还没有账号？
        <router-link to="/register" class="text-brand hover:underline">注册</router-link>
      </div>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { getCaptcha, getRegisterConfig } from '@/api/auth'

const props = defineProps<{
  show: boolean
  /** 登录成功后的优先跳转目标；为空则关闭弹窗留在当前页 */
  redirect?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const captchaImage = ref('')
const captchaId = ref('')
/** 记住我：勾选后登录成功将用户名存 localStorage，下次自动回填 */
const rememberMe = ref(false)
const REMEMBER_KEY = 'login_remembered_username'

const form = reactive({
  username: '',
  password: '',
  captchaId: '',
  captchaCode: ''
})

// 验证码占位（本地环境验证码被禁用时为提示文本）
const captchaPlaceholder = computed(() => (captchaImage.value ? 'ABCD' : '已关闭'))

// rules 需随 captchaEnabled 响应式变化（拉配置前 captchaEnabled=false，静态对象无法感知）
const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3-50 字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 64, message: '密码长度在 8-64 字符之间', trigger: 'blur' }
  ],
  captchaCode: captchaEnabled.value
    ? [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    : []
}))

function restoreRememberedUsername() {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      form.username = saved
      rememberMe.value = true
    }
  } catch {
    // localStorage 不可用时忽略
  }
}

async function refreshCaptcha() {
  try {
    const res = await getCaptcha()
    captchaId.value = res.data.captchaId
    captchaImage.value = `data:image/png;base64,${res.data.captchaImage}`
    form.captchaId = res.data.captchaId
    form.captchaCode = ''
  } catch {
    message.error('获取验证码失败')
  }
}

function resetForm() {
  form.password = ''
  form.captchaCode = ''
  form.captchaId = ''
  captchaImage.value = ''
  captchaId.value = ''
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
    if (rememberMe.value) {
      localStorage.setItem(REMEMBER_KEY, form.username)
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    message.success('登录成功')
    const target = props.redirect || uiStore.redirectAfterLogin
    if (target) {
      router.push(target)
    }
    emit('update:show', false)
    uiStore.closeLoginModal()
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
  } finally {
    loading.value = false
  }
}

async function initCaptchaConfig() {
  try {
    const res = await getRegisterConfig()
    captchaEnabled.value = !!res.data.captchaEnabled
    if (captchaEnabled.value) {
      refreshCaptcha()
    }
  } catch {
    // 配置接口失败按默认（关闭）处理，后端仍会兜底校验
  }
}

// 弹窗打开时重置密码/验证码并重拉验证码（旧验证码可能已过期）；关闭时清空表单防残留
watch(
  () => props.show,
  v => {
    if (v) {
      restoreRememberedUsername()
      resetForm()
      initCaptchaConfig()
    } else {
      form.username = ''
      form.password = ''
      form.captchaCode = ''
      form.captchaId = ''
      rememberMe.value = false
    }
  }
)

onMounted(() => {
  restoreRememberedUsername()
  initCaptchaConfig()
})
</script>
