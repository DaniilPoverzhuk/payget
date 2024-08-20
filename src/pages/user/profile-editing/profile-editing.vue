<template lang="pug">
div.profile-editing
  div.profile-editing__section
    PersonalData(
      :user.sync='user'
    )
  div.profile-editing__section
    h3 {{ $t('user.passwordChange') }}
    PasswordChanging(
      :userId='user.id'
    )
  div.profile-editing__section.security
    h3.mb-6  {{ $t('user.twoFactor') }}
    .security__authentication.authentication.mb-2
      .authentication__text
        | {{ $t('user.googleVerification') }}:
        span.authentication__status.ml-2(
          :class='googleSecurity && "authentication__status--on"'
        )
          | &#32;{{ $t(googleSecurity ? 'button.enabled' : 'button.disabled')  }}

        Button(
          v-if="googleSecurity"
          class="mt-4"
          icon='google-authenticator'
          :loading='changingGoogleSecurity'
          viewColor='grey'
          @click='toggleGoogleSecurity'
        ) {{ $t('button.unplug') }}
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import PersonalData from 'src/components/personal-data/personal-data.vue'
import PasswordChanging from 'src/components/password-changing/password-changing.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  name: 'ProfileEditing',
  components: {
    PersonalData,
    PasswordChanging,
    VInput,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      changePasswordDialog: false,
      googleSecurity: '',
      changingGoogleSecurity: false,
    }
  },
  computed: {
    ...mapUserState(['id', 'role']),
  },
  mounted() {
    this.googleSecurity = !!this.user.google_security
  },
  methods: {
    async toggleGoogleSecurity() {
      if (!this.googleSecurity) return
      this.changingGoogleSecurity = true
      try {
        const { data: { status, message } } = await this.$instance({
          url: 'user/update',
          data: {
            google_security: false,
            user_id: this.user.id,
          },
        })
        if (status) {
          this.googleSecurity = false
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
      this.changingGoogleSecurity = false
    },
  },
}
</script>

<style lang="scss">
.profile-editing {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 50px 100px;
}

.profile-editing__button-holder {
  margin-top: 28px;
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
</style>
