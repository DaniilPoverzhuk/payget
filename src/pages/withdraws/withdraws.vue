<template>
  <div class="withdraws mt-10 w-full max-w-7xl mx-auto px-4 lg:pb-4 lg:px-6">
    <div class="lg:flex lg:justify-between lg:items-center xs:mb-6">
      <h1 class="text-gray-700 dark:text-gray-300 mb-6 pr-3">
        {{ $t("withdraws.withdrawalRequests") }}
      </h1>
      <Search
        :query="searchQuery"
        @search="setSearchQuery"
      />
    </div>
    <TabsBadges
      :first-tab="activeTab"
      :labels="statusText"
      :tabs-data="tabsData"
      @setPath="setPath"
    />
    <Loader v-if="isLoaderVisible" />
    <template v-if="withdraws !== null">
      <Table
        v-if="withdraws.length > 0"
        ref="table"
        v-slot="{ sortedRows }"
        :headers="headers"
        :rows="withdraws"
        :total="quantity"
        :per-page="limit"
        :pagination="true"
        @load="getWithdraws"
        @getData="getWithdrawsPagination"
      >
        <WithdrawsRow
          v-for="withdraw in sortedRows"
          :key="withdraw.id"
          :withdraw="withdraw"
          @resolve="showResolveWithdrawDialog"
        />
      </Table>
    </template>
    <p
      v-else
      class="lg:text-xl xs:text-md text-gray-500 lg:mt-5 max-w-3xl xs:mt-3"
    >
      {{ $t("withdraws.noRequests") }}
    </p>
    <Dialog
      v-model="resolvedWithdrawDialog"
      :heading="$t(resolvedWithdrawDialogHeading)"
      :text="$t('withdraws.confirmingAfterAction')"
      class-custom="max-w-lg"
      :error="false"
      :is-icon="false"
      @hide="resolvedWithdrawDialog = false"
    >
      <div class="mt-6 flex space-x-3">
        <Button
          view-color="white"
          class="w-1/2"
          @click="resolvedWithdrawDialog = false"
        >
          {{ $t("button.cancel") }}
        </Button>
        <Button
          :loading="!!resolvingWithdraw"
          view-color="primary"
          class="w-1/2"
          @click="resolveWithdraw"
        >
          {{ $t(resolvedWithdrawStatus === 'approve' ? "button.bringOut" : "button.reject") }}
        </Button>
      </div>
    </Dialog>
  </div>
</template>

<script>

import Search from 'src/components/extends/search/search.vue'
import Table from 'src/components/extends/table/table.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import WithdrawsRow from 'src/components/helper/page-withdraws/withdraws-row/withdraws-row.vue'
import readNewNotifications from 'src/mixins/readNewNotifications.vue'
import TabsBadges from 'src/components/extends/tabs-badges/tabs-badges-new.vue'
import Loader from 'src/components/extends/loader/loader.vue'

export default {
  name: 'Withdraws',
  components: {
    Search,
    Table,
    Dialog,
    Loader,
    WithdrawsRow,
    TabsBadges,
  },
  mixins: [readNewNotifications],
  data() {
    return {
      activeTab: 'open',
      tabsData: null,
      withdraws: [],
      limit: 20,
      quantity: null,
      resolvedWithdrawDialog: false,
      isLoaderVisible: true,
      resolvedWithdrawId: null,
      resolvedWithdrawStatus: null,
      resolvingWithdraw: false,
      searchQuery: null,
      currentPage: 1,
      statusText: {
        open: {
          text: 'withdraws.open',
        },
        close: {
          text: 'withdraws.solved',
        },
      },
    }
  },
  computed: {
    headers() {
      return [
        { label: 'ID' },
        { label: 'headers.nickname' },
        { label: 'headers.login' },
        { label: 'headers.amount' },
        { label: 'headers.detailsUser' },
        { label: this.activeTab === 'open' ? '' : 'headers.status' },
      ]
    },
    resolvedWithdrawDialogHeading() {
      return this.resolvedWithdrawStatus === 'approve'
        ? 'withdraws.withdrawFunds'
        : 'withdraws.rejectRequest'
    },
  },
  watch: {
    activeTab() {
      this.currentPage = 1
      this.searchQuery = ''
      this.updateWithdraws()
    },
    searchQuery() {
      this.currentPage = 1
      this.updateWithdraws()
    },
  },
  mounted() {
    if (this.$route.query.tab) this.setPath(this.$route.query.tab ? this.$route.query.tab : 'open')
    this.readNewNotifications()
    this.getWithdraws()
  },

  methods: {
    setSearchQuery(query) {
      this.searchQuery = query
    },
    setPath(type) {
      this.activeTab = type
      this.offset = 0
    },
    updateWithdraws() {
      this.withdraws = null
      this.getWithdraws()
    },
    showResolveWithdrawDialog(id, result) {
      this.resolvedWithdrawId = id
      this.resolvedWithdrawStatus = result
      this.resolvedWithdrawDialog = true
    },
    getWithdrawsPagination(value) {
      this.currentPage = value
      this.getWithdraws()
    },
    async getWithdraws() {
      this.isLoaderVisible = true
      const query = this.searchQuery

      const lastWithdrawId = this.withdraws !== null && this.withdraws.length
        ? this.withdraws[this.withdraws.length - 1].id
        : null
      try {
        const { data: { data, message } } = await this.$instance({
          url: 'deposit/removing/list',
          data: {
            limit: this.limit,
            filter: this.activeTab,
            ...(lastWithdrawId ? { id: lastWithdrawId } : {}),
            ...(query ? { query } : {}),
            page: this.currentPage,
          },
        })

        if (data) {
          if (data.requests !== null) {
            this.withdraws = Object.keys(data.requests).map(el => data.requests[el])
          }
          this.quantity =  data.quantity[this.$route.query.tab == 'open' ? 'open' : 'closed']
          this.tabsData = data.quantity
          this.tabsData.close = this.tabsData.closed // TODO: !!!! remove, it should be the same with the request
          this.isLoaderVisible = false
        } else {
          this.isLoaderVisible = false
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    async resolveWithdraw() {
      if (this.resolvingWithdraw) return
      this.resolvingWithdraw = true
      try {
        const { data: { data } } = await this.$instance({
          url: 'deposit/removing/moderate',
          data: {
            id: this.resolvedWithdrawId,
            status: this.resolvedWithdrawStatus,
          },
        })
        this.resolvedWithdrawDialog = false
        this.resolvingWithdraw = false
        this.isLoaderVisible = false
        if (data !== 'approve') {
          this.updateWithdraws()
        }
        // this.$error.show('withdraws.possibleWithdrawal', 'withdraws.noBalance') TODO: no money
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
