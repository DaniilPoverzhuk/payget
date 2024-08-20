<template>
  <header
    class="header shadow-sm dark:border-b dark:border-gray-800"
  >
    <DisputAction
      v-if="$route.path.split('/')[1] === 'disputes'"
      :deal="chatData.deal"
      :is-user-in-chat="isUserInChat"
      :status="chatData.deal.status"
    />
    <template
      v-else
    >
      <Deal
        v-if="chatData.deal && chatData.deal.id"
        :interlocutor="interlocutor"
        :chat-data="chatData"
        :is-user-in-chat="isUserInChat"
        :is-loading="isLoading"
      />
      <div
        v-else
        class="w-full flex lg:items-center justify-between lg:pl-10 lg:py-4 xs:min-h-60 xs:px-4 xs:py-2 xs:relative"
      >
        <div class="lg:mr-3">
          <HeaderName
            v-if="chatData.chat_type !== 'public'"
            :interlocutor="interlocutor"
          />
        </div>
        <div
          v-click-outside="() => deleteDialogButton = false"
          class="flex items-center space-x-3"
        >
          <MuteChat
            :chat-id="chatData.id"
            :mute="chatData.muted"
          />
          <div class="flex items-center">
            <button
              class="w-6 h-6"
              type="button"
              @click="deleteDialogButton = !deleteDialogButton"
            >
              <svg
                v-svg
                class="w-6 h-6 text-gray-400 dark:text-gray-500"
                symbol="dots-vertical"
              />
            </button>
            <transition name="fade">
              <div
                v-if="deleteDialogButton"
                class="absolute top-8 right-0 z-10 bg-white shadow-lg rounded-lg border border-gray-100 shadow-lg"
              >
                <button
                  class="whitespace-nowrap text-gray-900 cursor-pointer relative py-2 px-4 hover:bg-gray-100 block whitespace-nowrap"
                  type="button"
                  @click="deleteChat"
                >
                  {{ $t('chat.deleteDialog') }}
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </template>
  </header>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import DisputAction from 'src/components/helper/page-dispute/dispute-action/dispute-action.vue'
import Deal from './header-deal/header-deal.vue'
import HeaderName from './header-name/header-name.vue'
import MuteChat from '../mute-chat/mute-chat.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
export default {
  name: 'Header',
  components: {
    DisputAction,
    MuteChat,
    HeaderName,
    Deal,
  },
  props: {
    chatData: {
      type: Object,
      default: null,
    },
    interlocutor: {
      type: [Object, Boolean],
      default: null,
    },
    isUserInChat: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    deleteDialogButton: false,
  }),
  computed: {
    ...mapUserState(['id', 'role', 'currencies', 'accessToken', 'routLinkToMessage']),
    isLoading() {
      return this.chatData.isLoading
    },
    // isChatRemovable() {
    //   const [
    //     {
    //       user: { id: chatCreatorId },
    //     },
    //   ] = this.chatData.members
    //   return chatCreatorId === this.id && this.chatData.chat_type !== 'public'
    // },
  },
  methods: {
    async deleteChat() {
      try {
        const { data: { status, message } } = await this.$instance({
          url: 'chat/delete',
          data: {
            chat_id: this.chatData.id,
            hash: true,
          },
        })
        if (!status) {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
