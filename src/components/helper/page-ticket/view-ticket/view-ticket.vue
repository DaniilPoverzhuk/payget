<template>
  <Button
    view-color="secondary"
    @click="changeStatus"
  >
    {{ $t('tickets.review') }}
  </Button>
</template>

<script>


export default {
  name: 'ViewTicket',
  props: {
    redirect: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      required: true
    },
  },
  methods: {
    async changeStatus($event) {
      event.stopPropagation()
      try {
        const { data, messages } = await this.$instance.patch(`support/tickets/${this.id}`, {
          status: 'in_process',
        })
        if (data) {
          if (this.redirect) this.$router.push(`/tickets/${this.id}`)
        } else {
          this.$error.show(messages?.status[0])
        }
      } catch (e) {
        this.$error.show(e.response.data.messages?.status[0])
      }
    },
  },
}
</script>
