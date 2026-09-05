<template>
  <div>
    <PageHeader
      :title="isEdit ? '编辑试卷' : '创建试卷'"
      subtitle="按 4 步完成组卷：基本信息 → 选题 → 设置分值 → 确认发布"
    />

    <n-steps :current="currentStep" class="mb-8">
      <n-step title="基本信息" />
      <n-step title="选题" />
      <n-step title="设置分值" />
      <n-step title="确认" />
    </n-steps>

    <n-spin :show="loading">
      <!-- 第一步：基本信息 -->
      <div v-show="currentStep === 0">
        <n-card title="基本信息">
          <n-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-placement="top"
            label-width="120"
          >
            <n-form-item label="标题" path="title">
              <n-input v-model:value="basicForm.title" placeholder="试卷标题" :maxlength="200" />
            </n-form-item>
            <n-form-item label="描述">
              <n-input v-model:value="basicForm.description" type="textarea" :rows="4" :maxlength="500" />
            </n-form-item>
            <n-grid :cols="2" :x-gap="16">
              <n-grid-item>
                <n-form-item label="时间限制（分钟）">
                  <n-input-number v-model:value="basicForm.timeLimit" :min="0" placeholder="不限时留空" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="作答次数限制">
                  <n-input-number v-model:value="basicForm.attemptLimit" :min="0" placeholder="不限次数留空" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="及格线（%）">
                  <n-input-number v-model:value="basicForm.passPercent" :min="1" :max="100" placeholder="默认 60" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="开始时间">
                  <n-date-picker v-model:value="basicForm.startTime" type="datetime" clearable />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="结束时间">
                  <n-date-picker v-model:value="basicForm.endTime" type="datetime" clearable />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="批改人">
                  <UserSearchSelect
                    ref="graderSelectRef"
                    v-model="basicForm.graderId"
                    placeholder="搜索用户（username / 昵称），留空默认自己"
                  />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="分享类型" path="shareType">
                  <n-select v-model:value="basicForm.shareType" :options="shareTypeOptions" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item v-if="basicForm.shareType === 'PASSWORD'">
                <n-form-item label="访问密码">
                  <n-input v-model:value="basicForm.password" type="password" placeholder="设置密码" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="防作弊">
                  <n-switch v-model:value="basicForm.cheatEnabled" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-form>
          <div class="flex justify-end">
            <n-button type="primary" @click="nextStep(0)">下一步</n-button>
          </div>
        </n-card>
      </div>

      <!-- 第二步：选题（双栏穿梭式选题器） -->
      <div v-show="currentStep === 1">
        <n-card title="选择题目">
          <template #header-extra>
            <span class="text-sm text-neutral-500">
              已选 <span class="text-primary font-bold">{{ selectedCount }}</span> 题
            </span>
          </template>

          <!-- 筛选栏 -->
          <FilterBar>
            <n-select
              v-model:value="filterBankId"
              :options="bankFilterOptions"
              placeholder="题库"
              style="width: 200px"
              @update:value="handleFilterChange"
            />
            <n-select
              v-model:value="filterType"
              :options="typeOptions"
              placeholder="题型"
              style="width: 110px"
              clearable
              @update:value="handleFilterChange"
            />
            <n-select
              v-model:value="filterDifficulty"
              :options="difficultyOptions"
              placeholder="难度"
              style="width: 100px"
              clearable
              @update:value="handleFilterChange"
            />
            <n-input
              v-model:value="searchKeyword"
              placeholder="搜索题干..."
              clearable
              style="width: 200px"
              @keyup.enter="handleFilterChange"
            >
              <template #prefix>
                <n-icon :component="SearchOutline" />
              </template>
            </n-input>
            <n-button @click="handleFilterChange">搜索</n-button>
            <n-button quaternary @click="resetFilters">重置</n-button>
          </FilterBar>

          <div class="flex flex-col lg:flex-row gap-4">
            <!-- 左：候选题目 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-3">
                <n-checkbox
                  :checked="allPageSelected"
                  :indeterminate="somePageSelected"
                  @update:checked="toggleSelectPage"
                >
                  全选本页
                </n-checkbox>
                <span class="text-xs text-neutral-400">
                  共 {{ pagination.itemCount }} 题可选（仅已发布题目）
                </span>
              </div>

              <SkeletonList v-if="questionsLoading" :count="5" :cols="1" />
              <EmptyState
                v-else-if="candidateList.length === 0"
                title="暂无题目"
                description="当前筛选条件下没有题目，试试调整筛选条件或关键词"
                :icon="DocumentTextOutline"
              />
              <div
                v-else
                class="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200 max-h-[480px] overflow-y-auto"
              >
                <div
                  v-for="q in candidateList"
                  :key="q.id"
                  class="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                  :class="isSelected(q.id) ? 'bg-primary-50/40' : ''"
                >
                  <n-checkbox
                    :checked="isSelected(q.id)"
                    class="mt-1 flex-shrink-0"
                    @update:checked="(v: boolean) => toggleSelect(q, v)"
                  />
                  <div class="flex-1 min-w-0">
                    <div
                      class="text-sm text-neutral-900 line-clamp-1 cursor-pointer"
                      @click="openPreview(q)"
                    >
                      {{ stripHtml(q.content) }}
                    </div>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <n-tag size="small" round :type="typeTagType(q.type)">{{ typeLabel(q.type) }}</n-tag>
                      <n-tag size="small" round :type="difficultyTagType(q.difficulty)">
                        {{ difficultyLabel(q.difficulty) }}
                      </n-tag>
                      <span v-if="q.bankName" class="text-xs text-neutral-400">{{ q.bankName }}</span>
                    </div>
                  </div>
                  <n-button size="tiny" quaternary type="primary" class="flex-shrink-0" @click="openPreview(q)">
                    预览
                  </n-button>
                </div>
              </div>

              <div v-if="pagination.itemCount > 0" class="flex justify-end mt-3">
                <n-pagination
                  :page="pagination.page"
                  :item-count="pagination.itemCount"
                  :page-size="pagination.pageSize"
                  :page-sizes="[10, 20, 50]"
                  show-size-picker
                  @update:page="handlePageChange"
                  @update:page-size="handlePageSizeChange"
                />
              </div>
            </div>

            <!-- 右：已选清单 -->
            <div class="w-full lg:w-[300px] flex-shrink-0 bg-white border border-neutral-200 rounded-lg flex flex-col">
              <div class="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <span class="text-sm font-medium">已选题目</span>
                <n-button
                  v-if="selectedCount > 0"
                  size="tiny"
                  quaternary
                  type="error"
                  @click="clearSelection"
                >
                  清空
                </n-button>
              </div>
              <div class="flex-1 overflow-y-auto max-h-[480px] min-h-[160px]">
                <EmptyState
                  v-if="selectedCount === 0"
                  title="尚未选题"
                  description="从左侧勾选题目加入试卷"
                />
                <div
                  v-for="(q, index) in selectedList"
                  :key="q.id"
                  class="flex items-center gap-2 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  <span class="text-xs text-neutral-400 w-5 text-right flex-shrink-0">{{ index + 1 }}</span>
                  <div
                    class="flex-1 min-w-0 text-xs text-neutral-800 line-clamp-1 cursor-pointer hover:text-primary"
                    @click="openPreview(q)"
                  >
                    {{ stripHtml(q.content) }}
                  </div>
                  <n-button
                    size="tiny"
                    quaternary
                    type="error"
                    class="flex-shrink-0"
                    @click="removeSelected(q.id)"
                  >
                    移除
                  </n-button>
                </div>
              </div>
              <div class="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500">
                共 <span class="text-primary font-bold">{{ selectedCount }}</span> 题，分值在下一步统一设置
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-4">
            <n-button @click="currentStep--">上一步</n-button>
            <n-button type="primary" :disabled="selectedCount === 0" @click="nextStep(1)">
              下一步（已选 {{ selectedCount }} 题）
            </n-button>
          </div>
        </n-card>
      </div>

      <!-- 第三步：设置分值 -->
      <div v-show="currentStep === 2">
        <n-card title="设置分值">
          <div class="space-y-3">
            <div
              v-for="(q, index) in scoredQuestions"
              :key="q.id"
              class="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent="onDragOver(index)"
              @drop="onDrop"
            >
              <n-icon size="18" class="cursor-move text-neutral-400">
                <ReorderTwoOutline />
              </n-icon>
              <span class="text-sm text-neutral-500 w-6">#{{ index + 1 }}</span>
              <span class="flex-1 truncate text-sm">{{ stripHtml(q.content).substring(0, 60) }}</span>
              <n-input-number
                v-model:value="q.score"
                :min="0"
                :step="1"
                style="width: 100px"
                placeholder="分值"
              />
            </div>
          </div>
          <div class="text-right mt-4 text-lg font-bold">
            总分：{{ totalScore }}
          </div>
          <div class="flex justify-between mt-4">
            <n-button @click="currentStep--">上一步</n-button>
            <n-button type="primary" @click="nextStep(2)">下一步</n-button>
          </div>
        </n-card>
      </div>

      <!-- 第四步：确认 -->
      <div v-show="currentStep === 3">
        <n-card title="确认信息">
          <n-descriptions :column="2" bordered class="mb-4">
            <n-descriptions-item label="标题">{{ basicForm.title }}</n-descriptions-item>
            <n-descriptions-item label="题目数">{{ scoredQuestions.length }}</n-descriptions-item>
            <n-descriptions-item label="总分">{{ totalScore }}</n-descriptions-item>
            <n-descriptions-item label="分享类型">{{ shareTypeLabels[basicForm.shareType] }}</n-descriptions-item>
            <n-descriptions-item label="时间限制">{{ basicForm.timeLimit ? basicForm.timeLimit + '分钟' : '不限' }}</n-descriptions-item>
            <n-descriptions-item label="防作弊">{{ basicForm.cheatEnabled ? '开启' : '关闭' }}</n-descriptions-item>
            <n-descriptions-item label="批改人">{{ graderLabel || '默认（创建者本人）' }}</n-descriptions-item>
          </n-descriptions>

          <n-card title="题目列表" size="small">
            <n-list>
              <n-list-item v-for="(q, index) in scoredQuestions" :key="q.id">
                <span class="text-sm">#{{ index + 1 }} {{ stripHtml(q.content).substring(0, 80) }}</span>
                <template #suffix>
                  <span class="text-primary font-bold">{{ q.score }} 分</span>
                </template>
              </n-list-item>
            </n-list>
          </n-card>

          <div class="flex justify-between mt-4">
            <n-button @click="currentStep--">上一步</n-button>
            <n-button type="primary" :loading="saving" @click="handleSave">
              {{ isEdit ? '保存修改' : '创建试卷' }}
            </n-button>
          </div>
        </n-card>
      </div>
    </n-spin>

    <!-- 题目预览抽屉 -->
    <QuestionPreviewDrawer v-model:show="previewShow" :question="previewQuestion" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { createPaper, updatePaper, getPaperDetail } from '@/api/paper'
