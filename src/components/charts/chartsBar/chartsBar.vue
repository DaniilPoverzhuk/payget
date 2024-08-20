<template>
    <div class="chart-bar">
        <p class="chart-bar__title"> {{ $t(ranking.title) }}</p>
        <div class="chart-bar__tabs" v-if="ranking.tabs.length >= 3">
            <Tab :tabs="ranking.tabs" :activeTabs="activeTabs" @setTab="setTab"></Tab>
        </div>
        <div class="chart-bar__box" :class="{'chart-bar__box--scroll':ranking.tabs[activeTabs].heads.length >= 3}">
            <div class="chart-bar__scroll">
                <div class="chart-bar__legens">
                    <p class="chart-bar__subtitle" v-for="(heads, key) in ranking.tabs[activeTabs].heads" :key="key" :class="{'bar__num bar__num--rate' : key == 3, 'bar__num--total': key == 2}">{{ $t(heads) }}</p>
                </div>
                <div class="chart-bar__items" v-if="!loading">
                    <div class="chart-bar__item bar" v-for="(referrer, key) in sources" :key="key">
                        <Bar class="chart-bar__item--noactive" v-if="isHasFilters" :all="sources" :maxWidthDeduction="ranking.tabs[activeTabs].heads.length == 4 ? '32rem' : '5rem'" :data="referrer"></Bar>
                        <Bar v-else :all="sources" :maxWidthDeduction="ranking.tabs[activeTabs].heads.length == 4 ? '32rem' : '5rem'" :data="referrer" @setFilter="setFilter"></Bar>
                    </div>
                </div>
            </div>
        </div>
        <Loader class="chart-bar__nodata" v-show="loading" v-observe-visibility="sendRequest"></Loader>
        <div class="chart-bar__nodata" v-if="sources != null && sources.length == 0"> {{ $t('noDataYet') }}</div>
        <ChartsDetails v-if="!isHasFilters && !loading && ranking.tabs[activeTabs].heads.length &lt; 3" :graphData="graphStore" :stateTab="ranking.tabs[activeTabs].tabName" :detailsUrl="detailsUrl" :legens="ranking.tabs[activeTabs].legens" :title="ranking.title"></ChartsDetails>
    </div>
</template>

<script>
import Loader from 'src/components/loader/loader.vue'
import Bar from '../partsOfCharts/bar/bar.vue'
import Tab from '../partsOfCharts/tab/Tab.vue'
import ChartsDetails from '../partsOfCharts/details/chartsDetails.vue'
import { createNamespacedHelpers } from 'vuex'
import axiosPlausible from 'src/axios-plausible'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')

export default {
  components: {
    Tab,
    Bar,
    ChartsDetails,
    Loader
  },
  props: {
    ranking: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      activeTabs: 0,
      sources: null,
      detailsUrl: '',
      loading: true
    }
  },
  watch: {
    graphStore() {
      this.loading = this.graphStore.period != 'realtime'
      this.getData()
    },
  },
  computed: {
    ...mapUserState(['graphStore']),
    isHasFilters() {
      if (this.graphStore !== null && this.graphStore.filters) {
        return this.graphStore.filters[this.ranking.tabs[this.activeTabs].tabName.replace('-', '_')]
      }
      return false
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    ...mapUserMutations(['setGraphStore']),
    setFilter(name) {
      this.loading = this.graphStore.period != 'realtime'
      const tabName = this.ranking.tabs[this.activeTabs].tabName.replace('-', '_')
      const newArr = JSON.parse(JSON.stringify(this.graphStore))
      newArr.filters[tabName] = name
      this.setGraphStore(newArr)
      this.getData()
    },
    async getData() {
      this.detailsUrl = `${this.ranking.tabs[this.activeTabs].link}`
      try {
        const { status, data } = await axiosPlausible({
          method: 'get',
          url: `${this.ranking.tabs[this.activeTabs].link}`,
          params: {...this.graphStore, key: process.env.VUE_APP_STATISTICS_KEY},
        })
        if (status) {
          this.sources = data
          this.loading = false
        }
      } catch {
        this.$error.show()
      }
    },

    sendRequest(isVisible) {
      this.$emit('load', isVisible)
    },
    setTab(tab) {
      this.activeTabs = tab
      this.loading = true
      this.sources = null
      this.getData()
    },
  },
}
</script>

<style lang="scss">

.chart-bar {
  width: 100%;
  height: 100%;
  padding: 32px 16px;
  box-shadow: 0 3px 17px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;

  @media (min-width: 1200px) {
    padding: 32px;
  }

  &__title {
    font-size: 26px;
    font-weight: var(--fw-600);
    color: var(--c-gray-80);
    padding-bottom: 24px;
    @media (min-width: 1200px) {
      padding-bottom: 16px;
    }
  }

  &__subtitle {
    font-size: 14px;
    color: var(--c-gray-70);
    margin-right: 53px;

    &:first-child {
      flex-grow: 1;
    }

    &:last-child {
      margin-right: 0;

    }
  }


  &__legens {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;

  }

  &__box {
    flex-grow: 1;
    &--scroll {
      overflow-x: auto;

      .chart-bar__scroll {
        padding-bottom: 16px;
        min-width: 554px;
      }
    }
  }

  &__item {
    margin-bottom: 8px;

    &--noactive {
      pointer-events: none;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__tabs {
    margin-bottom: 24px;

    @media (min-width: 1200px) {
      margin-bottom: 0;
    }
  }

  &__nodata {
    font-weight: var(--fw-500);
    text-align: center;

    @media (min-width: 1200px) {
      min-height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-grow: 1;
    }
  }
}
</style>
