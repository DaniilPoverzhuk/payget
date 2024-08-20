<template>
  <form class="deposit-input-codes" @submit.prevent="inputCode">
    <VInput
      v-model="promoCode"
      class="mt-4"
      :v="v$.promoCode"
      :label="$t('deposit.iHavePromoCode')"
      :hint="$t('deposit.iHavePromoCode')"
      :placeholder="$t('deposit.enterСode')"
    />
    <Button
      view-color="secondary"
      :loading="isLoading"
      :disabled="!promoCode || v$.$error"
      :submit="true"
      class="w-full mt-4"
      >{{ $t('deposit.applyCode') }}</Button
    >
  </form>
</template>

<script>
import Button from 'src/components/extends/button/button.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import { createNamespacedHelpers } from 'vuex'

const { mapMutations: mapUserMutations } = createNamespacedHelpers('user')

export default {
  name: 'DepositInputCode',
  components: {
    Button,
    VInput,
  },
  data: () => ({
    isLoading: false,
    promoCode: '',
  }),
  setup() {
    return {
      v$: useVuelidate({ $scope: 'promocodes' }),
    }
  },
  validations() {
    return {
      promoCode: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(20),
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
    async inputCode() {
      this.v$.$touch()
      if (this.v$.$invalid) return
      const notValidCode = this.$t('deposit.codeNotValid')
      try {
        const {
          data: { status, message },
        } = await this.$instance({
          url: 'wallet/invoice',
          data: {
            code: this.promoCode,
            type: 'promocode',
          },
        })

        if (status) {
          this.v$.$reset()
          this.promoCode = ''
          this.fetchUser()
        } else {
          this.$error.show(notValidCode)
        }
      } catch (error) {
        console.log('error', error)
        this.$error.show(notValidCode)
      }
    },
  },
}
</script>
