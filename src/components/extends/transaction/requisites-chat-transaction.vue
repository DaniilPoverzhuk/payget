<template>
  <div class="chat-transaction flex items-center">
    <div
      v-if="buyer && buyer.identifier"
      class="text-gray-700 dark:text-gray-300 flex items-center"
    >
      {{ getShorten('identifier') }}
      <template v-if="seller && seller.identifier">
        <div
          class="mx-1 flex items-center"
          tabindex="0"
        >
          <span class="hidden">Info:</span>
          <svg
            v-svg
            class="w-5 h-5 text-gray-400 dark:text-gray-500"
            symbol="information-circle"
          />
					<q-tooltip anchor="bottom middle" self="center left">{{seller.identifier}}</q-tooltip>
        </div>
        <Button
          class="whitespace-nowrap mr-0.5 text-xs font-medium"
          view-color="white"
          @click="copyToClipboard($event, 'identifier')"
        >
          {{ $t('button.copy') }}
        </Button>
      </template>
    </div>
    <div class="mx-1.5 w-4 border border-gray-300 dark:border-gray-300" />
    <div class="text-gray-700 dark:text-gray-300 flex items-center">
      <template v-if="seller && seller.requisites">{{ getShorten('requisites') }}

        <div
          class="mx-1 flex items-center"
          tabindex="0"
        ><span class="v-input__visually-hidden">Info:</span>
          <svg
            v-svg
            class="w-5 h-5 text-gray-400 dark:text-gray-500"
            symbol="information-circle"
          />
					<q-tooltip anchor="bottom middle" self="center left">{{seller.requisites}}</q-tooltip>
        </div>
        <Button
          class="whitespace-nowrap mr-0.5 text-xs font-medium w-32"
          view-color="white"
          @click="copyToClipboard($event, 'requisites')"
        >
				<span v-if="copied">{{ $t('button.copied') }}</span>
				<span v-else>{{ $t('button.copy') }}</span>
        </Button>
      </template>
    </div>
  </div>
</template>

<script>

export default {
  name: 'RequisitesChatTransaction',
  props: {
    seller: {
      type: Object,
      default: null,
    },
    buyer: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    copied: false
  }),
  methods: {
    getShorten(type) {
      if (this.buyer[type].length > 3) {
        const shorten = this.buyer[type].substring(0, 3)
        return `${shorten}...`
      }
      return this.buyer[type]
    },
    async copyToClipboard(event, type) {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
      this.copied = true
      const el = document.createElement('textarea')
      el.value = this.buyer[type]
      document.body.append(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      await delay(1500)
      this.copied = false
    },
  },
}
</script>

<style lang="scss" scoped>
.chat-transaction {
	position: relative;
}
</style>
