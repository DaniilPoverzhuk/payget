<template>
  <div class="exchange-list">
    <div class="exchange-list_table" v-if="offers && offers.length">
      <div class="exchange-list_table-head">
        <div class="exchange-list_table-head-row">
          <div
            class="exchange-list_table-head-row-cell"
            v-for="n in header"
            :key="n"
          >
            {{ n }}
          </div>
        </div>
      </div>
      <div class="exchange-list_table-body">
        <OfferRow
          v-for="offer in offers"
          :offer="offer"
          :key="offer.id"
        ></OfferRow>
      </div>
    </div>
    <div v-else class="text-lg mt-3 text-gray-400">
      {{ $t('offer.noOffer') }}
    </div>
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

<script>
import OfferRow from './offer-row.vue'
import Pagination from 'src/components/extends/pagination/pagination.vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'

export default {
  name: 'NewExchangeList',
  components: {
    OfferRow,
    Pagination,
  },
  props: {
    request: null,
  },
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
  data() {
    return {
      offset: 0,
      limit: 10,
      totalAds: 0,
      requestData: {
        currency_from: '',
        currency_to: '',
      },
      offers: null,
    }
  },
  watch: {
    request() {
      this.showOffers(this.request)
    },
  },
  computed: {
    isShowPagination() {
      return (
        this.requestData &&
        (this.requestData.currency_from || this.requestData.currency_to)
      )
    },
    header() {
      return [
        this.$t('offer.exchange'),
        this.$t('offer.give'),
        this.$t('offer.get'),
        this.$t('offer.comment'),
        this.$t('offer.reviews'),
        '',
      ]
    },
  },
  methods: {
    async getData(value) {
      this.offset = value * this.limit - this.limit
      await this.showOffers(this.requestData)
    },
    async showOffers(requestData) {
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
    },
  },
}
</script>

<style lang="scss">
.exchange-list_table {
  &-head,
  &-body {
    display: grid;
    column-gap: 20px;
    row-gap: 12px;
  }
  &-head {
    padding: 0 24px;
    margin-bottom: 8px;
    font-weight: 500;
    &-row {
      display: grid;
      grid-template-columns:
        minmax(120px, 1fr)
        minmax(72px, 1fr)
        minmax(85px, 1fr)
        minmax(280px, 1fr)
        minmax(85px, 1fr)
        minmax(50px, 60px);
      align-items: center;
    }
    @media (max-width: 1440px) {
      font-size: 13px;
      &-row {
        grid-template-columns:
          minmax(120px, 1fr)
          minmax(70px, 1fr)
          minmax(70px, 1fr)
          minmax(220px, 1fr)
          minmax(70px, 1fr)
          44px;
        grid-gap: 8px;
      }
    }
    @media (max-width: 782px) {
      display: none;
    }
  }
}
</style>
