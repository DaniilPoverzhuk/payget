<template>
  <div
    v-if="data !== null"
    class="header-deal xs:min-h-60 xs:px-4 xs:py-2 xs:relative xs:pr-20"
  >
    <LinkBack
      v-if="$matchMedia.mobile"
      class="xs:mb-2"
      to="/messages"
    >
      <HeaderName
        class="flex flex-col"
        :interlocutor="interlocutor"
        :is-seller="isSeller"
      />
    </LinkBack>
    <div
      v-if="$matchMedia.mobile"
      class="xs:absolute top-4 right-4"
    >
      <MuteChat
        :mute="data.muted"
        :chatId="data.id"
      />
      <button
        @click="isOpen =! isOpen "
      >
        <svg
          v-svg
          class="w-6 h-6 text-primary ml-4 transform transition duration-500 ease-in-out"
          :class="isOpen && 'rotate-180'"
          symbol="chevron-down"
        />
      </button>
    </div>
    <TransitionSlide>
      <div
        v-show="$matchMedia.desktop || ($matchMedia.mobile && isOpen)"
        class="w-full lg:flex lg:items-center lg:justify-between lg:pl-10 lg:py-4"
      >
        <div class="lg:mr-3">
          <HeaderName
            v-if="$matchMedia.desktop"
            :is-seller="isSeller"
            :interlocutor="interlocutor"
          />
          <div
            class="flex items-start xs:mt-4"
          >
            <span class="font-semibold text-sm text-gray-500 dark:text-gray-300 pr-3">{{ `#${data.deal.id}` }}</span>
            <Transaction
              class="text-sm"
              :from-value="+data.deal.value_from"
              :from-abbr="data.offer.currency_from"
              :from-name="currencies[data.offer.currency_from] && currencies[data.offer.currency_from].name"
              :to-value="+data.deal.value_to"
              :to-abbr="data.offer.currency_to"
              :to-name="currencies[data.offer.currency_to] && currencies[data.offer.currency_to].name"
              :payment-types="data.payment_types"
            />
          </div>
          <RequisitesChatTransaction
            v-if="hasDealRequisites"
            class="mt-2"
            :buyer="dealRequisites.buyer"
            :seller="dealRequisites.seller"
          />
        </div>
        <div class="flex items-center space-x-3">
          <MuteChat
            v-if="$matchMedia.desktop"
            :chatId="data.id"
            :mute="data.muted"
          />
          <HeaderActionsDeal
            :chat-id="data.id * 1"
            :deal="data.deal"
            class="xs:py-2"
            :is-reviewed="data.is_reviewed"
            :is-seller="isSeller"
            :members="data.members"
            :isUserInChat="isUserInChat"
            @setDeal="setDeal"
          />
        </div>
      </div>
    </TransitionSlide>
    <p
      v-if="isChatWarningVisible"
      class="lg:pl-10 xs:pl-4 pb-3 text-sm"
    >
      <svg
        v-svg
        class="w-5 h-5 inline-block text-red-700 dark:text-red-300"
        symbol="exclamation"
      />
      {{ $t("chat.doNotTransfer") }}
    </p>
  </div>
</template>

<script>

import { createNamespacedHelpers } from 'vuex'
import LinkBack from 'src/components/extends/link-back/link-back.vue'

import TransitionSlide from 'src/components/transition-slide/transition-slide.vue'
import Transaction from 'src/components/extends/transaction/transaction.vue'
// import RequisitesTransaction from '@/components/extends/transaction/requisites-transaction'
import RequisitesChatTransaction from 'src/components/extends/transaction/requisites-chat-transaction.vue'
import HeaderName from '../header-name/header-name.vue'
import MuteChat from '../../mute-chat/mute-chat.vue'
import HeaderActionsDeal from '../header-actions/header-actions.vue'
import { DEAL_STATUS, USER_ROLE } from 'src/constants'

const {
  DEAL_STATUS_NEW,
  DEAL_STATUS_DISPUTE,
  DEAL_STATUS_DISPUTE_APPROVED,
  DEAL_STATUS_DISPUTE_CANCELED,
  DEAL_STATUS_DONE,
  DEAL_STATUS_CANCELED,
} = DEAL_STATUS

const {
  ADMIN, MODERATOR, SELLER, BUYER,
} = USER_ROLE

const { mapState: mapUserState } = createNamespacedHelpers('user')
export default {
  name: 'HeaderDeal',
  components: {
    TransitionSlide,
    RequisitesChatTransaction,
    // RequisitesTransaction,
    Transaction,
    HeaderActionsDeal,
    LinkBack,
    HeaderName,
    MuteChat,
  },
  props: {
    chatData: {
      type: Object,
      default: null,
    },
    interlocutor: {
      type: Object,
      default: null,
    },
    isUserInChat: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    isOpen: true,
    showChatPanel: false,
    listPayment: null,
    data: null,

  }),
  computed: {
    // id currencies
    ...mapUserState(['id', 'role', 'currencies', 'accessToken', 'routLinkToMessage']),
    isChatWarningVisible() {
      return this.data !== null && this.data.deal.status === DEAL_STATUS_NEW && this.data.deal.seller_id !== this.id
    },
    isSeller() {
      return this.data.deal && this.data.deal.seller_id === this.id
    },
    hasDealRequisites() {
      return this.data.deal_requisites && this.data.deal_requisites.seller_requisites
    },
    dealRequisites() {
      return {
        buyer: this.data.deal_requisites.buyer_requisites,
        seller: this.data.deal_requisites.seller_requisites,
      }
    },

  },
  watch: {
    chatData() {
      this.data = { ...this.chatData }
    },
  },
  mounted() {
    this.data = { ...this.chatData }
  },
  methods: {

    startDealRequest(payload) {
      // this.$refs.chatActionListstartDeal.startDealRequest(payload)
    },

    setDeal(deal) {
      this.data.deal = deal
    },


    //
    // isDisputeResolved() {
    //   return (
    //       this.deal
    //       && (this.role === ADMIN || this.role === MODERATOR)
    //       && (this.deal.status === DEAL_STATUS_DISPUTE_APPROVED
    //           || this.deal.status === DEAL_STATUS_DISPUTE_CANCELED)
    //   )
    // },
    // isDisputeReassigned() {
    //   return (
    //       this.deal
    //       && this.deal.status === DEAL_STATUS_DISPUTE
    //       && this.role === MODERATOR
    //       && this.members.some(member => member.role === ADMIN)
    //   )
    // },

  },
}
</script>
