<template>
  <div class="disputes-aside h-full ">
    <div
        class="h-full flex flex-col"
        :class="isDisputesFooterVisible && 'disputes__body_new'"
    >
      <div class="lg:flex lg:max-w-384 lg:items-center lg:justify-between mb-6 lg:pr-8">
        <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 xs:mb-6">
          {{ $t("disputes.title") }}
        </h1>
        <Search
            class="lg:ml-6"
            :query="searchQuery"
            :placeholder="$t('button.search')"
            @search="(query) => (searchQuery = query)"
        />
      </div>
      <TabsBadges
          :first-tab="disputesFilter"
          :labels="statusText"
          class="lg:pr-8"
          :stretch="true"
          :tabs-data="tabsData"
          @setPath="setPath"
      />
      <div class="lg:relative lg:flex lg:flex-grow lg:-ml-8">
        <div class="lg:absolute lg:inset-0 xs:mb-20">
          <div class="lg:h-full font-base lg:scrollbar-thin lg:scrollbar lg:scrollbar-thumb-gray-200 lg:dark:scrollbar-thumb-gray-700 lg:scrollbar-track-transparent lg:overflow-y-scroll lg:scrollbar-thumb-rounded-full lg:scrollbar-track-rounded-full">
            <ul
                v-if="localDisputes.length"
                class="block space-y-5 w-full "
            >
              <li
                  v-for="dispute in localDisputes"
                  :key="dispute.id"
                  class="block lg:px-8"
              >
                <DisputeCard
                    class="lg:max-w-384"
                    :dispute="dispute"
                />
              </li>
            </ul>
            <Loader
                v-if="quantity > visibleQuantity"
                v-observe-visibility="getDisputes"
            />
            <p
                v-if="localDisputes.length === 0 "
                class="text-gray-500 lg:px-8 dark:text-gray-300 lg:mt-5 max-w-3xl xs:mt-3"
            >
              {{ $t(noDisputesText) }}
            </p>
            <div
                v-if="isDisputesFooterVisible"
                class="lg:px-8 xs:fixed xs:inset-x-4 xs:bottom-0"
            >
              <Button
                  :loading="assigningDisputes"
                  view-color="primary"
                  class="w-full font-semibold py-3 mt-8 mb-4"
                  @click="assignDisputes"
              >
                {{ $t("disputes.takeDisputes", newQuantity, { count: newQuantity }) }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { USER_ROLE } from '@/constants'
import Search from '@/components/extends/search/search'
import DisputeCard from '@/components/helper/page-dispute/dispute-card/dispute-card'
import readNewNotifications from '@/mixins/readNewNotifications'
import Loader from '@/components/extends/loader/loader'
import TabsBadges from '@/components/extends/tabs-badges/tabs-badges-new'
import Button from '@/components/extends/button/button'
const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')
const {
  MODERATOR, ADMIN,
} = USER_ROLE
export default {
  name: 'DisputesAside',
  components: {
    Search,
    DisputeCard,
    Loader,
    Button,
    TabsBadges,
  },
  mixins: [readNewNotifications],
  data: () => ({
    disputesFilter: 'own',
    // tabsData: null,
    disputes: null,
    newQuantity: null,
    searchQuery: null,
    list: null,
    limit: 10,
    quantity: null,
    assigningDisputes: false,
    ownQuantity: null,
    inprocessQuantity: null,
    statusText: {
      own: {
        text: 'status.mine',
      },
      inprocess: {
        text: 'dealStatus.work',
      },
      new: {
        text: 'status.new',
      },
    },
    assigningDisputesQuantity: null,
  }),
  created() {
    this.getDisputes()
  },
  beforeUnmount() {
    this.leaveDisputesChannels()
  },
  computed: {
    ...mapUserState(['id', 'role', 'routLinkToMessage']),
    tabsData() {
      return {
        own: this.ownQuantity,
        inprocess: this.inprocessQuantity,
        new: this.newQuantity,
      }
    },
    localDisputes() {
      if (!this.list) return []
      return this.list
        .filter(item => !!this.disputes[item])
        .map(item => this.disputes[item])
    },
    visibleQuantity() {
      return this.localDisputes ? this.localDisputes.length : 0
    },
    isDisputesFooterVisible() {
      return (this.role === 'moderator' || this.disputesFilter === 'new') && this.newQuantity
    },
    noDisputesText() {
      if (this.searchQuery) {
        return 'nothingFound'
      }
      if (this.disputesFilter === 'inprocess') {
        return 'disputes.noDisputesWork'
      }
      if (this.disputesFilter === 'new') {
        return 'disputes.noDisputesNew'
      }
      return 'disputes.noDisputes'
    },
    isModerator() {
      return this.role === MODERATOR
    },
    isAdmin() {
      return this.role === ADMIN
    },
  },
  mounted() {
    if (this.$route.query.tab) this.setPath(this.$route.query.tab ? this.$route.query.tab : 'owl')
    this.readNewNotifications('new_deal_dispute')
  },
  watch: {
    disputesFilter() {
      if (this.searchQuery) {
        this.searchQuery = null
      } else {
        this.updateDisputes()
      }
    },
    searchQuery() {
      this.updateDisputes()
    },
  },
  methods: {
    ...mapUserMutations(['setRoutLinkToMessage']),
    setPath(type) {
      this.disputesFilter = type
    },
    updateDisputes() {
      this.disputes = null
      this.list = null
      this.getDisputes()
    },
    async getDisputes(isLoaderVisible) {
      if (isLoaderVisible === false) return
      const query = this.searchQuery
      const lastDisputeId = this.localDisputes.length
        ? this.localDisputes[this.localDisputes.length - 1].id
        : null
      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'dispute/list',
          data: {
            limit: this.limit,
            hash: true,
            ...(this.disputesFilter !== 'own' ? { filter: this.disputesFilter } : {}),
            ...(lastDisputeId ? { id: lastDisputeId } : {}),
            ...(query ? { query } : {}),
          },
        })
        if (status) {
          if (query !== this.searchQuery) return
          this.disputes = {
            ...(lastDisputeId ? this.disputes : {}),
            ...data.requests,
          }
          this.list = data.list
          this.quantity = data.list ? data.list.length : 0
          this.setQuantity(data.quantity)
          this.joinDisputesChannel()
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    joinDisputesChannel() {
      let channelName = `.User.${this.id}`
      switch (this.disputesFilter) {
        case 'inprocess':
          channelName = `DisputeInWork${channelName}`
          break
        case 'new':
          channelName = `DisputeNew${channelName}`
          break
        default:
          channelName = `DisputeMy${channelName}`
      }
      if (window.echo.connector.channels[`private-${channelName}`]) {
        if (this.searchQuery) this.leaveDisputesChannels()
        return
      }
      this.leaveDisputesChannels()
      window.echo.private(channelName)
        .listen('update', (e) => {
          if (this.quantity === this.visibleQuantity) {
            this.disputes = {
              ...this.disputes,
              ...e.requests,
            }
          } else {
            const sameKeysArray = Object.keys(e.requests).filter(key => key in this.disputes)
            const sameKeysObject = sameKeysArray.reduce((obj, key) => ({
              ...obj,
              [key]: e.requests[key],
            }), {})
            this.disputes = {
              ...this.disputes,
              ...sameKeysObject,
            }
          }
          this.list = e.list
          this.quantity = e.list ? e.list.length : 0
          if ((e.quantity && e.quantity.my) > this.ownQuantity) {
            this.assigningDisputesQuantity -= 1
          }
          this.setQuantity(e.quantity)
          if (!this.assigningDisputesQuantity) this.assigningDisputes = false
        })
    },
    leaveDisputesChannels() {
      [
        'DisputeInWork',
        'DisputeNew',
        'DisputeMy',
      ].forEach((channel) => {
        const channelName = `${channel}.User.${this.id}`
        if (!window.echo.connector.channels[`private-${channelName}`]) return
        window.echo.leave(channelName)
      })
    },
    setQuantity(quantity) {
      if (this.searchQuery || !quantity) return
      if (quantity.my !== undefined) {
        this.ownQuantity = quantity.my
      }
      if (quantity.inprocess !== undefined) {
        this.inprocessQuantity = quantity.inprocess
      }
      if (quantity.new !== undefined) {
        this.newQuantity = quantity.new
      }
    },
    async assignDisputes() {
      this.assigningDisputes = true
      this.assigningDisputesQuantity = this.newQuantity < 10 ? this.newQuantity : 10
      try {
        const { data: { status, message } } = await this.$instance({
          url: 'dispute/assign',
          data: {
            count: this.assigningDisputesQuantity,
          },
        })
        if (!status) {
          this.$error.show(message)
          this.assigningDisputes = false
        }
      } catch {
        this.$error.show()
        this.assigningDisputes = false
      }
    },
  },
}
</script>
