<template>
  <form class="ad-form space-y-6 my-10" @submit.prevent="sendAdData">
    <VSelectSearch
      v-model="currencyFrom"
      :label="$t('ads.receiving') + ''"
      :select-list="currenciesData"
      type="text"
      placeholder=""
      :category-name="category"
      :active-currency="currencies[currencyFrom]"
      :v="v$.currencyFrom"
      @update:modelValue="changeMinRate"
    />
    <VSelect
      v-if="listPayFrom.length > 0"
      :label="$t('ads.paymentMethod')"
      v-model="payment_type_from"
      :select-list="listPayFrom"
      class="w-full mt-6"
      :v="v$.payment_type_from"
    />
    <VSelectSearch
      v-model="currencyTo"
      :label="$t('ads.awayGiving')"
      :select-list="currenciesData"
      type="text"
      placeholder=""
      :category-name="category"
      :active-currency="currencies[currencyTo]"
      :v="v$.currencyTo"
      @update:modelValue="changeMinRate"
    />
    <VSelect
      v-if="listPayTo.length > 0"
      :label="$t('ads.paymentMethod')"
      v-model="payment_type_to"
      :select-list="listPayTo"
      class="w-full mt-6"
      :v="v$.payment_type_to"
    />
    <div v-if="currencyFrom && currencyTo">
      <div class="mb-6">
        <VSelect
          v-if="sourceList && sourceList.length"
          @select="onSelectSource"
          :label="$t('ads.exchangeRateSource')"
          v-model="sourceOption"
          :select-list="sourceList"
          class="w-full"
          :v="v$.course"
        />
      </div>
      <div>
        <span
          class="flex mb-1 text-sm font-medium text-gray-700 dark:text-gray-500"
        >
          {{ $t('ads.setYourCource') }}
          <VMenuHover>
            <template #default="{ activatorAttr, menuAttr }">
              <div v-bind="activatorAttr">
                <svg
                  v-svg
                  class="ml-1.5 w-5 h-5 text-gray-400"
                  symbol="information-circle"
                ></svg>
                <q-menu
                  class="tooltip-menu"
                  v-bind="menuAttr"
                  transition-show="jump-down"
                  transition-hide="jump-up"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  max-width="300px"
                >
                  <div>
                    {{ $t('ads.canUse') }}
                    <a class="text-primary" target="_blank" :href="docsUrl">{{
                      $t('ads.apiMethod')
                    }}</a>
                    {{ $t('ads.exchangeRateChanges') }}
                  </div>
                </q-menu>
              </div>
            </template>
          </VMenuHover>
        </span>

        <div class="flex flex relative z-0">
          <VInput
            v-model="min_course"
            class="w-full mr-9 z-1"
            :hidden-label="true"
            type="number"
            step="any"
            :v="v$.course"
          />
          <div
            class="-z-1 inset-0 absolute inset-0 flex items-center justify-center"
          >
            <svg
              v-svg
              class="w-5 h-5 text-gray-400 dark:text-gray-500"
              symbol="menu-alt-4"
            ></svg>
          </div>
          <VInput
            v-model="minRateInput"
            class="w-full"
            :v="v$.minRateInput"
            :hidden-label="true"
            :disabled="minRateDisabled"
            :postfix="'1 ' + minRateInputPostfix"
            :readonly="true"
            type="number"
            step="any"
          />
        </div>
      </div>
    </div>
    <div class="flex justify-between space-x-8">
      <VInput
        v-model="minSum"
        :v="v$.minSum"
        :postfix="currencyFrom"
        type="number"
        :label="$t('ads.exchangeMin')"
        step="any"
        class="w-full"
        @input="resetError"
      />
      <VInput
        v-model="maxSum"
        :v="v$.maxSum"
        :postfix="currencyFrom"
        type="number"
        :label="$t('ads.exchangeMax')"
        step="any"
        class="w-full"
        @input="resetError"
      />
    </div>

    <!-- <Toggler
      v-model="isAlwaysMinCourse"
      :label="$t('ads.exchangeTrading')"
      :right="true"
    /> -->
    <VInput
      v-model="margin"
      :v="v$.margin"
      type="number"
      :label="$t('ads.desiredMargin')"
      :hint="$t('ads.wantTrade')"
      step="any"
      postfix="%"
      @input="resetError"
    />
    <TimeWorkMenu
      :show-drop-down="showDropDown"
      :time="timeSchedule"
      :mode-value="modeSchedule"
      @onChangeMode="onChangeScheduleMode"
      @onChange="onChangeSchedule"
    />
    <VInput
      v-model.trim="info"
      :v="v$.info"
      type="text"
      :label="$t('offer.addInformation')"
    />
    <VInput
      v-model.trim="deal_requisites_identifier"
      :v="v$.deal_requisites_identifier"
      type="text"
      :label="$t('ads.senderId')"
    >
      <template #hint>
        <VMenuHover>
          <template #default="{ activatorAttr, menuAttr }">
            <div v-bind="activatorAttr">
              <svg
                v-svg
                class="ml-1.5 w-5 h-5 text-gray-400"
                symbol="information-circle"
              ></svg>
              <q-menu
                class="tooltip-menu"
                v-bind="menuAttr"
                transition-show="jump-down"
                transition-hide="jump-up"
                anchor="top middle"
                self="bottom middle"
                :offset="[10, 10]"
                max-width="300px"
              >
                <div>
                  {{ $t('ads.knowledgeBaseLabel') }}
                  <router-link class="text-primary" to="/knowledge-base">{{
                    $t('knowledge.atKnowledgeBase')
                  }}</router-link>
                </div>
              </q-menu>
            </div>
          </template>
        </VMenuHover>
      </template>
    </VInput>
    <VInput
      v-model.trim="deal_requisites_requisites"
      :v="v$.deal_requisites_requisites"
      type="text"
      :label="$t('ads.detailsBuyer')"
    >
      <template #hint>
        <VMenuHover>
          <template #default="{ activatorAttr, menuAttr }">
            <div v-bind="activatorAttr">
              <svg
                v-svg
                class="ml-1.5 w-5 h-5 text-gray-400"
                symbol="information-circle"
              ></svg>
              <q-menu
                class="tooltip-menu"
                v-bind="menuAttr"
                transition-show="jump-down"
                transition-hide="jump-up"
                anchor="top middle"
                self="bottom middle"
                :offset="[10, 10]"
                max-width="300px"
              >
                <div>
                  {{ $t('ads.knowledgeBaseLabel') }}
                  <router-link class="text-primary" to="/knowledge-base">{{
                    $t('knowledge.atKnowledgeBase')
                  }}</router-link>
                </div>
              </q-menu>
            </div>
          </template>
        </VMenuHover>
      </template>
    </VInput>
    <div>
      <p
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 inline-block mb-4"
      >
        {{ $t('ads.fixedCommission') }}
      </p>
      <div class="flex items-end space-x-8">
        <VInput
          v-model="commissionFrom"
          :v="v$.commissionFrom"
          :postfix="currencyFrom"
          type="number"
          :label="$t('ads.initialCurrency')"
          step="any"
          class="w-full"
          @input="resetError"
        />
        <VInput
          v-model="commissionFromPercent"
          :v="v$.commissionFromPercent"
          type="number"
          step="any"
          placeholder="%"
          class="w-full"
          @input="resetError"
        />
      </div>
    </div>
    <div>
      <p
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 inline-block"
      >
        {{ $t('ads.finalCurrency') }}
      </p>
      <div class="flex items-end space-x-8">
        <VInput
          v-model="commissionTo"
          class="w-full"
          :v="v$.commissionTo"
          :postfix="currencyTo"
          type="number"
          step="any"
          @input="resetError"
        />
        <VInput
          v-model="commissionToPercent"
          class="w-full"
          :v="v$.commissionToPercent"
          type="number"
          placeholder="%"
          step="any"
          @input="resetError"
        />
      </div>
    </div>
    <Toggler
      v-model="isAutoMode"
      :label="$t('ads.exchangerOperates')"
      :right="true"
    />
    <Toggler
      v-model="isAcceptanceSystem"
      :label="$t('ads.acceptanceSystem')"
      :right="true"
    />
    <Toggler
      v-model="isPayoutSystem"
      :label="$t('ads.paymentSystem')"
      :right="true"
    />
    <Toggler
      v-model="isVerifyDocument"
      :label="$t('ads.documentVerification')"
      :right="true"
    />
    <Toggler
      v-model="isVerifyCard"
      :label="$t('ads.cardverification')"
      :right="true"
    />
    <Toggler
      v-model="isLegalEntity"
      :label="$t('ads.transfersLegal')"
      :right="true"
    />
    <div v-if="error" class="form__error">
      <svg v-svg class="form__error-icon" size="24" symbol="warning"></svg>
      <div class="form__error-text">
        {{ error }}
      </div>
    </div>
    <div class="pt-4">
      <Button
        class="font-medium lg:mr-4 xs:mb-4 w-full text-base"
        view-color="primary"
        :submit="true"
      >
        {{ $t(editedAd ? 'button.saveChanges' : 'ads.createanAd') }}
      </Button>
    </div>
  </form>
