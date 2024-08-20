<template>
  <div class="deposit w-full lg:px-6 xs:px-4 lg:flex">
    <div class="pt-6 lg:max-w-384 w-full pb-6 lg:mr-9 flex-shrink-0">
      <TabsBadges
        class="mb-0"
        :labels="statusText"
        @setPath="setPath"
        :first-tab="activeTab"
      />
      <!-- <h1
        class="text-2xl font-semibold text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6 xs:text-center"
      >
        {{ $t('deposit.title') }}
      </h1> -->
      <template v-if="isDeposit">
        <DepositInfo />
        <DepositFunds />
        <div class="mt-10">
          <h2
            class="text-gray-700 dark:text-gray-300 font-semibold text-xl pr-2 mb-6 xs:text-center"
          >
            {{ $t('deposit.fundsWithdraw') }}
          </h2>
          <p
            v-if="withdraw"
            class="mb-6 shadow-base lg:p-6 xs:p-4 lg:rounded-lg text-sm text-gray-500 dark:text-gray-300 xs:-mx-4 dark:border dark:border-gray-700"
          >
            {{
              $t('deposit.takesServiceMinimum', {
                commission: withdraws.commission,
                min: withdraws.min,
              })
            }}
          </p>
          <form @submit.prevent="withdrawDeposit">
            <VInput
              v-model="withdraw_value"
              class="mb-6"
              :v="v$.withdraw_value"
              :disabled="!deposit"
              :label="$t('deposit.amountWithdrawal')"
              type="number"
              postfix="BTC"
              step="any"
            />
            <VInput
              v-model="withdraw_requisites"
              class="mb-6"
              :v="v$.withdraw_requisites"
              :label="$t('deposit.addressBtc')"
              type="text"
            >
              <template #error>
                <p v-if="validBtcAddress" class="mt-2 text-sm text-red-900">
                  {{ $t('deposit.validAddressBtc') }}
                </p>
              </template>
            </VInput>
            <Button
              view-color="secondary"
              :disabled="!deposit"
              :loading="withdrawingDeposit"
              :submit="true"
              type="success"
              class="w-full"
              >{{ $t('deposit.fundsWithdraw') }}</Button
            >
          </form>
        </div>
      </template>
      <template v-else>
        <DepositInputCodes />
        <hr class="mt-7" />
        <DepositCodes @generate="onGenerate" />
      </template>
    </div>
    <div
      class="w-full lg:pl-9 py-6 lg:border-l-2 lg:border-gray-200 lg:dark:border-gray-700"
    >
      <DepositHistory v-if="activeTab === 'deposit'" :key="idWithdraw" />
      <DepositListCodes ref="$listCodes" v-else />
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
// import {
//   maxLength, minLength, minValue, required, helpers,
// } from 'vuelidate/lib/validators'
import { validate } from 'bitcoin-address-validation'
import TabsBadges from 'src/components/extends/tabs-badges/tabs-badges-new.vue'

import { useVuelidate } from '@vuelidate/core'
import { decimal, minValue, required, helpers } from '@vuelidate/validators'

import VInput from 'src/components/extends/v-input/v-input.vue'
import Button from 'src/components/extends/button/button.vue'
import DepositFunds from 'src/components/helper/page-deposit/deposit-funds/deposit-funds.vue'
import DepositInfo from 'src/components/helper/page-deposit/deposit-info/deposit-info.vue'
import DepositHistory from 'src/components/helper/page-deposit/deposit-history/deposit-history.vue'
import DepositCodes from 'src/components/helper/page-deposit/deposit-codes/deposit-codes.vue'
import DepositListCodes from 'src/components/helper/page-deposit/deposit-codes/deposit-list-codes.vue'
import { nextTick } from 'vue'
import DepositInputCodes from 'src/components/helper/page-deposit/deposit-codes/deposit-input-codes.vue'

const currency = helpers.regex(
  'alpha',
  /^(?!0$)(?!0\d)(?:\d+|\d{1,3}(?:,\d{3})+)(?:[.,]\d+)?$/
)

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Deposit',
  components: {
    VInput,
    Button,
    DepositInfo,
    DepositHistory,
    DepositFunds,
    DepositCodes,
    DepositListCodes,
    TabsBadges,
    DepositInputCodes,
  },
  setup: () => {
    return {
      v$: useVuelidate({ $stopPropagation: true, $scope: 'deposit' }),
    }
  },
  data: () => ({
    activeTab: 'deposit',
    statusText: {
      deposit: {
        text: 'deposit.title',
      },
      promoCodes: {
        text: 'deposit.promoCodes',
      },
    },
    validBtcAddress: false,
    idWithdraw: '',
    withdrawingDeposit: false,
    isLoading: false,
    depositInfo: null,
    withdraw: {
      value: null,
      requisites: null,
    },
    withdraw_value: null,
    withdraw_requisites: null,
  }),
  computed: {
    ...mapUserState(['deposit', 'depositConfig']),
    withdraws() {
      return this.depositConfig !== null && this.depositConfig.withdraw
    },
    minValueWithdraws() {
      return this.withdraws ? this.withdraws.min : '1'
    },
    isDeposit() {
      return this.activeTab === 'deposit'
    },
  },
  validations() {
    const validation = {
      withdraw_requisites: {
        required,
      },
      withdraw_value: {
        decimal,
        required,
      },
    }
    if (this.withdraws) {
      validation.withdraw_value = {
        required,
        decimal,
        minValue: minValue(this.minValueWithdraws),
      }
    }
    console.log('validation', validation)
    return validation
  },
  created() {
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab
    }
  },
  methods: {
    onGenerate() {
      if (this.$refs.$listCodes) {
        this.$refs.$listCodes.getCodes()
      }
    },
    async withdrawDeposit() {
      this.v$.$touch()
      console.log('withdrawDeposit', this.v$.$invalid, this.v$)
      if (this.v$.$invalid) return
      console.log('withdrawDeposit 1')
      this.validBtcAddress = !validate(this.withdraw_requisites)
      console.log('withdrawDeposit 2')
      if (!validate(this.withdraw_requisites)) return
      console.log('withdrawDeposit 3')
      this.withdrawingDeposit = true
      console.log('withdrawDeposit 4')
      this.setWithdrawFunds()
      console.log('withdrawDeposit 5')
    },
    async setWithdrawFunds() {
      try {
        const {
          data: { status, message },
        } = await this.$instance({
          url: 'wallet/invoice',
          data: {
            amount: this.withdraw_value,
            wallet_address: this.withdraw_requisites,
            type: 'withdrawal',
          },
        })

        if (status) {
          this.idWithdraw = Math.random()
          this.withdraw_value = null
          this.withdraw_requisites = null
          this.v$.$reset()
        } else {
          this.$error.show(message)
        }
      } catch (error) {
        this.$error.show(this.$t(error.response.data))
      }

      this.withdrawingDeposit = false
    },
    setPath(tab) {
      this.activeTab = tab
    },
  },
}
</script>
