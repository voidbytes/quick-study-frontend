<template>
  <n-modal
    :show="show"
    title="创建题库"
    preset="card"
    style="width: 480px"
    @update:show="$emit('update:show', $event)"
  >
    <n-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="top"
      @submit.prevent="handleCreate"
    >
      <n-form-item label="名称" path="name">
        <n-input v-model:value="form.name" placeholder="题库名称" :maxlength="100" />
      </n-form-item>

      <n-form-item label="描述" path="description">
        <n-input
          v-model:value="form.description"
          type="textarea"
          placeholder="题库描述（可选）"
          :maxlength="500"
          :rows="3"
        />
      </n-form-item>

      <n-form-item label="封面图" path="coverUrl">
        <FileUpload v-model="form.coverUrl" />
      </n-form-item>

      <n-form-item label="公开题库">
        <n-switch v-model:value="form.isPublic" />
      </n-form-item>

      <div class="flex justify-end gap-2">
        <n-button @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" attr-type="submit" :loading="loading">
          创建
        </n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { createBank } from '@/api/bank'
import FileUpload from '@/components/FileUpload.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  created: []
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const form = reactive({
  name: '',
  description: '',
  coverUrl: '',
  isPublic: false
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入题库名称', trigger: 'blur' },
    { max: 100, message: '名称不超过100字符', trigger: 'blur' }
  ]
}

watch(() => props.show, (val) => {
  if (val) {
    form.name = ''
    form.description = ''
    form.coverUrl = ''
    form.isPublic = false
  }
})

async function handleCreate() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await createBank({
      name: form.name,
      description: form.description || undefined,
      coverUrl: form.coverUrl || undefined,
      isPublic: form.isPublic
    })
    message.success('创建成功')
    emit('created')
  } catch {
    message.error('创建失败')
  } finally {
    loading.value = false
  }
}
</script>