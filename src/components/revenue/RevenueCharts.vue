<template>
  <div class="charts-grid">
    <div class="chart-card chart-card--wide">
      <h3 class="chart-title">Tagesumsatz (letzte 30 Tage)</h3>
      <div class="chart-wrap">
        <Bar v-if="dailyChartData" :data="dailyChartData" :options="barOptions" />
      </div>
    </div>

    <div class="chart-card">
      <h3 class="chart-title">Top Produkte (nach Umsatz)</h3>
      <div class="chart-wrap chart-wrap--doughnut">
        <Doughnut v-if="productChartData" :data="productChartData" :options="doughnutOptions" />
      </div>
    </div>

    <div class="chart-card">
      <h3 class="chart-title">Bestellungen pro Tag</h3>
      <div class="chart-wrap chart-wrap--doughnut">
        <Line v-if="ordersTrendData" :data="ordersTrendData" :options="lineOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

defineProps({
  dailyChartData: { type: Object, default: null },
  productChartData: { type: Object, default: null },
  ordersTrendData: { type: Object, default: null },
})

const baseTooltip = {
  backgroundColor: 'rgba(7, 26, 42, 0.95)',
  borderColor: 'rgba(0, 212, 232, 0.3)',
  borderWidth: 1,
  titleColor: '#fff',
  bodyColor: 'rgba(255,255,255,0.8)',
  padding: 12,
  cornerRadius: 8,
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...baseTooltip,
      callbacks: {
        label: (ctx) => `${ctx.parsed.y.toFixed(2)} EUR`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.4)', maxRotation: 45 },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: {
        color: 'rgba(255,255,255,0.4)',
        callback: (value) => `${value} EUR`,
      },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgba(255,255,255,0.65)',
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      ...baseTooltip,
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(2)} EUR`,
      },
    },
  },
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...baseTooltip,
      borderColor: 'rgba(110, 240, 180, 0.3)',
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.4)', maxRotation: 45 },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.4)', stepSize: 1 },
      grid: { color: 'rgba(255,255,255,0.06)' },
      beginAtZero: true,
    },
  },
}
</script>
