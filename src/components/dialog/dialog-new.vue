<template>
<q-dialog v-model="localValue">
  <div class="wrap-dialog bg-white dark:bg-dark-c-white lg:p-6 xs:px-4 xs:py-5 shadow-xl rounded">
    <div
        v-if="isIcon"
        class="w-11 h-11 flex justify-center items-center m-auto rounded-full mb-5"
        :class="errorClass"
      >
        <svg
          v-svg
          class="w-6 h-6 "
          :class="error ? 'text-primary' : 'text-green-600'"
          :symbol="error ? 'exclamation-circle' : 'check'"
        />
      </div>
      <div
        v-if="heading"
        class="text-center text-lg text-gray-900 dark:text-white font-medium"
      >
        {{ heading }}
      </div>
      <div
        v-if="text"
        class="text-center text-sm text-gray-500 dark:text-gray-300 mt-2"
      >
        {{ text }}
      </div>
    <slot />
    <button class="dialog__close-button" v-if="closeButton" type="button" @click="$emit('hide')">
        <svg class="dialog__close-button-icon" v-svg symbol="close"></svg>
    </button>
  </div>
</q-dialog>
</template>

<script>

// переписать на квазар

// import createFocusTrap from 'focus-trap'
import { createNamespacedHelpers } from 'vuex'
import Button from 'src/components/extends/button/button.vue'

const {
  mapMutations: mapLayoutMutations,
  mapState: mapLayoutState,
} = createNamespacedHelpers('layout')

export default {
  name: 'Dialog',
  components: {
    // Button,
  },
  emits: ['hide', 'update:modelValue'],
  props: {
    classCustom: {
      type: String,
      default: 'max-w-384 w-full',
    },
    modelValue: {
      type: Boolean,
      required: false,
      default: false
    },
    outsideClick: {
      type: Boolean,
      default: true,
    },
    closeButton: {
      type: Boolean,
      default: true,
    },
    animationDuration: {
      type: Number,
      default: 250,
    },
    heading: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
    width: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    isIcon: {
      type: Boolean,
      default: true,
    },
    error: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      visible: false,
      dialogActiveClass: null,
      focusTrap: null,
      animatationTransition: null,
    }
  },
  computed: {
    ...mapLayoutState(['backdrop']),
    errorClass() {
      return {
        'bg-gray-100': this.error,
        'bg-green-100 ': !this.error,
      }
    },
    dialogClasses() {
      return {
        'opacity-1 visibility: visible': this.visible,
        'opacity-0 invisible': !this.visible,
        // this.dialogActiveClass,
        // this.dialogActiveClass  {'opacity-1	visibility: visible;',
        // this.width === 'narrow' && 'dialog_narrow',
      }
    },
    localValue: {
      get () {
        return this.modelValue
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  watch: {
    modelValue(value) {
      if (value) {
        this.showDialog()
      } else {
        this.hideDialog()
      }
    },
  },
  methods: {
    ...mapLayoutMutations(['showBackdrop', 'hideBackdrop']),
    stored() {

    },
    hideOnOutsideClick() {
      if (this.outsideClick) this.$emit('hide')
    },
    hideOnEscPress({ keyCode }) {
      if (keyCode === 27 && this.dialogActiveClass) this.$emit('hide')
    },
    showDialog() {
      this.showBackdrop()
      this.visible = true
      setTimeout(() => {
        // this.focusTrap = createFocusTrap(this.$refs.dialog)
        this.focusTrap?.activate()
        this.dialogActiveClass = 'dialog_active'
      })
    },
    hideDialog() {
      this.focusTrap?.deactivate()
      this.hideBackdrop()
      this.dialogActiveClass = null
      setTimeout(() => {
        this.visible = false
      }, this.animationDuration)
    },
  },
}
</script>

<style lang="scss">
.dialog__close-button {
  position: absolute;
  display: flex;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-width: 0;
  padding: 0;
  color: var(--c-gray-20);
  cursor: pointer;
  transition-property: color;
  transition-duration: var(--t);

  &:hover,
  &:focus {
    color: var(--c-gray-70);
  }
}

.dialog__close-button-icon {
  fill: currentColor;
  display: block;
  margin: auto;
  width: 24px;
  height: 24px;
}
.wrap-dialog {
    position: relative;
}
</style>