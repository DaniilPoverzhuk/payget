<template>
  <div class="notifications-header flex">
    <button class="mr-3 relative" @click.prevent="showNotifications()">
      <span
        v-if="haveNewMessage"
        class="w-2 h-2 bg-primary ml-1 rounded-full block absolute top-0.5 right-0.5"
      />
      <svg
        v-svg
        class="w-6 h-6 text-gray-400"
        symbol="bell"
        :class="{ active: showHeader }"
      />
    </button>
    <transition name="fade">
      <div
        v-if="showHeader"
        v-click-outside="
          () => {
            outsideShow()
          }
        "
        class="py-6 px-4 lg:absolute lg:w-384 lg:inset-full lg:right-0 lg:left-auto rounded-lg lg:bottom-auto xs:fixed xs:inset-0 z-10 top-12 w-full bg-white dark:bg-dark-c-white shadow-md dark:border dark:border-gray-800 xs:scrollbar-thin xs:scrollbar xs:scrollbar-thumb-gray-200 xs:dark:scrollbar-thumb-gray-700 xs:scrollbar-track-transparent xs:overflow-y-scroll xs:scrollbar-thumb-rounded-full xs:scrollbar-track-rounded-full"
      >
        <button
          v-if="$matchMedia.mobile"
          class="border-0 ml-auto mr-0 mb-4 block"
          @click="showNotifications()"
        >
          <svg
            v-svg
            class="w-6 h-6 text-gray-400 dark:text-gray-500"
            symbol="close"
          />
        </button>
        <div class="flex flex-row-reverse justify-between items-center mb-6">
          <button
            :class="{
              'order-1 text-2xl font-semibold text-gray-700 dark:text-gray-300':
                tab === 'notes',
              'flex text-gray-400 dark:text-gray-500': tab !== 'notes',
            }"
            @click="tab = 'notes'"
          >
            <svg
              v-if="tab !== 'notes'"
              v-svg
              class="w-6 h-6 text-gray-400 dark:text-gray-500 mr-1"
              symbol="bell"
            />
            {{ $t('notifications.title') }}
          </button>
          <button
            class="text-gray-400"
            :class="{
              'order-1 text-2xl font-semibold text-gray-700 dark:text-gray-300':
                tab === 'tuning',
              'flex text-gray-400 dark:text-gray-500': tab !== 'tuning',
            }"
            @click="tab = 'tuning'"
          >
            <svg
              v-if="tab !== 'tuning'"
              v-svg
              class="w-6 h-6 text-gray-400 dark:text-gray-500 mr-1"
              symbol="cog"
            />
            {{ $t('settings') }}
          </button>
        </div>
        <div v-if="tab === 'notes'" ref="boxScroll">
          <div
            ref="notificationsScroll"
            :class="{
              'lg:h-560 -mr-4 pr-5 lg:scrollbar-thin lg:scrollbar lg:scrollbar-thumb-gray-200 lg:dark:scrollbar-thumb-gray-700 lg:scrollbar-track-transparent lg:overflow-y-scroll lg:scrollbar-thumb-rounded-full lg:scrollbar-track-rounded-full':
                scrollBox,
            }"
          >
            <p
              v-if="!haveNewMessage"
              class="text-center font-medium text-gray-500 dark:text-gray-300 mb-3"
            >
              {{ $t('notifications.noNotifications') }}
            </p>
            <div
              v-if="haveNewMessage"
              class="flex justify-between items-center mb-3"
            >
              <div class="font-medium text-gray-500 dark:text-gray-300 pr-1">
                {{ $t('status.new') }}
              </div>
              <button
                class="font-medium text-primary"
                @click="readAllNotifications"
              >
                {{ $t('conversation.readAll') }}
              </button>
            </div>
            <Loader v-if="data === null" />
            <div v-else v-for="(notification, i) in data" :key="i" class="pt-1">
              <p
                v-if="idFirstMessage == notification.id"
                class="font-semibold text-gray-500 dark:text-gray-300 mb-3"
              >
                {{ $t('notifications.viewed') }}
              </p>
              <Notifications
                class="py-1"
                :notification="notification"
                @afterClick="setShowHeader(!showHeader)"
              />
            </div>
            <Button
              v-if="nextCursor !== null"
              view-color="grey"
              class="w-full mt-3"
              @click="geNotifications"
            >
              {{ $t('notifications.showMore') }}
            </Button>
          </div>
        </div>
        <div
          v-if="tab === 'tuning'"
          class="h-560 -mr-4 pr-4 lg:scrollbar-thin lg:scrollbar lg:scrollbar-thumb-gray-200 lg:dark:scrollbar-thumb-gray-700 lg:scrollbar-track-transparent lg:overflow-y-scroll lg:scrollbar-thumb-rounded-full lg:scrollbar-track-rounded-full"
        >
          <Filters :id="id" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import decodeText from 'src/mixins/decode-text.vue'
