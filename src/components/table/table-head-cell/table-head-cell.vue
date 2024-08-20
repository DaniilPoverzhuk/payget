<template lang="pug">
th.table__th
  span.table__sort-toggle.flex(
    v-if='cell.filter'
    :class='toggleClass'
    @click='filterTable'
  )  {{ $t( cell.label) }}
  span.table__sort-toggle.flex(
    v-else-if='cell.value'
    :class='toggleClass'
    @click='sortTable'
  ) {{ $t( cell.label) }}
  div(
    v-else-if="cell.section !== 'control'"
    :class="{'flex items-center': cell.show}"
  ) {{ $t( cell.label) }}
    svg(
      v-if="cell.show"
      v-svg
      size="24"
      symbol="chevron-down"
      class="text-gray-50"
    )
  Hint(
    v-if="cell.section === 'control' && cell.text"
    :hint="cell.text"
    :svgDefault="false"
    class="inline-block"
  )
    svg(
      v-svg
      size="24"
      :symbol="cell.label"
      class="w-6 h-6 text-gray-400 fill-current"
    )
</template>

<script>
import Hint from 'src/components/dynamic-hint/dynamic-hint.vue'

export default {
  name: 'TableHeadCell',
  components: {
    Hint,
  },
  props: {
    cell: {
      type: Object,
      required: true,
    },
    sortBy: {
      type: String,
      default: null,
    },
    sortDirection: {
      type: Number,
      default: null,
    },
    filter: {
      type: String,
      default: null,
    },
  },
  computed: {
    toggleClass() {
      const { filter, value } = this.cell
      const prefix = 'table__sort-toggle_'

      if (value && value === this.sortBy) {
        return this.sortDirection === 1 ? `${prefix}desc` : `${prefix}asc`
      }

      if (filter) {
        if (filter[0] === this.filter) {
          return `${prefix}desc`
        }
        if (filter[1] === this.filter) {
          return `${prefix}asc`
        }
        return ''
      }

      return ''
    },
  },
  methods: {
    filterTable() {
      const [desc, asc] = this.cell.filter

      if (!this.filter || ![desc, asc].includes(this.filter)) {
        this.$emit('filter', desc)
      } else if (this.filter === desc) {
        this.$emit('filter', asc)
      } else {
        this.$emit('filter', null)
      }
    },
    sortTable() {
      this.$emit('sort', this.cell.value)
    },
  },
}
</script>
