<template>
    <div class="action-section" v-if="dataTab !== null && dataTab.id == requestFilter">
        <slot></slot>
    </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    dataTab: {
      type: Object,
      default: null,
    },
    requestFilter: {
      type: String,
      default: '',
    },
  },
}
</script>
