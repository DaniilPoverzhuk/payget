<template>
  <div class="profile-telegram">
    <div class="flex flex-col">
      <p class="text-base text-gray-700 dark:text-gray-300 font-medium mb-2">
        {{ $t(!isTelegramData ? 'user.forChatText' : 'channel.telegramBot') }}
      </p>
      <a
        v-if="!isTelegramData"
        class="text-base text-primary font-medium mb-4"
        :href="'https://' + link"
        target="_blank"
      >
        {{ link }}
      </a>
      <Button
        v-if="!isTelegramData"
        view-color="white"
        class="max-w-sm"
        icon="clipboard-copy"
        @click="copyLink"
      >
        {{ $t('button.copyLink') }}
      </Button>
    </div>
    <div v-if="created">
      <div class="flex flex-col space-y-4 mb-6 mt-4">
        <!-- <p
                    class="text-sm font-medium text-gray-700 mb-1"
                >
                    {{$t('user.userNickToTelegram')}}
                </p> -->
        <form
          v-if="!isTelegramData"
          class="max-w-sm"
          @submit.prevent="sendCode"
        >
          <VInput
            v-model="codeTelegram"
            class="rounded-md border-gray-300 w-full mb-6"
            type="text"
            :v="v$.codeTelegram"
            :placeholder="$t('user.codeConfirmation')"
          />
          <Button view-color="white" class="w-full" :submit="true">
            {{ $t('user.codeSubmit') }}
          </Button>
        </form>
        <Button
          v-if="isTelegramData"
          view-color="white"
          class="max-w-sm"
          @click="dialogRemoveTg = true"
        >
          {{ $t('button.unplug') }}
        </Button>
      </div>

      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 my-4">
        {{ $t('user.selectNotificationTelegramText') }}
      </p>
      <div
        v-if="settings !== null"
        class="flex flex-col mt-4 lg:w-384 space-y-4"
      >
        <template v-for="(notice, key) in settings" :key="key">
          <Toggler
            v-model="notice.state"
            :some-data="key"
            :label="notice.label"
            :right="true"
            @update:modelValue="toggleSettings(key, notice.state)"
          />
        </template>
      </div>
    </div>
    <Dialog
      v-model="dialogRemoveTg"
      :error="false"
      :is-icon="false"
      class-custom="max-w-lg"
    >
      <div class="m-auto relative rounded-lg">
        <div class="flex items-start xs:flex-col xs:items-center">
          <div class="bg-red-100 rounded-3xl p-2.5 mr-4 xs:mb-3">
            <svg v-svg class="w-6 h-6 text-red-600" symbol="warning-new" />
          </div>
          <div class="xs:flex xs:text-center xs:flex-col">
            <h2 class="text-lg text-gray-900 dark:text-white font-medium mb-2">
              {{ $t('user.disableTelegramBot') }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-300 mb-4">
              {{ $t('user.confirmationDisablingTelegramBot') }}
            </p>
          </div>
        </div>
        <div class="w-full flex justify-end xs:flex-col">
          <Button view-color="white" @click="dialogRemoveTg = false">
            {{ $t('button.cancel') }}
          </Button>
          <!--          <button-->
          <!--            class="py-2 px-4 border cursor-pointer border-solid border-gray-300 dark:border-gray-500 rounded-md xs:order-2 xs:text-center"-->
          <!--            @click="cancelTelegram"-->
          <!--          >-->
          <!--            {{ $t("button.cancel") }}-->
          <!--          </button>-->
          <button
            class="py-2 px-4 cursor-pointer bg-red-600 text-white rounded-md ml-3 xs:m-0 xs:mb-3 xs:text-center"
            @click="deleteTelegram"
          >
            {{ $t('button.unplug') }}
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { required } from '@vuelidate/validators'
import Toggler from 'src/components/extends/v-toggler/v-toggler.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import useVuelidate from '@vuelidate/core'

const codeTelegramValidate = (value) => value.length === 8

const { mapState: mapNotificationsState, mapActions: mapNotificationsActions } =
  createNamespacedHelpers('notifications')

const { mapState: mapUserState } = createNamespacedHelpers('user')
export default {
  name: 'ProfileTelegram',
  components: {
    Toggler,
    Dialog,
    VInput,
  },
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
  data() {
    return {
      link: '',
      created: true,
      dialogRemoveTg: false,
      codeTelegram: '',
      settings: null,
      isTelegramData: false,
    }
  },
  validations: {
    codeTelegram: {
      required,
      codeTelegramValidate,
    },
  },
  computed: {
    ...mapUserState(['id', 'telegram']),
    ...mapNotificationsState(['settingsTelegram']),
  },
  watch: {
    settingsTelegram() {
      this.settings = JSON.parse(JSON.stringify(this.settingsTelegram))
    },
    $locale: function () {
      this.setSettings()
    },
    telegram() {
      this.isTelegramData = this.telegram !== null
    },
  },
  mounted() {
    this.isTelegramData = this.telegram !== null
    this.getLink()
    if (this.settings === null) {
      this.setSettings()
    } else {
      this.settings = JSON.parse(JSON.stringify(this.settingsTelegram))
    }
  },
  methods: {
    ...mapNotificationsActions(['fetchSettings', 'editSettings']),
    async setSettings() {
      try {
        await this.fetchSettings({
          id: this.id,
          namespace: 'telegram',
        })
        this.isLoaderVisible = false
      } catch {
        this.$error.show()
      }
    },
    async toggleSettings(key, state) {
      try {
        await this.editSettings({
          type: 'telegram',
          id: this.id,
          params: [
            {
              key,
              state,
            },
          ],
        })
      } catch {
        this.$error.show()
      }
    },
    async getLink() {
      try {
        const { data } = await this.$instance({
          method: 'GET',
          url: 'telegram/link',
          params: {},
        })
        if (data) {
          this.link = data.data.message
        }
      } catch {
        this.$error.show()
      }
    },

    async sendCode() {
      this.v$.$touch()
      if (this.v$.$invalid) return
      try {
        const {
          data: { message, errors },
        } = await this.$instance({
          url: 'telegram/confirmation',
          data: {
            code: this.codeTelegram,
          },
        })
        if (!errors) {
          this.isTelegramData = true
          this.codeTelegram = ''
        } else {
          this.$error.show(errors.title, errors.message)
        }
      } catch {
        this.$error.show()
      }
    },

    copyLink() {
      navigator.clipboard.writeText(this.link)
    },
    async fetchRemoveTelegram() {
      try {
        await this.$instance({
          method: 'GET',
          url: 'telegram/disconnect',
        })
        this.isTelegramData = false
      } catch {
        this.$error.show()
      }
      this.dialogRemoveTg = false
    },
    async deleteTelegram() {
      this.dialogRemoveTg = true
      this.fetchRemoveTelegram()
    },
  },
}
</script>
