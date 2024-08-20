<template>
  <div class="messages w-full flex lg:relative">
    <div class="lg:absolute lg:inset-0 w-full h-full lg:flex">
      <aside
        v-if="$matchMedia.desktop || !$route.params.chat_id"
        class="lg:pt-6 lg:border-r-2 lg:border-gray-200 lg:dark:border-gray-700 lg:flex-shrink-0"
      >
        <AsideMessages />
      </aside>
      <div
        v-if="$matchMedia.desktop || $route.params.chat_id"
        class="flex-grow relative h-full"
      >
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import AsideMessages from 'src/components/helper/page-messages/aside-messages/aside-messages.vue'

export default {
  name: 'Messages',
  components: {
    AsideMessages,
  },
}
</script>
