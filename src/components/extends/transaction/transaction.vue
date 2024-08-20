<template>
  <div class="transaction text-gray-700 dark:text-gray-300">
    <span class="font-semibold">
      <template v-if="fromValue || minAmount"
        >{{ fromValue || minAmount }}&nbsp;</template
      >
      <template v-if="fromAbbr">{{ fromAbbr }}</template
      >&nbsp;
      <span
        v-if="fromName || paymentTypeFrom"
        class="text-gray-400 dark:text-gray-500"
      >
        <template v-if="fromName">{{ fromName }} </template
        >{{ paymentTypeFrom }}</span
      >
    </span>
    <svg
      v-svg
      class="inline-block -top-px relative my-0 mx-1 transform rotate-180 text-gray-300 dark:text-gray-500"
      symbol="back-arrow"
      size="19 9"
    />
    <span class="font-semibold">
      <template v-if="toValue">{{ toValue }}&nbsp;</template>{{ toAbbr }}&nbsp;
      <span
        v-if="toName || paymentTypeTo"
        class="text-gray-400 dark:text-gray-500"
        ><template v-if="toName">{{ toName }}&nbsp; </template
        >{{ paymentTypeTo }}</span
      >
    </span>
    <Toggler
      class="inline-flex ml-3"
      v-if="canEdit"
      v-model="isActiveOffer"
      @update:modelValue="this.$emit('toggle', isActiveOffer)"
    />
  </div>
</template>

<script>
import { USER_ROLE } from 'src/constants'
import Toggler from 'src/components/extends/v-toggler/v-toggler.vue'
import { createNamespacedHelpers } from 'vuex'

const { ADMIN, MODERATOR } = USER_ROLE
const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Transaction',
  components: {
    Toggler,
  },
  props: {
    minAmount: {
      type: [String, Number],
      default: null,
    },
    fromValue: {
      type: [String, Number],
      default: null,
    },
    fromAbbr: {
      type: String,
      required: true,
    },
    fromName: {
      type: String,
      default: null,
    },
    toValue: {
      type: [String, Number],
      default: null,
    },
    toAbbr: {
      type: String,
      required: true,
    },
    toName: {
      type: String,
      default: null,
    },
    paymentTypes: {
      type: Object,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    actions: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isActiveOffer: false,
    }
  },
  watch: {
    isActive(value) {
      this.isActiveOffer = value
    },
  },
  computed: {
    ...mapUserState(['role']),
    canEdit() {
      return this.actions && (this.role === ADMIN || this.role === MODERATOR)
    },
    paymentTypeFrom() {
      return this.paymentTypes == null ||
        Array.isArray(this.paymentTypes.payment_type_from)
        ? ''
        : this.paymentTypes.payment_type_from.name
    },
    paymentTypeTo() {
      return this.paymentTypes == null ||
        Array.isArray(this.paymentTypes.payment_type_to)
        ? ''
        : this.paymentTypes.payment_type_to.name
    },
  },
  created() {
    this.isActiveOffer = this.isActive
  },
}
</script>
