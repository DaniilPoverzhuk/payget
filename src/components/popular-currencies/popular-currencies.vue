<template lang="pug">
  div.popular(
    :class="{ 'choose-currency': chooseCurrency }"
  )
    div.toggle-section

      p.toggle-section-text(

      ) {{ $t('requisites.givenAway') }}

      div.toggle-button(

      )
        svg.form__toggle-icon(
          v-svg
          size='20'
          symbol='toggle'
          @click="toggleValues"
        )

      p.toggle-section-text {{ $t('requisites.received') }}

    div.popular-section(
      :class="{'show-all-currencies': rotate}"
    )
      div.left-section

        div.currency-item-left(
          v-for='(currency, key) in allCurrencies'
          :key="key"
        )
          div.section-items-wrapper
            div.lable-section(
              v-if="currency.label"
            ) {{currency.label}}
            div.section-item-wrapper(
              v-if="currency.label"
              v-for='(curr, key) in currency.list'
            )
              span.section-item(
                :id="curr.id"
                :class="{'active': selectedFromPopularCurrency === curr.id || (currencyFrom === curr.symbol)}"
                @click="changeCurrencyFrom(curr)"
              )
                span.currency-icon
                  img.image-currency(
                    :src="curr.image"
                  )

                p.currency-name {{curr.value}}

              span.section-item(
                :id="curr.id"
                :class="{'active': (selectedToPopularCurrency === curr.id) || (currencyTo === curr.symbol)}"
                @click="changeCurrencyTo(curr)"
              )
                span.currency-icon
                  img.image-currency(
                    :src="curr.image"
                  )

                p.currency-name {{curr.value}}

    div.papular-all-button(
      @click="showAllPopular"
    )

      div.all-currencies
        svg.all-popular-icon(
          v-svg
          :class="{'all-popular-icon-close': rotate}"
          symbol='arrow'
        )

</template>

<script>
export default {
  name: 'PopularCurrencies',
  props: {
    currencies: {
      type: Object,
      default: null,
    },
    currencyTo: {
      type: String,
      default: '',
    },
    currencyFrom: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    selectedFromPopularCurrency: '',
    selectedToPopularCurrency: '',
    isPopularCurrencies: {},
    currenciesList: [],
    allCurrencies: {},
    allGroupedCurrencies: {},
    allPopularCurrencies: {},
    isPopular: false,
    rotate: false,
    chooseCurrency: false,
  }),
  mounted() {
    this.getPopularCurrencies()
    this.allGroupedCurrencies = this.filterCurrencies(this.currencies)
    this.allPopularCurrencies = this.filterCurrencies(this.isPopularCurrencies)
    this.allCurrencies = this.allPopularCurrencies

    this.$emit('emitAllCurrencies', this.currencies)
  },
  methods: {
    emptySelectedCurrencies() {
      this.selectedFromPopularCurrency = ''
    },
    valueChanged() {
      const { selectedFromPopularCurrency } = this
      this.selectedFromPopularCurrency = this.selectedToPopularCurrency
      this.selectedToPopularCurrency = selectedFromPopularCurrency
    },
    toggleValues() {
      this.$emit('toggleValues')
    },
    getPopularCurrencies() {
      for (const [keys, value] of Object.entries(this.currencies)) {
        if (value.is_popular) {
          this.isPopularCurrencies[keys] = value
        }
      }
    },
    changeCurrencyFrom(currency) {
      this.selectedFromPopularCurrency = currency.id
      this.$emit('changeCurrencyFrom', currency)
    },
    changeCurrencyTo(currency) {
      this.selectedToPopularCurrency = currency.id
      this.$emit('changeCurrencyTo', currency)
    },
    showAllPopular() {
      this.rotate = !this.rotate
      this.allCurrencies = this.isPopular ? this.allPopularCurrencies : this.allGroupedCurrencies
      this.isPopular = !this.isPopular
    },
    chooseCurrenciesAlert(value = true, emit = true) {
      this.chooseCurrency = value
      if (this.selectedFromPopularCurrency && this.selectedToPopularCurrency) {
        this.$emit('chooseCurrency', false)
        emit = false
        this.chooseCurrency = false
      }

      if (emit) this.$emit('chooseCurrency')
    },

    filterCurrencies(val) {
      return Object.values(val).reduce((list, currency) => {
        if (currency.active_exchange) {
          const currencyData = {
            id: currency.id,
            value: currency.name,
            symbol: `${currency.symbol}`,
            popular: currency.is_popular,
            image: currency.image ? currency.image : '',
          }

          const doesGroupExist = list.some((group) => {
            if (currency.category && group.label !== currency.category.name) return false
            group.list.push(currencyData)
            return true
          })

          if (!doesGroupExist) {
            list.push({
              label: currency.category.name,
              sort: currency.category.sort,
              list: [currencyData],
            })
          }
        }
        return list
      }, [
        {
          label: null,
          sort: -1,
          list: [
            {
              id: null,
              value: '',
              symbol: '',
              popular: null,
              image: '',
            },
          ],
        },
      ]).sort((a, b) => a.sort - b.sort)
    },
  },
}
</script>

