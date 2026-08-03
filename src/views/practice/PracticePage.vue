<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 结果展示 -->
      <template v-if="result">
        <n-card>
          <template #header>
            <span class="text-xl font-bold">练习结果</span>
          </template>
          <n-grid :cols="3" :x-gap="16" class="mb-6">
            <n-grid-item>
              <n-statistic label="正确率">
                <template #default>
                  <span class="text-2xl text-success">{{ (result.accuracy * 100).toFixed(1) }}%</span>
                </template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="正确数" :value="result.correctCount" />
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="用时" :value="result.duration + '秒'" />
            </n-grid-item>
          </n-grid>

          <n-collapse>
            <n-collapse-item
              v-for="(q, index) in questions"
              :key="q.questionIndex"
              :title="`第 ${index + 1} 题`"
              :name="String(index)"
            >
              <div class="mb-4" v-html="q.content" />
              <n-descriptions :column="2" bordered size="small">
                <n-descriptions-item label="你的答案">
                  <span :class="q.isCorrect ? 'text-success' : 'text-error'">
                    {{ q.userAnswer || '未作答' }}
                  </span>
                </n-descriptions-item>
                <n-descriptions-item label="正确答案">
                  <span>{{ q.correctAnswer }}</span>
                </n-descriptions-item>
                <n-descriptions-item label="是否正确">
                  <n-tag :type="q.isCorrect ? 'success' : 'error'" size="small">
                    {{ q.isCorrect ? '正确' : '错误' }}
                  </n-tag>
                </n-descriptions-item>
              </n-descriptions>
              <div v-if="q.analysis" class="mt-3">
                <span class="font-bold">解析：</span>
                <span v-html="q.analysis" />
              </div>
            </n-collapse-item>
          </n-collapse>

          <div class="flex justify-center mt-6">
            <n-button @click="router.push('/practice')">返回列表</n-button>
          </div>
        </n-card>
      </template>

      <!-- 作答模式 -->
      <template v-else>
        <n-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">
                第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题
              </span>
              <n-tag :type="difficultyTagType(currentQuestion?.difficulty)" size="small">
                {{ difficultyLabels[currentQuestion?.difficulty] || '未知' }}
              </n-tag>
            </div>
          </template>

          <div class="mb-6" v-html="currentQuestion?.content" />

          <div class="space-y-3">
            <template v-if="currentQuestion?.type === 0">
              <div
                v-for="(opt, idx) in currentQuestion.options"
                :key="idx"
                class="p-3 border rounded cursor-pointer hover:border-primary"
                :class="{
                  'border-primary bg-primary bg-opacity-5': selectedAnswer === String.fromCharCode(65 + idx),
                  'border-success bg-success bg-opacity-5': answered && correctAnswer === String.fromCharCode(65 + idx),
                  'border-error bg-error bg-opacity-5': answered && selectedAnswer === String.fromCharCode(65 + idx) && !isCurrentCorrect
                }"
                @click="selectAnswer(String.fromCharCode(65 + idx))"
              >
                <n-radio :checked="selectedAnswer === String.fromCharCode(65 + idx)" :disabled="answered">
                  <span class="font-mono mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
                  {{ opt }}
                </n-radio>
              </div>
            </template>

            <template v-if="currentQuestion?.type === 1">
              <div
                v-for="(opt, idx) in currentQuestion.options"
                :key="idx"
                class="p-3 border rounded cursor-pointer hover:border-primary"
                :class="{
                  'border-primary bg-primary bg-opacity-5': multipleSelected.includes(String.fromCharCode(65 + idx)),
                  'border-success': answered && correctAnswer.includes(String.fromCharCode(65 + idx)),
                  'border-error': answered && multipleSelected.includes(String.fromCharCode(65 + idx)) && !correctAnswer.includes(String.fromCharCode(65 + idx))
                }"
                @click="toggleMultiple(String.fromCharCode(65 + idx))"
              >
                <n-checkbox :checked="multipleSelected.includes(String.fromCharCode(65 + idx))" :disabled="answered">
                  <span class="font-mono mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
                  {{ opt }}
                </n-checkbox>
              </div>
            </template>

            <template v-if="currentQuestion?.type === 2">
              <div class="flex gap-4">
                <div
                  class="flex-1 p-3 border rounded text-center cursor-pointer"
                  :class="{
                    'border-primary bg-primary bg-opacity-5': selectedAnswer === 'true',
                    'border-success bg-success bg-opacity-5': answered && correctAnswer === 'true',
                    'border-error': answered && selectedAnswer === 'true' && !isCurrentCorrect
                  }"
                  @click="selectAnswer('true')"
                >
                  <n-radio :checked="selectedAnswer === 'true'" :disabled="answered">正确</n-radio>
                </div>
                <div
                  class="flex-1 p-3 border rounded text-center cursor-pointer"
                  :class="{
                    'border-primary bg-primary bg-opacity-5': selectedAnswer === 'false',
                    'border-success bg-success bg-opacity-5': answered && correctAnswer === 'false',
                    'border-error': answered && selectedAnswer === 'false' && !isCurrentCorrect
                  }"
                  @click="selectAnswer('false')"
                >
                  <n-radio :checked="selectedAnswer === 'false'" :disabled="answered">错误</n-radio>
                </div>
              </div>
            </template>
          </div>

          <!-- 提交后显示解析 -->
          <div v-if="answered && currentQuestion?.analysis" class="mt-4 p-3 bg-gray-50 rounded">
            <span class="font-bold">解析：</span>
            <span v-html="currentQuestion.analysis" />
          </div>

          <div class="flex justify-between mt-8">
            <n-button :disabled="currentIndex === 0" @click="prevQuestion">上一题</n-button>
            <div class="flex gap-2">
              <n-button v-if="!answered" type="primary" :loading="submitting" @click="submitAnswer">
                提交答案
              </n-button>
              <n-button v-if="currentIndex < questions.length - 1" @click="nextQuestion">下一题</n-button>
              <n-button v-else-if="answered" type="success" @click="finishPractice">
                完成练习
              </n-button>
            </div>
          </div>
        </n-card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getPracticeSession, submitPracticeAnswer, completePractice } from '@/api/practice'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const sessionId = Number(route.params.sessionId)
