<template>
  <tr>
    <td class="px-2 py-4">
      {{ log.id }}
    </td>
    <td class="px-2 py-4">
      {{ log.name }}
    </td>
    <td class="px-2 py-4">
      <div class="text-xs border-1 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-5 ">
        <code class="whitespace-pre-wrap font-mono">{{ log.data }}</code>
      </div>
    </td>
    <td class="px-2 py-4">
      {{ logCreatedAt }}
    </td>
    <td
      v-if="!userName"
      class="px-2 py-4 whitespace-nowrap"
    >
      <template v-if="logUser">
        <router-link
          v-if="logUser.isMember"
          class="text-primary"
          :to="`user/${logUser.name}/logs`"
        >
          {{ `#${logUser.id}` }} {{ logUser.login }}
        </router-link>
        <template v-else>
          {{ `#${logUser.id}` }} {{ logUser.login }}
        </template>
      </template>
    </td>
  </tr>
</template>

<script>
import { format } from 'date-fns'

export default {
  name: 'LogsRow',
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
  computed: {
    userName() {
      return this.$route.params.name || null
    },
    logUser() {
      if (!this.log.user.id) return null

      const { user } = this.log
      return {
        id: user.id,
        name: user.name,
        login: user.login,
        isMember: user.role === 'member',
      }
    },
    logCreatedAt() {
      return format(new Date(this.log.created_at.replace(' ', 'T')), 'dd.MM.yyyy HH:mm:ss')
    },
  },
}
</script>
