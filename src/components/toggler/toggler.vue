<template lang="pug">
div.toggler(
  :class="{'toggler-left': !right, 'toggler-right': right}"
)
  label.toggler__label(
    :class='modelValue && "toggler__label_checked"'
  )
    input.toggler__input(
      :checked='modelValue'
      type='checkbox'
      @change='$emit("update:modelValue", $event.target.checked)'
    )
    span.toggler__label-text(
      v-if='label'
    ) {{ $t(label) }}
    hint.v-input__tooltip-container(
      v-if='hint'
      :hint='hint'
    )
</template>

<script>
import Hint from 'src/components/dynamic-hint/dynamic-hint.vue'

export default {
  name: 'Toggler',
  components: {
    Hint,
  },
  props: {
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
.toggler {
  display: flex;
  min-height: 24px;
  position: relative;
  color: var(--c-gray-70);
  &__label {
    display: block;
    cursor: pointer;

    &::before,
    &::after {
      position: absolute;
      display: block;
      content: '';
      border-radius: var(--bdrs-round);
      height: 24px;
      top: 0;
      transition-property: background, right, left, opacity;
      transition-duration: var(--t);
    }

    &::before {
      background-color: var(--c-gray-15);
      width: 48px;
    }

    &::after {
      background-color: var(--c-white);
      width: 24px;
      box-shadow: 0 4px 12px rgba(3, 13, 39, 0.13);
    }


    &_checked {
      color: var(--c-primary);

      &::before {
        background-color: var(--c-primary);
        opacity: 0.5;
      }

      &::after {
        background-color: var(--c-primary);
      }
    }
  }

  &__input {
    position: absolute;
    opacity: 0;
    visibility: hidden;
  }

  &-left {
    padding-left: 53px;
  }

  &-right {
    padding-right: 53px;
  }
}

.toggler-right {
  & .toggler {
    &__label {

      &::before,
      &::after {
        right: 0;
      }
      &-text {
        padding-right: 10px;
      }
      &::after {
        right: 24px;

      }
      &_checked{
        &::after {
        right: 0;
        }
      }
    }
  }
}

.toggler-left {
  & .toggler {
    &__label {

      &::before,
      &::after {
        left: 0;
      }
      &::after {
        left: 0;
      }
      &-text {
        padding-left: 10px;
      }
      &_checked{
        &::after {
          left: 24px;
        }
      }
    }
  }
}

</style>
