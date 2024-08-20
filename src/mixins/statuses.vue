<script>
import { DEAL_STATUS } from 'src/constants'

const {
  DEAL_STATUS_NEW,
  DEAL_STATUS_CANCELED,
  DEAL_STATUS_INPROCESS,
  DEAL_STATUS_DISPUTE,
  DEAL_STATUS_DISPUTE_APPROVED,
  DEAL_STATUS_DISPUTE_CANCELED,
  DEAL_STATUS_DONE,
} = DEAL_STATUS

export default {
  data() {
    return {
    }
  },
  computed: {
    statusList() {
      const list = [
        {
          list: [
            {
              value: null,
              text: this.$t('status.all'),
            },
            {
              value: DEAL_STATUS_NEW,
              text: this.$t('status.new'),
            },
            {
              value: DEAL_STATUS_CANCELED,
              text: this.$t('dealStatus.cancelled'),
            },
            {
              value: DEAL_STATUS_INPROCESS,
              text: this.$t('dealStatus.work'),
            },
            {
              value: DEAL_STATUS_DISPUTE,
              text: this.$t('conversation.disputeDispute'),
            },
            {
              value: DEAL_STATUS_DISPUTE_APPROVED,
              text: this.$t('dealStatus.approved'),
            },
            {
              value: DEAL_STATUS_DISPUTE_CANCELED,
              text: this.$t('conversation.disputeCanceled'),
            },
            {
              value: DEAL_STATUS_DONE,
              text: this.$t('dealStatus.completed'),
            },
          ],
        },
      ]
      return list
    },
    statusListFor() {
      const items = []
      Object.keys(this.statusList[0].list).forEach((key) => {
        if (this.statusList[0].list[key].value !== null) {
          items.push(this.statusList[0].list[key])
        }
      })

      return items
    },
  },
}
</script>
