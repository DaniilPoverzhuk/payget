<template>
  <div class="deposit-info">
    <div class="flex justify-between mb-6">
      <p class="text-gray-500 dark:text-gray-300 font-semibold text-xl pr-2">
        {{ $t('deposit.onAccount') }}
      </p>
      <p
        v-if="totalDeposit"
        class="text-primary font-semibold text-xl"
      >
        {{ totalDeposit }} BTC
      </p>
      <p
        v-else
        class="text-gray-500 dark:text-gray-300"
      >
        {{ $t('deposit.noFunds') }}
      </p>
    </div>
    <div class="flex justify-between mb-6">
      <p class="text-gray-500 dark:text-gray-300 pr-2">
        {{ $t('deposit.available') }}
      </p>
      <p
        v-if="deposit"
        class="text-gray-700 dark:text-gray-300 font-semibold text-xl"
      >
        {{ deposit }} BTC
      </p>
      <p
        v-else
      >
        {{ $t('deposit.noFunds') }}
      </p>
    </div>
    <div class="flex justify-between mb-6">
      <p class="text-gray-500 dark:text-gray-300 pr-2">
        {{ $t('headers.hold') }}
      </p>
      <p
        v-if="deposit_hold"
        class="text-gray-700 dark:text-gray-300 font-semibold"
      >
        {{ deposit_hold }} BTC
      </p>
      <p
        v-else
      >
        {{ $t('deposit.noFunds') }}
      </p>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  name: 'DepositInfo',
  computed: {
    ...mapUserState(['deposit', 'deposit_hold', 'deposit_sum', 'deposit_supplement', 'flags']),
    totalDeposit() {
      return this.deposit_sum
    },
  },
}
</script>
