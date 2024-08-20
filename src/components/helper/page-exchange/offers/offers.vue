<template>
  <ul class="offers lg:nth-child:mt-4 nth-child:mt-2">
    <li v-for="offer in offers" :key="offer.id" class="nth-child:mt-2">
      <OfferComponent
        :offer="offer"
        :request-data="requestData"
        :nonames="nonames"
      />
    </li>
  </ul>
  <!-- <ul class="offers-list lg:nth-child:mt-4 nth-child:mt-2">
    <li v-for="offer in offers" :key="offer.id" class="offer-row">
      <OfferComponentNew
        :offer="offer"
        :request-data="requestData"
        :nonames="nonames"
      />
    </li>
  </ul> -->
</template>

<script>
import OfferComponent from 'src/components/helper/page-exchange/offer/offer.vue'
// import OfferComponentNew from 'src/components/helper/page-exchange/offer/offer-new.vue'

export default {
  name: 'OffersComponent',
  components: {
    OfferComponent,
    // OfferComponentNew,
  },
  props: {
    offers: {
      type: Array,
      required: true,
    },
    requestData: {
      type: Object,
      required: true,
    },
    nonames: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
.offers-list {
  display: table;
  width: 100%;
  border-collapse: collapse;
  .offer-separator {
    height: 1px;
    width: 100%;
    padding: 2px 0;
    background-color: rgba(206, 206, 206, 0.3);
  }
  .offer-row {
    display: table-row;
    border-bottom: 1px solid rgba(206, 206, 206, 0.3);
    > div {
      display: table-cell;
      padding: 2px 0;
    }
  }
}
</style>
