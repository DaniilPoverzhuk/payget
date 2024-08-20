<template>
  <div>
    <label
      v-if="label"
      id="listbox-label"
      class="block lg:text-sm text-xs font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}<span v-show="isRequiriedLabel">*</span>
    </label>
    <div
      v-click-outside="
        () => {
          dropDown = false
        }
      "
      class="mt-1 relative"
    >
      <input
        :id="localId"
        v-model="localValue"
        :type="type"
        autocomplete="off"
        class="hidden"
      />
      <button
        class="block h-11 w-full border shadow-none ring-0 rounded-md shadow-sm pl-3 pr-10 py-2 text-left placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary focus:shadow-none"
        :class="classButton"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
        type="button"
        @click.prevent="showList"
      >
        <span class="block truncate text-sm">{{ $t(setText) }}</span>
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
        >
          <!-- <svg
            v-svg
            aria-hidden="true"
            class="h-5 w-5 block"
            :class="{
              'text-red-900 dark:text-red-700': v.$error,
              'text-primary dark:text-primary': dropDown,
              'text-gray-400 dark:text-gray-500': !dropDown,
            }"
            symbol="select"
          ></svg> -->
          <q-icon
            size="sm"
            style="color: #b1b2b9"
            name="mdi-chevron-down"
          ></q-icon>
        </span>
      </button>

      <ul
        v-if="dropDown"
        class="absolute z-10 w-full bg-white dark:bg-dark-c-white shadow-lg max-h-60 rounded-md py-1 text-base border border-primary shadow-none ring-0 overflow-auto placeholder-gray-400"
        tabindex="-1"
        :class="{ 'inset-y-250': upList }"
        role="listbox"
        aria-labelledby="listbox-label"
      >
        <li
          v-for="list in selectList"
          :id="list.value"
          :key="list.value"
          class="text-gray-900 dark:text-white cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary hover:text-white"
          role="option"
          @click.prevent="setActiveOption(list)"
        >
          <span class="font-normal block truncate text-sm">{{
            list.text
          }}</span>
          <span class="font-semibold text-sm" v-if="list.subText">{{
            list.subText
          }}</span>
        </li>
      </ul>
    </div>
    <VError v-if="v.$error" :v="v" :label="label" />
  </div>
</template>

<script>
import VError from 'src/components/extends/v-error/v-error.vue'
import { computed } from 'vue'

export default {
  name: 'VSelect',
  components: {
    VError,
  },
  props: {
    v: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    selectList: {
      type: Array,
      default: null,
    },
    upList: {
      type: Boolean,
      default: false,
    },
    placeholderData: {
      type: Object,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
    activeCurrency: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const isRequiriedLabel = computed(() => props.v.hasOwnProperty('required'))
    return {
      isRequiriedLabel,
    }
  },
  data: () => ({
    placeholder: null,
    activeOption: null,
    dropDown: false,
    placeholderEmpty: {
      text: 'button.choose',
    },
  }),
  computed: {
    localId() {
      return `VInput${`${Math.random()}`.slice(2)}`
    },
    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    classButton() {
      return {
        'border-primary dark:border-primary': this.dropDown && !this.disabled,
        'border-gray-300 dark:border-gray-500 ': !this.dropDown,
        'cursor-not-allowed': this.disabled,
        'text-red-900 dark:text-red-700 border-red-900 dark:border-red-700':
          this.v.$error,
      }
    },
    setText() {
      if (this.localValue) {
        const value = this.selectList.find(
          (el) => el.value + '' === this.localValue + ''
        )
        if (!value) {
          return ''
        }
        return value.text
      }
      if (this.placeholder !== null) {
        return this.placeholder.text
      }
      return ''
    },
  },
  mounted() {
    this.placeholder =
      this.placeholderData !== null
        ? this.placeholderData
        : this.placeholderEmpty
  },
  methods: {
    showList() {
      if (!this.disabled) this.dropDown = true
    },
    setActiveOption(list) {
      this.$emit('select', list)
      this.localValue = list.value
      this.activeOption = list
      this.dropDown = false
    },
  },
}
</script>
<style lang="scss">
button {
  border: inherit;
}
</style>
