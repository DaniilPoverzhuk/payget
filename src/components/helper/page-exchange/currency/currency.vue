<template>
  <form class="currency" @submit.prevent="getOffers(false)">
    <div class="currency-fields" :class="{ active: toggle }">
      <div class="money-item">
        <VSelectCurrency
          v-model="form.min_amount_sale"
          :label="$t('ads.sendYou')"
          :select-list="currenciesData"
          class="currency-from"
          type="number"
          placeholder="00.00"
          :category-name="category"
          :active-currency="
            currencies && form ? currencies[form.currency_from] : ''
          "
          :v="v$.form?.min_amount_sale"
          @setSelect="setSelectFrom"
          @update:modelValue="onSumFromInput"
        />
        <VSelectScroll
          v-if="listPayFrom.length > 0"
          v-model="payment_type_from"
          :label="$t('ads.paymentMethod')"
          :select-list="listPayFrom"
          class="payment-select w-full mt-2"
        />
      </div>
      <div
        class="switch-currency relative flex items-center justify-center z-0"
      >
        <q-btn
          class="z-10 px-3"
          @click="switchCurrency"
          unelevated
          round
          style="background: #fdea87; color: #222342; border: 1px solid #fff"
        >
          <svg
            width="17"
            height="20"
            viewBox="0 0 17 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.75749 1.29413L1.1355 4.91612M4.75749 1.29413L8.37948 4.91612M4.75749 1.29413V18.8004"
              stroke="#222342"
              stroke-width="1.38565"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12.4361 18.8002L16.0581 15.1782M12.4361 18.8002L8.81412 15.1782M12.4361 18.8002V1.29387"
              stroke="#222342"
              stroke-width="1.38565"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </q-btn>
      </div>
      <div class="money-item">
        <VSelectCurrency
          v-model="form.min_amount_buy"
          :label="$t('ads.getYou')"
          :select-list="currenciesData"
          class="currency-to"
          type="number"
          placeholder="00.00"
          :category-name="category"
          :active-currency="
            currencies && form ? currencies[form.currency_to] : ''
          "
          :v="v$.form?.min_amount_buy"
          @update:modelValue="onSumToInput"
          @setSelect="setSelectTo"
        />
        <VSelectScroll
          v-if="listPayTo.length"
          v-model="payment_type_to"
          :select-list="listPayTo"
          class="payment-select w-full mt-2"
          :label="$t('ads.paymentMethod')"
        />
      </div>
    </div>
    <!-- <Button
      class=""
      :submit="true"
      size="lg"
    >

    </Button> -->
    <div class="currency-actions">
      <ButtonComponent
        class="button_size_small w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-primary-dark"
        :submit="true"
        :wide="true"
        size="sm"
        :loading="sendingRequest"
      >
        {{
          $t(
            $route.params.name
              ? 'requisites.createRequest'
              : 'requisites.viewOffers'
          )
        }}
      </ButtonComponent>
      <!-- padding="10px" -->
      <q-btn
        @click="onToggleCurrency"
        class="act-toggle"
        :class="{ active: toggle }"
        style="background: #e6e7ee"
        unelevated
      >
        <svg
          width="13"
          height="17"
          viewBox="0 0 13 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.19531 7.17188L6.49531 1.87187L11.7953 7.17188"
            stroke="#80878C"
            stroke-width="1.9875"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M1.19531 15.125L6.49531 9.825L11.7953 15.125"
            stroke="#80878C"
            stroke-width="1.9875"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </q-btn>
    </div>
  </form>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
//  import {
//    minValue, required, helpers,
//  } from 'vuelidate/lib/validators'
import VSelectCurrency from 'src/components/extends/v-select-currency/v-select-currency.vue'
import VSelectScroll from 'src/components/extends/v-select/v-select-scroll.vue'
import ButtonComponent from 'src/components/extends/button/button.vue'

import { useVuelidate } from '@vuelidate/core'
import { required, helpers, minValue, decimal } from '@vuelidate/validators'

// const currency = helpers.regex('alpha', /^(?!0$)(?!0\d)(?:\d+|\d{1,3}(?:,\d{3})+)(?:[.,]\d+)?$/)

const { mapMutations: mapLayoutMutations } = createNamespacedHelpers('layout')

const { mapState: mapUserState, mapMutations: mapUserMutations } =
  createNamespacedHelpers('user')

