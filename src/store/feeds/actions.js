import { api, instance } from 'boot/axios'

export const getPosts = async ({ commit }, route) => {
  commit('setCurrentRouteTab', route.query?.tab)
  commit('setIsChat', route.params.chat_id || false)
  if (route.params.chat_id) {
    try {
      const { data, status } = await instance({
        method: 'GET',
        url: `/userfeed/post/${route.params.chat_id}`,
        params: {
          idOrSlug: route.params.chat_id,
        },
      })
      if (data) {
        commit('setFullPostsId', data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }
  let tag
  if (route.params.tag_id) {
    try {
      const { data, status } = await api({
        method: 'GET',
        url: 'userfeed/tag',
        params: {
          limit: 30,
        },
      })
      if (data) {
        tag = data.data.find(el => el.slug === route.params.tag_id)
        commit('setTag', tag)
      }
    } catch {
      console.log('tags')
    }
  }
  try {
    const { data } = await instance({
      method: 'GET',
      url: 'userfeed/feed',
      params: {
        offset: 0,
        'filter[type]': (route.query.tab === 'new' ? 'fresh' : route.query.tab) || 'popular',
        'filter[tag_id]': tag ? tag.id : undefined
      },
    })
    if (data.data.length > 0) {
      commit('setPosts', data.data)
    }
  } catch (e) {
    console.log('getPosts 1 userfeed/feed', e)
  }
}

export const updateTags = ({ state, commit }, data) => {
  console.log('updateTags', data)
  if (state.feedsTags.includes(data)) {
    const newTags = state.feedsTags.filter(x => x !== data)
    commit('setTags', newTags)
  } else {
    const newTags = state.feedsTags.slice(0)
    newTags.push(data)
    commit('setTags', newTags)
  }
}

export const clearPosts = ({ commit }) => {
  commit('setPosts', [])
}