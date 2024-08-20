<template>
  <div
    class="tickets flex my-10 flex-col w-full px-4"
  >
    <h1 class="text-gray-700 dark:text-white mb-6">
      {{ $t('tickets.title') }}
    </h1>
    <TabsBadges
      v-if="dataList !== null"
      :labels="statusText"
      :tabs-data="tabsData"
      @setPath="setPath"
    />
    <p
      v-if="dataList !== null && dataList.length == 0"
      class="lg:text-xl xs:text-md text-gray-500 lg:mt-5 max-w-3xl xs:mt-3"
    >
      {{ $t('noData') }}
    </p>
    <Table
      v-if="dataList !== null && dataList.length >= 1"
      ref="table"
      v-slot="{ sortedRows }"
      :headers="headers"
      :rows="dataList"
      :pagination="true"
      :per-page="limit"
      :total="tabsData[activeTab ? activeTab : 'all']"
      @load="fetchTickets"
      @getData="getRequestsPagination"
    >
      <TableRow
        v-for="(complaint, i) in sortedRows"
        :key="i"
        :data="complaint"
        :order="i + 1"
        @update="fetchTickets()"
      />
    </Table>
  </div>
</template>

<script>

import Table from 'src/components/extends/table/table.vue'
import TabsBadges from 'src/components/extends/tabs-badges/tabs-badges-new.vue'
import TableRow from 'src/components/helper/page-tikets/table-row/table-row.vue'

export default {
  name: 'Tickets',
  components: {
    Table,
    TableRow,
    TabsBadges,
  },
  data: () => ({
    activeTab: '',
    dataList: null,
    tabsData: null,
    offset: 0,
    limit: 20,
    headers: [
      { label: 'headers.id.tickets' },
      { label: 'users' },
      { label: 'headers.theme' },
      { label: 'headers.dateCreation' },
      { label: 'headers.responsible' },
      { label: 'headers.status' },
    ],
    statusText: {
      new: {
        text: 'status.new',
      },
      mine: {
        text: 'status.mine',
      },
      in_process: {
        text: 'dealStatus.work',
      },
      resolved: {
        text: 'status.resolved',
      },
      all: {
        text: 'status.all',
      },
    },
  }),
  watch: {
    activeTab() {
      this.offset = 0
      this.fetchTickets()
    },
  },
  created() {
    this.fetchTickets()
  },
  mounted() {
    if (this.$route.query.tab) this.setPath(this.$route.query.tab ? this.$route.query.tab : 'all')
  },
  methods: {
    async getRequestsPagination(value) {
      this.offset = value * this.limit - this.limit
      await this.fetchTickets()
    },

    setPath(type) {
      this.activeTab = type
      this.offset = 0
    },
    async fetchTickets() {
      if (!this.activeTab && this.$route.query.tab) return
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: 'support/tickets',
          params: {
            offset: this.offset,
            limit: this.limit,
            'filter[status]': this.activeTab ? this.activeTab : 'all',
          },
        })
        if (data) {
          this.offset = this.offset + this.limit
          this.tabsData = data.meta.totals
          this.dataList = data.data
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
