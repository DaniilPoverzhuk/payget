<template>
  <div v-if="rows">
    <Button
      v-if="userName && rows.length && isAdmin"
      view-color="secondary"
      class="ml-auto mr-0 mb-6"
      @click="clearLogsDialog = true"
    >
      {{ $t('logs.clean') }}
    </Button>

    <Table
      v-if="rows.length"
      v-slot="{ sortedRows }"
      :headers="headers"
      :rows="rows"
      :total="totalQuantity"
      :visible="visibleQuantity"
      @load="getLogsList"
			isLoadedContent
    >
	<q-infinite-scroll class="divide-y divide-gray-200 dark:divide-gray-700" style="display: table-row-group;" @load="infiniteHandler" :offset="0">
		<LogsRow
        v-for="log in sortedRows"
        :key="log.id"
        :log="log"
      />
		<template v-slot:loading>
			<td class="row justify-center q-my-md" style="display: table-cell" colspan="5">
				<Loader />
			</td>
		</template>
	</q-infinite-scroll>
    </Table>
    <p
      v-else
      class="lg:text-xl xs:text-md text-gray-500 lg:mt-5 max-w-3xl xs:mt-3"
    >
      {{ $t('logs.noLogs') }}
    </p>
    <Dialog
      v-model="clearLogsDialog"
      :error="false"
      :is-icon="false"
      :heading="$t('logs.clearLogs')"
      @hide="clearLogsDialog = false"
    >
      <div class="mt-6 flex space-x-3">
        <Button
          view-color="grey"
          class="w-1/2"
          @click="clearLogsDialog = false"
        >
          {{ $t('button.cancel') }}
        </Button>
        <Button
          :loading="clearingLogs"
          class="w-1/2"
          view-color="secondary"
          @click="clearLogs"
        >
          {{ $t('button.clear') }}
        </Button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { USER_ROLE } from 'src/constants'
import Table from 'src/components/extends/table/table.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import LogsRow from '../logs-row/logs-row.vue'
import Loader from 'src/components/loader/loader.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { ADMIN } = USER_ROLE

export default {
  name: 'Logs',
  components: {
    LogsRow,
    Table,
    Dialog,
    Loader
  },
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      clearingLogs: false,
      clearLogsDialog: false,
      rows: null,
      totalQuantity: 0,
      limit: 50,
      logsLoaded: false
    }
  },
  computed: {
    ...mapUserState(['role', 'viewUserId']),
    isAdmin() {
      return this.role === ADMIN
    },
    userName() {
      return this.$route.params.name || null
    },
    visibleQuantity() {
      return this.rows ? this.rows.length : 0
    },
    headers() {
      const cells = [
        { label: 'ID' },
        { label: 'Name' },
        { label: 'Data' },
        { label: 'Created at' },
      ]

      if (!this.userName) {
        cells.push({ label: 'User' })
      }

      return cells
    },
  },
  watch: {
    dialog(value) {
      if (!value) return
      this.clearLogsDialog = true
      this.$emit('update:dialog', false)
    },
    async viewUserId(value) {
      if (!value) return
      await this.getLogsList()
    },
  },
  async created() {
    if (this.$route.params.name && !this.viewUserId) return
    await this.getLogsList()
  },
  methods: {
    async infiniteHandler(index, done) {
      if (this.logsLoaded) {
        done()
        return
      }
      await this.getLogsList()
      done()
    },
    async getLogsList(isLoaderVisible) {
      if (isLoaderVisible === false) return

      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'log/list',
          data: {
            start: this.visibleQuantity,
            limit: this.limit,
            ...(this.userName ? { user_id: this.viewUserId } : {}),
          },
        })

        if (status) {
          this.rows = [
            ...(this.rows || []),
            ...(data.list || []),
          ]
          this.totalQuantity = data.quantity || 0
          if(this.totalQuantity && this.totalQuantity == this.visibleQuantity) {
            this.logsLoaded = true
          }
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    async clearLogs() {
      this.clearingLogs = true

      try {
        const { data: { status, message } } = await this.$instance({
          url: 'log/clear',
          data: {
            ...(this.userName ? { user_id: this.viewUserId } : {}),
          },
        })

        if (status) {
          this.clearLogsDialog = false
          this.rows = []
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.clearingLogs = false
    },
  },
}
</script>
