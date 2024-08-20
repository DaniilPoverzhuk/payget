<template>
  <div
    class="notification"
    :class="{ 'cursor-pointer': setPath }"
    @click="setPath && getPath($event)"
  >
    <header class="flex items-center justify-between mb-1">
      <div class="flex items-start">
        <span
          v-if="notification.read_at === null"
          class="w-1 h-1 bg-primary mr-1 rounded-full flex-shrink-0 mt-3"
        />
        <p class="font-medium text-gray-700 dark:text-gray-300">
          {{ notification.data.title }}
        </p>
      </div>

      <p
        class="pl-2 text-sm"
        :class="{
          'text-primary': notification.read_at === null,
          'text-gray-400 dark:text-gray-500': notification.read_at !== null,
        }"
      >
        {{ date }}
      </p>
    </header>
    <div v-if="fullView" class="flex items-start">
      <Avatar
        v-if="
          (newMessage && notification.payload !== null) ||
          (isPost && notification.payload.cover)
        "
        :name="notification.payload.user ? notification.payload.user.name : ''"
        :avatar="notification.payload.cover"
        :hidden-name="true"
        :circle="newMessage"
        class="mr-3 mt-1 flex-shrink-0"
      />
      <div>
        <p class="flex-shrink-0 line-clamp-2 break-all">
          {{ setTitle }}
        </p>

        <p
          class="text-gray-500 dark:text-gray-300 line-clamp-2 break-all"
          v-html="setDetail"
        />
      </div>
    </div>
    <p
      v-else
      class="text-gray-500 dark:text-gray-300"
      v-html="notification.data.detail"
    />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Avatar from 'src/components/extends/avatar/avatar.vue'
import { USER_ROLE } from 'src/constants'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const {
  mapMutations: mapNotificationsMutations,
  mapActions: mapNotificationsActions,
} = createNamespacedHelpers('notifications')

export default {
  name: 'Notifications',
  components: { Avatar },
  props: {
    notification: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapUserState(['id', 'role']),
    date() {
      const date = this.notification.created_at.split('T')[0].split('-')
      return date.reverse().join('.')
    },
    fullView() {
      return this.isPost || this.newMessage
    },
    isPost() {
      return this.notification.type === 'post_created'
    },
    newMessage() {
      return this.notification.type === 'new_message'
    },
    setPath() {
      const commentUrl = `/feeds/${this.notification?.payload?.comment?.post?.slug}/comments/${this.notification?.payload?.comment?.id}`
      const payload =
        (this.notification.payload.post !== null &&
          this.notification.payload.action &&
          this.notification.payload.action.type === 'link' &&
          this.notification.payload.action.data.link) ||
        (!!this.notification?.payload?.comment && commentUrl)
      return payload && payload !== this.$route.fullPath ? payload : ''
    },
    setTitle() {
      if (this.newMessage) {
        return this.notification.payload.user.name
      }
      return this.notification.payload.post !== null
        ? this.notification.payload.post.title
        : this.notification.data.title
    },
    setDetail() {
      if (this.newMessage) {
        return this.convertText(this.notification.data.detail)
      }
      return this.notification.payload.post !== null
        ? this.notification.payload.post.short_description
        : this.notification.data.detail
    },
  },
  methods: {
    ...mapNotificationsActions(['fetchNotificationRead']),
    ...mapNotificationsMutations(['setSomeState']),
    convertText(text) {
      const words = this.$CryptoJS.enc.Hex.parse(text)
      const wordsEnc = words.toString(this.$CryptoJS.enc.Utf8)
      if (!wordsEnc) {
        return ''
      }
      const messageEnc = wordsEnc.split('||')
      const message = this.$CryptoJS.AES.decrypt(messageEnc[0], messageEnc[1])
      return message.toString(this.$CryptoJS.enc.Utf8)
    },
    getPath(e) {
      if (!this.notification?.payload?.comment) {
        e.preventDefault()
      }
      if (this.setPath) {
        const { ADMIN, MODERATOR } = USER_ROLE
        if (
          this.notification?.payload?.chat?.deal?.status === 'dispute' &&
          (this.role == ADMIN || this.role == MODERATOR)
        ) {
          const path = this.setPath.replace('message', 'dispute')
          this.$router.push(path)
        } else if (
          this.notification?.type === 'support_ticket_message_created'
        ) {
          this.$router.push({
            name: 'ticket',
            params: {
              id: this.notification?.payload?.ticket?.uuid,
            },
          })
        } else {
          this.$router.push(this.setPath)
        }
      }
      this.$emit('afterClick')
      this.getNotificationRead()
    },
    async getNotificationRead() {
      this.fetchNotificationRead({
        id: this.id,
        notificationId: this.notification.id,
        type: 'click',
      })
    },
  },
}
</script>
