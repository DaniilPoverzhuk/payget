<template>
    <div class="chart-bar">
        <p class="chart-bar__title">{{ $t('statistics.countries') }}</p><Map :data="data" :referrers="referrers" @setCountry="setCountry"></Map>
        <ChartsDetails v-if="referrers !== null" :detailsUrl="detailsUrl" :graphData="graphStore" :legens="['country', 'countMap']" :title="$t('statistics.countries')" stateTab="country" :map="true"></ChartsDetails>
        <Loader class="chart-bar__nodata" v-show="referrers == null" v-observe-visibility="sendRequest"></Loader>
    </div>
</template>

<script>
import Map from './map/map.vue'
import Loader from 'src/components/loader/loader.vue'
import ChartsDetails from '../partsOfCharts/details/chartsDetails.vue'
import * as d3 from 'd3v4'
import { createNamespacedHelpers } from 'vuex'
import axiosPlausible from 'src/axios-plausible'
const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')

export default {
  name: 'chartsMap',
  components: {
    Map,
    Loader,
    ChartsDetails
  },
  computed: {
    ...mapUserState(['graphStore']),
  },
  data() {
    return {
      darkTheme: false,
      referrers: null,
      sendRequest: false,
      data: null,
      acriveCode: '',
      detailsUrl: `${process.env.VUE_APP_STATISTICS_URL}/countries`
    }
  },
  watch: {
    graphStore() {
      this.getData()
    }
  },
  async mounted() {
    await this.getData()
  },
  methods: {
    ...mapUserMutations(['setGraphStore']),

    setCountry(code) {
      if(code != this.acriveCode) {
        this.acriveCode = code
        const newArr = JSON.parse(JSON.stringify(this.graphStore))
        newArr.filters.country = code
        this.setGraphStore(newArr)
      }
    },
    getDataset(data) {
      const dataset = {}
      const onlyValues = data.map(obj => { return obj.count })
      const maxValue = Math.max.apply(null, onlyValues)
      const paletteScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([
          this.darkTheme ? '#2e3954' : '#f3ebff',
          this.darkTheme ? '#45ff00' : '#9A4FD5'
        ])

      this.referrers.forEach((item) => {
        dataset[item.name] = { numberOfThings: item.count, fillColor: paletteScale(item.count) }
      })
      return dataset
    },
    async getData() {
      try {
        const { status, data } = await axiosPlausible({
          method: 'get',
          url: '/countries',
          params: {...this.graphStore, key: process.env.VUE_APP_STATISTICS_KEY},
        })
        if (status) {
          this.referrers = data
          this.data = this.getDataset(data)
        }
      } catch {
        this.$error.show()
      }
    },
  }
}
</script>
