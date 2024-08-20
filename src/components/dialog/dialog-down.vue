<template lang="pug">
.dialog-down(
  v-if='visible'
  :class='dialogClasses'
  :style='`transition-duration: ${animationDuration}ms`'
  ref='dialog'
  @keydown='hideOnEscPress'
)
  .dialog-down__body(
    :class="classCustom"
    v-click-outside='hideOnOutsideClick'
  )
    button.dialog-down__close-button(
      v-if='closeButton'
      type='button'
      @click='$emit("hide")'
    )
      svg.dialog-down__close-button-icon(
        v-svg
        symbol='close'
      )
    .dialog-down__heading(
      v-if='heading'
    ) {{ heading }}
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
  name: 'Dialog',
  props: {
    classCustom: {
      type: String,
      default: ''
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
    ...mapLayoutState(['backdrop']),
    dialogClasses() {
      return [
        this.dialogActiveClass,
        this.width === 'narrow' && 'dialog_narrow',
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
    ...mapLayoutMutations(['showBackdrop', 'hideBackdrop']),
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
        // this.focusTrap.activate()
        this.dialogActiveClass = 'dialog_active'
      })
    },
    hideDialog() {
    //   this.focusTrap.deactivate()
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
.dialog-down {
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  overflow: auto;
  transition-property: opacity;
  opacity: 0;
  backface-visibility: hidden;
  -webkit-overflow-scrolling: touch;
  background-color: rgba(19, 3, 30, 0.75);

  &.dialog_active {
    opacity: 1;
  }

  &__body {
    max-width: 100%;
    margin-top: auto;
    width: 100%;
    padding: 24px 20px;
    position: relative;
    background-color: var(--c-white);
    height: 100%;

    @media (min-width: 1200px) {
      height: auto;
    }

    .dialog_narrow & {
      width: 480px;
    }

    @media (min-width: 1200px) {
      padding: 24px 50px;
    }
  }
  &__close-button {
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
}


.dialog-down__close-button-icon {
  fill: currentColor;
  display: block;
  margin: auto;
  width: 24px;
  height: 24px;
}

.dialog-down__heading {
  font-size: var(--fz-h3);
  line-height: var(--lh-sm);
  text-align: center;
  font-weight: 600;

  @media (min-width: 1200px) {
    font-size: var(--fz-h2);
    font-weight: 700;
  }
}

.dialog-down__action-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 16px -10px 0;

  @media (min-width: 1200px) {
    margin: 16px -13px 0;
  }
}

.dialog-down__action-list-item {
  margin: 16px 10px 0;

  @media (min-width: 1200px) {
    margin: 26px 13px 0;
  }
}
</style>
