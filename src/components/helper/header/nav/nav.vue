<template>
  <ul class="nav-list lg:flex flex-grow lg:space-x-6 xs:space-y-1 xs:py-2 xs:px-3" :class="{ 'lg:space-x-6': menuData.length >= 8, 'lg:space-x-5 text-sm': menuData.length < 8 }">
    <template :key="item" v-for="(item, key) in menuData">
      <li
        v-if="($matchMedia.desktop && checkAcsses(item)) || (checkAcsses(item) && $matchMedia.mobile && item.name !== 'menu.messages')"
        :key="key"
        class="nav-item font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white whitespace-nowrap relative"
      >
        <a v-if="item.target" class="block" :href="item.href" target="_blank">
          {{ $t(item.name) }}
        </a>
        <router-link v-else v-slot="{ navigate, isActive }" class="flex justify-center items-center" :to="item.href">
          <span class="lg:block xs:inline-block" :class="{ 'text-primary': isActive }" @click="navigate">
            <q-icon v-if="isMobile" :name="item.icon" class="text-xl" />
            <template v-else> {{ $t(item.name) }} </template>
            <span v-if="item.flags && setFlag(item)" class="lg:block rounded-full xs:mb-2 lg:absolute -right-2 top-0 bg-primary w-1.5 h-1.5 xs:inline-block" />
          </span>
        </router-link>
      </li>
    </template>
  </ul>
</template>

<script>
import { useStore } from 'vuex'
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'Nav',
  setup() {
    const $store = useStore()
    const menuData = ref([
      {
        name: 'home.exchange',
        href: '/exchange',
        role: [],
        excludeRole: ['admin', 'moderator'],
        icon: 'currency_exchange',
      },
      {
        name: 'disputes.title',
        href: '/disputes',
        role: ['admin'],
        flags: ['new_dispute'],
        icon: '',
      },
      {
        name: 'deals.title',
        href: '/deals',
        role: ['admin'],
        icon: '',
      },
      // {
      //   name: 'refill.title',
      //   href: '/refill',
      //   role: ['admin'],
      //   flags: ['waiting_executed', 'waiting_req'],
      // },
      {
        name: 'withdraws.title',
        href: '/withdraws',
        role: ['admin'],
        flags: ['waiting_remove'],
        icon: '',
      },
      {
        name: 'users',
        href: '/users',
        role: ['admin', 'moderator'],
        icon: '',
      },
      {
        name: 'menu.messages',
        href: '/messages',
        role: ['admin', 'moderator', 'member'],
        flags: ['new_message'],
        icon: '',
      },
      {
        name: 'menu.tape',
        href: '/feeds?tab=popular',
        role: [],
        icon: 'sort',
      },
      {
        name: 'deposit.title',
        href: '/deposit',
        role: ['member'],
        icon: 'account_balance_wallet',
      },
      {
        name: 'menu.rules',
        href: '/rules',
        role: [],
        excludeRole: ['admin', 'moderator', 'member'],
        icon: '',
      },
      // {
      //   name: 'knowledge.title',
      //   href: '/knowledge-base',
      //   role: [],
      //   excludeRole: ['admin'],
      // },
      {
        name: 'ads.myAd',
        href: '/ads',
        role: ['member'],
        icon: 'format_list_bulleted',
      },
    ])

    const isMobile = ref(false)

    const onResize = () => {
      isMobile.value = innerWidth <= 400
    }

    const role = computed(() => $store.state.user.role)
    const flags = computed(() => $store.state.user.flags)

    const setFlag = (item) => {
      let res = false
      item.flags.map((el) => {
        if (flags.value[el]) {
          res = flags.value[el]
        }
      })
      return res
    }

    const checkAcsses = (data) => {
      let acsses = true
      if (data.role.length > 0) {
        acsses = data.role.includes(role.value)
      }
      if (acsses && data.excludeRole) {
        acsses = !data.excludeRole.includes(role.value)
      }
      return acsses
    }

    onMounted(() => {
      onResize()

      window.addEventListener('resize', onResize)
    })

    return {
      menuData,
      role,
      flags,
      setFlag,
      checkAcsses,
      isMobile,
    }
  },
}
</script>
<style lang="scss" scoped>
.nav-list {
  &.footer-mobile-menu {
    display: none;

    @media (max-width: 1200px) {
      display: flex;
      align-items: flex-end;
      width: 100%;

      .nav-item {
        margin-top: 0;
        flex-grow: 1;
        max-height: 100%;
      }
    }
  }
}
</style>
