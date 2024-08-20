<template>
  <div
    v-if="ticketInfo !== null"
    class="ticket w-full"
    :class="{'flex flex-col h-full': isSupport, 'lg:pt-6 lg:absolute inset-0 px-6': !isSupport}"
  >
    <template v-if="isSupport">
      <div class="flex px-8 py-2 border-b box-content border-gray-200">
        <div class="lg:flex max-w-4xl w-full mx-auto">
          <p class="text-gray-700 dark:text-gray-300 uppercase xs:inline-block font-semibold mr-3">
            #{{ uuid.substr(0, 8) }}
          </p>
          <p
            v-if="ticketInfo !== null && ticketInfo.subject"
            class="text-gray-700 dark:text-gray-300 xs:inline-block font-semibold"
          >
            {{ ticketInfo.subject.subject }}
          </p>
        </div>
      </div>
      <Messenger
        :key="uuid"
        :ticket-info="ticketInfo"
        :messages="messages"
        class="px-8 flex-grow h-full w-full mx-auto  overflow-auto"
      >
        <q-infinite-scroll @load="infiniteHandler" :offset="0" reverse>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <Loader />
            </div>
          </template>
        </q-infinite-scroll>
      </Messenger>
      <ChatForm
        v-if="showChatUser"
        :support="true"
        class="max-w-4xl w-full mx-auto h-16"
        @setMessage="updateMessage"
      />
    </template>
    <template
      v-if="isSupport === false"
    >
      <LinkBack
        class="lg:mb-5 xs:mb-0 max-w-4xl xs:p-4 mx-auto"
        :to="setBack"
        :text="$t('tickets.title')"
      />
      <div class="flex flex-col justify-between lg:h-calc-ticket xs:h-calc-ticket-mobile">
        <div class="lg:px-8 xs:px-4 xs:p-2 lg:py-2 border-b border-t border-gray-200">
          <div class="lg:flex max-w-4xl w-full mx-auto items-center">
            <div class="flex-grow flex items-center">
              <p class="text-gray-700 dark:text-gray-300 xs:inline-block uppercase font-semibold mr-3">
                #{{ uuid.substr(0, 8) }}
              </p>
              <p
                v-if="ticketInfo !== null && ticketInfo.subject"
                class="text-gray-700 dark:text-gray-300 xs:inline-block font-semibold"
              >
                {{ ticketInfo.subject.subject }}
              </p>
            </div>

            <Button
              v-if="showEditAdmin && ticketInfo.status !== null && ticketInfo.status === 'in_process'"
              class="font-medium xs:mt-3 xs:w-full lg:mr-4"
              :view-color="actionData['credit_ticket'].btn"
              :to="`${$route.fullPath}/edit`"
            >{{ $t(actionData['credit_ticket'].text) }}</Button>
            <Button
              v-if="showEditAdmin && (ticketInfo.status == 'new' || ticketInfo.status == 'in_process')"
              class="font-medium xs:mt-3 xs:w-full"
              :view-color="actionData[ticketInfo.status].btn"
              :submit="true"
              @click="changeStatus"
            >{{ $t(actionData[ticketInfo.status].text) }}</Button>
          </div>
        </div>
        <Messenger
          v-if="ticketInfo !== null"
          :key="uuid"
          :ticket-info="ticketInfo"
          :messages="messages"
          class="dsds px-8 flex-grow h-full max-w-4xl w-full mx-auto overflow-auto"
        >
          <q-infinite-scroll ref="$messanger" @load="infiniteHandler" :offset="0" reverse>
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <Loader />
              </div>
            </template>
          </q-infinite-scroll>
        </Messenger>
        <ChatForm
          v-if="showChatAdmin"
          class="max-w-4xl w-full mx-auto"
          @setMessage="updateMessage"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import ChatForm from 'src/components/helper/page-ticket/chat-form/chat-form.vue'
import LinkBack from 'src/components/extends/link-back/link-back.vue'
import Messenger from 'src/components/helper/page-ticket/messenger/messenger.vue'
import Loader from 'src/components/loader/loader.vue'
import readNewNotifications from 'src/mixins/readNewNotifications.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')


export default {
  name: 'Ticket',
  components: {
    ChatForm,
    Messenger,
    Loader,
    LinkBack,
  },
  mixins: [readNewNotifications],
  data: () => ({
    offset: 0,
    limit: 20,
    messages: [],
    ticketInfo: null,
    lastMessages: null,
    prevRoute: null,
    actionData: {
      new: {
        btn: 'secondary',
        text: 'tickets.review',
      },
      in_process: {
        btn: 'primary',
        text: 'tickets.close',
      },
      credit_ticket: {
        btn: 'white',
        text: 'tickets.pass',
      },
    },
  }),
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from
    })
  },
  computed: {
    ...mapUserState(['id', 'permissions']),
    isSupport() {
      return this.$route.path.match('support') !== null
    },
    showChatUser() {
      return this.ticketInfo.assigned_user === null || this.ticketInfo.status !== 'resolved'
    },
    showEditAdmin() {
      return this.permissions && this.permissions.includes('ticket.review')
    },
    showChatAdmin() {
      return (this.ticketInfo.assigned_user == null || this.ticketInfo.assigned_user.id === this.id) && this.ticketInfo.status === 'in_process'
    },
    uuid() {
      return this.$route.params.id
    },
    setBack() {
      return this.prevRoute !== null && this.prevRoute.path.match(/tickets/) && this.prevRoute.query.tab ? `/tickets?tab=${this.prevRoute.query.tab}` : '/tickets'
    },
    showIfMyTicket() {
      return this.prevRoute !== null && this.prevRoute.path.match(/tickets/) && this.prevRoute.query.tab ? `/tickets?tab=${this.prevRoute.query.tab}` : '/tickets'
    },
  },
  mounted() {
    this.fetchStatus()
  },

  methods: {
    async changeStatus() {
      try {
        const { data, messages } = await this.$instance.patch(`support/tickets/${this.uuid}`, {
          status: this.ticketInfo.status == 'new' ? 'in_process' : 'resolved',
        })
        if (data) {
          this.ticketInfo = data.data
        } else {
          this.$error.show(messages?.status[0])
        }
      } catch (e) {
        this.$error.show(e.response.data.messages?.status[0])
      }
    },
    async fetchStatus() {
      this.readNewNotifications('support_ticket_message_created')
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: `support/tickets/${this.uuid}`,
        })
        if (data) {
          this.ticketInfo = data.data
        }
      } catch {
        this.$router.push(this.isSupport ? '/support' : '/tickets')
      }
    },
    updateMessage(data) {
      this.offset = 0
      this.messages.push(data)
      this.$refs.$messanger?.trigger()
      this.fetchStatus()
      this.$emit('updateMessage', data)
    },
    // infiniteHandler($state) {
    //   this.fetchMessages($state)
    // },
    async infiniteHandler(index, done) {
      if (this.ticketsLoaded) {
        done()
        return
      }
      await this.fetchMessages()
      done()
    },
    async fetchMessages() {
      this.ticketsLoaded = false
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: `support/tickets/${this.uuid}/messages`,
          params: {
            offset: this.offset,
            limit: this.limit,
          },
        })
        if (data.data.length > 0) {
          this.offset = this.offset + this.limit
          this.messages.unshift(...data.data.reverse())
          if(data.meta.paginate.total <= this.messages.length) {
            this.ticketsLoaded = true
          }
        }
      } catch (e) {
        console.log('catch e', e)
        this.$router.push(this.isSupport ? '/support' : '/tickets')
      }
    },
  },
}
</script>
