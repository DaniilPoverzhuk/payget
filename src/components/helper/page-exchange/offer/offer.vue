<template>
  <div class="line-offer shadow-md rounded dark:bg-gray-800">
    <div class="offer__detail">
      <div class="offer__title">
        <div class="flex" v-if="offerSymbols && offerSymbols.length">
          <div
            class="bg-indigo-500 mr-2 w-6 h-6 flex items-center justify-center rounded-full"
            v-for="item in offerSymbols"
            :key="item.symbol"
          >
            <svg
              v-svg
              :symbol="
                item.symbol == 'arrow-right' ? 'arrow-left' : item.symbol
              "
              class="w-4 h-4 text-white"
              :class="{ 'rotate-180': item.symbol == 'arrow-right' }"
            ></svg>
            <q-tooltip
              class="bg-indigo text-white shadow-4"
              anchor="bottom middle"
              self="center left"
              :offset="[12, 12]"
            >
              {{ item.translate }}
            </q-tooltip>
          </div>
        </div>
        <div class="offer__name">
          <router-link
            class="relative text-gray-700 dark:text-gray-300 no-underline inline-block font-medium mb-1 line-clamp-1 break-all"
            :to="`/user/${offer.user.name}`"
          >
            {{ offer.user.name }}
            <span
              v-if="isUserOnline"
              class="inline-block bg-success w-2 h-2 transform -translate-y-2 rounded-full"
            ></span>
            <span v-if="ownOffer" class="block">{{ $t('offer.adYour') }} </span>
          </router-link>
        </div>
        <span class="text-xs text-gray-400 dark:text-gray-500 mb-1">
          {{ onlineAway }}
        </span>
      </div>
      <div class="offer__info">
        <div class="text-sm">
          {{ $t('offer.dealsCount', offer.deals_count) }}
        </div>
        <span class="text-gray-900 dark:text-white">
          <router-link
            class="no-underline text-green-500 inline-block"
            :to="`/user/${offer.user.name}/reviews`"
          >
            {{ offer.review_status.positive }}
          </router-link>
          <span class="mx-1">/</span>
          <router-link
            class="no-underline text-gray-500 dark:text-gray-300 inline-block"
            :to="`/user/${offer.user.name}/reviews`"
          >
            {{ offer.review_status.neutral }}
          </router-link>
          <span class="mx-1">/</span>
          <router-link
            class="no-underline text-red-500 dark:text-red-300 inline-block"
            :to="`/user/${offer.user.name}/reviews`"
          >
            {{ offer.review_status.negative }}
          </router-link>
        </span>
      </div>
    </div>
    <div class="offer__exchange">
      <Transaction
        :min-amount="offer.min_amount"
        :from-value="offer.value_from"
        :from-abbr="offer.currency_from"
        :from-name="
          currencies[offer.currency_from]
            ? currencies[offer.currency_from].name
            : ''
        "
        :to-value="offer.value_to"
        :to-abbr="offer.currency_to"
        :to-name="
          currencies[offer.currency_to]
            ? currencies[offer.currency_to].name
            : ''
        "
        :payment-types="offer.payment_types"
        :is-active="offer.is_active"
        @toggle="onToggle"
      />
      <div v-if="offer.info" class="text-sm text-gray-500 dark:text-gray-300">
        {{ offer.info }}
      </div>
      <p class="text-gray-500 dark:text-gray-300 text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300"
          >{{ $t('offer.hoursWorking') }}: </span
        >{{ $t(workingTime) }}
      </p>
    </div>
    <div class="offer_actions" v-if="!ownOffer">
      <Button
        v-if="auth"
        class="font-medium"
        view-color="secondary"
        @click="onStartDeal(offer)"
      >
        {{ $t('button.exchange') }}
      </Button>
      <Button v-else class="font-medium ui-btn" view-color="secondary" to="/">
        {{ $t('button.exchange') }}
      </Button>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

//  import { isEmpty } from 'lodash'
import Transaction from 'src/components/extends/transaction/transaction.vue'

import Button from 'src/components/extends/button/button.vue'
import { USER_ROLE } from 'src/constants'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')
const { mapMutations: mapLayoutMutations } = createNamespacedHelpers('layout')
const { ADMIN, MODERATOR } = USER_ROLE

