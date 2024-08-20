<template>
  <div
    class="shadow-box-shadow-menu h-screen bg-white dark:bg-dark-c-white overflow-y-auto"
  >
    <div
      class="px-4 py-6 flex items-center justify-between border-b-2 border-gray-100 dark:border-gray-800"
    >
      <div>
        <router-link to="/">
          <img
            class="h-8 w-auto"
            src="~/assets/img/twixim.svg"
            alt="TWIX"
            title="TWIX"
          />
        </router-link>
      </div>
      <button
        type="button"
        class="border-0 rounded-md inline-flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset"
        @click="$emit('showMobileMenu', false)"
      >
        <span class="sr-only">Close menu</span>
        <svg
          v-svg
          symbol="close-new"
          class="h-6 w-6 text-gray-400 dark:text-gray-500"
        ></svg>
      </button>
    </div>
    <div class="lg:hidden px-4 pt-6 pb-3">
      <!-- <Nav />
      <VSelectLang
        v-show="$matchMedia.mobile"
        v-model="locale"
        :select-list="languages"
        class="mt-8 pb-5"
      /> -->
      <Avatar
        v-if="role"
        :avatar="avatar"
        :href="`/user/${name}`"
        :name="name"
        class="xs:px-3 py-5"
      >
      </Avatar>
      <UserMenu class="pb-6"></UserMenu>
    </div>
  </div>
</template>

<script>
import Nav from '../nav/nav.vue'
import Avatar from 'src/components/extends/avatar/avatar.vue'
import UserMenu from '../user-menu/user-menu.vue'
import VSelectLang from 'src/components/extends/v-select-lang/v-select-lang.vue'
import { useI18n } from 'vue-i18n'

import { createNamespacedHelpers } from 'vuex'
const { mapState: mapUserState, mapActions: mapUserActions } =
  createNamespacedHelpers('user')

export default {
  name: 'MenuMobile',
  components: {
    // Nav,
    // VSelectLang,
    UserMenu,
    Avatar,
  },
  data: () => ({
    languages: [
      {
        text: 'Ru',
        value: 'ru-RU',
      },
      {
        text: 'En',
        value: 'en-US',
      },
    ],
  }),
  setup() {
    const { locale } = useI18n({ useScope: 'global' })
    return {
      locale,
    }
  },
  computed: {
    ...mapUserState(['avatar', 'name', 'role']),
  },
}
</script>

<style lang="scss">
.shadow-box-shadow-menu {
  box-shadow: 0px 0px 8px -2px rgba(34, 60, 80, 0.2);
}
</style>
