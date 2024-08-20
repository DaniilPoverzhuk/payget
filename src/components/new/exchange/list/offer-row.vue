<template>
  <div class="exchange-list_table-body-row" :class="{ online: isOnlineOffer }">
    <div class="exchange-list_table-body-row-cell user">
      <UserCell :user="offer.user" :symbols="sumbolsOffer" />
      <div v-if="isSelfOffer" class="exchange-your-ad">
        {{ $t('offer.adYour') }}
      </div>
    </div>
    <div class="exchange-list_table-body-row-cell value-from">
      <div class="font-semibold">
        {{ offer.value_from }} {{ offer.currency_from }}
      </div>
      <div>{{ getCurrencyName(offer.currency_from) }}</div>
    </div>
    <div class="exchange-list_table-body-row-cell value-to">
      <div class="font-semibold">
        {{ offer.value_to }} {{ offer.currency_to }}
      </div>
      <div>{{ getCurrencyName(offer.currency_to) }}</div>
    </div>
    <div
      class="exchange-list_table-body-row-cell rules"
      :class="{ active: toggle }"
    >
      <div class="offer-comment" v-html="offer.info"></div>
    </div>
    <div class="exchange-list_table-body-row-cell deals">
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
      <div class="deals-count">
        {{ $t('offer.dealsCount', offer.deals_count) }}
      </div>
    </div>
    <div class="exchange-list_table-body-row-cell btn">
      <q-btn
        v-if="!isSelfOffer"
        class="desc-btn"
        style="background: #fdea87; color: #222342; border-radius: 12px"
        padding="10px"
        unelevated
        icon="mdi-trending-neutral"
        @click="startDeal(offer)"
      ></q-btn>
      <q-btn
        v-if="!isSelfOffer"
        class="mob-btn"
        style="
          background: #fdea87;
          color: #222342;
          border-radius: 10px 0;
          font-size: 12px;
        "
        unelevated
        no-caps
        padding="10px 36px"
        :label="$t('home.exchange')"
        @click="startDeal(offer)"
      ></q-btn>
    </div>
    <div class="toggle-btn-wrap" @click="onToggle">
      <div class="toggle-btn">
        <q-icon
          size="1rem"
          :name="toggle ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        ></q-icon>
      </div>
    </div>
  </div>
</template>

<script>
import UserCell from './user-cell.vue'
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapUserState, mapMutations: mapUserMutations } =
  createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')
const { mapMutations: mapLayoutMutations } = createNamespacedHelpers('layout')

export default {
  name: 'OfferRow',
  components: {
    UserCell,
  },
  props: {
    offer: Object,
  },
  data() {
    return {
      toggle: false,
    }
  },
  computed: {
    ...mapUserState(['currencies', 'id', 'auth']),
    ...mapEchoState(['onlineUsers']),
    isSelfOffer() {
      return this.id && this.id === this.offer?.user?.id
    },
    isOnlineOffer() {
      return this.onlineUsers.includes(this.offer.user.id)
    },
    sumbolsOffer() {
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
  },
  methods: {
    ...mapLayoutMutations(['setSomeState']),
    getCurrencyName(abbr) {
      return this.currencies && this.currencies[abbr]
        ? this.getName(this.currencies[abbr].name)
        : abbr
    },
    onToggle() {
      this.toggle = !this.toggle
    },
    startDeal(data) {
      if (!this.auth) {
        this.$router.push('/')
        return
      }
      this.setSomeState(['offerExchange', data])
      this.$router.push('/exchange/offer')
    },
    getName(name) {
      return name == 'Ruble' ? this.$t(`currency.${name}`) : name
    },
  },
}
</script>

<style lang="scss" scoped>
.exchange-list_table-body-row {
  .exchange-your-ad {
    display: flex;
    color: $grey;
    font-size: 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
    max-width: max-content;
    margin-top: 8px;
  }
  display: grid;
  grid-template-columns:
    minmax(120px, 1fr)
    minmax(72px, 1fr)
    minmax(85px, 1fr)
    minmax(280px, 1fr)
    minmax(85px, 1fr)
    minmax(50px, 60px);
  align-items: center;
  border: 1px solid #e6e7ee;
  border-radius: 11px;
  padding: 16px 24px;
  font-size: 15px;
  position: relative;
  .mob-btn,
  .toggle-btn-wrap {
    display: none;
  }

  .value-from,
  .value-to {
    .font-semibold {
      color: #000;
    }
  }

  .offer-comment {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 21px;
  }
  position: relative;
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    min-height: 16px;
    min-width: 16px;
    max-height: 16px;
    max-width: 16px;
    border-radius: 50%;
    border: 4px solid #fff;
    background-color: #d2d2d6;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }
  &.online {
    &:before {
      background-color: #21b94b;
    }
  }
  @media (max-width: 1440px) {
    font-size: 12px;
    grid-template-columns:
      minmax(120px, 1fr)
      minmax(70px, 1fr)
      minmax(70px, 1fr)
      minmax(220px, 1fr)
      minmax(70px, 1fr)
      44px;
    grid-gap: 8px;
    padding: 16px;
  }
  @media (max-width: 720px) {
    .exchange-your-ad {
      font-size: 11px;
      position: absolute;
      right: 16px;
      bottom: 24px;
      padding: 0 4px;
      color: var(--c-white);
      background-color: var(--c-gray-77);
    }
    .desc-btn {
      display: none;
    }
    .mob-btn {
      display: block;
      // position: absolute;
      // bottom: -3px;
      // left: -3px;
    }
    font-size: 12px;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;
    .user {
      grid-area: 1 / 1 / 2 / 3;
    }
    .value-from {
      grid-area: 2 / 1 / 3 / 2;
      display: flex;
      gap: 8px;
    }
    .value-to {
      grid-area: 2 / 2 / 3 / 3;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .deals {
      grid-area: 3 / 1 / 4 / 2;
      display: flex;
      .deals-count {
        margin-left: 12px;
      }
    }
    .btn {
      position: absolute;
      right: -1px;
      bottom: -1px;
      display: flex;
      justify-content: flex-end;
      overflow: hidden;
      // width: 116px;
      // height: 40px;
      // grid-area: 5 / 1 / 6 / 3;
    }
    .rules {
      grid-area: 4 / 1 / 5 / 3;
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.5s;
      overflow: hidden;
      .offer-comment {
        display: block;
      }
      &.active {
        grid-template-rows: 1fr;
        .offer-comment {
          padding-bottom: 32px;
        }
      }
    }
    .toggle-btn-wrap {
      position: absolute;
      display: block;
      bottom: -1px;
      height: 21px;
      background-color: #fff;
      width: 42px;
      left: 50%;
      transform: translateX(-50%);
      overflow: hidden;
      .toggle-btn {
        border: 1px solid #e6e7ee;
        border-top-left-radius: 100%;
        border-top-right-radius: 100%;
        border: 1px solid #cecece;
        border-bottom: 0;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        .q-icon {
          margin-bottom: 16px;
        }
      }
    }
  }
}
.dark {
  .exchange-list_table-body-row {
    &::before {
      border-color: #6b7280;
    }
    .toggle-btn-wrap {
      background-color: #131127;
    }
    .value-from,
    .value-to {
      .font-semibold {
        color: #d2d2d6;
      }
    }
  }
}
</style>
