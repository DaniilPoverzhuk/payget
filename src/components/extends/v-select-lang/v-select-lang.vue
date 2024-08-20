<template>
  <div class="select-lang">
    <div
      v-click-outside="
        () => {
          dropDown = false
        }
      "
      class="relative"
    >
      <input
        :id="localId"
        v-model="localValue"
        type="hidden"
        autocomplete="off"
        class="hidden"
      />
      <button
        class="lang-action rounded-md inline-flex items-center lg:justify-center xs:justify-between border border-gray-300 dark:border-gray-500 rounded-lg py-2 px-4"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
        @click.prevent="dropDown = !dropDown"
      >
        <svg v-svg symbol="globe-alt" class="h-5 w-5 text-gray-400 mr-1"></svg>
        <span
          class="block pr-2 text-gray-700 dark:text-gray-300 font-sm"
          v-text="setText()"
        />
        <span class="flex items-center pointer-events-none">
          <svg
            v-svg
            aria-hidden="true"
            class="h-5 w-5 text-gray-700 dark:text-gray-300"
            symbol="chevron-down"
          ></svg>
        </span>
      </button>

      <ul
        v-if="dropDown"
        class="absolute z-10 mt-1 bg-white dark:bg-dark-c-white shadow-lg max-h-60 rounded-lg border border-gray-100 py-1 text-base shadow-lg"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
      >
        <li
          v-for="list in selectList"
          :id="list.value"
          :key="list.value"
          class="whitespace-nowrap text-gray-900 dark:text-white cursor-pointer select-none relative py-2 px-4 hover:bg-gray-100 dark:hover:bg-primary"
          role="option"
          @click.prevent="setActiveOption(list)"
        >
          <span class="font-normal block truncate">{{ list.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapMutations: mapNotificationsMutations } =
  createNamespacedHelpers('notifications')

export default {
  name: 'VSelect',
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    selectList: {
      type: Array,
      default: null,
    },
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
        return this.modelValue || this.placeholderEmpty
      },
      set(value) {
        this.$emit('update:modelValue', value)
        this.setSomeState(['settingsApp', null])
      },
    },
  },
  mounted() {
    this.placeholder = this.placeholderEmpty.text
  },
  methods: {
    ...mapNotificationsMutations(['setSomeState']),
    setText() {
      if (this.localValue) {
        return this.selectList.find((el) => el.value == this.localValue)?.text
      }
      if (this.placeholder !== null) {
        return this.placeholder
      }
    },
    showList() {
      if (!this.disabled) this.dropDown = true
    },
    setActiveOption(list) {
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
  &.lang-action {
    max-height: 40px;
  }
}
</style>
