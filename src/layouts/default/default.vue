<template>
  <div
    class="flex flex-col overflow-x-hidden antialiased font-sans dark:bg-dark-c-white min-h-screen default-layout"
    :class="
      (routePath === '/registration' ? 'bg-gray-50 ' : 'bg-white ') +
      (routePath === '/users' ? '' : 'overflow-hidden')
    "
  >
    <q-ajax-bar
      ref="bar"
      position="top"
      color="accent"
      size="4px"
      skip-hijack
    />
    <Header />
    <Menu />
    <main
      class="main-content relative w-full mx-auto w-full flex-grow flex max-w-7xl"
    >
      <div v-if="banned_at" class="main__user-banned">
        {{ $t('user.blocked') }}
        <svg
          v-svg
          class="main__user-banned-image"
          size="182"
          symbol="ban"
        ></svg>
      </div>
      <router-view v-else />
    </main>
    <div class="small-empty"></div>
    <Backdrop
      :modelValue="backdrop"
      @update:modelValue="(newValue) => (backdrop = newValue)"
    />
    <Dialog
      v-model="errorDialog"
      :heading="errorDialogHeading"
      :text="errorDialogText"
      @hide="hideErrorDialog"
    />
    <Notice />
    <FooterMobile />
  </div>
</template>
<script>
import { createNamespacedHelpers, useStore } from 'vuex'
import Header from 'src/components/helper/header/header.vue'
import FooterMobile from 'src/components/helper/footer/footer-mobile.vue'
import Menu from 'src/components/menu/menu.vue'
import Backdrop from 'src/components/backdrop/backdrop.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import Notice from 'src/components/helper/notice/notice.vue'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { mapState: mapLayoutState, mapActions: mapLayoutActions } =
  createNamespacedHelpers('layout')

export default {
  name: 'Default',
  components: {
    Header,
    Menu,
    Backdrop,
    Dialog,
    Notice,
    FooterMobile,
  },
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
  setup() {
    const $store = useStore()
    const route = useRoute()
    const routePath = computed(() => $store.state.user.test)
    useMeta({
      title: 'TWIX',
      meta: {
        ogTitle: { property: 'og:title', content: 'TWIX' },
        ogUrl: { property: 'og:url', content: `https://twix.im${route.path}` },
        ogSiteName: { property: 'og:site_name', content: 'twix.im' },
        ogType: { property: 'og:type', content: 'website' },
      },
    })
    // watch(route, (value) => {
    //   $store.dispatch('user/setRouteFullPath', value.fullPath)
    //   console.log('dispatch', value.fullPath)
    // }, {deep: true})
    return {
      routePath,
    }
  },
  data: () => ({
    errorDialogHeading: '',
    errorDialogText: '',
    messages: [],
    // newPath: ['/', '/registration', '/rules',  '/knowledge-base', '/exchange'],
    newPath: [
      '/registration',
      '/kontakty',
      '/support',
      '/knowledge-base',
      '/tickets',
    ],
  }),
  computed: {
    ...mapUserState(['banned_at', 'error', 'role', 'id']),
    ...mapLayoutState(['backdrop', 'menu', 'isBarActive']),
    errorDialog() {
      return !!this.error
    },
  },
  watch: {
    error() {
      if (this.error) this.errorDialogHeading = this.error[0]
      if (this.error.length === 2) this.errorDialogText = this.error[1]
    },
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
  mounted() {
    this.hideMenu()
  },
  methods: {
    ...mapLayoutActions(['hideMenu']),
    hideErrorDialog() {
      this.$error.hide()
    },
  },
}
</script>

<style lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  background-color: var(--c-bg);
}
.default-layout {
  @media (max-width: 1200px) {
    .small-empty {
      height: 48px;
    }
  }
}
.main {
  display: flex;
  width: 100%;
  flex-grow: 1;

  &__user-banned {
    font-size: var(--fz-h1);
    line-height: var(--lh-sm);
    margin: auto;
    text-align: center;
    font-weight: 700;
    padding: 30px 50px;
  }

  &__user-banned-image {
    display: block;
    margin: 44px auto 0;
    width: 182px;
    height: 182px;
  }
}
</style>
