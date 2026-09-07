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

          <!-- ═══ 编程题配置（语言限制 + 资源限制 + 模板 + 测试用例） ═══ -->
          <template v-if="form.type === 'PROGRAMMING' && form.programming">
            <n-divider title-placement="left">编程题配置</n-divider>

            <n-form-item label="允许的编程语言">
              <n-select
                v-model:value="form.programming.allowedLanguages"
                :options="languageOptions"
                multiple
                filterable
                clearable
                placeholder="不限制（所有启用语言均可作答）"
              />
              <div class="text-xs text-neutral-400 mt-1">
                留空 = 不限制。已发布的试卷/练习按提交时的快照判定，修改不影响进行中的会话。
              </div>
            </n-form-item>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <n-form-item label="时间限制（毫秒）">
                <n-input-number
                  v-model:value="form.programming.timeLimitMs"
                  :min="500"
                  :max="10000"
                  :step="100"
                  class="w-full"
                />
                <div class="text-xs text-neutral-400 mt-1">单用例 CPU 时间上限，500~10000ms</div>
              </n-form-item>
              <n-form-item label="内存限制（KB）">
                <n-input-number
                  v-model:value="form.programming.memoryLimitKb"
                  :min="16384"
                  :max="524288"
                  :step="1024"
                  class="w-full"
                />
                <div class="text-xs text-neutral-400 mt-1">单用例内存上限，16MB~512MB</div>
              </n-form-item>
            </div>

            <n-form-item label="初始代码模板（答题者可见，可为空）">
              <n-tabs v-if="starterLangCodes.length" type="line" size="small">
                <n-tab-pane
                  v-for="code in starterLangCodes"
                  :key="code"
                  :name="code"
                  :tab="langName(code)"
                >
                  <n-input
                    v-model:value="form.programming.starterCode[code]"
                    type="textarea"
                    :rows="10"
                    class="font-mono"
                    placeholder="该语言的初始代码模板（答题者在此基础上作答）"
                  />
                </n-tab-pane>
              </n-tabs>
              <div v-else class="text-xs text-neutral-400">加载语言列表失败，请刷新页面重试</div>
            </n-form-item>

            <n-collapse class="mb-4">
              <n-collapse-item title="参考实现（各语言，不下发答题者，出题人校验用例用）">
                <n-tabs v-if="starterLangCodes.length" type="line" size="small">
                  <n-tab-pane
                    v-for="code in starterLangCodes"
                    :key="code"
                    :name="code"
                    :tab="langName(code)"
                  >
                    <n-input
                      v-model:value="form.programming.answerCode[code]"
                      type="textarea"
                      :rows="8"
                      class="font-mono"
                      placeholder="该语言的参考实现（可选）"
                    />
                  </n-tab-pane>
                </n-tabs>
              </n-collapse-item>
            </n-collapse>

            <n-form-item label="测试用例">
              <div class="w-full space-y-3">
                <div
                  v-for="(tc, index) in form.programming.testCases"
                  :key="index"
                  class="border border-neutral-200 rounded-lg p-3 space-y-2"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">用例 {{ index + 1 }}</span>
                    <div class="flex items-center gap-3">
                      <label class="flex items-center gap-1 text-sm text-neutral-500 cursor-pointer">
                        <n-switch v-model:value="tc.isSample" size="small" />
                        公开样例
                      </label>
                      <n-button
                        size="tiny"
                        quaternary
                        type="error"
                        @click="removeTestCase(index)"
                      >
                        删除
                      </n-button>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <n-input
                      v-model:value="tc.input"
                      type="textarea"
                      :rows="4"
                      class="font-mono"
                      placeholder="标准输入（stdin）"
                    />
                    <n-input
                      v-model:value="tc.expectedOutput"
                      type="textarea"
                      :rows="4"
                      class="font-mono"
                      placeholder="期望输出（stdout）"
                    />
                  </div>
                </div>
                <n-button size="small" @click="addTestCase">添加用例</n-button>
                <div class="text-xs text-neutral-400">
                  至少 1 条用例，且至少 1 条「公开样例」（答题者在线运行依赖）；单条 input/输出 ≤ 64KB；总用例 ≤ 50。
                </div>
              </div>
            </n-form-item>
            <n-divider />
          </template>

          <!-- 正确答案（编程题无此字段） -->
          <n-form-item v-if="form.type !== 'PROGRAMMING'" label="正确答案" path="answer">
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

          <!-- 参考答案（编程题的"参考实现"已在编程题配置内） -->
          <n-form-item v-if="form.type !== 'PROGRAMMING'" label="参考答案">
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
import type { UpdateQuestionParams, ProgrammingQuestionConfig } from '@/api/question'
import { getProgrammingLanguages } from '@/api/judge'
import type { ProgrammingLanguage } from '@/api/judge'
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

