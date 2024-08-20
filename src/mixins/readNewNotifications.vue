<script>
import { createNamespacedHelpers } from 'vuex'

const {
  mapMutations: mapUserMutations,
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  computed: {
    // ...mapUserState(['notificationsData']),
  },
  methods: {
    // ...mapUserMutations(['setNotificationsData']),

    async sentReadMessages(type, chatId) {
      try {
        const { data: { status, message } } = await this.$instance({
          url: 'user/notification/seen-by-type',
          type: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            type,
          },
        })
        if (!status) {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },

    readNewNotifications(type, id, query) {
      // const newArr = []
      // this.notificationsData.notifications.map((el) => { newArr.push({ ...el }) })
      // newArr.map((el) => { el.seen_at = 'seen_at' })
      // if (type !== 'new_message' && newArr.find(el => el.read_at == null) && !query) {
      //   this.sentReadMessages(type, id)
      // }
      // if (type == 'post_created' && id) {
      //   newArr.map((el) => {
      //     if (Object.keys(el.data)[0] == type) {
      //       el.read_at = 'read_at'
      //     }
      //   })
      // }
      // if (type == 'new_message' && id) {
      //   newArr.map((el) => {
      //     if (Object.keys(el.data)[0] == type && el.read_at == null && el.data.new_message.chat_id == id) {
      //       el.read_at = 'read_at'
      //     }
      //   })
      // } else {
      //   newArr.map((el) => {
      //     if (Object.keys(el.data)[0] == type && el.read_at == null) {
      //       el.read_at = 'read_at'
      //     }
      //   })
      // }
      // newArr.sort((a, b) => (a.read_at == null ? -1 : 1))
      // this.setNotificationsData({
      //   notifications: [...newArr],
      // })
    },
  },
}
</script>
