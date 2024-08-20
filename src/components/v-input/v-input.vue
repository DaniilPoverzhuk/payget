<template>
    <div class="v-input__container" :class="type === 'textarea' && 'v-input__container_textarea'" @mousedown.stop="" @touchmove.stop="">
        <div class="v-input__label-container" :class="{
      'v-input__label-container_error': !!this.v.$error,
      'v-input__visually-hidden': !!this.placeholder || this.hiddenLabel,
    }"><label class="form__input-label" :for="localId">{{ localLabel + (v.hasOwnProperty('required') ? '*' : '') }}<span class="v-input__label-note" v-if="!!labelNote"> {{ labelNote }}</span></label>
            <hint class="v-input__tooltip-container" v-if="hint" :hint="hint"></hint>
        </div>
        <div class="v-input__input-container">
          <select class="v-input__input" v-if="type === 'select'" v-model="localValue" :class="inputClasses" :id="localId" :disabled="disabled" @focus="onFocus" @blur="onBlur">
            <template v-for="(group, index) in list">
            <template v-if="index === 0">
                <template v-for="(option, key) in group.list" :key="key">
                  <option :value="option.value" :disabled="option.disabled || false" :selected="option.selected || false">{{ option.text }}</option>
                </template>
              </template>
                    <optgroup v-else :label="group.label" :key="index">
                      <template v-for="(option, key) in group.list" :key="key">
                          <option :value="option.value" :disabled="option.disabled || false" :selected="option.selected || false">{{ option.text }}</option>
                      </template>
                    </optgroup>
                </template>
                </select><textarea class="v-input__input" v-else-if="type === 'textarea'" v-model="localValue" :class="inputClasses" ref="textarea" :id="localId" :disabled="disabled" :rows="rows" :readonly="readonly" :maxlength="maxlength" :placeholder="!!placeholder ? placeholder : null" @focus="onFocus" @blur="onBlur"></textarea><input class="v-input__input" v-else v-model="localValue" :class="inputClasses" ref="input" :id="localId" :type="resolveType" :disabled="disabled" :style="inputPaddingStyle" :readonly="readonly" :list="localDatalistId" :placeholder="!!placeholder ? placeholder : null" :min="!!min ? min : null" :max="!!max ? max : null" :step="!!step ? step : null" @keydown="onKeydown" @keypress="onKeypress" @focus="onFocus" @blur="onBlur" /><svg class="v-input__search-icon text-gray-400" v-if="type === 'search'" v-svg aria-hidden="true" size="18 17" symbol="search"></svg>
            <div class="absolute bg-primary right-0 cursor-pointer rounded-md px-5 py-2.5" v-if="clearButton && localValue" @click="$emit('clearValue')"><svg class="text-white" v-svg aria-hidden="true" size="18 17" symbol="close-new"></svg></div><button class="v-input__password-toggle" v-if="type === 'password'" type="button" @click="togglePasswordVisibility"><svg class="v-input__password-icon" v-if="passwordHidden" v-svg aria-hidden="true" size="24" symbol="eye"></svg><svg class="v-input__password-icon" v-else v-svg aria-hidden="true" size="24" symbol="eye-off"></svg>
                <div class="v-input__visually-hidden">{{ passwordHidden ? 'Show password' : 'Hide passwordg' }}</div>
            </button>
            <div class="v-input__prefix-container" v-if="prefix">
                <div class="v-input__prefix" ref="prefix">{{ prefix }}</div>
            </div>
            <div class="v-input__postfix-container" :class="borderless && 'v-input__postfix-container_borderless'" :style="inputPaddingStyle" v-if="postfix" aria-hidden="true">
                <div class="v-input__value-before-postfix">{{ localValue }}</div>
                <div class="v-input__postfix" :class="inFocus && 'v-input__postfix_focused'" ref="postfix">{{ ` ${postfix}` }}</div>
            </div>
        </div>
        <p class="text-sm text-gray-500 pt-2" v-if="underLabel && disabled">{{$t(underLabel)}}</p>
        <VError v-if="v.$error || !!hint" :v="v" :label="label"></VError><datalist v-if="datalist.length" :id="localDatalistId">
            <option v-for="item in datalist" :key="item" :value="item"></option>
        </datalist>
        <slot></slot>
    </div>
</template>

<script>
import Hint from 'src/components/dynamic-hint/dynamic-hint.vue'
import VError from './v-error/v-error.vue'

