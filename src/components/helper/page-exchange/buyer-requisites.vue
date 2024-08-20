<template>
  <form
    class="space-y-6 mt-4"
    @submit.prevent="onSubmitDealRequisites"
  >
    <VInput
      v-if="hasOwnerIdentifier"
      v-model.trim="formRequisites.identifier"
      :v="v$.formRequisites.identifier"
      type="text"
      :label="formRequisites.ownIdentifier"
    />
    <VInput
      v-if="hasOwnerRequisites"
      v-model.trim="formRequisites.requisites"
      :v="v$.formRequisites.requisites"
      type="text"
      :label="formRequisites.ownRequisites"
    />
    <Button
      :loading="isLoading"
			view-color="secondary"
			class="mx-auto"
      type="submit"
			submit
      :wide="true"
    >
      {{ $t('button.write') }}
    </Button>
  </form>
</template>

<script>

import { isEmpty } from 'lodash'
import { maxLength, required } from '@vuelidate/validators'
import {useVuelidate} from '@vuelidate/core'
import VInput from 'src/components/extends/v-input/v-input.vue'

export default {
  name: 'BuyerRequisites',
  components: {
    VInput,
  },
  props: {
    offerId: {
      type: Number,
      required: true,
    },
    ownerRequisites: {
      type: Object,
      default: () => ({
        identifier: '',
        requisites: '',
      }),
      required: true,
    },
    initiatorRequisites: {
      type: Object,
      default: () => ({
        identifier: '',
        requisites: '',
      }),
      required: true,
    },
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  data() {
    return {
      formRequisites: {
        offer_id: this.offerId,
        identifier: this.initiatorRequisites.identifier,
        requisites: this.initiatorRequisites.requisites,
        ownIdentifier: this.ownerRequisites.identifier,
        ownRequisites: this.ownerRequisites.requisites,
      },
      defaultForm: {
        offer_id: null,
        identifier: '',
        requisites: '',
      },
      isLoading: false,
      error: null,
    }
  },
  validations() {
    if (this.hasOwnerIdentifier && this.hasOwnerRequisites) {
      return {
        formRequisites: {
          identifier: { required, maxLength: maxLength(100) },
          requisites: { required, maxLength: maxLength(100) },
        },
      }
    } if (this.hasOwnerIdentifier) {
      return {
        formRequisites: {
          identifier: { required, maxLength: maxLength(100) },
        },
      }
    } if (this.hasOwnerRequisites) {
      return {
        formRequisites: {
          requisites: { required, maxLength: maxLength(100) },
        },
      }
    }
    return {
      formRequisites: {
        identifier: { },
        requisites: { },
      },
    }
  },
  computed: {
    hasOwnerIdentifier() {
      return !isEmpty(this.ownerRequisites.identifier)
    },
    hasOwnerRequisites() {
      return !isEmpty(this.ownerRequisites.requisites)
    },
  },
  methods: {
    async onSubmitDealRequisites() {
      this.v$.$touch()
      if (this.v$.$invalid) return
      this.resetError()
      this.isLoading = true
      try {
        const { data: { status, message, data } } = await this.$instance({
          url: 'user/deal/requisites/store',
          data: this.formRequisites,
        })
        if (status) {
          this.$emit('stored', data)
          this.resetForm()
        } else {
          this.error = message
        }
      } catch {
        this.$emit('error')
      }
      this.isLoading = false
    },
    resetForm() {
      Object.assign(this.formRequisites, this.defaultForm)
      this.v$.$reset()
    },
    resetError() {
      this.error = null
    },
  },
}
</script>
