<template>
  <div class="profile-settings__wrap profile-imports">
    <div class="profile-settings__col">
      <div class="profile-settings__row">
        <h3 class="profile-settings__subtitle">
          {{ $t('user.urlFileImport') }}
        </h3>
        <div class="imports">
          <VInput
            v-if="allow_import"
            v-model="offerFile"
            :placeholder="$t('user.placeholderFileImport')"
            :rows="3"
          ></VInput>
          <div class="imports__actions">
            <Button
              view-color="secondary"
              class="imports__btn"
              :loading="isLoading"
              :disabled="!offerFile"
              @click="onSave"
            >
              {{ $t('button.save') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import VInput from 'src/components/extends/v-input/v-input.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'ProfileImports',
  components: {
    VInput,
  },
  data() {
    return {
      isLoading: false,
      offerFile: '',
    }
  },
  computed: {
    ...mapUserState(['allow_import', 'offer_file']),
  },
  created() {
    this.offerFile = this.offer_file || ''
  },
  methods: {
    async onSave() {
      this.isLoading = true
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'user/update',
          data: {
            offer_file: this.offerFile,
          },
        })

        if (!status) {
          this.$error.show(message)
        }
      } catch (e) {
        console.log('e', e)
        this.$error.show(e)
      }

      this.isLoading = false
    },
  },
}
</script>

<style lang="scss">
.profile-settings__row {
  margin-bottom: 40px;
}

.profile-imports {
  .imports {
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
