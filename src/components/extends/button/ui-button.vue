<template>
  <button class="ui-btn" :disabled="disabled">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'UiButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
.dark .ui-btn.bg-white {
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity)) !important;
  &:hover {
    background-color: rgba(229, 231, 235, var(--tw-bg-opacity)) !important;
  }
}
</style>
