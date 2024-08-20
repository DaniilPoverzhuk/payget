<template>
  <div class="new-exchange">
    <div class="row">
      <div class="col-12 col-lg-3">
        <Currency
          ref="requestForm"
          class="w-full"
          @getOffersEvent="filterEvent"
          :query="$route.query.q"
        />
      </div>
      <div class="col-12 col-lg-9">
        <ExchangeList :request="request" />
      </div>
    </div>
  </div>
</template>

<script>
import ExchangeList from 'components/new/exchange/list/exchange-list.vue'
import Currency from 'components/helper/page-exchange/currency/currency.vue'
export default {
  name: 'NewExchange',
  components: { ExchangeList, Currency },
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
    request: null,
  }),
  methods: {
    filterEvent(data) {
      this.request = data
    },
  },
}
</script>

<style lang="scss">
.new-exchange {
  padding: 24px;
  font-family: 'involve';
  width: 100%;
  @media (max-width: 720px) {
    padding: 20px;
  }
}
</style>
