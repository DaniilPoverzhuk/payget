<template>
  <div class="aside-messages w-full lg:mb-6 h-full h-full flex flex-col">
    <AsideFilter
      class="lg:w-384 lg:mr-8 lg:pl-6 xs:py-6 xs:px-4"
      :count="allCount"
      @search="filterChatList"
    />
    <div
      v-if="$matchMedia.desktop || !$route.params.chat_id"
      class="lg:relative lg:flex lg:flex-grow mt-3"
    >
      <div class="lg:absolute lg:inset-0 xs:mb-20">
        <div
          v-if="sizeChatList > 0"
          id="conversationList"
          class="lg:h-full lg:pr-8 font-base lg:scrollbar-thin lg:scrollbar lg:scrollbar-thumb-gray-200 lg:dark:scrollbar-thumb-gray-700 lg:scrollbar-track-transparent lg:overflow-y-scroll lg:scrollbar-thumb-rounded-full lg:scrollbar-track-rounded-full"
        >
          <ul
            v-if="sizeChatList && localConversations.length"
            class="w-full lg:w-384 lg:mr-8 pb-2"
          >
            <li
              v-for="conversation in localConversations"
              :key="conversation.id"
            >
              <Conversation
                :conversation="conversation"
                :open-conversation="currentOpen"
                @readMessage="readMessage"
              />
            </li>
            <li
              ref="conversationLoader"
              class="conversation-list__loader"
              :class="{ 'conversation-list__loader--hide': !loadingBoxShow }"
            >
              <Loader />
            </li>
          </ul>
        </div>
        <div
          v-else
          class="lg:text-sm pl-6 xs:text-md text-gray-500 lg:mt-5 max-w-3xl xs:mt-3"
        >
          {{ $t(noData) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import Loader from 'src/components/loader/loader.vue'
import AsideFilter from '../aside-filter/aside-filter.vue'
import Conversation from 'src/components/helper/page-messages/conversation/conversation.vue'

const { mapState: mapLayoutState } = createNamespacedHelpers('layout')
const { mapState: mapUserState, mapMutations: mapUserMutations } =
  createNamespacedHelpers('user')

export default {
  name: 'AsideMessages',
  components: {
    Conversation,
    AsideFilter,
    Loader,
  },
  data: () => ({
    loadingBoxShow: true,
    loadingInProgress: false,
    localConversations: [],
    scollListenerInit: false,
    list: null,
    readDealId: null,
    timeout: null,
    scrollPos: 0,
    currentOpen: null,
    allCount: 0,
  }),
  computed: {
    ...mapUserState(['id', 'readId', 'chatOpened', 'flags']),
    ...mapLayoutState(['filterAttributes']),
    sizeChatList() {
      return Object.keys(this.localConversations).length
    },
    sortableList() {
      return this.sortItems()
    },
    noData() {
      return this.filterAttributes && this.filterAttributes.length > 0
        ? 'conversation.noChats'
        : 'nothingFound'
    },
  },
  watch: {
    filterAttributes() {
      this.filterChatList()
    },
    $locale: function () {
      this.getChatList()
    },
  },
  async created() {
    this.getChatList()
    if (typeof window !== 'undefined') {
      window.echo
        ?.private(`Chat.${this.id}`)
        .listen('updateMessagesCounter', (e) => {
          this.countUnreadMessages = e.countUnreadMessages
          this.setFlagNewMessageOne(this.countUnreadMessages > 0)
        })
        .listen('newMessage', (e) => {
          const lastMessage = Object.values(e.messages).reverse()[0]
          lastMessage.text = lastMessage.message

          this.setLastMessage(e, lastMessage)
        })
        .listen('deleteChat', (e) => {
          this.deleteChat(e)
        })
    }
  },
  updated() {
    this.scrollInit()
  },
  beforeUnmount() {
    this.removeScroll()
    if (typeof window !== 'undefined') {
      window.echo?.leave(`Chat.${this.id}`)
    }
  },
  methods: {
    ...mapUserMutations([
      'setFlagNewMessage',
      'setReadId',
      'setFlagNewMessageOne',
    ]),
    filterChatList(search) {
      this.search = search
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.timeout = setTimeout(() => {
        this.localConversations = []
        this.getChatList()
      }, 900)
    },
    sortItems(current) {
      const publicChats = this.localConversations.filter(
        (item) => item.chat_type === 'public'
      )
      const otherChats = this.localConversations
        .filter((item) => item.chat_type != 'public')
        .sort((a, b) => {
          if (current == a.id || current == b.id) {
            return -1
          }
          if (a.last_message === null || b.last_message === null) {
            return 0
          }
          const aDate = a.last_message.created_at.replace(/-/g, '/')
          const bDate = b.last_message.created_at.replace(/-/g, '/')
          return new Date(bDate) - new Date(aDate)
        })

      return publicChats.concat(otherChats)
    },
    readMessage(id) {
      const arr = this.localConversations.find((el) => id == el.id)
      if (arr.last_message == null) arr.last_message = {}
      arr.last_message.created_at = arr.last_read_at
    },
    scrollInit() {
      if (this.localConversations.length > 0) {
        const listElm = document.querySelector('#conversationList')

        if (listElm) {
          listElm.addEventListener('scroll', this.onScroll)
          this.scollListenerInit = true
        }
      }
    },
    onScroll() {
      const { conversationLoader } = this.$refs

      if (conversationLoader && this.isElementInViewport(conversationLoader)) {
        this.loadingMore()
      }
      if (!this.loadingBoxShow) {
        const offsetTop = conversationLoader.getBoundingClientRect().top
        if (offsetTop > this.scrollPos) this.loadingBoxShow = true
        this.scrollPos = offsetTop
      }

      if (this.isNotNextPage()) {
        this.loadingBoxShow = false
      }
    },
    removeScroll() {
      if (this.scollListenerInit === true) {
        const listElm = document.querySelector('#conversationList')
        if (listElm) {
          listElm.removeEventListener('scroll', this.onScroll)
        }
      }
    },
    deleteChat(e) {
      const conversationList = this.localConversations
      this.localConversations = conversationList.filter(
        (item) => item.id != e.chat_id
      )

      if (this.$route.params.chat_id == e.chat_id) {
        this.$router.push({ path: '/messages/' })
      }
    },
    isElementInViewport(el) {
      const rect = el.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      )
    },

    isNotNextPage() {
      return this.allCount <= this.localConversations.length
    },
    loadingMore() {
      if (this.isNotNextPage()) {
        return
      }

      this.getChatList()
    },
    getFilter() {
      const filterData = {}
      if (this.filterAttributes && this.filterAttributes.length > 0) {
        filterData.deal = {
          status: this.filterAttributes,
        }
      }

      if (this.search) {
        filterData.search = this.search
      }

      return {
        filter_data: filterData,
      }
    },
    async getChatList() {
      if (this.loadingInProgress === true) {
        return
      }

      try {
        this.loadingInProgress = true
        this.loadingBoxShow = true

        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'chat/list',
          type: 'POST',
          data: Object.assign(
            {},
            {
              offset: this.localConversations.length,
              hash: true,
            },
            this.getFilter()
          ),
        })
        if (status) {
          if (!Array.isArray(this.localConversations)) {
            this.localConversations = []
          }
          this.localConversations = this.localConversations.concat(
            data.chats || []
          )
          this.countUnreadMessages = data.meta.newMessages
          this.allCount = data.meta.count
          this.localConversations = this.sortItems()
          this.loadingInProgress = false
          this.loadingBoxShow = false
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show(e)
      }
    },
    setLastMessage(chat, lastMessage) {
      let success = false
      this.localConversations.forEach((item, i, arr) => {
        if (item.id == chat.id) {
          this.localConversations[i].last_read_at = chat.members.find(
            (member) => member.user.id === this.id
          ).last_read_at
          this.localConversations[i].last_message = lastMessage
          success = true
          this.localConversations = this.sortItems()
        }
      })

      // @TODO Crutch
      if (success === false) {
        let user = null
        if (chat.deal && this.id === chat.deal.seller_id) {
          const buyer = chat.members.find((member) => member.role == 'buyer')
          user = {
            id: buyer.user.id,
            name: buyer.user.name,
            role: buyer.role,
          }
        } else if (chat.deal && this.id === chat.deal.buyer_id) {
          const seller = chat.members.find((member) => member.role == 'seller')
          user = {
            id: seller.user.id,
            name: seller.user.name,
            role: seller.role,
          }
        } else {
          const opponent = chat.members.find(
            (member) => member.user.id != this.id
          )

          user = {
            id: opponent.user.id,
            name: opponent.user.name,
            role: opponent.role,
          }
        }

        this.localConversations.push({
          id: chat.id,
          deal_id: chat.deal ? chat.deal.id : null,
          last_read_at: null,
          dispute: chat.deal ? chat.deal.status : null,
          offer: chat.offer
            ? {
                seller_id: chat.deal.seller_id,
                currency_from: chat.offer.currency_from,
                currency_to: chat.offer.currency_to,
              }
            : null,
          type: chat.deal ? chat.deal.type : null,
          last_message: lastMessage,
          created_at: lastMessage.created_at,
          value_from: chat.deal ? chat.deal.value_from : null,
          value_to: chat.deal ? chat.deal.value_to : null,
          chat_type: chat.chat_type,
          user,
        })
        this.localConversations = this.sortItems(chat.id)
      }
    },
  },
}
</script>

<style lang="scss">
.conversation-list__loader {
  &.conversation-list__loader--hide {
    display: none;
  }
}
</style>
