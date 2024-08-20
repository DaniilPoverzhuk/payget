import initialState from './initial-state'

export const reset = (state) => { /* eslint-disable-line no-unused-vars */
  state = Object.assign(state, initialState)
}

export const setPosts = (state, data) => {
  state.posts = data
}

export const setCurrentRouteTab = (state, data) => {
  state.currentRouteTab = data
}

export const setIsChat = (state, data) => {
  state.isChat = data
}

export const setTag = (state, data) => {
  state.filterPostsID = data.id
  state.filterPosts = data.slug
}

export const setFullPostsId = (state, data) => {
  state.fullPostsId = data
}

export const setTags = (state, data) => {
  state.feedsTags = data
}