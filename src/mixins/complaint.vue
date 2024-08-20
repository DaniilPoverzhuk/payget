<script>
const STATUSTEXT = {
  new: 'status.new',
  user: 'status.mine',
  in_progress: 'dealStatus.work',
  resolved: 'status.resolved',
  all: 'status.all',
}

const STATUSSELECTTEXT = {
  new: 'status.new',
  in_progress: 'dealStatus.work',
  resolved: 'status.resolved',
}

export default {
  methods: {
    getStatusList(list) {
      const activeList = list == 'complaints' ? STATUSTEXT : STATUSSELECTTEXT
      const statusList = []
      for (const item in activeList) {
        statusList.push({
          value: item,
          text: activeList[item],
        })
      }
      return statusList
    },
    getStatusText(value) {
      return this.$t(STATUSTEXT[value])
    },
  },
}
</script>
