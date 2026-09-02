<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 结果展示 -->
      <template v-if="result">
        <n-card>
          <template #header>
            <span class="text-xl font-bold">练习结果</span>
          </template>
          <n-descriptions v-if="conditionText" :column="1" bordered size="small" class="mb-4">
            <n-descriptions-item label="练习条件">
              <span class="text-sm">{{ conditionText }}</span>
            </n-descriptions-item>
          </n-descriptions>
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

          <!-- 每题详情直接平铺展示（原 n-collapse 点击无反应，见 bug-037） -->
          <n-card v-for="(q, index) in questions" :key="q.index" size="small" class="mb-3">
            <template #header>
              <div class="flex items-center gap-2">
                <span>第 {{ index + 1 }} 题</span>
                <!-- 题型标签（bug-044：原来只有题号无法区分题型） -->
                <n-tag :type="typeTagType(q.type)" size="small">
                  {{ typeLabels[q.type] || q.type }}
                </n-tag>
                <n-tag :type="difficultyTagType(q.difficulty)" size="small">
                  {{ difficultyLabels[q.difficulty] || '未知' }}
                </n-tag>
                <n-tag v-if="!q.userAnswer" type="default" size="small">未作答</n-tag>
              </div>
            </template>
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
          </n-card>

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
              <div class="flex items-center gap-2">
                <n-tag v-if="conditionText" size="small" type="info" style="max-width: 300px" ellipsis>
                  {{ conditionText }}
                </n-tag>
                <n-tag :type="typeTagType(currentQuestion?.type)" size="small">
                  {{ typeLabels[currentQuestion?.type] || currentQuestion?.type }}
                </n-tag>
                <n-tag :type="difficultyTagType(currentQuestion?.difficulty)" size="small">
                  {{ difficultyLabels[currentQuestion?.difficulty] || '未知' }}
                </n-tag>
              </div>
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

          <!-- 提交后显示判定结果 -->
          <div
            v-if="answered"
            class="mt-4 p-3 rounded flex items-center gap-3"
            :class="currentQuestion?.isCorrect ? 'bg-success bg-opacity-5' : 'bg-error bg-opacity-5'"
          >
            <n-tag :type="currentQuestion?.isCorrect ? 'success' : 'error'" size="small">
              {{ currentQuestion?.isCorrect ? '回答正确' : '回答错误' }}
            </n-tag>
            <span class="text-sm">
              你的答案：<b>{{ formatAnswer(currentQuestion?.userAnswer, currentQuestion?.type) || '未作答' }}</b>
              <template v-if="!currentQuestion?.isCorrect">
                <span class="mx-2">|</span>
                正确答案：<b class="text-success">{{ formatAnswer(currentQuestion?.answer, currentQuestion?.type) }}</b>
              </template>
            </span>
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
              <n-button type="success" @click="handleComplete">提交</n-button>
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
import { useMessage, useDialog } from 'naive-ui'
import { getPracticeSession, submitPracticeAnswer, completePractice } from '@/api/practice'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const sessionId = route.params.id as string
const questions = ref<any[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref('')
const multipleSelected = ref<string[]>([])
const answered = ref(false)
const submitting = ref(false)
const result = ref<any>(null)
const filterParams = ref<any>(null)

const difficultyLabels: Record<string, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }
const typeLabels: Record<string, string> = {
  SINGLE: '单选',
  MULTIPLE: '多选',
  TRUE_FALSE: '判断',
  FILL_BLANK: '填空',
  SHORT_ANSWER: '简答'
}

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

/** 解析 options JSON 字符串为数组（去除数据自带的 "A. " 前缀，前缀统一由模板渲染） */
const parsedOptions = computed(() => {
  const q = currentQuestion.value
  if (!q) return []
  // 判断题老数据可能没有 options，兜底给出 正确/错误 两项（对应 A/B）
  if (q.type === 'TRUE_FALSE' && !q.options) return ['正确', '错误']
  if (!q.options) return []
  try {
    const opts: string[] = JSON.parse(q.options)
    return opts.map((o) => String(o).replace(/^[A-Za-z][.、．]\s*/, ''))
  } catch {
    return []
  }
})

