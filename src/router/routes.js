import store from 'src/store'
import {
  STORAGE_ACCESS_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  USER_ROLE,
  REFERRAL_ID,
} from 'src/constants'
import { useStore } from 'vuex'

import { Cookies } from 'quasar'

import { instance } from 'src/boot/axios'

const { MEMBER, ADMIN, MODERATOR } = USER_ROLE

const redirectIfNotAdmin = (to, from, next) => {
  const { role } = useStore().state.user
  if (role !== ADMIN) {
    if (to.params.user_id) {
      next({
        name: 'user',
        params: {
          user_id: to.params.user_id,
        },
        replace: true,
      })
    } else if (role === MODERATOR) {
      next('/disputes')
    } else {
      next('/')
    }
    return
  }
  next()
}

const redirectStatistics = (to, from, next) => {
  const { permissions } = useStore().state.user
  if (permissions && !permissions.includes('statistic.access')) {
    next('/')
    return
  }
  next()
}

const redirectIfNotAdminOrModerator = (to, from, next) => {
  const { role } = useStore().state.user
  if (!(role === ADMIN || role === MODERATOR)) {
    if (to.params.user_id) {
      next({
        name: 'user',
        params: {
          user_id: to.params.user_id,
        },
        replace: true,
      })
    } else {
      next('/')
    }
    return
  }
  next()
}