/** 判题启用语言（语言限制多选 + 模板 tab） */
const languageOptions = ref<SelectOption[]>([])
const languageMap = ref<Record<string, string>>({})

const form = reactive({
  type: 'SINGLE' as QuestionType,
  content: '',
  options: ['', ''] as string[],
  answer: '',
  referenceAnswer: '',
  analysis: '',
  difficulty: 'MEDIUM' as Difficulty,
  tagIds: [] as number[],
  status: 'DRAFT',
  /** 编程题配置（仅 type=PROGRAMMING 时非空） */
  programming: null as ProgrammingQuestionConfig | null
})

/** 状态枚举由全局字典派生（表单不提供待审核选项） */
const statusOptions = QUESTION_STATUS_OPTIONS.filter((o) => o.value !== 'PENDING_REVIEW')

const answerOptions = computed(() =>
  form.options.map((opt, i) => ({
    label: `${String.fromCharCode(65 + i)}. ${opt.substring(0, 30)}`,
    value: String.fromCharCode(65 + i)
  }))
)

/** 动态校验规则：编程题无 answer 字段，不参与该校验 */
const rules = computed<FormRules>(() => {
  const base: FormRules = {
    type: [{ required: true, message: '请选择题型' }],
    content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
    difficulty: [{ required: true, message: '请选择难度' }],
    status: [{ required: true, message: '请选择状态' }]
  }
  if (form.type !== 'PROGRAMMING') {
    base.answer = [{ required: true, message: '请输入正确答案', trigger: 'blur' }]
  }
  return base
})

/** 编程题模板/参考实现的 tab 语言列表（所有启用语言） */
const starterLangCodes = computed(() => {
  const prog = form.programming
  return prog ? Object.keys(prog.starterCode) : []
})

function langName(code: string): string {
  return languageMap.value[code] || code
}

/** 编程题默认配置：不限制语言、一条空公开样例、为所有启用语言建模板槽位 */
function initProgramming() {
  const codes = languageOptions.value.map((o) => o.value as string)
  const starterCode: Record<string, string> = {}
  const answerCode: Record<string, string> = {}
  codes.forEach((code) => {
    starterCode[code] = ''
    answerCode[code] = ''
  })
  return {
    timeLimitMs: 1000,
    memoryLimitKb: 131072,
    allowedLanguages: null as string[] | null,
    starterCode,
    answerCode,
    judgeStrategy: 'AC_ONLY' as const,
    testCases: [{ input: '', expectedOutput: '', isSample: true, sortOrder: 0 }]
  }
}

/** 回显时把后端返回的模板/实现 merge 到全部语言槽位（确保 tab 可编辑） */
function mergeCodeMap(existing: Record<string, string> | null | undefined): Record<string, string> {
  const merged: Record<string, string> = {}
  languageOptions.value.forEach((o) => {
    const code = o.value as string
    merged[code] = existing?.[code] ?? ''
  })
  return merged
}

