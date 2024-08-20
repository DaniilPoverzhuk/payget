<template>
    <div class="user-profile" v-if="dataProfile !== null">
        <div class="user-profile__inner"><img class="user-profile__banner" :class="{'user-profile__banner--empty': !dataProfile.media?.banner}" :src="dataProfile.media?.banner || defaultBanner" />
            <div class="user-profile__wrap">
                <div class="user-profile__avatar avatar">
                    <div class="avatar__wrap">
                        <div class="avatar__photo"><img class="avatar__img" v-if="dataProfile.media?.avatar" :src="dataProfile.media?.avatar" />
                            <div class="avatar__text" v-else v-text="dataProfile.name?.charAt(0)"></div>
                        </div>
                    </div>
                </div>
                <div class="user-profile__description description__subscribers--label">
                    <div class="description__line">
                        <div class="description__actions"><button class="description__mute" v-if="showMute" @click="fetchMuteNotice" :class="{'description__mute--active' : info.is_muted }"><svg class="description__mute-icon" v-svg size="24" symbol="unnotifications"></svg></button><button class="button description__btn" v-if="!isPersonalPage && dataProfile.active_channel && info !== null && (info.has_subscribe || info.has_unsubscribe)" @click="fetchSubscribers()" :class="{'button_type_info' : info.has_unsubscribe, 'button_type_success' : info.has_subscribe}" v-text="$t(info.has_unsubscribe ? 'button.unsubscribe' : 'button.subscribe')"></button></div>
                        <div class="description__descr">
                            <p class="description__name" v-if="dataProfile.name">{{dataProfile.name}}<span class="description__online" v-if="online"></span></p>
                            <div class="description__verified" v-if="dataProfile.is_verified"><svg class="description__verified-icon text-primary" v-svg size="24" symbol="verified"></svg></div>
                            <div class="ml-2 mt-3.5 flex-shrink-0 bg-gradient-to-l from-indigo-300 to-indigo-400 rounded-full flex" v-if="isTelegram"><svg class="w-5 h-5 text-white" v-svg symbol="telegram-user"></svg></div>
                        </div>
                        <router-link v-if="isPersonalPage && dataProfile.active_channel && dataProfile.active_channel && info !== null && info.subscribers && info.unsubscribers !== null && (isPersonalPage || info.has_subscribe || info.has_unsubscribe)" v-slot="{href, navigate}" :to="`/user/${$route.params.name}/subscribers`"><a class="description__subscribers" :href="href" @click="navigate">{{info.subscribers}}<span class="description__subscribers--label">{{ $t('channel.subscriber', info.subscribers, {count: info.subscribers}) }}</span></a></router-link>
                        <p class="description__subscribers" v-if="!isPersonalPage && dataProfile.active_channel && info !== null && info.subscribers && info.unsubscribers !== null && (isPersonalPage || info.has_subscribe || info.has_unsubscribe)">{{info.subscribers}}<span class="description__subscribers--label"> {{ $t('channel.subscriber', info.subscribers, {count: info.subscribers}) }}</span></p>
                    </div>
                    <div class="description__about" v-if="dataProfile.about_me"> {{ $t('user.aboutMe') }}</div>
                    <div class="description__about-text" v-if="dataProfile.about_me" v-text="dataProfile.about_me"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { createNamespacedHelpers } from 'vuex'
import banner from 'src/assets/img/baner-area.svg'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')

