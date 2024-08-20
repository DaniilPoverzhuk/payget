<template>
  <q-layout
    view="lHh lpr lFf"
    class="tw-layout bg-white dark:bg-dark-c-white"
    container
    color="grey-7"
    style="height: 100vh"
  >
    <q-header class="bg-white dark:bg-dark-c-white mw-16 flex mx-auto">
      <q-toolbar class="tw-toolbar">
        <q-btn flat to="/">
          <img
            :style="{ width: '80px', height: '80px' }"
            src="~/assets/img/tw-logo.png"
          />
        </q-btn>
        <q-btn flat label="Обмен" color="grey-7" no-caps to="/exchange" />
        <q-btn
          class="mx-5"
          flat
          label="Лента"
          color="grey-7"
          no-caps
          to="/feeds"
        />
        <q-btn flat label="Правила" color="grey-7" no-caps to="/rules" />
        <q-space />
        <q-btn
          round
          unelevated
          color="purple-1"
          text-color="grey-10"
          no-caps
          label="Ru"
          class="mr-5"
        />

        <q-btn
          fill
          rounded
          unelevated
          color="primary"
          no-caps
          label="Войти"
          to="/"
        />
      </q-toolbar>
    </q-header>
    <q-ajax-bar
      ref="bar"
      position="top"
      color="accent"
      size="4px"
      skip-hijack
    />

    <q-page-container class="main-content mw-16 mx-auto">
      <q-page class="w-full">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapLayoutState, mapActions: mapLayoutActions } =
  createNamespacedHelpers('layout')

export default {
  name: 'Layout',
  async preFetch({ store, ssrContext, currentRoute }) {
    console.log('preFetch', store.state.user.auth)
    // await store.dispatch('user/setRouteFullPath', currentRoute.fullPath)
    // await store.dispatch('user/setTokens', ssrContext)
    // await store.dispatch('user/init', ssrContext)
    const { currencies } = store.state.user
    if (
      !currencies &&
      currentRoute.path !== '/rates' &&
      currentRoute.path !== '/service-unavailable'
    ) {
      await store.dispatch('user/setCurrencies')
    }
    // console.log('default', store.state.user.role)
  },
  computed: {
    ...mapLayoutState(['backdrop', 'menu', 'isBarActive']),
  },
  watch: {
    isBarActive() {
      const barRef = this.$refs.bar
      if (barRef) {
        if (this.isBarActive) {
          barRef.start()
        } else {
          barRef.stop()
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tw-layout {
  font-family: 'involve';
  .q-header {
    margin-bottom: 40px;
    padding: 0 20px;
  }
  @media (max-width: 1440px) {
    height: 96px;
    .q-header {
      padding: 0;
    }
  }
  .tw-toolbar {
    height: 112px;
    border-bottom: 1px solid #eff3ff;
    .q-btn {
      font-size: 18px;
    }
    @media (max-width: 1440px) {
      height: 96px;
      padding: 0 20px;
    }
  }
  .mw-16 {
    max-width: 1560px;
  }
  .main-content {
    padding: 0 20px;
    .q-page {
      margin-top: 40px;
      @media (max-width: 1440px) {
        margin-top: 20px;
      }
    }
  }
}
</style>
