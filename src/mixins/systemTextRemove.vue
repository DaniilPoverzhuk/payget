<script>
export default {
  methods: {
    systemText(message) {
      return ({
        systemtitle: {
          'chat.created': this.$t('systemtitle.created', { name: message.data.new_message.user_name }),
          'chat.deal_start_no': this.$t('systemtitle.deal_start_no', { name: message.data.new_message.chat.deal_id }),
          'chat.deal_start': this.$t('systemtitle.deal_start', { id: message.data.new_message.chat.deal_id }),
          'chat.deal_buyer_end': this.$t('systemtitle.deal_buyer_end', { id: message.data.new_message.chat.deal_id }),
          'chat.deal_seller_end': this.$t('systemtitle.deal_seller_end', { id: message.data.new_message.chat.deal_id }),
          'chat.deal_end': this.$t('systemtitle.deal_end'),
          'chat.deal_not_paid': this.$t('systemtitle.deal_not_paid'),
          'chat.dispute_open': this.$t('systemtitle.dispute_open', { id: message.data.new_message.chat.deal_id }),
          'chat.dispute_close': this.$t('systemtitle.dispute_close', { id: message.data.new_message.chat.deal_id }),
          'chat.invite_user': this.$t('systemtitle.invite_user', { name: message.data.new_message.user_name }),
          'chat.dispute_approve_seller': this.$t('systemtitle.dispute_approve_seller', { name: message.data.new_message.user_name, id: message.data.new_message.chat.deal_id }),
          'chat.dispute_approve_buyer': this.$t('systemtitle.dispute_approve_buyer', { name: message.data.new_message.user_name, id: message.data.new_message.chat.deal_id }),
          'chat.dispute_cancelled': this.$t('systemtitle.dispute_cancelled', { id: message.data.new_message.chat.deal_id }),

        },
        systemMessages: {
          'chat.created': 'systemMessages.created',
          'chat.deal_start_no': 'systemMessages.dealStartNo',
          'chat.deal_start': 'systemMessages.dealStart',
          'chat.deal_buyer_end': 'systemMessages.dealBuyerEnd',
          'chat.deal_seller_end': 'systemMessages.dealSellerEnd',
          'chat.deal_end': 'systemMessages.dealEnd',
          'chat.deal_not_paid': 'systemMessages.dealNotPaid',
          'chat.dispute_open': 'systemMessages.disputePpen',
          'chat.dispute_close': 'systemMessages.disputeClose',
          'chat.invite_user': 'systemMessages.inviteUser',
          'chat.dispute_approve_seller': 'systemMessages.disputeApproveSeller',
          'chat.dispute_approve_buyer': 'systemMessages.disputeApproveBuyer',
          'chat.dispute_cancelled': 'systemMessages.disputeCancelled',
        },
      })
    },
  },
}
</script>