import { getBankList } from '@/api/bank'
import { getAllQuestions } from '@/api/question'
import { QUESTION_TYPE_MAP, QUESTION_TYPE_OPTIONS, DIFFICULTY_MAP, DIFFICULTY_OPTIONS } from '@/utils/constants'
import type { Question, QuestionType, Difficulty } from '@/types'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import UserSearchSelect from '@/components/common/UserSearchSelect.vue'
import QuestionPreviewDrawer, { type PreviewQuestion } from '@/components/common/QuestionPreviewDrawer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { ReorderTwoOutline, SearchOutline, DocumentTextOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { confirmDanger } = useConfirm()

const paperId = route.params.id ? (route.params.id as string) : null
const isEdit = computed(() => !!paperId)

const currentStep = ref(0)
const loading = ref(false)
const saving = ref(false)
const questionsLoading = ref(false)
const basicFormRef = ref(null)
const graderSelectRef = ref<InstanceType<typeof UserSearchSelect> | null>(null)

const basicForm = reactive({
  title: '',
  description: '',
  timeLimit: null as number | null,
  startTime: null as number | null,
  endTime: null as number | null,
  attemptLimit: null as number | null,
  passPercent: 60 as number | null,
  graderId: null as number | null,
  shareType: 'PRIVATE',
  password: '',
  cheatEnabled: false
})