export default {
  name: 'OfferComponent',
  components: {
    Transaction,
    Button,
  },
  props: {
    offer: {
      type: Object,
      required: true,
    },
    requestData: {
      type: Object,
      required: true,
    },
    nonames: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapUserState(['id', 'accessToken', 'currencies', 'auth', 'role']),
    ...mapEchoState(['onlineUsers']),
    isAdmin() {
      return this.role === ADMIN
    },
    isModerator() {
      return this.role === MODERATOR
    },
    isAdminOrModerator() {
      return this.isAdmin || this.isModerator
    },
    offerUrl() {
      return this.accessToken ? `/user/${this.offer.user.name}` : '/'
    },
    getAppUrl() {
      return process.env.VUE_APP_URL
    },
    ownOffer() {
      return this.offer.user.id === this.id
    },
    isUserOnline() {
      return this.onlineUsers.includes(this.offer.user.id)
    },
    offerSymbols() {
      const res = []
      if (this.offer.is_auto_mode) {
        res.push({
          symbol: 'hand',
          translate: this.$t('offer.is_auto_mode'),
        })
      }
      if (this.offer.is_verify_document) {
        res.push({
          symbol: 'identification',
          translate: this.$t('offer.is_verify_document'),
        })
      }
      if (this.offer.is_legal_entity) {
        res.push({
          symbol: 'users',
          translate: this.$t('offer.is_legal_entity'),
        })
      }
      if (this.offer.is_verify_card) {
        res.push({
          symbol: 'credit-card',
          translate: this.$t('offer.is_verify_card'),
        })
      }
      if (this.offer.is_payout_system) {
        res.push({
          symbol: 'arrow-right',
          translate: this.$t('offer.is_payout_system'),
        })
      }
      if (this.offer.is_acceptance_system) {
        res.push({
          symbol: 'arrow-left',
          translate: this.$t('offer.is_acceptance_system'),
        })
      }
      return res
    },
    workingTime() {
      if (this.offer.schedule === null) {
        return 'ads.clockAround'
      }

      const now = new Date()
      const currentDayName = now
        .toLocaleString('en', { weekday: 'long' })
        .toLowerCase()
      const currentSchedule = this.offer.schedule.time[currentDayName]
      if (!currentSchedule) {
        return 'ads.clockAround'
      }

      const start = currentSchedule.start || '00:00'
      const end = currentSchedule.end || '23:59'

      return `${this.$t('offer.from')} ${start} ${this.$t('offer.to')} ${end}`
    },
    onlineAway() {
      if (!this.id || this.isUserOnline) {
        // this.offer.currentState = 'online'
        return ''
      }

      let timeAgo = this.offer.user.login_at.human
      if (this.offer.currentState === 'online') {
        // delete this.offer.currentState
        timeAgo = this.$t('justNow')
      }
      return `${this.$t('offer.wasOnline')} ${timeAgo}`
    },
    queryParam() {
      return this.$route.query.q
    },
  },
  methods: {
    ...mapLayoutMutations(['setSomeState']),
    onStartDeal(data) {
      // plausible('Start deal')
      this.setSomeState(['offerExchange', data])
      this.$router.push('/exchange/offer')
    },
    async onToggle(val) {
      const req = {
        ids: [this.offer.id],
        is_active: val,
        user_id: this.isAdminOrModerator ? this.offer.user.id : undefined,
      }
      try {
        const {
          data: { data, status, message },
        } = await this.$instance.post('user/offer/hide', req)
        if (status) {
          this.offer.is_active = val
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        console.log('user/offer/hide', e)
        this.$error.show(
          e?.response?.data || 'Вы пытаетесь выполнить действие слишком часто'
        )
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.line-offer {
  display: flex;
  column-gap: 16px;
  align-items: center;
  padding: 16px;
  .offer__title {
    display: flex;
    flex-direction: column;
    .offer__name {
      display: flex;
    }
  }
  .offer__info {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1;
  }
  .offer_actions {
    margin-left: auto;
  }
  @media (max-width: 560px) {
    position: relative;
    flex-direction: column;
    align-items: flex-start;
    .offer_actions {
      position: absolute;
      top: 16px;
      right: 16px;
      .ui-btn {
        font-size: 12px;
        height: 28px;
      }
    }
  }
}
</style>