const questions = ref<any[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref('')
const multipleSelected = ref<string[]>([])
const answered = ref(false)
const submitting = ref(false)
const correctAnswer = ref('')
const isCurrentCorrect = ref(false)
const result = ref<any>(null)

const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

function difficultyTagType(d: string) {
  return d === 'HARD' ? 'error' : d === 'MEDIUM' ? 'warning' : 'success'
}

function selectAnswer(value: string) {
  if (answered.value) return
  selectedAnswer.value = value
  multipleSelected.value = []
}

function toggleMultiple(value: string) {
  if (answered.value) return
  const idx = multipleSelected.value.indexOf(value)
  if (idx >= 0) multipleSelected.value.splice(idx, 1)
  else multipleSelected.value.push(value)
}

async function submitAnswer() {
  if (!currentQuestion.value) return
  const answer = currentQuestion.value.type === 1 ? multipleSelected.value.join(',') : selectedAnswer.value
  if (!answer) {
    message.warning('请先选择答案')
    return
  }

  submitting.value = true
  try {
    const res = await submitPracticeAnswer(sessionId, {
      index: currentIndex.value,
      answer
    })
    answered.value = true
    correctAnswer.value = res.correctAnswer || ''
    isCurrentCorrect.value = res.isCorrect
  } catch {
    message.error('提交答案失败')
  } finally {
    submitting.value = false
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetAnswer()
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    resetAnswer()
  }
}

function resetAnswer() {
  selectedAnswer.value = ''
  multipleSelected.value = []
  answered.value = false
  correctAnswer.value = ''
  isCurrentCorrect.value = false
}

async function finishPractice() {
  try {
    const res = await completePractice(sessionId)
    result.value = res
    message.success('练习完成')
  } catch {
    message.error('完成练习失败')
  }
}

async function loadSession() {
  try {
    const res = await getPracticeSession(sessionId)
    questions.value = res.questions || []
    if (res.answers?.length) {
      // 恢复已答题目的状态
      questions.value.forEach((q: any) => {
        const ans = res.answers.find((a: any) => a.questionIndex === q.questionIndex)
        if (ans) {
          q.userAnswer = ans.userAnswer
          q.isCorrect = ans.isCorrect
          q.correctAnswer = ans.correctAnswer
        }
      })
    }
    if (res.status === 'COMPLETED') {
      result.value = res.stats || { accuracy: res.accuracy, correctCount: res.correctCount, totalCount: res.totalCount, duration: res.duration }
    }
    if (res.currentIndex !== undefined) {
      currentIndex.value = res.currentIndex
    }
  } catch {
    message.error('加载练习会话失败')
    router.push('/practice')
  }
}

onMounted(() => { loadSession() })
</script>