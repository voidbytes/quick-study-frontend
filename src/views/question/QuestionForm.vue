<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ isEdit ? '编辑题目' : '创建题目' }}</h1>

    <n-spin :show="loading">
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="top"
        @submit.prevent="handleSave"
      >
        <!-- 题型 -->
        <n-form-item label="题型" path="type">
          <n-select
            v-model:value="form.type"
            :options="typeOptions"
            :disabled="isEdit"
            @update:value="handleTypeChange"
          />
        </n-form-item>

        <!-- 题干 -->
        <n-form-item label="题干" path="content">
          <MarkdownEditor v-model="form.content" />
        </n-form-item>

        <!-- 选项（单选/多选） -->
        <template v-if="form.type === 'SINGLE' || form.type === 'MULTIPLE'">
          <n-form-item label="选项">
            <div class="w-full space-y-2">
              <div
                v-for="(opt, index) in form.options"
                :key="index"
                class="flex items-center gap-2"
                draggable="true"
                @dragstart="onDragStart(index)"
                @dragover.prevent="onDragOver(index)"
                @drop="onDrop(index)"
              >
                <n-icon size="18" class="cursor-move text-gray-400">
                  <ReorderTwoOutline />
                </n-icon>
                <span class="text-sm font-mono w-6">{{ String.fromCharCode(65 + index) }}.</span>
                <n-input
                  v-model:value="form.options[index]"
                  placeholder="选项内容"
                  class="flex-1"
                />
                <n-button
                  size="tiny"
                  quaternary
                  type="error"
                  :disabled="form.options.length <= 2"
                  @click="removeOption(index)"
                >
                  删除
                </n-button>
              </div>
              <n-button size="small" @click="addOption">添加选项</n-button>
            </div>
          </n-form-item>
        </template>

        <!-- 正确答案 -->
        <n-form-item label="正确答案" path="answer">
          <template v-if="form.type === 'SINGLE'">
            <n-select
              v-model:value="form.answer"
              :options="answerOptions"
              placeholder="选择正确答案"
            />
          </template>
          <template v-else-if="form.type === 'MULTIPLE'">
            <n-select
              v-model:value="form.answer"
              :options="answerOptions"
              multiple
              placeholder="选择正确答案（可多选）"
            />
          </template>
          <template v-else-if="form.type === 'TRUE_FALSE'">
            <n-radio-group v-model:value="form.answer">
              <n-radio value="true">正确</n-radio>
              <n-radio value="false">错误</n-radio>
            </n-radio-group>
          </template>
          <template v-else>
            <n-input
              v-model:value="form.answer"
              type="textarea"
              placeholder="输入答案"
              :rows="3"
            />
          </template>
        </n-form-item>

        <!-- 参考答案 -->
        <n-form-item label="参考答案">
          <MarkdownEditor v-model="form.referenceAnswer" />
        </n-form-item>

        <!-- 解析 -->
        <n-form-item label="解析">
          <MarkdownEditor v-model="form.analysis" />
        </n-form-item>

        <!-- 难度 -->
        <n-form-item label="难度" path="difficulty">
          <n-radio-group v-model:value="form.difficulty">
            <n-radio value="EASY">简单</n-radio>
            <n-radio value="MEDIUM">中等</n-radio>
            <n-radio value="HARD">困难</n-radio>
          </n-radio-group>
        </n-form-item>

        <!-- 标签 -->
        <n-form-item label="标签">
          <n-select
            v-model:value="form.tagIds"
            :options="tagOptions"
            multiple
            filterable
            placeholder="选择标签"
          />
        </n-form-item>

        <!-- 状态 -->
        <n-form-item label="状态" path="status">
          <n-radio-group v-model:value="form.status">
            <n-radio value="DRAFT">草稿</n-radio>
            <n-radio value="PUBLISHED">发布</n-radio>
          </n-radio-group>
        </n-form-item>

        <!-- 编辑提示 -->
        <n-alert v-if="isEdit && paperRefCount > 0" type="warning" class="mb-4">
          该题目已被 {{ paperRefCount }} 份试卷引用，修改后可能影响已有试卷。
        </n-alert>

        <div class="flex justify-end gap-2">
          <n-button @click="router.back()">取消</n-button>
          <n-button type="primary" attr-type="submit" :loading="saving">
            保存
          </n-button>
        </div>
      </n-form>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { createQuestion, updateQuestion, getQuestionDetail } from '@/api/question'
