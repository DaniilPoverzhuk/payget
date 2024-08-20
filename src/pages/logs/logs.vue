<template>
  <div class="logs my-10 w-full px-4 lg:px-6">
    <div class="lg:flex lg:justify-between lg:items-center lg:mb-4">
      <h1 class="text-gray-700 dark:text-white mb-6">
        {{ $t('logs.title') }}
      </h1>
      <Button
        view-color="secondary"
        class="font-medium flex-shrink-0 lg:ml-3 xs:mb-6"
        @click="isClearLogsDialogVisible = true"
      >
        {{ $t('logs.clean') }}
      </Button>
    </div>
    <Logs class="" v-model:dialog="isClearLogsDialogVisible" />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Logs from 'src/components/helper/page-logs/logs-table/logs-table.vue'
import { USER_ROLE } from 'src/constants'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { ADMIN } = USER_ROLE

export default {
  name: 'LogsPage',
  components: {
    Logs,
  },
  data() {
    return {
      isClearLogsDialogVisible: false,
    }
  },
  computed: {
    ...mapUserState(['role']),
    isAdmin() {
      return this.role === ADMIN
    },
  },
}
</script>
