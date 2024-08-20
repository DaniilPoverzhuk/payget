import { Cookies } from 'quasar'
import { STORAGE_ACCESS_TOKEN_KEY } from 'src/constants'

export const joinOnline = ({ rootState, commit }, ssrContext) => {
  console.log('triggered joinOnline')
  if (typeof window !== 'undefined') {
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
    if (!window.echo) return
    window.echo.join('online')
      .here((users) => {
        const authToken = cookies.get(STORAGE_ACCESS_TOKEN_KEY)

        window.echo.private(`General.User.${rootState.user.id}`).whisper('online', {
          token: authToken,
        })
        commit('setOnlineUsers', users)
      })
      .joining((user) => {
        commit('addOnlineUser', user)
      })
      .leaving((user) => {
        commit('removeOnlineUser', user)
      })
  }
}

export const leaveOnline = () => {
  if (typeof window !== 'undefined') {
    if (!window.echo) return
    window.echo.leave('online')
  }
}
