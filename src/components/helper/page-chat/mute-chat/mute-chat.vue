<template>
  <button
    @click="setMute"
  >
    <svg
      v-svg
      class="w-6 h-6 text-gray-400 dark:text-gray-500"
      :symbol="!muteLocal ? 'volume-up' : 'volume-off'"
    />
  </button>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapState: mapUserState, mapMutations: mapUserMutations } = createNamespacedHelpers('user')

export default {
  name: 'MuteChat',
  props: {
    chatId: {
      type: [Number, String],
      required: true,
    },
    mute: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    muteLocal: '',
  }),
  mounted() {
    this.muteLocal = this.mute
  },
  methods: {
    ...mapUserMutations(['setChatMuted']),
    setMute() {
      this.muteLocal = !this.muteLocal
      this.setChatMuted({ [this.chatId]: this.muteLocal })
      this.fetchMute(this.muteLocal)
    },
    async fetchMute(mute) {
      try {
        const { data: { status, message } } = await this.$instance({
          url: 'chat/mute',
          data: {
            chat_id: this.chatId * 1,
            mute,
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
