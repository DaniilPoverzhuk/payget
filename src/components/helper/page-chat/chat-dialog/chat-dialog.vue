<template>
    <div class="chat-dialog">
        <transition name="fade" mode="out-in">
            <div class="template" v-if="showForm" key="1">
                <div class="chat-dialog__title">{{ $t('requisites.yourBanking') }}</div>
                <div class="chat-dialog__warning" v-show="errorUrlTextHeader"><svg class="form chat-dialog__warning-icon" v-svg size="24" symbol="warning"></svg><span class="chat-dialog__warning-text">{{ $t(errorText)}}</span></div>
                <VInput class="chat-dialog__group" v-model.trim="requisitesForm.free" type="text" :label="$t('requisites.enterInformation')" :v="v$.requisitesForm.free" :class="{'chat-dialog__warning-input': requiredField}" @update:modelValue="onFreeChange"></VInput>
                <p class="chat-dialog__error" v-if="requiredField">{{$t('requisites.bankingDetails')}}</p>
                <p class="chat-dialog__or">{{ $t('knowledge.or') }}</p>
                <VInput class="chat-dialog__group underline-link" v-model.trim="requisitesForm.url" type="text" :label="$t('requisites.addLink')" :v="v$.requisitesForm.url" :class="{'chat-dialog__warning-input': errorUrlText}" @update:modelValue="onUrlChange"></VInput>
                <p class="chat-dialog__error" v-if="errorUrlText">{{$t('requisites.enterlink')}}</p><button class="chat-dialog__link" @click="showForm=false">{{$t('requisites.paymentList')}}</button>
                <div class="chat-dialog__action"><Button :loading="isLoading" :submit="true" view-color="secondary" :disabled="submitDisabled" @click="onSubmit">{{$t('button.confirm')}}</Button></div>
            </div>
        </transition>
        <transition name="fade" mode="out-in">
            <div class="template" v-if="!showForm" key="2">
                <div class="form chat-dialog__title">{{$t('requisites.paymentSystems')}}</div>
                <ul class="form chat-dialog__lists list" v-if="listPayment != null">
                    <li class="list__item" v-for="payment in listPayment" :key="payment.name">{{payment.name}}</li>
                </ul>
                <div class="chat-dialog__action"><Button class="button button_type_info" view-color="secondary" @click="showForm=true">{{$t('button.back')}}</Button></div>
            </div>
        </transition>
    </div>
</template>

<script>

import VInput from 'src/components/extends/v-input/v-input.vue'

import { useVuelidate } from '@vuelidate/core'
import { requiredIf, url } from '@vuelidate/validators'


