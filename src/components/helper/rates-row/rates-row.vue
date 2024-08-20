<template>
  <tr
    v-if="!currency.default"
    class="rates-row"
  >
    <td class="px-6 py-4 xs:whitespace-nowrap">
      <span class="font-semibold">{{ currency.symbol }}</span>&nbsp;
      <span class="text-gray-400 dark:text-gray-500 font-medium">{{ currency.name }}</span>
    </td>
    <td class="px-3 py-4 whitespace-nowrap">
      <VInput
        v-model="calcedQuantity"
        type="number"
        :hidden-border="true"
        min="0"
        step="any"
        @input="recalc({quantity: calcedQuantity})"
      />
    </td>
    <td class="px-3 py-4 whitespace-nowrap">
      <div class="rates__input-holder">
        <VInput
          v-model="calcedRub"
          class="min-w-178"
          type="number"
          postfix="RUB"
          :hidden-border="true"
          step="any"
          @input="recalc({price: calcedRub, type: 'RUB'})"
        />
      </div>
    </td>
    <td class="px-3 py-4 whitespace-nowrap">
      <VInput
        v-model="calcedUsd"
        type="number"
        class="min-w-178"
        postfix="USD"
        step="any"
        :hidden-border="true"
        @input="recalc({price: calcedUsd, type: 'USD'})"
      />
    </td>
    <td class="px-3 py-4 whitespace-nowrap">
      <VInput
        v-model="calcedEur"
        type="number"
        class="min-w-178"
        postfix="EUR"
        step="any"
        :hidden-border="true"
        @input="recalc({price: calcedEur, type: 'EUR'})"
      />
    </td>
  </tr>
</template>

<script>
import VInput from 'src/components/extends/v-input/v-input.vue'

export default {
  name: 'RatesRow',
  components: {
    VInput,
  },
  props: {
    currency: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      updatedCurrency: {},
      calcedQuantity: '1',
      calcedRub: this.simplify(this.currency.rub),
      calcedEur: this.simplify(this.currency.eur),
      calcedUsd: this.simplify(this.currency.usd),
      inputTimer: null,
    }
  },
  watch: {
    updatedCurrency() {
      this.calcedQuantity = this.simplify(this.updatedCurrency.quantity)
      this.calcedRub = this.simplify(this.updatedCurrency.rub)
      this.calcedUsd = this.simplify(this.updatedCurrency.usd)
      this.calcedEur = this.simplify(this.updatedCurrency.eur)
    },
  },
  methods: {
    simplify(value) {
      for (let i = 5; i >= -3; i -= 1) {
        if (value >= 10 ** i) {
          return (Math.floor(value * (10 ** (5 - i))) / (10 ** (5 - i))).toString()
        }
      }

      return (Math.floor(value * (10 ** 8)) / (10 ** 8)).toString()
    },
    recalc(ob) {
      clearTimeout(this.inputTimer)
      this.inputTimer = setTimeout(async () => {
        try {
          const { data: { data, status, message } } = await this.$noAuth({
            url: 'rate/calculate',
            data: {
              currency: this.currency.symbol,
              ...ob,
            },
          })

          if (status) {
            this.updatedCurrency = data
          } else {
            this.$error.show(message)
          }
        } catch {
          this.$error.show()
        }
      }, 500)
    },
  },
}
</script>

<style lang="scss">
.rates-row {
  .q-field, .q-field__control {
    height: 36px;
  }
  .q-field--outlined .q-field__control:before {
    border: none;
  }
}
</style>