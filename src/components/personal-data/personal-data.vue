<template>
  <form class="form" @submit.prevent="updatePersonalData">
    <h2
      class="profile-settings__subtitle"
      :class="{ 'profile-settings__toggle': !isAdmin && !user }"
      v-text="$t(isAdmin && user ? 'user.personalData' : 'user.privateData')"
    ></h2>
    <div class="form__error" v-if="error">
      <svg class="form__error-icon" v-svg size="24" symbol="warning"></svg>
      <div class="form__error-text">{{ error }}</div>
    </div>
    <template v-if="v$.personalData">
      <VInput
        class="form__group"
        v-model="personalData.name"
        :v="v$.personalData.name"
        :label="$t('headers.nickname')"
        @update:modelValue="resetError"
        :underLabel="personalData.is_verified ? 'channel.nicknameVerified' : ''"
        :disabled="personalData.is_verified"
      ></VInput>
      <VInput
        class="form__group"
        v-model="personalData.email"
        :v="v$.personalData.email"
        :label="$t('user.emailJabber')"
        @update:modelValue="resetError"
      ></VInput>
      <VInput
        class="form__group"
        v-model="personalData.about_me"
        :v="v$.personalData.about_me"
        @update:modelValue="resetError"
        type="textarea"
        :label="$t('user.aboutMe')"
        :maxlength="120"
        :rows="4"
      ></VInput>
    </template>
    <div class="form__sum">
      {{ $t('user.aboutMeLetters', sumAboutMe, { count: sumAboutMe }) }}
    </div>
    <div class="form__footer">
      <Button
        :loading="updatingPersonalData"
        view-color="primary"
        :submit="true"
        :wide="true"
        :disabled="!!error"
      >
        {{ $t('button.saveChanges') }}
      </Button>
    </div>
  </form>
</template>

<script>
// import {
//   alphaNum, required, email, maxLength
// } from 'vuelidate/lib/validators'

import { useVuelidate } from '@vuelidate/core'
import { alphaNum, required, email, maxLength } from '@vuelidate/validators'

import { createNamespacedHelpers } from 'vuex'
import { USER_ROLE } from 'src/constants.js'
import VInput from 'src/components/extends/v-input/v-input.vue'

const { mapState: mapUserState, mapActions: mapUserActions } =
  createNamespacedHelpers('user')
const { ADMIN } = USER_ROLE

export default {
  name: 'PersonalData',
  components: {
    VInput,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
  data() {
    return {
      personalData: {
        name: '',
        email: '',
        about_me: '',
        is_verified: false,
      },
      updatingPersonalData: false,
      error: null,
    }
  },
  validations() {
    return {
      personalData: {
        name: { required },
        email: { email },
        about_me: {
          maxLength: maxLength(120),
        },
      },
    }
  },
  computed: {
    ...mapUserState(['name', 'email', 'role', 'about_me', 'is_verified']),
    isAdmin() {
      return this.role === ADMIN
    },
    sumAboutMe() {
      return 120 - this.personalData.about_me.length
    },
  },
  watch: {
    user() {
      this.$emit('update:user', this.user)
    },
  },
  created() {
    this.personalData = {
      name: this.user ? this.user.name : this.name,
      email: this.user ? this.user.email : this.email,
      about_me: this.user ? this.user.about_me : this.about_me,
      is_verified: this.user ? this.user.is_verified : this.is_verified,
    }
  },
  methods: {
    ...mapUserActions(['update']),
    async updatePersonalData() {
      this.v$.personalData.$touch()
      if (this.v$.personalData.$invalid) return
      this.updatingPersonalData = true
      try {
        const { status, message } = await this.update({
          ...this.personalData,
          ...(this.user ? { user_id: this.user.id } : {}),
        })

        if (status) {
          if (this.user) {
            Object.assign(this.user, this.personalData)
          }
        } else {
          this.error = message
        }
      } catch (e) {
        console.log('e', e)
        this.$error.show(e.response.data)
      }

      this.updatingPersonalData = false
    },
    resetError() {
      this.error = null
    },
  },
}
</script>
<style lang="scss">
.form {
  .v-input__container_textarea {
    min-height: auto;
  }

  &__sum {
    font-size: 14px;
    line-height: var(--fz-xl);
    color: var(--c-gray-70);
    margin-top: 5px;
  }
}
</style>
