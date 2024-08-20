<template>
    <LineChart ref="chart" :chartData="dataChart.data" :options="dataChart.options" :height="150"></LineChart>
</template>

<script>
import {defineAsyncComponent} from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  registerables,
} from 'chart.js'

async function loadVueChart() {
  const {LineChart} = await import('vue-chart-3')
  Chart.register(LineController, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ...registerables)
  return LineChart
}
const LineChart = defineAsyncComponent(() => loadVueChart())
// import { LineChart } from 'vue-chart-3'
import dateFormatter, { numberFormatter } from 'src/components/charts/formatters'


export default {
  components: { LineChart },
  props: {
    query: {
      type: Object,
      default: null,
    },
    interval: {
      type: Number,
      default: 0,
    },
    graphData: {
      type: Object,
      default: null,
    },
  },
  // data() {
  //   return {
  //     periods: {
  //       day: 'statistics.periods.day',
  //       realtime: 'statistics.periods.realtime',
  //       '7d': 'statistics.periods.7d',
  //       '30d': 'statistics.periods.30d',
  //       month: 'statistics.periods.month',
  //       lastmonth: 'statistics.periods.lastmonth',
  //       '6mo': 'statistics.periods.6mo',
  //       '12mo': 'statistics.periods.12mo',
  //       custom: 'statistics.periods.custom',
  //     },
  //   }
  // },
  computed: {
    dataChart() {
      if (this.graphData === null) {
        return {
          data: {
            labels: [],
            datasets: [],
          },
          options: {},
        }
      }
      return this.generateCharData()
    },
  },
  methods: {
    generateCharData() {
      const self = this
      const label = self.query.filters.goal ? ` ${this.$t('statistics.visitorsConverted')} 222` : this.graphData.interval === 'minute' ? ' Просмотры страниц' : 'Посетителей \n'
      const dataSet = self.buildDataSet(self.graphData.plot, self.graphData.present_index, this.$refs.chart.canvasRef.getContext('2d'), label)
      return {
        data: {
          labels: self.graphData.labels,
          datasets: dataSet,
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              titleFont: { size: 18 },
              footerFont: { size: 14 },
              bodyFont: { size: 14 },
              titleMarginBottom: 8,
              bodySpacing: 6,
              footerMarginTop: 8,
              padding: { x: 10, y: 10 },
              multiKeyBackground: 'none',
              callbacks: {
                title(dataPoints) {
                  const data = dataPoints[0]
                  return dateFormatter(self.graphData.interval, true)(data.label)
                },
                beforeBody() {
                  self.drawnLabels = {}
                },
                label(item) {
                  const { dataset } = item
                  if (!self.drawnLabels[dataset.label]) {
                    self.drawnLabels[dataset.label] = true
                    const pluralizedLabel = item.formattedValue === '1' ? dataset.label.slice(0, -1) : dataset.label
                    return ` ${item.formattedValue} ${pluralizedLabel}`
                  }
                },
                footer(dataPoints) {
                  if (self.graphData.interval === 'month') {
                    return 'Кликните, чтобы \nувидеть данные за месяц'
                  }
                  if (self.graphData.interval === 'date') {
                    return 'Кликните, чтобы \nувидеть данные за день'
                  }
                },
              },
            },
          },
          animation: true,
          onResize(chart, dimensions) {
            chart.options.scales.x.ticks.maxTicksLimit = dimensions.width < 720 ? 5 : 8
            chart.options.scales.y.ticks.maxTicksLimit = dimensions.height < 233 ? 3 : 8
          },
          responsive: true,
          elements: { line: { tension: 0 }, point: { radius: 0 } },
          onClick(event, elements, chart) {
            const element = chart.getElementsAtEventForMode(event, 'index', { intersect: false })[0]
            const date = chart.data.labels[element.index]
            if (self.graphData.interval === 'month') {
              self.query.period = 'month'
              self.query.date = date
            } else if (self.graphData.interval === 'date') {
              self.query.period = 'day'
              self.query.date = date
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: numberFormatter,
                maxTicksLimit: 8,
              },
              grid: {
                zeroLineColor: 'transparent',
                drawBorder: false,
              },
            },
            x: {
              grid: { display: false },
              ticks: {
                maxTicksLimit: 8,
                callback(val, index, ticks) {
                  return dateFormatter(self.graphData.interval)(this.getLabelForValue(val))
                },
              },
            },
          },
        },
      }
    },
    buildDataSet(plot, present_index, ctx, label) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradient.addColorStop(0, 'rgba(154,79,212, 0.351)')
      gradient.addColorStop(1, 'rgba(255,255,255, 0.118)')
      const items = [
        {
          label,
          data: plot,
          borderWidth: 3,
          borderColor: 'rgb(154,79,213)',
          backgroundColor: gradient,
          fill: true,
        },
      ]
      if (present_index) {
        const dashedPart = plot.slice(present_index - 1)
        const dashedPlot = (new Array(plot.length - dashedPart.length)).concat(dashedPart)

        for (let i = present_index; i < plot.length; i++) {
          plot[i] = undefined
        }

        items.push({
          label,
          data: dashedPlot,
          borderWidth: 3,
          borderDash: [5, 10],
          borderColor: 'rgba(154,79,213)',
          backgroundColor: gradient,
          fill: true,
        })
      }

      return items
    },
  },
}
</script>
