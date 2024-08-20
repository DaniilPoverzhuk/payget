<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">
      {{ order }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">
      {{ dateComplaint }}
    </td>
    <td class="px-6 py-4">
      <template v-if="data.description !== null">
        <p class="text-gray-500 dark:text-gray-300">
          {{ $t('complaints.other') }}
        </p>
        <div class="font-medium text-sm text-gray-500 dark:text-gray-300 mt-4">
          {{ $t('complaints.commentUser') }}
        </div>
        <div class="text-gray-500 dark:text-gray-300 break-words max-w-384">
          {{ data.description }}
        </div>
      </template>
      <template v-else>
        {{ isRu ? data.type.name.ru : data.type.name.en }}
      </template>
    </td>
    <td class="px-6 py-4">
      <router-link
        v-slot="{ href, navigate, isExactActive }"
        :to="`/user/${data.user.name}`"
      >
        <a
          class="text-gray-500 dark:text-gray-300 hover:text-primary"
          :class="[isExactActive && 'seller-tab-list__link_active']"
          :href="href"
          @click="navigate"
          >{{ data.user.name }}</a
        >
      </router-link>
    </td>
  </tr>
</template>

<script>
import { format } from 'date-fns'
import complaint from 'src/mixins/complaint.vue'
import i18n from 'src/i18n/localization'

export default {
  mixins: [complaint],
  props: {
    data: {
      type: Object,
    },
    order: {
      type: Number,
    },
  },
  data() {
    return {
      requisites: '',
      sendingRequisites: false,
    }
  },
  computed: {
    dateComplaint() {
      return format(this.$getDateInMs(this.data.created_at), 'dd.MM.yy')
    },
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
  },
  methods: {
    async sendRequisites() {
      if (this.sendingRequisites) return
      this.$v.requisites.$touch()
      if (this.$v.requisites.$invalid) return

      this.sendingRequisites = true

      try {
        const {
          data: { status, message },
        } = await this.$instance({
          url: 'deposit/send/requisites',
          data: {
            id: this.request.id,
            requisites: this.requisites,
          },
        })

        if (!status) {
          this.$error.show(message)
          this.sendingRequisites = false
        }
      } catch {
        this.$error.show()
        this.sendingRequisites = false
      }
    },
  },
}
</script>
