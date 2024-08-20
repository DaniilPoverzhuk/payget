<template>
  <div class="refill w-full mt-7 px-4">
    <div class="lg:flex lg:items-center lg:justify-between xs:mb-5">
      <h1>{{ $t('refill.requests') }}</h1>
      <Search
        :query="searchQuery"
        class="lg:ml-4 xs:mt-4"
        @search="(query) => searchQuery = query"
      />
    </div>
    <TabsBadges
      :first-tab="requestFilter"
      :labels="statusText"
      @setPath="setPath"
    />
    <Table
      v-if="localRequests.length > 0"
      ref="table"
      v-slot="{ sortedRows }"
      :headers="headers"
      :rows="localRequests"
      :total="quantity"
      :visible="visibleQuantity"
      :per-page="limit"
      :pagination="true"
      @load="getRequests"
      @getData="getRequestsPagination"
    >
      <RefillRow
        v-for="request in sortedRows"
        :key="request.id"
        :request="request"
        @remove="removeRow"
        @resolve="showResolveRequestDialog"
      />
    </Table>
    <p
      v-if="localRequests.length == 0"
      class="text-lg mt-3 text-gray-400 dark:text-gray-500"
    >
      {{ $t('withdraws.noRequests') }}
    </p>

    <Dialog
      v-model="resolveRequestDialog"
      :heading="$t(resolveRequestDialogHeading)"
      :error="false"
      :is-icon="false"
      @hide="resolveRequestDialog = false"
    >
      <div class="flex mt-6 space-x-5">
        <Button
          view-color="grey"
          class="w-1/2"
          @click="resolveRequestDialog = false"
        >
          {{ $t('button.cancel') }}
        </Button>
        <Button
          :loading="resolvingRequest"
          view-color="secondary"
          class="w-1/2"
          @click="resolveRequest"
        >
          <template v-if="resolvedRequestStatus === 'approve'">
            {{ $t('button.enroll') }}
          </template>
          <template v-else>
            {{ $t('button.reject') }}
          </template>
        </Button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Search from '@/components/extends/search/search'
import Table from '@/components/extends/table/table'
import Dialog from '@/components/dialog/dialog-new'
import RefillRow from '../../components/helper/page-refill/refill-row/refill-row'
import readNewNotifications from '@/mixins/readNewNotifications'
import TabsBadges from '@/components/extends/tabs-badges/tabs-badges'
import Button from '@/components/extends/button/button'

const { mapState: mapUserState } = createNamespacedHelpers('user')


