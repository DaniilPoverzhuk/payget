<template>
  <div
    v-if="offerExchange !== null"
    class="swop m-auto xs:p-3 flex my-10 flex-col w-full lg:px-4 max-w-4xl"
  >
    <LinkBack
      :text="$t('home.exchange')"
      @click="$router.go(-1)"
    />
    <h1 class="text-2xl font-semibold text-center text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6">
      {{ $t('user.exchangeRequest') }}
    </h1>
    <p class="text-gray-700 dark:text-gray-300 font-semibold mb-4">
      {{ $t('home.createCreate') }}
      <template v-if="offerExchange.value_from || offerExchange.min_amount">
        {{ offerExchange.value_from || offerExchange.min_amount }}
      </template>
      {{ offerExchange.currency_from }}
      <template v-if="fromName">
        {{ fromName }}
      </template>
      {{ $t('home.on') }}
      <template v-if="offerExchange.value_to">
        {{ offerExchange.value_to }}
      </template>
      {{ offerExchange.currency_to }}
      <template v-if="toName">
        {{ toName }}
      </template>
    </p>
    <template v-if="offerExchange.user">
      <p class="text-gray-500 dark:text-gray-300 mb-1 text-sm">
        {{ $t('home.sellerInformation') }}:
      </p>
      <router-link
        class="text-gray-500 dark:text-gray-300 text-sm font-medium mb-4 cursor-pointer hover:text-primary"
        :to="`/user/${offerExchange.user.name}`"
      >
        {{ offerExchange.user.name }}
      </router-link>
    </template>
    <template v-if="offerExchange.review_status">
      <p class="text-gray-500 dark:text-gray-300">
        {{ $t('home.transactionsTotal') }} {{ offerExchange.deals_count }}
      </p>
      <p class="text-gray-500 dark:text-gray-300">
        {{ $t('home.reviewsPositive') }} <span class="text-green-500">{{ offerExchange.review_status.positive }} </span>
      </p>
      <p class="text-gray-500 dark:text-gray-300">
        {{ $t('home.reviewsNegative') }} <span class="text-red-500">{{ offerExchange.review_status.negative }} </span>
      </p>
      <p class="text-gray-500 dark:text-gray-300 mb-4">
        {{ $t('home.reviewsNeutral') }} {{ offerExchange.review_status.neutral }}
      </p>
    </template>
    <p
      v-if="offerExchange.info"
      class="text-gray-500 dark:text-gray-300 mb-1 text-sm"
    >
      {{ $t('home.sellerAdditional') }}
    </p>
    <p class="text-gray-500 dark:text-gray-300 text-sm font-medium mb-4">
      {{ offerExchange.info }}
    </p>
    <p class="text-gray-500 dark:text-gray-300 mb-1 text-sm">
      {{ $t('home.continueOffers') }}
    </p>
		<p v-if="offerExchange.exchanger_rule" class="text-gray-500 dark:text-gray-300 text-sm font-medium mb-4">
      {{ $t('offer.exchangeRules') }}
    </p>
    <p v-if="offerExchange.exchanger_rule" v-html="offerExchange.exchanger_rule || ''" class="text-gray-500 dark:text-gray-300 mb-1 text-sm"></p>
    <div class="lg:flex mt-10">
      <Button
        class="font-medium lg:mr-4 xs:mb-4 xs:w-full"
        view-color="primary"
        type="Button"
        :loading="loading"
        @click="onStartDeal"
      >
        {{ $t('button.continue') }}
      </Button>
      <Button
        class="font-medium xs:w-full"
        view-color="white"
        @click="$router.go(-1)"
      >
        {{ $t('button.back') }}
      </Button>
    </div>
    <Dialog
      v-model="hasRequisites"
      :heading="$t('user.createRequest')"
      :error="false"
      :is-icon="false"
      @hide="hasRequisites = false"
    >
      <BuyerRequisites
        :offer-id="offerExchange.id"
        :owner-requisites="ownerRequisites"
        :initiator-requisites="initiatorRequisites"
        @stored="makeDeal"
      />
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { isEmpty, toPlainObject } from 'lodash'
import BuyerRequisites from '../../components/helper/page-exchange/buyer-requisites.vue'
import LinkBack from 'src/components/extends/link-back/link-back.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const {
  mapMutations: mapLayoutMutations,
  mapState: mapLayoutState,
} = createNamespacedHelpers('layout')


export default {
  name: 'Swop',
  components: {
    LinkBack,
    Dialog,
    BuyerRequisites,
  },
  data: () => ({
    hasRequisites: false,
    makingDeal: false,
    loading: false,
    ownerRequisites: {
      identifier: '',
      requisites: '',
    },
    initiatorRequisites: {
      identifier: '',
      requisites: '',
    },
  }),
  computed: {
    ...mapLayoutState(['offerExchange', 'paramsExchange']),
    ...mapUserState(['currencies', 'requestData', 'id']),
    fromName() {
      return this.currencies[this.offerExchange.currency_from].name
    },
    toName() {
      return this.currencies[this.offerExchange.currency_to].name
    },
  },
  mounted() {
    if (this.offerExchange == null) this.$router.push('/exchange')
  },
  unmounted() {
    this.setSomeState(['offerExchange', null])
  },
  methods: {
    ...mapLayoutMutations(['setSomeState']),
    async onStartDeal() {
      this.loading = true
      this.makingDeal = true
      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'user/deal/requisites/get',
          data: {
            initiator_id: this.id,
            owner_id: this.offerExchange.user.id,
            offer_id: this.offerExchange.id,
          },
        })
        if (status) {
          this.checkOwnerRequisites(data)
        } else {
          this.$error.show(message)
          this.makingDeal = false
        }
      } catch (e) {
        this.$error.show(e)
        this.makingDeal = false
      }
    },
    checkOwnerRequisites(args) {
      if (isEmpty(args)) {
        this.makeDeal()
      } else {
        this.loading = false
        this.setRequisites(args)
        this.hasRequisites = true
        this.makingDeal = false
      }
    },
    async makeDeal(dealRequisite = null) {
      this.loading = true
      this.hasRequisites = false
      this.makingDeal = true
      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'chat/create',
          data: {
            first_user_id: this.offerExchange.user.id,
            second_user_id: this.id,
            offer_id: this.offerExchange.id,
            sum: this.getSum(),
            type: this.paramsExchange.type,
            sum_from: this.getSumFrom(),
            currency_from: this.offerExchange.currency_from,
            sum_to: this.offerExchange.value_to,
            currency_to: this.offerExchange.currency_to,
            ...(dealRequisite && { deal_requisite_id: dealRequisite.id }),
          },
        })
        if (status) {
          this.$router.push(`/messages/${data.chat_id}`)
        } else {
          this.$error.show(message)
          this.loading = false
        }
      } catch (e) {
        this.$error.show(e)
      }
      this.makingDeal = false
    },
    getSum() {
      if (!this.paramsExchange.sum) {
        return `${this.offerExchange.value_to}`
      }
      return this.paramsExchange.type === 'buy' ? this.offerExchange.value_to : this.offerExchange.value_from
    },
    getSumFrom() {
      if (this.$router.currentRoute.path === '/' && !this.getQueryParam()) return this.offerExchange.min_amount
      return this.offerExchange.value_from
    },
    setRequisites(args) {
      this.ownerRequisites = toPlainObject(args.owner_requisites)
    },
    getQueryParam() {
      const urlParams = window.location.href
      const query = urlParams.split('q')
      return !!query[1]
    },
  },
}
</script>