/** 解析条件描述 */
const conditionText = computed(() => {
  if (!filterParams.value) return ''
  const fp = filterParams.value
  const parts: string[] = []
  if (fp.sourceType === 'WRONG_REDO') {
    parts.push('来源：错题重做')
  } else {
    parts.push('来源：随机练习')
  }
  if (fp.bankIds && fp.bankIds.length > 0) {
    parts.push(`题库：${fp.bankIds.length}个`)
  }
  if (fp.types && fp.types.length > 0) {
    const typeMap: Record<string, string> = { SINGLE: '单选', MULTIPLE: '多选', TRUE_FALSE: '判断' }
    const typeNames = fp.types.map((t: string) => typeMap[t] || t)
    parts.push(`题型：${typeNames.join('、')}`)
  }
  if (fp.tagIds && fp.tagIds.length > 0) {
    parts.push(`标签：${fp.tagIds.length}个`)
  }
  if (fp.correctRateMin != null || fp.correctRateMax != null) {
    const min = fp.correctRateMin != null ? Math.round(fp.correctRateMin * 100) : 0
    const max = fp.correctRateMax != null ? Math.round(fp.correctRateMax * 100) : 100
    parts.push(`正确率：${min}%-${max}%`)
  }
  if (fp.priorUnanswered) parts.push('优先未做')
  if (fp.priorWrong) parts.push('优先易错')
  return parts.join(' | ')
})

/** 未答题数 */
const unansweredCount = computed(() => {
  return questions.value.filter((q: any) => !q.userAnswer).length
})

function difficultyTagType(d: string) {
  return d === 'HARD' ? 'error' : d === 'MEDIUM' ? 'warning' : 'success'
}

function typeTagType(t: string) {
  return t === 'SINGLE' ? 'info' : t === 'MULTIPLE' ? 'warning' : t === 'TRUE_FALSE' ? 'success' : 'default'
}

function formatAnswer(answer: string, type: string) {
  if (!answer) return '-'
  if (type === 'TRUE_FALSE') {
    // 兼容历史数据混用的 A/B 与 true/false 两种格式
    return answer === 'A' || answer === 'true' ? '正确' : '错误'
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
    const res = await submitPracticeAnswer(sessionId, {
      index: currentIndex.value,
      answer
    })
    answered.value = true
    // 以后端判分结果为准（多选题选项顺序、判断题 A/B 与 true/false 归一都在后端处理）
    const q = questions.value[currentIndex.value]
    if (q) {
      q.userAnswer = answer
      q.isCorrect = typeof res.data === 'boolean' ? res.data : q.answer === answer
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

function handleComplete() {
  const unanswered = unansweredCount.value
  if (unanswered > 0) {
    dialog.warning({
      title: '确认提交',
      content: `还有 ${unanswered} 道题未作答，确定提交吗？`,
      positiveText: '确定提交',
      negativeText: '继续作答',
      onPositiveClick: async () => {
        await finishPractice()
      }
    })
  } else {
    dialog.info({
      title: '确认提交',
      content: '已完成所有题目，确定提交吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await finishPractice()
      }
    })
  }
}

async function loadSession() {
  try {
    const res = await getPracticeSession(sessionId)
    const session = res.data
    questions.value = session.questions || []
    // 解析条件
    if (session.filterParams) {
      try {
        filterParams.value = JSON.parse(session.filterParams)
      } catch {
        filterParams.value = null
      }
    }
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
      // 答完最后一题时后端 currentIndex 会越界（=题数），回到最后一题，避免首屏空白
      currentIndex.value = Math.min(session.currentIndex, Math.max(questions.value.length - 1, 0))
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