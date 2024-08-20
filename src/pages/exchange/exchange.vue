<template>
  <div class="exchange w-full lg:px-6 flex">
    <aside
      class="pt-6 lg:border-r-2 lg:border-gray-200 lg:dark:border-gray-700 lg:pr-9 flex-shrink-0 xs:w-full xs:px-4"
    >
      <Currency
        ref="requestForm"
        class="lg:max-w-384 w-full"
        :query="$route.query.q"
        @getOffersEvent="showOffers"
        @getAllCurrencies="getAllCurrencies"
      />
    </aside>
    <div
      v-if="$matchMedia.desktop || offersView"
      class="w-full lg:pl-9 lg:py-6 py-2 xs:px-4"
    >
      <h1 class="text-gray-700 dark:text-gray-300 xs:text-base">
        {{ $t(sellersOffers) }}
      </h1>
      <template v-if="offers">
        <OffersComponent
          v-if="offers.length"
          :offers="offers"
          :request-data="requestData"
        />
        <div v-else class="text-lg mt-3 text-gray-400">
          {{ $t('offer.noOffer') }}
        </div>
        <Pagination
          v-if="isShowPagination && offers.length"
          class="mt-8 mb-8"
          ref="pagination"
          :short="true"
          :count="totalAds"
          :per-page="10"
          @getData="getData"
        />
      </template>
      <div v-else class="text-lg mt-3 text-gray-400 dark:text-gray-500">
        {{ $t('offer.createApplicationReceive') }}
      </div>
    </div>
  </div>
</template>

<script>
import LinkBack from 'src/components/extends/link-back/link-back.vue'
import readNewNotifications from 'src/mixins/readNewNotifications.vue'
import Currency from 'src/components/helper/page-exchange/currency/currency.vue'
import OffersComponent from 'src/components/helper/page-exchange/offers/offers.vue'
import Pagination from 'src/components/extends/pagination/pagination.vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'

export default {
  name: 'Exchange',
  components: {
    // RequestForm,
    Currency,
    OffersComponent,
    Pagination,
  },
  mixins: [readNewNotifications],
  setup() {
    const $route = useRoute()
    useMeta({
      meta: {
        ogTitle: { property: 'og:title', content: 'TWIX' },
        ogUrl: { property: 'og:url', content: `https://twix.im${$route.path}` },
        ogSiteName: { property: 'og:site_name', content: 'twix.im' },
        ogType: { property: 'og:type', content: 'website' },
      },
    })
  },
  data: () => ({
    offersView: false,
    sum: '',
    offers: null,
    requestData: null,
    sellersOffers: '',
    activeExchange: null,
    openOffer: false,
    currencyName: '',
    allCurrencies: {},
    type: 'sale',
    isActiveAds: true,
    offset: 0,
    limit: 10,
    totalAds: 0,
  }),
  computed: {
    isShowPagination() {
      return (
        this.requestData &&
        (this.requestData.currency_from || this.requestData.currency_to)
      )
    },
  },
  mounted() {
    this.sellersOffers = 'offer.sellersOffers'
    if (this.notificationsData !== null) {
      this.readNewNotifications('post_deleted')
    }
  },
  methods: {
    back() {
      this.offersView = false
    },
    setSum(data, type) {
      this.type = type
      this.sum = data * 1
    },
    async getData(value) {
      this.offset = value * this.limit - this.limit
      await this.showOffers(this.requestData)
    },
    async showOffers(requestData) {
      if (this.$matchMedia.mobile) {
        this.offersView = true
      }
      try {
        const {
          data: { data, status, message },
        } = await this.$noAuth({
          url: 'offer/list',
          data: { ...requestData, start: this.offset, limit: this.limit },
        })

        if (status) {
          this.offers = Array.isArray(data.list)
            ? data.list
            : Object.values(data.list)
          this.totalAds = data.quantity
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show(e)
      }
      this.requestData = requestData
      if (requestData.currency_from && requestData.currency_to) {
        this.sellersOffers = `${this.$t('offer.direction')} ${
          this.allCurrencies[requestData.currency_from].name
        } - ${this.allCurrencies[requestData.currency_to].name}`
      }
    },
    getAllCurrencies(allCurrencies) {
      this.allCurrencies = allCurrencies
    },
  },
}
</script>

<style lang="scss" scoped>
.exchange {
  @media (max-width: 1199px) {
    flex-direction: column;
  }
}
</style>
