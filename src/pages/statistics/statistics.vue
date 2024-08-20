<template>
    <section class="content statistics">
        <div class="statistics__wrap">
            <div class="statistics__items">
                <div class="statistics__item statistics__item--col1">
                    <ChartVisits></ChartVisits>
                </div>
                <div class="statistics__item statistics__item--col2">
                    <ChartReferrersBar :ranking="rankings[0]"></ChartReferrersBar>
                </div>
                <div class="statistics__item statistics__item--col2">
                    <ChartsBar :ranking="rankings[1]"></ChartsBar>
                </div>
                <div class="statistics__item statistics__item--col2">
                    <ChartsMap></ChartsMap>
                </div>
                <div class="statistics__item statistics__item--col2">
                    <chartDevicesBar :ranking="rankings[2]"></chartDevicesBar>
                </div>
                <div class="statistics__item statistics__item--col1">
                    <ChartsBar :ranking="rankings[3]"></ChartsBar>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import ChartVisits from 'src/components/charts/chartVisits/chartVisits.vue'
import ChartReferrersBar from 'src/components/charts/chartReferrersBar/chartReferrersBar.vue'
import chartDevicesBar from 'src/components/charts/chartDevicesBar/chartDevicesBar.vue'
import ChartsBar from 'src/components/charts/chartsBar/chartsBar.vue'
import ChartsMap from 'src/components/charts/chartsMap/chartsMap.vue'

export default {
  name: 'statistics',
  components: {
    ChartReferrersBar,
    ChartsBar,
    ChartVisits,
    chartDevicesBar,
    ChartsMap
  },
  data() {
    return {
      rankings: [
        {
          title: 'statistics.topSources',
          tabs: [
            {
              title: 'statistics.all',
              heads: ['statistics.source', 'statistics.visitors'],
              link: 'sources',
              tabName: 'source',
              legens: ['name', 'count', 'bounce_rate', 'visit_duration'],
            },
            {
              title: 'statistics.average',
              heads: ['statistics.utmAverage', 'statistics.visitors'],
              link: 'utm_mediums',
              tabName: 'utm_medium',
              legens: ['name', 'count', 'bounce_rate', 'visit_duration'],

            },
            {
              title: 'statistics.source',
              heads: ['statistics.utmSource', 'statistics.visitors'],
              link: 'utm_sources',
              tabName: 'utm_source',
              legens: ['name', 'count', 'bounce_rate', 'visit_duration'],
            },
            {
              title: 'statistics.company',
              heads: ['statistics.utmcompany', 'statistics.visitors'],
              link: 'utm_campaigns',
              tabName: 'utm_campaign',
              legens: ['name', 'count', 'bounce_rate', 'visit_duration'],
            }
          ]
        },
        {
          title: 'statistics.topPages',
          tabs: [
            {
              title: 'statistics.topPages',
              heads: ['statistics.urlPages', 'statistics.visitors'],
              link: 'pages',
              tabName: 'page',
              legens: ['name', 'count', 'pageviews', 'bounce_rate', 'time_on_page'],
            },
            {
              title: 'statistics.loginPages',
              heads: ['statistics.urlPages', 'statistics.uniqueOutputs'],
              link: 'entry-pages',
              tabName: 'entry-page',
              legens: ['name', 'count', 'entries', 'statistics.visitors'],
            },
            {
              title: 'statistics.exitPages',
              heads: ['statistics.urlPages', 'statistics.uniqueOutputs'],
              link: 'exit-pages',
              tabName: 'exit-page',
              legens: ['name', 'count', 'exit_rate', 'exits'],
            }
          ]
        },
        {
          title: 'statistics.devices',
          legens: null,
          tabs: [
            {
              title: 'statistics.size',
              heads: ['statistics.sizeDevices', 'statistics.visitors'],
              link: 'screen-sizes',
              tabName: 'screen-sizes',
              filterName: 'screen',
            },
            {
              title: 'statistics.browser',
              heads: ['statistics.browser', 'statistics.visitors'],
              link: 'browsers',
              tabName: 'browser-versions',
            },
            {
              title: 'statistics.os',
              heads: ['statistics.os', 'statistics.visitors'],
              link: 'operating-systems',
              tabName: 'operating-systems',
            }
          ]
        },
        {
          title: 'statistics.conversion',
          legens: null,
          tabs: [
            {
              title: 'statistics.size',
              label: 'statistics.sizeDevices',
              heads: ['statistics.goal', 'statistics.unique', 'statistics.total', 'statistics.conversionRate'],
              link: 'conversions',
              tabName: 'conversion',
            }
          ]
        }
      ]
    }
  }
}
</script>
<style lang="scss">
.statistics {
  &__wrap {
    padding: 0 16px 50px;
    @media (min-width: 1200px) {
      padding: 0 20px 50px;
    }
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    margin: -12px;
  }

  &__item {
    padding: 12px;
    box-sizing: border-box;

    &--col1 {
      width: 100%;
    }

    &--col2 {
      width: 100%;

      @media (min-width: 1200px) {
        width: 50%;
      }
    }
  }
}
</style>
