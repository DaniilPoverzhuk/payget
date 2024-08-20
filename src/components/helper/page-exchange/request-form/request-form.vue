<template>
  <form class="form" @submit.prevent="getOffers(true)">
    <div class="form__columns">
      <VInput
        v-model="sumFrom"
        class="form__column"
        type="number"
        :label="$t('requisites.viewOffers')"
        step="any"
        :v="$v.sumFrom"
        :postfix="sumFromPostfix"
        @input="onSumFromInput"
      />
      <VInput
        v-model="sumTo"
        class="form__column"
        type="number"
        :label="$t('requisites.amountReceived')"
        step="any"
        :v="$v.sumTo"
        :postfix="sumToPostfix"
        @input="onSumToInput"
      />
    </div>

    <PopularCurrencies
      ref="popular_currencies"
      class="popularCurrencies"
      :currencies="currencies"
      :currency-from="currencyFrom"
      :currency-to="currencyTo"
      @changeCurrencyFrom="onPopularCurrencyGive"
      @changeCurrencyTo="onPopularCurrencyReceive"
      @chooseCurrency="chooseCurrency"
      @toggleValues="toggleValues"
      @emitAllCurrencies="emitAllCurrencies"
    />
    <p v-if="chooseCurrencyAlert" class="chooseCurrencyText">
      {{ $t('requisites.chooseCurrency') }}
    </p>
    <div class="form__footer">
      <Button :loading="sendingRequest" :submit="true" size="lg">
        {{
          $t(
            $route.params.name
              ? 'requisites.createRequest'
              : 'requisites.viewOffers'
          )
        }}
      </Button>
    </div>
  </form>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { required, minValue } from 'vuelidate/lib/validators'
// import noAuthAxios from '@/no-auth-axios'
import PopularCurrencies from 'src/components/popular-currencies/popular-currencies.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import formCurrencies from 'src/mixins/form-currencies.vue'

// new

const { mapState: mapUserState, mapMutations: mapUserMutations } =
  createNamespacedHelpers('user')

