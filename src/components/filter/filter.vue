<template>
  <div class="filter_form_section content__main" v-if="isOpenLocal == true">
    <div class="close_button" v-if="!isDesktop"><svg v-svg size="20" symbol="close" @click="closeFilter" color="#fff"></svg></div>
    <h2 v-if="!isDesktop">{{ $t('filter.title') }}</h2>
    <div class="filter_body">
      <div class="v-input__container m50" v-if="list.includes('date_from')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('filter.dateFrom') }}</span></label
          >
        </div>
        <div class="v-input__input-container">
          <QDatepicker v-model="date_from" />
        </div>
      </div>
      <div class="v-input__container m50" v-if="list.includes('date_to')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('filter.dateTo') }}</span></label
          >
        </div>
        <div class="v-input__input-container">
          <QDatepicker v-model="date_to" />
        </div>
      </div>
      <div class="v-input__container m50" v-if="list.includes('seller_id')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('headers.id.seller') }}</span></label
          >
        </div>
        <div class="v-input__input-container">
          <VInputNew v-if="list.includes('seller_id')" v-model="seller_id" type="text" :v="v$.seller_id"></VInputNew>
        </div>
      </div>
      <div class="v-input__container m50" v-if="list.includes('buyer_id')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('headers.id.buyer') }}</span></label
          >
        </div>
        <div class="v-input__input-container">
          <VInputNew class="m100" v-if="list.includes('buyer_id')" v-model="buyer_id" type="text" :v="v$.buyer_id"></VInputNew>
        </div>
      </div>
      <div class="v-input__container m100" v-if="list.includes('type')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('filter.typeTransaction') }}</span></label
          >
        </div>
        <div>
          <q-select v-model="type" :options="typeListFor" option-label="text" option-value="value" multiple emit-value map-options outlined :dark="isDark" :dense="false" behavior="menu">
            <template #selected>
              {{ selectedType }}
            </template>
            <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ $t(opt.text) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
      <div class="v-input__container m100" v-if="list.includes('opponent')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('filter.whomConducted') }}</span></label
          >
        </div>
        <div class="v-input__input-container">
          <VInputNew v-model="opponent" type="text"></VInputNew>
        </div>
      </div>
      <div class="v-input__container m50" v-if="list.includes('currency_from')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('filter.ingoingCurrency') }}</span></label
          >
        </div>
        <div class="v-input__input-container">
          <q-select behavior="menu" :dark="isDark" outlined v-model="fCurrency_from" :options="currencyListFrom" option-value="value" option-label="text" :dense="false">
            <template v-slot:option="scope">
              <q-item v-if="scope.opt.label" :label="scope.opt.label">
                <q-item-section
                  ><strong>{{ scope.opt.label }}</strong></q-item-section
                >
              </q-item>
              <template v-for="child in scope.opt.list" :key="child.label">
                <q-item clickable v-ripple v-close-popup @click="fCurrency_from = child" :class="{ 'bg-light-blue-1': fCurrency_from === child.id }">
                  <q-item-section>
                    <q-item-label class="q-ml-md">{{ child.text }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </template>
          </q-select>
        </div>
      </div>
      <div class="v-input__container m50" v-if="list.includes('currency_to')">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('filter.outgoingCurrency') }}</span></label
          >
        </div>
        <div class="v-input__input-container">
          <q-select behavior="menu" :dark="isDark" outlined v-model="fCurrency_to" :options="currencyListTo" option-value="value" option-label="text" :dense="false">
            <template v-slot:option="scope">
              <q-item v-if="scope.opt.label" :label="scope.opt.label">
                <q-item-section
                  ><strong>{{ scope.opt.label }}</strong></q-item-section
                >
              </q-item>
              <template v-for="child in scope.opt.list" :key="child.label">
                <q-item clickable v-ripple v-close-popup @click="fCurrency_to = child" :class="{ 'bg-light-blue-1': fCurrency_to === child.id }">
                  <q-item-section>
                    <q-item-label class="q-ml-md">{{ child.text }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </template>
          </q-select>
        </div>
      </div>
      <div class="v-input__container m100">
        <div class="v-input__label-container">
          <label
            ><span class="v-input__label-note">{{ $t('headers.status') }}</span></label
          >
        </div>
        <div>
          <q-select v-model="status" :options="statusListFor" option-label="text" option-value="value" multiple emit-value map-options outlined :dark="isDark" :dense="false" behavior="menu">
            <template #selected>
              {{ selectedStatus }}
            </template>
            <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ opt.text }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
      <div class="v-input__container m100">
        <Button class="m100" view-color="primary" :disabled="isDisabled" :loading="loadingStateLocal" @click="filtered"> {{ $t('button.apply') }}</Button>
      </div>
    </div>
  </div>
