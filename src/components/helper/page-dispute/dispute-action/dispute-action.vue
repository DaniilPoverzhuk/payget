<template>
  <div
    class="dispute-action-list w-full py-5 pl-5"
  >
    <div
      v-if="approvePossibility && status === 'dispute'"
      class="lg:space-x-10 xs:space-y-4 lg:flex items-center"
    >
      <Button
        :disabled="!!approvingDispute"
        :loading="approvingDispute === 'buyer'"
        class="w-1/3 whitespace-nowrap xs:m-auto"
        view-color="grey"
        @click="approveDispute('buyer')"
      >
        {{ $t('disputes.closeBuyer') }}
      </Button>
      <Button
        :disabled="!!approvingDispute"
        :loading="approvingDispute === 'canceled'"
        class="w-1/3 whitespace-nowrap xs:m-auto"
        view-color="grey"
        @click="approveDispute('canceled')"
      >
        {{ $t('button.cancel') }}
      </Button>
      <Button
        :disabled="!!approvingDispute"
        :loading="approvingDispute === 'seller'"
        view-color="grey"
        class="w-1/3 whitespace-nowrap xs:m-auto"
        @click="approveDispute('seller')"
      >
        {{ $t('disputes.closeSeller') }}
      </Button>
    </div>

    <Button
      v-else-if="!approvePossibility"
      view-color="primary"
      class="ml-auto"
      :loading="assigningDispute"
      @click="assignDispute"
    >
      {{ $t('disputes.resolve') }}
    </Button>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { USER_ROLE } from 'src/constants'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const {
  MEMBER,
} = USER_ROLE

export default {
  name: 'DisputeActionList',
  props: {
    deal: {
      type: Object,
      default: null,
    },
    // isLoading: {
    //   type: Boolean,
    //   required: true,
    // },
    status: {
      type: String,
      required: '',
    },
    isUserInChat: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    approvingDispute: false,
    assigningDispute: false,
  }),
  computed: {
    ...mapUserState(['role']),
    approvePossibility() {
      return this.role !== MEMBER && this.isUserInChat
    },
    buyerButtonClasses() {
      return {
        button_loading: this.approvingDispute === 'buyer',
        button_size_sm: this.$matchMedia.mobile,
      }
    },
    cancelButtonClasses() {
      return {
        button_loading: this.approvingDispute === 'canceled',
        button_size_sm: this.$matchMedia.mobile,
      }
    },
    sellerButtonClasses() {
      return {
        button_loading: this.approvingDispute === 'seller',
        button_size_sm: this.$matchMedia.mobile,
      }
    },
  },
  methods: {
    async approveDispute(side) {
      this.approvingDispute = side

      try {
        const { data: { status, message } } = await this.$instance({
          url: 'dispute/approve',
          data: {
            deal_id: this.deal.id,
            side,
          },
        })

        if (!status) {
          this.$error.show(message)
          this.emitLoadingState(false)
        }
      } catch {
        this.$error.show()
        this.emitLoadingState(false)
      }
    },
    async assignDispute() {
      this.assigningDispute = true

      try {
        const { data: { status, message } } = await this.$instance({
          url: 'dispute/assign',
          data: {
            dispute_id: this.deal.id,
          },
        })

        if (status) {
          this.$emit('assignDispute')
        } else {
          this.$error.show(message)
          this.emitLoadingState(false)
        }
      } catch {
        this.$error.show()
        this.emitLoadingState(false)
      }
    },
    emitLoadingState(value) {
      this.$emit('update:isLoading', value)
    },
  },
}
</script>
