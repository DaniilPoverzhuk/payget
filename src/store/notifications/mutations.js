export const setSomeState = (state, data) => {
  state[data[0]] = JSON.parse(JSON.stringify(data[1]))
}

export const addNotifications = (state, data) => {
  state.notifications.push(...data.data)
}

export const setShowHeader = (state, data) => {
  state.showHeader = data
}

export const setSettings = (state, data) => {
  const params = data.params[0]
  const { key } = params
  if (state.settingsApp.hasOwnProperty(key)) {
    state.settingsApp[key] = !state.settingsApp[key]
  } else {
    state.settingsApp.settings[key].state = !state.settingsApp.settings[key].state
  }
}
