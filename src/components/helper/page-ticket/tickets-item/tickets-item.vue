<template>
  <div
    v-if="data !== null"
    class="tickets-item px-4 py-6 relative"
  >
    <router-link
      :to="`/support/${data.uuid}`"
      class="absolute w-full h-full inset-0"
    >
      <span class="sr-only">go in tiket</span>
    </router-link>

    <div class="flex items-center mb-3">
      <p class="text-gray-700 dark:text-gray-300 font-semibold lg:text-sm flex-grow uppercase">
        #{{ data.uuid.substr(0, 8) }}
      </p>
      <p
        class="text-xs ml-2 px-2 font-medium border rounded-lg"
        :class="statusClass"
      >
        {{ $t(statusData[data.status]) }}
      </p>
      <p class="text-gray-400 dark:text-gray-500 lg:text-sm ml-2">
        {{ createDate }}
      </p>
    </div>
    <p
      v-if="data.subject !== null"
      class="text-gray-700 dark:text-gray-300 mb-2 font-semibold lg:text-sm"
    >
      {{ $t('headers.theme') }}: {{ data.subject.subject }}
    </p>
    <p
      v-if="data.last_message"
      class="text-gray-500 dark:text-gray-300 lg:text-sm line-clamp-2 break-all"
    >
      <span
        class="font-semibold text-gray-700 dark:text-gray-300 capitalize"
        v-text="`${name == data.last_message.user.name ? $t('you') : data.user.name}:`"
      />
      {{ data.last_message.message.length == 0 ? $t('chat.image') : data.last_message.message }}
    </p>
  </div>
</template>

<script>

import { createNamespacedHelpers } from 'vuex'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  name: 'TicketsItem',
  props: {
    data: {
      data: Object,
      default: null,
    },
  },
  data: () => ({
    statusData: {
      new: 'tickets.status.new',
      in_process: 'tickets.status.in_process',
      resolved: 'tickets.status.resolved',
    },
  }),
  computed: {
    ...mapUserState(['name']),
    statusClass() {
      return this.data.status === 'resolved' ? 'text-gray-400 border-gray-400' : 'text-primary border-primary'
    },
    createDate() {
      return this.data.created_at.split(' ')[0].split('-').reverse().join('.')
    },
  },
  methods: {
    setParamsPath(type) {
      if (type !== this.requestFilter) {
        this.$router.push({ query: { tab: type } })
        this.requestFilter = type
        this.offset = 0
        this.getRequests()
      }
    },
  },
}
</script>
