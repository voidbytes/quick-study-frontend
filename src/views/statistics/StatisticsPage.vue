<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">统计</h1>

    <n-spin :show="loading">
      <!-- 概览统计 -->
      <n-card title="概览" class="mb-6">
        <n-grid :cols="4" :x-gap="16" :y-gap="16">
          <n-grid-item>
            <n-statistic label="练习场次" :value="overview?.totalPractices || 0" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="总题数" :value="overview?.totalQuestions || 0" />
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="正确率">
              <template #default>
                {{ overview?.correctRate ? overview.correctRate.toFixed(1) + '%' : '-' }}
              </template>
            </n-statistic>
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="错题数" :value="overview?.wrongCount || 0" />
          </n-grid-item>
        </n-grid>
      </n-card>

      <!-- 按题库分组统计 -->
      <n-card title="各题库统计" class="mb-6">
        <n-data-table
          :columns="bankStatColumns"
          :data="overview?.bankStats || []"
          :bordered="true"
          size="small"
        />
      </n-card>

      <!-- ECharts 图表 -->
      <n-grid :cols="2" :x-gap="16">
        <n-grid-item>
          <n-card title="各题库正确率">
            <div ref="accuracyChartRef" style="height: 300px" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="各题库练习次数">
            <div ref="countChartRef" style="height: 300px" />
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { getStatisticsOverview } from '@/api/statistics'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { DataTableColumn } from 'naive-ui'

const message = useMessage()

const loading = ref(false)
const overview = ref<any>(null)
const accuracyChartRef = ref<HTMLDivElement | null>(null)
const countChartRef = ref<HTMLDivElement | null>(null)

const bankStatColumns: DataTableColumn<any>[] = [
  { title: '题库名称', key: 'bankName' },
  { title: '做题数', key: 'count', width: 80, align: 'center' },
  {
    title: '正确率',
    key: 'correctRate',
    width: 80,
    align: 'center',
    render(row) {
      return row.correctRate != null ? row.correctRate.toFixed(1) + '%' : '-'
    }
  }
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

function renderCharts() {
  if (!overview.value?.bankStats?.length) return

  nextTick(() => {
    // 正确率图表
    if (accuracyChartRef.value) {
      const names = overview.value.bankStats.map((s: any) => s.bankName)
      const rates = overview.value.bankStats.map((s: any) => (s.correctRate || 0))

      const accuracyOption: EChartsOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: names, axisLabel: { rotate: 30, fontSize: 10 } },
        yAxis: { type: 'value', name: '正确率(%)', max: 100 },
        series: [{
          type: 'bar',
          data: rates,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#52c41a' },
              { offset: 1, color: '#237804' }
            ])
          }
        }]
      }

      const chart1 = echarts.init(accuracyChartRef.value)
      chart1.setOption(accuracyOption)
    }

    // 练习次数图表
    if (countChartRef.value) {
      const names = overview.value.bankStats.map((s: any) => s.bankName)
      const counts = overview.value.bankStats.map((s: any) => s.count || 0)

      const countOption: EChartsOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: names, axisLabel: { rotate: 30, fontSize: 10 } },
        yAxis: { type: 'value', name: '次数' },
        series: [{
          type: 'bar',
          data: counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#0050b3' }
            ])
          }
        }]
      }

      const chart2 = echarts.init(countChartRef.value)
      chart2.setOption(countOption)
    }
  })
}

onMounted(async () => {
  await fetchData()
  renderCharts()
})
</script>