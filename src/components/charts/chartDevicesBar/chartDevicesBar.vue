<template>
    <div class="chart-bar">
        <p class="chart-bar__title"> {{ $t(ranking.title) }}</p>
        <div class="chart-bar__tabs">
            <Tab :tabs="ranking.tabs" :activeTabs="activeTabs" @setTab="setTab"></Tab>
        </div>
        <Browsers v-if="ranking.tabs[activeTabs].tabName == 'browser-versions'" :heads="ranking.tabs[activeTabs].heads"></Browsers>
        <OperatingSystems v-if="ranking.tabs[activeTabs].tabName == 'operating-systems'" :heads="ranking.tabs[activeTabs].heads"></OperatingSystems>
        <Screen v-if="ranking.tabs[activeTabs].tabName == 'screen-sizes'" :filterName="ranking.tabs[activeTabs].filterName" :heads="ranking.tabs[activeTabs].heads"></Screen>
    </div>
</template>

<script>
import Tab from '../partsOfCharts/tab/Tab.vue'
import OperatingSystems from './operatingSystems/operatingSystems.vue'
import Screen from './screen/screen.vue'
import Browsers from './browsers/browsers.vue'


export default {
  name: 'chartReferrersBar',
  components: {
    Tab,
    Screen,
    Browsers,
    OperatingSystems
  },
  props: {
    ranking: {
      type: Object,
      default: null
    },
  },
  data() {
    return {
      activeTabs: 0,
    }
  },
  methods: {
    setTab(tab) {
      this.activeTabs = tab
    }
  }
}
</script>
