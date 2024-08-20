<template>
  <form class="deposit-codes" @submit.prevent="generateCodes">
    <VInput
      v-model="promoCode.amount"
      class="mt-4"
      :v="v$.promoCode?.amount"
      type="number"
      postfix="BTC"
      :label="$t('deposit.promoСodeAmount')"
    />
    <VInput
      v-model="promoCode.quantity"
      class="mt-4"
      :v="v$.promoCode?.quantity"
      type="number"
      :label="$t('deposit.numberOfCodes')"
    />
    <VInput
      v-model="promoCode.length"
      class="mt-4"
      :v="v$.promoCode?.length"
      type="number"
      :label="$t('deposit.promoCodeLength')"
    />
    <VInput
      v-model="promoCode.period"
      class="mt-4"
      :v="v$.promoCode?.period"
      type="number"
      :label="$t('deposit.numberOfDays')"
    />
    <Button
      view-color="secondary"
      :loading="isLoading"
      :submit="true"
      class="w-full mt-4"
      >{{ $t('deposit.generateCodes') }}</Button
    >
  </form>
  <Dialog
    v-model="isShowCodes"
    :heading="$t('deposit.createdPromoCodes')"
    @hide="closeCodes"
  >
    <ul class="list-codes p-4 font-medium">
      <li v-for="code in codes" :key="code">
        {{ code }}
      </li>
    </ul>
    <div class="actions flex flex-center gap-4">
      <Button view-color="grey" @click="closeCodes">{{
        $t('button.cancel')
      }}</Button>
      <Button view-color="secondary" icon="clipboard-copy" @click="copy">{{
        $t('button.copy')
      }}</Button>
    </div>
  </Dialog>
</template>

<script>
import Button from 'src/components/extends/button/button.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'
import { copyToClipboard, Notify } from 'quasar'
import { useVuelidate } from '@vuelidate/core'
import {
  required,
  minValue,
  maxValue,
  decimal,
  numeric,
  integer,
} from '@vuelidate/validators'
import { createNamespacedHelpers } from 'vuex'

const { mapMutations: mapUserMutations } = createNamespacedHelpers('user')

export default {
  name: 'DepositCodes',
  components: {
    Button,
    VInput,
    Dialog,
  },
  data: () => ({
    isLoading: false,
    isShowCodes: false,
    codes: [],
    promoCode: {
      amount: null,
      quantity: null,
      length: 5,
      period: null,
    },
  }),
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
  computed: {
    copyCodes() {
      return this.codes.join('\n')
    },
  },
  mounted() {
    this.fetchInvoiceCurrent()
  },
  validations() {
    return {
      promoCode: {
        amount: {
          decimal,
          required,
          minValue: minValue(0),
        },
        quantity: {
          required,
          integer,
          minValue: minValue(0),
          maxValue: maxValue(99),
        },
        length: {
          required,
          integer,
          minValue: minValue(5),
          maxValue: maxValue(20),
        },
        period: {
          required,
          integer,
          minValue: minValue(1),
        },
      },
    }
  },
  methods: {
    ...mapUserMutations(['init']),
    async fetchUser() {
      const {
        data: { data },
      } = await this.$instance('user/get/data')
      if (data) {
        this.init({
          deposit: data.deposit,
          deposit_hold: data.deposit_hold,
          deposit_sum: data.deposit_sum,
          deposit_supplement: data.deposit_supplement,
        })
      }
    },
    async generateCodes() {
      this.v$.$touch()
      if (this.v$.$invalid) return
      this.isLoading = true
      try {
        const { data, status } = await this.$instance.post(
          'wallet/promocode',
          this.promoCode
        )
        if (status) {
          this.promoCode = {
            amount: null,
            quantity: null,
            length: 5,
            period: null,
          }
          this.v$.$reset()
          this.fetchUser()
          this.$emit('generate')
          this.codes = data.data
          this.isShowCodes = true
        } else {
          this.$error.show('Create codes failed.')
        }
      } catch (e) {
        console.log('wallet/promocode error', e)
        this.$error.show(this.$t('deposit.promoAccessDenied'))
      } finally {
        this.isLoading = false
      }
    },
    async fetchInvoiceCurrent() {
      try {
        const {
          data: { data, message },
        } = await this.$instance({
          method: 'GET',
          url: 'wallet/invoice/current',
        })
        if (data) {
          this.invoice = data
        }
      } catch (e) {
        // this.$error.show('No invoice')
      }
    },
    async fetchInvoice() {
      this.isLoader = true
      try {
        const {
          data: { data },
        } = await this.$instance({
          url: 'wallet/invoice',
        })
        this.invoice = data
      } catch {
        this.$error.show()
      }
      this.isLoader = false
    },
    closeCodes() {
      this.isShowCodes = false
      this.codes = []
    },
    copy() {
      copyToClipboard(this.copyCodes)
        .then(() => {
          Notify.create({ message: this.$t('button.copied'), type: 'info' })
        })
        .catch(() => {
          Notify.create({ message: this.$t('error.error'), type: 'negative' })
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.list-codes {
  list-style-type: decimal;
}
</style>
