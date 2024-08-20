<template>
  <div class="dispute-transaction lg:flex lg:items-center">
    <template v-if="buyer && seller.identifier">
      <div class="flex items-center">
        <span class="truncate max-w-40 inline-block mr-0.5">{{ buyer.identifier }}</span>
        <div
          class="mr-0.5"
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
          view-color="white"
          class="font-medium text-xs py-0.5 px-1.5"
          @click="copyToClipboard($event, 'identifier')"
        >
          {{ $t('button.copy') }}
        </Button>
      </div>
    </template>
    <span class="text-gray-400text-gray-400 dark:text-gray-500 px-1">&#8212;</span>
    <template v-if="seller && seller.requisites">
      <div class="flex items-center">
        <span class="truncate max-w-40 inline-block mr-0.5"> {{ buyer.requisites }}</span>
        <div
          class="mr-0.5"
          tabindex="0"
        >
          <span class="hidden">Info:</span>
          <svg
            v-svg
            class="w-5 h-5 text-gray-400 dark:text-gray-500"
            symbol="information-circle"
          />
          <q-tooltip anchor="bottom middle" self="center left">{{seller.requisites}}</q-tooltip>
        </div>
        <Button
          view-color="white"
          class="font-medium text-xs py-0.5 px-1.5"
          @click="copyToClipboard($event,'requisites')"
        >
          {{ $t('button.copy') }}
        </Button>
      </div>
    </template>
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
  methods: {
    copyToClipboard(event, type) {
      if (event) {
        event.preventDefault()
      }
      const el = document.createElement('textarea')
      el.value = this.buyer[type]
      document.body.append(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
  },
}
</script>