const basicRules = {
  title: [{ required: true, message: '请输入试卷标题', trigger: 'blur' }],
  shareType: [{ required: true, message: '请选择分享类型' }]
}

const shareTypeOptions = [
  { label: '私有', value: 'PRIVATE' },
  { label: '链接分享', value: 'LINK' },
  { label: '密码访问', value: 'PASSWORD' },
  { label: '公开', value: 'PUBLIC' }
]

const shareTypeLabels: Record<string, string> = {
  PRIVATE: '私有', LINK: '链接分享', PASSWORD: '密码访问', PUBLIC: '公开'
}

// ===== 选题（第二步）=====
/** 题库筛选哨兵值：0 = 全部题库（我可见的公开/官方/自己的题库） */
const ALL_BANKS = 0
const filterBankId = ref<number>(ALL_BANKS)
const filterType = ref<QuestionType | null>(null)
const filterDifficulty = ref<Difficulty | null>(null)
const searchKeyword = ref('')
const candidateList = ref<Question[]>([])
const pagination = reactive({ page: 1, pageSize: 20, itemCount: 0 })

/** 已选题目（跨题库、跨分页累积），进入第三步的唯一数据源 */
interface SelectedQuestion extends PreviewQuestion {
  score?: number
}
const selectedMap = ref(new Map<number, SelectedQuestion>())
const selectedList = computed(() => Array.from(selectedMap.value.values()))
const selectedCount = computed(() => selectedMap.value.size)

