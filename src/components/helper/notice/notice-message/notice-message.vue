<template>
  <div class="messages_list fixed top-80 right-4 z-10">
    <transition-group
      name="v-transition-animate"
    >
      <div
        v-for="(message, key) in messages"
        :key="message.id"
        class="py-4 pl-4 pr-12 mb-4 shadow-md border border-gray-100 lg:dark:border-gray-800 rounded-md p-5 relative lg:w-384 xs:w-326 bg-white dark:bg-dark-c-white"
      >
        <Notifications
          :notification="message"
          @afterClick="closeNotice(key)"
        />
        <button
          class="absolute top-4 right-4 cursor-pointer border-0"
          @click="closeNotice(key)"
        >
          <svg
            v-svg
            class="w-6 h-6 text-gray-400 dark:text-gray-500"
            symbol="close"
          />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>

import decodeText from 'src/mixins/decode-text.vue'
import Notifications from 'src/components/extends/notifications/notifications.vue'

export default {
  name: 'NoticeMessage',
  components: {
    Notifications,
  },
  mixins: [decodeText],
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
    rightButton: {
      type: String,
      default: '',
    },
    leftButton: {
      type: String,
      default: '',
    },
    timeout: {
      type: Number,
      default: 5000,
    },
  },
  watch: {
    messages() {
      this.hideNotification()
    },
  },
  mounted() {
    this.hideNotification()
  },
  methods: {
    closeNotice(i) {
      this.messages.splice(i, 1)
    },
    hideNotification() {
      if (this.messages.length) {
        setTimeout(() => {
          this.messages.splice(this.messages.length - 1, 1)
        }, this.timeout)
      }
    },
  },
}
</script>

<style>

.v-transition-animate-enter {
  @apply  transform translate-x-120 opacity-0
}

.v-transition-animate-enter-active {
  transition: all 0.6s ease;
}
.v-transition-animate-enter-to {
  @apply opacity-100
}
.v-transition-animate-leave {
  @apply h-106 opacity-100
}
.v-transition-animate-leave-active {
  transition: transform 0.6s ease, opacity 0.6s, height 0.6s 0.2s;
}
.v-transition-animate-leave-to {
  @apply h-0 transform translate-x-120 opacity-0
}
.v-transition-animate-move {
  transition: transform 0.6s ease;
}

</style>
