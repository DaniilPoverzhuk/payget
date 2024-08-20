<template>
  <header class="header bg-white dark:bg-dark-c-white shadow-base h-header z-10 dark:border-b dark:border-gray-800">
    <div class="max-w-7xl mx-auto lg:py-4 px-6 xs:py-6 xs:pr-4">
      <nav class="relative flex items-center justify-between">
        <div class="pg-logo flex items-center lg:mr-6 flex-shrink-0">
          <button class="lg:hidden absolute top-2 left-3" :class="{ hidden: !role }" @click="showMobileMenu(true)">
            <svg v-svg symbol="menu" class="h-6 w-6 text-gray-400 dark:text-gray-500"></svg>
          </button>
          <router-link class="logo-img" :class="{ 'auth-user': role }" to="/">
            <span class="sr-only">TWIX</span>
            <img class="h-10 w-auto" src="~assets/img/twixim.svg" alt="TWIX" title="TWIX" />
          </router-link>
          <!-- <div class="flex items-center xs:hidden">
            <button
              type="button"
              class="lg:hidden bg-gray-700 dark:bg-gray-300 rounded-md p-2 inline-flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-inset"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <svg v-svg class="h-6 w-6" symbol="menu" aria-hidden="true" />
            </button>
          </div> -->
        </div>
        <Nav class="c-desktop" />
        <div v-if="accessToken" class="xs:absolute right-0 flex">
          <Notifications v-if="role" />
          <router-link v-slot="{ href, navigate }" to="/messages" class="c-mobile">
            <span class="block" :href="href" @click="navigate">
              <svg v-svg aria-hidden="true" class="h-6 w-6 text-gray-400 dark:text-gray-500 transition duration-75" symbol="chat-new"></svg>
            </span>
          </router-link>
        </div>
        <VSelectLang
          v-model="locale"
          :select-list="languages"
          class="lang-select xs:absolute max-w-md xs:right-0 lg:mr-2 max-w-md"
          :class="{ 'auth-user': role }"
          @update:modelValue="updateLanguage"
        />
        <div class="xs:hidden flex items-center">
          <UserMenu v-if="role && name" />
          <Button
            v-if="showRegister"
            to="/registration"
            view-color="secondary"
            xs:py-2
            xs:px-3
            block
            lg:py-2
            lg:px-4
            lg:hover:bg-gray-100
            lg:dark:hover:bg-gray-800
            class="c-desktop xs:mt-4 ml-2 w-full text-base"
            >{{ $t('auth.register') }}</Button
          >
          <Button v-if="showLogin" to="/" view-color="primary" class="xs:mt-4 ml-2 w-full text-base">{{ $t('auth.logiin') }}</Button>
        </div>
      </nav>
    </div>
    <div
      v-if="isMobileMenu"
      v-click-outside="
        () => {
          isMobileMenu = false
        }
      "
      class="fixed inset-0 z-10 top-0 bottom-0 inset-x-0 transition max-w-xs transfoorm origin-top-right lg:hidden"
    >
      <MenuMobile @showMobileMenu="showMobileMenu" />
    </div>
  </header>
</template>

<script>
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import Nav from './nav/nav.vue'
import { computed, ref, watch } from 'vue'
import UserMenu from './user-menu/user-menu.vue'
import MenuMobile from './menu-mobile/menu-mobile.vue'
import Notifications from 'src/components/helper/notifications/notifications-header/notifications-header.vue'
import VSelectLang from 'src/components/extends/v-select-lang/v-select-lang.vue'
import { instance } from 'boot/axios'
import error from 'src/error.js'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LayoutHeader',
  components: {
    Nav,
    Notifications,
    MenuMobile,
    UserMenu,
    VSelectLang,
  },
  //   async preFetch({ store, currentRoute }) {
  //     await store.dispatch('user/setRouteFullPath', currentRoute.fullPath)
  //   },
  setup() {
    const $store = useStore()
    const route = useRoute()
    const { locale } = useI18n({ useScope: 'global' })
    const role = computed(() => $store.state.user.role || undefined)
    const accessToken = computed(() => $store.state.user.role || undefined)
    const flags = computed(() => $store.state.user.role || undefined)
    const newMessage = computed(() => $store.state.user.role || undefined)
    const name = computed(() => $store.state.user.role || undefined)
    const auth = computed(() => $store.state.user.role || undefined)
    const showLogin = computed(() => !role.value && route.path !== '/')
    const showRegister = computed(() => !role.value && route.path !== '/registration')
    const currentRoute = $store.state.user.test
    const isShowBtn = () => {
      return !role.value
    }
    const messagesClasses = computed(() => {
      return {
        header__messages_disabled: accessToken.value,
        header__messages_mark: flags.value && flags.value.new_message,
      }
    })
    const isMenuVisible = ref(false)
    const isMobileMenu = ref(false)
    const languages = ref([
      {
        text: 'Ru',
        value: 'ru-RU',
      },
      {
        text: 'En',
        value: 'en-US',
      },
    ])
    watch(route, () => showMobileMenu(false))
    const updateLanguage = async () => {
      if (auth.value) {
        try {
          const { data } = await instance({
            method: 'POST',
            url: 'user/lang',
            data: {
              lang: locale.value,
            },
          })
        } catch {
          error.show()
        }
      }
    }
    const showMobileMenu = (bool) => {
      isMobileMenu.value = bool
      if (isMobileMenu.value) {
        document.documentElement.classList.add('backdrop-noscroll')
      } else {
        document.documentElement.classList.remove('backdrop-noscroll')
      }
    }
    return {
      messagesClasses,
      showRegister,
      showLogin,
      auth,
      name,
      newMessage,
      flags,
      accessToken,
      role,
      locale,
      languages,
      isMenuVisible,
      isMobileMenu,
      showMobileMenu,
      updateLanguage,
      isShowBtn,
    }
  },
}
</script>

<style lang="scss" scoped>
.header {
  .logo-img {
    &.auth-user {
      margin-left: 56px;
    }
  }
  @media (max-width: 1199px) {
    .lang-select {
      &.auth-user {
        margin-right: 74px;
      }
    }
  }
}
</style>
