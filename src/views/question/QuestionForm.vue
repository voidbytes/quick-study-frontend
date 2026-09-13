<template>
  <div class="max-w-5xl mx-auto">
    <PageHeader
      :title="isEdit ? '编辑题目' : '创建题目'"
      :subtitle="isEdit ? '修改已有题目' : '向题库中添加新题目'"
      showBack
      :back-to="`/banks/${route.params.id}`"
    />

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
            <MarkdownEditor ref="contentEditorRef" v-model="form.content" />
          </n-form-item>

          <!-- 选项（单选 / 多选）：整题替换模型，提交时按展示顺序重编号 id -->
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
                <div class="flex items-center gap-4">
                  <n-button size="small" @click="addOption">添加选项</n-button>
                  <label class="flex items-center gap-1 text-sm text-neutral-500 cursor-pointer">
                    <n-switch v-model:value="form.optionsShufflable" size="small" />
                    选项乱序
                  </label>
                </div>
                <div class="text-xs text-neutral-400">
                  选项拖拽排序仅调整展示顺序；保存后按当前顺序重新编号，答案引用将自动对齐。
                </div>
                <div class="text-xs text-neutral-400">
                  开启乱序后练习/考试将随机打乱选项展示顺序，关闭则固定按录入顺序展示；选项含「以上都是」「均不正确」等指代其他选项的表述时建议关闭；若「以上」指代题干内容则无需关闭。
                </div>
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

          <!-- 正确答案（编程题无此字段）：选择题选 option_id，判断题 [0]/[1]，填空=可接受答案组，简答为文本（简答参考答案并入此字段） -->
          <n-form-item v-if="form.type !== 'PROGRAMMING'" :label="form.type === 'SHORT_ANSWER' ? '参考答案' : '正确答案'" path="answer">
            <template v-if="form.type === 'SINGLE'">
              <n-select
                v-model:value="form.answerIds"
                :options="answerOptions"
                placeholder="选择正确答案"
              />
            </template>
            <template v-else-if="form.type === 'MULTIPLE'">
              <n-select
                v-model:value="form.answerIds"
                :options="answerOptions"
                multiple
                placeholder="选择正确答案（可多选）"
              />
            </template>
            <template v-else-if="form.type === 'TRUE_FALSE'">
              <n-radio-group v-model:value="form.tfAnswer">
                <n-radio :value="TRUE_FALSE_TRUE_ID">正确</n-radio>
                <n-radio :value="TRUE_FALSE_FALSE_ID">错误</n-radio>
              </n-radio-group>
            </template>
            <template v-else>
              <n-input
                v-model:value="form.answer"
                type="textarea"
                :placeholder="form.type === 'SHORT_ANSWER' ? '输入参考答案（批改时供评分人对照）' : '输入答案'"
                :rows="6"
              />
            </template>
          </n-form-item>

          <!-- 填空题：题干插入空位 + 每空可接受答案组（嵌入题干表单项下方） -->
          <template v-if="form.type === 'FILL_BLANK'">
            <n-form-item label="空位">
              <div class="w-full space-y-2">
                <div class="flex items-center gap-2">
                  <n-button size="small" type="primary" secondary @click="insertFillBlank">
                    插入空位
                  </n-button>
                  <span class="text-xs text-neutral-400">
                    在题干光标处插入 {{ fillBlankCount < FILL_MAX_BLANKS ? `【空${fillBlankCount + 1}】` : '' }}；上限 {{ FILL_MAX_BLANKS }} 个。要显示字面量「【空1】」时，在前面加 \\ 转义（\\【空1】）。
                  </span>
                </div>
                <div class="text-xs" :class="fillBlankValidation ? 'text-error-500' : 'text-neutral-400'">
                  <template v-if="fillBlankCount === 0">尚未插入空位（编辑器中先定位光标再点「插入空位」）</template>
                  <template v-else>已插入 {{ fillBlankCount }} 个空位<span v-if="fillBlankValidation"> · {{ fillBlankValidation }}</span></template>
                </div>
              </div>
            </n-form-item>

            <n-form-item label="每空可接受答案" path="answer">
              <div class="w-full space-y-3">
                <div
                  v-for="(group, gi) in fillAnswerGroups"
                  :key="gi"
                  class="border border-neutral-200 rounded-lg p-3 space-y-2"
                >
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold">空 {{ gi + 1 }}</span>
                    <n-switch
                      :value="group.length === 0"
                      size="small"
                      @update:value="(v: boolean) => toggleOpenBlank(gi, v)"
                    />
                    <span class="text-xs text-neutral-400">开放空（不设标准答案，交 AI 辅助评估）</span>
                  </div>
                  <template v-if="group.length > 0">
                    <div
                      v-for="(ans, ai) in group"
                      :key="ai"
                      class="flex items-center gap-2"
                    >
                      <n-input
                        :value="ans"
                        size="small"
                        class="flex-1"
                        placeholder="可接受答案（任一命中即该空正确）"
                        @update:value="(v: string) => { fillAnswerGroups[gi][ai] = v }"
                      />
                      <n-button
                        size="tiny"
                        quaternary
                        type="error"
                        :disabled="group.length <= 1"
                        @click="removeFillAnswer(gi, ai)"
                      >
                        删除
                      </n-button>
                    </div>
                    <n-button size="tiny" quaternary type="primary" @click="addFillAnswer(gi)">
                      添加同义答案（如 color / Color / colour）
                    </n-button>
                  </template>
                </div>
                <div class="text-xs text-neutral-400">
                  每空可配置多个可接受答案（同义/变体，任一命中即该空对）；答案按精确匹配判分（大小写敏感，忽略首尾与连续空白差异）。
                </div>
              </div>
            </n-form-item>
          </template>

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
    <TagManageModal v-model:show="showTagManage" :bank-id="bankId" @updated="loadTags" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import type { QuestionType, Difficulty, OptionItem } from '@/types'
