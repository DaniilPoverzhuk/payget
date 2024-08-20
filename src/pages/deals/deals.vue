<template>
    <section class="content">
        <header class="content__header">
            <h1>{{ $t('deals.title') }}</h1>
            <Link :isOpen="filterIsOpen" :state="filterState" v-on:clearFilter="clearFilter" v-on:toggleFilter="toggleFilter">
            </Link>
        </header>
        <FilterForm v-on:filtered="onFilter" v-on:close="closeFilter" :list="['date_from','date_to','seller_id','buyer_id','currency_from','currency_to','status']" :isOpen="filterIsOpen" :forceClear="filterClearForce" :loading="loading"></FilterForm>
        <div class="content__inner_column">
            <div class="content__main" v-if="rows">
                <div :class="isDesktop ? 'content__right' : 'content__left'">{{ $t('history.amountCommissions') }}:<span class="font-bold">{{ ` ${ sum } BTC` }}</span></div>
                <Table ref="table" v-if="rows.length" v-slot="{ sortedRows }" :adaptive="true" :headers="headers" :rows="rows" :total="totalQuantity" :visible="visibleQuantity" @load="getDeals" :perPage="limit" @getData="getDealsPagination" :pagination="true">
                    <DealsRow v-for="deal in sortedRows" :headers="headers" :deal="deal" :key="deal.id"></DealsRow>
                </Table>
                <div class="content__note" v-else> {{ $t('deals.nodeals') }}</div>
            </div>
        </div>
    </section>
</template>

<script>
import Table from 'src/components/table/table.vue'
import Link from 'src/components/filter/link.vue'
import FilterForm from 'src/components/filter/filter.vue'
import DesktopResizer from 'src/mixins/desktop-resizer.vue'
import FilterHandler from 'src/mixins/filter-handler.vue'
import DealsRow from 'src/pages/deals/deals-row/deals-row.vue'

export default {
  name: 'Deals',
  components: {
    Table,
    Link,
    DealsRow,
    FilterForm,
  },
  mixins: [DesktopResizer, FilterHandler],
  data() {
    return {
      headers: [
        { label: 'headers.id.transaction' },
        { label: 'deals.date' },
        { label: 'headers.duration' },
        { label: 'conversation.seller' },
        { label: 'conversation.buyer' },
        { label: 'deals.direction' },
        { label: 'headers.status' },
        { label: 'headers.commissions' },
      ],
      rows: null,
      totalQuantity: 0,
      limit: 50,
      sum: 0.0,
      searchQuery: null,
      loading: false,
      currentPage: 1,
    }
  },
  computed: {
    visibleQuantity() {
      return this.rows ? this.rows.length : 0
    },
  },
  methods: {
    search(query) {
      this.searchQuery = query
    },
    searchResetPagination() {
      this.currentPage = 1
      const refTable = this.$refs.table
      if (refTable) {
        refTable.setFirstPage()
      }
      this.getDeals()
    },
    filtered() {
      this.loading = true
      this.searchResetPagination()
    },
    getDealsPagination(value) {
      this.currentPage = value
      this.getDeals()
    },
    async getDeals(isLoaderVisible) {
      if (isLoaderVisible === false) return

      const query = this.searchQuery
      const filterData = this.filter

      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'user/deal/list',
          data: {
            limit: this.limit,
            filter_data: filterData,
            ...(query ? { query } : {}),
            page: this.currentPage,
            hash: true
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
    },
  },
}
</script>