const routes = ({ store, ssrContext }) => {
  const getUserStore = async (to, from, next) => {
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
    const access_Token = cookies.get(STORAGE_ACCESS_TOKEN_KEY)
    const { auth } = store.state.user
    if (access_Token) {
      if (typeof window !== 'undefined' && !window.echo) {
        store.dispatch('user/initEcho')
        store.commit('user/setTheme', store.state.user.color_theme || 'light')
      }
      if (auth) {
        next()
      } else {
        await store.dispatch('user/init', { ssrContext })
        next()
      }
    } else {
      await store.commit('user/reset')
      await store.commit('echo/reset')
      await store.dispatch('user/destroySession', ssrContext)
      next()
    }
  }

  const redirectIfNotAuth = (to, from, next) => {
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
    const access_Token = cookies.get(STORAGE_ACCESS_TOKEN_KEY)
    const { auth } = store.state.user
    if (access_Token && auth) {
      next()
      return
    }
    next('/')
  }
  return [
    {
      path: '/',
      component: () => import('layouts/default/default.vue'),
      beforeEnter: getUserStore,
      children: [
        // { path: '', component: () => import('pages/IndexPage.vue') },
        {
          path: '',
          component: () => import('pages/main/main.vue'),
        },
        {
          path: 'registration',
          component: () => import('pages/registration/registration.vue'),
        },
        {
          path: 'exchange',
          component: () => import('pages/exchange/new-exchange.vue'),
        },
        {
          path: 'exchange/offer',
          component: () => import('pages/swop/swop.vue'),
        },
        // В помойку
        // {
        //   path: 'rates',
        //   component: () => import('pages/rates/rates.vue')
        // },
        {
          path: 'ads',
          component: () => import('pages/ads/ads.vue'),
        },
        {
          path: 'emoji',
          component: () => import('pages/emoji/emoji.vue'),
        },
        {
          path: 'history',
          component: () => import('pages/history/history.vue'),
        },
        {
          path: 'history/:name',
          component: () => import('pages/history/history.vue'),
          beforeEnter: redirectIfNotAdmin,
        },
        {
          path: 'deposit',
          component: () => import('pages/deposit/deposit.vue'),
          beforeEnter: redirectIfNotAuth,
        },
        {
          path: 'messages',
          component: () => import('pages/messages/messages.vue'),
          children: [
            {
              path: ':chat_id',
              component: () => import('pages/chat/chat.vue'),
            },
          ],
        },
        {
          path: 'feeds',
          component: () => import('pages/feeds/new-feeds.vue'),
          children: [
            {
              path: ':chat_id/:comments?/:comment_id?',
              component: () => import('pages/feed/feed.vue'),
            },
          ],
        },
        {
          path: 'feeds/tag/:tag_id',
          component: () => import('pages/feeds/new-feeds.vue'),
        },
        {
          path: 'rules',
          component: () => import('pages/knowledge-base/article/article.vue'),
        },
        {
          name: 'user',
          path: 'user/:name/:subpage?/:slug?',
          component: () => import('pages/user/user.vue'),
          children: [
            {
              path: 'reviews',
            },
            {
              path: 'logs',
              beforeEnter: redirectIfNotAdminOrModerator,
            },
            {
              path: 'deposit-history',
              beforeEnter: redirectIfNotAdminOrModerator,
            },
            {
              path: 'profile-editing',
              beforeEnter: redirectIfNotAdmin,
            },
            {
              path: 'subscribers',
            },
            {
              path: 'subscriptions',
            },
            {
              path: 'comments',
              children: [{ path: ':comment_id' }],
            },
            {
              path: 'channel',
              children: [
                {
                  path: ':slug_id',
                  // component: () => import('../components/channel/channel'),
                },
              ],
            },
          ],
        },
        // {path: '/deposit', component: () => import('pages/deposit/deposit.vue')},
        {
          path: 'users',
          beforeEnter: redirectIfNotAdminOrModerator,
          component: () => import('pages/users/users.vue'),
        },
        {
          path: 'profile-settings',
          component: () =>
            import('pages/profile-settings/profile-settings.vue'),
        },
        {
          path: 'complaints',
          beforeEnter: redirectIfNotAdmin,
          component: () => import('pages/complaints/complaints.vue'),
        },
        {
          path: 'complaints/:id',
          beforeEnter: redirectIfNotAdmin,
          component: () =>
            import('components/helper/page-complaints/complaint/complaint.vue'),
        },
        {
          path: 'disputes',
          component: () => import('pages/disputes/disputes.vue'),
          beforeEnter: redirectIfNotAdminOrModerator,
          children: [
            {
              path: ':chat_id',
              component: () => import('pages/chat/chat.vue'),
            },
          ],
        },
        {
          path: 'tickets',
          name: 'tickets',
          component: () => import('pages/tickets/tickets.vue'),
          beforeEnter: redirectIfNotAdminOrModerator,
        },
        {
          path: 'tickets/:id',
          name: 'ticket',
          beforeEnter: redirectIfNotAdmin,
          component: () => import('pages/ticket/ticket.vue'),
        },
        {
          path: 'tickets/:id/edit',
          beforeEnter: redirectIfNotAdmin,
          component: () =>
            import('components/helper/page-tikets/table-user/table-user.vue'),
        },
        {
          path: 'knowledge-base',
          component: () => import('pages/knowledge-base/knowledge-base.vue'),
        },
        {
          path: 'knowledge-base/kontakty',
          component: () => import('pages/contacts/contacts.vue'),
        },
        {
          path: 'knowledge-base/:article',
          component: () => import('pages/knowledge-base/article/article.vue'),
        },
        {
          path: 'logs',
          beforeEnter: redirectIfNotAdmin,
          component: () => import('pages/logs/logs.vue'),
        },
        {
          path: 'deals',
          beforeEnter: redirectIfNotAdmin,
          component: () => import('pages/deals/deals.vue'),
        },
        {
          path: 'withdraws',
          beforeEnter: redirectIfNotAdmin,
          component: () => import('pages/withdraws/withdraws.vue'),
        },
        {
          beforeEnter: redirectStatistics,
          path: 'statistics',
          component: () => import('pages/statistics/statistics.vue'),
        },
        {
          path: 'referral',
          component: () => import('pages/referral/referral.vue'),
        },
        {
          path: 'support',
          component: () => import('pages/support/support.vue'),
          children: [
            {
              path: ':id',
              component: () => import('pages/ticket/ticket.vue'),
            },
          ],
        },
        {
          name: 'service-unavailable',
          path: 'service-unavailable',
          component: () => import('pages/error/503.vue'),
        },
      ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
      path: '/:catchAll(.*)*',
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ]
}

export default routes
