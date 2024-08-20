<template>
  <router-link
    v-slot="{ href, isActive }"
    :to="`/messages/${conversation.id}`"
  >
    <div
      class="py-5 pl-6 pr-5 border-b border-gray-100 dark:border-gray-800 transition duration-500 cursor-pointer"
      :class="{'bg-primary-light dark:bg-dark-primary-light ': isActive}"
      @click="navigateToChat(href, conversation)"
    >
      <header class="flex items-start justify-between">
        <div
          class="flex items-center flex-wrap column"
        >
          <span
            v-if="isPublic"
            class="text-gray-700 dark:text-gray-300 font-medium text-sm "
          >{{ $t('conversation.generalChat') }}
          </span>
          <p
            v-if="conversation.user && !isPublic"
            class="text-gray-700 dark:text-gray-300 font-medium text-sm"
            :class="{'flex-grow w-full': userRole}"
          >
            {{ conversation.user.name }}
            <span
              v-if="isUserOnline"
              class="w-1 h-1 bg-green-500 block rounded-full flex-shrink-0 ml-1 inline-block mb-2"
            />
          </p>
          <span
            v-if="userRole && !isPublic"
            class="text-gray-400 dark:text-gray-500 text-sm"
          >{{ $t(userRole) }}
          </span>
          <svg
            v-if="isMuted"
            v-svg
            class="w-5 h-5 text-gray-400 dark:text-gray-500 ml-1"
            symbol="volume-off"
            size="24"
          />
        </div>
        <div class="flex items-center">
          <p
            v-if="conversationStatus"
            class="border border-primary text-xs text-primary font-medium rounded-xl px-2.5 py-0.5 whitespace-nowrap"
          >
            {{ $t(conversationStatus) }}
          </p>
          <time
            v-if="formattedDate"
            class="text-xs text-gray-400 dark:text-gray-500 ml-2"
          >{{ formattedDate }}
          </time>
        </div>
      </header>
      <div
        class="flex mt-2"
      >
        <p
          v-if="conversation.deal_id"
          class="text-gray-500 dark:text-gray-300 font-semibold text-sm pr-3"
        >
          {{ `#${conversation.deal_id}` }}
        </p>
        <Transaction
          v-if="conversation.offer !== null"
          class="text-sm text-gray-700 dark:text-gray-300"
          :from-value="+conversation.value_from"
          :from-abbr="conversation.offer.currency_from"
          :to-value="+conversation.value_to"
          :to-abbr="conversation.offer.currency_to"
        />
      </div>
      <div
        v-if="lastMessageText"
        :class="{'flex': isPublic}"
      >
        <span
          v-if="isPublic"
          class="text-gray-400 dark:text-gray-500"
        >
          <template v-if="conversation.last_message.user_name"> {{ `${conversation.last_message.user_name}: ` }}</template>
        </span>
        <p
          v-if="conversation.last_message && lastMessageText"
          class="flex items-center line-clamp-1 break-all text-gray-500 dark:text-gray-300 mr-2"
        >
          &nbsp;
          <span
            v-if="unread()"
            class="w-1 h-1 bg-primary mt-3 inline-block rounded-full mr-1 flex-shrink-0"
          />
          {{ lastMessageText }}
        </p>
        <div
          v-else-if="conversation.last_message.file"
          class="flex items-center"
        >
          <svg
            v-svg
            class="w-5 h-5 text-gray-400 dark:text-gray-500 mr-1"
            symbol="attach"
          />{{ $t('conversation.attachment') }}
        </div>
        <svg
          v-if="isPublic"
          v-svg
          class="w-5 h-5 text-gray-300 dark:text-gray-500 ml-auto flex-shrink-0"
          symbol="flag"
        />
      </div>
    </div>
  </router-link>
</template>

<script>
import { format } from 'date-fns'
import { createNamespacedHelpers } from 'vuex'
import Transaction from 'src/components/extends/transaction/transaction.vue'
import decodeText from 'src/mixins/decode-text.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')


