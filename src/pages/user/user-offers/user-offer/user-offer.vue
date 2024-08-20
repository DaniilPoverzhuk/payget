<template lang="pug">
div.user-offer
  Transaction.user-offer__hero(
    :fromAbbr='offer.currency_from'
    :fromName="currencies[offer.currency_from] ? currencies[offer.currency_from].name : ''"
    :toAbbr='offer.currency_to'
    :toName="currencies[offer.currency_to] ? currencies[offer.currency_to].name : ''"
    :payment-types="offer.payment_types"
    :is-active="offer.is_active"
    @toggle="onToggle"
    actions
  )
  div.user-offer__group
    span.user-offer__group-label {{ $t('offer.minimumExchange') }}:&nbsp;
    span.user-offer__group-value {{ offer.min_amount }} {{ offer.currency_from }}
  div.user-offer__group
    span.user-offer__group-label {{ $t('offer.margin') }}&nbsp;
    span.user-offer__group-value {{ offer.margin }}%
    span.user-offer__group-label ,&nbsp;{{ $t('offer.nocourse') }}&nbsp;
    span.user-offer__group-value
      | 1 {{ minRateBaseCurrency }} /
      | {{ offer.min_course }} {{ minRateSpecifiedCurrency }}
  div.user-offer__group(
    v-if='offer.info'
  )
    span.user-offer__group-label {{ $t('offer.addInformation') }}:&#32;
    | {{ offer.info }}
  div.user-offer__group(
    v-if='isAdmin'
  )
    template(
      v-if='offer.deal'
    ) {{ $t('offer.editOffer') }}
    Button(
      v-else
      icon='edit'
      size='sm'
      view-color="secondary"
      @click='$emit("edit", offer)'
    ) {{ $t('button.edit') }}
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Transaction from 'src/components/extends/transaction/transaction.vue'
import { USER_ROLE } from 'src/constants'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { ADMIN, MODERATOR } = USER_ROLE

export default {
  name: 'UserOffer',
  components: {
    Transaction,
  },
  props: {
    offer: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapUserState(['id', 'currencies', 'role']),
    isAdmin() {
      return this.role === ADMIN
    },
    isModerator() {
      return this.role === MODERATOR
    },
    isAdminOrModerator() {
      return this.isAdmin || this.isModerator
    },
    minRateBaseCurrency() {
      return this.offer.reversibility
        ? this.offer.currency_from
        : this.offer.currency_to
    },
    minRateSpecifiedCurrency() {
      return this.offer.reversibility
        ? this.offer.currency_to
        : this.offer.currency_from
    },
  },
  methods: {
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
          console.log('status', status)
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

<style lang="scss">
.user-offer {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 20px;
  box-shadow: 0 3px 17px rgba(0, 0, 0, 0.08);
  border-radius: var(--bdrs-default);

  @media (min-width: 1200px) {
    padding: 25px 37px;
  }
}

.user-offer__hero {
  font-size: var(--fz-xl);
  line-height: var(--lh-sm);
}

.user-offer__group {
  font-size: var(--fz-sm);
  line-height: var(--lh-sm);
  margin-top: 13px;
}

.user-offer__group-label {
  color: var(--c-gray-70);
}

.user-offer__group-value {
  font-size: var(--fz-lg);
}
</style>