function handleTypeChange(_value: string) {
  if (form.type === 'SINGLE' || form.type === 'MULTIPLE') {
    if (form.options.length < 2) form.options = ['', '']
  }
  if (form.type === 'PROGRAMMING') {
    form.programming = initProgramming()
  } else {
    form.programming = null
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

function addTestCase() {
  const prog = form.programming
  if (!prog) return
  if (prog.testCases.length >= 50) {
    message.error('测试用例不能超过 50 个')
    return
  }
  prog.testCases.push({
    input: '',
    expectedOutput: '',
    isSample: prog.testCases.length === 0,
    sortOrder: prog.testCases.length
  })
}

function removeTestCase(index: number) {
  const prog = form.programming
  if (!prog || prog.testCases.length <= 1) return
  prog.testCases.splice(index, 1)
  prog.testCases.forEach((tc, i) => (tc.sortOrder = i))
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

function loadLanguages() {
  getProgrammingLanguages()
    .then((res) => {
      const langs = (res.data || []) as ProgrammingLanguage[]
      languageOptions.value = langs.map((l) => ({ label: l.name, value: l.code }))
      languageMap.value = langs.reduce<Record<string, string>>((acc, l) => {
        acc[l.code] = l.name
        return acc
      }, {})
    })
    .catch(() => {
      message.error('加载编程语言列表失败')
    })
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
  /** 编程题配置（type=PROGRAMMING 时存在） */
  programming?: {
    timeLimitMs: number
    memoryLimitKb: number
    allowedLanguages: string[] | null
    starterCode: Record<string, string>
    answerCode: Record<string, string>
    judgeStrategy: string
    testCases: {
      input: string
      expectedOutput: string
      isSample: boolean
      sortOrder: number
    }[]
  } | null
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
    if (q.type === 'PROGRAMMING' && q.programming) {
      const p = q.programming
      form.programming = {
        timeLimitMs: p.timeLimitMs ?? 1000,
        memoryLimitKb: p.memoryLimitKb ?? 131072,
        allowedLanguages: p.allowedLanguages && p.allowedLanguages.length ? p.allowedLanguages : null,
        starterCode: mergeCodeMap(p.starterCode),
        answerCode: mergeCodeMap(p.answerCode),
        judgeStrategy: p.judgeStrategy === 'PARTIAL' ? 'PARTIAL' : 'AC_ONLY',
        testCases: (p.testCases || []).map((tc, i) => ({
          input: tc.input ?? '',
          expectedOutput: tc.expectedOutput ?? '',
          isSample: !!tc.isSample,
          sortOrder: tc.sortOrder ?? i
        }))
      }
    } else {
      form.programming = null
    }
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

  // 编程题专项校验（与后端 Service 层规则保持一致，提前拦截）
  if (form.type === 'PROGRAMMING' && form.programming) {
    const tcs = form.programming.testCases.filter(
      (tc) => tc.input.trim() !== '' || tc.expectedOutput.trim() !== ''
    )
    if (tcs.length === 0) {
      message.error('至少需要一个测试用例')
      return
    }
    if (!tcs.some((tc) => tc.isSample)) {
      message.error('至少需要一个公开样例（供答题者在线运行）')
      return
    }
  }

  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      type: form.type,
      content: form.content,
      options: form.type === 'SINGLE' || form.type === 'MULTIPLE'
        ? JSON.stringify(form.options)
        : undefined,
      answer: form.type === 'PROGRAMMING' ? undefined : form.answer,
      referenceAnswer: form.type === 'PROGRAMMING' ? undefined : form.referenceAnswer || undefined,
      analysis: form.analysis || undefined,
      difficulty: form.difficulty,
      tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
      status: form.status
    }

    if (form.type === 'PROGRAMMING' && form.programming) {
      const prog = form.programming
      payload.programming = {
        timeLimitMs: prog.timeLimitMs,
        memoryLimitKb: prog.memoryLimitKb,
        // null/空 = 全部启用语言（后端校验引用语言存在且启用）
        allowedLanguages: prog.allowedLanguages && prog.allowedLanguages.length
          ? prog.allowedLanguages
          : null,
        starterCode: Object.fromEntries(
          Object.entries(prog.starterCode).filter(([, v]) => v.trim() !== '')
        ),
        answerCode: Object.fromEntries(
          Object.entries(prog.answerCode).filter(([, v]) => v.trim() !== '')
        ),
        judgeStrategy: 'AC_ONLY',
        testCases: prog.testCases
          .filter((tc) => tc.input.trim() !== '' || tc.expectedOutput.trim() !== '')
          .map((tc, i) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample,
            sortOrder: i
          }))
      }
    }

    if (isEdit.value) {
      // 后端 QuestionUpdateRequest 运行时为字符串 options，此处类型声明滞后于实际契约，受控窄化
      await updateQuestion(bankId, questionId!, payload as unknown as UpdateQuestionParams)
      message.success('保存成功')
    } else {
      await createQuestion(bankId, payload as never)
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
  loadLanguages()
  if (isEdit.value) loadQuestion()
})
</script>
