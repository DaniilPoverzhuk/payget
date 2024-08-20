<template>
  <div>
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 inline-block"
      :for="localId"
    >{{ label }}<span v-show="isRequiriedLabel">*</span>
    </label>
    <div class="relative mt-1">
      <textarea
        :id="localId"
        ref="textarea"
        v-model="localValue"
        :class="inputClasses"
        :disabled="disabled"
        :rows="rows"
        :readonly="readonly"
        :maxlength="maxlength"
        :placeholder="placeholder ? placeholder : ''"
        class="block shadow-none dark:bg-dark-c-white w-full border-2 outline-none rounded-md pl-3 pr-10 py-2 text-left placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:shadow-none"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>
    <VError
      v-if="v.$error"
      :v="v"
      :label="label"
    />
  </div>
</template>

<script>

import VError from 'src/components/extends/v-error/v-error.vue'
import { computed } from 'vue'

export default {
  name: 'VTextarea',
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
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 7,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: '',
    },
    maxlength: {
      type: Number,
      default: 2000,
    },
  },
  setup(props) {
    const isRequiriedLabel = computed(() => props.v.hasOwnProperty('required'))
    return {
      isRequiriedLabel,
    }
  },
  data: () => ({
    inputPaddingStyle: null,
    inFocus: false,
  }),
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
        'border-red-light text-red-900 dark:border-red-light': this.v.$error,
        'border-gray-300 focus:border-primary dark:border-gray-500 dark:focus:border-primary': !this.v.$error,
      }
    },
  },
  methods: {
    onBlur() {
      this.$emit('blur')
      if (this.v.$touch) this.v.$touch()
      this.inFocus = false
    },
    onFocus() {
      this.$emit('focus')
      this.inFocus = true
    },
    clearInput() {
      this.$emit('update:modelValue', '')
    },
  },
}
</script>
