<template>
  <component
    :is="to ? 'router-link' : 'UiButton'"
    :class="[stateBtn, isDisabled]"
    class="relative flex justify-center items-center"
    :to="to"
    :disabled="disabled"
    :type="buttonType"
  >
    <!-- :disabled="disabled || loading" -->
    <svg
      v-if="loading"
      v-svg
      class="w-6 h-6 absolute animate-spin border border-transparent"
      :class="{
        'text-white': viewColor === 'primary',
        'text-primary': viewColor === 'primary',
      }"
      symbol="spinner"
    ></svg>
    <svg v-if="icon" v-svg class="mr-3.5 h-5 w-5" :symbol="icon"></svg>
    <span class="inline-flex" :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </component>
</template>

<script>
import UiButton from './ui-button.vue'
export default {
  name: 'Button',
  components: {
    UiButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    viewColor: {
      type: String,
      // required: true,
    },
    icon: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    reset: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '',
    },
    submit: {
      type: Boolean,
      default: false,
    },
    to: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'button',
    },
    wide: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    typeBtn: {
      primary:
        'shadow-base flex justify-center py-2 px-4 rounded-md  font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-primary-dark',
      secondary:
        'shadow-base flex justify-center py-2 px-4 rounded-md  shadow-sm font-medium text-gray-700 bg-secondary-400 hover:bg-secondary-600 focus:outline-none focus:ring-primary-dark',
      white:
        'shadow-sm flex justify-center items-center py-2 px-4 rounded-md  shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-200 focus:outline-none focus:ring-primary-dark border border border-gray-300 dark:border-gray-500',
      grey: 'py-2 px-4 rounded-md  shadow-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-primary-dark border border border-gray-100',
    },
  }),
  computed: {
    stateBtn() {
      return {
        [this.typeBtn[this.viewColor]]: this.viewColor,
        'opacity-70': this.disabled,
      }
    },
    buttonType() {
      if (this.to) return null
      if (this.submit) return 'submit'
      if (this.reset) return 'reset'
      return 'button'
    },
    isDisabled() {
      return {
        disabled: this.disabled || this.loading,
      }
    },
    // buttonClass() {
    //   return {
    //     [`button_type_${this.type}`]: this.type,
    //     [`button_size_${this.size}`]: this.size,
    //     button_wide: this.wide,
    //     button_loading: this.loading,
    //   }
    // },
  },
}
</script>

<style lang="scss">
.button {
  display: inline-block;
  min-width: 110px;
  padding: 15px;
  border-radius: var(--bdrs-default);
  color: var(--c-white-2);
  font-size: var(--fz-sm);
  line-height: var(--lh-sm);
  text-align: center;
  font-weight: 700;
  text-decoration: none;
  background-color: var(--c-primary);
  outline: none;
  box-shadow: 0 4px 14px rgba(154, 79, 212, 0.58);
  transition-property: background-color, box-shadow;
  transition-duration: var(--t);
  .animate-spin {
    position: absolute;
    top: calc(50% - 12px);
    left: calc(50% - 12px);
    display: block;
    width: 24px;
    height: 24px;
  }

  &:disabled {
    opacity: 0.4;
  }

  &:not(:disabled) {
    cursor: pointer;
  }

  &:not(:disabled):hover,
  &:not(:disabled):focus {
    background-color: var(--c-primary-dark);
  }

  &:not(:disabled):active {
    box-shadow: none;
  }

  &_type_success {
    color: var(--c-gray-80-2);
    background-color: var(--c-secondary);
    box-shadow: none;

    &:not(:disabled):hover,
    &:not(:disabled):focus,
    &:not(:disabled):active {
      background-color: var(--c-secondary-dark);
    }
  }

  &_type_info {
    color: var(--c-gray-80);
    background-color: var(--c-gray-10);
    box-shadow: none;

    &:not(:disabled):hover,
    &:not(:disabled):focus {
      background-color: var(--c-gray-15);
    }

    &:not(:disabled):active {
      background-color: var(--c-bg);
    }
  }

  &_size_sm {
    padding: 10px 20px;
    font-size: var(--fz-xs);
    min-width: 0;
  }

  &_size_small {
    padding: 10px 20px;
    min-width: 0;
    @media (max-width: 720px) {
      padding: 1px 20px;
      font-size: var(--fz-xs);
    }
  }

  &_size_lg {
    display: block;
    width: 100%;
    padding: 15px 20px;
    font-size: var(--fz-lg);
  }

  &_size_m {
    padding: 10px 25px;
    font-size: var(--fz-xs);
    min-width: 0;
  }

  &_wide {
    width: 100%;
    min-width: 0;
  }

  &_loading {
    position: relative;
    color: transparent;
  }

  @media (min-width: 1200px) {
    min-width: 156px;

    &_size_m,
    &_size_sm,
    &_wide {
      min-width: 0;
    }
  }
}

.button__icon {
  display: inline-block;
  margin-top: calc(var(--lh-sm) * 0.5em - 12px);
  margin-right: 8px;
  margin-bottom: calc(var(--lh-sm) * 0.5em - 12px);
  vertical-align: top;
  fill: currentColor;

  .button_type_info & {
    fill: var(--c-gray-20);
  }
}

.button__spinner {
  position: absolute;
  top: calc(50% - 12px);
  left: calc(50% - 12px);
  display: block;
  width: 24px;
  height: 24px;
  animation-name: rotate;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  border: 1px solid transparent;
  fill: var(--c-white-2);

  .button_type_success & {
    fill: var(--c-gray-80-2);
  }

  .button_type_info & {
    fill: var(--c-gray-80);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
