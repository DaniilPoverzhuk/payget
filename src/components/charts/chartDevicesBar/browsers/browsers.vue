<template>
    <div class="chart-bar__box">
        <div class="chart-bar__scroll">
            <div class="chart-bar__legens">
                <p class="chart-bar__subtitle" v-for="(heads, key) in heads" :key="key">{{ $t(heads) }}</p>
            </div>
            <div class="chart-bar__items" v-if="!loading">
                <div class="chart-bar__item bar" v-for="(referrer, key) in sources" :key="key">
                    <Bar :all="sources" maxWidthDeduction="5rem" :class="{'chart-bar__item--noactive': graphStore.filters.browser_version}" :data="referrer" @setFilter="setFilter"></Bar>
                </div>
            </div>
        </div>
        <Loader class="chart-bar__nodata" v-show="loading" v-observe-visibility="sendRequest"></Loader>
    </div>
</template>

<script>
import Bar from '../../partsOfCharts/bar/bar.vue'
import Loader from 'src/components/loader/loader.vue'
import { createNamespacedHelpers } from 'vuex'
import axiosPlausible from 'src/axios-plausible'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')


export default {
  name: 'browsers',
  components: {
    Bar,
    Loader
  },
  props: {
    heads: {
      type: Array,
      default: null,
    },
  },
  computed: {
    ...mapUserState(['graphStore']),
  },
  watch: {
    graphStore() {
      this.getData()
    },
  },
  data() {
    return {
      loading: true,
      sources: null
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    ...mapUserMutations(['setGraphStore']),
    setFilter(name) {
      this.loading = true
      let tabName = ''
      if(!this.graphStore.filters.browser) { tabName = 'browser' } else if(!this.graphStore.filters.browser_version) { tabName = 'browser_version' }
      const newArr = JSON.parse(JSON.stringify(this.graphStore))
      newArr.filters[tabName] = name
      this.setGraphStore(newArr)
      this.getData()
    },
    async getData() {
      let link = 'browsers'
      if(this.graphStore.filters.browser || this.graphStore.filters.browser_version) { link = 'browser-versions' }
      try {
        const { status, data } = await axiosPlausible({
          method: 'get',
          url: `${process.env.VUE_APP_STATISTICS_URL}/${link}`,
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
  },
}
</script>
