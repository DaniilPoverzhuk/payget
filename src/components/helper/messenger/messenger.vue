<template>
  <div
    v-if="chatData.messages !== null"
    ref="messenger"
    class="messenger w-full scrollbar-thin scrollbar scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
  >
    <template v-for="(message, index) in localMessages">
      <p
        v-if="message.date"
        :key="index"
        class="text-sm text-gray-400 dark:text-gray-500 text-center py-3 xs:px-6"
      >
        {{ message.date }}
      </p>
      <template v-else>
        <Message
          v-if="!!!message.system"
          :key="index"
          :message-id="`message-${message.id}`"
          :public="chatData.chat_type === 'public'"
          :members="chatData.members"
          :message="message"
          class="py-3 xs:px-6"
          :same-author="isSameAuthor(localMessages, index)"
          :class="{
            'message-scroll':
              routLinkToMessage != null && message.id == routLinkToMessage.id,
          }"
          @setQuote="(id) => $emit('setQuote', id)"
        />
        <SystemMessage
          v-else
          :id="`message-${message.id}`"
          :key="index + 1"
          :is-seller="isSeller"
          :is-buyer="isBuyer"
          :is-reviewed="chatData.is_reviewed"
          :members="chatData.members"
          :message="message"
          class="py-3 xs:px-6"
          :url="
            message.message_data.requisites &&
            message.message_data.requisites.type === 'url'
          "
          :time-expiration="timeExpiration()"
          :class="{
            'message-scroll':
              routLinkToMessage != null && message.id == routLinkToMessage.id,
          }"
        />
      </template>
    </template>
  </div>
</template>

<script>
import { format, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { createNamespacedHelpers } from 'vuex'
import Message from 'src/components/helper/messenger/message/message.vue'
import SystemMessage from 'src/components/helper/messenger/system-message/system-message.vue'
import { USER_ROLE } from 'src/constants'
import Loader from 'src/components/loader/loader.vue'
// import {fetchChatRead} from '@/store/modules/notifications/actions'
const { mapActions: mapNotificationsActions } =
  createNamespacedHelpers('notifications')

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { ADMIN, MODERATOR, SELLER, BUYER } = USER_ROLE

export default {
  name: 'Messenger',
  components: {
    Message,
    SystemMessage,
    // Loader,
  },
  props: {
    chatData: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    reviewDialog: true,
    localMessages: [],
  }),
  computed: {
    ...mapUserState([
      'id',
      'role',
      'currencies',
      'accessToken',
      'chatMuted',
      'routLinkToMessage',
    ]),

    isBuyer() {
      const findBuyer = this.chatData?.members.find(
        (member) => member.role === BUYER
      )
      return findBuyer ? findBuyer.user.id === this.id : false
    },
    isSeller() {
      if (!this.chatData?.deal) return false
      return this.chatData?.deal?.seller_id === this.id
    },
  },
  mounted() {
    this.data = { ...this.chatData }
    this.getLocalMessages()
    this.readChat()

    this.$nextTick(() => {
      this.$refs.messenger.scrollTop = this.$refs.messenger.scrollHeight
    })
  },
  methods: {
    ...mapNotificationsActions(['fetchChatRead']),
    readChat() {
      this.fetchChatRead(this.data.id)
    },

    getLocalMessages($state) {
      if (!this.data.list || this.data.messages === null) return []

      const messages = this.data.list
        .filter((item) => !!this.data.messages[item])
        .map((item) => this.data.messages[item])
      let currentDay
      messages.forEach((message) => {
        const messageDay = this.getFormattedDayDate(message.created)
        if (messageDay !== currentDay) {
          currentDay = messageDay
          this.localMessages.push({ date: currentDay })
        }
        const lastRepliedTo = message.replied_to
        message.replies = []
        if (lastRepliedTo !== null) {
          const sub_message_id = lastRepliedTo.id
            ? lastRepliedTo.id
            : lastRepliedTo
          const sub_message = this.data.messages[sub_message_id]
          message.replies.push({
            message: sub_message.message,
            file: sub_message.file || null,
            user_id: this.nameUsers(sub_message.user_id),
          })
          // lastRepliedTo = sub_message.replied_to && sub_message.replied_to.id ? sub_message.replied_to.id : sub_message.replied_to
        }
        if (message.replies.length > 0) message.replies.reverse()
        this.localMessages.push(message)
      })
    },
    nameUsers(id) {
      const names = this.chatData.members.find((member) => {
        if (member.user.id === id) return member
        return false
      })
      return (names && names.user.name) || null
    },
    timeExpiration() {
      if (this.chatData) {
        return {
          dealStatus: this.chatData.deal?.status,
          dealSellerStatus: this.chatData.deal?.status_seller,
          dealBuyerStatus: this.chatData.deal?.status_buyer,
          amountFrom: Number(this.chatData.deal?.value_from) + ' ',
          amountNameFrom: this.chatData.offer
            ? this.currencies[this.chatData.offer.currency_from].name
            : undefined,
          amountTo: Number(this.chatData.deal?.value_to) + ' ',
          amountToName: this.chatData.offer
            ? this.currencies[this.chatData.offer.currency_to].name
            : undefined,
        }
      }
    },

    isShowBtn(message) {
      if (
        message.message_data.requisites &&
        message.message_data.requisites.type
      ) {
        if (message.message_data.requisites.type == 'url') {
          this.requisitesDialogUrl = message.message_data.requisites.value
          return false
        }
      }
      return true
    },
    isSameAuthor(messages, index) {
      return (
        !!messages[index - 1] &&
        !messages[index - 1].date &&
        !messages[index - 1].system &&
        !messages[index].system &&
        messages[index].user_id === messages[index - 1].user_id
      )
    },

    getFormattedDayDate(date) {
      const dateInMs = this.$getDateInMs(date)
      const formattedDate = format(dateInMs, 'dd.MM.yyyy')
      let dayName = format(dateInMs, 'EEEE', { locale: ru })

      dayName = dayName[0].toUpperCase() + dayName.slice(1)

      if (isToday(dateInMs)) dayName = this.$t('date.today')
      if (isYesterday(dateInMs)) dayName = this.$t('date.yesterday')

      return `${dayName}, ${formattedDate}`
    },
  },
}
</script>
