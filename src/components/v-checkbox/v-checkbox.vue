<template lang="pug">
div
  input(
    class="v-input__input-checkbox"
    :name="name"
    type="checkbox"
    :value="val"
    :id="`${name}-${val}`"
    v-model="model"
  )
  label(:for="`${name}-${val}`") {{ label }}
</template>

<script>
export default {
  name: 'VCheckbox',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: '',
    },
    val: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: () => '',
    },
  },
  computed: {
    model: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
  },
}
</script>

<style type="text/css">
.v-input__input-checkbox {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

/* stylelint-disable selector-max-type,declaration-property-value-whitelist */

/* stylelint-disable function-url-scheme-blacklist */

.v-input__input-checkbox + label {
  display: inline-flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
}

.v-input__input-checkbox + label::before {
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  flex-grow: 0;
  border: 1.2px solid var(--c-gray-20);
  border-radius: 2px;
  margin-right: 11px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 50% 50%;
}

.v-input__input-checkbox:checked + label::before {
  border-color: #9a4fd5;
  background-color: #9a4fd5;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='8' viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 3.00011L4.125 5.62511L8.50021 1.25' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-size: 8px 7px;
}
</style>
