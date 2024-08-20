import io from 'socket.io-client'
// import cookies from 'js-cookie'
import Echo from 'laravel-echo'
// boot/axios
import {
  instance as authorizedAxios,
  axios,
  noAuth as noAuthAxios,
  api,
} from 'boot/axios'

// import axios from 'axios'
// import authorizedAxios from '@/axios'
// import noAuthAxios from '@/no-auth-axios'
// import i18n from '@/localization'
import {
  STORAGE_REFRESH_TOKEN_KEY,
  STORAGE_ACCESS_TOKEN_KEY,
} from 'src/constants'

import { Quasar, Cookies } from 'quasar'

const oauthAxios = ({ data }) =>
  axios({
    method: 'post',
    url: `${process.env.VUE_APP_URL}oauth/token`,
    headers: {
      'x-lang': Quasar.lang.getLocale(),
    },
    data: {
      ...data,
      client_id: process.env.VUE_APP_CLIENT_ID,
      client_secret: process.env.VUE_APP_CLIENT_SECRET,
    },
  })

export const setTokens = async ({ commit }, ssrContext) => {
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
  const oldRefreshToken = cookies.get(STORAGE_REFRESH_TOKEN_KEY)
  const accessToken = cookies.get(STORAGE_ACCESS_TOKEN_KEY)
  return accessToken
  //   if (oldRefreshToken) {
  //     try {
  //       const data = await oauthAxios({
  //         data: {
  //           grant_type: 'refresh_token',
  //           refresh_token: oldRefreshToken,
  //         },
  //       })
  //       console.log('oauthAxios data', data)
  //       if (data) {
  //         commit('setTokens', { accessToken: data.access_token, refreshToken: data.refresh_token }, ssrContext)
  //         return data.access_token
  //       }
  //     } catch (e) {
  //       const test = !!ssrContext
  //       console.log('isSsrContext', test)
  //       console.log('ffffffffff', process.env.SERVER)
  //       console.log('error111', 'oldRefreshToken', e)
  //     }
  //   }
}

export const init = async ({ commit, state, dispatch, ssrContext }) => {
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
  try {
    if (!state.auth) {
      const {
        data: { data },
      } = await authorizedAxios({
        url: 'user/get/data',
      })
      await commit('init', {
        ...state,
        ...data,
      })
      if (data) {
        commit('setTheme', data.color_theme)
        // commit('setNotificationsOption', data.notifications)
        commit('setPermissions', data.permissions)
        commit('setSomeState', ['avatar', data.media.avatar])
        commit('setSomeState', ['banner', data.media.banner])
        commit('setSomeState', ['about_me', data.about_me])
        commit('setSomeState', ['is_verified', data.is_verified])
        commit('setSomeState', [
          'isUnreadNotifications',
          data.is_unread_notifications,
        ])
        commit('setSomeState', ['telegram', data.telegram])
        commit('setSomeState', ['depositConfig', data.config])
      }

      // if (data.lang && Quasar.lang.get() && Quasar.lang.get().locale !== data.lang) Quasar.lang.set(data.lang, ssrContext)
    }
  } catch (e) {
    console.log('init user/get/data', e)
  }

  // dispatch('setNotification')
}

export const initEcho = async ({ commit, state, dispatch, ssrContext }) => {
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
  const access_Token = cookies.get(STORAGE_ACCESS_TOKEN_KEY)
  if (typeof window !== 'undefined') {
    if (window.echo) return
    console.log('echo init')
    window.echo = new Echo({
      client: io,
      broadcaster: 'socket.io',
      namespace: '',
      host: `${process.env.VUE_SOCKET_URL}:${process.env.VUE_SOCKET_PORT}`,
      auth: { headers: { Authorization: `Bearer ${access_Token}` } },
    })

    window.echo
      .private(`General.User.${state.id}`)
      .listen('update', (e) => {
        if (!e.auth) {
          dispatch('destroySession', ssrContext)
        } else {
          // commit('setNotificationsOption', e.notifications)
          commit('init', {
            ...state,
            ...e,
          })
        }
      })
      .listenForWhisper('online', ({ token }) => {
        if (token === cookies.get(STORAGE_ACCESS_TOKEN_KEY)) return
        dispatch('destroySession', ssrContext)
      })
      .listen('telegram-connected', (e) => {
        commit('setSomeState', ['telegram', e.telegram.id])
      })
      .listen('telegram-disconnected', (e) => {
        commit('setSomeState', ['telegram', e.telegram])
      })
  }
  dispatch('echo/joinOnline', null, { root: true }, ssrContext)
}