export default {
  name: 'Refill',
  components: {
    Search,
    Table,
    RefillRow,
    Dialog,
    Button,
    TabsBadges,
  },
  mixins: [readNewNotifications],
  data() {
    return {
      requestFilter: this.$route.query.tab ? this.$route.query.tab : 'waiting_req',
      searchQuery: '',
      requests: null,
      list: null,
      limit: 50,
      quantity: null,
      resolvedRequestId: null,
      resolvedRequestStatus: null,
      resolvingRequest: false,
      resolveRequestDialog: false,
      currentPage: 1,
      statusText: {
        waiting_req: {
          text: 'refill.banking',
        },
        waiting_paid: {
          text: 'refill.awaiting',
        },
        waiting_execute: {
          text: 'refill.pending',
        },
        'all-list': {
          text: 'refill.all',
        },
      },
    }
  },
  mounted() {
    this.readNewNotifications('new_waiting_requisite')
  },
  computed: {
    ...mapUserState(['flags']),
    headers() {
      let lastCell

      switch (this.requestFilter) {
        case 'all-list':
          lastCell = [{ label: 'headers.status' }]
          break
        case 'waiting_paid':
          lastCell = []
          break
        default:
          lastCell = [{ label: '' }]
      }

      return [
        { label: 'ID' },
        { label: 'headers.nickname' },
        { label: 'headers.login' },
        { label: 'headers.amount' },
        { label: 'headers.requisites' },
        ...lastCell,
      ]
    },
    visibleQuantity() {
      return this.localRequests ? this.localRequests.length : 0
    },
    resolveRequestDialogHeading() {
      return this.resolvedRequestStatus === 'approve'
        ? 'refill.sureReject'
        : 'refill.sureDeposit'
    },
    localRequests() {
      if (!this.list) return []

      return this.list
        .filter(item => !!this.requests[item])
        .map(item => this.requests[item])
    },
  },
  watch: {
    '$route.query': function () {
      this.requestFilter = this.$route.query.tab
    },
    searchQuery() {
      this.updateRequests(true)
    },
    requestFilter() {
      // this.$route.query.test
      if (this.filter) {
        this.filter = null
      } else {
        this.updateRequests(true)
      }
    },
    filter(value) {
      this.currentPage = 1
      this.updateRequests()
      if (!value.length) {
        this.$refs.table.setFirstPage()
        this.getRequests()
      }
    },
  },
  created() {
    this.getRequests()
  },
  beforeUnmount() {
    this.leaveRequestsChannel()
  },
  methods: {
    setPath(type) {
      this.requestFilter = type
      this.offset = 0
    },
    setParamsPath(type) {
      if (type !== this.requestFilter) {
        this.$router.push({ query: { tab: type } })
      }
    },
    updateRequests() {
      this.requests = null
      this.list = null
      this.getRequests()
    },
    async getRequestsPagination(value) {
      this.currentPage = value
      await this.getRequests()
    },
    async getRequests(isLoaderVisible) {
      if (isLoaderVisible === false) return

      const query = this.filter
      const lastRequestId = this.localRequests.length
        ? this.localRequests[this.localRequests.length - 1].id
        : null

      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'deposit/supplement/list',
          data: {
            limit: this.limit,
            filter: this.requestFilter,
            ...(this.searchQuery ? { query: this.searchQuery } : undefined),
            ...(lastRequestId ? { id: lastRequestId } : {}),
            // ...(query ? { query } : {}),
            page: this.currentPage,
          },
        })

        if (status) {
          if (query !== this.filter) return
          this.requests = data.requests

          this.list = data.list
          this.quantity = data.list ? data.list.length : 0
          this.joinRequestsChannel()
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    joinRequestsChannel() {
      let channelName

      switch (this.requestFilter) {
        case 'waiting_req':
          channelName = 'DepositReq'
          break
        case 'waiting_paid':
          channelName = 'DepositPaid'
          break
        case 'waiting_execute':
          channelName = 'DepositExec'
          break
        default:
          channelName = 'DepositAll'
      }

      if (window.echo.connector.channels[`private-${channelName}`]) {
        if (this.filter) this.leaveRequestsChannel()
        return
      }

      this.leaveRequestsChannel()

      window.echo.private(channelName)
        .listen('update', (e) => {
          if (this.quantity === this.visibleQuantity
              || channelName === 'DepositAll') {
            this.requests = {
              ...this.requests,
              ...e.requests,
            }
          }
          this.list = e.list
          this.quantity = e.list ? e.list.length : 0
          this.resolveRequestDialog = false
          this.resolvingRequest = false
        })
    },
    leaveRequestsChannel() {
      [
        'DepositReq',
        'DepositPaid',
        'DepositExec',
        'DepositAll',
      ].forEach((channelName) => {
        if (!window.echo.connector.channels[`private-${channelName}`]) return
        window.echo.leave(channelName)
      })
    },
    showResolveRequestDialog(id, result) {
      this.resolvedRequestId = id
      this.resolvedRequestStatus = result
      this.resolveRequestDialog = true
    },
    async resolveRequest() {
      if (this.resolvingRequest) return

      this.resolvingRequest = true

      try {
        const { data: { status, message } } = await this.$instance({
          url: 'deposit/supplement/moderate',
          data: {
            id: this.resolvedRequestId,
            status: this.resolvedRequestStatus,
          },
        })
        this.resolvingRequest = false
        if (!status) {
          this.$error.show(message)
        }
        if (status) this.resolveRequestDialog = false
      } catch {
        this.$error.show()
        this.resolvingRequest = false
      }
    },
    removeRow() {
      this.resolvingRequest = false
      this.resolveRequestDialog = false
    },
  },
}
</script>
