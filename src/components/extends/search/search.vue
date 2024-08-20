<template>
  <div
    v-click-outside="blur"
    class="search relative"
  >
    <VInput
      v-model="search"
      :placeholder="placeholder === '' ? $t('nothingFound') : placeholder"
      type="search"
      @input="startSearch"
      @focus="focus"
      @keydown="navigateByResults"
    />
    <ul
      v-if="results && isInputFocused"
      class="absolute top-full w-full z-10 mt-2 bg-white dark:bg-dark-c-white rounded-lg lg:text-gray-900 lg:dark:text-white xs:text-gray-500 dark:xs:text-gray-300 cursor-pointer lg:shadow-lg lg:border lg:border-gray-100 lg:dark:border-gray-800 lg:py-1"
    >
      <template v-if="results.length">
        <li
          v-for="(result, index) in results"
          :key="index"
          class="px-4 py-2 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-800"
          :class="{'lg:hover:bg-gray-100 lg:dark:hover:bg-gray-800': index === highlightedIndex}"
        >
          <router-link
            class="search__link "
            :to="result.url"
          >
            {{ result.text }}
          </router-link>
        </li>
      </template>
      <li
        v-else
        class="px-4 py-2 lg:hover:bg-gray-100 lg:dark:hover:bg-gray-800"
      >
        {{ $t("nothingFound") }}
      </li>
    </ul>
  </div>
</template>

<script>
import VInput from 'src/components/extends/v-input/v-input.vue'

export default {
  name: 'Search',
  components: {
    VInput,
  },
  props: {
    query: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    results: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      search: '',
      searchTimer: null,
      searchQuery: null,
      isInputFocused: false,
      highlightedIndex: 0,
    }
  },
  watch: {
    query() {
      this.search = this.query
    },
  },
  methods: {
    startSearch() {
      clearTimeout(this.searchTimer)

      this.searchTimer = setTimeout(() => {
        if (this.searchQuery === this.search.trim()) return

        this.searchQuery = this.search.trim()
        this.$emit('search', this.searchQuery)
      }, 500)
    },
    focus() {
      this.isInputFocused = true
    },
    blur() {
      this.isInputFocused = false
    },
    navigateByResults(event) {
      if (!this.results) return

      if (event.keyCode === 38) {
        if (this.highlightedIndex === 0) {
          this.highlightedIndex = this.results.length - 1
        } else {
          this.highlightedIndex -= 1
        }
        event.preventDefault()
      }

      if (event.keyCode === 40) {
        if (this.highlightedIndex === this.results.length - 1) {
          this.highlightedIndex = 0
        } else {
          this.highlightedIndex += 1
        }
        event.preventDefault()
      }

      if (event.keyCode === 13) {
        this.$router.push(this.results[this.highlightedIndex].url)
      }
    },
  },
}
</script>
