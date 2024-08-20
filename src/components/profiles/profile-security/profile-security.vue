<template>
    <div class="security">
        <h3 class="profile-settings__subtitle">{{ $t('user.twoFactor') }}</h3>
        <div class="security__authentication authentication">
            <div class="authentication__text">{{ $t('user.googleVerification') }}<span class="authentication__status ml-2" :class="googleSecurity && 'authentication__status--on'"> {{ $t(googleSecurity ? 'button.enabled' : 'button.disabled') }}</span></div>
            <div class="authentication__info" v-if="!qrCode || !googleSecurity"><template v-if="qrCode"><img class="profile-settings__qr-code" :src="qrCode" :alt="$t('user.qrFactor')" />
                    <div class="profile-settings__secret mt-5">{{ $t('user.secretKey') }}: <span class="p authentication__key">{{ secretKey }}</span></div>
                    <VInput class="authentication__code" v-model="googleCode" :v="v$.googleCode" :label="$t('auth.googleAuthentication')" type="text"></VInput>
                </template><template v-else>{{ $t('auth.forSecurityText') }}</template></div>
            <div class="authentication__btn"><Button view-color="secondary" :icon="!changingGoogleSecurity ? 'google-authenticator' : null" :loading="changingGoogleSecurity" :type="!!googleSecurity ? 'info' : 'success'" @click="toggleGoogleSecurity"><template v-if="googleSecurity">{{ $t('button.unplug') }}</template><template v-else-if="qrCode">{{ $t('button.confirm') }}</template><template v-else>{{ $t('button.turnOn') }}</template></Button></div>
        </div>
        <h3 class="profile-settings__subtitle">{{ $t('auth.wouldChangePassword') }}</h3>
        <div class="profile-settings__change-password"><Button view-color="grey" @click="changePasswordDialog = true">{{ $t('auth.changePassword') }}</Button></div>
        <Dialog v-model="changePasswordDialog" :heading="$t('auth.editPassword')" width="narrow" @hide="changePasswordDialog = false">
            <PasswordChanging @changePassword="changePasswordDialog = false"></PasswordChanging>
        </Dialog>
    </div>
</template>

<script>

import { createNamespacedHelpers } from 'vuex'
import PasswordChanging from 'src/components/password-changing/password-changing.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import {required} from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

const {
  mapMutations: mapUserMutations,
  mapState: mapUserState,
} = createNamespacedHelpers('user')


export default {
  name: 'Security',
  components: {
    Dialog,
    PasswordChanging,
    VInput,
  },
  setup() {
    return  {
      v$: useVuelidate()
    }
  },
  data() {
    return {
      qrCode: '',
      changePasswordDialog: false,
      googleSecurity: null,
      changingGoogleSecurity: false,
      secretKey: null,
      googleCode: '',
      webhookVisibility: false,
    }
  },
  computed: {
    ...mapUserState(['google', 'webhooks']),
    googleSecurityButtonClasses() {
      return {
        button_type_info: !!this.googleSecurity,
        button_type_success: !this.googleSecurity,
        button_loading: this.changingGoogleSecurity,
      }
    },
  },
  watch: {
    google: {
      immediate: true,
      handler(value) {
        if (value) {
          if (this.qrCode !== value.qrcode) this.qrCode = value.qrcode
          if (this.secretKey !== value.secret) this.secretKey = value.secret
          this.googleSecurity = value.security || false
        } else {
          this.qrCode = null
          this.secretKey = null
          this.googleSecurity = false
        }
      },
    },
  },
  validations() {
    return {
      googleCode: {
        required,
      },
    }
  },
  methods: {
    ...mapUserMutations(['init']),
    async toggleGoogleSecurity() {
      if (this.qrCode && !this.googleSecurity) {
        this.v$.googleCode.$touch()
        if (this.v$.googleCode.$invalid) return
      }
      this.changingGoogleSecurity = true
      if (this.googleSecurity) {
        try {
          const { data: { status, message } } = await this.$instance({
            url: 'user/update',
            data: {
              google_security: false,
            },
          })

          if (status) {
            this.init({
              google: null,
            })
          } else {
            this.$error.show(message)
          }
        } catch {
          this.$error.show()
        }
      } else {
        try {
          const { data: { data, status, message } } = await this.$instance({
            url: 'user/login/qrcode',
            data: {
              ...(this.qrCode ? { google_code: this.googleCode } : {}),
            },
          })

          if (status) {
            this.init({
              google: {
                ...(this.qrCode ? { qrcode: this.qrCode } : { qrcode: data.image }),
                ...(this.secretKey ? { secret: this.secretKey } : { secret: data.secret }),
                ...(this.qrCode ? { security: true } : {}),
              },
            })
          } else {
            this.$error.show(message)
          }
        } catch {
          this.$error.show()
        }
      }
      this.changingGoogleSecurity = false
    },
  },
}
</script>

<style lang="scss">
.security {
  &__authentication {
    margin-bottom: 40px;
  }

  .authentication {
    font-size: var(--fz-lg);
    line-height: var(--lh-sm);

    &__status {
      color: var(--c-alert);

      &--on {
        color: var(--c-success);
      }
    }

    &__secret {
      margin-top: 10px;

      &-key {
        color: var(--c-gray-80);
        font-weight: 500;
      }
    }

    &__info {
      margin-top: 5px;
      font-size: var(--fz-sm);
      color: var(--c-gray-70);
    }

    &__key {
      color: var(--c-gray-80);
      font-weight: var(--fw-500);
    }

    &__code {
      margin-top: 15px;
    }

    &__btn {
      margin-top: 15px;
    }
  }
}

</style>
