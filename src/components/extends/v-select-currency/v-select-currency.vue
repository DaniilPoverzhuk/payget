<template>
  <div class="v-select-currency">
    <label
      v-if="label"
      :id="localId"
      class="block lg:text-sm text-xs font-medium text-gray-700 dark:text-gray-300"
      >{{ label }}</label
    >
    <div
      v-click-outside="
        () => {
          dropDownList = false
        }
      "
      class="mt-1 relative rounded-md shadow-sm"
    >
      <input
        :id="localId"
        v-model="localValue"
        :type="type"
        autocomplete="off"
        step="any"
        name="price"
        class="text-sm h-11 text-gray-900 dark:text-white py-2 pl-3 pr-24 border-gray-300 dark:border-gray-500 appearance-none block w-full border-1 rounded-md shadow-none placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-primary focus:shadow-none dark:bg-dark-c-white"
        :class="inputClasses"
        :placeholder="placeholder"
      />
      <div
        class="currency-btn pointer py-0 px-2 absolute inset-y-0 right-0 flex items-center"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
        @click.prevent="onOpenDropdown"
      >
        <span class="flex items-center">
          <CurrencyIcon class="mr-2" :name="activeCurrency.symbol" />
          <img
            v-if="activeCurrency?.image"
            :src="activeCurrency?.image"
            class="flex-shrink-0 h-6 w-6 rounded-full mr-3"
          />
          <span class="block truncate">
            {{ activeCurrency?.symbol }}
          </span>
        </span>
        <span class="ml-2 flex items-center pointer-events-none">
          <q-icon size="sm" name="mdi-chevron-down"></q-icon>
        </span>
      </div>

      <div
        v-if="selectList !== null && dropDownList"
        class="absolute max-h-353 overflow-hidden z-10 mt-1 w-full bg-white rounded-md py-1 text-base ring-0 ring-black ring-opacity-5 focus:outline-none shadow-md dark:bg-dark-c-white"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
      >
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
            <ul v-for="item in category" :key="item.id">
              <li
                class="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white"
                role="option"
                @click.prevent="setSymbol(item.symbol)"
              >
                <div class="relative flex items-center">
                  <!--                  :alt="item.name"-->
                  <CurrencyIcon :name="item.symbol" />
                  <img
                    v-if="item.image"
                    :src="item.image"
                    class="absolute flex-shrink-0 h-6 w-6 rounded-full"
                  />

                  <span class="font-normal ml-3 inline-block truncate">
                    {{ item.symbol }}
                    <span
                      class="font-normal truncate text-gray-400 dark:text-gray-500"
                      >{{ item.name }}</span
                    >
                  </span>
                </div>
                <span
                  v-if="item.id == activeCurrency?.id"
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
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <q-dialog
      class="currency-dialog"
      v-model="mobileList"
      full-width
      position="bottom"
    >
      <q-card>
        <q-linear-progress :value="1" color="purple" />
        <div
          class="flex dark:bg-dark-c-white items-center border-b border-gray-200 pl-3"
        >
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
            <div class="option-value flex items-center" v-if="option.symbol">
              <CurrencyIcon :name="option.symbol" />
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
import VError from 'src/components/extends/v-error/v-error.vue'
import CurrencyIcon from 'src/components/helper/icons/currency-icon.vue'
import { VueScrollPicker } from 'vue-scroll-picker'
import 'vue-scroll-picker/lib/style.css'
import { debounce } from 'quasar'

export default {
  name: 'VSelectCurrency',
  components: {
    VError,
    VueScrollPicker,
    CurrencyIcon,
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
    },
    id: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    dropDownList: false,
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
    inputClasses() {
      return {
        'v-input__input_error': !!this.v.$error,
      }
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
    this.debounceSetSymbol = debounce((symbol) => this.setSymbol(symbol), 500)
    this.onResize()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize)
    }
  },
  methods: {
    setSymbol(symbol) {
      this.$emit('setSelect', symbol)
      this.dropDownList = false
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
      this.isMobile ? (this.mobileList = true) : (this.dropDownList = true)
    },
  },
  beforeUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize)
    }
  },
}
</script>
<style lang="scss">
.option-value {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 2px 0;
}
.option-category {
  background-color: #ccc;
  text-align: center;
  color: #000;
  padding: 6px 0;
}
.v-select-currency {
  .currency-btn {
    display: flex;
    cursor: pointer;
    background-color: #f5f7fb;
    margin: 4px;
    height: calc(100% - 8px);
    border-radius: 6px;
    color: #61627f;
    .q-icon {
      color: #b1b2b9;
    }
  }
}
.currency-dialog {
  .q-dialog__inner--minimized {
    padding: 0;
  }
  .vue-scroll-picker {
    height: 20em;
    background-color: #131127;
  }
}
.dark {
  .v-select-currency {
    .currency-btn {
      background-color: #000;
      color: #b5b6cd;
      .q-icon {
        color: #9f9fb9;
      }
    }
  }
  .currency-dialog {
    .vue-scroll-picker {
      background-color: #131127;
      .vue-scroll-picker-item {
        color: #fff;
      }
      .vue-scroll-picker-item-selected {
        color: #007bff;
      }
      .vue-scroll-picker-layer-top {
        background: linear-gradient(180deg, #000000 10%, rgba(7, 7, 7, 0.7));
      }

      .vue-scroll-picker-layer-bottom {
        background: linear-gradient(0deg, #000000 10%, rgba(0, 0, 0, 0.7));
      }
    }
  }
}
</style>