import { createQuestion, updateQuestion, getQuestionDetail } from '@/api/question'
import type { UpdateQuestionParams, ProgrammingQuestionConfig } from '@/api/question'
import {
  parseOptionList,
  parseAnswerIds,
  formatAnswerIds,
  TRUE_FALSE_TRUE_ID,
  TRUE_FALSE_FALSE_ID,
  parseFillBlanks,
  parseFillAnswer,
  formatFillAnswerJson,
  validateFillQuestion,
  FILL_MAX_BLANKS
} from '@/utils/answer'
import { getProgrammingLanguages } from '@/api/judge'
import type { ProgrammingLanguage } from '@/api/judge'
import { getTagListByBankScope } from '@/api/tag'
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
  /** 选项纯文本数组（展示顺序即提交顺序，保存时重编号 id） */
  options: ['', ''] as string[],
  /** 选择题：已选 option_id（随选项增删自动重映射）；填空/简答：答案文本 */
  answerIds: [] as number[],
  /** 判断题：0=正确 / 1=错误 */
  tfAnswer: TRUE_FALSE_TRUE_ID as number,
  /** 填空题答案 / 简答题参考答案文本 */
  answer: '',
  analysis: '',
  difficulty: 'MEDIUM' as Difficulty,
  tagIds: [] as string[],
  status: 'DRAFT',
  /** 选项是否可乱序（仅选择题型；含"以上都是"类位置敏感选项时关闭） */
  optionsShufflable: true,
  /** 编程题配置（仅 type=PROGRAMMING 时非空） */
  programming: null as ProgrammingQuestionConfig | null
})

const isChoiceType = computed(() => form.type === 'SINGLE' || form.type === 'MULTIPLE')

// ==================== 填空题：插入空位 + 可接受答案组 ====================

/** 题干编辑器 ref：插入空位需读写光标位置（v-md-editor 实例） */
const contentEditorRef = ref<{ textareaEl?: HTMLTextAreaElement } | null>(null)

/** 题干当前空位编号序列 */
const fillBlankNos = computed(() => parseFillBlanks(form.content).blanks.map((b) => b.no))
const fillBlankCount = computed(() => fillBlankNos.value.length)

/** 每空可接受答案组（开放空=空数组）；与题干空位数联动 */
const fillAnswerGroups = ref<string[][]>([])

/** 题干空位与答案组数量/编号是否一致（即时校验提示，null=通过） */
const fillBlankValidation = computed(() => {
  if (form.type !== 'FILL_BLANK') return null
  const nos = fillBlankNos.value
  if (nos.length === 0) return null // 尚未插入空位不报错（保存时拦）
  for (let i = 0; i < nos.length; i++) {
    if (nos[i] !== i + 1) return `空位编号不连续（当前 ${nos.join('、')}，应为 1..${nos.length}）`
  }
  if (fillAnswerGroups.value.length !== nos.length) {
    return `答案组 ${fillAnswerGroups.value.length} 组与空位 ${nos.length} 个不一致`
  }
  return null
})

