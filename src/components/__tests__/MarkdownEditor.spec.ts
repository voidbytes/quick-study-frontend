import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import { TOKEN_KEY } from '@/utils/constants'

// happy-dom 环境未实现 localStorage，注入内存版
const memoryStorage = new Map<string, string>()
;(globalThis as any).localStorage = {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => memoryStorage.set(k, v),
  removeItem: (k: string) => memoryStorage.delete(k),
  clear: () => memoryStorage.clear(),
}

// v-md-editor 及其插件依赖较重，这里打桩；仅实测图片计数拦截逻辑
vi.mock('@kangc/v-md-editor', () => ({
  default: { name: 'VMdEditorStub', template: '<div />', use: vi.fn() },
}))
vi.mock('@kangc/v-md-editor/lib/theme/vuepress.js', () => ({ default: {} }))
vi.mock('@kangc/v-md-editor/lib/plugins/katex/cdn', () => ({ default: vi.fn() }))
vi.mock('@kangc/v-md-editor/lib/plugins/line-number/index', () => ({ default: vi.fn() }))

vi.mock('naive-ui', () => ({
  useMessage: () => ({ warning: vi.fn() }),
}))

async function runUpload(modelValue: any, maxImages: number | undefined) {
  const insertImage = vi.fn()
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({ data: { url: '/uploads/a.png' } }),
    ok: true,
  } as any)

  const wrapper = shallowMount(MarkdownEditor as any, {
    props: { modelValue, maxImages, height: '300px' },
    global: {
      directives: { aMessage: {} } as any,
    },
  })
  const event = { target: { files: [{ name: 'a.png', type: 'image/png' }] } }
  // @ts-expect-error 访问内部方法用于测试
  await wrapper.vm.handleUploadImage(event, insertImage)
  return insertImage
}

describe('MarkdownEditor 图片数量上限', () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, 'token')
  })
  afterEach(() => {
    vi.restoreAllMocks()
    memoryStorage.clear()
  })

  it('未达上限时允许插入图片', async () => {
    const insertImage = await runUpload('文字 ![图片](a.png)', 9)
    expect(insertImage).toHaveBeenCalledTimes(1)
  })

  it('达到上限（9 张 markdown 图片）时拒绝插入', async () => {
    const nineImgs = Array.from({ length: 9 }, (_, i) => `![图${i}](u${i}.png)`).join(' ')
    const insertImage = await runUpload(nineImgs, 9)
    expect(insertImage).not.toHaveBeenCalled()
  })

  it('混合 Markdown 图片与 <img> 均被计数', async () => {
    const insertImage = await runUpload('![md](a.png) <img src="b.png">', 2)
    expect(insertImage).not.toHaveBeenCalled()
  })

  it('链接与数学公式不计入图片数', async () => {
    const insertImage = await runUpload('[链接](url) $\\frac{1}{2}$ 纯文字', 9)
    expect(insertImage).toHaveBeenCalledTimes(1)
  })

  it('未传 maxImages 时不限制', async () => {
    const insertImage = await runUpload('![a](1.png) ![b](2.png) ![c](3.png)', undefined)
    expect(insertImage).toHaveBeenCalledTimes(1)
  })
})