import initialState from './initial-state'

export const showBackdrop = (state) => {
  if (!state.backdrop) state.backdrop = true
}

export const hideBackdrop = (state) => {
  if (state.backdrop) state.backdrop = false
}

export const showMenu = (state) => {
  state.menu = true
}

export const hideMenu = (state) => {
  state.menu = false
}

export const applyFilters = (state, data) => {
  state.filterAttributes = data
}

export const setIsMobile = (state, data) => {
  state.isMobile = data
}

export const setActiveNotification = (state, data) => {
  state.activeNotification = data
}

export const setBarActive = (state, data) => {
  state.isBarActive = data
}

export const setSomeState = (state, data) => {
  state[data[0]] = data[1]
}

export const reset = (state) => { /* eslint-disable-line no-unused-vars */
  state = Object.assign(state, initialState)
}
