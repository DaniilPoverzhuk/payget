<template>
    <div class="profile-paid">
        <form class="profile-paid__form" novalidate="novalidate" @submit.prevent="updateSubscriptionPay">
            <div class="profile-paid__item">
                <VInpuSelect class="editor-paid__select" v-model="paidData.monthly.cost" :label="$t('user.priceSubscription', 1, {count: 1})" id="monthly" :prefix="activeSelect.prefix" placeholder="0.00" :activeCurrency="paidData.monthly.currency" :currencyList="currencyList" @setCurrency="setCurrency" type="number" :v="v$.paidData.monthly.cost"></VInpuSelect>
            </div>
            <div class="profile-paid__item">
                <VInpuSelect class="editor-paid__select" v-model="paidData.three_months.cost" :label="$t('user.priceSubscription', 3, {count: 3})" id="three_months" :prefix="activeSelect.prefix" placeholder="0.00" :activeCurrency="paidData.three_months.currency" :currencyList="currencyList" @setCurrency="setCurrency" type="number" :v="v$.paidData.three_months.cost"></VInpuSelect>
            </div>
            <div class="profile-paid__item">
                <VInpuSelect class="editor-paid__select" v-model="paidData.six_months.cost" :label="$t('user.priceSubscription', 6, {count: 6})" id="six_months" :prefix="activeSelect.prefix" placeholder="0.00" :activeCurrency="paidData.six_months.currency" :currencyList="currencyList" @setCurrency="setCurrency" type="number" :v="v$.paidData.six_months.cost"></VInpuSelect>
            </div>
            <div class="profile-paid__item">
                <VInpuSelect class="editor-paid__select" v-model="paidData.yearly.cost" :label="$t('user.priceFullYear')" id="yearly" :prefix="activeSelect.prefix" placeholder="0.00" :activeCurrency="paidData.yearly.currency" :currencyList="currencyList" @setCurrency="setCurrency" type="number" :v="v$.paidData.yearly.cost"></VInpuSelect>
            </div>
            <Hint class="editor-paid__hint" :label="$t('channel.buyingCost')"></Hint>
            <Commission></Commission>
            <div class="profile-paid__action"><Button :loading="isLoading" class="button button_size_lg editor-channel__btn" :submit="true"
      :wide="true"> {{$t('button.saveChanges')}}</Button></div>
        </form>
    </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import {
  helpers, minValue, required, decimal
} from '@vuelidate/validators'
import Hint from 'src/components/hint/hint.vue'
import VInpuSelect from 'src/components/v-input-select/v-input-select.vue'
import Commission from 'src/components/editor-channel/editor-commission/editor-commission.vue'
import useVuelidate from '@vuelidate/core'

const payPostCost = helpers.regex('alpha', /^(?!0$)(?!0\d)(?:\d+|\d{1,3}(?:,\d{3})+)(?:[.,]\d+)?$/)
const {
  mapMutations: mapUserMutations,
  mapActions: mapUserActions,
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  name: 'ProfilePaid',
  components: {
    Commission,
    VInpuSelect,
    Hint,
  },
  computed: {
    ...mapUserState(['color_theme', 'id']),
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  data() {
    return {
      modeLocal: 'ones',
      cost: '',
      activeSelect: { value: 'USD', prefix: '$' },
      isLoading: false,
      modeList: [
        { value: 'ones', label: 'channel.purchaseOneTime', default: true },
        { value: 'paid', label: 'channel.setSubscription', default: false },
        { value: 'both', label: 'channel.optionsBoth', default: false },
      ],
      currencyList: {
        USD: '$',
        RUB: '&#8381;',
      },
      paidData: {
        monthly: {
          cost: '',
          currency: 'USD',
        },
        three_months: {
          cost: '',
          currency: 'USD',
        },
        six_months: {
          cost: '',
          currency: 'USD',
        },
        yearly: {
          cost: '',
          currency: 'USD',
        },
      },
    }
  },
  validations: {
    paidData: {
      monthly: {
        cost: {
          required,
          decimal,
          minValue: minValue(0),
        },
      },
      three_months: {
        cost: {
          required,
          decimal,
          minValue: minValue(0),
        },
      },
      six_months: {
        cost: {
          required,
          decimal,
          minValue: minValue(0),
        },
      },
      yearly: {
        cost: {
          required,
          decimal,
          minValue: minValue(0),
        },
      },
    },
  },
  mounted() {
    this.getPlan()
  },
  methods: {
    ...mapUserMutations(['setTheme', 'update']),
    ...mapUserActions(['update']),
    setCurrency(currency, id) {
      this.paidData[id].currency = currency
    },
    updateSubscriptionPay() {
      this.v$.paidData.$touch()
      if (this.v$.paidData.$invalid || this.isLoading) return
      this.isLoading = true
      this.v$.paidData.$reset()

      const form = new FormData()
      form.append('channel_id', this.id)
      Object.keys(this.paidData).map((el) => {
        form.append(`price[${el}][cost]`, this.paidData[el].cost)
        form.append(`price[${el}][currency]`, this.paidData[el].currency)
      })
      this.submitSubscriptionPay(form)
    },
    async submitSubscriptionPay(form) {
      try {
        const { status, data } = await this.$instance({
          url: `/userfeed/channel/${this.id}/plan`,
          data: form,
        })
      } catch {
        this.$error.show()
      } finally {
        this.isLoading = false
      }
    },
    async getPlan() {
      try {
        const { data, status } = await this.$instance({
          method: 'GET',
          url: `/userfeed/channel/${this.id}/plan`,
          params: {
            channel_id: this.id,
          },
        })
        if (data) {
          if (data.data.length) {
            data.data.map((el) => {
              this.paidData[el.type] = el.price
            })
          }
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
<style lang="scss">
.profile-paid {
  &__item {
    margin-bottom: 24px;
  }
  &__action,
  &__item {
    max-width: 345px;
  }
  &__action {
    margin-top: 40px;
  }
}
</style>
