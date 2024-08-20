<template>
    <form class="form" @submit.prevent="changePassword">
        <VInput class="form__group" v-if="!userId" v-model="password.old" :v="v$.password?.old" type="password" :label="$t('user.passwordOld')"></VInput>
        <VInput class="form__group" v-model="password.new" :v="v$.password?.new" type="password" :label="$t('user.passwordNew')"></VInput>
        <VInput class="form__group" v-model="password.repeated" :v="v$.password?.repeated" type="password" :label="$t('user.passwordRepeat')"></VInput>
        <div class="form__footer"><Button :loading="changingPassword" :submit="true" :wide="true" view-color="primary">{{ $t('user.passwordSave') }}</Button></div>
    </form>
</template>

<script>
import {
  required, sameAs, minLength,
} from '@vuelidate/validators'
import VInput from 'src/components/extends/v-input/v-input.vue'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'PasswordChanging',
  components: {
    VInput,
  },
  props: {
    userId: {
      type: Number,
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
      changingPassword: false,
      password: {
        old: '',
        new: '',
        repeated: '',
      },
    }
  },
  validations() {
    const validation = {
      password: {
        new: {
          required,
          minLength: minLength(8),
        },
        repeated: {
          required,
          sameAsPassword: sameAs(this.password.new),
        },
      }
    }

    if (!this.userId) {
      validation.password.old = {
        required,
        minLength: minLength(8),
      }
    }

    return validation
  },
  methods: {
    async changePassword() {
      this.v$.password.$touch()

      if (this.v$.password.$invalid) return

      this.changingPassword = true

      try {
        const { data: { status, message } } = await this.$instance({
          url: 'user/password/change',
          data: {
            ...(this.userId ? { user_id: this.userId } : { old_password: this.password.old }),
            password: this.password.new,
            confirmation_password: this.password.repeated,
          },
        })

        if (!status) {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.changingPassword = false
      this.password = {
        old: '',
        new: '',
        repeated: '',
      }
      this.v$.password.$reset()
      this.$emit('changePassword')
    },
  },
}
</script>
