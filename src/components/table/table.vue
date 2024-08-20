<template>
    <div class="table">
        <div class="table__fake" v-show="$matchMedia.mobile" :class="fixedTableHead && 'table__fake_visible'">
            <div class="table__fake-inner" ref="fakeTableWrapper">
                <table class="table__table table__table_fake" ref="fakeTable">
                    <thead :class="{'adaptive': adaptive}">
                        <tr>
                            <TableHeadCell class="table__th_fixed" v-for="(cell, index) in filterHeadres" :cell="cell" :key="index" :filter="filter" :sortBy="sortBy" :sortDirection="sortDirection" @filter="(value) => $emit('filter', value)" @sort="sort"></TableHeadCell>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
        <div class="table__main pb-6 shadow-box-shadow-table" ref="tableWrapper">
            <table class="table__table" ref="table">
                <thead :class="{'adaptive': adaptive}">
                    <tr class="shadow-box-shadow-table bg-gray-50 dark:bg-gray-800">
                        <TableHeadCell v-for="(cell, index) in filterHeadres" :cell="cell" :class="thFixedClass" :key="index" :filter="filter" :sortBy="sortBy" :sortDirection="sortDirection" @filter="(value) => $emit('filter', value)" @sort="sort"></TableHeadCell>
                    </tr>
                </thead>
                <tbody>
                    <slot :sortedRows="sortedRows"></slot>
                </tbody>
            </table>
            <Loader v-show="!pagination" v-if="total > visible" v-observe-visibility="sendRequest"></Loader>
        </div>
        <Pagination v-if="pagination" ref="pagination" :count="total" :perPage="perPage" @getData="emitGetData"></Pagination>
    </div>
</template>

<script>
// dalshe
import Loader from 'src/components/loader/loader.vue'
import Pagination from 'src/components/pagination/pagination.vue'
import TableHeadCell from './table-head-cell/table-head-cell.vue'

export default {
  name: 'Table',
  components: {
    Pagination,
    Loader,
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
      default: null,
    },
    visible: {
      type: Number,
      default: null,
    },
    filter: {
      type: String,
      default: null,
    },
    activeTab: {
      type: String,
      default: 'information'
    },
    adaptive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filterHeadres: [],
      sortBy: null,
      sortDirection: 1,
      fixedTableHead: false,
    }
  },
  computed: {
    thFixedClass() {
      return {
        table__th_fixed: this.$matchMedia.desktop && this.fixedTableHead,
      }
    },
    sortedRows() {
      if (!this.sortBy) return this.rows
      return [...this.rows].sort((a, b) => {
        if (a[this.sortBy] < b[this.sortBy]) return -this.sortDirection
        if (a[this.sortBy] > b[this.sortBy]) return this.sortDirection
        return 0
      })
    },
  },
  mounted() {
    const { tableWrapper } = this.$refs

    window.addEventListener('scroll', this.checkTablePosition)
    window.addEventListener('resize', this.syncScrolls)
    tableWrapper.addEventListener('scroll', this.syncScrolls)
    this.calcFakeTableWidths()
    this.filterHeadres = this.headers
  },
  updated() {
    this.calcFakeTableWidths()
  },
  beforeUnmount() {
    const { tableWrapper } = this.$refs

    window.removeEventListener('scroll', this.checkTablePosition)
    window.removeEventListener('resize', this.syncScrolls)
    tableWrapper.removeEventListener('scroll', this.syncScrolls)
  },
  watch: {
    activeTab() {
      this.filterHeadres = this.headers.filter((item) => { return item.section === this.activeTab || item.section === 'all' })
    }
  },
  methods: {
    setFirstPage() {
      this.$refs.pagination.setFirstPage()
    },
    async emitGetData(currentPage) {
      await this.$emit('getData', currentPage)
    },
    sendRequest(isVisible) {
      if (this.pagination) return
      this.$emit('load', isVisible)
    },
    checkTablePosition() {
      const { table } = this.$refs

      if (table.getBoundingClientRect().top > 0 && this.fixedTableHead) {
        this.fixedTableHead = false
        return
      }

      if (table.getBoundingClientRect().top <= 0 && !this.fixedTableHead) {
        this.fixedTableHead = true
      }
    },
    calcFakeTableWidths() {
      if (this.$matchMedia.desktop) return

      const { table, fakeTable } = this.$refs
      const cells = table.querySelectorAll('th')
      const fakeCells = fakeTable.querySelectorAll('th')

      fakeTable.style.width = `${table.offsetWidth}px`
      ;[...cells].forEach((cell, index) => {
        fakeCells[index].style.width = `${cell.offsetWidth}px`
      })
    },
    syncScrolls() {
      if (this.$matchMedia.desktop) return

      const { fakeTableWrapper, tableWrapper } = this.$refs

      fakeTableWrapper.scrollLeft = tableWrapper.scrollLeft
    },
    sort(value) {
      if (value === this.sortBy) {
        if (this.sortDirection === -1) {
          this.sortBy = null
        }

        this.sortDirection = -this.sortDirection
        return
      }

      this.sortDirection = 1
      this.sortBy = value
    },
  },
}
</script>