export default {
  name: 'VInput',
  components: {
    Hint,
    VError,
  },
  props: {
    value: {
      type: [String, Boolean, Number],
      default: '',
    },
    v: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'text',
      validator: val => ['text', 'number', 'password', 'email', 'search', 'textarea', 'select'].indexOf(
        val,
      ) !== -1,
    },
    label: {
      type: String,
      default: '',
    },
    labelNote: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
    postfix: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 7,
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
    datalistId: {
      type: String,
      default: '',
    },
    maxlength: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER,
    },
    datalist: {
      type: Array,
      default: () => [],
    },
    hiddenLabel: {
      type: Boolean,
      default: false,
    },
    min: {
      type: String,
      default: '',
    },
    max: {
      type: String,
      default: '',
    },
    step: {
      type: String,
      default: '',
    },
    borderless: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => [],
    },
    underLabel: {
      type: String,
      default: '',
    },
    clearButton: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      defaultInputPadding: this.borderless ? 10 : 15,
      inputPaddingStyle: null,
      passwordHidden: true,
      inFocus: false,
    }
  },
  computed: {
    localValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
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
        return this.$t(this.placeholder)
      }

      throw new Error('You must have label or placeholder')
    },
    localDatalistId() {
      if (this.datalistId) {
        return this.datalistId
      }

      if (!this.list.length) {
        return undefined
      }

      return `VInputList${`${Math.random()}`.slice(2)}`
    },
    resolveType() {
      if (this.type === 'password') {
        if (this.passwordHidden) {
          return 'password'
        }
        return 'text'
      }
      return this.type
    },
    inputClasses() {
      return {
        'v-input__input_error': !!this.v.$error,
        'v-input__input_password': this.type === 'password',
        'v-input__input_search': this.type === 'search',
        'v-input__input_textarea': this.type === 'textarea',
        'v-input__input_select': this.type === 'select',
        'v-input__input_borderless': this.borderless,
        '!text-gray-400 hover:!border-gray-15': this.underLabel,
      }
    },
  },
  watch: {
    prefix() {
      this.calcPrefixPostfixWidth()
    },
    postfix() {
      this.calcPrefixPostfixWidth()
    },
  },
  mounted() {
    window.addEventListener('resize', this.calcPrefixPostfixWidth)
    this.calcPrefixPostfixWidth()
    if (this.percent) {
      this.defaultInputPadding = 20
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calcPrefixPostfixWidth)
  },
  methods: {
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
    onKeypress(event) {
      if (event.target.type !== 'number' ||
        (event.which === 46) ||
        (event.which === 13) ||
        (event.which === 45) ||
        (event.which >= 48 && event.which <= 57)) return

      event.preventDefault()
    },
    onKeydown(event) {
      this.$emit('keydown', event)
    },
    clearInput() {
      this.$emit('input', '')
    },
    async calcPrefixPostfixWidth() {
      await this.$nextTick()
      this.inputPaddingStyle = {
        ...(this.prefix ? {
          paddingLeft: `${this.$refs.prefix.clientWidth +
          this.defaultInputPadding - 3}px`,
        } : {}),

        ...(this.postfix ? {
          paddingRight: `${this.$refs.postfix.clientWidth +
          this.defaultInputPadding}px`,
        } : {}),
      }
    },
  },
}
</script>

<style lang="scss">
.form__input-label {
  font-size: var(--fz-xms);
}

.dark .v-input__input_error,
.dark .v-input__input_error:hover,
.dark .v-input__input_error:focus{
  border-color: var(--c-alert);
}

.v-input {
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

  &__input-container {
    position: relative;
  }

  &__input {
    width: 100%;
    height: 50px;
    border: 2px solid var(--c-gray-15);
    border-radius: var(--bdrs-default);
    padding: 0 15px;
    transition-property: border-color;
    transition-duration: var(--t);
    text-overflow: ellipsis;
    display: inline-block;
    background-color: var(--c-white);
    color: var(--c-gray-80);
    line-height: var(--lh-sm);
    appearance: none;

    @supports (-webkit-touch-callout: none) {
      font-size: 16px;
    }

    &::placeholder {
      color: var(--c-gray-20);
      opacity: 1;
    }

    &:hover {
      box-shadow: none;
      border: 2px solid var(--c-primary);
    }

    &:focus {
      box-shadow: none;
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
      height:37px;
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

    &_select {
      appearance: none;
      background-image: url('../../assets/img/select-arrow.svg');
      background-repeat: no-repeat;
      background-position: top 50% right 12px;
      border-color: transparent;
      box-shadow: 0 1px 4px rgba(29, 43, 65, 0.1);
      transition-property: box-shadow;
      transition-duration: var(--t);
      padding-right: 30px;
      background-size: 11px;

      &:hover,
      &:focus {
        border-color: transparent;
        box-shadow: 0 2px 8px rgba(29, 43, 65, 0.2);
      }

      /* stylelint-disable selector-max-type, selector-pseudo-class-no-unknown */

      option:disabled {
        display: none;
      }

      /* stylelint-enable */
    }

    &_error,
    &_error:hover,
    &_error:focus {
      border-color: var(--c-alert);
      box-shadow: none;
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
    font-weight: 600;
    font-size: var(--fz-xms);
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

  &__prefix-container {
    position: absolute;
    bottom: 0;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 15px;
    pointer-events: none;
    max-width: 100%;
  }

  &__postfix-container {
    position: absolute;
    bottom: 0;
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
    font-size: 15px;
    line-height: 18px;
    margin-left: 4px;

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
}
</style>
