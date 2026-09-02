<template>
  <div>
    <PageHeader title="学习统计" subtitle="查看练习场次、正确率与各题库表现" />

    <n-spin :show="loading">
      <!-- 概览统计卡 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          v-for="card in statCards"
          :key="card.label"
          :label="card.label"
          :value="card.value"
          :tone="card.tone"
        />
      </div>

      <!-- 各题库统计（正确率进度条） -->
      <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <span class="text-base font-semibold text-neutral-900">各题库统计</span>
        </div>
        <n-data-table
          :columns="bankStatColumns"
          :data="bankStats"
          :bordered="false"
          size="small"
        />
      </div>

      <!-- ECharts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div class="bg-white border border-neutral-200 rounded-lg">
          <div class="px-5 py-4 border-b border-neutral-200">
            <span class="text-base font-semibold text-neutral-900">各题库正确率</span>
          </div>
          <div ref="accuracyChartRef" class="p-2" style="height: 300px" />
        </div>
        <div class="bg-white border border-neutral-200 rounded-lg">
          <div class="px-5 py-4 border-b border-neutral-200">
            <span class="text-base font-semibold text-neutral-900">各题库练习次数</span>
          </div>
          <div ref="countChartRef" class="p-2" style="height: 300px" />
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue'
import { useMessage } from 'naive-ui'
import { getStatisticsOverview } from '@/api/statistics'
import type { OverviewStats } from '@/types'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { DataTableColumn } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'

const message = useMessage()

const loading = ref(false)
const overview = ref<OverviewStats | null>(null)
const accuracyChartRef = ref<HTMLDivElement | null>(null)
const countChartRef = ref<HTMLDivElement | null>(null)

type BankStat = OverviewStats['bankStats'][number]

const bankStats = computed<BankStat[]>(() => overview.value?.bankStats || [])

const statCards = computed<{ label: string; value: string | number; tone: 'default' | 'brand' | 'success' | 'error' | 'warning' }[]>(() => [
  { label: '练习场次', value: overview.value?.totalPractices || 0, tone: 'brand' },
  { label: '总题数', value: overview.value?.totalQuestions || 0, tone: 'default' },
  { label: '正确率', value: overview.value?.correctRate != null ? overview.value.correctRate.toFixed(1) + '%' : '-', tone: 'success' },
  { label: '错题数', value: overview.value?.wrongCount || 0, tone: 'error' }
])

/** 正确率进度条：≥60% 绿 / ≥30% 橙 / 否则红（与设计稿一致） */
function renderCorrectRate(row: BankStat) {
  if (row.correctRate == null) return '-'
  const pct = Math.min(Math.max(row.correctRate, 0), 100)
  const barClass = row.correctRate >= 60
    ? 'bg-success-500'
    : row.correctRate >= 30
      ? 'bg-warning-500'
      : 'bg-error-500'
  return h('div', { class: 'flex items-center gap-2' }, [
    h('div', { class: 'flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden' }, [
      h('div', { class: `h-full rounded-full ${barClass}`, style: { width: `${pct}%` } })
    ]),
    h('span', { class: 'w-12 text-right text-sm text-neutral-600' }, row.correctRate.toFixed(1) + '%')
  ])
}

const bankStatColumns: DataTableColumn<BankStat>[] = [
  { title: '题库名称', key: 'bankName', ellipsis: { tooltip: true } },
  { title: '做题数', key: 'count', width: 100, align: 'center' },
  { title: '正确率', key: 'correctRate', width: 220, render: renderCorrectRate }
]

async function fetchData() {
  loading.value = true
  try {
    const res = await getStatisticsOverview()
    overview.value = res.data
  } catch {
    message.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

/** 全局坐标轴 / tooltip 配色：tooltip 白底描边、坐标轴中性灰阶（design 文档 7.6.3） */
function barOption(
  names: string[],
  values: number[],
  name: string,
  from: string,
  to: string
): EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFFFFF',
      borderColor: '#E8E8EC',
      textStyle: { color: '#242428', fontSize: 13 },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(91, 95, 233, 0.06)' } }
    },
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: '#E8E8EC' } },
      axisTick: { show: false },
      axisLabel: { color: '#8A8A96', fontSize: 12, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name,
      nameTextStyle: { color: '#8A8A96', fontSize: 12 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F4F4F6' } },
      axisLabel: { color: '#8A8A96', fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: values,
      barMaxWidth: 40,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: from },
          { offset: 1, color: to }
        ])
      },
      emphasis: { itemStyle: { opacity: 0.9 } }
    }]
  }
}

function renderCharts() {
  if (!overview.value?.bankStats?.length) return

  nextTick(() => {
    // 正确率图表（primary 渐变）
    if (accuracyChartRef.value) {
      const names = overview.value!.bankStats.map((s: BankStat) => s.bankName)
      const rates = overview.value!.bankStats.map((s: BankStat) => s.correctRate || 0)
      const option = barOption(names, rates, '正确率(%)', '#5B5FE9', '#3A35B8') // primary-500 → primary-700
      const chart1 = echarts.init(accuracyChartRef.value)
      chart1.setOption(option)
    }

    // 练习次数图表（success 渐变）
    if (countChartRef.value) {
      const names = overview.value!.bankStats.map((s: BankStat) => s.bankName)
      const counts = overview.value!.bankStats.map((s: BankStat) => s.count || 0)
      const option = barOption(names, counts, '次数', '#22B570', '#0F7A48') // success-500 → success-700
      const chart2 = echarts.init(countChartRef.value)
      chart2.setOption(option)
    }
  })
}

onMounted(async () => {
  await fetchData()
  renderCharts()
})
</script>
