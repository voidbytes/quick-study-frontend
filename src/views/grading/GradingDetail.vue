<template>
  <div class="p-6 max-w-6xl mx-auto">
    <n-button quaternary @click="router.back()" class="mb-4">← 返回待批改列表</n-button>

    <n-spin :show="loading">
      <!-- 作答者信息 -->
      <n-card class="mb-6">
        <template #header>
          <span class="text-lg font-bold">作答者：{{ session?.user?.nickname || '未知' }}</span>
        </template>
        <n-descriptions :column="2">
          <n-descriptions-item label="试卷">{{ session?.paper?.title || '未知' }}</n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 逐题展示 -->
      <n-card v-for="(answer, index) in session?.answers" :key="answer.id" class="mb-4">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-bold">第 {{ index + 1 }} 题</span>
            <n-tag :type="answer.type === 'OBJECTIVE' ? 'success' : 'warning'" size="small">
              {{ answer.type === 'OBJECTIVE' ? '客观题' : '主观题' }}
            </n-tag>
          </div>
        </template>

        <div class="mb-4" v-html="answer.content" />

        <n-descriptions :column="2" label-placement="left" bordered size="small">
          <n-descriptions-item label="用户答案">
            <span v-html="answer.userAnswer || '未作答'" />
          </n-descriptions-item>
          <n-descriptions-item label="参考答案">
            <span v-html="answer.referenceAnswer || '无'" />
          </n-descriptions-item>
          <n-descriptions-item label="当前得分">
            <n-input-number
              v-model:value="answer.score"
              :min="0"
              :step="1"
              style="width: 120px"
            />
          </n-descriptions-item>
        </n-descriptions>

        <div class="flex gap-2 mt-3">
          <n-button size="small" @click="handleAiSuggest(answer)">AI 评分建议</n-button>
          <n-button size="small" @click="handleKeywordSuggest(answer)">关键词匹配评分</n-button>
          <n-button size="small" type="primary" @click="handleSaveScore(answer)">保存得分</n-button>
        </div>
      </n-card>

      <div class="flex justify-center mt-6">
        <n-button type="primary" size="large" :loading="completing" @click="handleComplete">
          完成批改
        </n-button>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getGradingSession, saveScore, completeGrading, aiSuggest, keywordSuggest } from '@/api/grading'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const sessionId = route.params.id as string
const loading = ref(false)
const completing = ref(false)
const session = ref<any>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getGradingSession(sessionId)
    session.value = res
  } catch {
    message.error('加载批改详情失败')
  } finally {
    loading.value = false
  }
}

async function handleSaveScore(answer: any) {
  try {
    await saveScore(sessionId, answer.id, { score: answer.score })
    message.success('得分已保存')
  } catch {
    message.error('保存失败')
  }
}

async function handleAiSuggest(answer: any) {
  try {
    const res = await aiSuggest(sessionId, answer.id)
    answer.score = res.suggestedScore
    message.success(`AI 建议得分：${res.suggestedScore}`)
  } catch (err: any) {
    const code = err?.response?.data?.code
    if (code === 60601) message.error('未配置 AI Key')
    else if (code === 60602) message.error('AI 调用失败')
    else message.error('获取 AI 建议失败')
  }
}

async function handleKeywordSuggest(answer: any) {
  try {
    const res = await keywordSuggest(sessionId, answer.id)
    answer.score = res.suggestedScore
    message.success(`关键词匹配建议得分：${res.suggestedScore}`)
  } catch (err: any) {
    const code = err?.response?.data?.code
    if (code === 60601) message.error('未配置 AI Key')
    else if (code === 60602) message.error('AI 调用失败')
    else message.error('获取关键词匹配建议失败')
  }
}

async function handleComplete() {
  completing.value = true
  try {
    await completeGrading(sessionId)
    message.success('批改完成')
    router.push('/grading')
  } catch {
    message.error('完成批改失败')
  } finally {
    completing.value = false
  }
}

onMounted(() => { fetchDetail() })
</script>