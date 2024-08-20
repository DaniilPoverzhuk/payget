<template>
  <div
    v-if="filteredRows"
    class="rates w-full my-10 lg:px-6 xs:px-4"
  >
    <div class="lg:flex lg:items-center lg:justify-between mb-6">
      <h1 class="text-gray-700 dark:text-white mb-6">
        {{ $t('exchangeRates') }}
      </h1>
      <div class="lg:ml-4">
        <Search
          :query="ratesSearch"
          :placeholder="$t('placeholder.lookingFor')"
          @search="(query) => ratesSearch = query"
        />
      </div>
    </div>
    <Table
      v-if="filteredRows.length > 0"
      ref="table"
      v-slot="{ sortedRows }"
      :headers="headers"
      :rows="filteredRows"
      @cellAction="cellAction"
    >
      <RatesRow
        v-for="currency in sortedRows"
        :key="currency.id"
        :currency="currency"
      />
    </Table>
    <div
      v-else
      class="text-lg mt-3 text-gray-400 dark:text-gray-500"
    >
      {{ $t('nothingFound') }}
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Search from 'src/components/extends/search/search.vue'
import Table from 'src/components/extends/table/table.vue'
import RatesRow from 'src/components/helper/rates-row/rates-row.vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'

const {
  mapState: mapUserState,
  mapActions: mapUserActions,
} = createNamespacedHelpers('user')

export default {
  name: 'Rates',
  components: {
    Search,
    RatesRow,
    Table,
  },
  setup() {
    const $route = useRoute()
    useMeta({
      meta: {
        ogTitle: { property: 'og:title', content: 'TWIX' },
        ogUrl: { property: 'og:url', content: `https://twix.im${$route.path}` },
        ogSiteName: { property: 'og:site_name', content: 'twix.im' },
        ogType: { property: 'og:type', content: 'website' },
      }
    })
  },
  data() {
    return {
      lastFilter: NaN,
      headers: [
        { label: 'headers.currencyName', event: { filter: 'symbol', active: false, sort: '' } },
        { label: 'headers.quantity' },
        { label: 'RUB', event: { filter: 'rub', active: false, sort: '' } },
        { label: 'USD', event: { filter: 'usd', active: false, sort: '' } },
        { label: 'EUR', event: { filter: 'eur', active: false, sort: '' } },
      ],
      filteredRows: null,
      ratesSearch: '',
    }
  },
  computed: {
    ...mapUserState(['currencies']),
  },
  watch: {
    ratesSearch() {
      this.searchResetQuery()
    },
  },
  async created() {
    // await this.setCurrencies()
    if (!this.currencies) return
    this.filteredRows = Object.values(this.currencies).filter(currency => !!currency.active_page)
  },
  methods: {
    ...mapUserActions(['setCurrencies']),
    cellAction(value) {
      const [filter, index, sort] = value
      if (sort) {
        this.setHeadervalue(index, sort)
        if (this.lastFilter && this.lastFilter !== index) {
          this.setHeadervalue(this.lastFilter, false)
        }
        this.lastFilter = !sort ? '' : index
      } else {
        this.setHeadervalue(this.lastFilter, false)
        this.setHeadervalue(index, false)
      }
      this.sortHeaderData(sort, filter)
    },
    sortHeaderData(sort, filter) {
      if (!sort) {
        this.filteredRows = Object.values(this.currencies).filter(currency => !!currency.active_page)
        this.searchResetQuery()
      } else {
        this.filteredRows = this.filteredRows.sort((a, b) => {
          a = a[filter]
          b = b[filter]
          return (a === b ? 0 : a > b ? 1 : -1) * (sort === 'desc' ? 1 : -1)
        })
      }
    },
    setHeadervalue(index, value) {
      this.headers[index].event.active = !!value
      this.headers[index].event.sort = value || ''
    },

    searchResetQuery() {
      const newmname = Object.values(this.currencies).filter(currency => !!currency.active_page)
      if (!this.ratesSearch) {
        this.filteredRows = newmname
      } else {
        this.filteredRows = newmname.filter(currency => !!currency.active_page).filter((row) => {
          const searchTerm = this.ratesSearch?.toLowerCase()
          return (
            row.symbol.toLowerCase().match(searchTerm) || row.name.toLowerCase().match(searchTerm)
          )
        })
      }
    },
  },
}
</script>
