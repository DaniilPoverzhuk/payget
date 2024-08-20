<template>
    <div class="maps">
        <div class="maps__wrap" @click="$emit('setCountry', activeCountry)">
            <VueDatamaps v-if="data != null" :geographyConfig="geographyConfig" :fills="fills" :data="data" :projection="projection" popupTemplate="popupTemplate" @custom:popup="popupTemplate">
                <template #hoverinfo>
                    <div class="hoverinfo asdasd" v-html="popupData"></div>
                </template>
            </VueDatamaps>
        </div>
    </div>
</template>
<script>
import VueDatamaps from './components/Datamaps.vue'
import dateFormatter, { countries } from '../../formatters'
export default {
  components: {
    VueDatamaps
  },
  data() {
    return {
      darkTheme: false,
      popupData: '',
      projection: 'Mercator',
      activeCountry: '',
    }
  },
  props: {
    referrers: {
      type: Array,
      default: null
    },
    data: {
      type: Object,
      default: null
    },
  },
  computed: {
    fills() {
      return {
        defaultFill: this.darkTheme ? '#2d3747' : '#E6E6EA',
        // active: 'red',
      }
    },
    geographyConfig() {
      return {
        scope: 'world',
        dataUrl: 'maps/world.json',
        borderColor: this.darkTheme ? '#1f2937' : '#dae1e7',
        highlightBorderWidth: 1,
        highlightFillColor: '#f7df63',
        highlightBorderColor: '#f7df63',

      }
    }
  },
  methods: {
    getFormat(count) {
      return count >= 1000 ? `${parseInt((count / 1000) * 10) / 10} ${this.$t('degrees.thousand')}.` : count
    },
    popupTemplate({ geography, datum }) {
      this.activeCountry = geography.id
      const votes = datum && datum.numberOfThings ? datum.numberOfThings : 0
      this.popupData = `<p class='maps__name'><b>${countries(geography.id) || geography.properties.name}</b><p><p class='maps__name'><b>${this.getFormat(votes)}</b> ${this.$t('statistics.votes', this.getFormat(votes), {count: this.getFormat(votes)})}<p>`
    }
  },
}
</script>

<style lang="scss">

.hoverinfo {
  position: absolute;
}

.maps {
  position: relative;

  &__name {
    color: var(--c-gray-80);
    white-space: nowrap;
    font-size: 14px;
  }
}

</style>

