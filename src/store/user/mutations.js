import { Cookies } from 'quasar'
import initialState from './initial-state'
import {
  STORAGE_ACCESS_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
} from 'src/constants'

export const init = async (state, userData) => {
  state = Object.assign(state, userData)
}

export const setTokens = (state, { accessToken, refreshToken }, ssrContext) => {
  try {
    state.accessToken = accessToken
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
    cookies?.set(STORAGE_ACCESS_TOKEN_KEY, accessToken, { path: '/' })
    cookies?.set(STORAGE_REFRESH_TOKEN_KEY, refreshToken, {
      expires: 365,
      path: '/',
    })
  } catch (e) {
    console.log('error access token', e)
  }
}

export const setDataProfile = (state, data) => {
  state.dataProfile = data
}

export const reset = (state) => {
  /* eslint-disable-line no-unused-vars */
  //   state = JSON.parse(JSON.stringify(initialState))
  state.accessToken = null
  state.active_exchange = null
  state.auth = false
  state.banned_at = null
  state.color_theme = null
  state.deposit = null
  state.deposit_hold = null
  state.deposit_sum = null
  state.deposit_supplement = null
  state.email = null
  state.error = false
  state.flags = null
  state.google = null
  state.id = null
  state.login = null
  state.name = null
  state.refs = null
  state.role = null
  state.requestData = null
  state.token_api = null
  state.webhooks = null
  state.viewUserId = null
  state.server_time = null
  state.readId = null
  state.avatar = ''
  state.banner = ''
  state.about_me = ''
  state.is_verified = ''
  state.routLinkToMessage = null
  state.channelInfo = null
  state.chatMuted = {}
  state.graphStore = {}
  state.permissions = []
  state.stateTabStore = ''
  state.isUnreadNotifications = false
  state.telegram = null
  state.depositConfig = null
  state.routeFullPath = ''
  state.test = ''
  state.media = {}
  state.config = {}
  state.dataProfile = null
}
export const setChatMuted = (state, prop) => {
  state.chatMuted = {
    ...state.chatMuted,
    ...prop,
  }
}

export const setStateTabStore = (state, data) => {
  state.stateTabStore = data
}
export const setRoutePath = (state, data) => {
  try {
    state.test = (' ' + data).slice(1)
  } catch (e) {
    console.log('setRoutePath error', e)
  }
}
export const setPermissions = (state, data) => {
  state.permissions = JSON.parse(JSON.stringify(data))
}
export const setGraphStore = (state, data) => {
  state.graphStore = JSON.parse(JSON.stringify(data))
}
export const setChannelInfo = (state, data) => {
  state.channelInfo = JSON.parse(JSON.stringify(data))
}

export const setSomeState = (state, data) => {
  state[data[0]] = data[1]
}

export const setTheme = (state, newTheme) => {
  const DARK_THEME_CLASS = 'dark'
  const DEFAULT_THEME = 'light'
  newTheme === 'system'
    ? (state.color_theme = DEFAULT_THEME)
    : (state.color_theme = newTheme)
  if (newTheme === 'dark') {
    if (typeof document !== 'undefined') {
      document.body.classList.add(DARK_THEME_CLASS)
    }
  } else {
    if (typeof document !== 'undefined') {
      document.body.classList.remove(DARK_THEME_CLASS)
    }
  }
}

export const setOnlineStatus = (state, e) => {
  const { type } = e
  state.online = type === 'online'
}

export const setRoutLinkToMessage = (state, data) => {
  state.routLinkToMessage = data
}

export const setCurrencies = (state, data) => {
  try {
    state.currencies = JSON.parse(JSON.stringify(data))
  } catch (e) {
    console.log('setCurrencies error', e)
  }
}

export const setError = (state, error) => {
  state.error = error
}

export const fillRequestData = (state, data) => {
  state.requestData = data
}

export const setFlagNewMessage = (state, data) => {
  state.flags = Object.assign(state, data)
}
export const setFlagNewMessageOne = (state, data) => {
  state.flags = {
    ...state,
    new_message: data,
  }
}

export const setReadId = (state, data) => {
  state.readId = data
}

export const setOfferFile = (state, data) => {
  state.offer_file = data
}
