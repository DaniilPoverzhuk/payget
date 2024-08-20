<template>
  <div
    v-if="hint"
  >
    <span class="hidden">Info:</span>
    <svg
      v-if="svgDefault"
      v-svg
      class="w-5 h-5 text-gray-400"
      symbol="information-circle"
      @click="togglePopup"
      @mouseover="isOpen = true"
    />
    <q-tooltip anchor="bottom middle" self="center left">{{hintTooltip}}</q-tooltip>
    <slot></slot>
    <Dialog
      v-model="isOpen"
      @hide="isOpen = false"
      :value="isOpen"
    >
      <span v-html="hint"></span>
    </Dialog>
  </div>
</template>

<script>
import Dialog from 'src/components/dialog/dialog.vue'

export default {
  name: 'Hint',
  components: {
    Dialog,
  },
  props: {
    hint: {
      type: String,
      default: '',
    },
    svgDefault: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isOpen: false,
      hintTooltip: '',
    }
  },
  watch: {
    isOpen (val) {
      this.hintTooltip = val === true ? null : this.hint
    },
  },
  created () {
    this.hintTooltip = this.hint
  },
  methods: {
    togglePopup () {
      // if (this.$matchMedia.mobile) {
      //   this.isOpen = !this.isOpen
      // }

      this.isOpen = !this.isOpen
    },
  },
}
</script>
<style>
.tooltip {
  z-index: 999999;
}
</style>
