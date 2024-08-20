<template>
  <div>
    <label
      v-if="label"
      :id="localId"
      :class="{ 'text-red-900 dark:text-red-700': v.$error }"
      class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
      >{{ label }}<span v-show="isRequiriedLabel">*</span></label
    >
    <div v-click-outside="onOutside" class="relative rounded-md shadow-sm">
      <input
        :id="localId"
        v-model="localValue"
        :type="type"
        autocomplete="off"
        class="hidden"
      />
      <button
        class="text-sm h-11 text-gray-900 dark:text-white py-2 pl-3 pr-12 border-gray-300 dark:border-gray-500 appearance-none block w-full border-2 rounded-md shadow-none placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-primary focus:shadow-none dark:bg-dark-c-white"
        :class="{ 'border-red-900 dark:border-red-700': v.$error }"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
        @click.prevent="onOpenDropdown"
      >
        <template v-if="activeCurrency !== null">
          <span class="flex items-center text-gray-900">
            <img
              v-if="activeCurrency.image"
              :src="activeCurrency.image"
              class="flex-shrink-0 h-6 w-6 rounded-full mr-3"
            />
            <span class="text-gray-700 dark:text-gray-300"
              >{{ activeCurrency.symbol }}&nbsp;</span
            >
            <span class="text-gray-400 dark:text-gray-500"
              >{{ activeCurrency.name }}
            </span>
          </span>
        </template>
        <span
          class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
        >
          <svg
            v-svg
            aria-hidden="true"
            class="h-5 w-5 block"
            :class="{
              'text-red-900 dark:text-red-700': v.$error,
              'text-primary dark:text-primary': dropDown && !v.$error,
              'text-gray-400 dark:text-gray-500': !dropDown,
            }"
            symbol="select"
          ></svg>
        </span>
      </button>
      <div
        v-if="selectList !== null && dropDown"
        class="listbox absolute max-h-353 overflow-hidden z-10 mt-1 w-full bg-white rounded-md py-1 text-base ring-0 ring-black ring-opacity-5 focus:outline-none shadow-md dark:bg-dark-c-white"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
      >
        <div class="listbox-wrap-overlay z-20" @click="onOutside"></div>
        <div class="listbox-wrap">
          <div class="flex items-center border-b border-gray-200 pl-3">
            <svg
              v-svg
              aria-hidden="true"
              class="h-5 w-5 text-gray-400"
              symbol="search"
            ></svg>

            <input
              id="search"
              v-model="search"
              type="text"
              autocomplete="off"
              class="text-sm h-11 text-gray-900 dark:text-white border-0 appearance-none block w-full rounded-md shadow-none placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:shadow-none dark:bg-dark-c-white"
              :placeholder="$t('button.search')"
            />
          </div>
          <p v-if="Object.keys(listFiltred).length == 0" class="p-3">
            {{ $t('noResults') }}
          </p>
          <ul v-else class="block overflow-y-auto max-h-304">
            <li v-for="(category, key) in listFiltred" :key="key">
              <span
                class="block bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 text-sm py-1 px-4"
              >
                {{ categoryName[key] }}</span
              >
              <ul>
                <template v-for="item in category">
                  <li
                    v-if="item.symbol !== exclude"
                    :id="item.id"
                    :key="item.id"
                    class="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white"
                    role="option"
                    @click.prevent="setActiveOption(item.symbol)"
                  >
                    <div class="relative flex items-center">
                      <!--                  :alt="item.name"-->
                      <img
                        v-if="item.image"
                        :src="item.image"
                        class="absolute flex-shrink-0 h-6 w-6 rounded-full"
                      />

                      <span class="pl-6 font-normal ml-3 inline-block truncate">
                        {{ item.symbol }}
                        <span
                          class="font-normal truncate text-gray-400 dark:text-gray-500"
                          >{{ item.name }}</span
                        >
                      </span>
                    </div>
                    <span
                      v-if="
                        activeCurrency !== null && item.id == activeCurrency.id
                      "
                      class="absolute inset-y-0 right-0 flex items-center pr-4"
                    >
                      <svg
                        v-svg
                        aria-hidden="true"
                        class="h-5 w-5 text-primary"
                        symbol="check"
                      ></svg>
                    </span>
                  </li>
                </template>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <q-dialog v-model="mobileList" full-width position="bottom">
      <q-card style="width: 350px">
        <q-linear-progress :value="1" color="purple" />
        <div class="flex items-center border-b border-gray-200 pl-3">
          <svg
            v-svg
            aria-hidden="true"
            class="h-5 w-5 text-gray-400"
            symbol="search"
          ></svg>

          <input
            id="search"
            v-model="search"
            type="text"
            autocomplete="off"
            class="text-sm h-11 text-gray-900 dark:text-white border-0 appearance-none block w-full rounded-md shadow-none placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:shadow-none dark:bg-dark-c-white"
            :placeholder="$t('button.search')"
          />
        </div>
        <VueScrollPicker v-model="optionValue" :options="options">
          <template v-slot:default="{ option }">
            <div class="option-value" v-if="option.symbol">
              <span class="font-semibold">{{ option.symbol }}</span>
              <span>{{ option.name }}</span>
            </div>
            <div class="option-category" v-else>
              {{ option.name }}
            </div>
          </template>
        </VueScrollPicker>
      </q-card>
    </q-dialog>
    <VError v-if="v.$error" :v="v" :label="label" />
  </div>
