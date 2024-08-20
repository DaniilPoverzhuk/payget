<template lang="pug">
component.button(
  :is='to ? "router-link" : "button"'
  :class='buttonClass'
  :disabled='disabled || loading'
  :loading='loading'
  :to='to'
  :type='buttonType'
)
  svg.button__spinner(
    v-if='loading'
    v-svg
    size='32'
    class="text-primary"
    symbol='spinner'
  )
  svg.button__icon(
    v-if='icon'
    v-svg
    :symbol='icon'
    size='24'
  )
  slot
</template>


<script>
import Button from 'src/components/extends/button/button.vue'
export default {
  name: 'ButtonUi',
  components: {
    Button
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: null,
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
      default: null,
    },
    submit: {
      type: Boolean,
      default: false,
    },
    to: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    wide: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    buttonType() {
      if (this.to) return null
      if (this.submit) return 'submit'
      if (this.reset) return 'reset'
      return 'button'
    },
    buttonClass() {
      return {
        [`button_type_${this.type}`]: this.type,
        [`button_size_${this.size}`]: this.size,
        button_wide: this.wide,
        button_loading: this.loading,
      }
    },
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
