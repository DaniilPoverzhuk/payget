export const showMenu = ({ state, commit }) => {
  if (state.menu) return

  commit('showBackdrop')
  commit('showMenu')
}

export const hideMenu = ({ state, commit }) => {
  if (!state.menu) return

  commit('hideBackdrop')
  commit('hideMenu')
}

export const setFilters = ({ state, commit }, data) => {
  commit('applyFilters', data)
}

export const setBarActive = ({ state, commit }, data) => {
  commit('setBarActive', data)
}

export const setIsMobile = ({ state, commit }, data) => {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    commit('setIsMobile', true)
  }
}
