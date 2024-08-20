<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="flex items-center text-gray-500 dark:text-gray-300 text-sm font-medium"
    @click="$emit('click')"
  >
    <svg
      v-svg
      symbol="back-arrow"
      class="h-5 w-5 text-gray-400 dark:text-gray-500 mr-1"
    />
    <slot />
    <span v-if="text">{{ text }}</span>
  </component>
</template>

<script>
export default {
  name: 'LinkBack',
  props: {
    to: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
  },
}
</script>
