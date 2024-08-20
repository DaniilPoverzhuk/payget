<template>
  <div class="disputes w-full flex lg:relative">
    <div class="lg:absolute lg:inset-0 w-full h-full lg:flex lg:px-6">
      <aside
        v-if="$matchMedia.desktop || !$route.params.chat_id"
        class="pt-6 lg:border-r-2 lg:border-gray-200 lg:dark:border-gray-700 lg:flex-shrink-0 xs:px-4"
      >
        <DisputeAside />
      </aside>
      <div
        v-if="$matchMedia.desktop || $route.params.chat_id"
        class="lg:pl-9 py-6 w-full flex-grow-0 relative h-full"
      >
        <router-view @goToOwnDisputes="disputesFilter = 'own'" />
      </div>
    </div>
  </div>
</template>
<script>
import DisputeAside from 'src/components/helper/page-dispute/disputes-aside/disputes-aside.vue'

export default {
  name: 'Dispute',
  components: {
    DisputeAside,
  },
  data: () => ({
    disputesFilter: 'own',
  }),
}
</script>
