<template>
  <tr
    v-if="data !== null"
    :class="{
      'relative z-1 hover:bg-primary-light dark:hover:bg-dark-c-white  cursor-pointer':
        !isResolved,
    }"
    @click="goComplaint"
  >
    <td class="px-2 py-4 whitespace-nowrap">
      <template v-if="data.complaintable_type == 'channel_post_comment'">
        <router-link
          v-if="!isResolved && data.post"
          class="text-primary"
          :to="`/user/${data.post.user.name}/comments/${
            data.post.id ? data.post.id : ''
          }`"
        >
          {{ $t('complaints.commentUrl') }}
        </router-link>
        <p v-else class="text-gray-400 dark:text-gray-500">
          {{ $t('complaints.commentUrl') }}
        </p>
      </template>
      <template v-else>
        <router-link
          v-if="!isResolved && data.post"
          class="text-primary"
          :to="`/user/${data.post.user.name}/channel/${
            data.post.slug ? data.post.slug : ''
          }`"
        >
          {{ $t('channel.postUrl') }}
        </router-link>
        <p v-else class="text-gray-400 dark:text-gray-500">
          {{ $t('channel.postUrl') }}
        </p>
      </template>
    </td>
    <td class="px-2 py-4 whitespace-nowrap">
      <span
        :class="{
          'text-gray-400 dark:text-gray-500': !isResolved,
          'text-gray-400 dark:text-gray-500': isResolved,
        }"
        >{{ data.complaints_count }}
      </span>
    </td>
    <td class="px-2 py-4">
      <template v-if="data.complaints_types !== null">
        <p
          v-for="(types, key) in data.complaints_types"
          :key="key"
          class="inline"
          :class="{
            'text-gray-400 dark:text-gray-500': !isResolved,
            'text-gray-400 dark:text-gray-500': isResolved,
          }"
        >
          {{
            `${isRu ? types.name.ru : types.name.en}${
              key == data.complaints_types.length - 1 ? '' : ', '
            }`
          }}
        </p>
      </template>
    </td>
    <td class="px-2 py-4">
      <p
        class="text-sm font-medium px-3 py-1 text-center rounded"
        :class="statusClass[isStatus]"
        v-text="getStatusText(isStatus)"
      />
    </td>
    <td class="px-2 py-4">
      <Button
        v-if="data.complaint_request_status == 'new'"
        view-color="secondary"
        class="font-medium whitespace-nowrap text-sm"
        @click="testBtn($event)"
      >
        {{ $t('channel.takeWork') }}
      </Button>
      <p
        v-else-if="data.user !== null"
        class="text-sm font-medium text-sm"
        :class="{
          'text-gray-400 dark:text-gray-500': !isResolved,
          'text-gray-400 dark:text-gray-500': isResolved,
        }"
      >
        {{ data.user.name }}
      </p>
    </td>
    <td class="px-2 py-4">
      <span
        v-if="isResolved"
        class="py-2 px-4 rounded-md text-xs shadow-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 block whitespace-nowrap inline-block"
        >{{
          $t(data.post == null ? 'channel.postRemove' : 'channel.postEdit')
        }}</span
      >
      <span v-else class="text-gray-400 dark:text-gray-500"> &#8210; </span>
    </td>
    <td class="px-2 py-4 text-gray-400 dark:text-gray-500">
      <p v-if="data.delete_reason !== null" class="max-w-300 break-words">
        {{ data.delete_reason }}
      </p>
      <template v-else> &#8210; </template>
    </td>
  </tr>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import complaint from 'src/mixins/complaint.vue'
import i18n from 'src/i18n/localization'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'ComplaintsRow',
  mixins: [complaint],
  props: {
    data: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    resolveDialog: false,
    sendingRequisites: false,
    statusClass: {
      in_progress: 'text-red-900 bg-red-light',
      resolved: 'text-green-700 bg-green-100',
      new: 'text-red-900 bg-red-100',
      user: 'text-indigo-800 bg-indigo-50',
    },
  }),
  computed: {
    ...mapUserState(['id']),
    isStatus() {
      return this.data.complaint_request_status === 'in_progress' &&
        this.id === this.data.user.id
        ? 'user'
        : this.data.complaint_request_status
    },
    isResolved() {
      return this.data.complaint_request_status === 'resolved'
    },
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
  },
  methods: {
    testBtn($event) {
      event.stopPropagation()

      this.selectStatus()
    },
    async selectStatus() {
      try {
        const { data } = await this.$instance({
          method: 'PATCH',
          url: `userfeed/complaint-post/${this.data.id}`,
          data: {
            status: 'in_progress',
          },
        })
        if (data) {
          this.data.complaint_request_status = 'user'
        }
      } catch {
        this.$error.show()
      }
    },
    goComplaint() {
      if (this.data.complaint_request_status !== 'resolved') {
        this.$router.push(`complaints/${this.data.id}`)
      }
    },
    update() {
      this.$emit('update')
    },
  },
}
</script>
