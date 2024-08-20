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
      @load="getCodes"
      @getData="getRequestsPagination"
    >
      <DepositCodesRow
        v-for="entry in sortedRows"
        :key="entry.id"
        :code="entry"
      />
    </Table>
    <div v-else class="text-gray-500 dark:text-gray-300 whitespace-nowrap">
      {{ $t('noRecords') }}
    </div>
  </div>
</template>

<script>
import Table from 'src/components/extends/table/table.vue'
import DepositCodesRow from './deposit-codes-row.vue'

export default {
  name: 'DepositListCodes',
  components: {
    Table,
    DepositCodesRow,
  },
  data() {
    return {
      rows: null,
      totalQuantity: 0,
      offset: 0,
      limit: 10,
      headers: [
        { label: 'headers.code' },
        { label: 'headers.amount' },
        { label: 'headers.dateCreation' },
        { label: 'headers.dateExpiration' },
      ],
      innerHeaders: [],
    }
  },
  async created() {
    await this.getCodes()
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
      await this.getCodes()
    },
    async getCodes(isLoaderVisible) {
      if (isLoaderVisible === false) return

      try {
        const {
          data: { data, status, message, meta },
        } = await this.$instance.get('wallet/promocode', {
          params: {
            offset: this.offset,
            limit: this.limit,
          },
        })
        if (status) {
          this.rows = data
          this.totalQuantity = meta?.paginate?.total || 0
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        console.log('e', e)
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
