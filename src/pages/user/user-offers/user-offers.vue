<template lang="pug">
ul.user-offer-list(
  v-if='offers && offers.length'
  :class='isButtonVisible && "user-offer-list_reserved-place"'
)
  li.user-offer-list__item(
    v-for='offer in offers'
    :key='offer.id'
  )
    UserOffer(
      :offer='offer'
      @edit='showEditOfferDialog'
      @error='showError'
    )
  Dialog(
    v-model='editOfferDialog'
    :heading="$t('offer.editSeller')"
    @hide='hideEditOfferDialog'
    :outsideClick="false"
  )
    AdForm(
      :editedAd='editedOffer'
      @edit='editOffer'
    )
</template>

<script>
import Dialog from 'src/components/dialog/dialog-new.vue'
import AdForm from 'src/components/helper/page-ads/ad-form/ad-form.vue'
import UserOffer from './user-offer/user-offer.vue'

export default {
  name: 'UserOffers',
  components: {
    UserOffer,
    Dialog,
    AdForm,
  },
  props: {
    offers: {
      type: Array,
      default: null,
    },
    isButtonVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editOfferDialog: false,
      editedOffer: null,
      editingOffer: false,
    }
  },
  watch: {
    offers() {
      this.$emit('update:offers', this.offers)
    },
  },
  methods: {
    showEditOfferDialog(offer) {
      this.editedOffer = offer
      this.editOfferDialog = true
    },
    hideEditOfferDialog() {
      this.editedOffer = null
      this.editOfferDialog = false
    },
    editOffer(offer) {
      const editingAdIndex = this.offers.findIndex(item => item.id === offer.id)

      Object.assign(this.offers[editingAdIndex], offer)
      this.hideEditOfferDialog()
    },
    async showError(message) {
      this.hideEditOfferDialog()
      await this.$error.show(message)
    },
  },
}
</script>

<style lang="scss">
.user-offer-list {
  &:nth-child(n+2) {
    margin-top: 30px;
  }

  &_reserved-place {
    padding-bottom: 105px;
  }

  @media (min-width: 1200px) {
    &_reserved-place {
      padding-bottom: 0;
    }
  }
}

.user-offer-list__item {
  &:nth-child(n+2) {
    margin-top: 22px;
  }
}
</style>
