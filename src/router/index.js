import { route } from 'quasar/wrappers'
import {Cookies} from 'quasar'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
// import cookies from 'js-cookie'
import {
  STORAGE_ACCESS_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  USER_ROLE,
  REFERRAL_ID,
} from 'src/constants'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ store, ssrContext }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : createWebHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: routes({ store, ssrContext }),

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async ({path}, from, next) => {
    store.dispatch('layout/setBarActive', true)
    setReferralId()

    next()
  })

  Router.afterEach((to, from) => {
    store.dispatch('layout/setBarActive', false)
  })

  const setReferralId = () => {
    const { role } = store.state.user
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies

    if (typeof window !== 'undefined') {
      if (role || !window.location.search) return
      const urlParams = new URLSearchParams(window.location.search)
      const referralId = urlParams.get('ref')
      if (!referralId) return
      cookies.set(REFERRAL_ID, referralId)
    }
  }

  return Router
})