const scoredQuestions = ref<SelectedQuestion[]>([])

const previewShow = ref(false)
const previewQuestion = ref<PreviewQuestion | null>(null)

// 选项统一取自 @/utils/constants（全站唯一字典）
const typeOptions = QUESTION_TYPE_OPTIONS
const difficultyOptions = DIFFICULTY_OPTIONS

const bankOptions = ref<{ label: string; value: number }[]>([])
const bankFilterOptions = computed(() => [
  { label: '全部题库', value: ALL_BANKS },
  ...bankOptions.value
])

const totalScore = computed(() =>
  scoredQuestions.value.reduce((sum, q) => sum + (q.score || 0), 0)
)

/** 确认页展示的批改人名称（预置或搜索选中的 label） */
const graderLabel = computed(() => graderSelectRef.value?.currentLabel ?? null)

const dragItemIndex = ref<number | null>(null)

type TagColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const TYPE_TAG: Record<string, TagColor> = {
  SINGLE: 'info',
  MULTIPLE: 'warning',
  TRUE_FALSE: 'success',
  FILL_BLANK: 'default',
  SHORT_ANSWER: 'primary'
}

const DIFFICULTY_TAG: Record<string, TagColor> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'error'
}

function typeLabel(type?: string | null): string {
  return (type && QUESTION_TYPE_MAP[type as QuestionType]) || type || '-'
}

function typeTagType(type?: string | null): TagColor {
  return (type && TYPE_TAG[type]) || 'default'
}

function difficultyLabel(difficulty?: string | null): string {
  return (difficulty && DIFFICULTY_MAP[difficulty as Difficulty]) || difficulty || '-'
}

function difficultyTagType(difficulty?: string | null): TagColor {
  return (difficulty && DIFFICULTY_TAG[difficulty]) || 'default'
}

function stripHtml(html?: string | null): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').trim()
}

async function loadBanks() {
  try {
    const res = await getBankList({ page: 1, size: 200 })
    bankOptions.value = (res.data.records || []).map((b: any) => ({ label: b.name, value: b.id }))
  } catch {
    // ignore
  }
}

/** 服务端分页 + 筛选加载候选题目（统一走 /questions，仅返回我可见题库的已发布题目） */
async function fetchCandidates() {
  questionsLoading.value = true
  try {
    const res = await getAllQuestions({
      page: pagination.page,
      size: pagination.pageSize,
      bankId: filterBankId.value !== ALL_BANKS ? filterBankId.value : undefined,
      type: filterType.value ?? undefined,
      difficulty: filterDifficulty.value ?? undefined,
      keyword: searchKeyword.value.trim() || undefined,
      status: 'PUBLISHED'
    })
    candidateList.value = res.data.records || []
    pagination.itemCount = res.data.total || 0
  } catch {
    message.error('加载题目失败')
  } finally {
    questionsLoading.value = false
  }
}

function handleFilterChange() {
  pagination.page = 1
  fetchCandidates()
}

function resetFilters() {
  filterBankId.value = ALL_BANKS
  filterType.value = null
  filterDifficulty.value = null
  searchKeyword.value = ''
  handleFilterChange()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchCandidates()
}

function handlePageSizeChange(size: number) {
  pagination.pageSize = size
  pagination.page = 1
  fetchCandidates()
}

function isSelected(id: number): boolean {
  return selectedMap.value.has(id)
}

function toggleSelect(q: Question, checked: boolean) {
  if (checked) {
    selectedMap.value.set(q.id, q)
  } else {
    selectedMap.value.delete(q.id)
  }
}

const allPageSelected = computed(
  () => candidateList.value.length > 0 && candidateList.value.every((q) => selectedMap.value.has(q.id))
)

const somePageSelected = computed(
  () => candidateList.value.some((q) => selectedMap.value.has(q.id)) && !allPageSelected.value
)

function toggleSelectPage(checked: boolean) {
  for (const q of candidateList.value) {
    if (checked) {
      selectedMap.value.set(q.id, q)
    } else {
      selectedMap.value.delete(q.id)
    }
  }
}

function removeSelected(id: number) {
  selectedMap.value.delete(id)
}

