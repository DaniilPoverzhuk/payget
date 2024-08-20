<template>
  <div class="support lg:pt-4 lg:px-4 xs:pt-11 w-full">
    <div class="lg:mt-4">
      <LinkBack
        v-if="$route.params.id && $matchMedia.mobile"
        class="px-4"
        to="/support"
        :text="$t('tickets.allTickets')"
      />
      <h1
        class="support-title text-2xl font-semibold text-center text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6"
      >
        <Button
          class="add-ticket-btn"
          to="/knowledge-base/kontakty"
          view-color="primary"
          >{{ $matchMedia.desktop ? $t('tickets.createTicket') : '+' }}</Button
        >
        <span>{{ $t('support.title') }}</span>
      </h1>
      <div
        class="flex border-t border-gray-200 dark:border-gray-500 lg:h-calc-support xs:h-calc-support-mobile"
      >
        <div
          v-if="$matchMedia.desktop || !$route.params.id"
          class="border-r border-gray-200 dark:border-gray-500 lg:max-w-384 w-full xs:w-full flex-shrink-0 overflow-y-auto"
        >
          <p
            v-if="tickets.length == 0"
            class="lg:text-xl xs:text-md text-gray-500 lg:mt-5 max-w-3xl xs:mt-3"
          >
            {{ $t('tickets.noTickets') }}
          </p>

          <Tickets
            v-else
            v-for="ticket in tickets"
            :key="ticket.uuid"
            :data="ticket"
            class="border-b border-gray-200 dark:border-gray-400 hover:bg-primary-light dark:hover:bg-dark-primary-light"
            :class="{
              'bg-primary-light dark:bg-dark-primary-light':
                $route.params.id == ticket.uuid,
            }"
          />
          <q-infinite-scroll @load="infiniteHandler" :offset="0" reverse>
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <Loader />
              </div>
            </template>
          </q-infinite-scroll>
        </div>
        <div v-if="$matchMedia.desktop || $route.params.id" class="flex-grow">
          <router-view
            :key="$route.params.id"
            @updateMessage="setLastMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Tickets from 'src/components/helper/page-ticket/tickets-item/tickets-item.vue'
import Loader from 'src/components/loader/loader.vue'
import LinkBack from 'src/components/extends/link-back/link-back.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Support',
  components: {
    LinkBack,
    Tickets,
    Loader,
  },
  data: () => ({
    activeOption: '',
    tickets: [],
    offset: 0,
    limit: 10,
    ticketsLoaded: false,
  }),
  computed: {
    ...mapUserState(['role']),
  },
  mounted() {
    if (this.role === 'admin') {
      this.$router.push('/tickets')
    }
  },
  methods: {
    setLastMessage(data) {
      const paramsId = this.$route.params.id
      const key = this.tickets.findIndex((element) => element.uuid == paramsId)

      if (this.tickets[key]) {
        this.tickets[key].last_message.message = data.message
        this.tickets[key].user = data.user
      }
      this.$forceUpdate()
    },
    // infiniteHandler($state) {
    //   this.fetchTickets($state)
    // },
    async infiniteHandler(index, done) {
      if (this.ticketsLoaded) {
        done()
        return
      }
      await this.fetchTickets()
      done()
    },
    async fetchTickets($state = false) {
      this.ticketsLoaded = false
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: 'support/tickets',
          params: {
            offset: this.offset,
            limit: this.limit,
          },
        })
        if (data.data.length > 0) {
          this.offset = this.offset + this.limit
          this.tickets.push(...data.data)
          if ($state && data.meta.paginate.total === this.tickets.length) {
            $state.complete()
          } else if ($state) {
            $state.loaded()
          }
        } else if ($state) $state.complete()
        this.ticketsLoaded = true
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.support-title {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  .add-ticket-btn {
    position: absolute;
    left: 0;
    font-size: 16px;
    @media (max-width: 1200px) {
      right: 0;
      margin-right: 1rem;
      left: auto;
      width: 48px;
      font-size: 24px;
    }
  }
}
</style>
