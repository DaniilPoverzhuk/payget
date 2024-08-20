<template>
  <Hint
    class="editor-commission editor-paid__hint"
    :label="$t('channel.commission', { commission })"
  >
  </Hint>
</template>

<script>
import Hint from 'src/components/hint/hint.vue'

export default {
  components: {
    Hint,
  },
  data: () => ({
    commission: '0',
  }),
  mounted() {
    this.fetchCommision()
  },
  methods: {
    async fetchCommision() {
      try {
        const { data, status } = await this.$instance({
          method: 'GET',
          url: 'userfeed/post-commission',
        })
        if (data) {
          this.commission = data.data.value
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
