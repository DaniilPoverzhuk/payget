<template>
  <div class="toggler-icon">
    <label class="toggler-icon__label">
      <svg class="toggler-icon__icon" v-svg :class="modelValue ? 'text-primary' : 'text-gray-400'" size="24" :symbol="svgSymbol"></svg>
      <input class="toggler-icon__input" :checked="modelValue" type="checkbox" @change="$emit('update:modelValue', $event.target.checked)" />
      <span class="toggler-icon__label-text" v-if="label">{{ label }}</span>
      <Hint class="v-input__tooltip-container" v-if="hint" :hint="hint"></Hint>
    </label>
  </div>
</template>

<script>
import Hint from 'src/components/dynamic-hint/dynamic-hint.vue'

export default {
  name: 'Verified',
  components: {
    Hint,
  },
  props: {
    size: {
      type: String,
      default: '24',
    },
    svgSymbol: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
    label: {
      type: String,
      default: null,
    },
    right: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
.toggler-icon {

  &__label {
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    box-sizing: content-box;
  }

  &__input {
    position: absolute;
    opacity: 0;
    visibility: hidden;
    display: block;
  }

  &__icon {
    fill: var(--c-gray-20);
    width: 24px;
    height: 24px;


    &--active {
      fill: var(--c-primary);
    }
  }
}


</style>
