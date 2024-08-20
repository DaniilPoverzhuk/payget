// import store from '@/store'
// import i18n from "@/localization";

// import store from 'src/store/index.js'
// import i18n from 'src/boot/i18n.js'

import { Notify } from 'quasar'



export default {
  show (title, text) {
    console.log(title)
    Notify.create({type: 'negative', message: title, caption: ''})

    // const errorTitle = i18n.t(title || 'error.failedData')
    // store.commit('user/setError', [errorTitle, i18n.t(text)])
  },
  hide () {
    // store.commit('user/setError', false)
  },
}



