<template>
  <div class="deposit-funds">
    <template v-if="invoice === null">
      <Button
        class="w-full lg:col-start-1 lg:row-start-1"
        view-color="primary"
        @click="fetchInvoice"
        >{{ $t('deposit.depositAccount') }}</Button
      >
    </template>
    <Loader v-if="isLoader" />
    <transition name="fade" class="depositFunds">
      <div
        v-if="invoice !== null"
        class="shadow-base lg:rounded-lg lg:p-6 xs:p-4 text-gray-500 dark:text-gray-300 xs:-mx-4 dark:border dark:border-gray-700"
      >
        <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
          {{ $t('deposit.replenishmentAccount') }}
        </p>
        <p class="text-sm">
          {{ $t('deposit.depositReplenish') }}
        </p>
        <p class="text-sm text-gray-700 dark:text-gray-300 break-words">
          {{ invoice.wallet_address }}
        </p>
        <b class="text-sm">
          {{
            $t('deposit.takesService', { sum: invoice.commission.commission })
          }}
        </b>
        <p class="text-sm">
          {{ $t('deposit.minimumAmount', { num: invoice.commission.min }) }}
        </p>
      </div>
    </transition>
  </div>
</template>

<script>
import Loader from 'src/components/extends/loader/loader.vue'
import Button from 'src/components/extends/button/button.vue'
import { useVuelidate } from '@vuelidate/core'
import { minLength, maxLength, required } from '@vuelidate/validators'

export default {
  name: 'DepositFunds',
  components: {
    Loader,
    Button,
  },
  data: () => ({
    isLoader: false,
    invoice: null,
  }),
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
  mounted() {
    this.fetchInvoiceCurrent()
  },
  validations() {
    const validation = {
      promoCode: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(20),
      },
    }
    return validation
  },
  methods: {
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
  },
}
</script>
