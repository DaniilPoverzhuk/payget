<template>
  <div class="requisites-dialog">
    <p class="text-gray-700 dark:text-gray-300">
      {{ text }}
    </p>
    <p
      v-if="!showBtn"
      class="text-lg text-primary text-center font-medium"
    >
      {{ message }}
    </p>
    <div
      v-if="!showBtn"
      class="w-full flex items-center space-x-3 mt-6"
    >
      <Button
        class="whitespace-nowrap w-1/2"
        view-color="white"
        @click="$emit('hide')"
      >
        {{ $t('button.cancel') }}
      </Button>
      <Button
        v-if="!showBtn"
        view-color="primary"
        class="whitespace-nowrap w-1/2"
        @click="goLink"
      >
        {{ $t('button.goOver') }}
      </Button>
    </div>
    <a
      v-if="showBtn"
      class="text-lg text-primary text-center font-medium block"
      :href="message"
      target="_blank"
    >{{ message }}
    </a>
  </div>
</template>

<script>

export default {
  props: {
    message: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    showBtn: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    goLink() {
      window.open(this.message, '_blank')
    },
  },
}
</script>
