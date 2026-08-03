<template>
  <div class="max-w-4xl mx-auto p-4">
    <n-card title="考试结果" class="mb-4">
      <n-descriptions bordered :column="2">
        <n-descriptions-item label="总分">
          <n-number-animation :from="0" :to="result.totalScore || 0" />
        </n-descriptions-item>
        <n-descriptions-item label="客观题得分">
          <n-number-animation :from="0" :to="result.objectiveScore || 0" />
        </n-descriptions-item>
        <n-descriptions-item label="主观题得分">
          <n-number-animation :from="0" :to="result.subjectiveScore || 0" />
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="statusTagType">{{ statusLabel }}</n-tag>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card title="答题详情" v-if="result.questions && result.questions.length">
      <n-collapse>
        <n-collapse-item
          v-for="(q, index) in result.questions"
          :key="q.paperQuestionId"
          :title="`第 ${index + 1} 题`"
          :name="q.paperQuestionId"
        >
          <div class="prose max-w-none mb-4" v-html="parseQuestionContent(q.content)" />
          <n-descriptions bordered :column="1" size="small">
            <n-descriptions-item label="你的答案">
              <span :class="q.isCorrect === true ? 'text-green-600' : q.isCorrect === false ? 'text-red-600' : ''">
                {{ q.yourAnswer || '未作答' }}
              </span>
            </n-descriptions-item>
            <n-descriptions-item label="正确答案" v-if="q.correctAnswer">
              {{ q.correctAnswer }}
            </n-descriptions-item>
            <n-descriptions-item label="得分">
              {{ q.score ?? '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="解析" v-if="q.analysis">
              {{ q.analysis }}
            </n-descriptions-item>
          </n-descriptions>
        </n-collapse-item>
      </n-collapse>
    </n-card>

    <div class="mt-4 text-center">
      <n-button @click="router.push('/records')">返回记录</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getResult } from '@/api/exam'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const sessionId = Number(route.params.id)
const result = ref<any>({})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    GRADED: '已批改',
    SUBMITTED: '待批改',
    IN_PROGRESS: '进行中',
    AUTO_SUBMITTED: '自动交卷',
    CHEAT_SUBMITTED: '切屏交卷'
  }
  return map[result.value.status] || result.value.status || '未知'
})

const statusTagType = computed(() => {
  const map: Record<string, string> = {
    GRADED: 'success',
    SUBMITTED: 'warning',
    CHEAT_SUBMITTED: 'error'
  }
  return map[result.value.status] || 'default'
})

function parseQuestionContent(content: string): string {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    return parsed.content || content
  } catch {
    return content
  }
}

async function loadResult() {
  try {
    const res = await getResult(sessionId)
    result.value = res.data.data
  } catch {
    message.error('获取考试结果失败')
  }
}

onMounted(() => {
  loadResult()
})
</script>