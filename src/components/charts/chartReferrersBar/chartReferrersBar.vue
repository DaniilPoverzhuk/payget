<template>
    <div class="chart-bar">
        <p class="chart-bar__title">{{ $t(ranking.title) }}</p>
        <div class="chart-bar__tabs" v-if="stateTab !== 'referrer' && stateTab !== 'search_terms'">
            <Tab :tabs="ranking.tabs" :activeTabs="activeTabs" @setTab="setTab"></Tab>
        </div>
        <div class="chart-bar__box" :class="{'chart-bar__box--scroll':ranking.tabs[activeTabs].heads.length >= 3}">
            <div class="chart-bar__scroll">
                <div class="chart-bar__legens">
                    <p class="chart-bar__subtitle" v-for="(heads, key) in ranking.tabs[activeTabs].heads" :key="key">{{ $t(heads) }}</p>
                </div>
                <div class="chart-bar__items" v-if="!loading">
                    <div class="chart-bar__item bar" v-for="(referrer, key) in sources" :key="key">
                        <Bar v-if="stateTab == 'search_terms'" :all="sources" :maxWidthDeduction="ranking.tabs[activeTabs].heads.length == 4 ? '32rem' : '5rem'" :data="referrer"></Bar>
                        <Bar v-else :class="{'chart-bar__item--noactive': graphStore.filters.source && graphStore.filters.referrer || noActiveLink}" :all="sources" :maxWidthDeduction="ranking.tabs[activeTabs].heads.length == 4 ? '32rem' : '5rem'" :data="referrer" @setFilter="setFilter"></Bar>
                    </div>
                </div>
            </div>
        </div>
        <Loader class="chart-bar__nodata" v-show="loading" v-observe-visibility="sendRequest"></Loader>
        <div class="chart-bar__nodata" v-if="sources != null && sources.length == 0"> {{ $t('noDataYet') }}</div>
        <ChartsDetails v-if="!isHasFilters && !loading" :graphData="graphStore" :stateTab="stateTab" :detailsUrl="detailsUrl" :legens="ranking.tabs[activeTabs].legens" :title="ranking.title" @setFilter="setFilter"></ChartsDetails>
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
  name: 'chartReferrersBar',
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
      noActiveLink: false,
      loading: true,
      stateTab: 'source'
    }
  },
  watch: {
    graphStore() {
      this.loading = this.graphStore.period != 'realtime'
      this.getDatasources()
      this.getData()
    }
  },
  computed: {
    ...mapUserState(['graphStore', 'stateTabStore']),
    isHasFilters() {
      if (this.graphStore !== null && this.graphStore.filters) {
        return this.graphStore.filters[this.ranking.tabs[this.activeTabs].tabName.replace('-', '_')]
      }
      return false
    }
  },
  mounted() {
    this.getData()
    this.getDatasources()
  },
  methods: {
    ...mapUserMutations(['setGraphStore']),
    setFilter(name) {
      this.loading = this.graphStore.period != 'realtime'
      const tabName = this.ranking.tabs[this.activeTabs].tabName.replace('-', '_')
      const newArr = JSON.parse(JSON.stringify(this.graphStore))
      const queryTabName = this.stateTab
      newArr.filters[queryTabName] = name
      this.setGraphStore(newArr)
      this.getDatasources()
      this.getData()
    },
    async getDatasources() {
      if (this.graphStore.filters.search_terms) { this.stateTab = 'search_terms' } else if (this.graphStore.filters.referrer) { this.stateTab = 'referrer' } else { this.stateTab = 'source' }

      if (this.ranking.tabs[this.activeTabs].link !== 'sources' && this.ranking.tabs[this.activeTabs].link !== 'referrer') {
        this.noActiveLink = true
      }

      let uri = false
      if (this.graphStore.filters.source) { uri = this.graphStore.filters.source }
      if (!uri) return true
      this.detailsUrl = `${process.env.VUE_APP_STATISTICS_URL}/referrers/${uri}`
      try {
        const { status, data } = await axiosPlausible({
          method: 'get',
          url: `/referrers/${uri}`,
          params: {...this.graphStore, key: process.env.VUE_APP_STATISTICS_KEY},
        })
        if (status) {
          this.stateTab = data.search_terms ? 'search_terms' : data.referrers && this.stateTab != 'referrer' ? 'referrer' : 'search_terms'

          if (data.search_terms) {
            for (const i in data.search_terms) {
              data.search_terms[i].name = data.search_terms[i].name[0]
            }
            this.sources = data.search_terms
            this.stateTab = 'search_terms'
          } else if (data.referrers) {
            // this.setStateTabStore('referrer');
            this.sources = data.referrers
            this.stateTab = 'referrer'
          } else {
            this.sources = data.referrers
            this.stateTab = 'source'
          }
          this.loading = false
        }
      } catch {
        this.$error.show()
      }
    },
    async getData() {
      if (this.graphStore.filters.source && this.ranking.tabs[this.activeTabs].link == 'sources') return true
      this.loading = this.graphStore.period != 'realtime'
      this.detailsUrl = `${process.env.VUE_APP_STATISTICS_URL}/${this.ranking.tabs[this.activeTabs].link}`
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
      if (this.pagination) return
      this.$emit('load', isVisible)
    },
    setTab(tab) {
      this.loading = true
      this.noActiveLink = false
      this.activeTabs = tab
      this.stateTab = this.ranking.tabs[tab].tabName
      this.sources = null
      this.getData()
    },
  },
}
</script>