/**
 * 光标处插入【空N】（N=已有空位数+1）。
 * v-md-editor 未暴露 insertText 到模板 ref（Vue3 setup 拿 methods 不可靠），
 * 直接操作其内部 textarea 的 selectionStart/End，等价于 insert-text-at-cursor。
 */
async function insertFillBlank() {
  if (fillBlankCount.value >= FILL_MAX_BLANKS) {
    message.error(`空位数不能超过 ${FILL_MAX_BLANKS} 个`)
    return
  }
  const marker = `【空${fillBlankCount.value + 1}】`
  const ta = contentEditorRef.value?.textareaEl
  if (!ta) {
    // 编辑器未就绪（极端兜底）：追加到题干末尾
    form.content = form.content + marker
    return
  }
  const start = ta.selectionStart ?? form.content.length
  const end = ta.selectionEnd ?? start
  form.content = form.content.slice(0, start) + marker + form.content.slice(end)
  // 等编辑器同步 v-model 后恢复光标到插入标记之后
  await nextTick()
  const pos = start + marker.length
  ta.focus()
  ta.setSelectionRange(pos, pos)
}

/** 题干空位变化时同步答案组槽位数（保留已填内容） */
function syncFillAnswerGroups() {
  const n = fillBlankCount.value
  const groups = fillAnswerGroups.value
  if (groups.length < n) {
    groups.push(...Array.from({ length: n - groups.length }, () => [''] as string[]))
  } else if (groups.length > n) {
    groups.length = n
  }
}

watch(fillBlankCount, syncFillAnswerGroups)

function addFillAnswer(gi: number) {
  fillAnswerGroups.value[gi].push('')
}

function removeFillAnswer(gi: number, ai: number) {
  if (fillAnswerGroups.value[gi].length <= 1) return
  fillAnswerGroups.value[gi].splice(ai, 1)
}

/** 开放空开关：开=空数组（不设标准答案）；关=恢复一个空答案输入位 */
function toggleOpenBlank(gi: number, open: boolean) {
  fillAnswerGroups.value[gi] = open ? [] : ['']
}

/** 状态枚举由全局字典派生（表单不提供待审核选项） */
const statusOptions = QUESTION_STATUS_OPTIONS.filter((o) => o.value !== 'PENDING_REVIEW')

/** 答案下拉：value 为 option_id（展示顺序即保存后的 id 编号） */
const answerOptions = computed(() =>
  form.options.map((opt, i) => ({
    label: `${String.fromCharCode(65 + i)}. ${opt.substring(0, 30)}`,
    value: i
  }))
)

