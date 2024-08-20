import initialState from './initial-state'

export const setOnlineUsers = (state, users) => {
  state.onlineUsers = users
}

export const removeOnlineUser = (state, user) => {
  state.onlineUsers = [...state.onlineUsers].filter(item => item !== user)
}

export const addOnlineUser = (state, user) => {
  state.onlineUsers = [...state.onlineUsers, user]
}

export const reset = (state) => { /* eslint-disable-line no-unused-vars */
  state = Object.assign(state, initialState)
}
