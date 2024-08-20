<template>
    <div class="v-input-select" @mousedown.stop="" @touchmove.stop=""><label class="form__input-label" v-if="label" :for="localId">{{ localLabel + (v.hasOwnProperty('required') ? '*' : '') }}</label>
        <div class="relative">
            <div class="v-input-select__input-container"><input class="v-input-select__input" v-model="localValue" step="any" ref="input" :id="localId" :class="{ 'v-input-select__input--prefix' : prefix}" :type="type" :placeholder="!!placeholder ? placeholder : null" @keyup="repplaceValue($event)" @keydown="repplaceValue($event)" @focus="onFocus" @blur="onBlur" />
                <div class="v-input-select__select select" :class="{'v-input-select__select-active' : dropdown}"><button class="select__btn" @click.prevent="dropdown = !dropdown" v-click-outside="() => {dropdown = false}">{{activeCurrency}}<svg class="select__icon" v-svg size="12" symbol="arrow"></svg></button>
                    <div class="select__wrap" v-if="dropdown">
                      <template v-for="(val, key) in currencyList">
                        <div class="select__option" :key="key" v-if="currencyList !== null" :some-data="key" @click="$emit('setCurrency', key, id)" v-html="key"></div>
                      </template>
                    </div>
                </div>
            </div>
            <div class="v-input-select__prefix" v-html="currencyList[activeCurrency]"></div>
        </div>
        <VError v-if="v.$error || !!hint" :v="v" :label="label"></VError>
    </div>
</template>

<script>
import VError from 'src/components/extends/v-error/v-error.vue'

export default {
  name: 'VInputSelect',
  components: {
    VError,
  },
  props: {
    modelValue: {
      type: [String, Boolean, Number],
      default: '',
    },
    v: {
      type: Object,
      default: () => ({}),
    },
    label: { // use
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    prefix: { // use
      type: String,
      default: '',
    },
    activeCurrency: { // use
      type: String,
      default: '',
    },
    currencyList: { // use
      type: Object,
      default: null,
    },
    postfix: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
      validator: val => ['text', 'number'].indexOf(
        val,
      ) !== -1,
    },
  },
  data() {
    return {
      defaultInputPadding: this.borderless ? 10 : 15,
      inputPaddingStyle: null,
      passwordHidden: true,
      dropdown: false,
      inFocus: false,
    }
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    localId() {
      if (this.id) {
        return this.id
      }
      return `VInput${`${Math.random()}`.slice(2)}`
    },
    localLabel() {
      if (this.label) {
        return this.label
      }
      if (this.placeholder) {
        return this.placeholder
      }

      throw new Error('You must have label or placeholder')
    },

  },
  watch: {},

  beforeUnmount() {
    // window.removeEventListener('resize', this.calcPrefixPostfixWidth)
  },

  methods: {
    repplaceValue($event) {
      $event.target.value = $event.target.value.replace(/[^\d\.\,]/, '')
    },
    togglePasswordVisibility() {
      this.passwordHidden = !this.passwordHidden
      this.$refs.input.focus()
    },
    onBlur() {
      this.$emit('blur')
      if (this.v.$touch) this.v.$touch()
      this.inFocus = false
    },
    onFocus() {
      this.$emit('focus')
      this.inFocus = true
    },

    onKeydown(event) {
      this.$emit('keydown', event)
    },
    clearInput() {
      this.$emit('update:modelValue', '')
    },
  },
}
</script>

<style lang="scss">
.form__input-label {
  font-size: 14px;
	font-weight: var(--fw-500);
	color: rgb(55, 65, 81);
	display: inline-block;
}

