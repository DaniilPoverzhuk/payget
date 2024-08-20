<template>
  <div class="chat-action-list w-full flex items-center space-x-3">
    <Button
      v-if="deal.status === 'inprocess'"
      :loading="isloader === 'startDispute'"
      view-color="secondary"
      class="whitespace-nowrap xs:w-1/2 xs:text-sm"
      @click="startDispute"
    >
      {{ $t('disputes.open') }}
    </Button>
    <Button
      v-if="cancelDisputePossibility && !isUserInChat"
      :loading="isloader === 'cancelDispute'"
      view-color="white"
      class="whitespace-nowrap xs:w-1/2 xs:text-sm"
      @click="cancelDispute()"
    >
      {{ $t('disputes.cancel') }}
    </Button>
    <Button
      v-if="finishDealPossibility"
      :disabled="isFinishDealButtonDisabled"
      :loading="isloader === 'finishDeal'"
      class="whitespace-nowrap xs:w-1/2 xs:text-sm"
      view-color="primary"
      @click="finishDeal"
    >
      {{
        $t(
          !isSeller && deal.status_buyer !== 'done'
            ? 'disputes.iPaid'
            : 'disputes.complete'
        )
      }}
    </Button>
    <Button
      v-if="startDealPossibility"
      class="whitespace-nowrap xs:text-sm"
      view-color="secondary"
      @click="startDeal"
    >
      {{ $t('disputes.startDeal') }}
    </Button>
    <Button
      v-if="deletableChat"
      :loading="isloader === 'deleteChat'"
      class="whitespace-nowrap xs:text-sm"
      view-color="grey"
      @click="deleteChat"
    >
      {{ $t('disputes.delete') }}
    </Button>
    <Button
      v-if="leaveFeedbackPossibility"
      view-color="secondary"
      class="whitespace-nowrap xs:text-sm"
      @click="reviewDialog = true"
    >
      {{ $t('disputes.leaveReview') }}
    </Button>
    <DialogThin
      v-model="linkDialog"
      heading="chat.yourDetails"
      width="narrow"
      @hide="linkDialog = false"
    >
      <ChatDialog
        :chat-id="chatId"
        :list-payment="listPayment"
        @closeDialogThin="closeDialogThin"
        @startDealRequest="startDealRequest"
      />
    </DialogThin>
    <Dialog
      v-model="reviewDialog"
      class-custom="w-full max-w-lg"
      :error="false"
      :is-icon="false"
      @hide="reviewDialog = false"
    >
      <ReviewForm @success="reviewDialog = false" />
    </Dialog>
  </div>
</template>

<script>
import { USER_ROLE, DEAL_STATUS, MEMBER_STATUS } from 'src/constants'
import DialogThin from 'src/components/dialog/dialog-thin.vue'
import ChatDialog from 'src/components/helper/page-chat/chat-dialog/chat-dialog.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import ReviewForm from 'src/components/extends/review-form/review-form.vue'

const { ADMIN, MODERATOR, SELLER, BUYER } = USER_ROLE
const {
  DEAL_STATUS_NEW,
  DEAL_STATUS_INPROCESS,
  DEAL_STATUS_DISPUTE,
  DEAL_STATUS_DONE,
} = DEAL_STATUS
const { MEMBER_STATUS_DISPUTE, MEMBER_STATUS_DONE } = MEMBER_STATUS

