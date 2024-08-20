<template>
  <tr
    class="deposit-row"
    :class="{ requisites: entry.requisites, 'is-ios': isIOS }"
  >
    <td
      :style="styles"
      class="px-2 lg:py-6 xs:py-4 text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
    >
      {{ entryCreatedAt }}
    </td>
    <td
      :style="styles"
      class="px-2 py-6 text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
    >
      {{ entry.amount }} BTC
    </td>
    <td
      :style="styles"
      class="px-2 py-6 text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
    >
      {{ $t(entryType) }}
    </td>
    <td
      ref="notes"
      class="px-2 py-6 text-gray-500 dark:text-gray-300 break-words max-w-177 lg-notes"
    >
      <template v-if="entry.type">
        <span
          class="text-gray-500 dark:text-gray-300 text-sm"
          v-html="entryTypeData(entry.type)"
        />
        <template v-if="entry.type === 'promocode-supplement'">
          <span
            class="text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
          >
            {{ $t('deposit.usingPromoCode') }}
          </span>
        </template>
        <template v-if="entry.type === 'promocode-hold'">
          <span class="text-gray-500 dark:text-gray-300 text-sm">
            {{ $t('deposit.generatingPromoCodes') }}
          </span>
        </template>
        <template v-if="entry.type === 'promocode-refund'">
          <span class="text-gray-500 dark:text-gray-300 text-sm">
            {{ $t('deposit.refundOfHold') }}
          </span>
        </template>
        <template v-if="entry.type === 'commission'">
          <router-link
            v-if="entry.chat_id && !isModerator"
            class="text-primary"
            :to="`/messages/${entry.chat_id}`"
          >
            {{ `#${entry.deal_id}` }}
          </router-link>
          <template v-else>
            {{ `#${entry.deal_id}` }}
          </template>
        </template>
        <template v-if="entry.type === 'hold'">
          <template v-if="!entry.deal_id">
            {{ $t('deposit.withdrawalHold') }}
          </template>
          <template v-else>
            {{ $t('deposit.dealHold') }}&#32;
            <router-link
              v-if="entry.chat_id && !isModerator"
              class="text-primary"
              :to="`/messages/${entry.chat_id}`"
            >
              {{ `#${entry.deal_id}` }}
            </router-link>
            <template v-else>
              {{ `#${entry.deal_id}` }}
            </template>
          </template>
        </template>
        <template v-if="entry.type === 'from_hold'">
          <router-link
            v-if="entry.chat_id && !isModerator"
            class="text-primary"
            :to="`/messages/${entry.chat_id}`"
          >
            {{ `#${entry.deal_id}` }}
          </router-link>
          <template v-else>
            {{ `#${entry.deal_id}` }}
          </template>
        </template>
        <template v-if="entry.type === 'one-time-subscription-buy'">
          <router-link
            v-if="entry.model && entry.model.channel_post"
            class="text-primary"
            :to="`/feeds/${entry.model.channel_post.slug}`"
          >
            {{ $t('channel.oneTimePostLink') }}
          </router-link>
        </template>
        <template v-if="entry.type === 'one-time-subscription-sale'">
          <router-link
            v-if="entry.model && entry.model.one_time_subscription"
            class="text-primary"
            :to="`/user/${entry.model.one_time_subscription.user.name}`"
          >
            {{ entry.model.one_time_subscription.user.name }}.
          </router-link>
          <router-link
            v-if="entry.model && entry.model.one_time_subscription"
            class="text-primary"
            :to="`/feeds/${entry.model.one_time_subscription.post.slug}`"
          >
            {{ $t('channel.oneTimePostLink') }}
          </router-link>
        </template>
        <template v-if="!entry.user && entry.type === 'withdraw-wallet-sent'">
          <a
            v-if="entry.model && entry.model.invoice.link"
            :href="entry.model.invoice.link"
            target="_blank"
            class="text-primary"
          >
            Transaction ID
          </a>
        </template>

        <template v-if="entry.type === 'channel-subscription-buy'">
          {{ $t('channel.subscriptionPaidChannelBuy') }}
          <router-link
            v-if="channelSubscriptionName"
            class="text-primary"
            :to="`/user/${encodeURI(channelSubscriptionName)}`"
          >
            {{ channelSubscriptionName }}</router-link
          >
          {{ $t('channel.subscriptionPreposition') }} {{ periods }}
        </template>

        <template v-if="entry.type === 'channel-subscription-sale'">
          <router-link
            v-if="channelSubscriptionName"
            class="text-primary"
            :to="`/user/${encodeURI(channelSubscriptionName)}`"
          >
            {{ channelSubscriptionName }}
          </router-link>
        </template>
        <template
          v-if="
            entry.type === 'dispute_removing' ||
            entry.type === 'dispute_supplement'
          "
        >
          {{ $t('deposit.transactionRefund') }} &#32;
          <router-link
            v-if="entry.chat_id && !isModerator"
            class="text-primary"
            :to="`/messages/${entry.chat_id}`"
          >
            {{ `#${entry.deal_id}` }}
          </router-link>
          <template v-else>
            {{ `#${entry.deal_id}` }}
          </template>
        </template>
      </template>
    </td>
  </tr>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { USER_ROLE } from 'src/constants'