</template>

<script>
async function loadDatePicker() {
  const DatePicker = await import('vue3-datepicker')
  return DatePicker
}
import VInputNew from 'src/components/extends/v-input/v-input.vue'
import Button from 'src/components/extends/button/button.vue'
import formCurrencies from 'src/mixins/form-currencies.vue'
import statuses from 'src/mixins/statuses.vue'
import types from 'src/mixins/types.vue'
import DesktopResizer from 'src/mixins/desktop-resizer.vue'
import { integer, minValue } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { ru } from 'date-fns/locale'
import { format } from 'date-fns'
import { defineAsyncComponent, ref } from 'vue'
import QDatepicker from 'src/components/datepicker/q-datepicker.vue'

export default {
  name: 'FilterForm',
  components: {
    VInputNew,
    Button,
    QDatepicker,
  },
  mixins: [DesktopResizer, formCurrencies, statuses, types],
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    isOpen: {
      type: Boolean,
      default: () => false,
    },
    forceClear: {
      type: Boolean,
      default: () => false,
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
  },
  validations() {
    return {
      buyer_id: {
        integer,
        minValue: minValue(1),
      },
      seller_id: {
        integer,
        minValue: minValue(1),
      },
    }
  },
  setup() {
    return {
      model: ref([]),
      options: [
        {
          label: 'Google',
          value: 1,
        },
        {
          label: 'Facebook',
          value: 2,
        },
        {
          label: 'Twitter',
          value: 3,
        },
        {
          label: 'Apple',
          value: 4,
        },
        {
          label: 'Oracle',
          value: 5,
        },
      ],
      v$: useVuelidate(),
    }
  },
  data() {
    return {
      isDesktop: false,
      isDisabled: true,
      isOpenLocal: false,
      forceClearLocal: false,
      date_from: '',
      date_to: '',
      seller_id: null,
      buyer_id: null,
      fCurrency_from: null,
      fCurrency_to: null,
      opponent: null,
      status: [],
      type: [],
      filter: {},
      filterAccept: {},
      loadingStateLocal: this.loading,
      dpLocale: null,
      selectedOption: '',
    }
  },
  computed: {
    selectedStatus() {
      return this.status.length === 0 ? this.$t('status.all') : `${this.$t('filter.selected')}: ${this.status.length}`
    },
    selectedType() {
      return this.type.length === 0 ? this.$t('status.all') : `${this.$t('filter.selected')}: ${this.type.length}`
    },
    isDark() {
      return this.$store.state.user.color_theme === 'dark'
    },
  },
  watch: {
    date_from(val) {
      this.changeFilterValue('date_from', val)
    },
    date_to(val) {
      this.changeFilterValue('date_to', val)
    },
    seller_id(val) {
      this.changeFilterValue('seller_id', val)
    },
    buyer_id(val) {
      this.changeFilterValue('buyer_id', val)
    },
    type(val) {
      this.changeFilterValue('type', val)
    },
    opponent(val) {
      this.changeFilterValue('opponent', val)
    },
    fCurrency_to(val) {
      this.changeFilterValue('currency_to', val)
    },
    fCurrency_from(val) {
      this.changeFilterValue('currency_from', val)
    },
    status(val) {
      this.changeFilterValue('status', val)
    },
    isOpen(val) {
      this.isOpenLocal = val
      if ((this.isDesktop && val === false) || this.forceClearLocal) {
        this.forceClearLocal = false
        this.clearFilter()
      } else {
        setTimeout(() => {
          this.removeTypeFromDatepicker()
        })
      }
    },
    forceClear(val) {
      if (val === true) {
        this.clearFilter()
      }
    },
    loading(val) {
      this.loadingStateLocal = val
    },
  },
  async created() {
    this.dpLocale = ru
    this.currencyListFrom[0].list[0].value = null
    this.currencyListFrom[0].list[0].disabled = false
    this.currencyListFrom[0].list[0].text = this.$t('status.all')

    this.currencyListTo[0].list[0].value = null
    this.currencyListTo[0].list[0].disabled = false
    this.currencyListTo[0].list[0].text = this.$t('status.all')

    Object.keys(this.$route.query).forEach((key) => {
      if (this.list.includes(key)) {
        if (key === 'currency_to' || key === 'currency_from') {
          this[`f${key.charAt(0).toUpperCase() + key.slice(1)}`] = this.$route.query[key]
        } else if (key === 'date_from' || key === 'date_to') {
          this[key] = new Date(this.$route.query[key])
        } else {
          this[key] = this.$route.query[key]
        }
        this.changeFilterValue(key, this.$route.query[key])
      }
    })

    this.forceClearLocal = this.forceClear
    this.filtered(false)
  },
  methods: {
    removeTypeFromDatepicker() {
      const inputsDate = document.querySelectorAll('input[type="date"]')
      inputsDate.forEach((el) => {
        el.removeAttribute('type')
      })
    },
    setHistoryApi() {
      const historyFilter = Object.assign({}, this.filterAccept)
      Object.keys(historyFilter).forEach((key) => {
        if (key === 'date_from' || key === 'date_to') {
          historyFilter[key] = format(historyFilter[key], 'yyyy-MM-dd')
        }
      })
      this.$router.replace({ query: historyFilter })
    },
    filtered(history) {
      if (undefined === history) {
        history = true
      }

      this.filterAccept = Object.assign({}, this.filter)
      this.isDisabled = true
      if (history === true) {
        this.setHistoryApi()
      }

      this.$emit('filtered', this.transformFilter())

      if (!this.isDesktop) {
        this.closeFilter()
      }
    },
    clearFilter() {
      Object.keys(this.filter).forEach((key) => {
        if (key === 'date') {
          this.date_from = ''
          this.date_to = ''
        } else if (key === 'currency_to' || key === 'currency_from') {
          this[`f${key.charAt(0).toUpperCase() + key.slice(1)}`] = null
        } else {
          this[key] = typeof this[key] === 'object' ? [] : null
        }
      })
      this.filter = {}
      if (Object.keys(this.filterAccept).length > 0) {
        this.filtered()
      }
      this.date_from = ''
      this.date_to = ''
      this.filterAccept = {}
    },
    transformFilter() {
      const filter = {}
      Object.keys(this.filterAccept).forEach((key) => {
        if (key === 'date_from' || key === 'date_to') {
          if (!filter.date) {
            filter.date = {}
          }
          filter.date[key.substr(5)] = format(new Date(this.filterAccept[key]), 'yyyy-MM-dd')
        } else {
          filter[key] = this.filterAccept[key]
        }
      })

      return filter
    },
    changeFilterValue(key, value) {
      let isDirty = false
      if (value === null || value.length <= 0) {
        isDirty = !!this.filterAccept[key]
        delete this.filter[key]
      } else {
        if (!this.filterAccept[key] || this.filterAccept[key] !== value) {
          isDirty = true
        }
        this.filter[key] = value
      }
      this.isDisabled = isDirty === false || this.v$.$invalid
    },
    disabledAfterDate(date) {
      return date > new Date(new Date().setHours(0, 0, 0, 0))
    },
    closeFilter() {
      this.isOpenLocal = false
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss">
.mx-datepicker {
  width: 100%;
  margin-right: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  font-size: var(--fz-md);
  line-height: var(--lh-md);
  color: var(--c-gray-80);

  .mx-icon-calendar,
  .mx-icon-clear {
    color: var(--c-gray-80);
  }

  .mx-input {
    width: 100%;
    height: 50px;
    border: 2px solid var(--c-gray-15);
    border-radius: var(--bdrs-default);
    padding: 0 15px;
    transition-property: border-color;
    transition-duration: var(--t);
    text-overflow: ellipsis;
    display: inline-block;
    float: left;
    background-color: var(--c-white);
    color: var(--c-gray-80);
    line-height: var(--lh-sm);
    appearance: none;
  }
}

.close_button {
  text-align: right;
}

.close_button svg {
  cursor: pointer;
}

.dark-theme .close_button {
  filter: invert(1);
}

.filter {
  &_form_section {
    @media (max-width: 460px) {
      display: block;
      position: fixed;
      background-color: var(--c-bg);
      overflow: hidden;
      height: 100%;
      top: 0;
      z-index: 99;
      padding-bottom: 70px;
    }

    .v-input__container {
      flex: 1 0 21%;
      .ui-btn {
        height: 48px;
        margin-top: 28px;
        width: 100%;
      }
    }
    .v-input__input {
      height: 40px;
      margin-right: 14px;
      border: none;
    }

    .v-input__input-checkbox {
      margin-left: 0;
      margin-right: 11px;
    }

    .v-input_v-input__input_select {
      height: 40px;
    }

    .button {
      height: 46px;
      margin-top: 22px;
    }

    @media (max-width: 460px) {
      .button {
        margin-right: 14px;
      }
    }
  }

  &_body {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;

    @media (max-width: 992px) {
      display: grid;
      .v-input__container {
        .ui-btn {
          margin-top: 0;
        }
      }
    }

    @media (max-width: 460px) {
      display: flex;
      flex-wrap: wrap;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding-bottom: 50px;

      .v-input__input-checkbox-container {
        padding-top: 12px;
      }

      .v-input__container {
        flex-grow: 1;
        flex-shrink: 1;
        flex: 1 0 100%;
      }

      .m100 {
        flex-basis: 100%;
      }
    }
  }
}

.v-input__input-container {
  input.v-input__input {
    color: rgb(107, 114, 128);
    box-shadow: 0 1px 4px rgba(29, 43, 65, 0.1);
    border-radius: 0.375rem;
    max-width: 140px;
    padding: 7px 8px;
    height: 40px;
    outline: none;

    &:hover {
      box-shadow: 0 2px 8px rgba(29, 43, 65, 0.2);
    }

    &:focus {
      border: 2px solid var(--c-primary);
    }

    @media (max-width: 1199px) {
      max-width: none;
      width: 100%;
    }
  }
}

.v3dp__input_wrapper {
  position: relative;
}

.v3dp__datepicker {
  input {
    color: rgb(107, 114, 128);
    box-shadow: 0 1px 4px rgba(29, 43, 65, 0.1);
    border-radius: 0.375rem;
    padding: 7px 8px;
    max-width: 140px;
    height: 40px;
    outline: none;

    &:hover {
      box-shadow: 0 2px 8px rgba(29, 43, 65, 0.2);
    }

    &:focus {
      border: 2px solid var(--c-primary);
    }

    @media (max-width: 1199px) {
      max-width: none;
      width: 100%;
    }
  }
}

.v3dp__clearable {
  display: inline-flex;
  position: absolute;
  right: 10px;
  cursor: pointer;
  top: 0px;
  left: initial;
  font-size: 18px;
  bottom: 0;
  align-items: center;
  width: 24px;
  justify-content: center;
}

.filter_form_section {
  padding: 0px 20px;
  .q-field--auto-height .q-field__control,
  .q-field--auto-height .q-field__native {
    height: 48px;
  }

  .q-field--auto-height .q-field__native {
    padding-left: 12px;
  }
  .v-input__label-container {
    width: 100%;
    margin-bottom: 10px;
    font-size: var(--fz-md);
    line-height: var(--lh-sm);
    color: var(--c-gray-70);
    font-weight: 600;
    margin-left: 2px;
    .v-input__label-note {
      font-weight: 600;
      font-size: var(--fz-xms);
    }
  }
}
</style>
