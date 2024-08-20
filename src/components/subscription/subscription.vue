<template>
    <div class="subscription">
        <div class="subscription__wrap" v-if="user !== null">
            <div class="subscription__avatar avatar">
                <div class="avatar__wrap">
                    <router-link v-slot="{href, navigate}" :to="`/user/${user.name}`"><a class="avatar__photo" :href="href" @click="navigate"><img class="avatar__img" v-if="user && user.media.avatar" :src="user.media.avatar" />
                            <div class="avatar__noavatar" v-else><svg class="avatar__icon" v-svg symbol="user"></svg></div>
                        </a></router-link>
                </div>
            </div>
            <div class="subscription__descr">
                <router-link v-slot="{href, navigate}" :to="`/user/${encodeURIComponent(user.name)}`"><a class="subscription__name" :href="href" @click="navigate">{{user.name}}</a></router-link>
                <div class="subscription__online" v-if="online"></div>
                <div class="subscription__verified" v-if="user.is_verified"><svg class="subscription__verified-icon text-primary" v-svg size="20" symbol="verified"></svg></div>
            </div>
            <div class="subscription__text" v-if="false"> {{$t('chat.subscriptionTo')}} 12.12.2021</div>
            <div class="subscription__actions"><button class="button button_type_success subscription__btn" v-if="hasUnsubscribe !== hasSubscribe" @click="fetchSubscribers" :class="{'button_type_info' : isSubscribed, 'button_type_success' : !isSubscribed}" v-text="$t(isSubscribed ? 'button.unsubscribe' : 'button.subscribe')"></button></div>
        </div>
    </div>
</template>

<script>

import {createNamespacedHelpers} from 'vuex'

const {mapState: mapEchoState} = createNamespacedHelpers('echo')

export default {
  name: 'Subscription',
  props: {
    id: {
      type: Number,
      default: 0,
    },
    user: {
      type: Object,
      default: null,
    },
    hasUnsubscribe: {
      type: Boolean,
      default: false,
    },
    hasSubscribe: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSubscribed: true,
    }
  },
  computed: {
    ...mapEchoState(['onlineUsers']),
    online() {
      return this.onlineUsers.includes(this.user.id)
    },
  },
  mounted() {
    this.isSubscribed = this.hasUnsubscribe
  },
  methods: {
    async fetchSubscribers() {
      try {
        const {data} = await this.$instance({
          method: this.isSubscribed ? 'DELETE' : 'POST',
          url: `/userfeed/channel/${this.id}/subscribe`,
          data: {
            channel_id: this.id,
          },
        })
        if (data) {
          this.isSubscribed = !this.isSubscribed
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.subscription {
  &__wrap {
    padding: 8px 20px;
    border-bottom: 1px solid var(--c-gray-10);
    display: flex;
    align-items: center;
    margin: 0 -20px;
    flex-wrap: wrap;

    @media (min-width: 1200px) {
      flex-wrap: nowrap;
      margin: 0;
    }
  }

  &__avatar {
    margin-right: 8px;

    @media (min-width: 1200px) {
      margin-right: 24px;
    }
  }

  &__actions {
    padding-left: 8px;
  }

  &__descr {
    max-width: calc(100% - 38px - 114px - 11px - 8px);
    flex-grow: 1;
    display: flex;
    align-items: center;
  }

  &__name {
    color: var(--c-gray-80);
    font-weight: var(--fw-600);
    font-size: 18px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
  }

  &__text {
    order: 2;
    width: 100%;
    font-size: var(--fz-sm);
    color: var(--c-gray-20);
    margin-top: 4px;

    @media (min-width: 1200px) {
      margin-top: 0;
    }
  }

  &__online {
    width: 6px;
    height: 6px;
    background: #3ABF8F;
    border-radius: 10px;
    margin-left: 5px;
    transform: translateY(-5px);
    flex-shrink: 0;
  }

  &__verified {
    margin-left: 8px;
    transform: translateY(1px);
    fill: var(--c-primary);
  }

  &__btn {
    flex-shrink: 0;
    min-width: 114px;
    display: block;

    @media (min-width: 1200px) {
      min-width: 156px;
    }
  }

  &__actions {
  }

  .avatar {
    &__photo {
      display: flex;
    }

    &__photo {
      background: var(--c-secondary);
      border-radius: var(--bdrs-default);
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      width: 40px;
      height: 40px;
      border: 4px solid var(--c-white);

      @media (min-width: 1200px) {
        width: 48px;
        height: 48px;
      }
    }

    &__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__icon {
      height: 24px;
      width: 24px;

      @media (min-width: 1200px) {
        height: 28px;
        width: 28px;
      }
    }

    &__noavatar {
      display: flex;
    }


    &__actions {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
