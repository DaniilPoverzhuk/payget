import axios from 'axios'
import router from 'src/router'

const instance = axios.create({
  method: 'post',
  baseURL: `${process.env.VUE_APP_STATISTICS_URL}/`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

instance.interceptors.response.use(null, (error) => {
  if (error.response && error.response.status === 503 && router.name != 'service-unavailable') {
    router.replace('/service-unavailable')
  }
  return Promise.reject(error)
})

export default instance