function clearSelection() {
  confirmDanger({
    title: '清空已选题目',
    content: `确定要移除已选的 ${selectedCount.value} 道题目吗？`,
    positiveText: '清空',
    onPositiveClick: () => {
      selectedMap.value.clear()
    }
  })
}

function openPreview(q: PreviewQuestion) {
  previewQuestion.value = q
  previewShow.value = true
}

async function loadPaper() {
  if (!paperId) return
  loading.value = true
  try {
    const res = await getPaperDetail(paperId)
    const data = res.data
    basicForm.title = data.title
    basicForm.description = data.description || ''
    basicForm.timeLimit = data.timeLimit ?? null
    basicForm.startTime = data.startTime ? new Date(data.startTime).getTime() : null
    basicForm.endTime = data.endTime ? new Date(data.endTime).getTime() : null
    basicForm.attemptLimit = data.attemptLimit ?? null
    basicForm.passPercent = data.passPercent ?? 60
    basicForm.shareType = data.shareType || 'PRIVATE'
    basicForm.cheatEnabled = data.cheatEnabled || false
    // 回填批改人：详情接口返回 graderName，直接预置选项，无需用户重新搜索
    if (data.graderId != null) {
      basicForm.graderId = data.graderId
      graderSelectRef.value?.preset(data.graderId, data.graderName || `用户 ${data.graderId}`)
    }
    if (data.questions) {
      const questions = data.questions
        .slice()
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((q: any) => ({ ...q, score: q.score || 0 }) as SelectedQuestion)
      scoredQuestions.value = questions
      // 同步进已选集合，编辑时可继续增删题目
      for (const q of questions) {
        selectedMap.value.set(q.id, q)
      }
    }
  } catch {
    message.error('加载试卷失败')
  } finally {
    loading.value = false
  }
}

/**
 * 以已选集合重建 scoredQuestions：
 * 保留第三步已排定的顺序与分值，新勾选的题目按选择顺序追加（默认 5 分），
 * 被移除的题目自然剔除 —— 修复旧实现「跨题库选题丢题 / 编辑模式无法增删题目」的问题。
 */
function syncScoredQuestions() {
  const kept = scoredQuestions.value.filter((q) => selectedMap.value.has(q.id))
  const keptIds = new Set(kept.map((q) => q.id))
  const added = selectedList.value
    .filter((q) => !keptIds.has(q.id))
    .map((q) => ({ ...q, score: 5 }))
  scoredQuestions.value = [...kept, ...added]
}

function nextStep(step: number) {
  if (step === 0) {
    if (!basicForm.title) {
      message.warning('请填写试卷标题')
      return
    }
  }
  if (step === 1) {
    if (selectedCount.value === 0) {
      message.warning('请至少选择一道题目')
      return
    }
    syncScoredQuestions()
  }
  currentStep.value = step + 1
}

function onDragStart(index: number) {
  dragItemIndex.value = index
}

function onDragOver(index: number) {
  if (dragItemIndex.value === null || dragItemIndex.value === index) return
  const item = scoredQuestions.value.splice(dragItemIndex.value, 1)[0]
  scoredQuestions.value.splice(index, 0, item)
  dragItemIndex.value = index
}

function onDrop() {
  dragItemIndex.value = null
}

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      title: basicForm.title,
      description: basicForm.description || undefined,
      timeLimit: basicForm.timeLimit || undefined,
      startTime: basicForm.startTime ? new Date(basicForm.startTime).toISOString() : undefined,
      endTime: basicForm.endTime ? new Date(basicForm.endTime).toISOString() : undefined,
      attemptLimit: basicForm.attemptLimit || undefined,
      passPercent: basicForm.passPercent ?? 60,
      // 由次数推导类型，避免后端默认值与"留空=不限次数"的表单语义冲突
      attemptType: !basicForm.attemptLimit || basicForm.attemptLimit <= 0
        ? 'UNLIMITED'
        : basicForm.attemptLimit === 1 ? 'ONCE' : 'MULTIPLE',
      shareType: basicForm.shareType,
      password: basicForm.password || undefined,
      cheatEnabled: basicForm.cheatEnabled,
      // 批改人：留空交由后端默认为创建者本人
      graderId: basicForm.graderId ?? undefined,
      questionItems: scoredQuestions.value.map((q, i) => ({
        questionId: q.id,
        score: q.score || 0,
        sortOrder: i
      }))
    }

    if (isEdit.value) {
      await updatePaper(paperId!, payload)
      message.success('保存成功')
    } else {
      await createPaper(payload)
      message.success('创建成功')
    }
    router.push('/papers')
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadBanks()
  fetchCandidates()
  if (isEdit.value) loadPaper()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
