<template>
  <!-- <div class="line-offer dark:bg-gray-800"> -->
  <div class="offer__info offer-cell">
    <svg @click="onClickInfo" v-svg symbol="info" class="w-4 h-4"></svg>
  </div>
  <div class="offer__detail offer-cell">
    <div class="offer__title">
      <router-link
        class="relative text-primary text-gray-700 dark:text-gray-300 no-underline inline-block font-medium line-clamp-1 break-all"
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
        currencies[offer.currency_to] ? currencies[offer.currency_to].name : ''
      "
      :payment-types="offer.payment_types"
    />
  </div>
  <div class="offer__exchange offer-cell"></div>
  <div class="offer_actions offer-cell" v-if="!ownOffer">
    <div class="flex w-full">
      <Button
        v-if="auth"
        class="font-small text-sm ml-a"
        view-color="secondary"
        @click="onStartDeal(offer)"
      >
        {{ $t('button.exchange') }}
      </Button>
      <Button
        v-else
        class="font-small text-sm ui-btn ml-a"
        view-color="secondary"
        to="/"
      >
        {{ $t('button.exchange') }}
      </Button>
    </div>
  </div>
  <Dialog
    v-model="isDetails"
    :heading="$t('review.edit')"
    @hide="isDetails = false"
  >
    <div class="offer-details">
      <div class="offer-details__row">
        <div class="offer-details__title">Продавец</div>
        <div class="offer-details__description">⚡⚡⚡Обмен любых монет</div>
        <div class="offer-details__symbols">
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
        </div>
        <div class="offer-details__sub-description">
          Был(а) online 37 минут назад
        </div>
      </div>
      <div class="offer-details__row">
        <div class="offer-details__title">Сделки</div>
        <div class="offer-details__description">
          <span class="text-sm mr-4">
            {{ $t('deals.title') }}:
            <span class="font-semibold">{{ offer.deals_count }}</span>
          </span>
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
      <div class="offer-details__row">
        <div class="offer-details__title">Предложение</div>
        <div class="offer-details__description">
          0.001 BTC Bitcoin — 42.708816 EUR Euro WISE
        </div>
      </div>
      <div class="offer-details__row">
        <div class="offer-details__title">Время работы</div>
        <div class="offer-details__description">Круглосуточно</div>
      </div>
      <div class="offer-details__row">
        <div class="offer-details__title">Информация от продавца</div>
        <div class="offer-details__description">
          Принимаем оплату на сторонний кошелек ,выплата после 2х
          подтверждений,работаем быстро четко 👍👍🤙
        </div>
      </div>
    </div>
  </Dialog>
  <!-- </div> -->
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

//  import { isEmpty } from 'lodash'
import Transaction from 'src/components/extends/transaction/transaction.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'
import Button from 'src/components/extends/button/button.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')
const { mapMutations: mapLayoutMutations } = createNamespacedHelpers('layout')

export default {
  name: 'OfferComponentNew',
  components: {
    Transaction,
    Button,
    Dialog,
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
  data: () => ({
    isDetails: false,
  }),
  computed: {
    ...mapUserState(['id', 'accessToken', 'currencies', 'auth']),
    ...mapEchoState(['onlineUsers']),
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
    onClickInfo() {
      console.log('onClickInfo')
      this.isDetails = true
    },
  },
}
</script>

<style lang="scss" scoped>
.line-offer {
  border-bottom: 1px solid rgba(206, 206, 206, 0.3);
  td {
    padding: 4px 0;
  }
  &:last-child {
    border-bottom: 0;
  }
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
.offer-cell {
  display: table-cell;
  vertical-align: middle;
  padding: 4px 0;
  &.offer__detail {
    font-size: 14px;
    line-height: 18px;
    .offer__title {
      display: flex;
      align-items: center;
    }
  }
  &.offer__info {
    width: 40px;
    text-align: center;
    padding-right: 4px;
    svg {
      display: inline-block;
      padding: 4px;
      width: 24px;
      height: 24px;
      transition: scale 0.15s, transform 0.15s linear;
      cursor: pointer;
      &:hover {
        scale: 1.2;
        transform: rotate(30deg);
      }
    }
  }
  .ml-a {
    margin-left: auto;
  }
}
.offer-details {
  &__title {
    font-size: 16px;
    font-weight: 500;
  }
}
</style>
