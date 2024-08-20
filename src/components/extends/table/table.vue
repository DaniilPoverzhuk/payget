<template>
  <div class="w-full">
    <div class="xs:overflow-x-auto">
      <table
        class="w-full pg-table"
      >
        <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <TableHeadCell
              v-for="(cell, index) in headers"
              :key="index"
              :classHeaders="classHeaders"
              :cell="cell"
              :index="index"
              @cellAction="(value) => $emit('cellAction', value)"
            />
          </tr>
        </thead>
        <tbody v-if="!isLoadedContent" class="divide-y divide-gray-200 dark:divide-gray-700">
          <slot :sortedRows="rows" />
        </tbody>
        <slot v-else :sortedRows="rows" />
      </table>
    </div>

    <Pagination
      v-if="pagination"
      class="mt-8 mb-8"
      ref="pagination"
      :short="short"
      :count="total"
      :per-page="perPage"
      @getData="emitGetData"
    />
  </div>
</template>

<script>
// import Loader from 'src/components/loader/loader.vue'
import Pagination from 'src/components/extends/pagination/pagination.vue'
import TableHeadCell from './table-head-cell/table-head-cell.vue'

export default {
  name: 'Table',
  components: {
    Pagination,
    // Loader,
    TableHeadCell,
  },
  props: {
    pagination: {
      type: Boolean,
      default: false,
    },
    perPage: {
      type: Number,
      default: 20,
    },
    rows: {
      type: Array,
      required: true,
    },
    headers: {
      type: Array,
      required: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    classHeaders: {
      type: String,
      default: 'px-6',
    },
    short: {
      type: Boolean,
      default: false,
    },
    isLoadedContent: {
      type: Boolean,
      default: false,
    },

  },
  data() {
    return {
      sortBy: null,
      sortDirection: 1,
      fixedTableHead: false,
    }
  },
  methods: {
    async emitGetData(currentPage) {
      await this.$emit('getData', currentPage)
    },
  },
}
</script>

<style lang="scss">
.pg-table {
	.q-infinite-scroll__loading {
		display: table-row;
	}
}
</style>