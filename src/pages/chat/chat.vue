<template>
  <div v-if="chatData !== null" class="chat absolute inset-0 h-full flex flex-col lg:pr-6">
    <Header v-if="chatData !== null" v-model:chat-data="chatData" :interlocutor="interlocutor" :is-user-in-chat="isUserInChat" />
    <div class="relative flex-grow">
      <Messenger
        v-if="chatData.messages"
        :key="keyDeal + Object.keys(chatData.messages).length"
        v-model:chat-data="chatData"
        class="absolute h-full lg:px-9"
        @setQuote="setReplyToMessage"
      />
    </div>
    <ChatForm v-if="chatFormVisibility" v-model:new-messages="newMessages" :reply-to-message="getReplyMessages" class="" @removequote="setReplyToMessage()" />
  </div>
</template>

<script>
import { isEmpty } from 'lodash'
import { createNamespacedHelpers } from 'vuex'
import { USER_ROLE, DEAL_STATUS } from 'src/constants'
import ChatForm from 'src/components/helper/page-chat/chat-form/chat-form.vue'
import Messenger from 'src/components/helper/messenger/messenger.vue'
import readNewNotifications from 'src/mixins/readNewNotifications.vue'
import Header from 'src/components/helper/page-chat/header/header.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { mapMutations: mapUserMutations } = createNamespacedHelpers('user')
const { ADMIN, MODERATOR, SELLER, BUYER } = USER_ROLE

const { DEAL_STATUS_NEW, DEAL_STATUS_DISPUTE, DEAL_STATUS_DISPUTE_APPROVED, DEAL_STATUS_DISPUTE_CANCELED, DEAL_STATUS_DONE, DEAL_STATUS_CANCELED } = DEAL_STATUS

export default {
  name: 'ChatWindow',
  components: {
    ChatForm,
    Messenger,
    Header,
  },
  mixins: [readNewNotifications],
  data: () => ({
    chatData: null,
    isReviewed: false,
    chatType: null,
    offer: null,
    deal: null,
    members: null,
    messages: null,
    list: null,
    chatId: null,
    isChatReachedBottom: false,
    isLoading: false,
    newMessages: null,
    chatPanel: false,
    sellerDealRequisites: null,
    buyerDealRequisites: null,
    replyToMessageId: NaN,
  }),
  computed: {
    ...mapUserState(['id', 'role', 'currencies', 'accessToken', 'routLinkToMessage']),
    isUserInChat() {
      return this.chatData.members && this.chatData.members.some((member) => member.user.id === this.id)
    },
    keyDeal() {
      if (this.chatData.deal !== null && this.chatData.deal.status) {
        return `${this.chatData.id} ${this.chatData.deal.status} ${this.chatData.deal.status_seller} ${this.chatData.deal.status_buyer} ${this.chatData.members.some(
          (member) => member.role === 'admin'
        )}`
      }
      return this.chatData.id
    },
    getReplyMessages() {
      if (this.chatData.members && this.replyToMessageId && this.chatData.messages !== null) {
        const replyMessage = this.chatData.messages[this.replyToMessageId]
        if (replyMessage) {
          replyMessage.user_name = this.chatData.members.find((member) => {
            if (replyMessage.user_id && member.user.id === replyMessage.user_id) {
              return true
            }
          }).user.name
        }
        return replyMessage || null
      }
      this.clearReplyToMessageId()
      return null
    },

    interlocutor() {
      if (this.chatData.members == null) return false
      const curMember = this.chatData.members.find((member) => member.user.id !== this.id)
      if (this.chatType === 'public') {
        return { name: this.$t('conversation.generalChat') }
      }
      return { name: curMember.user.name, id: curMember.user.id, is_link_profile: curMember.is_link_profile }
    },
    chatFormVisibility() {
      if (this.chatData === null || this.chatData.deal == null) {
        return true
      }
      if (this.chatData.deal.status === 'dispute' && !this.isUserInChat) {
        return false
      }
      switch (this.chatData.deal.status) {
        case DEAL_STATUS_DONE:
        case DEAL_STATUS_CANCELED:
        case DEAL_STATUS_DISPUTE_APPROVED:
          return false
        case DEAL_STATUS_DISPUTE_CANCELED:
          return false
        default:
          return true
      }
    },
    hasDealRequisites() {
      return !isEmpty(this.sellerDealRequisites)
    },
  },
  watch: {
    $locale: function () {
      // this.chatData = null
      this.getChatData()
      this.$forceUpdate()
    },
    routLinkToMessage() {
      this.scrollToMessage()
    },

    $route: {
      immediate: true,
      async handler(newRoute) {
        if (!newRoute.params.chat_id) return
        if (this.chatId) this.leaveChatChannel()
        this.chatId = newRoute.params.chat_id
        await this.getChatData()

        this.readNewNotifications('new_message', this.chatId)
      },
    },
  },
  mounted() {
    this.scrollToMessage()
  },
  beforeUnmount() {
    this.leaveChatChannel()
  },
  methods: {
    ...mapUserMutations(['setFlagNewMessage', 'setReadId', 'setRoutLinkToMessage']),
    setReplyToMessage(id) {
      this.replyToMessageId = id || NaN
    },
    clearReplyToMessageId() {
      this.replyToMessageId = NaN
    },
    scrollToMessage() {
      setTimeout(() => {
        const listElm = document.querySelector('.message-scroll')
        if (listElm) {
          listElm.scrollIntoView()
          this.setRoutLinkToMessage(null)
        }
      }, 1000)
    },
    deleteComplete() {
      this.$destroy()
    },
    joinChatChannel() {
      if (typeof window !== 'undefined') {
        window.echo?.private(`Chat.${this.chatId}.Messages`).listen('newMessage', this.updateChatData.bind(this))
      }
    },
    updateChatData(e) {
      this.chatData = {
        ...e,
      }
    },
    leaveChatChannel() {
      if (typeof window !== 'undefined') {
        window.echo?.leave(`Chat.${this.chatId}.Messages`)
      }
    },
    async getChatData() {
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'chat/get',
          data: {
            chat_id: this.chatId,
            hash: true,
          },
        })
        if (status) {
          this.updateChatData(data)
          // this.chatData = { ...data }
          this.joinChatChannel()
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    async readMessage(messageId) {
      if (!messageId) {
        return
      }
      try {
        const {
          data: { status, message },
        } = await this.$instance({
          url: 'chat/message/read',
          data: {
            message_id: messageId,
            hash: true,
          },
        })
        this.setReadId(this.chatId)
        if (!status) this.$error.show(message)
      } catch {
        this.$error.show()
      }
    },
    assignDispute() {
      this.$emit('goToOwnDisputes')
      this.getChatData()
    },
    resetUnreadMessages() {
      const data = {
        new_message: false,
      }
      this.setFlagNewMessage(data)
    },
  },
}
</script>