export default {
  name: 'RequestForm',
  components: {
    VInput,
    PopularCurrencies,
  },
  mixins: [formCurrencies],
  props: {
    seller: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    sumFrom: '',
    sumTo: '',
    sendingRequest: false,
    chooseCurrencyAlert: false,
    preventPages: ['reviews', 'logs', 'deposit-history', 'profile-editing'],
  }),
  computed: {
    ...mapUserState(['requestData', 'viewUserId', 'currencies']),
    sumFromPostfix() {
      return this.sumFrom && this.currencyFrom
    },
    sumToPostfix() {
      return this.sumTo && this.currencyTo
    },
    userId() {
      return this.viewUserId
    },
  },
  validations() {
    const validators = {
      currencyFrom: {
        required,
      },
      currencyTo: {
        required,
      },
    }
    const sumValidators = {
      required,
      minValue: minValue(0),
    }

    if (!this.sumFrom && !this.sumTo) {
      validators.sumFrom = sumValidators
      validators.sumTo = sumValidators
    } else if (this.sumFrom) {
      validators.sumFrom = sumValidators
    } else {
      validators.sumTo = sumValidators
    }

    return validators
  },
  mounted() {
    if (this.requestData) {
      const { currencyFrom, currencyTo, sumFrom, sumTo } = this.requestData

      this.currencyFrom = currencyFrom
      this.currencyTo = currencyTo
      this.sumFrom = sumFrom
      this.sumTo = sumTo
    }

    if (!Object.keys(this.$route.query).length && !this.$matchMedia.mobile) {
      this.emptySearchQuery()
    }

    this.getUrlCurrencies()

    this.loadingOffers()
  },
  methods: {
    ...mapUserMutations(['fillRequestData']),
    emptySearchQuery() {
      if (this.$route.path === '/')
        window.history.pushState({}, document.title, '/')

      this.$refs.popular_currencies.emptySelectedCurrencies()
      this.currencyFrom = ''
      this.currencyTo = ''
      this.sumFrom = ''
      this.sumTo = ''
      this.onPopularCurrencyGive()
      this.onPopularCurrencyReceive()
    },
    // eslint-disable-next-line consistent-return,sonarjs/cognitive-complexity
    async getOffers(submit = false) {
      if (this.preventOnPages() && !submit) return false

      if (this.$matchMedia.mobile || submit) {
        if (!this.fieldsAreFilled())
          this.$refs.popular_currencies.chooseCurrenciesAlert()

        this.$v.$touch()
        // eslint-disable-next-line consistent-return
        if (this.$v.$invalid) return
      }

      const sendingData = {
        currency_from: this.currencyFrom,
        currency_to: this.currencyTo,
        ...(this.sumFrom ? { min_amount_sale: +this.sumFrom } : {}),
        ...(this.sumTo ? { min_amount_buy: +this.sumTo } : {}),
        ...(this.$route.params.name ? { user_id: this.viewUserId } : {}),
        ...(this.$matchMedia.mobile ? { is_mobile: 1 } : {}),
      }

      // eslint-disable-next-line consistent-return
      if (
        this.$route.name === 'user' &&
        this.currencyFrom === '' &&
        this.currencyTo === ''
      )
        return
      this.sendingRequest = true
      this.fillRequestData({
        currencyFrom: this.currencyFrom,
        currencyTo: this.currencyTo,
        sumFrom: this.sumFrom,
        sumTo: this.sumTo,
      })
      try {
        const {
          data: { data, status, message },
        } = await noAuthAxios({
          url: 'offer/list',
          data: sendingData,
        })

        if (status) {
          this.$emit('getOffers', data.list, sendingData)
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.sendingRequest = false
      window.scrollTo({ top: 0 })
      if (submit) this.addDynamicParameters()
    },
    loadingOffers() {
      if (!this.$matchMedia.mobile) {
        this.getOffers()
      }
    },
    onSumFromInput(value) {
      if (value.trim() !== '') {
        this.sumTo = ''
      }
    },
    onSumToInput(value) {
      if (value.trim() !== '') {
        this.sumFrom = ''
      }
    },
    onPopularCurrencyReceive(currency) {
      if (!currency) {
        this.currencyTo = ''
      } else {
        this.currencyTo = currency.symbol
        this.addDynamicParameters()
        this.chooseCurrencyAlert = false
        this.$refs.popular_currencies.chooseCurrenciesAlert(false, false)
      }
    },
    onPopularCurrencyGive(currency) {
      if (!currency) {
        this.currencyFrom = ''
      } else {
        this.currencyFrom = currency.symbol
        this.addDynamicParameters()
        this.chooseCurrencyAlert = false
        this.$refs.popular_currencies.chooseCurrenciesAlert(false, false)
      }
    },
    toggleValues() {
      const { sumFrom } = this
      this.sumFrom = this.sumTo
      this.sumTo = sumFrom

      const { currencyFrom } = this
      this.currencyFrom = this.currencyTo
      this.currencyTo = currencyFrom

      this.$refs.popular_currencies.valueChanged()
      this.addDynamicParameters()
    },
    addDynamicParameters() {
      if (
        (this.sumFrom || this.sumTo) &&
        this.currencyFrom &&
        this.currencyTo
      ) {
        const generateUrl = `?q=${this.sumFrom}${this.currencyFrom}-${this.sumTo}${this.currencyTo}`
        window.history.pushState({}, document.title, generateUrl)
      }
    },
    chooseCurrency(value = true) {
      this.chooseCurrencyAlert = value
    },
    emitAllCurrencies(value) {
      this.$emit('getAllCurrencies', value)
    },
    getUrlCurrencies() {
      const searched = this.$route.query.q

      if (!searched) return

      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(searched[0])) {
        this.sumFrom = parseFloat(searched.replace(/[^\d.]/g, ''))
      } else {
        this.sumTo = parseFloat(searched.replace(/[^\d.]/g, ''))
      }

      let currencies = searched.replace(/\d+/g, '')
      if (currencies[0] === '.') currencies = currencies.substring(1)
      const exploded = currencies.split('-')
      // eslint-disable-next-line prefer-destructuring
      this.currencyFrom = exploded[0]
      // eslint-disable-next-line prefer-destructuring
      this.currencyTo = exploded[1]

      if (this.fieldsAreFilled()) {
        this.getOffers()
        this.chooseCurrency(false)
        this.chooseCurrencyAlert = false
      }
    },
    fieldsAreFilled() {
      return (
        !!this.currencyFrom &&
        !!this.currencyTo &&
        (!!this.sumFrom || !!this.sumTo)
      )
    },
    preventOnPages() {
      let prevent = false
      this.preventPages.forEach((route) => {
        if (this.$route.path.endsWith(`/${route}`)) prevent = true
      })

      return prevent
    },
  },
}
</script>

<style lang="scss">
.chooseCurrencyText {
  margin: 8px 0 0 14px;
  color: var(--c-bd--alert);
}

@media (max-width: 768px) {
  .form__columns {
    padding: 30px 0 20px;
    box-shadow: unset;
  }
}
</style>
