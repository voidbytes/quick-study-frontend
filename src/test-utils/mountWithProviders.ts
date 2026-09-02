import { h, type Component } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import naive, { NMessageProvider, NDialogProvider } from 'naive-ui'

/** 业务页面用了 useMessage/useDialog，测试挂载时必须包 provider */
export function mountWithProviders(component: Component): VueWrapper<any> {
  const Wrapped = {
    name: 'WithProviders',
    render() {
      return h(NMessageProvider, null, {
        default: () => h(NDialogProvider, null, { default: () => h(component) })
      })
    }
  }
  return mount(Wrapped, { global: { plugins: [naive] } }) as VueWrapper<any>
}
