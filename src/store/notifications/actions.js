// import authorizedAxios from '@/axios'
import error from 'src/error'
import { instance as authorizedAxios } from 'boot/axios'

export const fetchNotifications = async ({ state, commit }, id) => {
  try {
    const response = await authorizedAxios({
      method: 'GET',
      url: `/user/${id}/notification`,
      params: {
        cursor: state.paginate !== null ? state.paginate : undefined,
      },
    })
    if (response.status === 200) {
      if (state.notifications === null) {
        commit('setSomeState', ['notifications', response.data.data])
        commit('setSomeState', ['paginate', response.data.paginate.next_cursor])
      } else {
        commit('addNotifications', response.data)
        commit('setSomeState', ['paginate', response.data.paginate.next_cursor])
      }
    }
  } catch {
    return error.show()
  }
}

export const initNotificationWebsocket = async ({
  commit, state,
}, id) => {
  if (typeof window !== 'undefined') {
    window.echo?.private(`Notification.User.${id}`)
      .listen('update', (e) => {
        commit('setSomeState', ['notice', e])
      })
  }
}


export const fetchSettings = async ({ state, commit }, data) => {
  const { id, namespace } = data
  try {
    const response = await authorizedAxios({
      method: 'GET',
      url: `/user/${id}/notification/settings?filter[namespace]=${namespace}`,
    })
    if (response.status === 200) {
      if (namespace === 'app') {
        commit('setSomeState', ['settingsApp', response.data.data])
      } else {
        commit('setSomeState', ['settingsTelegram', response.data.data.settings])
      }
    }
  } catch (error) {
    return error.show()
  }
}
export const editSettings = async ({ state, commit }, data) => {
  const { type, id, params } = data

  try {
    const response = await authorizedAxios({
      url: `user/${id}/notification/settings`,
      data: params,
    })

    if (response) {
      commit('setSettings', data)
    }
  } catch {
    return error.response
  }
}

export const fetchNotificationRead = async ({ state, commit }, data) => {
  const { id, notificationId, type } = data
  try {
    await authorizedAxios({
      method: 'GET',
      url: `user/${id}/notification/${notificationId}`,
      params: {
        action: type,
      },
    })
  } catch {
    return error.show()
  }
}
export const fetchChatRead = async ({ state, commit }, chatId) => {
  try {
    await authorizedAxios({
      method: 'GET',
      url: `chat/${chatId}`,
      params: {
        action: 'read',
      },
    })
  } catch {
    return error.show()
  }
}
