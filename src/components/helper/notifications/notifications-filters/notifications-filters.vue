<template>
  <div>
    <Loader v-if="setting === null" />
    <template
      v-else
    >
      <div class="space-y-4">
        <Toggler
          v-model="setting.is_alert"
          class=""
          :label="$t('notifications.popUpNotifications')"
          :right="true"
          class-label="text-base"
          :value="setting.is_alert"
          @update:modelValue="toggleSettings('is_alert', setting.is_alert)"
        />
        <Toggler
          v-model="setting.is_sound"
          class=""
          :label="$t('notifications.soundNotifications')"
          :right="true"
          class-label="text-base text-gray-700 dark:text-gray-300 "
          :value="setting.is_sound"
          @update:modelValue="toggleSettings('is_muted', !setting.is_sound)"
        />
      </div>
      <p class="text-xl font-medium text-gray-400 dark:text-gray-500 pb-3 pt-6">
        {{ $t('notifications.notificationsEvents') }}
      </p>
      <div
        class="space-y-4"
      >
        <Toggler
          v-for="(option, key) in setting.settings"
          :key="key"
          v-model="option.state"
          :some-settings-app="key"
          :label="option.label"
          :value="option.state"
          class-label="text-base text-gray-700 dark:text-gray-300 "
          :right="true"
          @update:modelValue="toggleSettings(key, option.state)"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Toggler from 'src/components/extends/v-toggler/v-toggler.vue'
import Loader from 'src/components/extends/loader/loader.vue'


const {
  mapState: mapNotificationsState,
  mapActions: mapNotificationsActions,
} = createNamespacedHelpers('notifications')

export default {
  name: 'NotificationsFilters',
  components: {
    Toggler,
    Loader,
  },
  props: {
    id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      setting: null,
      isLoaderVisible: false,
    }
  },
  computed: {
    ...mapNotificationsState(['settingsApp']),
  },
  watch: {
    settingsApp() {
      this.setting = JSON.parse(JSON.stringify(this.settingsApp))
    },
  },
  mounted() {
    this.setSettings()
  },
  methods: {
    ...mapNotificationsActions(['fetchSettings', 'editSettings']),
    async setSettings() {
      this.isLoaderVisible = true
      try {
        await this.fetchSettings({
          id: this.id,
          namespace: 'app',
        })
        this.isLoaderVisible = false
      } catch {
        this.$error.show()
      }
    },

    async toggleSettings(key, state) {
      try {
        await this.editSettings({
          type: 'app',
          id: this.id,
          params: [
            {
              key,
              state
            },
          ],
        })
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
