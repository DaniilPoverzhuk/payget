import {instance} from './..boot/axios'

const ApiService = {
  query(resource, params = null) {
    return instance.get(resource, { params })
      .then(response => response.data)
      .catch((error) => {
        throw new Error(`[RWV] ApiService ${error}`)
      })
  },
  get(resource, slug = '', config = null) {
    return instance.get(`${resource}/${slug}`, config)
      .then(response => response.data)
      .catch((error) => {
        throw new Error(`[RWV] ApiService ${error}`)
      })
  },
  post(resource, params, config = null) {
    return instance.post(`${resource}`, params, config)
      .then(response => response.data)
      .catch((error) => {
        throw new Error(`[RWV] ApiService ${error}`)
      })
  },
  update(resource, slug, params) {
    return instance.put(`${resource}/${slug}`, params)
      .then(response => response.data)
      .catch((error) => {
        throw new Error(`[RWV] ApiService ${error}`)
      })
  },
  put(resource, params) {
    return instance.put(`${resource}`, params)
      .then(response => response.data)
      .catch((error) => {
        throw new Error(`[RWV] ApiService ${error}`)
      })
  },
  delete(resource, params = null) {
    return instance.delete(resource, { params })
      .then(response => response.data)
      .catch((error) => {
        throw new Error(`[RWV] ApiService ${error}`)
      })
  },
}

export default ApiService
