import { boot } from 'quasar/wrappers'
import axios from 'axios'
import error from 'src/error.js'
import { Cookies, Notify } from 'quasar'
import { STORAGE_ACCESS_TOKEN_KEY } from 'src/constants'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import VueCryptojs from 'vue-cryptojs'
import CryptoJS from 'crypto-js'

// import { createApp } from 'vue'

import { svgSpriteDirectivePlugin } from 'vue-svg-sprite'
import { Vue3Mq } from 'vue3-mq'
import vClickOutside from 'click-outside-vue3'
import 'src/css/fonts/inter/inter.css'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
// import Vue3TouchEvents from 'vue3-touch-events'
import vueTouchEvents from 'src/plugins/v-touch/vue3-touch-events'
import { NumericDirective } from 'src/plugins/numeric-directive/numeric-directive'
import svgUrl from 'src/assets/img/sprite.svg'
import Button from 'src/components/extends/button/button.vue'
import { createVueMatchMediaPlugin } from '@cwist/vue-match-media'
import VueSimpleContextMenu from 'vue-simple-context-menu'
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
import { ObserveVisibility } from 'vue-observe-visibility'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import { FocusTrap } from 'focus-trap-vue'

let api, instance, noAuth

export default boot(({ app, store, router, ssrContext, redirect }) => {
  const breakpoints = {
    mobile: {
      breakpoint: {
        maxWidth: '1199px',
      },
      defaultValue: false,
    },
    desktop: {
      breakpoint: {
        minWidth: '1200px',
      },
      defaultValue: true,
    },
  }

  const VueMatchMediaPlugin = createVueMatchMediaPlugin({ breakpoints })

  api = axios.create({ baseURL: `${process.env.VUE_APP_URL}api/v1/` })
  instance = axios.create({
    method: 'post',
    baseURL: `${process.env.VUE_APP_URL}api/v1/`,
    headers: {
      Accept: 'application/json',
      'x-lang': 'ru-RU',
    },
  })

  noAuth = axios.create({
    method: 'post',
    baseURL: `${process.env.VUE_APP_URL}api/v1/`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-lang': 'ru-RU',
    },
  })

  const svgSpriteUrl = svgUrl
  //   console.log('boot store', store)
  // for use inside Vue files (Options API) through this.$axios and this.$api

  // app.use(Vue3Mq)
  app.use(Vue3Mq, {
    preset: 'bootstrap5',
  })
  app.use(VueViewer)

  // app.use(VTooltip)
  // app.directive('tooltip', VTooltip)
  app.component('Button', Button)
  app.component('vue-simple-context-menu', VueSimpleContextMenu)

  app.use(vClickOutside)
  app.use(vueTouchEvents)
  app.directive('integer', NumericDirective)
  app.use(VueMatchMediaPlugin)
  app.use(VueCryptojs)
  app.directive('observe-visibility', ObserveVisibility)

  Notify.registerType('my-notif', {
    icon: 'announcement',
    progress: true,
    color: 'brown',
    textColor: 'white',
    classes: 'glossy',
  })

  // app.use(Vue3Mq, {
  //   preset: 'bootstrap5'
  // })

  const dateWithOffset = (date) => {
    const editedDate = date[10] === ' ' ? date.replace(' ', 'T') : date
    const timeOffset = new Date().getTimezoneOffset() * 60000
    return new Date(editedDate) - timeOffset
  }

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api

  app.config.globalProperties.$CryptoJS = CryptoJS

  app.config.globalProperties.$instance = instance

  app.config.globalProperties.$noAuth = noAuth

  app.config.globalProperties.$error = error

  app.config.globalProperties.$FocusTrap = FocusTrap

  app.config.globalProperties.$cookies = Cookies

  app.config.globalProperties.$getDateInMs = dateWithOffset

  app.use(svgSpriteDirectivePlugin, { url: svgSpriteUrl })

  // app.component('FocusTrap', FocusTrap)

  // createApp(App)
  // .component('FocusTrap', FocusTrap)
  // .mount('#app)

  // Vue.use(SvgSprite, {
  //   url: svgSpriteUrl
  // });

  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  createAuthRefreshInterceptor(instance, async (failedRequest) => {
    console.log('createAuthRefreshInterceptor')
    try {
      const token = await store.dispatch('user/setTokens', ssrContext)
      failedRequest.response.config.headers.Authorization = `Bearer ${token}`
      return Promise.resolve()
    } catch (e) {
      await store.dispatch('user/destroySession', ssrContext)
    }
  })

  instance.interceptors.request.use(
    async (config) => {
      const cookies = process.env.SERVER
        ? Cookies.parseSSR(ssrContext)
        : Cookies
      const accessToken = cookies.get(STORAGE_ACCESS_TOKEN_KEY)
      config.headers = {
        // 'Access-Control-Allow-Credentials': true,
        Authorization: `Bearer ${accessToken || 'no-token'}`,
        // 'Bearer': ${store.token.token},
        Accept: 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded'
      }
      return config
    },
    (error) => {
      Promise.reject(error)
    }
  )

  // Response interceptor for API calls
  // console.error('some', ssrContext.req.url, router.currentRoute.value.path)
  instance.interceptors.response.use(
    (response) => {
      return response
    },
    async function (error) {
      const originalRequest = error.config
      if (error.response?.status === 401 && !originalRequest._retry) {
        location.href = '/'
      }
      console.error(
        'some',
        ssrContext?.req?.url,
        router.currentRoute.value.name
      )
      if (
        error.response &&
        error.response.status === 503 &&
        ssrContext.req.url != '/service-unavailable'
      ) {
        redirect('/service-unavailable')
      }
      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true
        // await store.refreshAccessToken();
        // store.dispatch('user/setTokens', ssrContext)
        const cookies = process.env.SERVER
          ? Cookies.parseSSR(ssrContext)
          : Cookies
        const accessToken = cookies.get(STORAGE_ACCESS_TOKEN_KEY)
        instance.defaults.headers.common.Authorization =
          'Bearer ' + (accessToken || 'no-token')
        // axios.defaults.headers.common['Bearer'] = store.token.token;
        return instance(originalRequest)
      }
      return Promise.reject(error)
    }
  )
})

export { api, instance, axios, noAuth }

// import router from '@/router'
// import i18n from '@/localization'

// instance.interceptors.request.use((config) => {
//   config = {
//     ...config,
//     headers: {
//       ...config.headers,
//       'x-lang': i18n.locale,
//       Authorization: `Bearer ${store.state.user.accessToken}`,
//     },
//   }
//   return config
// }, error => Promise.reject(error))

// instance.interceptors.response.use(null, (error) => {
//   if (error.response && error.response.status === 503) {
//     router.replace('/service-unavailable')
//   }

//   return Promise.reject(error)
// })

// export default instance
