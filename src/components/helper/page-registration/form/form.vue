<template>
  <form class="space-y-6" @submit.prevent="signUp">
    <VInput
      v-model="login"
      :label="$t('headers.login')"
      type="text"
      :v="v$.login"
    />
    <VInput
      v-model="nickname"
      :label="$t('headers.nickname')"
      type="text"
      :v="v$.nickname"
    />
    <VInput
      v-model="email"
      :v="v$.email"
      label="E-mail"
      :label-note="`(${$t('user.optional')})`"
      type="email"
    />
    <VInput
      v-model="password"
      :label="$t('auth.password')"
      type="password"
      :v="v$.password"
    />
    <VInput
      v-model="repeatedPassword"
      :label="$t('auth.passwordRepeat')"
      type="password"
      :v="v$.repeatedPassword"
    />
    <div class="py-0.5">
      <Captcha ref="$captcha" @load="(value) => (captchaKey = value)" />
      <p
        class="text-sm -mb-3 text-gray-400 text-gray-500 lg:mt-2 max-w-3xl xs:mt-3"
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

    <button
      class="w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-primary-dark"
      :submit="true"
      :disabled="singUpInProgress"
      :wide="true"
      size="lg"
    >
      {{ $t('auth.register') }}
    </button>
  </form>
</template>

<script>
import { createNamespacedHelpers, useStore } from 'vuex'
// import {
//   required, sameAs, email, minLength, not,
// } from 'vuelidate/lib/validators'

import { useVuelidate } from '@vuelidate/core'
import { withParams } from 'vuelidate/lib/validators/common'
import { required, sameAs, email, minLength, not } from '@vuelidate/validators'

import VInput from 'src/components/extends/v-input/v-input.vue'
import Captcha from 'src/components/extends/captcha/captcha.vue'

import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'

import error from 'src/error.js'

// import Button from 'src/components/extends/button/button.vue'

const notSameAs = (fieldName) => {
  const res = withParams(
    { type: 'notSameAs', field: fieldName },
    (value, parentVm) => {
      return value !== parentVm[fieldName]
    }
  )
  return res
}

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
  mapActions: mapUserActions,
} = createNamespacedHelpers('user')
const { mapActions: mapNotificationsActions } =
  createNamespacedHelpers('notifications')
export default {
  components: {
    VInput,
    Captcha,
    // Button
  },
  props: {},
  // setup () {
  //   return { v$: useVuelidate() }
  // },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const $store = useStore()
    if ($store.state.user.auth) {
      router.push('/')
    }
    return {
      showNotif(param) {
        $q.notify({
          message: 'param',
          caption: '5 minutes ago',
          color: 'secondary',
        })
      },
      v$: useVuelidate(),
    }
  },
  data: () => ({
    login: '',
    nickname: '',
    email: '',
    password: '',
    repeatedPassword: '',
    singUpInProgress: false,
    captcha: '',
    captchaKey: '',
  }),
  computed: {
    ...mapUserState(['banned_at', 'error', 'role', 'id']),
  },
  validations() {
    return {
      login: {
        required,
        $autoDirty: true,
      },
      nickname: {
        required,
        notSameAsLogin: notSameAs('login'),
        $autoDirty: true,
      },
      email: {
        email,
        $autoDirty: true,
      },
      password: {
        required,
        minLength: minLength(8),
        $autoDirty: true,
      },
      repeatedPassword: {
        required,
        sameAsPassword: sameAs(this.password),
        $autoDirty: true,
      },
      captcha: {
        required,
        // $autoDirty: true
      },
    }
  },
  methods: {
    ...mapUserActions(['signIn']),
    async signUp() {
      this.v$.$touch()

      if (this.v$.$invalid) return

      this.singUpInProgress = true
      try {
        const referralId = this.$cookies.get('referralId') || ''
        const {
          data: { status: registerStatus, message: registerMessage },
        } = await this.$noAuth({
          url: 'user/register',
          data: {
            login: this.login,
            name: this.nickname,
            password: this.password,
            password_confirmation: this.repeatedPassword,
            ...(this.email ? { email: this.email } : {}),
            ...(referralId ? { ref: referralId } : {}),
            captcha: this.captcha,
            captcha_key: this.captchaKey,
          },
        })

        this.$refs?.$captcha?.getCaptcha()

        if (registerStatus) {
          if (referralId) {
            this.$cookies.remove('referralId')
          }

          try {
            await this.signIn({
              username: this.login,
              password: this.password,
              captcha: this.captcha,
              captchaKey: this.captchaKey,
            })

            this.$router.push('/')
          } catch {
            this.$error.show(this.$t('error.couldntLogin'))
          }
        } else {
          this.$error.show(registerMessage)
        }
      } catch (e) {
        this.$error.show(e)
      }

      this.singUpInProgress = false
    },
  },
}
</script>
