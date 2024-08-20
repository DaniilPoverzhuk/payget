<template>
  <div class="transaction">
    <div v-if="buyer && buyer.identifier" class="flex items-center">
      <span class="pr-0.5 text-gray-700 dark:text-gray-300">{{ getShortenIdentifier }}</span>
      <div
        v-if="seller && seller.identifier"
        class="v-input__tooltip-container"
        tabindex="0"
      >
        <span class="v-input__visually-hidden">Info:</span>
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
        @click="copyToClipboard('identifier')"
      >
        {{ $t('button.copy') }}
      </Button>
    </div>
  </div>
</template>

<script>
import Button from '@/components/extends/button/button'

export default {

  name: 'RequisitesTransaction',
  components: {
    Button,
  },
  props: {
    buyer: {
      type: Object,
      default: null,
    },
    seller: {
      type: Object,
      default: null,
    },
  },
  computed: {
    getShortenRequisites() {
      if (this.buyer.requisites.length > 5) {
        const shorten = this.buyer.requisites.substring(0, 5)
        return `${shorten}...`
      }

      return this.buyer.requisites
    },
    getShortenIdentifier() {
      if (this.buyer.identifier.length > 3) {
        const shorten = this.buyer.identifier.substring(0, 3)
        return `${shorten}...`
      }
      return this.buyer.identifier
    },
  },
  methods: {
    copyToClipboard(type) {
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