export default {
  name: 'ChatDialog',
  components: {
    VInput,
  },
  props: {
    chatId: {
      type: [String, Number],
      default: '',
    },
    listPayment: {
      type: Array,
      default: null,
    },
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  data() {
    return {
      isLoading: false,
      submitDisabled: false,
      requisitesForm: {
        free: '',
        url: '',
      },
      text: '',
      link: '',
      form: {
        text: '',
        link: '',
      },
      showForm: true,
      error: false,
      requiredField: false,
      errorText: '',
      errorUrlTextHeader: '',
      errorUrlText: false,
      errorFreeText: false,
      trustedSystemUrls: [],
      textRequired: 'requisites.fieldsMandatory',
      textWrongUrl: 'requisites.linkNotAllowed',
    }
  },
  validations() {
    return {
      requisitesForm: {
        free: {
          required: requiredIf(() => {
            return this.requisitesForm.url.length <= 0 && this.requisitesForm.free.length <= 0
          }),
        },
        url: {
          required: requiredIf(() => {
            return this.requisitesForm.free.length <= 0 && this.requisitesForm.url.length <= 0
          }),
          url,
        },
      }
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.getTrustedPaymentSystems()
  },
  methods: {
    async getTrustedPaymentSystems() {
      const { data } = await this.$instance.get('payments-systems/trusted')

      data.data.list.forEach((system) => {
        this.trustedSystemUrls.push(system.url)
      })
    },
    onFreeChange(value) {
      this.error = this.requiredField = false
      this.errorUrlTextHeader = false
      if (value.trim() !== '') {
        this.requisitesForm.url = ''
        this.errorUrlText = false
      } else {
        this.checkForRequired()
      }
    },
    onUrlChange(value) {
      this.error = false
      if (value.trim() !== '') {
        this.requisitesForm.free = ''
        this.requiredField = false
        this.checkIfTrustedUrlMatches()
      } else {
        this.checkForRequired()
      }
    },
    checkForRequired() {
      if (this.requisitesForm.free === this.requisitesForm.url) {
        this.errorUrlText = this.requiredField = true
        this.error = true
        this.errorUrlTextHeader = true
        this.errorText = this.textRequired
        this.submitDisabled = false
      }
    },
    checkIfTrustedUrlMatches() {
      if (this.trustedSystemUrls.length && this.requisitesForm.url) {
        let included = false
        if (/^https:\/\/[^ "]+$/.test(this.requisitesForm.url)) {
          included = this.trustedSystemUrls.some(url => this.getProtocolDomain(url) === this.getProtocolDomain(this.requisitesForm.url))
        }

        if (!included) {
          this.errorUrlText = true
          this.errorUrlTextHeader = true
          this.errorText = this.textWrongUrl
        } else {
          this.error = false
          this.errorUrlText = false
          this.errorUrlTextHeader = false
          this.requiredField = false
        }
      }
    },
    onSubmit() {
      this.checkForRequired()
      this.v$.$touch()

      if (
        this.v$.$invalid
        || this.errorUrlText
        || this.requiredField
      ) {
        return
      }

      this.$emit('startDealRequest', this.requisitesForm.url || this.requisitesForm.free)
      this.v$.$reset()
      this.requisitesForm.url = this.requisitesForm.free = ''
      this.submitDisabled = false
      this.$emit('closeDialogThin')
    },
    getProtocolDomain(url) {
      try {
        const { protocol, hostname } = new URL(url)
        const parseHost = hostname.split('.')
        if (parseHost.length > 4) {
          return false
        }

        const domain = parseHost.slice(-2).join('.')

        return `${protocol}//${domain}`
      } catch (error) {
        return false
      }
    },
  },
}
</script>

<style lang="scss">
.v-input-error.v-input-error_error {
  display: none;
}
button {
  outline: none;
}
.chat-dialog {

  &__title {
    font-size: var(--fz-h2);
    line-height: var(--lh-sm);
    font-weight: var(--fw-600);
    padding-right: 24px;
    padding-bottom: 24px;
  }

  &__or {
    font-size: var(--fz-md);
    color: var(--c-gray-20);
    font-weight: var(--fw-500);
    text-align: center;
    margin-top: 4px;
    margin-bottom: 12px;
  }

  &__error{
    color: var(--c-bd--alert);
    font-size: var(--fz-xs);
    margin-top: 6px;
  }

  &__warning-input {
    input {
      border: 2px solid var(--c-bd--alert);
      &:hover {
         border: 2px solid var(--c-bd--alert);
      }
      &:focus {
         border: 2px solid var(--c-bd--alert);
      }
    }
  }

  &__link {
    font-size: var(--fz-sm);
    color: var(--c-primary);
    margin-top: 16px;
    cursor: pointer;

    &:focus {
     outline: none;
    }
  }
  &__action {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
   .underline-link {
     input {
       text-decoration: underline;
     }
   }
  .list {
    margin: 0;

    &__item {
      color: var(--c-gray-70);
      font-size: var(--fz-sm);
      line-height: 20px;
      padding: 8px 0;
      display: flex;

      &:before {
        content: '';
        width: 5px;
        height: 5px;
        display: block;
        background:  var(--c-gray-70);
        border-radius: var(--bdrs-fifty);
        margin-right: 12px;
        margin-top: 8px;
      }
    }
  }

  &__warning {
    display: flex;
    justify-content: space-between;
    color: var(--c-alert);
    width: 100%;
    font-size: var(--fz-sm);
    line-height: var(--lh-xm);
    margin-bottom: 16px;

    &-icon {
      display: block;
      align-self: flex-start;
      fill: currentColor;
    }

    &-text {
      width: calc(100% - 32px);
      display: block;
      align-self: center;

      @media (min-width: 1200px) {
        width: calc(100% - 40px);
      }
    }
  }
}

</style>
