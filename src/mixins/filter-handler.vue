<script>

export default {
  data() {
    return {
      filter: {},
      filterIsOpen: false,
      filterState: false,
      filterClearForce: false,
    }
  },
  methods: {
    onFilter(filter) {
      this.filter = filter
      this.filterState = Object.keys(filter).length > 0
      this.filterIsOpen = Object.keys(filter).length > 0
      this.filterClearForce = false
      this.rows = null

      this.filtered()
    },
    toggleFilter(stateFilter) {
      this.filterIsOpen = stateFilter
    },
    closeFilter() {
      this.toggleFilter(false)
    },
    clearFilter() {
      this.filterClearForce = true
      this.filterState = false
    },
  },
}
</script>
