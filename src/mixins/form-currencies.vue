<script>
import { createNamespacedHelpers } from 'vuex'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  data() {
    return {
      currencyFrom: '',
      currencyTo: '',
    }
  },
  computed: {
    ...mapUserState(['currencies']),
    currencyList() {
      return Object.values(this.currencies).reduce((list, currency) => {
        if (currency.active_exchange) {
          const currencyData = {
            value: currency.symbol,
            text: `${currency.symbol}, ${currency.name}`,
            disabled: false,
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
              value: '',
              text: '',
              disabled: true,
              selected: true,
            },
          ],
        },
      ]).sort((a, b) => a.sort - b.sort)
    },
    currencyListFrom() {
      return [...this.currencyList].map(group => ({
        ...group,
        list: group.list.map(currency => ({
          ...currency,
          disabled: currency.value === this.currencyTo || !currency.value,
        })),
      }))
    },
    currencyListTo() {
      return [...this.currencyList].map(group => ({
        ...group,
        list: group.list.map(currency => ({
          ...currency,
          disabled: currency.value === this.currencyFrom || !currency.value,
        })),
      }))
    },
  },
  methods: {
    toggleCurrencies() {
      const oldCurrencyFrom = this.currencyFrom

      this.currencyFrom = this.currencyTo
      this.currencyTo = oldCurrencyFrom
    },
  },
}
</script>