.v-input-select {
  position: relative;

  &__container {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    font-size: var(--fz-md);
    line-height: var(--lh-md);
    color: var(--c-gray-80);

    &_textarea {
      height: auto;
      min-height: 140px;
    }
  }

  &__input {
    width: 100%;
    height: 50px;
    border: 2px solid var(--c-gray-15);
    border-radius: var(--bdrs-default);
    padding-left: 15px;
    transition-property: border-color;
    transition-duration: var(--t);
    text-overflow: ellipsis;
    display: inline-block;
    background-color: var(--c-white);
    color: var(--c-gray-80);
    line-height: var(--lh-sm);
    appearance: none;
    padding-right: 83px;

    &--prefix {
      padding-left: 36px;
    }


    @supports (-webkit-touch-callout: none) {
      font-size: 16px;
    }

    &::placeholder {
      color: var(--c-gray-20);
      opacity: 1;
    }

    &:hover {
      border: 2px solid var(--c-primary);
    }

    &:focus {
      outline: none;
      border-color: var(--color-gray-80);
    }

    &:disabled {
      opacity: 1;
      cursor: not-allowed;
    }

    &_password {
      padding-right: 40px;
    }

    &_search {
      padding-left: 40px;
    }

    &_textarea {
      resize: none;
      padding: 15px;
      height: auto;
    }

    &_borderless {
      height: 40px;
      padding: 0 10px;
      background-color: transparent;
      border-color: transparent;

      &:hover {
        border-color: var(--c-gray-10);
      }

      &:focus {
        border-color: var(--c-primary);
      }
    }

    &_error,
    &_error:hover,
    &_error:focus {
      border-color: var(--c-alert);
    }
  }

  &__search-icon {
    position: absolute;
    left: 15px;
    width: 17px;
    height: 100%;
  }

  &__password-toggle {
    position: absolute;
    display: flex;
    align-items: center;
    right: 15px;
    height: 100%;
    width: 20px;
    outline: none;
  }

  &__password-toggle:focus-within &__password-icon {
    outline: auto;
  }

  &__label-container {
    width: 100%;
    margin-bottom: 10px;
    font-size: var(--fz-md);
    line-height: var(--lh-sm);
    color: var(--c-gray-70);
    font-weight: 600;
    margin-left: 2px;

    &_error {
      color: var(--c-alert);
    }
  }

  &__label-note {
    font-weight: 400;
    font-size: var(--fz-sm);
  }

  &__tooltip-container {
    display: inline-block;
    margin-left: 5px;
    outline: none;
  }

  &__tooltip-trigger {
    margin-bottom: -2px;
  }

  &__tooltip-container:focus-within &__tooltip-trigger {
    outline: auto;
  }

  &__prefix {
    position: absolute;
    bottom: 12px;
    padding: 0 15px;
    pointer-events: none;
    max-width: 100%;
    color: var(--c-gray-70);
  }

  &__postfix-container {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 15px;
    pointer-events: none;
    max-width: 100%;

    &_borderless {
      padding: 0 10px;
    }
  }

  &__value-before-postfix {
    visibility: hidden;
    max-width: 100%;
  }

  &__postfix {
    color: var(--c-gray-20);
    white-space: pre;

    &_focused {
      color: inherit;
    }
  }

  &__visually-hidden {
    position: absolute;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
  }

  &__select {
    position: absolute;
    right: 0;
    top: 0;

    &-active {
      z-index: 999;
    }
  }

  .select {

    &__icon {
    //border: 1px solid #000; margin-left: 9px;
      fill: var(--c-gray-70);
    }

    &__btn {
      padding: 0 13px;
      height: 46px;
      color: var(--c-gray-70);
      background: var(--c-white);
      margin: 2px;
      border-radius: 0 5px 5px 0;
      border-left: 1px solid var(--c-gray-15);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    &__wrap {
      background: var(--c-white);
      border-radius: 5px;
      box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1);
      transition-duration: var(--t);
      transition-property: background-color;
      background-color: var(--c-white);
      //z-index: 9;
    }

    &__option {
      padding: 10px 20px;
      cursor: pointer;
      color: var(--c-gray-70);

      &:hover {
        color: var(--c-primary);
      }
    }
  }
}
</style>
