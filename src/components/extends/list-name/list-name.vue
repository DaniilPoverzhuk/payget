<template>
  <div class="flex justify-between items-center w-full py-4 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center flex-grow-1">
      <Avatar
        :avatar="avatar"
        :name="name"
        :iconUser="true"
        textClass="max-w-list-name line-clamp-1 break-all"
      />
      <svg
        v-if="verified"
        v-svg
        class="w-5 h-5 text-primary flex-shrink-0"
        symbol="verified"
      />
    </div>
    <slot></slot>
  </div>
</template>

<script>
import Avatar from 'src/components/extends/avatar/avatar.vue'

export default {
  name: 'ListName',
  components: {
    Avatar,
  },
  props: {
    verified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  data: () => ({

  }),
}
</script>
