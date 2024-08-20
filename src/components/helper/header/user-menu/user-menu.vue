<template>
  <div class="user-menu">
    <button
      type="button"
      class="xs:hidden user-menu-btn rounded-md inline-flex items-center justify-center border border-gray-300 dark:border-gray-500 rounded-lg py-2 px-4 max-w-155"
      @click="showMenuList = !showMenuList"
    >
      <span
        class="block pr-2 text-gray-700 dark:text-gray-300 font-sm font-medium whitespace-nowrap overflow-hidden overflow-ellipsis"
      >
        {{ name }}
      </span>
      <span class="flex items-center pointer-events-none">
        <svg
          v-svg
          aria-hidden="true"
          class="h-6 w-6 text-gray-700 dark:text-gray-300 transition duration-75"
          :class="{ 'transform rotate-180': showMenuList }"
          symbol="chevron-down"
        ></svg>
      </span>
    </button>
    <template v-if="showMenuList && role">
      <ul
        class="lg:absolute lg:right-0 lg:z-10 mt-1 bg-white dark:bg-dark-c-white lg:shadow-lg lg:rounded-lg lg:border lg:border-gray-100 lg:dark:border-gray-800 lg:py-1 text-base"
        tabindex="-1"
        v-click-outside="
          () => {
            showMenuList = false
          }
        "
        @click="showMenuList = false"
      >
        <template v-for="(item, key) in menuData">
          <li
            v-if="checkAcsses(item)"
            :key="key"
            class="whitespace-nowrap lg:text-gray-900 lg:dark:text-white xs:text-gray-500 dark:xs:text-gray-300 cursor-pointer select-none relative"
          >
            <button
              v-if="item.setpath == 'logOut'"
              type="button"
              class="xs:py-2 w-full xs:px-3 block hover:bg-gray-100 dark:hover:bg-gray-800 lg:py-2 lg:px-4"
              @click="logOut"
            >
              <template v-if="item.sub">{{ item.sub }}&nbsp;</template
              >{{ $t(item.name) }}
            </button>
            <a
              v-else-if="item.target"
              class="xs:py-2 xs:px-3 block hover:bg-gray-100 dark:hover:bg-gray-800 lg:py-2 lg:px-4"
              :href="item.href"
              target="_blank"
            >
              <template v-if="item.sub">{{ item.sub }}&nbsp;</template
              >{{ $t(item.name) }}</a
            >
            <router-link
              v-else
              v-slot="{ navigate, isActive }"
              :to="item.href || setPath(item.setpath)"
            >
              <span
                class="xs:py-2 xs:px-3 block lg:py-2 lg:px-4"
                :class="{
                  'lg:text-white lg:hover:text-white lg:bg-primary lg:hover:bg-primary xs:text-primary':
                    isActive,
                  'lg:hover:bg-gray-100 lg:dark:hover:bg-gray-800': !isActive,
                }"
                @click="navigate"
              >
                <template v-if="item.sub">{{ item.sub }}&nbsp;</template
                >{{ $t(item.name) }}</span
              >
            </router-link>
          </li>
        </template>
      </ul>
    </template>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapState: mapUserState, mapActions: mapUserActions } =
  createNamespacedHelpers('user')

export default {
  name: 'UserMenu',
  data: () => ({
    // role [...] - group for allowed users / required
    // role [] - all users
    // excludeRole not - exclusion from an allowed group
    menuData: [
      {
        name: 'menu.profile',
        setpath: 'profile',
        role: ['admin', 'moderator', 'member'],
      },
      {
        name: 'user.profileSettings',
        href: '/profile-settings',
        role: ['admin', 'moderator', 'member'],
      },
      {
        name: 'history.dealHistoryTitle',
        href: '/history',
        role: ['moderator', 'member'],
      },
      {
        name: 'complaints.title',
        href: '/complaints',
        role: ['admin'],
      },
      // {
      //   name: 'statistics.title',
      //   href: '/statistics',
      //   permissions: 'statistic.access',
      //   role: ['admin', 'moderator', 'member'],

      // },
      {
        name: 'tickets.title',
        href: '/tickets',
        role: ['admin'],
        permissions: 'ticket.review',
      },
      {
        name: 'menu.rules',
        href: '/rules',
        role: ['admin'],
      },
      {
        sub: '$',
        name: 'menu.referral',
        href: '/referral',
        role: ['moderator', 'member'],
      },
      {
        name: 'support.title',
        href: '/support',
        role: ['moderator', 'member'],
      },
      {
        name: 'knowledge.title',
        href: '/knowledge-base',
        role: [],
      },
      {
        name: 'logs.title',
        href: '/logs',
        role: ['admin'],
      },
      {
        name: 'menu.docs',
        href: `${process.env.VUE_APP_URL}open-api/documentation`,
        role: ['admin', 'moderator', 'member'],
        target: true,
      },
      {
        name: 'menu.exit',
        setpath: 'logOut',
        role: ['admin', 'moderator', 'member'],
      },
    ],
    showMenuList: false,
  }),
  computed: {
    ...mapUserState(['role', 'flags', 'name', 'permissions']),
  },
  mounted() {
    // this.showMenuList = this.$matchMedia.mobile
    this.updateShowMenuList()
    window.addEventListener('resize', this.updateShowMenuList)
  },
  methods: {
    ...mapUserActions(['logOut']),
    setPath(key) {
      switch (key) {
        case 'profile':
          return `/user/${this.name}`
        default:
          return '/'
      }
    },
    updateShowMenuList() {
      this.showMenuList = window.innerWidth < 1200
    },
    checkAcsses(data) {
      let acsses = true
      if (data.role.length > 0) {
        if (data.permissions) {
          acsses =
            this.permissions.includes(data.permissions) &&
            data.role.includes(this.role)
        } else {
          acsses = data.role.includes(this.role)
        }
      }
      if (acsses && data.excludeRole) {
        acsses = !data.excludeRole.includes(this.role)
      }
      return acsses
    },
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateShowMenuList())
  },
}
</script>

<style lang="scss">
.user-menu {
  button {
    &.user-menu-btn {
      max-height: 40px;
    }
  }
}
</style>
