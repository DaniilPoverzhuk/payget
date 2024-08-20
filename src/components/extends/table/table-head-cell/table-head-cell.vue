<template>
  <th
    class="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
    scope="col"
    :class="classHeaders"
  >
    <component
      :is="cell.event ? 'headAction' : 'span'"
      :index="cell.event ? index : undefined"
      :cell="cell.event ? cell : undefined"
      @cellAction="(value) => $emit('cellAction', value)"
    >
      <template v-if="cell.label">
        {{ $t( cell.label) }}
      </template>
      <Hint
        v-if="cell.hint"
        :hint="$t(cell.hint)"
        :svg-default="false"
        class="inline-block"
      >
        <svg
          v-svg
          :symbol="cell.icon"
          class="w-6 h-6 text-gray-400 fill-current"
        />
      </Hint>
    </component>
  </th>
</template>

<script>
import Hint from 'src/components/dynamic-hint/dynamic-hint.vue'
import headAction from 'src/components/extends/table/table-head-action/table-head-action.vue'

export default {
  name: 'TableHeadCell',
  components: {
    headAction,
    Hint,
  },
  props: {
    cell: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    classHeaders: {
      type: String,
      default: '',
    },
  },
}
</script>
