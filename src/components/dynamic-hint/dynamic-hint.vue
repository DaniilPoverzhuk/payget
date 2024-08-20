<template>
  <div v-if="hint">
    <span class="hidden">Info:</span>
    <svg
      v-if="svgDefault"
      v-svg
      class="w-5 h-5 text-gray-400"
      symbol="information-circle"
    />
    <q-tooltip
      anchor="top middle"
      self="bottom middle"
      :offset="[10, 10]"
      max-width="300px"
      ><span v-html="hint || ''"></span
    ></q-tooltip>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'DynamicHint',
  components: {},
  props: {
    hint: {
      required: true,
      type: String,
      default: '',
    },
    svgDefault: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isOpen: false,
    }
  },
  watch: {},
  created() {},
  methods: {},
}
</script>
<style>
.q-tooltip.q-tooltip--style {
  max-width: 300px;
  border-radius: var(--bdrs-default);
  color: var(--c-gray-70);
  font-size: var(--fz-sm);
  line-height: var(--lh-sm);
  background-color: var(--c-white);
  box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1);
  padding: 8px;
}
</style>
