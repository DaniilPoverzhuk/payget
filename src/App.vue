<template>
<span class="app">
	<PageLoader :class="{'is-active': isLoading, 'is-active-loading': isActiveLoading}" />
  <router-view />
</span>
</template>

<script>
import { defineComponent, ref } from 'vue'
import PageLoader from 'src/components/loader/page-loader.vue'

export default defineComponent({
  name: 'App',
  components: {
    PageLoader
  },
  setup() {
    const isLoading = ref(true)
    const isActiveLoading = ref(true)
    setTimeout(() => {
      isLoading.value = false
    }, 1500)
    setTimeout(() => {
      isActiveLoading.value = false
    }, 1000)
    return {
      isLoading,
      isActiveLoading
    }
  },
})
</script>
<style>
.app {
  font-size: 16px;
}
.flex {
  flex-wrap: nowrap;
}
.dark .bg-white {
	background-color: rgba(19, 17, 39, var(--tw-bg-opacity)) !important;
}
</style>