<template>
  <div class="rounded-lg shadow-md" :class="removing && 'ad_removing'">
    <div class="flex items-center">
      <button
        class="relative flex-grow gap-4 py-5 pl-5 pr-10 cursor-pointer lg:flex lg:py-6 lg:pr-10 lg:pl-5"
        :class="expanded && 'ad__header_active'"
        @click="expanded = !expanded"
      >
        <div class="block w-24 self-start">
          {{ formatedDate }}
        </div>
        <Transaction
          :from-abbr="ad.currency_from"
          :from-name="
            currencies[ad.currency_from]
              ? currencies[ad.currency_from].name
              : ad.currency_from
          "
          :to-abbr="ad.currency_to"
          :to-name="currencies[ad.currency_to].name"
          :payment-types="ad.payment_types"
          actions
        />
        <Toggler v-model="ad.is_active" @update:modelValue="onHideAd" />
      </button>
      <div class="ad-id flex">ID {{ ad.id }}</div>
    </div>
    <TransitionSlide>
      <div
        v-if="expanded"
        class="transition duration-200 transition-height h-0 overflow-hidden"
        :class="expanded && 'ad__body_active'"
      >
        <div class="px-5 lg:pr-5 lg:pb-6 lg:pl-32 space-y-3">
          <div>
            <span class="text-c-gray-70 dark:text-dark-c-gray-70"
              >{{ $t('ads.minimumExchange') }}:&nbsp;</span
            >
            <span>{{ ad.min_amount }} {{ ad.currency_from }}</span>
          </div>
          <div>
            <span class="text-c-gray-70 dark:text-dark-c-gray-70"
              >{{ $t('ads.sellerMargin') }}&nbsp;</span
            >
            <span>{{ ad.margin }} %</span>
            <span class="text-c-gray-70 dark:text-dark-c-gray-70"
              >, {{ $t('ads.butCourse') }}&nbsp;</span
            >
            <span
              >1 {{ minRateBaseCurrency }} / {{ ad.min_course }}
              {{ minRateSpecifiedCurrency }}</span
            >
          </div>
          <div v-if="ad.requisites">
            <span class="text-c-gray-70 dark:text-dark-c-gray-70"
              >{{ $t('ads.bankingDetails') }}:&nbsp;</span
            >
            <span>{{ ad.requisites }}</span>
          </div>
          <div v-if="ad.info">
            <span class="text-c-gray-70 dark:text-dark-c-gray-70"
              >{{ $t('offer.addInformation') }}:&nbsp;</span
            >{{ ad.info }}
          </div>
          <div v-if="hasDealIdentifier">
            <span class="text-c-gray-70 dark:text-dark-c-gray-70"
              >{{ $t('ads.id') }}:&nbsp;</span
            >
            <span>{{ ad.deal_requisites.identifier }}</span>
          </div>
          <div v-if="hasDealRequisites">
            <span class="text-c-gray-70 dark:text-dark-c-gray-70"
              >{{ $t('ads.transactionDetails') }}:&nbsp;</span
            >
            <span>{{ ad.deal_requisites.requisites }}</span>
          </div>
          <div v-if="ad.deal" class="mt-5">
            {{ $t('ads.canDelete') }}
          </div>
          <div
            v-else
            class="mt-5 flex gap-4 actions-button lg:mt-5 lg:-mr-2.5 pb-4"
          >
            <ButtonUi
              :disabled="removing"
              icon="trash"
              size="sm"
              type="info"
              @click="remove"
            >
              {{ $t('ads.deleteAd') }}
            </ButtonUi>
            <ButtonUi
              v-if="editing"
              :disabled="removing"
              icon="edit"
              class="mt-4 lg:mt-0 lg:mx-2.5"
              size="sm"
              type="success"
              @click="cancelEditing"
            >
              {{ $t('ads.cancelEditing') }}
            </ButtonUi>
            <ButtonUi
              v-else
              :disabled="removing"
              icon="edit"
              size="sm"
              type="success"
              @click="startEditing"
            >
              {{ $t('ads.editAd') }}
            </ButtonUi>
          </div>
        </div>
      </div>
    </TransitionSlide>
  </div>
</template>

<script>
import { format } from 'date-fns'
import { createNamespacedHelpers } from 'vuex'
import { isEmpty } from 'lodash'
import Transaction from 'src/components/extends/transaction/transaction.vue'
import TransitionSlide from 'src/components/transition-slide/transition-slide.vue'
import ButtonUi from 'src/components/button-ui/button-ui.vue'
import Toggler from 'src/components/extends/v-toggler/v-toggler.vue'
import { USER_ROLE } from 'src/constants'

const { mapState } = createNamespacedHelpers('user')
const { ADMIN, MODERATOR } = USER_ROLE

export default {
  name: 'Ad',
  components: {
    Transaction,
    TransitionSlide,
    ButtonUi,
    Toggler,
  },
  props: {
    ad: {
      type: Object,
      required: true,
    },
    editedAdId: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      expanded: false,
      editing: false,
      removing: false,
    }
  },
  computed: {
    ...mapState(['currencies', 'role']),
    canEdit() {
      return this.role === ADMIN || this.role === MODERATOR
    },
    minRateBaseCurrency() {
      return this.ad.reversibility ? this.ad.currency_from : this.ad.currency_to
    },
    minRateSpecifiedCurrency() {
      return this.ad.reversibility ? this.ad.currency_to : this.ad.currency_from
    },
    formatedDate() {
      return format(this.$getDateInMs(this.ad.created_at), 'dd.MM.yyyy')
    },
    hasDealIdentifier() {
      if (isEmpty(this.ad.deal_requisites)) return false
      return !isEmpty(this.ad.deal_requisites.identifier)
    },
    hasDealRequisites() {
      if (isEmpty(this.ad.deal_requisites)) return false
      return !isEmpty(this.ad.deal_requisites.requisites)
    },
  },
  watch: {
    editedAdId(id) {
      if (!id || (id !== this.ad.id && this.editing)) this.editing = false
    },
    ad: {
      deep: true,
      immediate: true,
      handler(value) {
        if (this.editing) this.cancelEditing()
      },
    },
  },
  methods: {
    async remove() {
      this.removing = true

      try {
        const {
          data: { status, message },
        } = await this.$instance({
          url: 'user/offer/delete',
          data: {
            id: this.ad.id,
          },
        })

        if (status) {
          this.$emit('remove', this.ad.id, this.editing)
        } else {
          this.$error.show(message)
          this.ad.deal = true
        }
      } catch {
        this.$error.show()
      }

      this.removing = false
    },
    startEditing() {
      this.$emit('startEditing', this.ad)
      this.editing = true
    },
    cancelEditing() {
      this.$emit('cancelEditing')
      this.editing = false
    },
    async onHideAd(val) {
      const req = {
        ids: [this.ad.id],
        is_active: val,
      }
      try {
        const {
          data: { data, status, message },
        } = await this.$instance.post('user/offer/hide', req)
        if (status) {
          this.ad.is_active = val
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        console.log('user/offer/hide', e)
        this.$error.show(
          e?.response?.data || 'Вы пытаетесь выполнить действие слишком часто'
        )
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.ad-id {
  min-width: 88px;
}
.actions-button {
  display: flex;
  flex-wrap: wrap;
}
</style>