export default {
  name: 'Conversation',
  components: {
    Transaction,
  },
  mixins: [decodeText],
  props: {
    conversation: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    opened: true,
    unreadCount: 0,
    mute: false,
    unreadChats: [],
  }),
  computed: {
    ...mapUserState(['id', 'chatMuted', 'flags']),
    ...mapEchoState(['onlineUsers']),
    conversationStatus() {
      switch (this.conversation.dispute) {
        case 'dispute':
          return 'conversation.disputeDispute'
        case 'dispute-approved':
          return 'conversation.disputeApproved'
        case 'dispute-canceled':
          return 'conversation.disputeCanceled'
        case 'done':
          return 'conversation.disputeCompleted'
        default:
          return null
      }
    },
    getChatMuted() {
      return this.chatMuted
    },
    isPublic() {
      return this.conversation.chat_type === 'public'
    },
    conversationClasses() {
      return {
        conversation_unread: this.unread(),
        conversation_pinned: !this.conversation.user,
      }
    },
    isMuted() {
      if (this.conversation) {
        if (this.chatMuted.hasOwnProperty(this.conversation.id)) {
          return this.chatMuted[this.conversation.id]
        }
        return this.conversation.muted
      }
      return false
    },
    userRole() {
      if (!this.conversation.user) return null

      if (this.conversation.user.role === 'admin') {
        return 'conversation.administrator'
      }
      if (this.conversation.user.role === 'moderator') {
        return 'conversation.moderator'
      }
      if (this.conversation.user.role === 'member'
        && this.conversation.offer) {
        if (this.conversation.offer.seller_id === this.id) {
          return 'conversation.buyer'
        }

        return 'conversation.seller'
      }

      return null
    },
    formattedDate() {
      if (this.conversation.last_message && this.conversation.last_message.created_at !== null) {
        return format(this.$getDateInMs(this.conversation.last_message.created_at), 'dd.MM.yy')
      }
      return format(this.$getDateInMs(this.conversation.created_at), 'dd.MM.yy')
    },
    isUserOnline() {
      if (!this.conversation.user) return false

      return this.onlineUsers.includes(this.conversation.user.id)
    },
    lastMessageText() {
      if (this.conversation.last_message == null || !this.conversation.last_message.text) return false
      const systemMessages = {
        'chat.created': 'chat.created',
        'chat.deal_start_no': 'chat.deal_start_no',
        'chat.deal_start': 'chat.deal_start',
        'chat.deal_buyer_end': 'chat.deal_buyer_end',
        'chat.deal_seller_end': 'chat.deal_seller_end',
        'chat.deal_end': 'chat.deal_end',
        'chat.dispute_open': 'chat.dispute_open',
        'chat.dispute_close': 'chat.dispute_close',
        'chat.invite_user': 'chat.invite_user',
        'chat.dispute_approve_seller': 'chat.dispute_approve_seller',
        'chat.dispute_approve_buyer': 'chat.dispute_approve_buyer',
        'chat.dispute_cancelled': 'chat.dispute_cancelled',
      }
      if (systemMessages[this.conversation.last_message.text]) {
        return systemMessages[this.conversation.last_message.text]
      }
      return this.decodeText(this.conversation.last_message.text, true).substring(0, 80)
    },
  },
  watch: {
    conversation: {
      deep: true,
      immediate: true,
      handler(value) {
        if (!value.last_message) {
          this.opened = false
          return
        }
        if (!value.last_read_at) {
          this.opened = true
          return
        }

        this.opened = value.last_message.created_at > value.last_read_at
      },
    },
  },
  methods: {
    navigateToChat(href, conversation) {
      if (this.$route.path !== href) {
        this.$router.push(href)
      }

      this.opened = false
      this.$emit('readMessage', conversation.id)
    },
    unread() {
      if ((this.$route.path).split('/messages/')[1] == this.conversation.id) {
        return false
      }

      if (!this.conversation.last_message) {
        return false
      }

      if (!this.conversation.last_read_at) {
        this.setUnReadChats(this.conversation.id)

        this.opened = true
        return true
      }

      const lastReadAt = this.conversation.last_read_at
      const createdAt = this.conversation.last_message.created_at
      const unreadMessage = createdAt > lastReadAt

      if (unreadMessage) {
        this.setUnReadChats(this.conversation.id)
        this.opened = true
      }
      return unreadMessage
    },
    setUnReadChats(chatId) {
      this.$emit('unReadChats', chatId)
    },
  },
}
</script>
