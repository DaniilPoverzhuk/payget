<template>
    <div class="charts-details"><button class="charts-details__wrap" @click="getMore()"><svg class="charts-details__icon" v-svg symbol="details" size="24"></svg><span class="charts-details__text">{{ $t('statistics.details') }}</span>
            <Dialog v-model="detailsDialogBtn" classCustom="details-dialog" width="550" :heading="title" @hide="detailsDialogBtn = false">
                <Loader class="chart-bar__nodata" v-show="loading"></Loader>
                <div class="details-dialog__scroll">
                    <table class="charts-details__table" v-if="!loading">
                        <thead v-if="legens != null">
                            <th class="charts-details__th" v-for="legen in legens" :key="legen" v-text="$t(translationLegens[legen])"></th>
                        </thead>
                        <tbody v-if="data != null">
                            <tr class="charts-details__tr" v-for="(tr, i) in data" :key="i">
                                <td class="charts-details__td" v-if="tr.name" :class="{'no-events': map && graphStore.filters && graphStore.filters.country && graphStore.filters.country == tr.name}" @click="getName(tr.name)">
                                    <div class="charts-details__box"><img class="bar__img" v-if="tr.url" :src="`https://icons.duckduckgo.com/ip3/${tr.url}.ico`" referrerPolicy="no-referrer" /><span>{{setName(tr.name)}}</span></div>
                                </td>
                                <td class="charts-details__td" v-if="legens.indexOf('count') >= 0">{{getFormat(tr.count == 0 ? 0 : tr.count)}}</td>
                                <td class="charts-details__td" v-if="legens.indexOf('pageviews') >= 0">{{getFormat(tr.pageviews == 0 || tr.pageviews == null ? 0 : tr.pageviews)}}</td>
                                <td class="charts-details__td" v-if="legens.indexOf('entries') >= 0">{{getFormat(tr.entries == 0 || tr.entries == null ? 0 : tr.entries)}}</td>
                                <td class="charts-details__td" v-if="legens.indexOf('bounce_rate') >= 0"> {{ tr.bounce_rate == 0 || tr.bounce_rate == null ? '0' : tr.bounce_rate}}%</td>
                                <td class="charts-details__td" v-if="legens.indexOf('visit_duration') >= 0">{{getTime(tr.visit_duration == 0 ||  tr.visit_duration == null ? 0 : tr.visit_duration)}}</td>
                                <td class="charts-details__td" v-if="legens.indexOf('time_on_page') >= 0">{{getTime(tr.time_on_page == 0 ||  tr.time_on_page == null ? 0 : tr.time_on_page)}}</td>
                                <td class="charts-details__td" v-if="legens.indexOf('exits') >= 0">{{getFormat(tr.exits == 0 || tr.exits == null ? 0 : tr.exits)}}</td>
                                <td class="charts-details__td" v-if="legens.indexOf('exit_rate') >= 0"> {{ tr.exit_rate == 0 || tr.exit_rate == null ? '0' : tr.exit_rate}}%</td>
                                <td class="charts-details__td" v-if="legens.indexOf('countMap') >= 0">{{getFormat(tr.count == 0 ? 0 : tr.count)}}<span class="charts-details__sub">({{ tr.percentage == 0 || tr.percentage == null ? '0' : tr.percentage}}%)</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Dialog>
        </button></div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Dialog from 'src/components/dialog/dialog-q.vue'
import dateFormatter, { countries } from '../../formatters'
import Loader from 'src/components/loader/loader.vue'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')

export default {
  name: 'ChartsDetails',
  components: {
    Dialog,
    Loader,
  },
  props: {
    detailsUrl: {
      type: String,
      default: '',
    },
    graphData: {
      type: Object,
      default: null,
    },
    legens: {
      type: Array,
      default: null,
    },
    map: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    stateTab: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      detailsDialogBtn: false,
      data: null,
      loading: true,
      translationLegens: {
        pageviews: 'statistics.translationLegens.pageviews',
        bounce_rate: 'statistics.dataLabels.rateBounce',
        time_on_page: 'statistics.translationLegens.timePage',
        name: 'statistics.source',
        count: 'statistics.visitors',
        visit_duration: 'statistics.translationLegens.visitDuration',
        exit_rate: 'statistics.translationLegens.exitRate',
        exits: 'statistics.translationLegens.exits',
        entries: 'statistics.translationLegens.entries',
        countMap: 'statistics.visitors',
        country: 'statistics.visitors',
      },
    }
  },
  computed: {
    ...mapUserState(['graphStore']),
  },
  methods: {
    ...mapUserMutations(['setGraphStore']),
    getName(data) {
      this.detailsDialogBtn = false
      setTimeout(() => {
        const newArr = JSON.parse(JSON.stringify(this.graphStore))
        newArr.filters[this.stateTab] = data
        this.setGraphStore(newArr)
      }, 0)
    },
    getMore(name) {
      this.detailsDialogBtn = true
      this.getData()
    },
    setName(name) {
      return this.map && countries(name) ? countries(name) : name
    },
    getTime(time) {
      if (time == 0) return `0${this.$t('time.s')}`
      const t = (time / 60).toFixed(2).split('.')
      return t[1] && t[0] > 0 ? `${t[0]}${this.$t('time.m')} ${t[1]}${this.$t('time.s')}` : `${t[1]}${this.$t('time.s')}`
    },
    getFormat(count) {
      return count >= 1000 ? `${parseInt((count / 1000) * 10) / 10} ${this.$t('degrees.thousand')}.` : count
    },
    async getData() {
      try {
        const { status, data } = await this.$instance({
          method: 'get',
          url: this.detailsUrl,
          params: {
            ...this.graphData,
            limit: 100,
            page: 1,
            detailed: true,
            show_noref: true,
            key: process.env.VUE_APP_STATISTICS_URL,
          },
        })
        if (status) {
          this.data = data
          this.loading = false
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.details-dialog {
  max-width: 860px;
  width: 100%;
  padding: 16px;

  @media (min-width: 1200px) {
    padding: 16px 32px;
  }

  .dialog__heading {
    text-align: left;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--c-gray-20);;
  }

  &__scroll {
    overflow-x: auto;
  }

  .no-events {
    pointer-events: none;
  }
}

.charts-details {
  &__wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: pointer;
    margin-top: 16px;
  }

  &__text {
    text-transform: uppercase;
    color: var(--c-gray-70);
    font-size: 16px;
    font-weight: 600;
  }

  &__icon {
    stroke-width: 2px;
    margin-right: 8px;
  }

  &__table {
    border-spacing: 0;
    width: 100%;
  }

  &__th {
    font-size: 12px;
    color: var(--c-gray-70);
    text-align: left;
    white-space: nowrap;
  }

  &__th:not(:first-child) {
    padding: 8px;
  }

  &__td {
    font-size: 14px;
    padding: 8px;
    white-space: nowrap;
  }

  &__th:not(:first-child),
  &__td:not(:first-child) {
    text-align: right;
  }

  &__tr:nth-child(odd) {
    background-color: #f1f5f8;
  }

  &__td:not(:first-child) {
    font-weight: 700;
  }

  &__box {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  &__sub {
    margin-left: 5px;
    font-size: 12px;
    font-weight: var(--fw-600);
  }
}
</style>
