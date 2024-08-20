<template>
  <div
    v-if="ticketInfo !== null"
    class="max-w-4xl w-full xs:text-sm my-6 mx-auto px-5"
  >
    <LinkBack
      class="mb-6"
      :to="`/tickets/${uuid}`"
      :text="setTheme"
      text-class="textClass"
    />
    <h3 class="text-gray-700 dark:text-gray-300 text-base font-semibold mb-2">
      {{ $t('tickets.transferSpecialist') }}
    </h3>
    <div class="border-t text-base border-gray-200 dark:border-gray-700 mt-6">
      <template
        v-for="item in data"
		:key="item.id"
      >
        <ListName
          :verified="item.is_verified"
          :name="item.name"
          :avatar="item.media.avatar"
        >
          <Button
            v-if="item.id !== ticketInfo.assigned_user.id"
            :key="ticketInfo.assigned_user.id"
            class="font-medium flex-shrink-0 ml-3 text-sm"
            view-color="secondary"
            @click="takeUser(item)"
          >
			{{$t('tickets.pass')}}
			</Button>
        </ListName>
      </template>
    </div>
    <Dialog
      v-model="openDialog"
      :heading="$t('tickets.adminSelect')"
      :text="`${$t('tickets.considerationTicket')} ${activeUser !== null ? activeUser.name : ''}`"
      class-custom="max-w-lg"
      :error="false"
      :is-icon="false"
      @hide="openDialog = false"
    >
      <div class="lg:mt-6 xs:mt-5 lg:grid lg:grid-cols-2 lg:gap-3 lg:grid-flow-col">
        <Button
          class="font-medium xs:w-full lg:col-start-2 xs:mb-3 text-sm"
          view-color="primary"
          @click="setTicket()"
        >{{$t('tickets.pass')}}</Button>
        <Button
          class="font-medium xs:w-full lg:col-start-1 lg:row-start-1 text-sm"
          view-color="white"
          @click="openDialog = false"
        >{{$t('button.cancel')}}</Button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import LinkBack from 'src/components/extends/link-back/link-back.vue'
import ListName from 'src/components/extends/list-name/list-name.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'


const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  components: {
    LinkBack,
    ListName,
    Dialog,
  },
  data: () => ({
    openDialog: false,
    activeUser: null,
    ticketInfo: null,
    data: null,
  }),
  computed: {
    ...mapUserState(['id']),
    uuid() {
      return this.$route.params.id
    },
    setTheme() {
      return `${this.$t('tickets.ticket')} #${this.uuid.substr(0, 8)}. ${this.ticketInfo.subject !== null ? this.ticketInfo.subject.subject : ''}`
    },
  },
  mounted() {
    this.fetchStatus()
    this.fetchAdmins()
  },
  methods: {
    takeUser(item) {
      this.openDialog = true
      this.activeUser = item
    },
    async fetchStatus() {
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: `support/tickets/${this.uuid}`,
        })
        if (data) {
          this.ticketInfo = data.data
        }
      } catch {
        this.$router.push(this.isSupport ? '/support' : '/tickets')
      }
    },
    async fetchAdmins() {
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: 'support/admin/list',
        })
        if (data) {
          this.data = data.data
        }
      } catch {
        this.$error.show()
      }
    },
    async setTicket() {
      try {
        const { data } = await this.$instance.patch(`support/tickets/${this.uuid}`, {
          assigned_user: this.activeUser.id,
        })
        if (data) {
          this.ticketInfo.assigned_user = data.data.assigned_user
          this.openDialog = false
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
