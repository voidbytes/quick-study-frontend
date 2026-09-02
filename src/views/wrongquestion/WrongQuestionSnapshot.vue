<template>
  <div class="p-6 max-w-4xl mx-auto">
    <n-button quaternary @click="router.back()" class="mb-4">
      ← 返回错题本
    </n-button>

    <n-spin v-if="!loadError" :show="loading">
      <n-card v-if="snapshot" :title="'错题快照（' + formatTime(wrongQuestion?.lastWrongTime) + '）'">
        <template #header-extra>
          <div class="flex items-center gap-2">
            <n-tag :type="typeColor" size="small">{{ typeLabel }}</n-tag>
            <n-tag :type="difficultyColor" size="small">{{ difficultyLabel }}</n-tag>
          </div>
        </template>

        <div class="space-y-6">
          <!-- 所属题库 -->
          <div class="text-sm text-gray-500">
            所属题库：{{ snapshot.bankName || wrongQuestion?.bankName || '未知' }}
            ｜ 错误次数：{{ wrongQuestion?.errorCount || 0 }} 次
          </div>

          <!-- 题干 -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">题干</h3>
            <div class="prose prose-sm max-w-none" v-html="snapshot.content || ''" />
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
          <div v-if="snapshot.type === 'TRUE_FALSE'">
            <h3 class="text-sm font-medium text-gray-500 mb-2">正确答案</h3>
            <n-tag :type="snapshot.answer === 'A' ? 'success' : 'error'">
              {{ snapshot.answer === 'A' ? '正确' : '错误' }}
            </n-tag>
          </div>

          <!-- 答案 -->
          <div v-if="snapshot.answer && snapshot.type !== 'TRUE_FALSE'">
            <h3 class="text-sm font-medium text-gray-500 mb-2">正确答案</h3>
            <div class="p-3 rounded bg-blue-50 border border-blue-200">
              <div v-if="snapshot.type === 'SINGLE'" class="text-sm">
                {{ answerLabel }}
              </div>
              <div v-else-if="snapshot.type === 'MULTIPLE'" class="text-sm">
                {{ answerLabel }}
              </div>
              <div v-else class="prose prose-sm max-w-none" v-html="snapshot.answer" />
            </div>
          </div>

          <!-- 解析 -->
          <div v-if="snapshot.analysis">
            <h3 class="text-sm font-medium text-gray-500 mb-2">解析</h3>
            <div class="p-3 rounded bg-yellow-50 border border-yellow-200 prose prose-sm max-w-none" v-html="snapshot.analysis" />
          </div>
        </div>
      </n-card>

      <n-empty v-else-if="!loading" description="未找到错题记录" />
    </n-spin>
    <LoadError v-else :description="loadError" :retrying="loading" @retry="fetchDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getWrongQuestionById } from '@/api/wrongQuestion'
import { CheckmarkOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'
import LoadError from '@/components/LoadError.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const loadError = ref('')
const wrongQuestion = ref<any>(null)
const snapshot = ref<any>(null)

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

const typeLabel = computed(() => typeLabels[snapshot.value?.type] || '-')
const typeColor = computed(() => typeColors[snapshot.value?.type] || 'default')
const difficultyLabel = computed(() => difficultyLabels[snapshot.value?.difficulty] || '-')
const difficultyColor = computed(() => difficultyColors[snapshot.value?.difficulty] || 'default')

const showOptions = computed(() => snapshot.value?.type === 'SINGLE' || snapshot.value?.type === 'MULTIPLE')

const parsedOptions = computed(() => {
  if (!snapshot.value?.options) return []
  if (typeof snapshot.value.options === 'string') {
    try {
      return JSON.parse(snapshot.value.options)
    } catch {
      return []
    }
  }
  if (Array.isArray(snapshot.value.options)) {
    return snapshot.value.options
  }
  return []
})

const isCorrectOption = (opt: string) => {
  if (!snapshot.value?.answer) return false
  const answer = snapshot.value.answer
  if (snapshot.value.type === 'SINGLE') {
    const idx = parsedOptions.value.indexOf(opt)
    if (idx >= 0) {
      return answer === String.fromCharCode(65 + idx)
    }
  }
  if (snapshot.value.type === 'MULTIPLE') {
    const answers = answer.split(',')
    const idx = parsedOptions.value.indexOf(opt)
    if (idx >= 0) {
      return answers.includes(String.fromCharCode(65 + idx))
    }
  }
  return false
}

const answerLabel = computed(() => {
  if (!snapshot.value?.answer) return ''
  if (snapshot.value.type === 'SINGLE') {
    const idx = snapshot.value.answer.charCodeAt(0) - 65
    if (idx >= 0 && idx < parsedOptions.value.length) {
      return `${snapshot.value.answer}. ${parsedOptions.value[idx]}`
    }
    return snapshot.value.answer
  }
  if (snapshot.value.type === 'MULTIPLE') {
    const answers = snapshot.value.answer.split(',')
    return answers.map((a: string) => {
      const idx = a.trim().charCodeAt(0) - 65
      if (idx >= 0 && idx < parsedOptions.value.length) {
        return `${a.trim()}. ${parsedOptions.value[idx]}`
      }
      return a.trim()
    }).join('；')
  }
  return snapshot.value.answer
})

function formatTime(time: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    message.error('缺少错题记录ID')
    return
  }

  loading.value = true
  try {
    const res = await getWrongQuestionById(id)
    wrongQuestion.value = res.data
    // 解析 questionSnapshot JSON
    if (res.data.questionSnapshot) {
      try {
        snapshot.value = JSON.parse(res.data.questionSnapshot)
      } catch {
        message.warning('快照数据解析失败')
        snapshot.value = { content: '', type: '' }
      }
    } else {
      message.warning('该错题记录没有快照数据')
      snapshot.value = { content: '', type: '' }
    }
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || err?.message || '加载错题快照失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>