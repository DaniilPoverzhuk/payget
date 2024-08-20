<template>
  <div class="head-name flex">
    <span class="text-gray-700 dark:text-gray-300 font-medium text-sm inline-block">
      <router-link
        v-if="interlocutor.is_link_profile"
        class="hover:text-primary line-clamp-2 break-all"
        :to="path"
      >{{ interlocutor.name }}
      </router-link>
      <template v-else>{{ interlocutor.name }}</template>
    </span>
    <span
      v-if="isSeller"
      class="text-gray-400 dark:text-gray-500 text-sm inline-block lg:ml-2"
    >{{ $t(isSeller ? "conversation.buyer" : "conversation.seller") }}</span>
  </div>
</template>

<script>
export default {
  name: 'HeaderName',
  props: {
    interlocutor: {
      type: Object,
      required: true,
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    path() {
      return this.$matchMedia.mobile ? '/messages' : `/user/${encodeURIComponent(this.interlocutor.name)}`
    },
  },
}
</script>
