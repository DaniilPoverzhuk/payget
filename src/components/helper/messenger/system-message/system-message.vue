<template>
  <div
    v-if="message.message !== 'chat.created' && isShowMessage"
    class="system-message"
  >
    <p
      class="text-center"
    >
      <span
        v-if="userRole"
        class="text-gray-700 dark:text-gray-300 text-sm text-center font-semibold inline-block"
      >{{ $t(userRole) }}</span>&nbsp;
      <span class="text-gray-700 dark:text-gray-300 text-sm text-center font-semibold inline-block ">
        {{ messageTitle }} <span class="font-normal text-gray-400 dark:text-gray-500">{{ messageTime }}</span>
      </span>
    </p>
    <div
      v-if="isBuyer && isNewDealStatus"
      class="text-gray-700 dark:text-gray-300 text-sm text-center"
    >
		{{ $t('offer.haveCreatedFirst') }}
		<strong>{{timeExpiration.amountFrom}}</strong>
		<strong>{{timeExpiration.amountNameFrom}}</strong>
		{{ $t('offer.haveCreatedFor') }}
		<strong>{{timeExpiration.amountTo}}</strong>
		<strong>{{timeExpiration.amountToName}}</strong>
		{{ $t('offer.haveCreatedSecond') }}
    </div>
    <div
      v-if="walletMessage && !url"
      class="text-gray-700 dark:text-gray-300 text-sm text-center"
    >
      {{ walletMessage }}
    </div>
    <Requisites
      v-if="url"
      :is-seller="isSeller"
      :is-reviewed="isReviewed"
      :message="requisitesDialogUrl"
      :is-buyer="isBuyer"
      :leave-review="!isShowReviewed && isBuyer && message.message_data.button"
    />
    <div
      v-if="messageText"
      class="text-gray-700 dark:text-gray-300 text-sm text-center pt-2"
    >
      {{ messageText }}
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns'
import { DEAL_STATUS, USER_ROLE } from 'src/constants'
import Requisites from '../requisites/requisites.vue'


const {
  ADMIN, MODERATOR, SELLER, BUYER,
} = USER_ROLE
const {
  DEAL_STATUS_NEW,
  DEAL_STATUS_DONE,
} = DEAL_STATUS

export default {
  name: 'SystemMessage',
  components: {
    Requisites,
  },
  props: {
    id: {
      type: String,
    },
    isReviewed: {
      type: Boolean,
      default: true,
    },
    url: {
      type: Boolean,
      required: false,
    },
    message: {
      type: Object,
      required: true,
    },
    members: {
      type: Array,
      required: true,
    },
    timeExpiration: {
      type: Object,
      required: true,
    },
    isBuyer: {
      type: Boolean,
      required: false,
    },
    isSeller: {
      type: Boolean,
      required: false,
    },
  },
  data: () => ({
    requisitesDialogUrl: '',
    roles: {
      [SELLER]: 'conversation.seller',
      [BUYER]: 'conversation.buyer',
      [ADMIN]: 'conversation.administrator',
      [MODERATOR]: 'conversation.moderator',
    },
  }),
  computed: {
    isShowReviewed() {
      if (this.message.message_data.requisites && this.message.message_data.requisites.type) {
        if (this.message.message_data.requisites.type === 'url') {
          this.updateRequisitesDialogUrl()
          return false
        }
      }
      return this.isReviewed
    },
    walletMessage() {
      const { title, requisites } = this.message.message_data
      if (title !==  'chat.deal_start.title') return false
      if (requisites) return `${this.$t('headers.requisites')}: ${requisites.value}`
      return this.isSeller
        ? 'error.detailsBanking'
        : 'error.specifiedDetails'
    },
    hideWalletMessage() {
      return this.isSeller && this.message.message_data.title === 'chat.press_paid_button.title'
    },
    userRole() {
      const { message, title } = this.message.message_data
      const { role } = this.members
        .find(member => member.user.id === this.message.user_id)
      const roleName = this.roles[role] || 'user.title'

      if (this.id !== this.message.user_id && !message && !title) {
        return roleName
      }

      return null
    },
    systemMessageHeader() {
      return this.message.message_data && this.message.message_data.title !== 'chat.press_paid_button.title'
    },
    messageTitle() {
      const { message, title } = this.message.message_data
      const userName = this.members
        .find(member => member.user.id === this.message.user_id).user.name

      if (!message && !title) {
        if (this.userRole) {
          return `${userName}  ${this.$t('chat.joinedChat')}`
        }

        return this.$t('chat.youConnected')
      }

      if (title === 'chat.dispute_open.title') {
        return `${userName} ${this.$t('chat.openedDispute')}`
      }

      return this.$t(title)
    },
    isShowMessage() {
      const { title } = this.message.message_data

      if (this.walletMessage && (this.isBuyer && this.timeExpiration.dealBuyerStatus === DEAL_STATUS_DONE)) {
        return false
      }

      if (title !== 'chat.press_paid_button.title') {
        return true
      }

      return !this.isSeller && this.timeExpiration.dealBuyerStatus !== DEAL_STATUS_DONE
    },
    messageTime() {
      return format(this.$getDateInMs(this.message.created), 'HH:mm')
    },
    messageText() {
      const { message, title } = this.message.message_data
      if (this.walletMessage) return null

      if (title === 'chat.deal_buyer_end.title' && !this.isSeller) {
        return null
      }

      if (title === 'chat.deal_seller_end.title' && (!this.isBuyer || this.isDoneDealStatus)) {
        return null
      }

      return this.$t(message)
    },
    isNewDealStatus() {
      return this.timeExpiration.dealStatus === DEAL_STATUS_NEW
    },
    isDoneDealStatus() {
      return this.timeExpiration.dealStatus === DEAL_STATUS_DONE
    },
  },
  methods: {
    showReviewDialog() {
      this.$emit('showReviewDialog')
    },
    updateRequisitesDialogUrl() {
      this.requisitesDialogUrl = this.message.message_data.requisites.value
    }
  },
}
</script>
