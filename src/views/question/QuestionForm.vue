<template>
  <div class="max-w-5xl mx-auto">
    <PageHeader :title="isEdit ? '编辑题目' : '创建题目'" :subtitle="isEdit ? '修改已有题目' : '向题库中添加新题目'" showBack />

    <div class="bg-white border border-neutral-200 rounded-lg p-6">
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
              :options="QUESTION_TYPE_OPTIONS"
              :disabled="isEdit"
              @update:value="handleTypeChange"
            />
          </n-form-item>

          <!-- 题干 -->
          <n-form-item label="题干" path="content">
            <MarkdownEditor v-model="form.content" />
          </n-form-item>

          <!-- 选项（单选 / 多选） -->
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
                  <n-icon size="18" class="cursor-move text-neutral-400">
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
                :rows="6"
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
              <n-radio v-for="opt in DIFFICULTY_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </n-radio>
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
              <n-radio v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </n-radio>
            </n-radio-group>
          </n-form-item>

          <!-- 编辑提示 -->
          <n-alert v-if="isEdit && paperRefCount > 0" type="warning" class="mb-4">
            该题目已被 {{ paperRefCount }} 份试卷引用，修改后可能影响已有试卷。
          </n-alert>

          <div class="flex justify-end gap-2 pt-2">
            <n-button @click="router.back()">取消</n-button>
            <n-button type="primary" attr-type="submit" :loading="saving">
              保存
            </n-button>
          </div>
        </n-form>
      </n-spin>
    </div>

    <!-- 标签管理（分组设置） -->
    <TagManageModal v-model:show="showTagManage" @updated="loadTags" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import type { QuestionType, Difficulty, QuestionOption } from '@/types'
import { createQuestion, updateQuestion, getQuestionDetail } from '@/api/question'
import type { UpdateQuestionParams } from '@/api/question'
import { getTagList } from '@/api/tag'
import { buildGroupedTagOptions } from '@/utils/tagOptions'
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS, QUESTION_STATUS_OPTIONS } from '@/utils/constants'
import PageHeader from '@/components/common/PageHeader.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import TagManageModal from '@/components/common/TagManageModal.vue'
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
const tagOptions = ref<SelectOption[]>([])
const showTagManage = ref(false)
const dragItemIndex = ref<number | null>(null)

const form = reactive({
  type: 'SINGLE' as QuestionType,
  content: '',
  options: ['', ''] as string[],
  answer: '',
  referenceAnswer: '',
  analysis: '',
  difficulty: 'MEDIUM' as Difficulty,
  tagIds: [] as number[],
  status: 'DRAFT'
})

/** 状态枚举由全局字典派生（表单不提供待审核选项） */
const statusOptions = QUESTION_STATUS_OPTIONS.filter((o) => o.value !== 'PENDING_REVIEW')

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
    const res = await getTagList()
    tagOptions.value = buildGroupedTagOptions(res.data || [])
  } catch {
    // ignore
  }
}

/** 详情接口运行时字段（Question 声明滞后，本地按后端 QuestionDetailResponse 建模） */
interface QuestionDetailData {
  id: number
  bankId: number
  bankName?: string | null
  type: QuestionType
  difficulty: Difficulty
  content: string
  options?: string | QuestionOption[] | null
  answer: string
  referenceAnswer?: string | null
  analysis?: string | null
  status: string
  tags?: { id: number; name: string }[]
  tagIds: number[]
  createdAt?: string
  updatedAt?: string
  paperRefCount?: number
}

/** 详情接口 options 运行时为 JSON 字符串（类型声明滞后），此处做本地收敛 */
function parseOptions(raw: string | QuestionOption[] | null | undefined): string[] {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((o: unknown): o is string => typeof o === 'string') : []
    } catch {
      return []
    }
  }
  return raw.map((o) => (typeof o === 'string' ? o : o?.content ?? ''))
}

async function loadQuestion() {
  if (!questionId) return
  loading.value = true
  try {
    const res = await getQuestionDetail(questionId)
    const q = res.data as unknown as QuestionDetailData
    form.type = q.type
    form.content = q.content
    const parsed = parseOptions(q.options)
    form.options = parsed.length >= 2 ? parsed : ['', '']
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
      options: form.type === 'SINGLE' || form.type === 'MULTIPLE'
        ? JSON.stringify(form.options)
        : undefined,
      answer: form.answer,
      referenceAnswer: form.referenceAnswer || undefined,
      analysis: form.analysis || undefined,
      difficulty: form.difficulty,
      tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
      status: form.status
    }

    if (isEdit.value) {
      // 后端 QuestionUpdateRequest.options 运行时仍为字符串，
      // 此处类型声明滞后于实际契约，需要一次受控窄化
      await updateQuestion(bankId, questionId!, payload as unknown as UpdateQuestionParams)
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
