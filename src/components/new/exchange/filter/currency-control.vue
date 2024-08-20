<template>
  <Currency ref="requestForm" class="w-full" :query="$route.query.q" />
</template>

<script>
import Currency from 'components/helper/page-exchange/currency/currency.vue'

export default {
  name: 'CurrencyControl',
  components: { Currency },
  data() {
    return {
      text: '',
    }
  },
}
</script>

<style lang="scss">
.currency-control {
  .q-field__native {
    background-color: transparent;
    &:focus {
      border-color: transparent;
      box-shadow: none;
    }
  }
}
</style>
