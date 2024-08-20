<template>
  <div @mousedown.stop="" @touchmove.stop="">
    <div class="flex items-center mb-1">
      <label
        v-if="label"
        class="block text-sm font-medium text-gray-700 dark:text-gray-500 inline-block"
        :for="localId"
        >{{ label }}<span v-show="isRequiriedLabel">*</span></label
      >
      <DynamicHint v-if="hint" :hint="hint" class="inline-block pl-1" />
      <slot name="hint" />
    </div>
    <div class="inputt relative">
      <svg
        v-if="type === 'search'"
        v-svg
        symbol="search"
        class="text-gray-400 w-5 h-5 absolute mt-0.5 top-3 left-3"
      />
      <q-input
        v-if="type !== 'textarea'"
        :readonly="readonly"
        :disable="disabled"
        v-model="localValue"
        outlined
        :dense="false"
        :placeholder="placeholder"
        :error="isError"
        :type="resolveType"
        step="any"
        ref="input"
        :class="{
          input_error: v.$error,
          'search-padding': resolveType == 'search',
        }"
        input-class="bg-transparent appearance-none block w-full px-3 py-2.5 border-2 rounded-md shadow-none text-gray-500 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-primary focus:shadow-none"
      >
        <template v-if="resolveType == 'search'" v-slot:append>
          <q-icon
            v-if="localValue !== ''"
            name="close"
            @click="localValue = ''"
            class="cursor-pointer"
          />
        </template>
      </q-input>
      <!-- <div class="input-errors" v-for="err of v.$errors" :key="err.$uid">
        <div class="mt-2 text-sm text-red-900">{{ err.$message }}</div>
      </div> -->
      <textarea
        v-if="type === 'textarea'"
        :id="localId"
        ref="textarea"
        v-model="localValue"
        class="bg-transparent textarea max-w-lg shadow-sm block w-full focus:ring-primary focus:border-primary sm:text-sm border border-gray-300 dark:border-gray-500 rounded-md shadow-none focus:shadow-none"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        :cols="cols"
        :rows="rows"
        :placeholder="!!placeholder ? placeholder : null"
      />
      <div
        v-if="v.$error"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      ></div>
      <button
        v-if="type === 'password' && !v.$error"
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        @click="togglePasswordVisibility"
      >
        <svg
          v-svg
          class="h-5 w-5 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
          :symbol="passwordHidden ? 'eye-on' : 'eye-off-new'"
        />
      </button>
      <div
        v-if="postfix"
        :style="inputPaddingStyle"
        aria-hidden="true"
        class="postfix absolute top-0 bottom-0 border-2 border-transparent flex items-center p-2 pointer-events-none max-w-full"
      >
        <div class="w-full opacity-0 leading-none">
          {{ localValue }}
        </div>
        &nbsp;
        <span
          ref="postfix"
          class="whitespace-pre leading-none ml-1 mr-2"
          :class="{ inFocus: 'text-gray-900', 'text-gray-400': !inFocus }"
        >
          {{ postfix }}
        </span>
      </div>
    </div>
    <VError v-if="v.$error || !!hint" :v="v" :label="label" />
    <slot name="error" />
  </div>
</template>

<script>
import DynamicHint from 'src/components/dynamic-hint/dynamic-hint.vue'
import VError from 'src/components/extends/v-error/v-error.vue'
import { computed } from 'vue'

export default {
  name: 'VInput',
  components: {
    DynamicHint,
    VError,
  },
  props: {
    val: {
      type: [String, Boolean, Number],
      default: '',
    },
    modelValue: {
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
      validator: (val) =>
        [
          'text',
          'number',
          'password',
          'email',
          'search',
          'textarea',
          'select',
        ].indexOf(val) !== -1,
    },
    label: {
      // use
      type: String,
      default: '',
    },
    labelNote: {
      type: String,
      default: '',
    },
    placeholder: {
      // use
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
      // use
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
    cols: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: () => [],
    },
    hiddenBorder: {
      type: Boolean,
      default: false,
    },
  },
  // emits: ['update:value'],
  setup(props) {
    const newInnerLabel = computed(
      () => props.label + (!props.v.hasOwnProperty('required') ? '' : '*')
    )
    const isRequiriedLabel = computed(() => props.v.hasOwnProperty('required'))
    const isError = computed(() => props.v.$error || false)
    return {
      newInnerLabel,
      isRequiriedLabel,
      isError,
    }
  },
  data: () => ({
    defaultInputPadding: 15,
    inputPaddingStyle: null,
    passwordHidden: true,
    inFocus: false,
    // localValue: null,
    innerLabel: '',
  }),
  computed: {
    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        // this.$emit('input', value)
        this.$emit('update:modelValue', value)
      },
    },
    localId() {
      if (this.id) {
        return this.id
      }
      return `VInput${`${Math.random()}`.slice(2)}`
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
        'border-red-900': this.v.$error,
        'border-gray-300 dark:border-gray-500': !this.v.$error,
        'cursor-not-allowed': this.disabled,
        'pl-9': this.type === 'search',
        'border-transparent pt-1 pb-1': this.hiddenBorder,
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
    this.innerLabel =
      this.label + (!this.v.hasOwnProperty('required') ? '' : '*')
    window.addEventListener('resize', this.calcPrefixPostfixWidth)
    this.calcPrefixPostfixWidth()
    if (this.percent) {
      this.defaultInputPadding = 20
    }
    this.localValue = this.modelValue
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
      if (
        event.target.type !== 'number' ||
        event.which === 46 ||
        event.which === 13 ||
        event.which === 45 ||
        (event.which >= 48 && event.which <= 57)
      ) {
        return
      }

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
        ...(this.prefix
          ? {
              paddingLeft: `${
                this.$refs.prefix.clientWidth +
                20 +
                this.defaultInputPadding -
                3
              }px`,
            }
          : {}),

        ...(this.postfix
          ? {
              paddingRight: `${
                this.$refs.postfix.clientWidth + this.defaultInputPadding
              }px`,
            }
          : {}),
      }
    },
  },
}
</script>

<style>
.q-field {
  height: 48px;
  padding: 0;
  border-radius: 8px;
  /* overflow: hidden; */
}

/* .q-field:active {
    border: 2px solid #9a4fd5;
  } */

.q-field__control {
  height: 48px;
  padding: 0;
  margin: 0;
  border-radius: 8px;
  text-decoration: none;
}

.q-field--auto-height .q-field__control,
.q-field--auto-height .q-field__native {
  min-height: 48px;
}

.q-field--outlined .q-field__control {
  padding: 0;
}

.q-field__control::after {
  border: 1px solid #9a4fd5;
  height: 30px;
}
.q-field--outlined .q-field__control:before {
  border: 2px solid #d1d5db;
}

.q-field__control_container {
  border-color: red;
}

.inputt .textarea {
  min-height: 40px;
}

.q-field__append {
  padding-right: 8px;
  padding-bottom: 8px;
}

/* .input_error {
    border: 2px solid rgb(127, 29, 29)
  } */
.q-field.search-padding .px-3 {
  padding-left: 2.5em;
}
.q-field .q-icon.text-negative {
  --q-negative: #ef4444;
  font-size: 20px;
}
.q-field .q-field__control.text-negative {
  --q-negative: rgb(127, 29, 29);
}
.q-field--outlined.q-field--readonly .q-field__control:before {
  border-style: solid;
}
.q-field--outlined .q-field__control:hover:before {
  border-color: #d1d5db;
}
</style>