<style lang="scss">
.toggle-button:hover {
  cursor: pointer;
}

.choose-currency {
  border: var(--bd-xxs) solid var(--c-bd--alert);
}

.chooseCurrencyText {
  color: var(--c-bd--alert);
}

.popular {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .active {
    background-color: var(--c-primary);

    .currency-name {
      color: var(--c-white);
    }
  }
}

.popular-title {
  height: 30px;
  background-color: var(--c-gray-15);
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.section-items-wrapper {
  width: 100%;
}

.section-item-wrapper {
  height: 32px;
  width: 100%;
  display: flex;
  border-bottom: 2px solid var(--c-gray-10);
  box-shadow: var(--rgba-currency);
}

.section-item {
  width: 50%;
  display: flex;
  padding-left: 30px;
}

.lable-section {
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--c-gray-15);
  font-family: var(--ff-default);
  font-weight: var(--fw-600);
  font-size: var(--fz-md);
  line-height: var(--lh-cr-txt);
  color: var(--c-gray-70);
}

.title-text {
  font-family: var(--ff-default);
  font-weight: var(--fw-600);
  font-size: var(--fz-md);
  line-height: var(--lh-cr-txt);
  color: var(--c-gray-70);
}

.toggle-section {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--grey-rgba);
}

.form__toggle-icon {
  width: 12px;
  fill: var(--c-gray-20);
}

.show-all-currencies {
  height: calc(100vh - 400px);
}

.popular-section {
  width: 100%;
  display: flex;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .popular-section {
    height: calc(100vh - 400px);
  }
}

.left-section {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.currency-item-left {
  cursor: pointer;
  //display: flex;
}

.section-item:not(.active):hover {
  background-color: var(--c-gray-10);
  transition: 0.3s all;
}

.papular-all-button {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--grey-rgba);
}

.toggle-section-text {
  font-family: var(--ff-default);
  font-weight: var(--fw-500);
  font-size: var(--fz-md);
  line-height: var(--lh-cr-txt);
  color: var(--c-gray-70);
  padding-left: 62px;
  padding-right: 63px;
}

@media (max-width: 475px) {
  .toggle-section-text {
    padding-left: 31px;
    padding-right: 32px;
  }
}

.all-popular-icon {
  fill: var(--c-primary);
  width: 15px;
  height: 15px;
}

.all-popular-icon-close {
  transform: var(--rotate-180deg);
}

.all-currencies {
  outline: none;
  background-color: transparent;
}

.currency-icon {
  display: flex;
  align-items: center;
}

.currency-name {
  display: flex;
  align-items: center;
  margin-left: 8px;
  font-family: var(--ff-default);
  font-size: var(--fz-xs);
  line-height: var(--lh-cn);
  color: var(--c-gray-80);
}



.image-currency {
  width: 20px;
}
</style>
