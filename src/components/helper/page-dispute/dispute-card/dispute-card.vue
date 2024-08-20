<template>
  <router-link
    class="dispute-card shadow-md border border-gray-100 dark:border-gray-800 block rounded-md lg:p-5 xs:p-4"
    :class="disputeClass"
    :to="`/disputes/${dispute.chat_id}`"
  >
    <span class="text-sm">
      <header
        class="flex items-center justify-between mb-3 text-gray-400 dark:text-gray-500"
      >
        <p class="text-gray-500 dark:text-gray-300 mr-4 font-semibold">
          {{ `#${dispute.deal_id}` }}
        </p>
        <p
          :class="{
            'text-primary':
              $route.params && $route.params.chat_id == dispute.chat_id,
          }"
          class=""
        >
          {{ formattedDate }}
        </p>
      </header>
      <div class="flex items-center mb-1">
        <p class="text-gray-500 dark:text-gray-300 max-w-100 w-full">
          {{ $t('conversation.seller') }}:
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          {{ `#${dispute.seller.id} ` }} {{ dispute.seller.name }}
        </p>
      </div>
      <div class="flex items-center mb-1">
        <p class="text-gray-500 dark:text-gray-300 max-w-100 w-full">
          {{ $t('conversation.buyer') }}:
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          {{ `#${dispute.buyer.id} ` }} {{ dispute.buyer.name }}
        </p>
      </div>
      <Transaction
        class="ml-24 pl-1"
        :from-value="dispute.value_from"
        :from-abbr="dispute.offer.currency_from"
        :to-value="dispute.value_to"
        :to-abbr="dispute.offer.currency_to"
        :payment-types="dispute.payment_types"
      />
      <div
        v-if="dispute.looker && dispute.looker.id !== id"
        class="dispute__counterparty"
      >
        <div class="text-gray-500 dark:text-gray-300 max-w-100 w-full">
          {{ $t('conversation.allows') }}:
        </div>
        <div class="text-gray-700 dark:text-gray-300">
          {{ dispute.looker.name }}
        </div>
      </div>
      <DisputeTransaction
        v-if="dealRequisites.seller || dealRequisites.buyer"
        class="pt-3"
        :seller="dealRequisites.seller"
        :buyer="dealRequisites.buyer"
      />
    </span>
  </router-link>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { format } from 'date-fns'
import { isEmpty } from 'lodash'
import Transaction from 'src/components/extends/transaction/transaction.vue'
import DisputeTransaction from '../dispute-transaction/dispute-transaction.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
export default {
  name: 'Dispute',
  components: {
    Transaction,
    DisputeTransaction,
  },
  props: {
    dispute: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    buyerDealRequisites: null,
  }),
  computed: {
    ...mapUserState(['id']),
    formattedDate() {
      return format(this.$getDateInMs(this.dispute.created_at), 'dd.MM.yyyy')
    },
    disputeClass() {
      if (
        this.dispute.unread &&
        this.dispute.looker &&
        this.dispute.looker.id === this.id
      ) {
        return 'dispute_unread'
      }
      return null
    },
    hasDealRequisites() {
      return !isEmpty(this.dispute.deal_requisites.seller_requisites)
    },
    dealRequisites() {
      return {
        seller: this.dispute.deal_requisites.seller_requisites,
        buyer: this.dispute.deal_requisites.buyer_requisites,
      }
    },
  },
}
</script>
