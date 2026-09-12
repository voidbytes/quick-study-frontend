import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SystemConfig from '@/views/admin/SystemConfig.vue'
import { mountWithProviders } from '@/test-utils/mountWithProviders'

vi.mock('@/api/systemConfig', () => ({
  getSystemConfig: vi.fn(),
  updateSystemConfig: vi.fn(),
  getSystemConfigEnv: vi.fn()
}))
vi.mock('@/api/aiConfig', () => ({ getAiConfig: vi.fn(), saveAiConfig: vi.fn() }))
vi.mock('@/api/programmingLanguage', () => ({
  listAdminLanguages: vi.fn(),
  createAdminLanguage: vi.fn(),
  updateAdminLanguage: vi.fn(),
  deleteAdminLanguage: vi.fn()
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/admin/system-config' })
}))

import { getSystemConfig, getSystemConfigEnv } from '@/api/systemConfig'
import { getAiConfig } from '@/api/aiConfig'
import { listAdminLanguages } from '@/api/programmingLanguage'

function okResponse(data: any) {
  return { code: 0, message: 'ok', data }
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

describe('SystemConfig', () => {
  it('渲染四个 Tab 并在挂载时加载全部配置', async () => {
    vi.mocked(getSystemConfig).mockResolvedValue(
      okResponse([
        {
          id: '1',
          configKey: 'captcha.enabled',
          configValue: 'false',
          valueType: 'BOOLEAN',
          configGroup: 'captcha',
          description: '验证码开关',
          editable: true,
          updatedAt: '2026-09-11T00:00:00'
        }
      ]) as any
    )
    vi.mocked(getSystemConfigEnv).mockResolvedValue(
      okResponse([
        {
          key: 'jwt.secret',
          description: 'JWT 签名密钥',
          category: 'jwt',
          sensitive: true,
          configured: true,
          restartRequired: true
        }
      ]) as any
    )
    vi.mocked(getAiConfig).mockResolvedValue(
      okResponse({
        id: '1',
        enabled: false,
        protocolType: 'OPENAI',
        baseUrl: 'http://x',
        modelId: 'm1',
        temperature: 0.2,
        maxTokens: 2000,
        timeoutSeconds: 60,
        retryCount: 2,
        gradingPrompt: 'p',
        updatedAt: '2026-09-11T00:00:00',
        keys: []
      }) as any
    )
    vi.mocked(listAdminLanguages).mockResolvedValue(okResponse([]) as any)

    const wrapper = mountWithProviders(SystemConfig)
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('AI 批改')
    expect(text).toContain('编程语言')
    expect(text).toContain('运行时开关')
    expect(text).toContain('启动期配置')
    expect(getSystemConfig).toHaveBeenCalledTimes(1)
    expect(getSystemConfigEnv).toHaveBeenCalledTimes(1)
    expect(getAiConfig).toHaveBeenCalledTimes(1)
    expect(listAdminLanguages).toHaveBeenCalledTimes(1)
  })
})