import { getTagList } from '@/api/tag'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import { ReorderTwoOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const bankId = Number(route.params.id)
const questionId = route.params.qid ? Number(route.params.qid) : null
const isEdit = computed(() => !!questionId)

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const saving = ref(false)
const paperRefCount = ref(0)
const tagOptions = ref<{ label: string; value: number }[]>([])
const dragItemIndex = ref<number | null>(null)

const form = reactive({
  type: 'SINGLE' as string,
  content: '',
  options: ['', ''],
  answer: '',
  referenceAnswer: '',
  analysis: '',
  difficulty: 'MEDIUM',
  tagIds: [] as number[],
  status: 'DRAFT'
})

// 与后端 QuestionType 枚举名保持一致
const typeOptions = [
  { label: '单选题', value: 'SINGLE' },
  { label: '多选题', value: 'MULTIPLE' },
  { label: '判断题', value: 'TRUE_FALSE' },
  { label: '填空题', value: 'FILL_BLANK' },
  { label: '简答题', value: 'SHORT_ANSWER' }
]

const answerOptions = computed(() =>
  form.options.map((opt, i) => ({
    label: `${String.fromCharCode(65 + i)}. ${opt.substring(0, 30)}`,
    value: String.fromCharCode(65 + i)
  }))
)

const rules: FormRules = {
  type: [{ required: true, message: '请选择题型' }],
  content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度' }],
  status: [{ required: true, message: '请选择状态' }]
}

function handleTypeChange(_value: string) {
  if (form.type === 'SINGLE' || form.type === 'MULTIPLE') {
    if (form.options.length < 2) form.options = ['', '']
  }
  form.answer = ''
}

function addOption() {
  form.options.push('')
}

function removeOption(index: number) {
  if (form.options.length <= 2) return
  form.options.splice(index, 1)
}

function onDragStart(index: number) {
  dragItemIndex.value = index
}

function onDragOver(index: number) {
  if (dragItemIndex.value === null || dragItemIndex.value === index) return
  const item = form.options.splice(dragItemIndex.value, 1)[0]
  form.options.splice(index, 0, item)
  dragItemIndex.value = index
}

function onDrop(_index?: number) {
  dragItemIndex.value = null
}

async function loadTags() {
  try {
    // 拦截器实际返回 ApiResponse，泛型声明与运行时不一致，用 any 规避误报
    const res: any = await getTagList()
    tagOptions.value = (res.data || []).map((t: any) => ({ label: t.name, value: t.id }))
  } catch {
    // ignore
  }
}

async function loadQuestion() {
  if (!questionId) return
  loading.value = true
  try {
    const res: any = await getQuestionDetail(questionId)
    const q = res.data
    form.type = q.type
    form.content = q.content
    // 后端 options 是 JSON 字符串，需解析为数组供表单编辑
    try {
      const parsed = q.options ? JSON.parse(q.options) : null
      form.options = Array.isArray(parsed) ? parsed : ['', '']
    } catch {
      form.options = ['', '']
    }
    form.answer = q.answer
    form.referenceAnswer = q.referenceAnswer || ''
    form.analysis = q.analysis || ''
    form.difficulty = q.difficulty || 'MEDIUM'
    form.tagIds = q.tagIds || []
    form.status = q.status || 'DRAFT'
    paperRefCount.value = q.paperRefCount || 0
  } catch {
    message.error('加载题目详情失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    const payload = {
      type: form.type,
      content: form.content,
      options: (form.type === 'SINGLE' || form.type === 'MULTIPLE') ? JSON.stringify(form.options) : undefined,
      answer: form.answer,
      referenceAnswer: form.referenceAnswer || undefined,
      analysis: form.analysis || undefined,
      difficulty: form.difficulty,
      tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
      status: form.status
    }

    if (isEdit.value) {
      await updateQuestion(bankId, questionId!, payload)
      message.success('保存成功')
    } else {
      await createQuestion(bankId, payload)
      message.success('创建成功')
    }
    router.back()
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadTags()
  if (isEdit.value) loadQuestion()
})
</script>