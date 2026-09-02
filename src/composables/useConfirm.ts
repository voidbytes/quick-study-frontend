import { useDialog } from 'naive-ui'
import type { DialogOptions } from 'naive-ui'

/**
 * 统一确认弹窗 —— 基于 Naive UI Dialog，注入设计系统视觉（品牌色主按钮）。
 * 用法：const { confirm, confirmDanger } = useConfirm()
 *      confirm({ title, content, positiveText, onPositiveClick })
 * 依赖 App.vue 中的 <n-dialog-provider>。
 */

export type ConfirmActionOptions = Partial<
  Pick<DialogOptions, 'title' | 'content' | 'positiveText' | 'negativeText' | 'onPositiveClick'>
>

export function useConfirm() {
  const dialog = useDialog()

  /** 普通确认（type=default，主按钮品牌色） */
  function confirm(opts: ConfirmActionOptions) {
    dialog.warning({
      title: opts.title ?? '确认操作',
      content: opts.content ?? '确定要执行此操作吗？',
      positiveText: opts.positiveText ?? '确认',
      negativeText: opts.negativeText ?? '取消',
      onPositiveClick: opts.onPositiveClick,
      // 让默认内容更接近 16 号稿的居中确认弹窗
      style: 'border-radius: 16px;'
    })
  }

  /** 危险操作确认（type=error 按钮红） */
  function confirmDanger(opts: ConfirmActionOptions) {
    dialog.error({
      title: opts.title ?? '确认删除',
      content: opts.content ?? '此操作不可撤销，确定继续吗？',
      positiveText: opts.positiveText ?? '删除',
      negativeText: opts.negativeText ?? '取消',
      positiveButtonProps: { type: 'error' },
      onPositiveClick: opts.onPositiveClick,
      style: 'border-radius: 16px;'
    })
  }

  return { confirm, confirmDanger }
}