</template>

<script>
import { computed } from 'vue'

import VError from 'src/components/extends/v-error/v-error.vue'
import { VueScrollPicker } from 'vue-scroll-picker'
import 'vue-scroll-picker/lib/style.css'
import { debounce } from 'quasar'

export default {
  name: 'VSelectSearch',
  components: {
    VError,
    VueScrollPicker,
  },
  props: {
    v: {
      type: Object,
      default: () => ({}),
    },
    label: {
      type: String,
      default: '',
    },
    selectList: {
      type: Object,
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    categoryName: {
      type: Object,
      default: null,
    },
    activeCurrency: {
      type: Object,
      default: null,
    },
    id: {
      type: String,
      default: '',
    },
    exclude: {
      // exclude items in menu
      type: String,
      default: '',
    },
  },
  setup(props) {
    const isRequiriedLabel = computed(() => props.v.hasOwnProperty('required'))
    return {
      isRequiriedLabel,
    }
  },
  data: () => ({
    dropDown: false,
    search: '',
    listFiltred: null,
    timeout: null,
    mobileList: false,
    optionValue: null,
    debounceSetSymbol: null,
    isMobile: false,
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
    options() {
      const temp = []
      for (const key in this.listFiltred) {
        temp.push(
          {
            name: this.categoryName[key],
            value: this.categoryName[key],
            disabled: true,
          },
          ...this.listFiltred[key].map((x) => {
            return { ...x, value: x.id }
          })
        )
      }
      return temp
    },
  },
  watch: {
    search(val) {
      this.filterChatList()
    },
    optionValue(val) {
      const findOption = this.options.find((x) => x.id == val)
      if (findOption) {
        this.debounceSetSymbol(findOption.symbol)
      }
    },
  },
  mounted() {
    this.listFiltred = Object.assign({}, this.selectList)
    this.optionValue = this.activeCurrency?.id
    this.debounceSetSymbol = debounce(
      (symbol) => this.setActiveOption(symbol),
      500
    )
    this.onResize()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize)
    }
  },
  methods: {
    onOutside() {
      if (this.dropDown) {
        this.dropDown = false
      }
    },
    setActiveOption(symbol) {
      this.localValue = symbol
      this.dropDown = false
    },
    onResize() {
      if (typeof window !== 'undefined') {
        this.isMobile = window.innerWidth < 1200
      }
    },
    filterChatList() {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.timeout = setTimeout(() => {
        this.getChatList()
      }, 600)
    },
    getChatList() {
      this.listFiltred = Object.assign({}, this.selectList)
      if (this.search !== '') {
        for (const key in this.listFiltred) {
          const result = this.listFiltred[key].filter(
            (el) =>
              el.name.match(new RegExp(this.search, 'i')) !== null ||
              el.symbol.match(new RegExp(this.search, 'i')) !== null
          )
          result.length > 0
            ? (this.listFiltred[key] = result)
            : delete this.listFiltred[key]
        }
      }
    },
    onOpenDropdown() {
      this.isMobile ? (this.mobileList = true) : (this.dropDown = true)
    },
  },
}
</script>

<style lang="scss" scoped>
.listbox {
  z-index: 1;
  background-color: #fff;
  @media (max-width: 767px) {
    &-wrap {
      position: fixed;
      z-index: 999999;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #fff;
      &-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #00000036;
      }
    }
  }
}
</style>

<style lang="scss">
.option-value {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 6px 0;
}
.option-category {
  background-color: #ccc;
  text-align: center;
  color: #000;
  padding: 6px 0;
}
</style>
