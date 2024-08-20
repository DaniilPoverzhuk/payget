<template>
  <div class="complaintPost__inner">
    <template v-if="!success">
      <div class="complaintPost__wrap">
        <h2 class="complaintPost__title">{{ $t('complaints.complain') }}</h2>
        <div class="complaintPost__item">
          <q-select
            v-model="active"
            :options="types"
            option-value="id"
            option-label="name"
            behavior="menu"
            :dark="isDark"
            outlined
            :dense="false"
          >
            <template v-slot:selected>
              <template v-if="active">
                {{ active.name }}
              </template>
              <template v-else>
                {{ $t('complaints.chooseReason') }}
              </template>
            </template>
          </q-select>
        </div>
        <transition name="fade">
          <div
            class="complaintPost__item"
            v-if="active !== null && active.has_free"
          >
            <VInput
              class="form__group"
              v-model.trim="complaintText"
              type="text"
              :label="$t('complaints.complaintComment') + ':'"
              :v="v$.complaintText"
            ></VInput>
            <div class="form__sum">
              {{
                $t('user.aboutMeLetters', sumСomplaintText, {
                  count: sumСomplaintText,
                })
              }}
            </div>
          </div>
        </transition>
        <div class="complaintPost__actions">
          <button
            class="button button_type_info complaintPost__btn"
            @click="$emit('hide')"
          >
            {{ $t('button.cancel') }}
          </button>
          <button
            class="button complaintPost__btn"
            :disabled="isLoading"
            @click="complaintPost"
          >
            {{ $t('button.send') }}
          </button>
        </div>
      </div>
    </template>
    <div class="success" v-else>
      <div class="success__wrap">
        <svg class="success__icons" v-svg symbol="check" size="64"></svg>
      </div>
      <h2 class="success__title">{{ $t('complaints.complaintAccepted') }}</h2>
      <p class="success__text">{{ $t('complaints.reviewedAdmin') }}</p>
    </div>
  </div>
</template>

<script>
import { required, minLength, maxLength } from '@vuelidate/validators'
import { createNamespacedHelpers } from 'vuex'
import VInput from 'src/components/extends/v-input/v-input.vue'
import useVuelidate from '@vuelidate/core'

const { mapState: mapUserState } = createNamespacedHelpers('user')
export default {
  name: 'ChannelComplaint',
  components: {
    VInput,
  },
  props: {
    postId: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Number,
      default: 0,
    },
    types: {
      type: Array,
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
      success: false,
      complaintText: '',
      active: null,
      error: false,
      dropdownMenu: false,
      isLoading: false,
    }
  },
  computed: {
    ...mapUserState(['id']),
    sumСomplaintText() {
      return 120 - this.complaintText.length
    },
    isDark() {
      return this.$store.state.user.color_theme === 'dark'
    },
  },
  validations() {
    const validation = {
      complaintText: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(120),
      },
    }
    return validation
  },
  methods: {
    complaintPost() {
      if (
        this.active == null ||
        (this.active.has_free && !this.complaintText)
      ) {
        this.error = true
        this.v$.complaintText.$touch()
        return false
      }
      this.error = false
      this.submitPost()
    },
    async submitPost() {
      if (this.active.has_free && this.v$.$invalid) return false
      this.isLoading = true
      const form = new FormData()
      form.append('channel_post_id', this.postId)
      form.append('type_id', this.active.id)
      form.append('user_id', this.id)
      if (this.active.has_free) form.append('description', this.complaintText)
      try {
        const { status } = await this.$instance({
          url: `userfeed/post/${this.postId}/complaint`,
          data: form,
        })
        if (status) {
          this.success = true
          setTimeout(() => this.$emit('hide'), 3000)
        } else {
          this.$error.show('complaint')
        }
      } catch {
        this.$error.show()
      }
      this.isLoading = false
    },
  },
}
</script>

<style lang="scss" scoped>
.complaintPost {
  max-width: 316px;
  width: 100%;

  @media (min-width: 1200px) {
    padding: 60px 57px;
    max-width: 476px;
  }

  &__wrap {
    @media (min-width: 1200px) {
      margin: auto;
      max-width: 340px;
    }
  }

  &__item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__btn {
    min-width: 128px;
    margin-right: 20px;

    @media (min-width: 1200px) {
      margin-right: 26px;
      min-width: 156px;
    }

    &:last-of-type {
      margin-right: 0;
    }
  }

  &__title {
    font-weight: var(--fw-600);
    font-size: 18px;
    line-height: 1.4;
    text-align: center;
    margin-bottom: 28px;

    @media (min-width: 1200px) {
      font-size: 22px;
    }

    &-line {
      @media (min-width: 1200px) {
        display: inline-block;
      }
    }
  }

  &__actions {
    display: flex;
  }

  .dropdown {
    position: relative;

    &__toggle {
      background-color: var(--c-white);
      width: 100%;
      border: 2px solid var(--c-gray-15);
      box-sizing: border-box;
      padding: 9px 17px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border-radius: var(--bdrs-default);
      overflow: hidden;
      font-size: 14px;
      line-height: 1.4;
      font-weight: var(--fw-500);
      color: var(--c-gray-70);
      position: relative;
      cursor: pointer;

      &:hover,
      &:focus {
        border: 2px solid var(--c-primary);
      }

      &-icon {
        position: absolute;
        display: block;
        fill: currentColor;
        width: 10px;
        height: 6px;
        right: 18px;
        top: calc(50% - 2px);
        transition: 0.3s;

        &--active {
          transform: rotate(180deg);
        }
      }

      &.error {
        border-color: var(--c-alert);
      }
    }

    &__menu {
      z-index: 9;
      background-color: var(--c-white);
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      margin-top: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: var(--bdrs-default);
      overflow: hidden;
    }

    &__item {
      display: block;
      color: var(--c-gray-70);
      font-size: 14px;
      line-height: 1.43;
      padding: 8px 16px;
      width: 100%;
      cursor: pointer;
      border-bottom: 1px solid var(--c-gray-10);

      &:hover,
      &:focus {
        background-color: var(--c-primary);
        border-color: var(--c-primary);
        color: var(--c-white);
      }
    }
  }
}

.success {
  text-align: center;
  &__wrap {
    text-align: center;
    display: inline-flex;
    justify-content: center;
  }

  &__icons {
    width: 64px;
    margin-bottom: 24px;
    color: var(--q-positive);
  }

  &__title {
    text-align: center;
    font-size: 22px;
    color: var(--c-gray-80);
    font-weight: var(--fw-600);
    margin-bottom: 8px;
  }

  &__text {
    text-align: center;
    font-size: 18px;
    color: var(--c-gray-70);
    font-weight: var(--fw-600);
  }
}
</style>

<style lang="scss">
.complaintPost__item {
  text-align: inherit;
  .q-field--auto-height .q-field__control {
    height: 48px;
    padding-left: 20px;
  }
}
</style>
