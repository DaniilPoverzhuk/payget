<template>
  <div class="radio__item">
    <input class="radio__input" type="radio" :id="id" :name="nameGroup" :value="values" :checked="isChecked" @input="updateParentValue" ref="refsElement" />
    <label class="radio__label" v-if="label" :for="id">{{labelText}}<span v-if="defaultRadio">&nbsp;({{$t('channel.byDefault')}})</span></label>
  </div>
</template>

<script>
export default {
  name: 'Radio',
  props: {
    hint: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      required: true,
    },
    values: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    nameGroup: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
    defaultRadio: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isChecked() {
      return this.values === this.modelValue
    },
    labelText() {
      return this.$t(this.label)
    }
  },
  methods: {
    updateParentValue() {
      this.$emit('update:modelValue', this.$refs.refsElement.value)
    },
  },
}
</script>

<style lang="scss">
.radio__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: -1px;
  clip: rect(0, 0, 0, 0);
}

.radio__label {
  display: inline-block;
  cursor: pointer;
  padding-left: 30px;
  line-height: 1.6;

  span {
    color: var(--c-gray-20);
  }

  .radio__input:checked + & {
    cursor: default;
  }

  /* stylelint-disable property-no-vendor-prefix */

  /* stylelint-disable selector-max-class */

  /* stylelint-disable selector-max-specificity */

  &::before {
    content: "";
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: var(--fz-xl);
    border: 1px solid var(--c-gray-15);
    width: 20px;
    height: 20px;
    position: absolute;
    display: block;
    margin-left: -30px;
    margin-top: 2px;
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    margin-left: -25px;
    margin-top: -18.5px;
    width: 10px;
    height: 10px;
    border-radius: var(--fz-xl);
    background-color: var(--c-transparent);
  }

  .radio__input:checked + &::before {
    border-color: var(--c-primary);
  }

  .radio__input:checked + &::after {
    background-color: var(--c-primary);
  }

  /* stylelint-enable selector-max-class */

  /* stylelint-enable selector-max-specificity */

  /* stylelint-enable property-no-vendor-prefix */
}
</style>
