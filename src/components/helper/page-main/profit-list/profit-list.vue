<template>
  <div :class="className">
    <div
      class="flex-shrink-0 flex items-center justify-center h-12 w-12 text-white rounded-full bg-gray-100"
    >
      <svg
        v-svg
        class="flex-shrink-0 h-6 w-6 text-primary"
        aria-hidden="true"
        size="16"
        :symbol="symbol"
      />
    </div>
    <p class="ml-4 text-lg leading-6 font-medium text-gray-900">
      {{  $t(text) }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    className: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    symbol: {
      type: String,
      default: 'thumb-up',
    },
  },
}
</script>
