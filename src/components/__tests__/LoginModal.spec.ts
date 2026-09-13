import { describe, it, expect, vi, beforeEach } from 'vitest'
import { h } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { NMessageProvider } from 'naive-ui'
import LoginModal from '@/components/auth/LoginModal.vue'
import { createPinia, setActivePinia } from 'pinia'
import naive from 'naive-ui'
import { useUiStore } from '@/stores/ui'

vi.mock('@/api/auth', () => ({
  getCaptcha: vi.fn(),
  getRegisterConfig: vi.fn(),
  login: vi.fn()
}))

import { getRegisterConfig, getCaptcha, login } from '@/api/auth'

// 响应拦截器解包后返回类型为 Promise<ApiResponse<T>>，与泛型签名一致
const configMock = vi.mocked(getRegisterConfig)
const captchaMock = vi.mocked(getCaptcha)
const loginMock = vi.mocked(login)

// vue-router：LoginModal 只用 useRouter 做可选跳转
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock })
}))

const pushMock = vi.fn()

// n-modal 内容 teleport 到 body，attachTo 后从 document 查询（仅 happy-dom 环境）
let wrapper: VueWrapper<any>

function mountModal(props: Record<string, unknown> = {}) {
  // LoginModal 用 useMessage，必须包 NMessageProvider（同 mountWithProviders 约定）
  const Wrapped = {
    name: 'WithMessageProvider',
    render() {
      return h(NMessageProvider, null, {
        default: () => h(LoginModal, { show: true, ...props } as any)
      })
    }
  }
  wrapper = mount(Wrapped, { global: { plugins: [naive] }, attachTo: document.body })
  return wrapper
}

/** n-modal 内容在 body 下：按 placeholder 找原生 input */
function inputByPlaceholder(ph: string) {
  const el = document.body.querySelector(`input[placeholder="${ph}"]`) as HTMLInputElement | null
  expect(el, `input ${ph} 应存在`).toBeTruthy()
  return el!
}

async function fillAndSubmit(username: string, password: string) {
  const usernameEl = inputByPlaceholder('请输入用户名')
  usernameEl.value = username
  usernameEl.dispatchEvent(new Event('input'))
  const passwordEl = inputByPlaceholder('请输入密码')
  passwordEl.value = password
  passwordEl.dispatchEvent(new Event('input'))
  const form = document.body.querySelector('form')!
  form.dispatchEvent(new Event('submit', { cancelable: true }))
  await flushPromises()
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
  pushMock.mockClear()
  document.body.innerHTML = ''
  // 默认注册配置：验证码关闭
  configMock.mockResolvedValue({ code: 0, message: 'ok', data: { inviteCodeRequired: false, captchaEnabled: false } } as any)
})

describe('LoginModal', () => {
  it('弹窗打开时渲染登录表单（用户名/密码/注册链接）', () => {
    mountModal()
    const text = document.body.textContent || ''
    expect(text).toContain('用户名')
    expect(text).toContain('密码')
    expect(text).toContain('注册')
  })

  it('提交成功且无 redirect：关闭弹窗并留在当前页（不调用 router.push）', async () => {
    mountModal()
    const uiStore = useUiStore()

    loginMock.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: { userId: 1, username: 'tester', nickname: 'Tester', role: 'USER', accessToken: 't', refreshToken: 'r' }
    } as any)

    await fillAndSubmit('tester', 'password123')

    expect(loginMock).toHaveBeenCalled()
    // n-modal teleport 到 body，update:show 不冒泡到 wrapper；以 uiStore 状态为准
    expect(uiStore.showLoginModal).toBe(false)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('提交成功且有 redirect：router.push 跳转目标页', async () => {
    mountModal({ redirect: '/questions' })

    loginMock.mockResolvedValueOnce({
      code: 0,
      message: 'ok',
      data: { userId: 1, username: 'tester', nickname: 'Tester', role: 'USER', accessToken: 't', refreshToken: 'r' }
    } as any)

    await fillAndSubmit('tester', 'password123')

    expect(pushMock).toHaveBeenCalledWith('/questions')
  })

  it('登录失败（用户名或密码错误 10104）：弹窗不关闭', async () => {
    const uiStore = useUiStore()
    uiStore.openLoginModal()
    mountModal()

    const err: any = new Error('用户名或密码错误')
    err.response = { data: { code: 10104, message: '用户名或密码错误' } }
    loginMock.mockRejectedValueOnce(err)

    await fillAndSubmit('tester', 'wrongpassword')

    // 失败时弹窗不关（uiStore 仍为 true）
    expect(uiStore.showLoginModal).toBe(true)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('验证码开启时渲染验证码输入位', async () => {
    configMock.mockResolvedValue({ code: 0, message: 'ok', data: { inviteCodeRequired: false, captchaEnabled: true } } as any)
    captchaMock.mockResolvedValue({
      code: 0,
      message: 'ok',
      data: { captchaId: 'cap1', captchaImage: 'aW1n' }
    } as any)

    mountModal()
    await flushPromises()

    expect(document.body.textContent || '').toContain('验证码')
    expect(inputByPlaceholder('请输入验证码')).toBeTruthy()
  })
})
