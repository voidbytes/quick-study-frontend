<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ isEdit ? '编辑试卷' : '创建试卷' }}</h1>

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
              <n-input v-model:value="basicForm.description" type="textarea" :rows="3" :maxlength="500" />
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
                  <n-input v-model:value="basicForm.graderId" placeholder="用户ID，默认自己" />
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

      <!-- 第二步：选题 -->
      <div v-show="currentStep === 1">
        <n-card title="选择题库和题目">
          <div class="mb-4">
            <n-select
              v-model:value="selectedBankId"
              :options="bankOptions"
              placeholder="选择题库"
              filterable
              @update:value="loadBankQuestions"
            />
          </div>
          <n-data-table
            :columns="questionColumns"
            :data="bankQuestions"
            :loading="questionsLoading"
            :row-key="(row: any) => row.id"
            v-model:checked-row-keys="selectedQuestionIds"
          />
          <div class="flex justify-between mt-4">
            <n-button @click="currentStep--">上一步</n-button>
            <n-button type="primary" @click="nextStep(1)">下一步（已选 {{ selectedQuestionIds.length }} 题）</n-button>
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
              class="flex items-center gap-3 p-3 bg-gray-50 rounded"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent="onDragOver(index)"
              @drop="onDrop"
            >
              <n-icon size="18" class="cursor-move text-gray-400">
                <ReorderTwoOutline />
              </n-icon>
              <span class="text-sm text-gray-500 w-6">#{{ index + 1 }}</span>
              <span class="flex-1 truncate text-sm">{{ q.content?.replace(/<[^>]+>/g, '').substring(0, 60) }}</span>
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
          </n-descriptions>

          <n-card title="题目列表" size="small">
            <n-list>
              <n-list-item v-for="(q, index) in scoredQuestions" :key="q.id">
                <span class="text-sm">#{{ index + 1 }} {{ q.content?.replace(/<[^>]+>/g, '').substring(0, 80) }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { createPaper, updatePaper, getPaperDetail } from '@/api/paper'
import { getBankList } from '@/api/bank'
import { getQuestionList } from '@/api/question'
import { ReorderTwoOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const paperId = route.params.paperId ? Number(route.params.paperId) : null
const isEdit = computed(() => !!paperId)

const currentStep = ref(0)
const loading = ref(false)
const saving = ref(false)
const questionsLoading = ref(false)
const basicFormRef = ref(null)

const basicForm = reactive({
  title: '',
  description: '',
  timeLimit: null as number | null,
  startTime: null as number | null,
  endTime: null as number | null,
  attemptLimit: null as number | null,
  graderId: '',
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

// 题库选择
const bankOptions = ref<{ label: string; value: number }[]>([])
const selectedBankId = ref<number | null>(null)
const bankQuestions = ref<any[]>([])
const selectedQuestionIds = ref<number[]>([])
const scoredQuestions = ref<any[]>([])

const questionColumns = [
  { type: 'selection' as const, width: 40 },
  { title: '题干', key: 'content', ellipsis: { tooltip: true } },
  { title: '题型', key: 'type', width: 80,
    render(row: any) {
      const labels: Record<number, string> = { 0: '单选', 1: '多选', 2: '判断', 3: '填空', 4: '简答' }
      return labels[row.type] || '-'
    }
  },
  { title: '难度', key: 'difficulty', width: 70 }
]

const totalScore = computed(() =>
  scoredQuestions.value.reduce((sum, q) => sum + (q.score || 0), 0)
)

const dragItemIndex = ref<number | null>(null)

async function loadBanks() {
  try {
    const res = await getBankList({ page: 1, size: 200 })
    bankOptions.value = (res.data.records || []).map((b: any) => ({ label: b.name, value: b.id }))
  } catch {
    // ignore
  }
}

async function loadBankQuestions() {
  if (!selectedBankId.value) return
  questionsLoading.value = true
  try {
    const res = await getQuestionList(selectedBankId.value, { page: 1, size: 200 })
    bankQuestions.value = (res.data.records || []).filter((q: any) => q.status === 'PUBLISHED')
  } catch {
    message.error('加载题目失败')
  } finally {
    questionsLoading.value = false
  }
}

async function loadPaper() {
  if (!paperId) return
  loading.value = true
  try {
    const res = await getPaperDetail(paperId)
    basicForm.title = res.title
    basicForm.description = res.description || ''
    basicForm.timeLimit = res.timeLimit
    basicForm.startTime = res.startTime ? new Date(res.startTime).getTime() : null
    basicForm.endTime = res.endTime ? new Date(res.endTime).getTime() : null
    basicForm.attemptLimit = res.attemptLimit
    basicForm.shareType = res.shareType || 'PRIVATE'
    basicForm.cheatEnabled = res.cheatEnabled || false
    if (res.questions) {
      scoredQuestions.value = res.questions.map((q: any) => ({ ...q, score: q.score || 0 }))
    }
  } catch {
    message.error('加载试卷失败')
  } finally {
    loading.value = false
  }
}

function nextStep(step: number) {
  if (step === 0) {
    if (!basicForm.title) {
      message.warning('请填写试卷标题')
      return
    }
  }
  if (step === 1) {
    // 从选题进入设置分值
    if (scoredQuestions.value.length === 0 && selectedQuestionIds.value.length > 0) {
      scoredQuestions.value = bankQuestions.value
        .filter((q: any) => selectedQuestionIds.value.includes(q.id))
        .map((q: any) => ({ ...q, score: 5 }))
    }
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
      shareType: basicForm.shareType,
      password: basicForm.password || undefined,
      cheatEnabled: basicForm.cheatEnabled,
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
  if (isEdit.value) loadPaper()
})
</script>