<template>
    <div class="chart">
        <div class="chart__head">
            <div class="chart__box">
                <div class="chart__title">{{ $t('statistics.statisticsVisit') }}</div>
                <div class="statistics__current-visitors" v-if="graphStore.filters == null || graphStore.filters && Object.keys(graphStore.filters).length == 0">
                    <CurrentVisitors></CurrentVisitors>
                </div>
                <chartFilter v-if="graphStore.filters !== null && graphStore.filters" :data="graphStore.filters" @closeFilter="closeFilter"></chartFilter>
            </div>
            <div class="chart__dropdown dropdown">
                <div class="chart__arows arrows" v-if="query.period == 'day' || query.period == 'month' || query.period == 'lastmonth'"><button class="arrows__item" @click="renderArrows('left')"><svg class="arrows__icons arrows__icons--left" v-svg symbol="arrow" size="16"></svg></button><button class="arrows__item" @click="renderArrows('right')" :class="{'arrows__item--disable': isDisablArrow }"><svg class="arrows__icons arrows__icons--right" v-svg symbol="arrow" size="16"></svg></button></div>
                <Flatpickr ref="flat" @doCloseCalendar="doCloseCalendar"></Flatpickr><button class="dropdown__toggle" :class="[dropdown && 'dropdown__toggle_active']" type="button" @click="dropdown = !dropdown">{{ $t(dropdownLabel)}}<svg class="dropdown__toggle-icon" v-svg :class="dropdown && 'dropdown__toggle-icon_active'" symbol="arrow"></svg></button>
                <transition name="fade"></transition>
                <ul class="dropdown__list" v-if="dropdown" v-click-outside="() => {dropdown = false}">
                    <li class="dropdown__item" v-for="(period, key) in periods" :key="key"><button class="dropdown__link" :class="key == query.period && 'dropdown__link--active'" @click="chooseBooking(key)">{{ $t(period) }}</button></li>
                </ul>
            </div>
        </div>
        <div class="chart__wrap">
            <div class="chart__label">
                <div class="label">
                    <div class="label__item" v-for="(label, key) in labels" :key="label.name">
                        <p class="label__title">{{ $t(dataLabels[key]) }}</p>
                        <div class="label__wrap">
                            <div class="label__hint" v-if="label.count"> {{ addSpaces(label.count) }} {{ dataLabels[key] }}</div>
                            <div class="label__num" :class="{'label__num--hint': label.count}"> {{ topStatNumberShort(label) }}</div>
                            <div class="label__rating rating" :class="getColor(label.name, label.change)"><svg class="label__icon" v-if="label.change !== 0 " :class="{'label__icon--rotate': label.change > 0}" v-svg symbol="arowdown" size="20"></svg>
                                <p class="label__text">{{ renderComparison(label.name, label.change) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="chart__download" @click="getDownloadFile()"><svg class="chart__download-icon" v-svg symbol="download"></svg><span class="chart__download--label">{{ $t('button.save') }}</span></div>
            </div>
            <GraphBar v-if="isClient" class="scaleWidth" :interval="interval" :query="query" :graphData="graphData"></GraphBar>
        </div>
    </div>
</template>

<script>
import {defineAsyncComponent} from 'vue'
import dateFormatter, {
  numberFormatter,
  durationFormatter,
  getMonthName,
  shiftArrowDays,
  shiftMonths,
  isToday,
} from '../formatters'
// import GraphBar from 'src/components/charts/chartVisits/graphBar/graphBar.vue'
import Flatpickr from 'src/components/charts/chartVisits/flatpickr/flatpickr.vue'
import CurrentVisitors from 'src/components/charts/current-visitors/current-visitors.vue'
import chartFilter from 'src/components/charts/chartVisits/chartFilter/chartFilter.vue'

async function loadGraphBar() {
  const GraphBar = await import('src/components/charts/chartVisits/graphBar/graphBar.vue')
  return GraphBar
}
const GraphBar = defineAsyncComponent(() => loadGraphBar())

import { createNamespacedHelpers } from 'vuex'
import axiosPlausible from 'src/axios-plausible'

const {
  mapState: mapUserState,
  mapMutations: mapLayoutMutations,
} = createNamespacedHelpers('user')

export default {
  components: {
    GraphBar,
    CurrentVisitors,
    chartFilter,
    Flatpickr
  },
  data() {
    return {
      dataLabels: [
        'statistics.dataLabels.visitorsUnique',
        'statistics.dataLabels.sessionsTotal',
        'statistics.dataLabels.rateBounce',
        'statistics.dataLabels.durationSession',
      ],
      periods: {
        day: 'statistics.periods.day',
        realtime: 'statistics.periods.realtime',
        '7d': 'statistics.periods.7d',
        '30d': 'statistics.periods.30d',
        month: 'statistics.periods.month',
        lastmonth: 'statistics.periods.lastmonth',
        '6mo': 'statistics.periods.6mo',
        '12mo': 'statistics.periods.12mo',
        custom: 'statistics.periods.custom',
      },
      dropdown: false,
      isDisablArrow: true,
      dropdownLabel: 'statistics.periods.day',
      timeout: 5000,
      interval: null,
      graphData: null,
      query: {
        period: 'day',
        date: this.getCurDate(),
        filters: {},
      }
    }
  },
  watch: {
    query: {
      handler: function (val, oldVal) {
        this.loadingData()
      },
      deep: true,
    },
    graphStore() {
      this.getData(this.graphStore, false)
    }
  },
  computed: {
    ...mapUserState(['graphStore', 'stateTabStore']),
    isClient() {
      return typeof window !== 'undefined'
    },
    labels() {
      if (this.graphData === null) {
        return {}
      }
      return this.graphData.top_stats
    },
    filterQuery() {
      const filter = this.query
      return filter
    },
  },
  async mounted() {
    await this.loadingData()
  },
  methods: {
    ...mapLayoutMutations(['setGraphStore', 'setStateTabStore']),
    getCurDate() {
      const today = new Date(new Date().toUTCString())
      return today.getFullYear() + '-' + ('0' + (parseInt(today.getMonth()) + 1)).slice(-2) + '-' + ('0' + (parseInt(today.getDate()))).slice(-2)
    },
    getDownloadFile() {
      document.location.href = `${process.env.VUE_APP_STATISTICS_URL}/visitors.csv?` + encodeURI(JSON.stringify(this.setGraphStore))
    },
    closeFilter(filter) {
      const copyGraphStore = JSON.parse(JSON.stringify(this.graphStore))
      for (const item in filter) {
        delete copyGraphStore.filters[filter[item]]
      }
      this.setGraphStore(copyGraphStore)
      this.getData(copyGraphStore)
    },
    addSpaces(str) {
      return str.toString().split('').reverse().join('').match(/.{1,3}/g).join(' ').split('').reverse().join('')
    },
    topStatNumberShort(stat) {
      if (typeof (stat.duration) == 'number') {
        return durationFormatter(stat.duration)
      } else if (typeof (stat.count) == 'number') {
        return numberFormatter(stat.count)
      } else {
        return stat.percentage + '%'
      }
    },
    getSelectPeriodLabel() {
      if ((this.query.period === 'custom' || this.query.period === 'day') && this.query.date) {
        if (!isToday(this.query.date)) {
          const dateObj = new Date(this.query.date)
          this.dropdownLabel = dateObj.getDate() + ' ' + getMonthName(dateObj.getMonth(), 'short')
          this.isDisablArrow = false
        } else {
          this.isDisablArrow = true
          this.query.period = 'day'
          const month = ('0' + (parseInt(new Date().getMonth()) + 1)).slice(-2)
          this.query.date = new Date().getFullYear() + '-' + month + '-' + ('0' + (parseInt(new Date().getDate()))).slice(-2)
          this.dropdownLabel = this.periods.day
        }
      } else if (this.query.period === 'custom' && !this.query.date) {
        const fromDateObj = new Date(this.query.from),
          toDateObj = new Date(this.query.to)
        this.dropdownLabel = fromDateObj.getDate() + ' ' + getMonthName(fromDateObj.getMonth(), 'short') + ' - ' + toDateObj.getDate() + ' ' + getMonthName(toDateObj.getMonth(), 'short')
      } else if (this.query.period === 'lastmonth' && this.query.date) {
        const dateObj = new Date(this.query.date)
        this.dropdownLabel = getMonthName(dateObj.getMonth(), 'long') + ' ' + dateObj.getFullYear()
      } else if (this.query.period === 'month' && this.query.date) {
        const dateObj = new Date(this.query.date)
        if (dateObj.getMonth() == new Date().getMonth()) { this.dropdownLabel = this.periods[this.query.period] } else { this.dropdownLabel = getMonthName(dateObj.getMonth(), 'long') + ' ' + dateObj.getFullYear() }
      } else { this.dropdownLabel = this.periods[this.query.period] }
    },
    doCloseCalendar(value) {
      const date_val = value,
        date_range = date_val.split(' — ')
      if (date_range.length) {
        if (date_range.length == 2) {
          this.getData({
            period: 'custom',
            date: false,
            from: date_range[0],
            to: date_range[1],
            filters: this.graphStore.filters
          })
          this.query.period = 'custom'
          this.query.date = false
          this.query.from = date_range[0]
          this.query.to = date_range[1]
          this.query.filters = this.graphStore.filters
        } else if(date_range.length == 1 && date_range[0].length) {
          this.getData({
            period: 'day',
            date: date_range[0].trim(),
            from: false,
            to: false,
            filters: this.graphStore.filters
          })
          this.query.period = 'custom'
          this.query.date = date_range[0].trim()
          this.query.filters = this.graphStore.filters
        }else{
          return true
        }
        this.getSelectPeriodLabel()
      }
    },
    chooseBooking(key) {
      this.dropdown = false
      const dateNow = new Date()
      const month = ('0' + (parseInt(dateNow.getMonth()) + 1)).slice(-2)
      if (key == 'day') this.query.date = dateNow.getFullYear() + '-' + month + '-' + ('0' + (parseInt(dateNow.getDate()))).slice(-2)
      if (key != 'custom') this.query.period = key
      if (key == 'custom') {
        this.$refs.flat?.openFlatPickr()
      }
      if (key !== 'day' && key !== 'custom' && key !== 'realtime') {
        this.query.date = dateNow.getFullYear() + '-' + month + '-' + ('0' + (parseInt(dateNow.getDate()))).slice(-2)
        this.query.from = null
        this.query.to = null
        this.query.filters = this.graphStore.filters
      }
      this.getSelectPeriodLabel()
    },
    renderArrows(direction) {
      if (this.query.period === 'day') {
        let dir = 1
        if (direction == 'left') {
          dir = -1
        }
        const newDate = new Date(shiftArrowDays(new Date(this.query.date), dir))
        const month = ('0' + (parseInt(newDate.getMonth()) + 1)).slice(-2)
        const day = ('0' + (newDate.getDate())).slice(-2)

        if (newDate.setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)) {
          this.query.date = newDate.getFullYear() + '-' + month + '-' + ('0' + (parseInt(day))).slice(-2)
          this.getData(this.query)
          this.getSelectPeriodLabel()
        }
      } else if (this.query.period === 'month' || this.query.period === 'lastmonth') {
        let dir = 1
        if (direction == 'left') {
          dir = -1
        }
        const newDate = new Date(shiftMonths(new Date(this.query.date), dir)),
          month = ('0' + (parseInt(newDate.getMonth()) + 1)).slice(-2),
          day = ('0' + (newDate.getDate())).slice(-2)
        if (newDate.getTime() <= new Date(new Date().toISOString().split('T')[0]).getTime()) {
          this.query.date = newDate.getFullYear() + '-' + month + '-' + ('0' + (parseInt(day))).slice(-2)
          this.getData(this.query)
          this.getSelectPeriodLabel()
        }
      }
    },
    getColor(name, comparison) {
      if (comparison > 0) {
        return name === 'Bounce rate' ? 'label__rating--red' : 'label__rating--green'
      } else if (comparison < 0) {
        return name === 'Bounce rate' ? 'label__rating--green' : 'label__rating--red'
      } else if (comparison === 0) {
        return 'label__rating--grey'
      }
    },
    renderComparison(name, comparison) {
      const formattedComparison = numberFormatter(Math.abs(comparison))
      if (comparison > 0) {
        return `${formattedComparison}%`
      } else if (comparison < 0) {
        return `${formattedComparison}%`
      } else if (comparison === 0) {
        return 'N/A'
      }
    },

    async loadingData() { // change except custom
      if (this.query.period !== 'custom') await this.getData(this.filterQuery)
      if (this.query.period === 'realtime') {
        this.interval = setInterval(() => this.getData(this.filterQuery), this.timeout)
        return
      }
      if (this.query.period !== 'realtime' && this.interval) {
        clearInterval(this.interval)
      }
    },
    async getData(obj, store = true) { // sending
      store === true && this.setGraphStore(obj)
      try {
        const { status, data } = await axiosPlausible({
          method: 'get',
          url: '/main-graph',
          params: {...obj, key: process.env.VUE_APP_URL_STATISTICS_KEY},
        })

        if (status) {
          this.graphData = data
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.scaleWidth {
  width: 99%;
}
.chart {
  &__wrap {
    padding: 16px;
    box-shadow: 0 3px 17px rgba(0, 0, 0, 0.08);
    @media (min-width: 1200px) {
      padding: 32px;
    }
  }

  &__title {
    color: var(--c-gray-80);
    font-size: 26px;
    line-height: 31px;
    font-weight: var(--fw-600);
    margin-bottom: 24px;
    white-space: nowrap;

    @media (min-width: 1200px) {
      margin-right: 24px;
      margin-bottom: 0;
    }
  }

  &__label {
    margin-bottom: 24px;
    @media (min-width: 1200px) {
      margin-bottom: 0;
      display: flex;
      flex-shrink: 0;
      justify-content: space-between;
    }

    .label {


      @media (min-width: 1200px) {
        margin: 0 -3.429%;
        display: flex;
        flex-grow: 1;
      }


      &__title {
        white-space: nowrap;
        color: var(--c-gray-70);
        font-size: var(--fz-lg);
      }


      &__wrap {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        position: relative;

        @media (min-width: 1200px) {
          justify-content: space-between;
        }


        &:hover {
          .label__hint {
            opacity: 1;
          }

          .label__num:after {
            opacity: 1;
          }
        }
      }


      &__hint {
        position: absolute;
        background: var(--c-gray-80);
        color: white;
        font-size: 14px;
        padding: 6px 20px;
        top: -36px;
        left: -15%;
        white-space: nowrap;
        opacity: 0;
        transition: 0.3s opacity;
        text-transform: lowercase;
        cursor: pointer;
        border-radius: 4px;
      }

      &__num {
        color: var(--c-gray-80);
        font-weight: var(--fw-600);
        font-size: 24px;
        margin-right: 16px;
        position: relative;
        cursor: pointer;

        &--hint {
          &:after {
            content: '';
            width: 8px;
            height: 8px;
            display: block;
            background: var(--c-gray-80);
            position: absolute;
            transform: rotate(45deg);
            left: calc(50% - 4px);
            top: -5px;
            opacity: 0;
            transition: 0.3s opacity;
          }
        }
      }

      &__rating {
        display: flex;
        align-items: center;
        padding: 2px 10px;
        border-radius: 12px;

        &--red {
          background: #FEE2E2;

          .label__icon {
            stroke: #EF4444;
          }

          .label__text {
            color: #991B1B;
          }
        }

        &--green {
          background: #D1FAE5;

          .label__icon {
            stroke: #10B981;
          }

          .label__text {
            color: #065F46;
          }
        }
      }

      &__text {
        font-weight: var(--fw-500);
        line-height: 20px;
      }

      &__icon {
        margin-right: 5px;

        &--rotate {
          transform: rotate(180deg);
          font-size: 14px;
        }
      }

      &__item {
        padding: 16px 0;
        border-bottom: 1px solid var(--c-gray-20);
        @media (min-width: 1200px) {
          margin-bottom: 40px;
          padding: 0 3.429%;
          border-bottom: 0;
          border-right: 1px solid var(--c-gray-20);
        }

        &:last-child {
          border-right: 0;
        }
      }
    }
  }

  &__box {
    @media (min-width: 1200px) {
      flex-grow: 1;
      align-items: flex-end;
      display: flex;
    }
  }

  &__head {

    margin: 32px 0 24px;

    @media (min-width: 1200px) {
      display: flex;
      align-items: center;
    }
  }


  &__arows {
    display: flex;
    align-items: center;
    margin-right: 16px;
  }

  &__download {
    position: relative;
    cursor: pointer;
    margin-top: 16px;
    display: flex;

    @media (min-width: 1200px) {
      margin-top: 0;
    }

    &-icon {
      width: 24px;
      height: 24px;
      stroke: var(--c-primary);
      stroke-width: 2px;

      @media (min-width: 1200px) {
        stroke-width: 2px;
        stroke: var(--c-gray-70);
      }
    }

    &:hover &-icon {
      stroke: var(--c-primary);
    }

    &--label {
      margin-right: 8px;
      color: var(--c-primary);
      display: none;

      @media (min-width: 1200px) {
        display: none;
      }
    }
  }

  .arrows {
    border: 1px solid var(--c-gray-15);
    width: 75px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    background: var(--c-white);
    margin-top: 16px;

    @media (min-width: 1200px) {
      margin-top: 0;
    }

    &__item {
      padding: 5px 12px;
      border-right: 1px solid var(--c-gray-15);
      cursor: pointer;
      display: block;


      &--disable .icon {
        fill: var(--c-gray-15);
      }

      &:last-child {
        border-right: 0;
      }
    }

    &__icons {
      width: 12px;
      height: 12px;
      fill: var(--c-gray-80);
      transition: 0.3s;

      &--left {
        transform: rotate(90deg);
      }

      &--right {
        transform: rotate(-90deg);
      }
    }

    &__item:hover:not(&__item--disable) .icon {
      fill: var(--c-primary);
    }
  }

  &__dropdown {
    display: flex;
    flex-direction: column-reverse;
    justify-items: flex-start;
    align-items: flex-start;
    margin: 16px 0;

    @media (min-width: 1200px) {
      align-items: center;
      flex-direction: row;
      margin: 0;
    }
  }

  .dropdown {
    position: relative;

    &__toggle {
      display: inline-block;
      padding: 9px 36px 9px 16px;
      background-color: var(--c-white);
      font-weight: 800;
      font-size: var(--fz-sm);
      line-height: var(--lh-sm);
      cursor: pointer;
      position: relative;
      color: var(--c-gray-80);
      border: 1px solid #E6E6EA;
      box-sizing: border-box;
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
      border-radius: 6px;
      width: 100%;
      white-space: nowrap;

      &-icon {
        position: absolute;
        right: 9px;
        display: block;
        width: 7px;
        height: 4px;
        top: calc(50% - 2px);
        fill: var(--c-gray-70);
        transition-property: transform;
        transition-duration: var(--t);

        &_active {
          transform: rotate(180deg);
        }
      }
    }

    &__list {
      line-height: var(--lh-sm);
      padding: 8px 0;
      position: absolute;
      background-color: var(--c-white);
      box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1);
      border-radius: var(--bdrs-default);
      top: 46px;
      font-weight: 500;
      font-size: var(--fz-md);
      z-index: 10;
      @media (min-width: 1200px) {
        width: 237px;
        top: calc(100% + 10px);
        right: 0;
      }
    }

    &__link {
      text-decoration: none;
      color: var(--c-gray-70);
      transition-property: color, background-color;
      transition-duration: var(--t);
      font-size: var(--fz-sm);
      padding: 8px 16px;
      width: 100%;
      @media (min-width: 1200px) {
        display: block;


        outline: none;
        cursor: pointer;

        &:hover,
        &:focus {
          background-color: var(--c-gray-10);
        }

        &:active {
          color: var(--c-white) !important;
          background-color: var(--c-primary) !important;
        }

        &_active {
          color: var(--c-gray-70);
        }
      }

      &--active {
        background-color: var(--c-primary);
        color: var(--c-white);

        &:hover {
          background-color: var(--c-primary);
        }
      }
    }

    &__item {

      &:nth-child(even) {
        border-bottom: 1px solid var(--c-gray-10);
      }
    }
  }

  &__filter {

  //flex-wrap: wrap;
  }


}
</style>
