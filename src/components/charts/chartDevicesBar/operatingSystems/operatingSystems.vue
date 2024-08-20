<template>
    <div class="chart-bar__box">
        <div class="chart-bar__scroll">
            <div class="chart-bar__legens">
                <p class="chart-bar__subtitle" v-for="(heads, key) in heads" :key="key"> {{ $t(heads) }}</p>
            </div>
            <div class="chart-bar__items" v-if="!loading">
                <div class="chart-bar__item bar" v-for="(referrer, key) in sources" :key="key">
                    <Bar :all="sources" :class="{'chart-bar__item--noactive': graphStore.filters.os_version}" maxWidthDeduction="5rem" :data="referrer" @setFilter="setFilter"></Bar>
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
  name: 'operatingSystems',
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
    sendRequest(isVisible) {
      this.$emit('load', isVisible)
    },
    setFilter(name) {
      this.loading = true
      let tabName = ''
      if(!this.graphStore.filters.os) { tabName = 'os' } else if(!this.graphStore.filters.os_version) { tabName = 'os_version' }
      const newArr = JSON.parse(JSON.stringify(this.graphStore))
      newArr.filters[tabName] = name
      this.setGraphStore(newArr)
      this.getData()
    },
    async getData() {
      let link = 'operating-systems'
      if(this.graphStore.filters.os || this.graphStore.filters.os_version) { link = 'operating-system-versions' }
      try {
        const { status, data } = await axiosPlausible({
          method: 'get',
          url: `/${link}`,
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
  },

}
</script>