export default {
  name: 'Currency',
  components: {
    VSelectCurrency,
    VSelectScroll,
    ButtonComponent,
  },
  props: {
    user: {
      type: Number,
      required: NaN,
    },
  },
  setup() {
    return { v$: useVuelidate() }
  },
  data: () => ({
    form: {
      currency_from: 'BTC',
      currency_to: 'ETH',
      min_amount_sale: '',
      min_amount_buy: '',
    },
    payment_type_from: '',
    payment_type_to: '',
    sendingRequest: false,
    preventPages: ['reviews', 'logs', 'deposit-history', 'profile-editing'],
    category: {},
    listPayFrom: [],
    listPayTo: [],
    toggle: true,
  }),
  computed: {
    ...mapUserState(['currencies', 'requestData']),
    type() {
      if (this.form.min_amount_buy || this.form.min_amount_sale) {
        return this.form.min_amount_buy ? 'buy' : 'sale'
      }
      return 'buy'
    },
    currenciesData() {
      const arr = {}
      if (this.currencies) {
        const key = Object.keys(this.currencies)
        key.map((el) => {
          const elem = this.currencies[el]
          if (elem && elem.category) {
            // add in category for language
            if (!this.category.hasOwnProperty(elem.category.id)) {
              this.category[elem.category.id] = elem.category.name
            }
            // add in category for new arr
            if (!arr.hasOwnProperty(elem.category.id)) {
              arr[elem.category.id] = []
            }
            arr[elem.category.id].push(elem)
          }
        })
        this.$emit('getAllCurrencies', this.currencies)
      }
      return arr
    },
  },
  validations() {
    const validators = {
      form: {
        currency_from: {},
        currency_to: {},
      },
    }
    const sumValidators = {
      required,
      decimal,
      minValue: minValue(0),
    }
    if (!this.form.min_amount_sale && !this.form.min_amount_buy) {
      validators.form.min_amount_sale = sumValidators
      validators.form.min_amount_buy = sumValidators
    } else if (this.form.min_amount_sale) {
      validators.form.min_amount_sale = sumValidators
    } else {
      validators.form.min_amount_buy = sumValidators
    }

    return validators
  },
  mounted() {
    if (this.$route.query.q) {
      this.getUrlCurrencies(true)
    } else if (!this.user) {
      this.loadingOffers()
    }
    this.getPayment(this.form.currency_from, 'from')
    this.getPayment(this.form.currency_to, 'to')
  },
  methods: {
    ...mapLayoutMutations(['setSomeState']),
    ...mapUserMutations(['fillRequestData']),
    onToggleCurrency() {
      this.toggle = !this.toggle
    },
    onSumFromInput(value) {
      if (!this.isEmptyValue(value)) {
        this.form.min_amount_buy = ''
        this.$emit('setSum', this.form.min_amount_sale, this.type)
      }
    },
    onSumToInput(value) {
      if (!this.isEmptyValue(value)) {
        this.form.min_amount_sale = ''
        this.$emit('setSum', this.form.min_amount_buy, this.type)
      }
    },
    isEmptyValue(value) {
      return (
        (typeof value == 'number' && !value) ||
        (typeof value == 'string' && !value.trim())
      )
    },
    switchCurrency() {
      const lastCurrencyFrom = this.form.currency_from
      const lastBuy = this.form.min_amount_buy
      const lastPayment = this.payment_type_from
      const lastPaymentList = this.listPayFrom
      this.form = {
        currency_from: this.form.currency_to,
        currency_to: lastCurrencyFrom,
        min_amount_buy: this.form.min_amount_sale,
        min_amount_sale: lastBuy,
      }
      this.payment_type_from = this.payment_type_to
      this.payment_type_to = lastPayment
      this.listPayFrom = this.listPayTo
      this.listPayTo = lastPaymentList
    },
    loadingOffers() {
      this.getOffers(true)
    },
    setSelectFrom(data) {
      this.getPayment(data, 'from')

      this.form.currency_from = data
    },
    setSelectTo(data) {
      this.getPayment(data, 'to')

      this.form.currency_to = data
    },
    fieldsAreFilled() {
      return (
        !!this.form.currency_from &&
        !!this.form.currency_to &&
        (!!this.form.min_amount_sale || !!this.form.min_amount_buy)
      )
    },

    async getPayment(currency, type) {
      try {
        const { data } = await this.$api({
          method: 'get',
          url: '/payment_type/list',
          params: {
            type: currency,
          },
        })

        if (data.data.length > 0) {
          if (type === 'from') {
            this.setListPayFrom(data.data)
          }
          if (type === 'to') {
            this.setListPayTo(data.data)
          }
        } else {
          if (type === 'from') {
            this.listPayFrom = []
            this.payment_type_from = ''
          }
          if (type === 'to') {
            this.listPayTo = []
            this.payment_type_to = ''
          }
        }
      } catch {
        this.$error.show('error')
      }
    },

    setListPayFrom(data) {
      this.listPayFrom = []
      for (let i = 0; i < data.length; i++) {
        this.listPayFrom.push({
          value: data[i].id,
          text: data[i].name,
        })
      }
      if (!this.$route.query.t1) {
        this.payment_type_from = this.listPayFrom[0].value
      }
    },
    setListPayTo(data) {
      this.listPayTo = []
      for (let i = 0; i < data.length; i++) {
        this.listPayTo.push({
          value: data[i].id,
          text: data[i].name,
        })
      }
      if (!this.$route.query.t2) this.payment_type_to = this.listPayTo[0].value
    },
    async getOffers(empty = false) {
      if (this.preventOnPages()) return false
      await this.$nextTick()
      if (!empty) this.v$.form.$touch()
      if (!empty && this.v$.form.$invalid) return false
      const sendingData = {
        currency_from: !empty ? this.form.currency_from : '',
        currency_to: !empty ? this.form.currency_to : '',
        ...(this.payment_type_from
          ? { payment_type_from: this.payment_type_from }
          : undefined),
        ...(this.payment_type_to
          ? { payment_type_to: this.payment_type_to }
          : undefined),
        ...(this.form.min_amount_sale
          ? { min_amount_sale: +this.form.min_amount_sale }
          : {}),
        ...(this.form.min_amount_buy
          ? { min_amount_buy: +this.form.min_amount_buy }
          : {}),
        ...(this.user ? { user_id: this.user } : {}),
      }

      // eslint-disable-next-line consistent-return
      // if (this.$route.name === 'user' && this.currency_from === '' && this.currency_to === '') return

      this.sendingRequest = true
      this.fillRequestData({ ...this.form })
      this.$emit('getOffersEvent', sendingData)
      this.addDynamicParameters()
      this.setSomeState([
        'paramsExchange',
        {
          ...sendingData,
          sum: this.form.min_amount_sale
            ? this.form.min_amount_sale
            : this.form.min_amount_buy,
          type: this.type,
        },
      ])

      this.sendingRequest = false
      // window.scrollTo({top: 0})
      // if (submit) this.addDynamicParameters()
    },
    addDynamicParameters() {
      if (
        (this.form.min_amount_sale || this.form.min_amount_buy) &&
        this.form.currency_from &&
        this.form.currency_to
      ) {
        const t1 = this.payment_type_from ? `&t1=${this.payment_type_from}` : ''
        const t2 = this.payment_type_to ? `&t2=${this.payment_type_to}` : ''
        const generateUrl = `?q=${this.form.min_amount_sale}${this.form.currency_from}-${this.form.min_amount_buy}${this.form.currency_to}${t1}${t2}`
        window.history.pushState({}, document.title, generateUrl)
      }
    },

    getUrlCurrencies() {
      const searched = this.$route.query.q
      const add_param_from = this.$route.query.t1
      const add_param_to = this.$route.query.t2
      if (!searched) return
      if (!isNaN(searched[0])) {
        this.form.min_amount_sale = parseFloat(searched.replace(/[^\d.]/g, ''))
      } else {
        this.form.min_amount_buy = parseFloat(searched.replace(/[^\d.]/g, ''))
      }

      let currencies = searched.replace(/\d+/g, '')
      if (currencies[0] === '.') currencies = currencies.substring(1)
      const exploded = currencies.split('-')
      // eslint-disable-next-line prefer-destructuring
      this.form.currency_from = exploded[0]
      // eslint-disable-next-line prefer-destructuring
      this.form.currency_to = exploded[1]

      if (add_param_from) {
        this.payment_type_from = add_param_from
      }
      if (add_param_to) {
        this.payment_type_to = add_param_to
      }
      if (this.fieldsAreFilled()) {
        this.getOffers()
      }
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

<style lang="scss" scoped>
.currency {
  padding-right: 28px;
  .currency-fields {
    margin-bottom: 20px;
    .switch-currency {
      height: 20px;
      position: relative;
    }
  }
  .money-item {
    padding: 24px;
    background-color: #fafbfc;
    box-shadow: 0px 0px 84.19px 0px #e6ebef;
    border-radius: 12px;
  }
  .currency-actions {
    .act-toggle {
      display: none;
      transform: rotate(180deg);
      &.active {
        padding-bottom: 6px;
        transform: rotate(0deg);
      }
    }
  }
  @media (max-width: 1440px) {
    padding-right: 0;
    margin-bottom: 30px;
    .currency-fields {
      display: none;
      align-items: stretch;
      &.active {
        display: flex;
      }
      .switch-currency {
        height: 20px;
        width: 20px;
        transform: rotate(90deg);
        margin: auto;
      }
      .money-item {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
    }
    .currency-actions {
      display: flex;
      gap: 20px;
      .act-toggle {
        display: flex;
        border-radius: 7px;
        width: 48px;
        height: 48px;
      }
    }
  }
  @media (max-width: 720px) {
    margin-bottom: 16px;
    .button_size_small {
      padding: 9px 20px;
    }
    .currency-fields {
      display: none;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
      &.active {
        display: flex;
      }
      .switch-currency {
        display: none;
      }
    }
    .money-item {
      padding: 0;
      background-color: transparent;
      box-shadow: none;
      border-radius: 0;
    }
    .currency-actions {
      gap: 16px;
      .act-toggle {
        height: 40px;
        width: 40px;
      }
    }
  }
}
.dark {
  .currency {
    .money-item {
      background-color: transparent;
      box-shadow: 0px 0px 84.19px 0px #292a2b;
    }
  }
}
</style>