export default {
  name: 'ChatActionList',
  components: {
    DialogThin,
    ReviewForm,
    ChatDialog,
    Dialog,
  },
  props: {
    deal: {
      type: Object,
      required: true,
    },
    chatId: {
      type: [String, Number],
    },
    isReviewed: {
      type: Boolean,
      required: true,
    },
    isSeller: {
      type: Boolean,
      required: true,
    },
    isLoading: {
      type: Boolean,
      // required: true,
    },
    members: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    isloader: '',
    reviewDialog: false,
    linkDialog: false,
    listPayment: null,
    startingDispute: false,
    cancelingDispute: false,
    finishingDeal: false,
    deletingChat: false,
    startingDeal: false,
  }),
  computed: {
    isUserInChat() {
      return (
        this.members && this.members.some((member) => member.role === 'admin')
      )
    },
    sellerName() {
      if (!this.members) return ''

      const seller = this.members.find((member) => member.role === SELLER)

      return seller ? seller.user.name : ''
    },

    cancelDisputePossibility() {
      if (this.deal.status !== DEAL_STATUS_DISPUTE) return false
      if (
        this.members &&
        this.members.some((member) => member.role === (MODERATOR || ADMIN))
      ) {
        return false
      }
      if (
        (this.deal.status_seller === MEMBER_STATUS_DISPUTE && this.isSeller) ||
        (this.deal.status_buyer === MEMBER_STATUS_DISPUTE && !this.isSeller)
      ) {
        return true
      }
      return false
    },
    finishDealPossibility() {
      if (
        this.deal.status === DEAL_STATUS_INPROCESS &&
        (this.deal.status_seller !== MEMBER_STATUS_DONE ||
          (!this.isSeller && this.deal.status_seller === MEMBER_STATUS_DONE))
      ) {
        return true
      }
      return false
    },
    isFinishDealButtonDisabled() {
      if (
        this.finishingDeal ||
        (!this.isSeller &&
          this.deal.status_buyer === MEMBER_STATUS_DONE &&
          this.deal.status_seller !== MEMBER_STATUS_DONE) ||
        (this.isSeller && this.deal.status_buyer !== MEMBER_STATUS_DONE)
      ) {
        return true
      }
      return false
    },
    deletableChat() {
      if (!this.deal) return false
      if (this.deal.status === DEAL_STATUS_NEW) return true
      if (this.deal.status === DEAL_STATUS_DONE) {
        if (!this.isSeller) return true
        if (this.isReviewed) return true
      }
      return false
    },
    startDealPossibility() {
      return this.deal.status === DEAL_STATUS_NEW && this.isSeller
    },
    leaveFeedbackPossibility() {
      if (this.isSeller || this.isReviewed) return false
      if (this.deal.status === DEAL_STATUS_DONE) return true
      return false
    },
  },
  watch: {
    // isLoading(value) {
    //   if (value) return
    //   this.startingDispute = false
    //   this.cancelingDispute = false
    //   this.finishingDeal = false
    //   this.deletingChat = false
    //   this.startingDeal = false
    // },
  },
  methods: {
    //   this.linkDialog = !this.linkDialog
    //   if (this.linkDialog) this.getTrustedPaymentSystems()
    // },

    startDeal() {
      this.linkDialog = !this.linkDialog
      if (this.linkDialog) this.getTrustedPaymentSystems()
    },
    async getTrustedPaymentSystems() {
      const { data } = await this.$instance.get('payments-systems/trusted')
      if (data.status) {
        this.listPayment =
          data.data.list && data.data.list.length > 0
            ? [...data.data.list]
            : null
      }
    },
    closeDialogThin() {
      this.linkDialog = false
      this.chatPanel = false
    },

    async startDispute() {
      this.isloader = 'startDispute'
      try {
        const {
          data: { status, message, data },
        } = await this.$instance({
          url: 'chat/dispute/start',
          data: {
            chat_id: this.chatId,
            hash: true,
          },
        })
        if (status && data) {
          this.$emit('setDeal', data)
        } else {
          this.$error.show(message)
        }
        this.isloader = ''
        // this.emitLoadingState(false)
      } catch (e) {
        console.error(e)
        const error = e.response?.data || this.$t('error.failedData')
        this.$error.show(error)
        // this.emitLoadingState(false)
      } finally {
        this.isloader = ''
      }
    },
    async cancelDispute() {
      this.isloader = 'cancelDispute'
      this.emitLoadingState(true)

      try {
        const {
          data: { status, message, data },
        } = await this.$instance({
          url: 'chat/dispute/finish',
          data: {
            chat_id: this.chatId,
            hash: true,
          },
        })
        if (status && data) {
          this.$emit('setDeal', data)
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        console.error(e)
        const error = e.response?.data || this.$t('error.failedData')
        this.$error.show(error)
        // this.emitLoadingState(false)
      } finally {
        this.isloader = ''
      }
    },
    async finishDeal() {
      // if (this.isSeller && !this.deal.status_buyer) return
      //
      // this.finishingDeal = true
      // this.emitLoadingState(true)
      this.isloader = 'finishDeal'

      try {
        const {
          data: { status, message, data },
        } = await this.$instance({
          url: 'chat/deal/finish',
          data: {
            chat_id: this.chatId,
            hash: true,
          },
        })
        if (status && data) {
          this.$emit('setDeal', data)
        } else {
          this.$error.show(message)
        }
        // this.emitLoadingState(false)
      } catch (e) {
        console.error(e)
        const error = e.response?.data || this.$t('error.failedData')
        this.$error.show(error)
        // this.emitLoadingState(false)
      } finally {
        this.isloader = ''
      }
    },
    async deleteChat(callback) {
      this.isloader = 'deleteChat'
      try {
        const {
          data: { status, message, data },
        } = await this.$instance({
          url: 'chat/delete',
          data: {
            chat_id: this.chatId,
            hash: true,
          },
        })
        if (!status) {
          this.$error.show(message)
        }
        // if (typeof callback === 'function') {
        //   // callback()
        // }
      } catch (e) {
        console.error(e)
        const error = e.response?.data || this.$t('error.failedData')
        this.$error.show(error)

        // if (typeof callback === 'function') {
        //   callback()
        // }
      } finally {
        this.isloader = ''
      }
    },
    emitLoadingState(value) {
      this.$emit('update:isLoading', value)
    },
    async startDealRequest(payload) {
      this.startingDispute = true
      // if (this.startingDeal) return
      //
      // this.startingDeal = true
      // this.emitLoadingState(true)

      try {
        const {
          data: { status, message, data },
        } = await this.$instance({
          url: 'chat/deal/start',
          data: {
            chat_id: this.chatId,
            requisites: payload,
            hash: true,
          },
        })

        if (data) {
          this.$emit('setDeal', data)
        } else {
          this.$error.show(message)
        }
        // this.requisitesDialog = false

        if (!status) {
          this.$error.show(message)
          // this.emitLoadingState(false)
        }
        this.startingDispute = false
      } catch (e) {
        console.log('start Deal', e)
        const error = e.response?.data || this.$t('error.failedData')
        this.$error.show(error)
        // this.emitLoadingState(false)
      } finally {
        this.startingDispute = false
      }
    },
  },
}
</script>
