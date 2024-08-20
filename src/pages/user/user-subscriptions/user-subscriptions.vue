<template>
    <div class="user-subscriptions">
        <router-link v-slot="{href, navigate}" :to="`/user/${$route.params.name}`"><a class="user-subscriptions__go-back" :href="href" @click="navigate"><svg class="user-subscriptions__icon text-gray-300 dark:text-gray-500" v-svg aria-hidden="true" size="18 17" symbol="back-arrow"></svg>{{ $t('channel.goBack') }}</a></router-link>
        <h1 class="user-subscriptions__title">{{ $t('channel.subscribers') }}</h1>
        <div class="user-subscriptions__inner">
          <template v-if="subscribers.length > 0">
              <div class="user-subscribers__wrap" v-for="subscriber in subscribers" :key="subscriber.id">
                  <Subscription :id="subscriber.id" :user="subscriber" :hasSubscribe="subscriber.channel !== null ? subscriber.channel.has_subscribe : false" :hasUnsubscribe="subscriber.channel !== null ? subscriber.channel.has_unsubscribe : false"></Subscription>
              </div>
          </template>
            <div class="user-subscribers__nodata" v-if="subscribers.length == 0"> {{ $t('noDataYet') }}</div>
            <Loader class="profile-channel__loader" ref="loader" :class="loader || 'profile-channel__loader--hidedn'"></Loader>
        </div>
    </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
// import Search from 'src/components/extends/search/search.vue'
import Subscription from 'src/components/subscription/subscription.vue'
import Loader from 'src/components/loader/loader.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'UserSubscriptions',
  components: {
    // Search,
    Subscription,
    Loader,
  },
  data() {
    return {
      scrollInitstop: false,
      limit: 20,
      loader: true,
      offset: 0,
      search: '',
      requestFilter: 'all',
      disputesFilter: 'own',
      subscribers: [],
      newQuantity: null,
      searchQuery: null,
    }
  },
  watch: {
    channelInfo() {
      this.fetchSubscribers()
    },
  },
  computed: {
    ...mapUserState(['id']),
  },
  created() {
    if (this.info !== null) this.fetchSubscribers()
    this.scrollInit()
  },
  methods: {
    setParamsPath(type) {
      if (type !== this.requestFilter) {
        this.$router.push({ query: { tab: type } })
      }
    },
    scrollInit() {
      if (this.loader) {
        document.addEventListener('scroll', () => {
          if (this.$refs.loader && this.$refs.loader.$el && this.subscribers.length >= 9) {
            setTimeout(() => {
              const loaderContext = this.$refs.loader.$el
              const offsetTop = loaderContext.getBoundingClientRect().top
              if (offsetTop - window.top.innerHeight <= 0 && !this.scrollInitstop) {
                this.scrollInitstop = true
                this.fetchSubscribers()
              } else if (offsetTop - window.top.innerHeight > 0 && !this.scrollInitstop) {
                this.loader = true
              }
            }, 500)
          }
        })
      }
    },
    async fetchSubscribers() {
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: `userfeed/channel/${this.id}/subscribers`,
          params: {
            channel_id: this.id,
            offset: this.offset,
            limit: this.limit,
          },
        })
        if (data) {
          if (data.data.length > 0) {
            this.subscribers = [
              ...this.subscribers,
              ...data.data,
            ]
            this.offset = this.offset + 10
            this.scrollInitstop = false
            this.loader = false
          } else {
            this.scrollInitstop = false
            this.loader = false
          }
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.user-subscriptions {
  &__wrap {
    max-width: 836px;
    margin: 24px auto 0;

    @media (min-width: 1200px) {
      margin-top: 28px;
    }
  }

  &__title {
    margin-bottom: 28px;
    text-align: center;

    @media (min-width: 1200px) {
      text-align: left;
      margin-bottom: 20px;
    }
  }

  &__go-back {
    color: var(--c-gray-20);
    font-size: 14px;
    line-height: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 24px;
    text-decoration: none;


    &:hover {
      color: var(--c-primary);

      .icon {
        fill: var(--c-primary);
      }
    }

  }

  &__icon {
    fill: var(--c-gray-20);
    margin-right: 16px;
  }

  .filter {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -20px;
    font-size: var(--fz-xl);
    font-weight: 600;

    @media (min-width: 1200px) {
      margin: 0 -24px;
    }
  }

  .filter__item {
    margin: 0 20px;

    @media (min-width: 1200px) {
      margin: 0 24px;
    }
  }

  .filter__radio {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: -1px;
    clip: rect(0, 0, 0, 0);
  }

  .filter__radio:checked + .filter__label {
    color: var(--c-primary);
    cursor: default;
  }

  .filter__num {
    font-weight: var(--fw-600);
    font-size: var(--fz-lg);
    color: var(--c-gray-20);
  }

  .filter__label {
    display: flex;
    align-items: center;
    cursor: pointer;

    &_mark {
      position: relative;

      &::after {
        position: absolute;
        width: 6px;
        height: 6px;
        background-color: var(--c-primary);
        border-radius: var(--bdrs-round);
        content: '';
        display: block;
        top: 3px;
        right: -10px;
      }
    }
  }
}
</style>
