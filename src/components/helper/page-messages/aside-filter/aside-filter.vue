<template>
  <div class="aside-filter">
    <div
      class="flex items-center"
    >
      <button
        class="flex-shrink-0 rounded-md box-content border-2 mr-3 border-primary-light text-primary bg-primary-light w-10 h-10 flex items-center justify-center relative"
        @click="toggleFilter"
      >
        <svg
          v-svg
          class="w-5 h-5 text-primary"
          symbol="filters-empty"
        />
        <svg
          v-svg
          :class="{'transform rotate-45': isFilter}"
          class="absolute w-2 h-2 bottom-2 right-2 text-primary transition duration-500"
          symbol="filters-plus"
        />
      </button>
      <VInput
        v-model="search"
        class="flex-grow text-sm"
        :placeholder="$t('chat.transactionSearch')"
        step="any"
        type="search"
      />
    </div>
    <transition name="fade">
      <div v-if="($matchMedia.desktop || !$route.params.chat_id) && isFilter">
        <MessagesFilters class="mt-3" />
      </div>
    </transition>
    <div class="mt-3 flex items-center justify-between">
      <span class="text-sm font-medium">
        {{ $t("conversation.newMessages") }}: {{ countUnreadMessages }}</span>
      <Button
        view-color="secondary"
        class="text-sm ml-2"
        :loading="loading"
        @click="sendReadAll"
      >
        {{ $t("conversation.readAll") }}
      </Button>
    </div>
  </div>
</template>
<script>
import { createNamespacedHelpers } from 'vuex'
import VInput from 'src/components/extends/v-input/v-input.vue'
import MessagesFilters from 'src/components/helper/page-messages/filter-checkboxes/filter-checkboxes.vue'
import Button from 'src/components/extends/button/button.vue'

const {
  mapActions: mapLayoutActions,
} = createNamespacedHelpers('layout')
export default {
  components: {
    VInput,
    MessagesFilters,
    Button,
  },
  props: {
    count: {
      type: Number,
      default: 0,
    },
  },
  data: () => ({
    isFilter: false,
    setUnreadInProgress: false,
    countUnreadMessages: 0,
    search: '',
    waiting: true,
    loading: false,
  }),
  watch: {
    search() {
      this.$emit('search', this.search)
    },
  },
  mounted() {
    this.countUnreadMessages = this.count
  },
  methods: {
    ...mapLayoutActions(['setFilters']),

    sendReadAll() {
      this.waiting = false
      setTimeout(() => {
        this.readAll()
        this.waiting = true
      }, 400)
    },
    async readAll() {
      this.loading = true
      try {
        this.setUnreadInProgress = true
        const { data: { status, message } } = await this.$instance({
          url: 'chat/read-all',
        })

        if (status) {
          const unreadClasses = document.querySelectorAll('.conversation_unread')
          this.countUnreadMessages = 0
          unreadClasses.forEach((item) => {
            item.classList.remove('conversation_unread')
          })
        } else {
          this.$error.show(message)
        }

        this.setUnreadInProgress = false
      } catch {
        this.$error.show()
      }
      this.loading = false
    },

    toggleFilter() {
      this.isFilter = !this.isFilter
      if (!this.isFilter) {
        this.setFilters([])
      }
    },
  },
}
</script>
