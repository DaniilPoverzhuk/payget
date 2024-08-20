<template>
    <div class="user-subscribers">
        <div class="user-subscribers__inner">
            <div class="user-subscribers__search">
                <VInput v-model="search" :placeholder="$t('placeholder.lookingForWho')" step="any" type="search"></VInput>
            </div>
            <template v-if="subscribers.length > 0">
              <div class="user-subscribers__wrap" v-for="subscriber in subscribers" :key="subscriber.id">
                  <Subscription :id="subscriber.id" :user="subscriber.user" :hasSubscribe="subscriber.has_subscribe" :hasUnsubscribe="subscriber.has_unsubscribe"></Subscription>
              </div>
            </template>
            <div class="user-subscribers__nodata" v-if="subscribers.length == 0"> {{$t('noDataYet')}}</div>
            <Loader class="profile-channel__loader" ref="loader" :class="loader || 'profile-channel__loader--hidedn'"></Loader>
        </div>
    </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import VInput from 'src/components/extends/v-input/v-input.vue'
import Subscription from 'src/components/subscription/subscription.vue'
import Loader from 'src/components/loader/loader.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'UserSubscriptions',
  components: {
    VInput,
    Loader,
    Subscription,
  },
  data() {
    return {
      scrollInitstop: false,
      search: '',
      subscribers: [],
      timeout: null,
      loader: true,
      offset: 0,
    }
  },
  computed: {
    ...mapUserState(['channelInfo']),
  },
  watch: {
    search() {
      this.filterChatList()
    },
    channelInfo() {
      this.info = this.channelInfo
    },
  },
  created() {
    this.getFavoriteList()
  },
  mounted() {
    this.scrollInit()
  },
  methods: {
    filterChatList() {
      if (this.timeout) { clearTimeout(this.timeout) }
      this.timeout = setTimeout(() => {
        this.offset = 0
        this.subscribers = []
        this.getFavoriteList()
      }, 900)
    },
    async getFavoriteList() {
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: 'userfeed/favorite-channels',
          params: {
            offset: this.offset > 0 ? this.offset : undefined,
            search: this.search.length > 0 ? this.search : undefined,
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
    scrollInit() {
      if (this.loader) {
        document.addEventListener('scroll', () => {
          if (this.$refs.loader && this.$refs.loader.$el && this.subscribers.length >= 9) {
            setTimeout(() => {
              const loaderContext = this.$refs.loader.$el
              const offsetTop = loaderContext.getBoundingClientRect().top
              if (offsetTop - window.top.innerHeight <= 0 && !this.scrollInitstop) {
                this.scrollInitstop = true
                this.getFavoriteList()
              } else if (offsetTop - window.top.innerHeight > 0 && !this.scrollInitstop) {
                this.loader = true
              }
            }, 500)
          }
        })
      }
    },
  },
}
</script>

<style lang="scss">
.user-subscribers {
  &__search {
    max-width: 361px;
    margin-left: auto;
    margin-bottom: 24px;

    @media (min-width: 1200px) {
      margin-top: 28px;
    }
  }

  &__nodata {
    font-weight: var(--fw-500);
    text-align: center;
    max-width: 836px;
    margin: auto;

    @media (min-width: 1200px) {
      display: flex;
      align-items: center;
    }
  }

  &__wrap {
    max-width: 836px;
    margin: auto;
  }
}
</style>
