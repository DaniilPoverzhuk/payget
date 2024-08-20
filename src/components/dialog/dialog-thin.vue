<template lang="pug">
div.dialog-thin(
  v-if='visible'
  :class='dialogClasses'
  :style='`transition-duration: ${animationDuration}ms`'
  ref='dialogThin'
  @keydown='hideOnEscPress'
)
  div.dialog-thin__body(
    v-click-outside='hideOnOutsideClick'
  )
    button.dialog-thin__close-button(
      v-if='closeButton'
      type='button'
      @click='$emit("hide")'
    )
      svg.dialog-thin__close-button-icon(
        v-svg
        symbol='close'
      )
    div.dialog-thin__heading(
      v-if='heading'
    )  {{ $t(heading) }}
    slot
</template>

<script>

// переписать на квазар

// import createFocusTrap from 'focus-trap'
import { createNamespacedHelpers } from 'vuex'

const {
  mapMutations: mapLayoutMutations,
  mapState: mapLayoutState,
} = createNamespacedHelpers('layout')

export default {
  name: 'DialogThin',
  props: {
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
    width: {
      type: String,
      default: null,
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
    // ...mapLayoutState(['backdrop']),
    dialogClasses() {
      return [
        this.dialogActiveClass,
        this.width === 'narrow' && 'dialog-thin_narrow',
      ]
    },
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
    hideOnOutsideClick() {
      if (this.outsideClick) this.$emit('hide')
    },
    hideOnEscPress({ keyCode }) {
      if (keyCode === 27 && this.dialogActiveClass) this.$emit('hide')
    },
    showDialog() {
      this.visible = true
      setTimeout(() => {
        // this.focusTrap = createFocusTrap(this.$refs.dialogThin)
        this.focusTrap?.activate()
        this.dialogActiveClass = 'dialog-thin_active'
      })
    },
    hideDialog() {
      this.focusTrap?.deactivate()
      this.dialogActiveClass = null
      setTimeout(() => {
        this.visible = false
      }, this.animationDuration)
    },
  },
}
</script>

<style lang="scss">
.dialog-thin {
  position: fixed;
  z-index: 100;
  top: 208px;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  overflow: auto;
  transition-property: opacity;
  opacity: 0;
  backface-visibility: hidden;
  -webkit-overflow-scrolling: touch;


  @media (min-width: 1200px) {
    right: calc(50% - 455px);
    left: auto;
    padding: 0 20px;
    top: 0;
  }

  &_active {
    opacity: 1;
  }
}

.dialog-thin__body {
  max-width: 100%;
  margin: auto;
  width: 100%;
  padding: 24px 20px;
  position: relative;
  background-color: var(--c-white);
  box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1), 2px 3px 17px rgba(29, 43, 65, 0.1);
  min-height: 100%;
  overflow: hidden;

  @media (min-width: 1200px) {
    width: 384px;
    padding: 24px 16px;
    min-height: inherit;
    border-radius: var(--bdrs-default);
  }
}

.dialog-thin__close-button {
  position: absolute;
  display: flex;
  top: 27px;
  right: 20px;
  width: 24px;
  height: 24px;
  border-width: 0;
  padding: 0;
  color: var(--c-gray-20);
  cursor: pointer;
  transition-property: color;
  transition-duration: var(--t);

  @media (min-width: 1200px) {
    right: 16px;
  }

  &:hover,
  &:focus {
    color: var(--c-gray-70);
  }
}

.dialog-thin__close-button-icon {
  fill: currentColor;
  display: block;
  margin: auto;
  width: 24px;
  height: 24px;
}

.dialog-thin__action-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 16px -10px 0;

  @media (min-width: 1200px) {
    margin: 16px -13px 0;
  }
}

.dialog-thin__action-list-item {
  margin: 16px 10px 0;

  @media (min-width: 1200px) {
    margin: 26px 13px 0;
  }
}
</style>
