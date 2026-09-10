<template>
  <n-modal
    :show="show"
    title="创建练习"
    preset="card"
    style="width: 560px; max-width: 90vw"
    :mask-closable="false"
    @update:show="$emit('update:show', $event)"
  >
    <n-form
      ref="formRef"
      :model="form"
      label-placement="top"
      @submit.prevent="handleCreate"
    >
      <n-form-item label="题量" path="count">
        <n-input-number v-model:value="form.count" :min="1" :max="200" style="width: 120px" />
      </n-form-item>

      <n-form-item label="题库选择">
        <n-select
          v-model:value="form.bankIds"
          :options="bankOptions"
          multiple
          filterable
          placeholder="不限题库则留空"
        />
      </n-form-item>

      <n-form-item label="题型选择">
        <n-select
          v-model:value="form.types"
          :options="typeOptions"
          multiple
          placeholder="不选则全部题型"
        />
      </n-form-item>

      <n-form-item label="标签选择">
        <n-select
          v-model:value="form.tagIds"
          :options="tagOptions"
          multiple
          filterable
          placeholder="不选则不限制"
        />
      </n-form-item>

      <n-grid :cols="2" :x-gap="16">
        <n-grid-item>
          <n-form-item label="最低正确率">
            <n-input-number v-model:value="form.correctRateMin" :min="0" :max="100" :step="5" style="width: 100%">
              <template #suffix>%</template>
            </n-input-number>
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="最高正确率">
            <n-input-number v-model:value="form.correctRateMax" :min="0" :max="100" :step="5" style="width: 100%">
              <template #suffix>%</template>
            </n-input-number>
          </n-form-item>
        </n-grid-item>
      </n-grid>

      <n-form-item label="优先未做题">
        <n-switch v-model:value="form.priorUnanswered" />
      </n-form-item>

      <n-form-item label="优先易错题">
        <n-switch v-model:value="form.priorWrong" />
      </n-form-item>

      <div class="flex justify-end gap-2">
        <n-button @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" attr-type="submit" :loading="loading">
          开始练习
        </n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { createPractice } from '@/api/practice'
import { getBankList } from '@/api/bank'
import { getTagList } from '@/api/tag'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  created: [sessionId: string]
}>()

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const bankOptions = ref<{ label: string; value: string }[]>([])
const tagOptions = ref<{ label: string; value: string }[]>([])

const form = reactive({
  count: 10,
  bankIds: [] as string[],
  types: [] as string[],
  tagIds: [] as string[],
  correctRateMin: undefined as number | undefined,
  correctRateMax: undefined as number | undefined,
  priorUnanswered: false,
  priorWrong: false
})

const typeOptions = [
  { label: '单选题', value: 'SINGLE' },
  { label: '多选题', value: 'MULTIPLE' },
  { label: '判断题', value: 'TRUE_FALSE' }
]

async function loadOptions() {
  try {
    const [bankRes, tagRes] = await Promise.all([
      getBankList({ page: 1, size: 200 }),
      getTagList()
    ])
    bankOptions.value = (bankRes.data.records || []).map((b) => ({ label: b.name, value: b.id }))
    tagOptions.value = tagRes.data.map((t) => ({ label: t.name, value: t.id }))
  } catch {
    // ignore
  }
}

async function handleCreate() {
  loading.value = true
  try {
    const res = await createPractice({
      count: form.count,
      bankIds: form.bankIds.length > 0 ? form.bankIds : undefined,
      types: form.types.length > 0 ? form.types : undefined,
      tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
      correctRateMin: form.correctRateMin != null ? form.correctRateMin / 100 : undefined,
      correctRateMax: form.correctRateMax != null ? form.correctRateMax / 100 : undefined,
      priorUnanswered: form.priorUnanswered || undefined,
      priorWrong: form.priorWrong || undefined
    })
    message.success('创建成功')
    emit('created', res.data.sessionId)
    router.push(`/practice/sessions/${res.data.sessionId}`)
  } catch (err: any) {
    const code = err?.response?.data?.code
    if (code === 70501) {
      message.error('符合条件的题目不足')
    } else {
      message.error('创建练习失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadOptions() })
</script>