export const update = async ({ commit }, data) => {
  const {
    data: { status, message },
  } = await authorizedAxios({
    url: 'user/update',
    data,
  })

  if (status && !data.user_id) {
    commit('init', data)
  }

  return { status, message }
}

export const signInTg = async (context, dataTg, ssrContext) => {
  const { data } = await oauthAxios({
    data: {
      data: dataTg,
      scope: 'private',
      grant_type: 'telegram',
    },
  })
  console.log('data', data)
  try {
    context.commit(
      'setTokens',
      { accessToken: data.access_token, refreshToken: data.refresh_token },
      ssrContext
    )
    await init(context)
    await initEcho(context)
    await context.dispatch('echo/joinOnline', null, { root: true })
  } catch (e) {
    console.log('signIn error', e)
  }
}

export const signIn = async (
  context,
  { username, password, captcha, captchaKey, qrCode },
  ssrContext
) => {
  const { data } = await oauthAxios({
    data: {
      username,
      password,
      captcha,
      captcha_key: captchaKey,
      grant_type: 'password',
      google_code: qrCode,
    },
  })
  if (data.error) {
    if (data.error === 'captcha') {
      context.commit('setError', [Quasar.lang.set().t('error.pictureEntered')])
    }
    if (data.error === 'doauth') {
      context.commit('setError', [Quasar.lang.set().t('error.authentication')])
      context.commit('init', {
        ...context.state,
        google: {
          ...context.state.google,
          security: 1,
        },
      })
    }
  } else {
    try {
      context.commit(
        'setTokens',
        { accessToken: data.access_token, refreshToken: data.refresh_token },
        ssrContext
      )
      await init(context)
      await initEcho(context)
      await context.dispatch('echo/joinOnline', null, { root: true })
    } catch (e) {
      console.log('signIn error', e)
    }
  }
}

export const destroySession = async ({ commit }, ssrContext) => {
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
  cookies.remove(STORAGE_REFRESH_TOKEN_KEY)
  cookies.remove(STORAGE_ACCESS_TOKEN_KEY)
  commit('setTheme', 'light')
  ;['user', 'echo'].forEach((module) => {
    commit(`${module}/reset`, null, { root: true })
  })
}

export const logOut = async ({ dispatch }, ssrContext) => {
  await authorizedAxios({
    url: 'user/logout',
  })
  dispatch('destroySession', ssrContext)
  if (typeof window !== 'undefined') {
    if (window.echo) {
      window.echo.leave('online')
    }
    if (window.location.pathname !== '/') {
      window.location.href = '/'
    }
  }
  try {
    await axios({
      url: '/logout.gif',
    })
  } catch (e) {
    console.log('logout.gif', e)
  }
}

export const setCurrencies = async ({ commit }) => {
  const data = { is_popular: 0 }
  if (typeof window !== 'undefined') {
    data.is_popular = window.location.pathname === '/' ? 1 : 0
  }
  await noAuthAxios({
    url: 'rate/list',
    data,
  }).then(({ data: { data: currencies } }) => {
    const currenciesSorted = currencies
      .sort((a, b) => a.sort - b.sort)
      .reduce((obj, currency) => {
        obj[currency.symbol] = currency
        return obj
      }, {})
    commit('setCurrencies', structuredClone(currenciesSorted))
  })
}

export const setRouteFullPath = async ({ commit }, data) => {
  // commit('setRoutePath', data)
}
