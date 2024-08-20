import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

// import example from './module-example'
import echo from './echo'
import user from './user'
import layout from './layout'
import notifications from './notifications'
import feeds from './feeds'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function ({ ssrContext }) {
  const Store = createStore({
    modules: {
      // example
      echo,
      user,
      layout,
      notifications,
      feeds,
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: false
  })

  return Store
})