import Notifications from 'src/components/extends/notifications/notifications.vue'
import Filters from '../notifications-filters/notifications-filters.vue'
// import Referral from 'src/pages/referral/referral.vue'
import readNewNotifications from 'src/mixins/readNewNotifications.vue'
import Button from 'src/components/extends/button/button.vue'
import Loader from 'src/components/extends/loader/loader.vue'
//  import { setShowHeader } from '@/store/modules/notifications/mutations'
import { setShowHeader } from 'src/store/notifications/mutations.js'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const {
  mapState: mapNotificationsState,
  mapActions: mapNotificationsActions,
  mapMutations: mapNotificationsMutations,
} = createNamespacedHelpers('notifications')
export default {
  name: 'NotificationsHeader',
  components: {
    // Referral,
    Notifications,
    Button,
    Filters,
    Loader,
  },
  mixins: [decodeText, readNewNotifications],
  data: () => ({
    tab: 'notes',
    scrollBox: false,
    options: null,
    data: null,
    nextCursor: null,

    haveNewMessage: false,
    idFirstMessage: '',
  }),
  computed: {
    ...mapUserState(['id', 'isUnreadNotifications']),
    ...mapNotificationsState(['notifications', 'paginate', 'showHeader']),
  },
  watch: {
    notifications() {
      if (this.notifications) {
        this.data = this.notifications
        this.nextCursor = this.paginate
        this.isScroll()
        this.readAt()
      }
    },
    showHeader() {
      if (this.showHeader) {
        this.geNotifications()
      } else {
        this.setSomeState(['notifications', null])
        this.setSomeState(['paginate', null])
      }
    },
  },
  created() {
    this.listenSocket()
  },
  mounted() {
    if (this.id) this.initNotificationWebsocket(this.id)
    this.haveNewMessage = this.isUnreadNotifications
  },
  methods: {
    ...mapNotificationsActions([
      'fetchNotifications',
      'initNotificationWebsocket',
    ]),
    ...mapNotificationsMutations(['setShowHeader', 'setSomeState']),
    listenSocket() {
      this.haveNewMessage = this.is_unread_notifications
      if (typeof window !== 'undefined') {
        window.echo
          ?.private(`Notification.User.${this.id}`)
          .listen('unread', (e) => {
            this.haveNewMessage = e.has_unread
          })
      }
    },
    isScroll() {
      setTimeout(() => {
        if (
          this.$refs.notificationsScroll &&
          this.$refs.notificationsScroll.offsetHeight > 550
        ) {
          this.scrollBox = true
        } else {
          this.scrollBox = false
        }
      }, 0)
    },
    outsideShow() {
      if (this.$matchMedia.desktop && !this.$matchMedia.mobile) {
        this.setShowHeader(false)
      }
    },
    showNotifications() {
      if (this.$matchMedia.mobile) {
        if (!this.showHeader) {
          document.documentElement.classList.add('backdrop-noscroll')
        } else {
          document.documentElement.classList.remove('backdrop-noscroll')
        }
      } else {
        document.documentElement.classList.remove('backdrop-noscroll')
      }
      this.setShowHeader(!this.showHeader)
    },
    async readAllNotifications() {
      try {
        await this.$instance({
          method: 'GET',
          url: `user/${this.id}/notification/read-all`,
        })

        this.idFirstMessage = ''
        this.haveNewMessage = false
      } catch {
        this.$error.show('Read all failed')
      }
    },
    async geNotifications() {
      try {
        await this.fetchNotifications(this.id)
      } catch {
        this.$error.show('Notifications failed')
      }
    },
    readAt() {
      if (
        this.data !== null &&
        this.data.length > 0 &&
        this.data[0].read_at === null
      ) {
        const read = this.data.find((el) => el.read_at !== null)
        if (read) this.idFirstMessage = read.id
        this.haveNewMessage = true
      }
    },
  },
}
</script>