export default {
  props: {
    isPersonalPage: {
      type: Boolean,
      default: false,
    },
    dataProfile: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      defaultBanner: banner,
      info: null,
    }
  },
  computed: {
    ...mapEchoState(['onlineUsers']),
    ...mapUserState(['channelInfo', 'auth', 'id', 'role', 'telegram', 'name']),
    online() {
      return this.channelInfo !== null && this.name !== this.dataProfile.name ? this.onlineUsers.includes(this.channelInfo.id) : false
    },
    isTelegram() {
      if (this.id === this.dataProfile.id || this.role === 'admin') {
        return this.id === this.dataProfile.id ? this.telegram !== null : this.dataProfile.telegram !== null
      }
      return false
    },
    showMute() {
      return this.auth && (this.info !== null && this.dataProfile.active_channel && this.info.has_unsubscribe && (this.dataProfile.role !== 'admin' && this.dataProfile.active_channel))
    },
  },
  watch: {
    channelInfo() {
      this.info = this.channelInfo
    },
  },

  created() {
    this.info = this.channelInfo
  },
  methods: {
    ...mapUserMutations(['setChannelInfo']),
    async fetchMuteNotice() {
      const method = this.info.is_muted ? 'DELETE' : 'POST'
      try {
        const { status, data } = await this.$instance({
          method,
          url: `/userfeed/channel/${this.info.id}/mute`,
          data: {
            channel_id: this.info.id,
          },
        })
        if (status) {
          this.setChannelInfo({
            ...this.channelInfo,
            is_muted: !this.info.is_muted,
          })
        } else {
          this.$error.show('/userfeed/channel')
        }
      } catch {
        this.$error.show()
      }
    },
    async fetchSubscribers() {
      if (!this.auth) {
        this.$router.push('/')
        return false
      }
      const method = this.info.has_unsubscribe ? 'DELETE' : 'POST'
      try {
        const { status, data } = await this.$instance({
          method,
          url: `/userfeed/channel/${this.info.id}/subscribe`,
          data: {
            channel_id: this.info.id,
          },
        })
        if (status) {
          this.setChannelInfo({
            ...this.channelInfo,
            has_subscribe: !this.info.has_subscribe,
            has_unsubscribe: !this.info.has_unsubscribe,
            subscribers: data.meta.subscribers_count,
          })
        } else {
          this.$error.show('/userfeed/channel')
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.user-profile {
  background-color: var(--c-bg);
  max-width: 1240px;
  margin: auto;
  width: 100%;

  &__inner {
    position: relative;
    z-index: 0;
  }

  &__banner {
    overflow: hidden;
    object-fit: cover;
    width: 100%;
    height: 52px;
    position: absolute;
    top: 0;
    z-index: -1;
    @media (min-width: 1200px) {
      height: 180px;
      border-radius: var(--bdrs-default);
    }
  }

  &__wrap {
    padding: 30px 20px 0;

    z-index: 1;
    @media (min-width: 1200px) {
      padding: 100px 40px 0;
      display: flex;
    }
  }

  &__avatar {
    @media (min-width: 1200px) {
      margin-right: 10px;
    }
  }

  .avatar {
    &__photo {
      display: flex;
    }

    &__photo {
      background: #ebdcf7;
      border-radius: var(--bdrs-default);
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      width: 78px;
      height: 78px;
      border: 4px solid var(--c-white);

      @media (min-width: 1200px) {
        width: 140px;
        height: 140px;
      }
    }

    &__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__text {
      font-weight: var(--fw-500);
      color: var(--c-primary);
      font-size: 48px;
      text-transform: uppercase;

      @media (min-width: 1200px) {
        font-size: 64px;
      }
    }

    &__btn {
      min-width: 156px;
      display: block;
    }

    &__actions .file {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__description {
    width: 100%;
  }

  .description {
    &__line {
      background: var(--c-white);
      border-radius: 0 8px 8px 0;
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      justify-content: flex-start;
      width: 100%;

      @media (min-width: 1200px) {
        padding: 0 0 0 10px;
        margin-top: 26px;
        max-width: max-content;
        min-width: 728px;
        flex-direction: row;
      }
    }

    &__actions {
      align-self: flex-end;
      position: absolute;
      transform: translateY(-50px);
      margin-bottom: 0;
      display: flex;
      align-items: flex-start;

      @media (min-width: 1200px) {
        align-self: normal;
        order: 2;
        position: static;
        transform: translateY(0);
        margin-bottom: 0;
      }
    }
    &__btn {
      min-width: 156px;
      display: block;
      margin-left: 8px;
    }

    &__mute {
      padding: 11px 14px;
      line-height: 1;
      border-radius: var(--bdrs-default);
      background-color: var(--c-gray-10);

      &-icon {
        width: 24px;
        height: 24px;
        fill: var(--c-gray-20);
        transition: 0.3s;
      }

      &--active,
      &:hover {
        cursor: pointer;

        .description__mute-icon {
          fill: var(--c-primary);
        }
      }
    }

    &__name {
      color: var(--c-gray-80);
      font-weight: var(--fw-600);
      font-size: 26px;
      line-height: 31px;
      word-break: break-all;
      margin-top: 7px;
    }

    &__verified {
      margin-left: 10px;
      margin-top: 12px;
      fill: var(--c-primary);
    }

    &__descr {
      flex-grow: 1;
      display: flex;
      align-items: flex-start;
      min-height: 46px; /* remove after subscribers */
    }

    &__about {
      font-size: 14px;
      line-height: 17px;
      color: var(--c-gray-70);
      padding-left: 10px;
      margin-top: 10px;

      @media (min-width: 1200px) {
        margin-top: 20px;
      }

      &-text {
        font-size: 14px;
        line-height: 17px;
        color: var(--c-gray-80);
        margin-bottom: 4px;
        padding-left: 10px;
        margin-top: 4px;
        max-width: 600px;
        word-break: break-word;
      }
    }

    &__online {
      width: 6px;
      height: 6px;
      background: #3abf8f;
      border-radius: 10px;
      margin-left: 2px;
      display: inline-block;
      margin-bottom: 12px;
    }

    &__subscribers {
      color: var(--c-gray-80);
      font-weight: var(--fw-600);
      font-size: 18px;
      line-height: 22px;
      margin-right: 40px;
      margin-top: 8px;
      text-decoration: none;
      white-space: nowrap;
			display: inline-flex;

      @media (min-width: 1200px) {
        margin-left: 12px;
        margin-top: 12px;
      }

      &--label {
        margin-left: 10px;
        color: var(--c-gray-20);
      }

      /*
      &--label:hover,
      &:hover {
        color: var(--c-primary);
      }*/
    }
  }
}
</style>
