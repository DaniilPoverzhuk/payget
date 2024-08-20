<template>
  <div v-if="rows">
    <Table
      v-if="rows.length"
      v-slot="{ sortedRows }"
      :headers="innerHeaders"
      :rows="rows"
      :pagination="true"
      :short="true"
      :per-page="limit"
      :total="totalQuantity"
      class-headers="px-2"
      @load="getDepositHistory"
      @getData="getRequestsPagination"
    >
      <DepositHistoryRow
        v-for="entry in sortedRows"
        :key="entry.id"
        :entry="entry"
      />
    </Table>
    <div v-else class="text-gray-500 dark:text-gray-300 whitespace-nowrap">
      {{ $t('noRecords') }}
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Table from 'src/components/extends/table/table.vue'
import DepositHistoryRow from '../deposit-history-row/deposit-history-row.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'DepositHistory',
  components: {
    Table,
    DepositHistoryRow,
  },
  data() {
    return {
      rows: null,
      totalQuantity: 0,
      offset: 0,
      limit: 10,
      headers: [
        { label: 'headers.timeDate' },
        { label: 'headers.amount' },
        { label: 'headers.operationType' },
        { label: 'headers.notes', lg: true },
      ],
      innerHeaders: [],
    }
  },
  computed: {
    ...mapUserState(['id', 'viewUserId']),
    userId() {
      return this.$route.params.name ? this.viewUserId : this.id
    },
  },
  watch: {
    async viewUserId(value) {
      if (!value) return
      await this.getDepositHistory()
    },
  },
  async created() {
    if (this.$route.params.name && !this.viewUserId) return
    await this.getDepositHistory()
    if (typeof window !== 'undefined') {
      this.onResize()
      window.addEventListener('resize', this.onResize)
    }
  },
  methods: {
    onResize() {
      if (typeof window !== 'undefined') {
        this.innerHeaders =
          window.innerWidth < 1199
            ? this.headers.filter((x) => !x.lg)
            : this.headers.filter((x) => x)
      }
    },
    async getRequestsPagination(value) {
      this.offset = value * this.limit - this.limit
      await this.getDepositHistory()
    },
    async getDepositHistory(isLoaderVisible) {
      if (isLoaderVisible === false) return

      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'deposit/history/list',
          data: {
            start: this.offset,
            limit: this.limit,
            user_id: this.userId,
          },
        })
        if (status) {
          this.rows = data.list
          this.totalQuantity = data.quantity || 0
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
  },
  beforeUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize)
    }
  },
}
</script>
