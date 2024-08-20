<template>
  <component
    class="empty-route"
    v-if="isEmptyRoute"
    :is="role ? 'Exchange' : 'Home'"
  />
  <router-view v-else />
</template>

<script>
import { useStore } from 'vuex'
import { computed } from 'vue'
import Exchange from '../exchange/new-exchange.vue'
import Home from '../home/home.vue'
import { useRoute } from 'vue-router'
export default {
  name: 'Main',
  components: {
    Exchange,
    Home,
  },
  setup() {
    const $store = useStore()
    const route = useRoute()
    const isEmptyRoute = computed(() => route.path == '/')
    const role = computed(() => $store.state.user.role)
    return {
      role,
      isEmptyRoute,
    }
  },
}
</script>