</template>

<script>
import {
  required,
  maxLength,
  minValue,
  maxValue,
  helpers,
  decimal,
  requiredIf,
} from '@vuelidate/validators'
import { isEmpty, uniq } from 'lodash'
import { useVuelidate } from '@vuelidate/core'
import { createNamespacedHelpers } from 'vuex'
import Button from 'src/components/extends/button/button.vue'
import Toggler from 'src/components/extends/v-toggler/v-toggler.vue'
import formCurrencies from 'src/mixins/form-currencies.vue'
import VSelectSearch from 'src/components/extends/v-select-search/v-select-search.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import VSelect from 'src/components/extends/v-select/v-select.vue'
import VMenuHover from 'src/components/extends/v-menu-hover/v-menu-hover.vue'
import TimeWorkMenu from '../time-work-menu/time-work-menu.vue'
// import ServerTime from '../server-time/server-time'
const currency = helpers.regex(
  'alpha',
  /^(?!0$)(?!0\d)(?:\d+|\d{1,3}(?:,\d{3})+)(?:[.,]\d+)?$/
)
const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'AdForm',
  components: {
    Toggler,
    VSelectSearch,
    Button,
    VInput,
    VSelect,
    TimeWorkMenu,
    VMenuHover,
    // ServerTime,
  },
  mixins: [formCurrencies],
  props: {
    editedAd: {
      type: Object,
      default: null,
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
  data() {
    return {
      payment_type_from: '',
      payment_type_to: '',
      source: '',
      sourceOption: '',
      sourceList: [],
      reversibility: '',
      min_course: '',
      listPayFrom: [],
      listPayTo: [],
      category: {},
      showDropDown: false,
      margin: '',
      minSum: '',
      maxSum: '',
      minRateSelect: '',
      minRateSelectList: [],
      minRateInput: '',
      isAutoMode: false,
      isAcceptanceSystem: false,
      isPayoutSystem: false,
      isVerifyDocument: false,
      isVerifyCard: false,
      isLegalEntity: false,
      isAlwaysMinCourse: false,
      commissionTo: '',
      commissionFrom: '',
      commissionFromPercent: '',
      commissionToPercent: '',
      info: '',
      deal_requisites: {
        identifier: '',
        requisites: '',
      },
      deal_requisites_identifier: '',
      deal_requisites_requisites: '',
      is_refuse: false,
      sendingAdData: false,
      error: null,
      modeSchedule: 'empty',
      schedule: {
        days: [],
        time: {},
      },
      timeSchedule: {
        monday: {
          alias: 'weeks[1]',
          start: null,
          end: null,
        },
        tuesday: {
          alias: 'weeks[2]',
          start: null,
          end: null,
        },
        wednesday: {
          alias: 'weeks[3]',
          start: null,
          end: null,
        },
        thursday: {
          alias: 'weeks[4]',
          start: null,
          end: null,
        },
        friday: {
          alias: 'weeks[5]',
          start: null,
          end: null,
        },
        saturday: {
          alias: 'weeks[6]',
          start: null,
          end: null,
        },
        sunday: {
          alias: 'weeks[0]',
          start: null,
          end: null,
        },
      },
      defaultTimeSchedule: {
        monday: {
          alias: 'weeks.mon',
          start: null,
          end: null,
        },
        tuesday: {
          alias: 'weeks.tue',
          start: null,
          end: null,
        },
        wednesday: {
          alias: 'weeks.wed',
          start: null,
          end: null,
        },
        thursday: {
          alias: 'weeks.thu',
          start: null,
          end: null,
        },
        friday: {
          alias: 'weeks.fri',
          start: null,
          end: null,
        },
        saturday: {
          alias: 'weeks.sat',
          start: null,
          end: null,
        },
        sunday: {
          alias: 'weeks.sun',
          start: null,
          end: null,
        },
      },
    }
  },
  computed: {
    ...mapUserState(['currencies']),
    docsUrl() {
      return `${process.env.VUE_APP_URL}docs/public`
    },
    isSource() {
      return this.currencyFrom && this.currencyTo
    },
    course() {
      return this.source || this.min_course
    },
    currenciesData() {
      const arr = {}
      const key = Object.keys(this.currencies)
      key.map((el) => {
        const elem = this.currencies[el]
        if (elem && elem.category) {
          // add in category for language
          if (!this.category.hasOwnProperty(elem.category.id)) {
            this.category[elem.category.id] = elem.category.name
          }
          // add in category for new arr
          if (!arr.hasOwnProperty(elem.category.id)) {
            arr[elem.category.id] = []
          }
          arr[elem.category.id].push(elem)
        }
      })
      this.$emit('getAllCurrencies', this.currencies)
      return arr
    },
    minRateDisabled() {
      return !(this.currencyTo && this.currencyFrom)
    },
    minRateReverse() {
      return this.minRateSelect === this.currencyFrom
    },
    minRateInputPostfix() {
      const currency = this.currencyFrom
      return this.minRateDisabled ? '' : currency
    },
  },
  watch: {
    editedAd: {
      immediate: true,
      handler(ad) {
        if (ad) {
          this.resetForm()
          this.currencyFrom = ad.currency_from
          this.currencyTo = ad.currency_to
          this.margin = ad.margin.toString()
          this.minSum = ad.min_amount.toString()
          this.maxSum = ad.max_amount.toString()
          this.min_course = ad.min_course.toString()
          this.info = ad.info
          this.deal_requisites = this.setDealRequisites(ad.deal_requisites)
          this.deal_requisites_identifier = isEmpty(
            ad.deal_requisites.identifier
          )
            ? this.deal_requisites_identifier
            : ad.deal_requisites.identifier
          this.deal_requisites_requisites = isEmpty(
            ad.deal_requisites.requisites
          )
            ? this.deal_requisites_requisites
            : ad.deal_requisites.requisites
          this.changeMinRate()
          this.minRateSelect = ad.reversibility
            ? this.currencyFrom
            : this.currencyTo
          this.reversibility =
            typeof ad.reversibility == 'boolean' ? '' : ad.reversibility
          this.is_refuse = ad.is_refuse
          this.isAutoMode = ad.is_auto_mode
          this.isAcceptanceSystem = ad.is_acceptance_system
          this.isPayoutSystem = ad.is_payout_system
          this.isVerifyDocument = ad.is_verify_document
          this.payment_type_from =
            ad.payment_types.payment_type_from &&
            ad.payment_types.payment_type_from.id
              ? ad.payment_types.payment_type_from.id
              : ''
          this.payment_type_to =
            ad.payment_types.payment_type_to &&
            ad.payment_types.payment_type_to.id
              ? ad.payment_types.payment_type_to.id
              : ''
          this.isVerifyCard = ad.is_verify_card
          this.isLegalEntity = ad.is_legal_entity
          this.isAlwaysMinCourse = ad.is_always_min_course
          this.commissionTo = ad.commission_to
            ? ad.commission_to.toString()
            : ''
          this.commissionFrom = ad.commission_from
            ? ad.commission_from.toString()
            : ''
          this.commissionFromPercent = ad.commission_from_percent
            ? ad.commission_from_percent.toString()
            : ''
          this.commissionToPercent = ad.commission_to_percent
            ? ad.commission_to_percent.toString()
            : ''
          this.setSchedule(ad.schedule)
          if (this.currencyFrom) this.getPayment(this.currencyFrom, 'from')
          if (this.currencyTo) this.getPayment(this.currencyTo, 'to')
        } else {
          this.resetForm()
        }
      },
    },
    currencyFrom() {
      if (this.currencyFrom) {
        this.getPayment(this.currencyFrom, 'from')
        if (this.currencyTo) {
          this.getOfferSources()
        }
      }
    },
    currencyTo() {
      if (this.currencyTo) {
        this.getPayment(this.currencyTo, 'to')
        if (this.currencyFrom) {
          this.getOfferSources()
        }
      }
    },
    min_course() {
      if (+this.min_course) {
        this.sourceOption = ''
        this.source = ''
      }
    },
    sourceOption() {
      if (this.sourceOption) {
        this.min_course = ''
      }
    },
  },

  validations() {
    const validation = {
      currencyTo: { required },
      currencyFrom: { required },
      margin: { required },
      minSum: {
        required,
        decimal,
        minValue: minValue(0),
      },
      maxSum: {
        required,
        decimal,
        minValue: minValue(0),
      },
      commissionTo: {
        minValue: minValue(0),
      },
      commissionFrom: {
        minValue: minValue(0),
      },
      commissionFromPercent: {
        minValue: minValue(0),
        maxValue: maxValue(100),
      },
      commissionToPercent: {
        minValue: minValue(0),
        maxValue: maxValue(100),
      },
      minRateInput: {
        minValue: minValue(0),
      },
      info: { maxLength: maxLength(100) },
      deal_requisites: {
        identifier: { maxLength: maxLength(100) },
        requisites: { maxLength: maxLength(100) },
      },
      deal_requisites_identifier: {
        maxLength: maxLength(100),
      },
      deal_requisites_requisites: {
        maxLength: maxLength(100),
      },
      is_refuse: {},
      ...(this.listPayFrom.length > 0
        ? { payment_type_from: { required } }
        : {}),
      ...(this.listPayTo.length > 0 ? { payment_type_to: { required } } : {}),
      course: {
        required: requiredIf(() => !this.source || !this.min_course),
      },
    }
    return validation
  },
  methods: {
    setSelectFrom(data) {
      // this.form.currency_from = data  //ololo
    },
    onSelectSource(data) {
      this.source = data.source
    },
    async getOfferSources() {
      this.sourceList = []
      this.source = this.editedAd?.source || ''
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          method: 'GET',
          url: 'user/offer/sources',
          params: {
            currency_from: this.currencyFrom,
            currency_to: this.currencyTo,
          },
        })
        if (status) {
          this.sourceList = data.map((x) => {
            const replacedText = this.getSource(x.source)
            return Object.assign(
              {
                text: replacedText,
                subText: x.value,
              },
              x
            )
          })
          if (this.source) {
            const findSource = this.sourceList.find(
              (x) => x.source == this.source
            )
            this.sourceOption = findSource ? findSource.value : ''
          }
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show('user/offer/sources', e)
      }
    },
    getSource(value) {
      switch (value) {
        case 'source_exmo':
          return 'exmo.com'
        case 'source_exmo_me':
          return 'exmo.me'
        default: {
          const source = value.replace('source_', '')
          return source.charAt(0).toUpperCase() + source.slice(1)
        }
      }
    },
    setDealRequisites(dealRequisites) {
      return isEmpty(dealRequisites) ? this.deal_requisites : dealRequisites
    },
    setSchedule(schedule) {
      this.modeSchedule =
        schedule != null && Object.keys(schedule.time).length > 0
          ? 'schedule'
          : 'empty'
      if (this.modeSchedule == 'schedule') {
        Object.keys(schedule.time).forEach((scheduleKey) => {
          Object.keys(this.timeSchedule).forEach((timeKey) => {
            if (timeKey === scheduleKey) {
              this.timeSchedule[timeKey].start =
                schedule.time[scheduleKey].start
              this.timeSchedule[timeKey].end = schedule.time[scheduleKey].end
            }
          })
        })
      }
    },
    sendAdData() {
      const deal_requisites = { ...this.deal_requisites }
      Object.assign(deal_requisites, {
        identifier: this.deal_requisites_identifier,
        requisites: this.deal_requisites_requisites,
      })
      const formData = {
        currency_from: this.currencyFrom,
        currency_to: this.currencyTo,
        margin: this.margin,
        min_amount: +this.minSum,
        max_amount: +this.maxSum,
        reversibility: this.reversibility,
        source: this.source,
        min_course: +this.min_course,
        ...(this.payment_type_from
          ? { payment_type_from: this.payment_type_from }
          : {}),
        ...(this.payment_type_to
          ? { payment_type_to: this.payment_type_to }
          : {}),
        deal_requisites,
        // deal_requisites: {
        //   identifier: this.deal_requisites_identifier,
        //   requisites: this.deal_requisites_requisites,
        // },
        info: this.info,
        is_refuse: this.is_refuse,
        schedule: this.prepareSchedule(),
        is_auto_mode: this.isAutoMode ? '1' : '0',
        is_acceptance_system: this.isAcceptanceSystem ? '1' : '0',
        is_payout_system: this.isPayoutSystem ? '1' : '0',
        is_verify_document: this.isVerifyDocument ? '1' : '0',
        is_verify_card: this.isVerifyCard ? '1' : '0',
        is_legal_entity: this.isLegalEntity ? '1' : '0',
        is_always_min_course: this.isAlwaysMinCourse ? '1' : '0',
        commission_to: this.commissionTo,
        commission_from: this.commissionFrom,
        commission_from_percent: this.commissionFromPercent,
        commission_to_percent: this.commissionToPercent,
      }
      if (this.editedAd) {
        this.edit(formData)
      } else {
        this.add(formData)
      }
    },
    async add(formData) {
      this.v$.$touch()
      if (this.v$.$invalid) return
      this.sendingAdData = true
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'user/offer/add',
          data: formData,
        })
        if (status) {
          this.$emit('add', data)
          this.resetForm()
          this.setScheduleByDefault()
        } else {
          this.$emit('error', message)
        }
      } catch {
        this.$emit('error')
      }
      this.sendingAdData = false
    },
    async edit(formData) {
      this.v$.$touch()
      if (this.v$.$invalid) return
      this.sendingAdData = true
      this.resetError()
      try {
        const {
          data: { status, message, data },
        } = await this.$instance({
          url: 'user/offer/edit',
          data: {
            ...formData,
            id: this.editedAd.id,
          },
        })
        if (status) {
          this.$emit('edit', data)
          this.resetForm()
          this.setScheduleByDefault()
        } else {
          this.$emit('error', message)
          this.error = message
        }
      } catch {
        this.$emit('error')
      }
      this.sendingAdData = false
    },
    resetForm() {
      Object.assign(this.$data, this.$options.data.apply(this))
      this.setScheduleByDefault()
      if (Object.keys(this.v$).length) {
        this.v$.$reset()
      }
    },
    changeMinRate(value) {
      if (this.minRateDisabled) return
      this.minRateSelectList = [
        {
          value: this.currencyTo,
          text: `1 ${this.currencyTo}`,
        },
        {
          value: this.currencyFrom,
          text: `1 ${this.currencyFrom}`,
        },
      ]
      if (!this.minRateSelect) {
        this.minRateSelect = this.currencyTo
      } else if (
        this.minRateSelect !== this.currencyTo &&
        this.minRateSelect !== this.currencyFrom
      ) {
        this.minRateSelect = value
      }
    },
    async getPayment(currency, type) {
      try {
        const { data } = await this.$api({
          method: 'get',
          url: '/payment_type/list',
          params: {
            type: currency,
          },
        })
        if (data.data.length > 0) {
          if (type === 'from') {
            this.setListPayFrom(data.data)
          }
          if (type === 'to') {
            this.setListPayTo(data.data)
          }
        } else {
          if (type === 'from') {
            this.listPayFrom = []
            this.payment_type_from = ''
          }
          if (type === 'to') {
            this.listPayTo = []
            this.payment_type_to = ''
          }
        }
      } catch {
        this.$error.show()
      }
    },
    setListPayFrom(data) {
      this.listPayFrom = []
      for (let i = 0; i < data.length; i++) {
        this.listPayFrom.push({
          value: data[i].id,
          text: data[i].name,
        })
      }
      // if (!this.$route.query.t1) this.payment_type_from = this.listPayFrom[0].value
    },
    setListPayTo(data) {
      this.listPayTo = []
      for (let i = 0; i < data.length; i++) {
        this.listPayTo.push({
          value: data[i].id,
          text: data[i].name,
        })
      }
      // if (!this.$route.query.t2) this.payment_type_to = this.listPayTo[0].value
    },
    resetError() {
      this.error = null
    },
    setScheduleByDefault() {
      this.modeSchedule = 'empty'
      this.timeShedule = this.defaultTimeSchedule
    },
    onChangeSchedule(value) {
      Object.keys(value).forEach((k) => {
        if (value[k].start || value[k].end) {
          this.schedule.days.push(k)
        }
      })
      this.schedule.days = uniq(this.schedule.days)
      this.schedule.time = value
    },
    onChangeScheduleMode(value) {
      this.modeSchedule = value
    },
    prepareSchedule() {
      if (this.modeSchedule === 'empty') {
        return {
          days: [],
          time: [],
        }
      }

      const preparedSchedule = Object.assign({}, this.schedule)
      Object.keys(preparedSchedule.time).forEach((k) => {
        delete preparedSchedule.time[k].alias
        if (
          isEmpty(preparedSchedule.time[k].start) &&
          isEmpty(preparedSchedule.time[k].end)
        ) {
          delete preparedSchedule.time[k]
        }
      })
      return preparedSchedule
    },
  },
}
</script>

<style lang="scss">
.q-position-engine {
  &.tooltip-menu {
    max-width: 300px;
    border-radius: var(--bdrs-default);
    color: var(--c-gray-70);
    font-size: var(--fz-sm);
    line-height: var(--lh-sm);
    background-color: var(--c-white);
    box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1);
    padding: 8px;
  }
}
</style>