<style lang="scss">
.table {
  margin: 0 -20px;
  display: block;

  @media (min-width: 1200px) {
    margin: 0;
    width: 100%;
  }
}

.table__fake {
  top: 0;
  position: sticky;
  height: 0;
  z-index: 6;
  opacity: 0;

  &_visible {
    opacity: 1;
  }
}

.table__fake-inner {
  overflow: hidden;
  padding-bottom: 8px;
}

.table__main {
  overflow-x: auto;

  @media (min-width: 1200px) {
    overflow-x: visible;
  }
}

.table__table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
	.adaptive {
		@media (max-width: 1199px) {
			display: none;
		}
	}
}

.table__th {
  padding: 20px 0 20px 10px;
  color: var(--c-gray-70);
  font-size: var(--fz-sm);
  line-height: var(--lh-sm);
  text-align: left;
  font-weight: 400;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    display: block;
    width: 100%;
    height: 8px;
    background-image: var(--table-head-gradient);
    opacity: 0;
  }

  &:last-child {
    padding-right: 20px;
  }

  &_fixed {
    background-color: var(--c-white);

    &::after {
      opacity: 1;
    }
  }

  @media (min-width: 1200px) {
    position: sticky;
    top: 0;
    z-index: 5;
  }
}

.table__sort-toggle {
  cursor: pointer;

  &::after {
    content: '';
    position: relative;
    top: -1px;
    display: inline-block;
    width: 7px;
    height: 4px;
    margin-left: 4px;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    pointer-events: none;
  }

  &_asc::after,
  &_desc::after {
    background-image: url('../../assets/img/table-sort-arrow.svg');
  }

  &_asc::after {
    transform: rotate(180deg);
  }
}

.table__tr {
  transition-property: box-shadow, background-color;
  transition-duration: var(--t);

  &:hover,
  &:focus-within {
    background-color: var(--c-primary-light);
    box-shadow: none;
  }

  &_faded {
    color: var(--c-gray-20);
  }
}

.table__td {
  padding: 20px 0 20px 10px;
  box-shadow: 0 -2px 0 var(--c-gray-10) inset;

  &:last-child {
    padding-right: 20px;
  }

  &_align_top {
    vertical-align: top;
  }
}

.table__link {
  color: var(--c-primary);

  &:hover,
  &:focus {
    color: var(--c-primary-dark);
  }
}

.table__actions {
  display: grid;
  grid-column-gap: 20px;
  justify-content: end;
  grid-auto-flow: column;
}

.table__status {
  &_success {
    color: var(--c-success);
  }

  &_failure {
    color: var(--c-alert);
  }
}
</style>
