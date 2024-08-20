<template>
  <div class="home relative xs:my-16 lg:my-20 lg:py-1 mx-auto max-w-7xl w-full">
    <div
      class="left-part-container lg:flex lg:justify-between lg:items-start md:w-full"
    >
      <div
        class="px-4 px-4 lg:max-w-xl lg:mr-8 lg:text-left lg:flex lg:items-start"
      >
        <div class="">
          <router-link v-slot="{ navigate }" to="/exchange" class="c-desktop">
            <span
              class="inline-flex items-center text-white bg-gray-200 rounded-full p-1 pr-2 text-base lg:text-sm text-base bg-gray-200 hover:text-gray-200 mb-6"
              @click="navigate"
            >
              <span
                class="px-3 py-0.5 text-base font-semibold leading-5 uppercase tracking-wide rounded-full bg-primary text-white"
                >{{ t('home.exchange') }}</span
              >
              <span class="ml-4 text-sm text-gray-700">{{
                t('home.conduct')
              }}</span>
              <svg
                v-svg
                symbol="chevron-down"
                class="ml-2 w-5 h-5 text-gray-500 transform -rotate-90"
              />
            </span>
          </router-link>
          <h1
            class="font-extrabold tracking-tight font-extrabold text-gray-900 xs:text-4xl lg:text-6xl"
          >
            <span class="font-extrabold block text-gray-900"
              >{{ t('home.buy') }},</span
            >
            <span class="font-extrabold block text-gray-900"
              >{{ t('home.sell') }}, {{ t('home.change') }},</span
            >
            <span class="font-extrabold block text-primary"
              >{{ t('home.earn') }},</span
            >
            <span
              class="font-extrabold block text-primary dark:text-primary text-indigo-600 inline"
            >
              {{ t('home.communicate') }}!</span
            >
          </h1>
          <p
            class="mx-auto lg:text-xl xs:text-md text-gray-500 lg:mt-5 lg:max-w-3xl xs:mt-3"
          >
            {{ t('home.join') }}
          </p>

          <!-- maximum error -->
          <Button
            v-if="!mobileActiveForm"
            class="xs:mt-8 w-full lg:hidden"
            view-color="primary"
            @click="mobileActiveForm = true"
          >
            {{ t('auth.logiin') }}
          </Button>
          <transition name="fade">
            <div v-if="mobileActiveForm" class="lg:hidden">
              <Form class="mt-8 -mx-4" />
            </div>
          </transition>
          <Button
            to="/registration"
            view-color="secondary"
            class="c-mobile xs:mt-4 w-full lg:hidden"
          >
            {{ t('auth.register') }}
          </Button>
          <div v-if="isMobile" class="flex justify-center mt-6 lg:hidden">
            <TgAuth
              mode="callback"
              :telegram-login="tgBot"
              @callback="tgLoginCb"
            />
          </div>
          <div
            class="lg:grid lg:grid-cols-2 lg:grid-cols-2 lg:mt-6 lg:-mx-1 xs:my-3"
          >
            <ProfitList
              v-for="item in profitData"
              :key="item.text"
              :symbol="item.symbol"
              :text="item.text"
              class="group flex items-center lg:px-1 lg:py-4 xs:py-5"
            />
          </div>
        </div>
      </div>
      <div v-if="!isMobile" class="c-desktop mt-16 mt-24 lg:mt-0 lg:col-span-6">
        <Form />
      </div>
    </div>
  </div>
</template>
<script>
import { useStore } from 'vuex'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ProfitList from 'src/components/helper/page-main/profit-list/profit-list.vue'
import Form from 'src/components/helper/page-main/form/form.vue'
import TgAuth from 'src/components/helper/page-main/form/tg-auth.vue'
import { useI18n } from 'vue-i18n'
import error from 'src/error.js'

export default {
  name: 'Home',
  components: {
    Form,
    ProfitList,
    TgAuth,
  },
  setup() {
    const $store = useStore()
    const $router = useRouter()
    const mobileActiveForm = ref(false)
    const isShow = ref(false)
    const isMobile = ref(false)
    const { t } = useI18n()
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 1200
    }
    onMounted(() => {
      if (typeof window !== 'undefined') {
        checkMobile()
        window.addEventListener('resize', checkMobile)
      }
    })
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile)
      }
    })
    const profitData = ref([
      {
        text: 'home.decentralized',
        symbol: 'switch-horizontal',
      },
      {
        text: 'home.safe',
        symbol: 'shield-check',
      },
      {
        text: 'home.private',
        symbol: 'lock-closed',
      },
      {
        text: 'home.aonymous',
        symbol: 'user-stroke',
      },
      {
        text: 'home.convenient',
        symbol: 'thumb-up',
      },
    ])
    const auth = computed(() => $store.state.user.auth)
    const setShow = () => {
      if (!auth.value) {
        isShow.value = true
      } else {
        $router.push('/feeds')
      }
    }
    const tgBot = computed(() => process.env.VUE_APP_TELEGRAM_BOT || '')
    const tgLoginCb = async (user) => {
      const sendUser = new URLSearchParams(user).toString()
      try {
        await $store.dispatch('user/signInTg', sendUser)
        setTimeout(() => {
          $router.push('/')
        }, 2050)
      } catch (e) {
        console.log('error:', e)
        error.show(t('error.couldntLogin'))
      }
    }
    setShow()
    return {
      setShow,
      tgLoginCb,
      t,
      tgBot,
      auth,
      profitData,
      isShow,
      mobileActiveForm,
      isMobile,
    }
  },
}
</script>

<style lang="scss">
.home {
  .left-part-container {
    @media (max-width: 1199px) {
      width: 100%;
    }
  }
}
</style>
