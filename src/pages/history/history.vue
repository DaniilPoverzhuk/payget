<template>
  <section class="content">
    <header class="content__header flex items-center">
      <h1 v-if="userName">
        {{ $t('history.userHistoryTitle') }} {{ userName }}
      </h1>
      <h1 v-else>{{ $t('history.dealHistoryTitle') }}</h1>
      <Link
        v-if="isDesktop"
        :isOpen="filterIsOpen"
        :state="filterState"
        v-on:toggleFilter="toggleFilter"
      >
      </Link>
    </header>
    <FilterForm
      v-on:filtered="onFilter"
      v-on:close="closeFilter"
      :list="[
        'date_from',
        'date_to',
        'opponent',
        'type',
        'currency_from',
        'currency_to',
        'status',
      ]"
      :isOpen="filterIsOpen"
      :forceClear="filterClearForce"
      :loading="loading"
    ></FilterForm>
    <div class="content__inner">
      <div class="content__main">
        <Link
          v-if="!isDesktop"
          :isOpen="filterIsOpen"
          :state="filterState"
          v-on:clearFilter="clearFilter"
          v-on:toggleFilter="toggleFilter"
        >
        </Link>
        <div :class="isDesktop ? 'content__right' : 'content__left'">
          {{ $t('history.amountCommissions') }}{{ ` ${sum} BTC` }}
        </div>
        <template v-if="rows"
          ><template v-if="rows.length">
            <Table
              ref="table"
              v-slot="{ sortedRows }"
              :adaptive="true"
              sortBy="date"
              :headers="headers"
              :rows="rows"
              :total="totalQuantity"
              :visible="visibleQuantity"
              @load="getHistoryList"
              :perPage="limit"
              @getData="getHistoryListPagination"
              :pagination="true"
            >
              <HistoryRow
                v-for="deal in sortedRows"
                :headers="headers"
                :deal="deal"
                :key="deal.id"
              ></HistoryRow>
            </Table>
          </template>
          <div class="content__note" v-else-if="userName">
            {{ $t('history.userHasntDeal') }}
          </div>
          <div class="content__note" v-else>{{ $t('history.noDeals') }}</div>
        </template>
      </div>
    </div>
  </section>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Table from 'src/components/table/table.vue'
import Link from 'src/components/filter/link.vue'
import FilterForm from 'src/components/filter/filter.vue'
import FilterHandler from 'src/mixins/filter-handler.vue'
import DesktopResizer from 'src/mixins/desktop-resizer.vue'
import HistoryRow from './history-row/history-row.vue'
import { USER_ROLE } from 'src/constants'

const { mapState: mapUserState, mapMutations: mapUserMutations } =
  createNamespacedHelpers('user')

export default {
  name: 'History',
  components: {
    Table,
    HistoryRow,
    Link,
    FilterForm,
  },
  mixins: [DesktopResizer, FilterHandler],
  data() {
    return {
      headers: [
        { label: 'headers.id.transaction' },
        { label: 'headers.date' },
        { label: 'headers.duration' },
        { label: 'headers.type' },
        { label: 'headers.whomConducted' },
        { label: 'headers.directionAmount' },
        { label: 'headers.status' },
        { label: 'headers.commissions' },
      ],
      rows: null,
      totalQuantity: 0,
      limit: 50,
      searchQuery: null,
      user: null,
      sum: 0.0,
      loading: false,
      currentPage: 1,
    }
  },
  created() {
    this.init({
      viewUserId: null,
    })
  },
  computed: {
    ...mapUserState(['viewUserId', 'role']),
    visibleQuantity() {
      return this.rows ? this.rows.length : 0
    },
    userName() {
      return this.$route.params.name || null
    },
  },
  methods: {
    ...mapUserMutations(['init']),
    search(query) {
      this.searchQuery = query
      this.getHistoryList()
    },
    filtered() {
      this.loading = true
      this.searchResetPagination()
    },
    async getUserId() {
      const {
        data: { data, status, message },
      } = await this.$instance({
        url: 'user/get/data/public',
        data: {
          name: this.userName,
        },
      })

      if (status) {
        this.init({
          viewUserId: data.id,
        })
      } else {
        this.$error.show(message)
      }
    },
    async searchResetPagination() {
      this.currentPage = 1
      const refTable = this.$refs.table
      if (refTable) {
        refTable.setFirstPage()
      }
      await this.getHistoryList()
    },
    async getHistoryListPagination(value) {
      this.currentPage = value
      await this.getHistoryList()
    },
    async getHistoryList() {
      const query = this.searchQuery
      const filterData = Object.assign({}, this.filter)
      if (filterData.currency_to) {
        filterData.currency_to = filterData.currency_to.value ?? undefined
      }
      if (filterData.currency_from) {
        filterData.currency_from = filterData.currency_from.value ?? undefined
      }

      if (!this.viewUserId) {
        await this.getUserId()
      }

      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'user/deal/list',
          data: {
            ...(this.viewUserId && this.role == USER_ROLE.ADMIN
              ? {
                  user_id: this.viewUserId,
                }
              : {}),
            start: (this.currentPage - 1) * this.limit,
            limit: this.limit,
            filter_data: filterData,
            ...(query ? { query } : {}),
            page: this.currentPage,
            hash: true,
          },
        })

        if (status) {
          this.rows = data.list

          this.sum = data.commission_sum || 0
          this.totalQuantity = data.quantity || 0
        } else {
          this.$error.show(message)
        }
        this.loading = false
      } catch {
        this.loading = false
        this.$error.show()
      }

      if (query === this.searchQuery) this.searchQuery = null
    },
  },
}
</script>
