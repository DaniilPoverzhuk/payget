<template>
  <section class="profile-settings">
    <h1 class="profile-settings__heading">{{ $t('user.profileSettings') }}</h1>
    <ul class="profile-settings__filter filter" v-if="$matchMedia.desktop">
      <li class="filter__item" v-for="(item, i) in tabs" :key="i">
        <input
          class="filter__radio"
          v-model="requestFilter"
          type="radio"
          name="tabs"
          :id="item.id"
          :value="item.id"
        /><label
          class="filter__label"
          :for="item.id"
          @click="setParamsPath(item.id)"
          >{{ $t(item.text) }}</label
        >
      </li>
    </ul>
    <div class="profile-settings__inner">
      <div class="profile-settings__actions">
        <div class="profile-settings__action">
          <component
            :is="$matchMedia.mobile ? 'Accordion' : 'Card'"
            v-for="tab in tabs"
            :key="tab.id"
            :dataTab="tab"
            :requestFilter="requestFilter"
          >
            <component :is="tab.component"></component>
          </component>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Profile from 'src/components/profiles/profile/profile.vue'
import Security from 'src/components/profiles/profile-security/profile-security.vue'
import Api from 'src/components/profiles/profile-api/profile-api.vue'
import Imports from 'src/components/profiles/profile-imports/profile-imports.vue'
import TelegramBot from 'src/components/profiles/profile-telegram/profile-telegram.vue'
import Paid from 'src/components/profiles/profile-paid/profile-paid.vue'
import TransitionSlide from 'src/components/transition-slide/transition-slide.vue'
import Accordion from './accordion/accordion.vue'
import Card from './card/card.vue'
// import authorizedAxios from '@/axios'

const {
  mapState: mapUserState,
  mapActions: mapUserActions,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')
export default {
  name: 'ProfileSettings',
  components: {
    Profile,
    Accordion,
    Security,
    Api,
    Paid,
    Card,
    TransitionSlide,
    TelegramBot,
    Imports,
  },
  data() {
    return {
      requestFilter: this.$route.query.tab ? this.$route.query.tab : 'profile',
      tabChannel: {
        id: 'paid',
        text: 'channel.priceSubscription',
        component: 'Paid',
      },
      tabApi: {
        id: 'api',
        text: 'api',
        component: 'Api',
      },
      tabImports: {
        id: 'imports',
        text: 'user.fileImport',
        component: 'Imports',
      },
      tabs: [
        {
          id: 'profile',
          text: 'user.profile',
          component: 'Profile',
        },
        {
          id: 'security',
          text: 'user.security',
          component: 'Security',
        },
        {
          id: 'telegram-bot',
          text: 'user.telegramChatbot',
          component: 'TelegramBot',
        },
      ],
    }
  },
  computed: {
    ...mapUserState(['name', 'api', 'allow_import']),
  },
  async mounted() {
    await this.fetchProfile()
    if (this.api) this.tabs.push(this.tabApi)
    if (this.allow_import) {
      this.tabs.push(this.tabImports)
    }
  },
  methods: {
    ...mapUserMutations(['setOfferFile']),
    async fetchProfile() {
      const {
        data: { data },
      } = await this.$instance({
        method: 'POST',
        url: 'user/get/data/public',
        data: {
          name: this.name,
        },
      })
      if (data) {
        if (data.is_active_channel) this.tabs.push(this.tabChannel)
        if (data.allow_import) {
          this.setOfferFile(data.offer_file)
        }
      }
    },

    setParamsPath(type) {
      if (type !== this.requestFilter) {
        this.requestFilter = type
        this.$router.push({ query: { tab: type } })
      }
    },
  },
}
</script>

<style lang="scss">
.profile-settings {
  padding: 30px 0;
  width: 100%;

  @media (min-width: 1200px) {
    padding: 30px 50px;
  }

  &__inner {
    max-width: 940px;
    margin: auto;
  }

  &__wrap {
    @media (min-width: 1200px) {
      display: flex;
    }
  }

  &__col {
    @media (min-width: 1200px) {
      width: 50%;
    }
  }

  &__filter {
    margin-bottom: 40px;
  }

  &__col:nth-child(even) {
    @media (min-width: 1200px) {
      border-left: 1px solid var(--c-gray-10);
    }
  }

  &__row {
    width: 100%;

    @media (min-width: 1200px) {
      max-width: 345px;
    }

    &--right {
      margin-left: auto;
    }
  }

  &__subtitle {
    color: var(--c-gray-80);
    font-weight: var(--fw-600);
    font-size: 20px;
    margin-bottom: 24px;

    @media (min-width: 1200px) {
      font-size: 22px;
    }
  }

  &__heading {
    margin-bottom: 40px;
    text-align: center;
  }

  &__hr {
    margin: 20px 0;
    height: 0;
    border-width: 0;
    background-color: var(--c-gray-10);

    @media (min-width: 1200px) {
      margin: 50px 0;
      height: 1px;
    }
  }

  .color-theme {
    &__wrap {
      display: flex;
      align-items: center;
    }

    &__btn {
      display: flex;
      align-items: center;
      cursor: pointer;

      &:not(:last-child) {
        margin-right: 30px;
      }

      &--selected {
        color: var(--c-gray-20);
      }
    }

    &__icon {
      margin-right: 10px;
      fill: currentColor;
    }
  }

  .filter {
    display: flex;
    flex-wrap: wrap;
    font-size: var(--fz-xl);
    font-weight: var(--fw-600);

    &__item {
      margin: 0 24px;
    }

    &__radio {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
      margin: -1px;
      clip: rect(0, 0, 0, 0);
    }

    &__radio:checked + .filter__label {
      color: var(--c-primary);
      cursor: default;
    }

    &__label {
      display: inline-block;
      cursor: pointer;

      @media (min-width: 1200px) {
        font-size: 22px;
      }

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
}
</style>
