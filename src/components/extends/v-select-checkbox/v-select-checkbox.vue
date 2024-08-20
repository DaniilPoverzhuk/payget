<template>
  <div>
    <label
      v-if="label"
      id="listbox-label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>
    <div
      v-click-outside="
        () => {
          dropDown = false
        }
      "
      class="mt-1 relative"
    >
      <button
        class="block h-12 w-full border-2 shadow-none ring-0 rounded-md shadow-sm pl-3 pr-10 py-2 text-left placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary focus:shadow-none"
        :class="classButton"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
        type="button"
        @click.prevent="showList()"
      >
        <span class="block truncate">{{ $t(setText || '') }}</span>

        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
        >
          <svg
            v-svg
            aria-hidden="true"
            class="h-5 w-5 block"
            :class="{
              'text-red-900 dark:text-red-700': v.$error,
              'text-primary dark:text-primary': dropDown,
              'text-gray-400 dark:text-gray-500': !dropDown,
            }"
            symbol="select"
          />
        </span>
      </button>

      <fieldset
        v-if="dropDown"
        class="absolute z-10 mt-1 w-full bg-white dark:bg-dark-c-white shadow-lg max-h-60 rounded-md py-1 border-2 border-primary ring-0 overflow-auto placeholder-gray-400 lg:scrollbar-thin lg:scrollbar lg:scrollbar-thumb-gray-200 lg:dark:scrollbar-thumb-gray-700 lg:scrollbar-track-transparent lg:overflow-y-scroll lg:scrollbar-thumb-rounded-full lg:scrollbar-track-rounded-full"
        tabindex="-1"
        :class="{ 'inset-y-250': upList }"
        role="listbox"
        aria-labelledby="listbox-label"
      >
        <legend class="sr-only">Notifications</legend>

        <div
          v-for="item in list"
          :key="item.value"
          class="relative flex items-start py-2 px-3"
        >
          <div class="flex items-center h-5 cursor-pointer">
            <input
              :id="item.value"
              v-model="localValue"
              aria-describedby="comments-description"
              name="comments"
              :value="item.value"
              type="checkbox"
              class="h-4 w-4 focus:ring-0 focus:outline-none border-gray-300 rounded shadow-none focus:shadow-none focus:ring-offset-0 text-primary"
            />
          </div>

          <label
            :for="item.value"
            class="font-mediumtext-gray-700 ml-2 text-sm font-medium cursor-pointer"
            >{{ $t(item.text) }}</label
          >
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VSelectCheckboxes',
  props: {
    v: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: null,
    },
    upList: {
      type: Boolean,
      default: false,
    },
    placeholderData: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    placeholder: null,
    activeOption: null,
    dropDown: false,
    placeholderEmpty: 'button.choose',
  }),
  computed: {
    localId() {
      if (this.id) {
        return this.id
      }
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
      let text = ''
      this.localValue.forEach((el) => {
        text += `, ${this.$t(
          this.list.find((elList) => elList.value === el).text
        )}`
      })
      if (text) {
        return text.substring(2)
      }
      if (this.placeholder !== null) {
        return this.placeholder
      }
      return ''
    },
  },
  mounted() {
    this.placeholder = this.placeholderData || this.placeholderEmpty
  },
  methods: {
    showList() {
      this.dropDown = !this.dropDown
      // if (!this.disabled) this.dropDown = true
    },
    setActiveOption(list) {
      this.localValue = list.value
    },
  },
}
</script>
<style lang="scss">
button {
  border: inherit;
}
</style>
