<!-- <template lang="pug">
div.dialog(
  v-if='visible'
  :class='dialogClasses'
  :style='`transition-duration: ${animationDuration}ms`'
  ref='dialog'
  @keydown='hideOnEscPress'
)
  div.dialog__body(
    :class="classCustom"
    v-click-outside='hideOnOutsideClick'
  )
    button.dialog__close-button(
      v-if='closeButton'
      type='button'
      @click='$emit("hide")'
    )
      svg.dialog__close-button-icon(
        v-svg
        symbol='close'
      )
    div.dialog__heading(
      v-if='heading'
    ) {{ $t(heading) }}
    slot
</template> -->

<template>
  <div class="dialog" v-if="modelValue" :class="dialogClasses" :style="`transition-duration: ${animationDuration}ms`" ref="dialog" @keydown="hideOnEscPress">
    <div class="dialog__body" :class="classCustom" v-click-outside="hideOnOutsideClick">
      <button class="dialog__close-button" v-if="closeButton" type="button" @click="$emit('hide')">
        <svg class="dialog__close-button-icon" v-svg symbol="close"></svg>
      </button>
      <div class="dialog__heading" v-if="heading">{{ $t(heading) }}</div>
      <slot></slot>
    </div>
  </div>
</template>


<script>

// переписать на квазар
// import createFocusTrap from 'focus-trap'
// import focusTrap from 'focus-trap'
import { createNamespacedHelpers } from 'vuex'

const {
  mapMutations: mapLayoutMutations,
  mapState: mapLayoutState,
} = createNamespacedHelpers('layout')

export default {
  name: 'Dialog',
  emits: ['hide'],
  props: {
    classCustom: {
      type: String,
      default: ''
    },
    modelValue: {
      type: Boolean,
      required: true,
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
  mounted() {
    // console.log(this.data)
    // console.log(this.value)
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
    value(modelValue) {
      if (modelValue) {
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
      // this.focusTrap.deactivate()
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
.dialog {
  position: fixed;
  z-index: 101;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  padding: 0 20px;
  overflow: auto;
  transition-property: opacity;
  backface-visibility: hidden;
  -webkit-overflow-scrolling: touch;
  opacity: 1;
  &_active {
    opacity: 1;
  }
}

.dialog__body {
  max-width: 100%;
  margin: auto;
  width: 660px;
  padding: 40px 20px 30px;
  position: relative;
  background-color: var(--c-white);
  border-radius: var(--bdrs-default);

  .dialog_narrow & {
    width: 480px;
  }

  @media (min-width: 1200px) {
    padding: 65px 45px;
  }
}

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

.dialog__heading {
  font-size: var(--fz-h3);
  line-height: var(--lh-sm);
  text-align: center;
  font-weight: 600;

  @media (min-width: 1200px) {
    font-size: var(--fz-h2);
    font-weight: 700;
  }
}

.dialog__action-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 16px -10px 0;

  @media (min-width: 1200px) {
    margin: 16px -13px 0;
  }
}

.dialog__action-list-item {
  margin: 16px 10px 0;

  @media (min-width: 1200px) {
    margin: 26px 13px 0;
  }
}
</style>
