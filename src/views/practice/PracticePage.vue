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
              :key="q.index"
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
                  <span>{{ formatAnswer(q.answer, q.type) }}</span>
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
            <!-- 单选题 -->
            <template v-if="currentQuestion?.type === 'SINGLE'">
              <div
                v-for="(opt, idx) in parsedOptions"
                :key="idx"
                class="p-3 border rounded cursor-pointer hover:border-primary"
                :class="{
                  'border-primary bg-primary bg-opacity-5': selectedAnswer === String.fromCharCode(65 + idx),
                  'border-success bg-success bg-opacity-5': answered && currentQuestion.answer === String.fromCharCode(65 + idx),
                  'border-error bg-error bg-opacity-5': answered && selectedAnswer === String.fromCharCode(65 + idx) && selectedAnswer !== currentQuestion.answer
                }"
                @click="selectAnswer(String.fromCharCode(65 + idx))"
              >
                <n-radio :checked="selectedAnswer === String.fromCharCode(65 + idx)" :disabled="answered">
                  <span class="font-mono mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
                  {{ opt }}
                </n-radio>
              </div>
            </template>

            <!-- 多选题 -->
            <template v-if="currentQuestion?.type === 'MULTIPLE'">
              <div
                v-for="(opt, idx) in parsedOptions"
                :key="idx"
                class="p-3 border rounded cursor-pointer hover:border-primary"
                :class="{
                  'border-primary bg-primary bg-opacity-5': multipleSelected.includes(String.fromCharCode(65 + idx)),
                  'border-success': answered && currentQuestion.answer.includes(String.fromCharCode(65 + idx)),
                  'border-error': answered && multipleSelected.includes(String.fromCharCode(65 + idx)) && !currentQuestion.answer.includes(String.fromCharCode(65 + idx))
                }"
                @click="toggleMultiple(String.fromCharCode(65 + idx))"
              >
                <n-checkbox :checked="multipleSelected.includes(String.fromCharCode(65 + idx))" :disabled="answered">
                  <span class="font-mono mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
                  {{ opt }}
                </n-checkbox>
              </div>
            </template>

            <!-- 判断题 -->
            <template v-if="currentQuestion?.type === 'TRUE_FALSE'">
              <div
                v-for="(opt, idx) in parsedOptions"
                :key="idx"
                class="p-3 border rounded cursor-pointer hover:border-primary"
                :class="{
                  'border-primary bg-primary bg-opacity-5': selectedAnswer === String.fromCharCode(65 + idx),
                  'border-success bg-success bg-opacity-5': answered && currentQuestion.answer === String.fromCharCode(65 + idx),
                  'border-error bg-error bg-opacity-5': answered && selectedAnswer === String.fromCharCode(65 + idx) && selectedAnswer !== currentQuestion.answer
                }"
                @click="selectAnswer(String.fromCharCode(65 + idx))"
              >
                <n-radio :checked="selectedAnswer === String.fromCharCode(65 + idx)" :disabled="answered">
                  <span class="font-mono mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
                  {{ opt }}
                </n-radio>
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
const result = ref<any>(null)

const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

/** 解析 options JSON 字符串为数组 */
const parsedOptions = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.options) return []
  try {
    return JSON.parse(q.options)
  } catch {
    return []
  }
})

function difficultyTagType(d: string) {
  return d === 'HARD' ? 'error' : d === 'MEDIUM' ? 'warning' : 'success'
}

function formatAnswer(answer: string, type: string) {
  if (!answer) return '-'
  if (type === 'TRUE_FALSE') {
    return answer === 'A' ? '正确' : '错误'
  }
  return answer
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
  const answer = currentQuestion.value.type === 'MULTIPLE'
    ? multipleSelected.value.join(',')
    : selectedAnswer.value
  if (!answer) {
    message.warning('请先选择答案')
    return
  }

  submitting.value = true
  try {
    await submitPracticeAnswer(sessionId, {
      index: currentIndex.value,
      answer
    })
    answered.value = true
    // 从题目数据中获取正确答案和解析
    const q = questions.value[currentIndex.value]
    if (q) {
      q.userAnswer = answer
      q.isCorrect = q.answer === answer
    }
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
  // 恢复已答题目的状态
  const q = questions.value[currentIndex.value]
  if (q && q.userAnswer) {
    selectedAnswer.value = q.userAnswer
    answered.value = true
  }
}

async function finishPractice() {
  try {
    const res = await completePractice(sessionId)
    result.value = res.data
    message.success('练习完成')
  } catch {
    message.error('完成练习失败')
  }
}

async function loadSession() {
  try {
    const res = await getPracticeSession(sessionId)
    const session = res.data
    questions.value = session.questions || []
    // 合并答案信息到题目中
    if (session.answers?.length) {
      questions.value.forEach((q: any) => {
        const ans = session.answers.find((a: any) => a.questionIndex === q.index)
        if (ans) {
          q.userAnswer = ans.userAnswer
          q.isCorrect = ans.isCorrect
        }
      })
    }
    // 如果已完成，直接显示结果
    if (session.status === 'COMPLETED') {
      result.value = session.stats
      return
    }
    if (session.currentIndex !== undefined) {
      currentIndex.value = session.currentIndex
    }
    // 恢复当前题目的状态
    resetAnswer()
  } catch {
    message.error('加载练习会话失败')
    router.push('/practice')
  }
}

onMounted(() => { loadSession() })
</script>