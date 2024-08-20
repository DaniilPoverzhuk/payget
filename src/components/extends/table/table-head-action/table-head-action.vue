<template>
  <button
    v-if="cell"
    class="flex items-center"
    @click="setFilter"
  >
    <slot />
    <svg
      v-svg
      symbol="chevron-down"
      :class="{
        'text-primary': cell.event.active,
        'text-gray-400 dark:text-gray-500': !cell.event.active,
        'rotate-180': cell.event.sort === 'desc',
      }"
      class="w-5 h-5 ml-2 fill-current flex-shrink-0 transform transition-transform duration-500"
    />
  </button>
</template>

<script>
export default {
  name: 'TableHeadCell',
  props: {
    cell: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  methods: {
    setFilter() {
      const sort = !this.cell.event.sort.length ? 'desc' : this.cell.event.sort === 'desc' ? 'asc' : ''
      this.$emit('cellAction', [this.cell.event.filter, this.index, sort])
    },
  },
}
</script>
