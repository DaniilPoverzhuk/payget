<template>
  <div class="notice">
    <NoticeMessage :messages="messages" />
    <button class="-z-99 absolute opacity-0" @click="turnSound" />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import NoticeMessage from './notice-message/notice-message.vue'
import UrlAudio from 'src/assets/audio/notifications.wav'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { mapState: mapLayoutState } = createNamespacedHelpers('layout')
const { mapState: mapNotificationsState, mapActions: mapNotificationsActions } =
  createNamespacedHelpers('notifications')
export default {
  name: 'Notice',
  components: {
    NoticeMessage,
  },
  data() {
    return {
      countMessages: 5,
      messages: [],
      currentFaviconIndex: 0,
      isBlinking: false,
    }
  },
  computed: {
    ...mapUserState(['id']),
    ...mapNotificationsState(['notice', 'settingsApp', 'showHeader']),
    setPath() {
      const payload =
        this.notice.payload &&
        this.notice.payload.action &&
        this.notice.payload.action.type === 'link' &&
        this.notice.payload.action.data.link
      return payload ? payload !== this.$route.fullPath : false
    },
  },
  watch: {
    notice() {
      if (this.settingsApp === null) {
        this.setSettings()
      } else {
        this.setNotice()
      }
    },
    showHeader() {
      if (this.showHeader) this.messages = []
    },
  },
  methods: {
    ...mapNotificationsActions(['fetchSettings']),
    turnSound() {
      const audio = new Audio(UrlAudio)
      audio.play()
    },
    blinkFavicon() {
      const faviconElement = document.getElementById('favicon')
      const faviconImages = ['favicon.ico', 'favicon_notification.ico']
      this.isBlinking = true
      const originalFavicon = faviconElement.href

      const toggleFavicon = () => {
        if (document.visibilityState === 'hidden') {
          faviconElement.href = faviconImages[this.currentFaviconIndex]
          this.currentFaviconIndex =
            (this.currentFaviconIndex + 1) % faviconImages.length
        } else {
          clearInterval(blinkInterval)
          this.isBlinking = false
          faviconElement.href = originalFavicon
        }
      }

      const blinkInterval = setInterval(toggleFavicon, 1000)
    },
    setNotice() {
      const removeNotificationTime = 10 * 1000
      const { is_muted } = this.settingsApp
      if (!is_muted) this.turnSound()
      if (this.setPath && !this.showHeader) {
        this.messages.push(this.notice)
        setTimeout(() => {
          this.messages = this.messages.filter((n) => n.id != this.notice.id)
        }, removeNotificationTime)
      }
      if (this.messages && this.messages.length) {
        if (
          typeof window !== 'undefined' &&
          document.visibilityState === 'hidden'
        ) {
          if (!this.isBlinking) {
            this.blinkFavicon()
          }
        }
      }
    },
    async setSettings() {
      try {
        await this.fetchSettings({
          id: this.id,
          namespace: 'app',
        })
        this.setNotice()
      } catch {
        this.$error.show('Settings failed')
      }
    },
  },
}
</script>
