<template>
  <tr class="table__tr tr-large">
    <td class="table__td">
      <router-link
        class="table__link"
        v-if="deal.chat_id"
        :to="`messages/${deal.chat_id}`"
        >{{ `#${deal.id}` }}</router-link
      >
      <template v-else>{{ `#${deal.id}` }}</template>
    </td>
    <td class="table__td">{{ formattedDate }}</td>
    <td class="table__td">{{ diffDate }}</td>
    <td class="table__td">
      <router-link class="table__link" :to="`user/${deal.seller.name}`"
        >{{ `#${deal.seller.id}` }} {{ deal.seller.name }}</router-link
      >
    </td>
    <td class="table__td">
      <router-link class="table__link" :to="`user/${deal.buyer.name}`"
        >{{ `#${deal.buyer.id}` }} {{ deal.buyer.name }}</router-link
      >
    </td>
    <td class="table__td">
      <Transaction
        :fromValue="+deal.value_from"
        :fromAbbr="deal.offer.currency_from"
        :fromName="
          currencies[deal.offer.currency_from] &&
          currencies[deal.offer.currency_from].name
        "
        :toValue="+deal.value_to"
        :toAbbr="deal.offer.currency_to"
        :toName="
          currencies[deal.offer.currency_to] &&
          currencies[deal.offer.currency_to].name
        "
        :payment-types="deal.payment_types"
      ></Transaction>
    </td>
    <td class="table__td">{{ $t(statusText) }}</td>
    <td class="table__td font-bold">{{ `${deal.comission || 0.0} BTC` }}</td>
  </tr>
  <tr class="table__tr tr-small">
    <td class="table__td">
      <table class="deal-table-row">
        <tbody>
          <tr v-for="(item, idx) in headers" :key="item.label">
            <td class="td-small">{{ $t(item.label) }}</td>
            <td v-if="idx == 0">
              <router-link
                class="table__link"
                v-if="deal.chat_id"
                :to="`messages/${deal.chat_id}`"
                >{{ `#${deal.id}` }}</router-link
              >
              <template v-else>{{ `#${deal.id}` }}</template>
            </td>
            <td v-else-if="idx === 1">{{ formattedDate }}</td>
            <td v-else-if="idx === 2">{{ diffDate }}</td>
            <td v-else-if="idx === 3">
              <router-link class="table__link" :to="`user/${deal.seller.name}`"
                >{{ `#${deal.seller.id}` }} {{ deal.seller.name }}</router-link
              >
            </td>
            <td v-else-if="idx === 4">
              <router-link class="table__link" :to="`user/${deal.buyer.name}`"
                >{{ `#${deal.buyer.id}` }} {{ deal.buyer.name }}</router-link
              >
            </td>
            <td v-else-if="idx === 5">
              <Transaction
                :fromValue="+deal.value_from"
                :fromAbbr="deal.offer.currency_from"
                :fromName="
                  currencies[deal.offer.currency_from] &&
                  currencies[deal.offer.currency_from].name
                "
                :toValue="+deal.value_to"
                :toAbbr="deal.offer.currency_to"
                :toName="
                  currencies[deal.offer.currency_to] &&
                  currencies[deal.offer.currency_to].name
                "
                :payment-types="deal.payment_types"
              ></Transaction>
            </td>
            <td v-else-if="idx === 6">{{ $t(statusText) }}</td>
            <td v-else-if="idx === 7" class="font-bold">
              {{ `${deal.comission || 0.0} BTC` }}
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { format, differenceInSeconds } from 'date-fns'
import Transaction from 'src/components/extends/transaction/transaction.vue'
import { DEAL_STATUS, MEMBER_STATUS } from 'src/constants'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const {
  DEAL_STATUS_NEW,
  DEAL_STATUS_INPROCESS,
  DEAL_STATUS_DISPUTE,
  DEAL_STATUS_DISPUTE_APPROVED,
  DEAL_STATUS_DISPUTE_CANCELED,
  DEAL_STATUS_DONE,
  DEAL_STATUS_CANCELED,
} = DEAL_STATUS
const { MEMBER_STATUS_APPROVED_LOOKER } = MEMBER_STATUS

export default {
  name: 'DealsRow',
  components: {
    Transaction,
  },
  props: {
    deal: {
      type: Object,
      required: true,
    },
    headers: {
      type: Array,
    },
  },
  computed: {
    ...mapUserState(['currencies']),
    formattedDate() {
      return format(this.$getDateInMs(this.deal.created_at), 'dd.MM.yyyy')
    },
    diffDate() {
      if (this.deal.finish_at === null) {
        return '-'
      }

      const createdAt = new Date(this.$getDateInMs(this.deal.created_at))
      const finishAt = new Date(this.$getDateInMs(this.deal.finish_at))

      const diffTime = differenceInSeconds(finishAt, createdAt)
      if (!diffTime) {
        return '-'
      }

      const minutes = Math.abs(Math.floor(diffTime / 60) % 60).toString()
      const hours = Math.abs(Math.floor(diffTime / 60 / 60)).toString()
      return `${hours.length < 2 ? 0 + hours : hours} ${this.$t('time.h')}. ${
        minutes.length < 2 ? 0 + minutes : minutes
      } мин.`
    },
    statusText() {
      switch (this.deal.status) {
        case DEAL_STATUS_NEW:
          return 'dealStatus.new'
        case DEAL_STATUS_INPROCESS:
          return 'dealStatus.work'
        case DEAL_STATUS_DONE:
          return 'dealStatus.completed'
        case DEAL_STATUS_DISPUTE:
          return 'dealStatus.dispute'
        case DEAL_STATUS_DISPUTE_CANCELED:
          return 'systemtitle.deal_not_paid'
        case DEAL_STATUS_CANCELED:
          return 'systemtitle.deal_not_paid'
        case DEAL_STATUS_DISPUTE_APPROVED:
          if (this.deal.status_seller === MEMBER_STATUS_APPROVED_LOOKER) {
            return 'dealStatus.favorSeller'
          }
          return 'dealStatus.favorBuyer'
        default:
          return ''
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tr-large {
  display: table-row;
  @media (max-width: 1199px) {
    display: none;
  }
}
.tr-small {
  display: none;
  .td-small {
    width: 40%;
    padding-left: 8px;
  }
  .deal-table-row {
    width: 100%;
  }
  @media (max-width: 1199px) {
    display: table-row;
    .table__td {
      padding: 16px;
    }
  }
  @media (max-width: 720px) {
    font-size: 14px;
    .td-small {
      width: 50%;
    }
  }
}
</style>
