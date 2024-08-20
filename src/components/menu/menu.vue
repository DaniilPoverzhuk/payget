<template lang="pug">
div.menu(
  :class='menu && "menu_visible"'
  ref='menu'
  class="c-mobile"
)
  button.menu__close-button(
    type='button'
    @click='hideMenu'
  )
    svg.menu__close-button-icon(
      v-svg
      symbol='close'
    )
  UserInfo
  Nav
  UserMenu
</template>

<script>
// import createFocusTrap from 'focus-trap'
import { createNamespacedHelpers } from 'vuex'
import UserInfo from 'src/components/user-info/user-info.vue'
import Nav from '../helper/header/nav/nav.vue'
import UserMenu from '../helper/header/user-menu/user-menu.vue'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')
const {
  mapState: mapLayoutState,
  mapActions: mapLayoutActions,
} = createNamespacedHelpers('layout')

export default {
  name: 'Menu',
  components: {
    UserInfo,
    Nav,
    UserMenu,
  },
  data() {
    return {
      isMenuVisible: false,
      focusTrap: null,
    }
  },
  computed: {
    ...mapUserState(['accessToken']),
    ...mapLayoutState(['menu']),
    isAuthorization() {
      return this.$route.path === '/login' || this.$route.path === '/registration'
    },
    isLanding() {
      return this.$route.path === '/'
    },
  },
  watch: {
    menu(visible) {
      if (visible) {
        // this.focusTrap = createFocusTrap(this.$refs.menu)
        this.focusTrap.activate()
      } else {
        this.deactivateFocusTrap()
      }
    },
    $route() {
      this.hideMenu()
    },
  },
  beforeUnmount() {
    this.deactivateFocusTrap()
  },
  methods: {
    ...mapLayoutActions(['hideMenu']),
    deactivateFocusTrap() {
      if (!this.focusTrap) return
      this.focusTrap.deactivate()
    },
  },
}
</script>

<style lang="scss">
.menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: calc(100% - 32px);
  overflow-y: auto;
  background-color: var(--c-white);
  transform: translateX(-100%);
  transition: transform var(--t);
  z-index: 100;

  &_visible {
    transform: translateX(0);
  }

  &__close-button {
    display: block;
    width: 24px;
    height: 24px;
    color: var(--c-gray-80);
    cursor: pointer;
    margin: 14px 20px;
  }

  &__close-button-icon {
    display: block;
    fill: currentColor;
    width: 24px;
    height: 24px;
  }
}
</style>
