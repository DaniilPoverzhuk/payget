<template>
  <div class="flex flex-col justify-center lg:px-8 xs:pb-5">
    <div class="mx-auto w-full lg:max-w-md">
      <div
        class="bg-white py-8 px-4 lg:shadow lg:rounded-lg lg:px-10 xs:border-b-2 xs:border-gray-200"
      >
        <form class="space-y-6" @submit.prevent="localSignIn">
          <VInput
            v-model="login"
            :label="$t('headers.login')"
            type="text"
            :v="v$.login"
          />
          <VInput
            v-model="password"
            :label="$t('auth.password')"
            type="password"
            :v="v$.password"
          />
          <div class="py-0.5">
            <Captcha ref="$captcha" @load="(value) => (captchaKey = value)" />
            <p
              class="text-sm -mb-3 text-gray-400 text-gray-700 lg:mt-2 max-w-3xl xs:mt-3"
            >
              {{ $t('error.charactersEnter') }}
            </p>
          </div>

          <VInput
            v-model="captcha"
            :label="$t('auth.enterCode')"
            type="text"
            :v="v$.captcha"
          />
          <VInput
            v-model="qrCode"
            :label="$t('user.googleAuthentication')"
            type="text"
          />
          <button
            class="w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-primary-dark"
            :loading="singInInProgress"
            :submit="true"
            size="lg"
          >
            {{ $t('auth.logiin') }}
          </button>
        </form>
        <div class="flex justify-center mt-6">
          <TgAuth
            mode="callback"
            :telegram-login="tgBot"
            @callback="tgLoginCb"
          />
        </div>
      </div>
    </div>
    <q-dialog v-model="error">
      <q-card class="font-sans">
        <q-card-section class="q-pt-md q-pb-md flex items-center">
          <q-icon name="report_problem" size="2em" color="negative" />
          <span class="text-h6 q-ml-md">{{ $t('error.error') }}</span>
          <q-btn class="ml-auto" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="login-error">
          <p>{{ errorMessage }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :label="$t('button.close')"
            color="negative"
            @click="error = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
// import { required } from 'vuelidate/lib/validators'

import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'

import Captcha from 'src/components/extends/captcha/captcha.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import TgAuth from 'src/components/helper/page-main/form/tg-auth.vue'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
  mapActions: mapUserActions,
} = createNamespacedHelpers('user')
const { mapActions: mapEchoActions } = createNamespacedHelpers('echo')
export default {
  components: {
    VInput,
    Captcha,
    TgAuth,
  },
  props: {},
  setup() {
    return { v$: useVuelidate() }
  },
  data: () => ({
    singInInProgress: false,
    login: '',
    password: '',
    authCode: '',
    captcha: '',
    captchaKey: null,
    qrCode: '',
    error: false,
    errorMessage: '',
  }),
  validations() {
    return {
      login: {
        required,
      },
      password: {
        required,
      },
      captcha: {
        required,
      },
      ...(this.google ? { qrCode: { required } } : {}),
    }
  },
  computed: {
    ...mapUserState(['accessToken', 'google']),
    tgBot() {
      return process.env.VUE_APP_TELEGRAM_BOT || ''
    },
  },
  created() {
    this.errorMessage = this.$t('error.loginInvalid')
  },
  methods: {
    ...mapUserMutations(['init']),
    ...mapUserActions(['signIn', 'signInTg']),
    async localSignIn() {
      this.v$.$touch()
      if (this.v$.$invalid) return
      this.singInInProgress = true
      try {
        await this.signIn({
          username: this.login,
          password: this.password,
          captcha: this.captcha,
          captchaKey: this.captchaKey,
          qrCode: this.qrCode,
        })
        // if (this.accessToken) this.$router.go()
      } catch (e) {
        this.errorMessage =
          e?.response?.data == 'captcha error'
            ? this.$t('error.captchaInvalid')
            : this.$t('error.loginInvalid')
        this.$refs?.$captcha?.getCaptcha()
        this.error = true
        // if(e.response.status == 422) {
        // }
      }
      this.singInInProgress = false
    },
    async tgLoginCb(user) {
      const sendUser = new URLSearchParams(user).toString()
      try {
        await this.signInTg(sendUser)
        this.$router.push('/')
      } catch (e) {
        console.log('error:', e)
        this.$error.show(this.$t('error.couldntLogin'))
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.login-error {
  width: 280px;
}
</style>
