<template>
  <tr
    v-if="data!== null"
    class="cursor-pointer"
    @click="goComplaint"
  >
    <td class="px-6 py-4 whitespace-nowrap">
      <p class="text-sm font-medium text-gray-900 dark:text-white uppercase">
        #{{ data.uuid.substr(0, 8) }}
      </p>
    </td>
    <td class="px-6 py-4 max-w-xs">
      <span class="text-sm text-gray-500 dark:text-gray-300">{{ data.user.name }}</span>
    </td>
    <td class="px-6 py-4 max-w-xs">
      <span
        v-if="data.subject !== null"
        class="text-sm text-gray-500 dark:text-gray-300"
      >
        {{ data.subject.subject }}
      </span>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
      {{ createDate }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
      <ViewTicket
        v-if="data.status =='new'"
        :id="data.uuid"
        :redirect="true"
      />
      <p
        v-if="data.assigned_user"
        class="text-sm text-gray-500 dark:text-gray-300"
      >
        {{ data.assigned_user.name }}
      </p>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <p
        class="text-xs inline-block px-2 font-medium border rounded-lg"
        :class="statusClass"
        v-text="$t(statusData[data.status]) "
      />
    </td>
  </tr>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import complaint from 'src/mixins/complaint.vue'
import ViewTicket from 'src/components/helper/page-ticket/view-ticket/view-ticket.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  components: {
    ViewTicket,
  },
  mixins: [complaint],
  props: {
    data: {
      type: Object,
    },
    order: {
      type: Number,
    },
  },
  data: () => ({
    requisites: '',
    sendingRequisites: false,
    statusData: {
      new: 'tickets.status.new',
      in_process: 'tickets.status.in_process',
      resolved: 'tickets.status.resolved',
    },
  }),
  computed: {
    ...mapUserState(['id']),

    createDate() {
      return this.data.created_at.split(' ')[0].split('-').reverse().join('.')
    },
    statusClass() {
      return this.data.status === 'resolved' ? 'text-gray-400 border-gray-400' : 'text-primary border-primary'
    },
  },
  methods: {
    goComplaint() {
      this.$router.push(`tickets/${this.data.uuid}`)
    },
  },
}
</script>