/** 动态校验规则：编程题无 answer 字段；填空题 answer 为结构化答案组（由 validateFillQuestion 校验），均不参与该文本必填校验 */
const rules = computed<FormRules>(() => {
  const base: FormRules = {
    type: [{ required: true, message: '请选择题型' }],
    content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
    difficulty: [{ required: true, message: '请选择难度' }],
    status: [{ required: true, message: '请选择状态' }]
  }
  if (form.type !== 'PROGRAMMING' && form.type !== 'FILL_BLANK') {
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
  form.answerIds = []
  form.tfAnswer = TRUE_FALSE_TRUE_ID
  form.answer = ''
  if (form.type === 'FILL_BLANK') {
    // 切到填空：按当前题干空位数初始化答案组（无空位则空数组，插入空位后自动补槽位）
    fillAnswerGroups.value = Array.from({ length: fillBlankCount.value }, () => [''] as string[])
  } else {
    fillAnswerGroups.value = []
  }
}

function addOption() {
  form.options.push('')
}

function removeOption(index: number) {
  if (form.options.length <= 2) return
  form.options.splice(index, 1)
  // 整题替换模型：删除选项后重映射答案引用，防止 id 漂移错位
  form.answerIds = form.answerIds
    .filter((id) => id !== index)
    .map((id) => (id > index ? id - 1 : id))
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
    // 标签作用域为单题库：只列出当前题库的标签，避免选到其他库的标签（后端会拒绝跨库关联）
    const res = await getTagListByBankScope(bankId)
    tagOptions.value = buildGroupedTagOptions(res.data || [])
  } catch {
    // ignore
  }
}

/** 详情接口运行时字段（Question 声明滞后，本地按后端 QuestionDetailResponse 建模，option_id 模型） */
interface QuestionDetailData {
  id: number
  bankId: number
  bankName?: string | null
  type: QuestionType
  difficulty: Difficulty
  content: string
  options?: string | OptionItem[] | null
  /** 选择题=id JSON 数组；填空/简答=文本；编程=null */
  answer?: string | null
  analysis?: string | null
  status: string
  tags?: { id: number; name: string }[]
  tagIds: string[]
  /** 选项是否可乱序（后端默认 true） */
  optionsShufflable?: boolean
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

/** 详情 options 收敛为 OptionItem[]（对象数组/JSON 字符串统一处理） */
function parseOptions(raw: string | OptionItem[] | null | undefined): OptionItem[] {
  return parseOptionList(raw)
}

/** 填空答案组回显：以已填组为基础补齐/截断到空位数（保留用户已录入内容） */
function form_fillRestore(groups: string[][], blankCount: number) {
  const restored = groups.map((g) => (g.length ? [...g] : ['']))
  while (restored.length < blankCount) restored.push([''])
  restored.length = blankCount
  fillAnswerGroups.value = restored
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
    form.options = parsed.length >= 2 ? parsed.map((o) => o.text) : ['', '']
    // 回显乱序开关（缺省 true 与后端默认一致）
    form.optionsShufflable = q.optionsShufflable ?? true
    // 回显答案：选择题按 id 还原选中项；填空/简答为文本；编程无答案
    if (q.type === 'SINGLE' || q.type === 'MULTIPLE') {
      form.answerIds = parseAnswerIds(q.answer)
      form.tfAnswer = TRUE_FALSE_TRUE_ID
      form.answer = ''
    } else if (q.type === 'TRUE_FALSE') {
      form.answerIds = []
      form.tfAnswer = parseAnswerIds(q.answer)[0] ?? TRUE_FALSE_TRUE_ID
      form.answer = ''
    } else if (q.type === 'FILL_BLANK') {
      form.answerIds = []
      form.tfAnswer = TRUE_FALSE_TRUE_ID
      form.answer = ''
      // 回显每空可接受答案组（旧格式容错由 parseFillAnswer 归一化）；空位不足处补空槽位
      const groups = parseFillAnswer(q.answer)
      const blankCount = parseFillBlanks(q.content).blanks.length
      form_fillRestore(groups, blankCount)
    } else {
      // 简答题：参考答案文本回显
      form.answerIds = []
      form.tfAnswer = TRUE_FALSE_TRUE_ID
      form.answer = q.answer || ''
    }
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

  // 填空题专项校验（与后端 FillAnswerUtil.validate 同门禁，即时反馈）：
  // 编号 1..N 连续、N≤10、答案组数=空位数、非开放空每组至少一个非空答案
  if (form.type === 'FILL_BLANK') {
    const err = validateFillQuestion(form.content, fillAnswerGroups.value)
    if (err) {
      message.error(err)
      return
    }
    for (let i = 0; i < fillAnswerGroups.value.length; i++) {
      const group = fillAnswerGroups.value[i]
      if (group.length > 0 && group.every((a) => a.trim() === '')) {
        message.error(`空 ${i + 1} 的可接受答案不能为空（开放空请打开「开放空」开关）`)
        return
      }
    }
  }

  saving.value = true
  try {
    // 整题替换模型：options 按当前展示顺序重编号 id（0..n-1），answer 与 options 成对原子提交
    const options = isChoiceType.value
      ? form.options.map((text, id) => ({ id, text: text.trim() }))
      : undefined
    let answer: string | undefined
    if (form.type === 'SINGLE') {
      answer = form.answerIds.length ? formatAnswerIds([form.answerIds[0]]) : undefined
    } else if (form.type === 'MULTIPLE') {
      answer = form.answerIds.length ? formatAnswerIds(form.answerIds) : undefined
    } else if (form.type === 'TRUE_FALSE') {
      answer = formatAnswerIds([form.tfAnswer])
    } else if (form.type === 'FILL_BLANK') {
      // 填空：物化为嵌套数组落库（开放空=[]），空位对齐【空N】顺序
      answer = formatFillAnswerJson(
        fillAnswerGroups.value.map((g) => g.map((a) => a.trim()).filter((a) => a !== ''))
      )
    } else {
      answer = form.answer || undefined
    }

    const payload: Record<string, unknown> = {
      type: form.type,
      content: form.content,
      options,
      answer,
      analysis: form.analysis || undefined,
      difficulty: form.difficulty,
      tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
      status: form.status,
      // 选择题型才下发乱序开关；其他题型由后端忽略
      optionsShufflable:
        form.type === 'SINGLE' || form.type === 'MULTIPLE' ? form.optionsShufflable : undefined
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
