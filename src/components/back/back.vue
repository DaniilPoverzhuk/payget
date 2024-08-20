<template lang="pug">
div.back
  component.back__link(
    :is='to ? "router-link": "button"'
    :to='to'
    :type='!to && "button"'
    @click='clickButton'
  )
    svg.back__link-icon(
      v-svg
      class='text-gray-300 dark:text-gray-500'
      symbol='back-arrow'
      size='19 9'
    )
    | {{ label }}
</template>

<script>
export default {
  name: 'Back',
  props: {
    to: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      required: true,
    },
  },
  methods: {
    clickButton() {
      if (this.to) return
      this.$emit('click')
    },
  },
}
</script>

<style lang="scss">
.back {
  margin-bottom: 24px;
  font-size: var(--fz-sm);
  line-height: var(--lh-sm);
  width: 100%;
  text-align: left;
}

.back__link {
  color: var(--c-gray-20);
  text-decoration: none;
  cursor: pointer;
  transition-property: color;
  transition-duration: var(--t);

  &:hover,
  &:focus {
    color: var(--c-gray-70);
  }
}

.back__link-icon {
  fill: currentColor;
  display: inline-block;
  margin-right: 20px;
}
</style>
