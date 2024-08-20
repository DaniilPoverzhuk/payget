<template>
  <div class="profile-settings__wrap profile-api">
    <div class="profile-settings__col">
      <div class="profile-settings__row">
        <h3 class="profile-settings__subtitle">{{ $t('auth.tokenApi') }}</h3>
        <div class="token">
          <VInput
            v-if="token_api"
            v-model="token_api"
            :readonly="true"
            :placeholder="$t('auth.tokenApi')"
            type="textarea"
            :rows="3"
          ></VInput>
          <div class="token__actions">
            <Button
              view-color="primary"
              class="token__btn"
              v-if="token_api"
              @click="() => copyToClipboard(token_api, 'copyApiKey')"
            >
              {{ $t('button.copy') }}</Button
            >
            <Button
              view-color="secondary"
              class="token__btn"
              :loading="generatingToken"
              type="success"
              @click="generateApiToken"
              >{{
                $t(token_api ? 'button.update' : 'auth.generateToken')
              }}</Button
            >
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="profile-settings__col">
            <div class="profile-settings__row profile-settings__row--right" v-if="!webhookSecret">
                <h3 class="profile-settings__subtitle">WebHook</h3>
                <div class="profile-settings__token-action"><Button :loading="generatingWebhookSecret" type="success" @click="generateWebHookSecret"> {{ $t('button.turnOn') }}</Button></div>
            </div>
            <form class="form" v-if="webhookSecret" @submit.prevent="sendSettings">
                <div class="profile-settings__row profile-settings__row--right">
                    <h3 class="profile-settings__subtitle">{{ $t('auth.outgoingWebhook') }}</h3>
                    <div class="profile-api__secret">
                        <VInput class="form__group" v-model="webhooks.secret" :readonly="true" :label="$t('auth.secret')"></VInput><Button v-if="!webhookSecret" :loading="generatingWebhookSecret" type="success" @click="generateWebHookSecret"> {{ $t('button.turnOn') }}</Button>
                    </div>
                </div>
                <div class="profile-settings__row profile-settings__row--right">
                    <div class="profile-settings__token-action"><Button class="generate" v-if="webhookSecret" :loading="generatingWebhookSecret" @click="generateWebHookSecret">{{ $t('auth.generate') }}</Button></div>
                </div>
                <div class="profile-settings__row profile-settings__row--right generate">
                    <VInput class="form__group" v-model="webhookUrl" :v="v$.webhookUrl" :label="$t('auth.handlerUrl')"></VInput>
                </div><template v-if="webhookSecret">
                    <div class="profile-settings__row profile-settings__row--right">
                        <div class="form__input-label">{{ $t('auth.eventType') }}
                            <VCheckbox class="v-input__input-checkbox-container" v-for="actionItem in webhooksActions" :key="actionItem.action" name="action" v-model="webhookActionSelected" :val="actionItem.action" :label="$t(`home.${actionItem.action}`)"></VCheckbox>
                        </div>
                    </div>
                </template>
                <div class="profile-settings__row profile-settings__row--right">
                    <div class="profile-settings__token-action"><Button v-if="webhookSecret" :disabled="webhookDisableButton" :loading="saveWebhookSettings" :submit="true">{{ $t('button.save') }}</Button></div>
                </div>
            </form>
        </div> -->
  </div>
</template>

<script>
// import { required, url } from 'vuelidate/lib/validators'

import { useVuelidate } from '@vuelidate/core'
import { required, url } from '@vuelidate/validators'

import { createNamespacedHelpers } from 'vuex'
import VCheckbox from 'src/components/v-checkbox/v-checkbox.vue'
import copyToClipboard from 'src/mixins/copy-to-clipboard.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'

const { mapMutations: mapUserMutations, mapState: mapUserState } =
  createNamespacedHelpers('user')

export default {
  name: 'ProfileApi',
  components: {
    VInput,
    // VCheckbox,
  },
  mixins: [copyToClipboard],
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
  data() {
    return {
      generatingToken: false,
      webhookSecret: false,
      generatingWebhookSecret: false,
      saveWebhookSettings: false,
      webhookUrl: null,
      webhooksActions: [],
      webhookActionSelected: [],
      webhookDisableButton: false,
    }
  },
  validations() {
    return {
      googleCode: {
        required,
      },
      webhookUrl: {
        url,
      },
    }
  },
  computed: {
    ...mapUserState(['token_api', 'webhooks']),
  },
  watch: {
    webhooks: {
      immediate: true,
      handler(value) {
        if (value) {
          this.webhookSecret = value.secret
          this.webhookUrl = value.url
          this.webhooksActions = value.actions
          this.webhookActionSelected = []
          Object.keys(this.webhooksActions).forEach((key) => {
            if (this.webhooksActions[key].value === true) {
              this.webhookActionSelected.push(this.webhooksActions[key].action)
            }
          })
          return value
        }
        this.webhookSecret = false
        return {
          secret: false,
        }
      },
    },
    webhookUrl() {
      this.webhookDisableButton = this.v$.webhookUrl.$invalid
    },
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
  methods: {
    ...mapUserMutations(['init']),
    async sendSettings() {
      const params = {
        url: this.webhookUrl,
      }
      Object.keys(this.webhooksActions).forEach((key) => {
        const actionName = this.webhooksActions[key].action
        const state = this.webhookActionSelected.includes(actionName)
        if (state === true) {
          params[actionName] = state
        }
      })
      this.saveWebhookSettings = true

      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'user/webhook/settings',
          data: params,
        })

        if (status) {
          this.init({
            webhooks: data,
          })
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
      this.saveWebhookSettings = false
    },
    async generateWebHookSecret() {
      this.generatingWebhookSecret = true
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'user/webhook/generate',
        })

        if (status) {
          this.init({
            webhooks: data,
          })
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.generatingWebhookSecret = false
    },
    async generateApiToken() {
      this.generatingToken = true
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'user/generate/token',
        })

        if (status) {
          this.init({
            token_api: data.token_api,
          })
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.generatingToken = false
    },
  },
}
</script>

<style lang="scss">
.profile-settings__row {
  margin-bottom: 40px;
}

.profile-api {
  &__secret {
    margin-bottom: 24px;
  }

  .token {
    &__actions {
      display: flex;
      flex-wrap: wrap;
      margin-top: 24px;
    }

    &__btn {
      margin-right: 33px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
