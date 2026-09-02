<template>
  <div class="p-6 max-w-4xl mx-auto">
    <n-button quaternary @click="router.back()" class="mb-4">
      ← 返回
    </n-button>

    <n-spin v-if="!loadError" :show="loading">
      <n-card>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl font-bold">题目详情</span>
              <n-tag :type="typeColor" size="small">{{ typeLabel }}</n-tag>
              <n-tag :type="difficultyColor" size="small">{{ difficultyLabel }}</n-tag>
              <n-tag v-if="question?.status === 'PUBLISHED'" type="success" size="small">已发布</n-tag>
              <n-tag v-else-if="question?.status === 'DRAFT'" size="small">草稿</n-tag>
            </div>
            <n-button v-if="authStore.isAdmin" type="primary" size="small" @click="router.push(`/banks/${bankId}/questions/${questionId}/edit`)">
              编辑
            </n-button>
          </div>
        </template>

        <div class="space-y-6">
          <!-- 所属题库 -->
          <div class="text-sm text-gray-500">
            所属题库：
            <a
              v-if="question?.bankName"
              class="text-primary cursor-pointer hover:underline"
              @click="router.push(`/banks/${bankId}`)"
            >{{ question.bankName }}</a>
            <span v-else>未知</span>
          </div>

          <!-- 题干 -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">题干</h3>
            <div class="prose prose-sm max-w-none" v-html="question?.content || ''" />
          </div>

          <!-- 选项（单选/多选） -->
          <div v-if="showOptions">
            <h3 class="text-sm font-medium text-gray-500 mb-2">选项</h3>
            <div class="space-y-2">
              <div
                v-for="(opt, index) in parsedOptions"
                :key="index"
                class="flex items-center gap-3 p-3 rounded border"
                :class="{ 'border-green-500 bg-green-50': isCorrectOption(opt) }"
              >
                <span class="font-mono text-sm font-bold w-6">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="flex-1" v-html="opt" />
                <n-icon v-if="isCorrectOption(opt)" color="#18a058" size="18">
                  <CheckmarkOutline />
                </n-icon>
              </div>
            </div>
          </div>

          <!-- 判断题 -->
          <div v-if="question?.type === 'TRUE_FALSE'">
            <h3 class="text-sm font-medium text-gray-500 mb-2">正确答案</h3>
            <n-tag :type="question?.answer === 'true' ? 'success' : 'error'">
              {{ question?.answer === 'true' ? '正确' : '错误' }}
            </n-tag>
          </div>

          <!-- 答案 -->
          <div v-if="question?.answer && question?.type !== 'TRUE_FALSE'">
            <h3 class="text-sm font-medium text-gray-500 mb-2">正确答案</h3>
            <div class="p-3 rounded bg-blue-50 border border-blue-200">
              <div v-if="question?.type === 'SINGLE'" class="text-sm">
                {{ answerLabel }}
              </div>
              <div v-else-if="question?.type === 'MULTIPLE'" class="text-sm">
                {{ answerLabel }}
              </div>
              <div v-else class="prose prose-sm max-w-none" v-html="question?.answer" />
            </div>
          </div>

          <!-- 参考答案 -->
          <div v-if="question?.referenceAnswer">
            <h3 class="text-sm font-medium text-gray-500 mb-2">参考答案</h3>
            <div class="p-3 rounded bg-gray-50 border prose prose-sm max-w-none" v-html="question?.referenceAnswer" />
          </div>

          <!-- 解析 -->
          <div v-if="question?.analysis">
            <h3 class="text-sm font-medium text-gray-500 mb-2">解析</h3>
            <div class="p-3 rounded bg-yellow-50 border border-yellow-200 prose prose-sm max-w-none" v-html="question?.analysis" />
          </div>

          <!-- 标签 -->
          <div v-if="question?.tags && question.tags.length > 0">
            <h3 class="text-sm font-medium text-gray-500 mb-2">标签</h3>
            <div class="flex gap-1 flex-wrap">
              <n-tag v-for="tag in question.tags" :key="tag.id" size="small">
                {{ tag.name }}
              </n-tag>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="text-xs text-gray-400 border-t pt-4">
            <span>创建时间：{{ formatTime(question?.createdAt) }}</span>
            <span v-if="question?.updatedAt" class="ml-4">更新时间：{{ formatTime(question?.updatedAt) }}</span>
          </div>
        </div>
      </n-card>
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getQuestionDetail } from '@/api/question'
import { useAuthStore } from '@/stores/auth'
import { CheckmarkOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'
import LoadError from '@/components/LoadError.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const bankId = route.params.bankId as string
const questionId = route.params.questionId as string

const loading = ref(false)
const loadError = ref('')
const question = ref<any>(null)

const typeLabels: Record<string, string> = {
  SINGLE: '单选题', MULTIPLE: '多选题', TRUE_FALSE: '判断题',
  FILL_BLANK: '填空题', SHORT_ANSWER: '简答题'
}
const typeColors: Record<string, string> = {
  SINGLE: 'primary', MULTIPLE: 'primary', TRUE_FALSE: 'warning',
  FILL_BLANK: 'info', SHORT_ANSWER: 'default'
}
const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }
const difficultyColors: Record<string, string> = { EASY: 'success', MEDIUM: 'warning', HARD: 'error' }

const typeLabel = computed(() => typeLabels[question.value?.type] || '-')
const typeColor = computed(() => typeColors[question.value?.type] || 'default')
const difficultyLabel = computed(() => difficultyLabels[question.value?.difficulty] || '-')
const difficultyColor = computed(() => difficultyColors[question.value?.difficulty] || 'default')

const showOptions = computed(() => question.value?.type === 'SINGLE' || question.value?.type === 'MULTIPLE')

const parsedOptions = computed(() => {
  if (!question.value?.options) return []
  if (typeof question.value.options === 'string') {
    try {
      return JSON.parse(question.value.options)
    } catch {
      return []
    }
  }
  if (Array.isArray(question.value.options)) {
    return question.value.options
  }
  return []
})

const isCorrectOption = (opt: string) => {
  if (!question.value?.answer) return false
  const answer = question.value.answer
  if (question.value.type === 'SINGLE') {
    // For single choice, answer is a letter like "A", "B"
    const idx = parsedOptions.value.indexOf(opt)
    if (idx >= 0) {
      return answer === String.fromCharCode(65 + idx)
    }
  }
  if (question.value.type === 'MULTIPLE') {
    const answers = answer.split(',')
    const idx = parsedOptions.value.indexOf(opt)
    if (idx >= 0) {
      return answers.includes(String.fromCharCode(65 + idx))
    }
  }
  return false
}

const answerLabel = computed(() => {
  if (!question.value?.answer) return ''
  if (question.value.type === 'SINGLE') {
    const idx = question.value.answer.charCodeAt(0) - 65
    if (idx >= 0 && idx < parsedOptions.value.length) {
      return `${question.value.answer}. ${parsedOptions.value[idx]}`
    }
    return question.value.answer
  }
  if (question.value.type === 'MULTIPLE') {
    const answers = question.value.answer.split(',')
    return answers.map((a: string) => {
      const idx = a.trim().charCodeAt(0) - 65
      if (idx >= 0 && idx < parsedOptions.value.length) {
        return `${a.trim()}. ${parsedOptions.value[idx]}`
      }
      return a.trim()
    }).join('；')
  }
  return question.value.answer
})

function formatTime(time: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

async function fetchDetail() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getQuestionDetail(questionId)
    question.value = res.data
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || err?.message || '加载题目详情失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>