const { MODERATOR } = USER_ROLE
const { mapState: mapUserState } = createNamespacedHelpers('user')
export default {
  name: 'DepositHistoryRow',
  props: {
    entry: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      styles: {},
      isIOS: false,
    }
  },
  computed: {
    ...mapUserState(['role']),
    channelSubscriptionName() {
      if (this.entry.model.channel_subscription) {
        return this.entry.model.channel_subscription.user.name
      }
      return this.entry.model.channel && this.entry.model.channel.name
    },
    isModerator() {
      return this.role === MODERATOR
    },
    entryCreatedAt() {
      return this.entry !== null && this.entry.created_at
        ? this.entry.created_at.split('-').join('.').slice(0, -3)
        : ''
    },
    periods() {
      const subPlan = this.entry.model.channel.subscription_plan
      return subPlan ? this.setSubscriptionPlan(subPlan.type) : ''
    },
    entryType() {
      const isHold = ['promocode-hold'].includes(this.entry.type)
      if (isHold) {
        return 'deposit.hold'
      }
      return [
        'supplement',
        'supplement-approved',
        'one-time-subscription-sale',
        'channel-subscription-sale',
        'supplement-canceled',
        'commission_ref',
        'from_hold',
        'dispute_supplement',
        'supplement-wallet',
        'promocode-supplement',
      ].includes(this.entry.type)
        ? 'deposit.replenishment'
        : 'deposit.writeOff'
    },
    isCommission() {
      return !!Number(this.entry?.commission)
    },
  },
  async created() {
    if (typeof window !== 'undefined') {
      await this.$nextTick()
      this.updateStyles()
      window.addEventListener('resize', this.updateStyles)
      this.isIOS = this.checkIOS()
    }
  },
  methods: {
    updateStyles() {
      if (window.innerWidth < 1200) {
        this.styles = {
          paddingTop: this.$refs.notes?.offsetHeight / 8 + 'px',
          paddingBottom: `calc(${this.$refs.notes?.offsetHeight}px - 1.5rem)`,
        }
      } else {
        this.styles = {}
      }
    },
    checkIOS() {
      return (
        [
          'iPad Simulator',
          'iPhone Simulator',
          'iPod Simulator',
          'iPad',
          'iPhone',
          'iPod',
        ].includes(navigator.platform) ||
        // iPad on iOS 13 detection
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
      )
    },
    setSubscriptionPlan(type) {
      switch (type) {
        case 'monthly':
          return this.$t('channel.monthly')
        case 'three_months':
          return this.$t('channel.threeMonths')
        case 'six_months':
          return this.$t('channel.sixMonths')
        case 'yearly':
          return this.$t('channel.yearly')
      }
    },
    entryTypeData(type) {
      switch (type) {
        case 'supplement':
          return this.entry.type === 'supplement' && this.entry.requisites
            ? `${this.$t('deposit.requestWithdrawal')}. ${this.$t(
                'chat.address'
              )}: <b>${this.entry.requisites}</b>`
            : this.$t('notifications.detailsWaiting')
        case 'supplement-wallet':
          return `${this.$t('deposit.enrollmentWaiting')} ${this.$t(
            'chat.address'
          )}: <b>${this.entry.requisites}</b>`
        case 'withdraw-wallet':
          return this.$t('deposit.withdrawalHold')
        case 'withdraw-wallet-sent':
          return this.entry.user
            ? `${this.$t(
                'deposit.localTransferTo'
              )} <a class="text-primary" href="/user/${
                this.entry.user.name
              }"><b>${this.entry.user.name}</b></a>`
            : `${this.$t('deposit.output')}. ${this.$t('chat.address')}: <b>${
                this.entry.model.invoice.wallet_address
              }</b>.`
        case 'supplement-approved':
          return this.entry.user
            ? `${this.$t(
                'deposit.localTransferFrom'
              )} <a class="text-primary" href="/user/${
                this.entry.user.name
              }"><b>${this.entry.user.name}</b></a>`
            : `${this.$t('deposit.replenished')} ${this.$t(
                'chat.address'
              )}: <b>${this.entry.requisites || ''}</b>`
        case 'supplement-canceled':
          return this.$t('deposit.cancelled')
        case 'commission_ref':
          return this.$t('deposit.commissionReferral')
        case 'removing':
        case 'removing-approved':
          return `${this.$t('deposit.requestWithdrawal')}. ${this.$t(
            'chat.address'
          )}: <b>${this.entry.requisites}</b>`
        case 'removing-canceled':
          return this.$t('deposit.reasonLost', {
            requisites: `<b>${this.entry.requisites}</b>`,
          })
        case 'from_hold':
          return `${this.$t('deposit.dealReturn')} `
        case 'commission':
          return `${this.$t('deposit.commissionTransaction')} `
        case 'one-time-subscription-buy':
          return `${this.$t('channel.oneTimePostBuy')} `
        case 'one-time-subscription-sale':
          return this.$t('channel.oneTimePostSale')
        case 'channel-subscription-sale': {
          const period = this.$t(
            `channel.${this.entry.model.channel_subscription.subscription_plan.type}`
          )
          return `${this.$t('channel.subscriptionPaidChannelSale', period, {
            period,
          })}`
        }
        default:
          return ''
      }
    },
  },
  beforeUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.updateStyles)
    }
  },
}
</script>

<style lang="scss" scoped>
tr.deposit-row {
  position: relative !important;
  &.is-ios {
    transform: scale(1);
  }
  .comission {
    font-size: 11px;
  }
  @media (max-width: 1199px) {
    .lg-notes {
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      top: 20px;
      font-size: 13px;
      line-height: 16px;
      padding-top: 12px;
      &.max-w-177 {
        max-width: none;
      }
    }
  }
}
</style>
