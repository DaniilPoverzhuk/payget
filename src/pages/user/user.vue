<template>
  <section class="content">
    <UserProfile
      v-if="isInitedDataProfile !== null && pageType !== pageTypes.SUBSCRIBERS"
      :isPersonalPage="isPersonalPage"
      :dataProfile="dataProfile"
    ></UserProfile>
    <header
      class="content__header"
      v-if="pageType !== pageTypes.SUBSCRIBERS && isInitedDataProfile !== null"
    >
      <div class="user-panel" v-if="!isAdminShowAdmin">
        <div class="user-panel__controls" v-if="isAdmin">
          <button class="user-panel__button" @click.prevent="showBlockDialog">
            <svg
              class="w-5 h-5 text-primary"
              v-svg
              :symbol="
                dataProfile && dataProfile.banned_at
                  ? 'lock-closed'
                  : 'lock-open'
              "
            ></svg>
          </button>
          <button class="user-panel__button" @click="createChat">
            <svg class="user-panel__icon" v-svg size="24" symbol="letter"></svg>
          </button>
          <TogglerIcon
            class="user-panel__button text-primary"
            v-if="!isUserModerator"
            v-model="isVerified"
            svgSymbol="verified"
            size="24"
          ></TogglerIcon>
          <div
            class="flex-shrink-0 bg-gradient-to-l from-indigo-300 to-indigo-400 rounded-full"
            v-if="isAdmin && isTelegram"
          >
            <svg class="w-5 h-5 text-white" v-svg symbol="telegram-user"></svg>
          </div>
        </div>
        <div
          class="user-panel__controls user-panel__controls--order"
          v-if="isAdmin && !isPersonalPage"
        >
          <Toggler
            class="user-panel__exchanger-toggler"
            v-if="!isUserModerator"
            v-model="isСhannel"
            :label="'channel.title'"
          ></Toggler>
          <Toggler
            class="user-panel__exchanger-toggler"
            v-if="!isUserModerator"
            v-model="isExchanger"
            :label="'exchanger'"
          ></Toggler>
          <Toggler
            class="user-panel__exchanger-toggler"
            v-if="!isUserModerator"
            v-model="isApi"
            :label="'api'"
          ></Toggler>
          <Toggler
            class="user-panel__exchanger-toggler"
            v-if="permissions.includes('withdraws.access')"
            v-model="isAutomaticWithdrawal"
            :label="'channel.automaticWithdraw'"
          ></Toggler>
        </div>
        <div
          class="user-panel__controls"
          v-if="isAdminOrModerator && isUserMember && dataProfile"
        >
          <UserDeposit
            class="user-panel__deposit"
            :user="dataProfile"
          ></UserDeposit>
          <router-link v-slot="{ href, navigate }" :to="`/history/${userName}`">
            <a
              class="user-panel__history-link"
              :href="href"
              @click="navigate"
              >{{ $t('user.history') }}</a
            >
          </router-link>
        </div>
      </div>
      <ul class="seller-tab-list">
        <li class="seller-tab-list__item" v-if="showTabExchanger">
          <router-link
            v-slot="{ href, navigate, isExactActive }"
            :to="`/user/${userName}`"
            ><a
              class="seller-tab-list__link"
              :class="[isExactActive && 'seller-tab-list__link_active']"
              :href="href"
              @click="navigate"
              >{{ $t('user.offers') }}</a
            ></router-link
          >
        </li>
        <li class="seller-tab-list__item" v-if="showTabExchanger">
          <router-link
            v-slot="{ href, navigate, isActive }"
            :to="`/user/${userName}/reviews`"
            ><a
              class="seller-tab-list__link"
              :class="[isActive && 'seller-tab-list__link_active']"
              :href="href"
              @click="navigate"
              >{{ $t('user.reviews') }}</a
            ></router-link
          >
        </li>
        <li
          class="seller-tab-list__item"
          v-if="isAdminOrModerator && adminChanel"
        >
          <router-link
            v-slot="{ href, navigate, isActive }"
            :to="`/user/${userName}/logs`"
            ><a
              class="seller-tab-list__link"
              :class="[isActive && 'seller-tab-list__link_active']"
              :href="href"
              @click="navigate"
              >{{ $t('user.logs') }}</a
            ></router-link
          >
        </li>
        <li
          class="seller-tab-list__item"
          v-if="isAdminOrModerator && isUserMember"
        >
          <router-link
            v-slot="{ href, navigate, isActive }"
            :to="`/user/${userName}/deposit-history`"
            ><a
              class="seller-tab-list__link"
              :class="[isActive && 'seller-tab-list__link_active']"
              :href="href"
              @click="navigate"
              >{{ $t('user.depositHistory') }}</a
            ></router-link
          >
        </li>
        <li class="seller-tab-list__item" v-if="isShowEditPrifile">
          <router-link
            v-slot="{ href, navigate, isActive }"
            :to="`/user/${userName}/profile-editing`"
            ><a
              class="seller-tab-list__link"
              :class="[isActive && 'seller-tab-list__link_active']"
              :href="href"
              @click="navigate"
              >{{ $t('user.editingProfile') }}</a
            ></router-link
          >
        </li>
        <li class="seller-tab-list__item" v-if="isChanelShow">
          <router-link
            v-slot="{ href, navigate, isActive }"
            :to="`/user/${userName}/channel`"
            ><a
              class="seller-tab-list__link"
              :class="[isActive && 'seller-tab-list__link_active']"
              :href="href"
              @click="navigate"
              >{{ $t('channel.title') }}</a
            ></router-link
          >
        </li>
        <li class="seller-tab-list__item" v-if="isPersonalPage">
          <router-link
            v-slot="{ href, navigate, isActive }"
            :to="`/user/${userName}/subscriptions`"
            ><a
              class="seller-tab-list__link"
              :class="[isActive && 'seller-tab-list__link_active']"
              :href="href"
              @click="navigate"
            >
              {{ $t('user.subscriptions') }}</a
            ></router-link
          >
        </li>
        <li class="seller-tab-list__item">
          <router-link
            v-slot="{ href, navigate, isActive }"
            :to="`/user/${userName}/comments`"
            ><a
              class="seller-tab-list__link"
              :class="[
                (isActive || isComment) && 'seller-tab-list__link_active',
              ]"
              :href="href"
              @click="navigate"
            >
              {{ $t('user.comments') }}</a
            ></router-link
          >
        </li>
      </ul>
    </header>
    <div
      v-if="isInited"
      class="content__inner"
      :class="{
        'is-exchange': showTabExchanger && pageType === pageTypes.DEFAULT,
      }"
    >
      <aside
        class="content__aside content__aside_sticky"
        v-if="isFormVisible && showTabExchanger"
      >
        <h3>Заявка на обмен</h3>
        <Currency
          class="lg:max-w-384 w-full mt-4"
          ref="requestForm"
          :user="dataProfile?.id"
          @getOffersEvent="showOffers"
          @setSum="setSum"
          @getAllCurrencies="getAllCurrencies"
        ></Currency>
      </aside>
      <div
        class="content__main"
        v-if="$matchMedia.desktop || !formView"
        :key="pageType"
      >
        <span v-if="pageType === pageTypes.DEFAULT && showTabExchanger">
          <span v-if="offers === null && previewOffers !== null">
            <h3 class="flex" v-if="$matchMedia.desktop && !isPersonalPage">
              {{ $t('user.sellerOffers') }}
              <Toggler
                class="ml-3"
                v-if="isAdminOrModerator"
                v-model="isActiveAds"
                @update:modelValue="onHideAll"
              />
            </h3>
            <template v-if="previewOffers.length">
              <UserOffers v-model:offers="previewOffers"></UserOffers>
              <div class="content__note" v-if="!previewOffers.length">
                {{ $t('user.backLater') }}
              </div>
              <Pagination
                v-if="previewOffers.length"
                class="mt-8 mb-8"
                ref="pagination"
                :short="true"
                :count="totalAds"
                :per-page="10"
                @getData="getData"
              />
            </template>
          </span>
          <span v-else-if="offers !== null">
            <Offers
              v-if="offers.length"
              :offers="offers"
              :requestData="requestData"
              :nonames="true"
              @setOffer="setOffer"
            ></Offers>
            <div class="content__note" v-else>{{ $t('user.noOffers') }}</div>
          </span>
        </span>
        <Reviews
          v-if="pageType === pageTypes.REVIEWS && showTabExchanger"
        ></Reviews>
        <Logs v-if="pageType === pageTypes.LOGS && adminChanel"></Logs>
        <DepositHistory
          v-if="pageType === pageTypes.DEPOSIT_HISTORY"
        ></DepositHistory>
        <ProfileEditing
          v-if="pageType === pageTypes.PROFILE_EDITING && dataProfile"
          v-model:user="dataProfile"
        ></ProfileEditing>
        <ProfileChannel
          v-if="
            pageType === pageTypes.CHANNEL &&
            isChanelShow &&
            channelInfo !== null
          "
          :isPersonalPage="isPersonalPage"
          :isAdminOrModerator="isAdminOrModerator"
        ></ProfileChannel>
        <Subscriptions
          v-if="
            pageType === pageTypes.SUBSCRIBERS &&
            isPersonalPage &&
            dataProfile !== null &&
            dataProfile.active_channel
          "
        ></Subscriptions>
        <Subscribers
          v-if="pageType === pageTypes.SUBSCRIPTIONS && isPersonalPage"
        ></Subscribers>
        <UserTabComments
          v-if="pageType === pageTypes.COMMENTS && dataProfile"
          :user="dataProfile"
        />
      </div>
    </div>
    <UserBlockDialog
      v-if="dataProfile"
      v-model="isBlockDialogVisible"
      :user="dataProfile"
      @cancel="
        () => {
          isBlockDialogVisible = false
        }
      "
      @success="toggleUserBlock"
    ></UserBlockDialog>
  </section>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import FixedButton from 'src/components/fixed-button/fixed-button.vue'
import Toggler from 'src/components/toggler/toggler.vue'
import Logs from 'src/components/helper/page-logs/logs-table/logs-table.vue'
import DepositHistory from 'src/components/helper/page-deposit/deposit-history/deposit-history.vue'
import { USER_ROLE } from 'src/constants'
import Button from 'src/components/extends/button/button.vue'
// import authorizedAxios from 'src/axios'
// import ApiService from 'src/api/api.service'
// import RequestForm from '../../components/helper/page-exchange/request-form/request-form.vue'
import Offers from '../../components/helper/page-exchange/offers/offers.vue'
import UserOffers from './user-offers/user-offers.vue'
import Reviews from './reviews/reviews.vue'
import UserDeposit from './user-deposit/user-deposit.vue'
import UserTabComments from './user-comments/user-tab-comments.vue'
import UserBlockDialog from './user-block-dialog/user-block-dialog.vue'
import ProfileEditing from './profile-editing/profile-editing.vue'
import UserProfile from './profiles/user-profile.vue'
import ProfileChannel from './profile-channel/profile-channel.vue'
import Subscriptions from './user-subscriptions/user-subscriptions.vue'
import Subscribers from './user-subscribers/user-subscribers.vue'
import TogglerIcon from 'src/components/toggler-icon/toggler-icon.vue'
import Currency from 'src/components/helper/page-exchange/currency/currency.vue'
import Pagination from 'src/components/extends/pagination/pagination.vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'
import { nextTick, ref } from 'vue'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
  mapActions: mapUserActions,
} = createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')
const { ADMIN, MODERATOR, MEMBER } = USER_ROLE
const FORM_VIEW_HASH = '#form'

export default {
  name: 'User',
  components: {
    // RequestForm,
    Offers,
    Currency,
    UserOffers,
    Reviews,
    ProfileChannel,
    Subscriptions,
    ProfileEditing,
    Subscribers,
    Logs,
    DepositHistory,
    Toggler,
    TogglerIcon,
    UserDeposit,
    UserBlockDialog,
    UserProfile,
    UserTabComments,
    Pagination,
  },
  setup() {
    const $route = useRoute()
    useMeta({
      meta: {
        ogTitle: { property: 'og:title', content: 'TWIX' },
        ogUrl: { property: 'og:url', content: `https://twix.im${$route.path}` },
        ogSiteName: { property: 'og:site_name', content: 'twix.im' },
        ogType: { property: 'og:type', content: 'website' },
      },
    })
    const isInited = ref(false)
    nextTick(() => {
      isInited.value = true
    })
    return {
      isInited,
    }
  },
  data() {
    return {
      isCreated: false,
      user: null,
      previewOffers: null,
      dataProfile: null,
      meta: null,
      activeExchange: null,
      openOffer: false,
      // infoChannel: null,
      offers: null,
      type: 'sale',
      requestData: null,
      pageTypes: {
        DEFAULT: 'default',
        REVIEWS: 'reviews',
        CHANNEL: 'channel',
        SUBSCRIPTIONS: 'subscriptions',
        SUBSCRIBERS: 'subscribers',
        LOGS: 'logs',
        DEPOSIT_HISTORY: 'deposit-history',
        PROFILE_EDITING: 'profile-editing',
        COMMENTS: 'comments',
      },
      isBlockDialogVisible: false,
      isActiveAds: true,
      offset: 0,
      limit: 10,
      totalAds: 0,
    }
  },
  computed: {
    ...mapUserState([
      'channelInfo',
      'permissions',
      'role',
      'id',
      'name',
      'avatar',
      'is_verified',
      'banner',
      'about_me',
      'viewUserId',
      'active_exchange',
      'telegram',
    ]),
    ...mapEchoState(['onlineUsers']),
    isTelegram() {
      if (this.id === this.dataProfile?.id || this.role === 'admin') {
        return this.id === this.dataProfile?.id
          ? this.telegram !== null
          : this.dataProfile?.telegram !== null
      }
      return false
    },
    isComment() {
      return this.$route.params.subpage === 'comments'
    },
    isChanelShow() {
      return this.meta !== null && this.meta.is_channel
    },
    adminChanel() {
      return !(
        this.channelInfo !== null &&
        this.channelInfo.has_subscribe === false &&
        this.channelInfo.has_unsubscribe == false
      )
    },
    isAdminShowAdmin() {
      return (
        !this.isPersonalPage &&
        this.isAdmin &&
        this.dataProfile !== null &&
        this.dataProfile?.role === 'admin'
      )
    },
    isShowEditPrifile() {
      return (
        this.isAdmin &&
        this.dataProfile !== null &&
        this.id !== this.dataProfile?.id &&
        this.dataProfile?.role !== 'admin'
      )
    },
    formView: {
      get() {
        return this.$route.hash === FORM_VIEW_HASH
      },
      set(value) {
        if (value) {
          this.$router.push(`${this.$route.path}${FORM_VIEW_HASH}`)
        } else {
          this.$router.push(this.$route.path)
        }
      },
    },
    isVerified: {
      get() {
        return this.dataProfile !== null && this.dataProfile?.is_verified
      },
      async set() {
        try {
          const { status } = await this.$instance({
            method: this.dataProfile?.is_verified ? 'DELETE' : 'POST',
            url: `userfeed/user/${this.dataProfile?.id}/${
              this.dataProfile?.is_verified ? 'unverify' : 'verify'
            }`,
            data: {
              user_id: this.dataProfile?.id,
            },
          })
          if (status) {
            this.dataProfile.is_verified = !this.dataProfile?.is_verified
            if (this.dataProfile?.active_channel) {
              this.setChannelInfo({
                ...this.channelInfo,
                is_verified: this.dataProfile?.is_verified,
              })
            }
          } else {
            this.$error.show('userfeed/user')
          }
        } catch {
          this.$error.show()
        }
      },
    },
    isСhannel: {
      get() {
        return this.dataProfile !== null && this.dataProfile?.active_channel
      },
      async set(value) {
        try {
          const status = await this.$instance.patch(
            `/userfeed/channel/${this.dataProfile?.id}`,
            {
              user_id: this.dataProfile?.id,
              is_activate: value,
            }
          )
          if (status) {
            this.dataProfile.active_channel = !this.dataProfile?.active_channel
            this.meta.is_channel = this.dataProfile?.active_channel
            if (this.meta.is_channel) {
              await this.getChannelInfo(this.dataProfile?.id)
            }
          }
        } catch (e) {
          this.$error.show(e)
        }
      },
    },
    isApi: {
      get() {
        return this.dataProfile !== null ? !!this.dataProfile?.api : false
      },
      async set(value) {
        this.dataProfile.api = value

        try {
          const { status, message } = await this.$instance.post(
            'user/api/visible',
            {
              user_id: this.viewUserId,
              activate: value,
            }
          )

          if (!status) {
            this.error = message
            this.dataProfile.api = !value
          }
        } catch {
          this.dataProfile.api = !value
          this.$error.show()
        }
      },
    },
    isExchanger: {
      get() {
        return this.dataProfile !== null
          ? this.dataProfile?.active_exchange
          : false
      },
      async set(value) {
        this.dataProfile.active_exchange = value

        try {
          const { status, message } = await this.$instance.post(
            'user/exchange/visible',
            {
              user_id: this.viewUserId,
              activate: value,
            }
          )

          if (!status) {
            this.error = message
            this.dataProfile.active_exchange = !value
          }
        } catch {
          this.dataProfile.active_exchange = !value
          this.$error.show()
        }
      },
    },
    isAutomaticWithdrawal: {
      get() {
        return this.dataProfile !== null
          ? this.dataProfile?.automatic_withdraw
          : false
      },
      async set(value) {
        this.dataProfile.automatic_withdraw = value
        try {
          await this.update({
            automatic_withdraw: value,
            user_id: this.dataProfile?.id,
            login: this.dataProfile?.login,
            name: this.dataProfile?.name,
          })
        } catch {
          this.dataProfile.automatic_withdraw = !value
          this.$error.show()
        }
      },
    },
    showTabExchanger() {
      return (
        (this.dataProfile !== null &&
          this.isExchanger &&
          !this.isUserAdmin &&
          !this.isUserModerator) ||
        (this.isUserAdmin && !this.dataProfile?.is_active_channel) ||
        (this.isAdmin && !this.isExchanger)
      )
    },
    userName() {
      return this.$route.params.name
    },
    isPersonalPage() {
      return this.name === this.userName
    },
    isFormVisible() {
      const { DEFAULT } = this.pageTypes
      if (
        this.isPersonalPage ||
        this.pageType !== DEFAULT ||
        (!this.isAdmin &&
          this.dataProfile !== null &&
          this.dataProfile?.role === 'admin')
      ) {
        return false
      }
      return (
        !this.isAdminOrModerator && (this.$matchMedia.desktop || this.formView)
      )
    },
    pageType() {
      const { path } = this.$route
      const pageTypesValues = Object.values(this.pageTypes)
      let pageType = ''
      switch (true) {
        case this.showTabExchanger || this.isAdminOrModerator:
          pageType = this.pageTypes.DEFAULT
          break
        case this.isChanelShow:
          pageType = this.pageTypes.CHANNEL
          break
        case this.isPersonalPage:
          pageType = 'subscriptions'
          break
        default:
          pageType = ''
      }

      pageTypesValues.some((type) => {
        const childChannel = path.match(/channel/)
        if (childChannel && childChannel.length > 0) {
          type = 'channel'
        }
        const childComments = path.match(/comments/)
        if (childComments && childComments.length > 0) {
          type = 'comments'
        }
        if (!path.endsWith(`/${type}`) && !childChannel && !childComments) {
          return false
        }
        pageType = type
        return true
      })

      return pageType || this.pageTypes.DEFAULT
    },
    isAdminOrModerator() {
      return this.role === ADMIN || this.role === MODERATOR
    },
    isMember() {
      return this.role === MEMBER
    },
    isAdmin() {
      return this.role === ADMIN
    },
    isUserOnline() {
      return this.onlineUsers.includes(this.viewUserId)
    },
    isFixedButtonVisible() {
      return (
        this.$matchMedia.mobile &&
        !this.isAdminOrModerator &&
        !this.formView &&
        this.previewOffers &&
        this.previewOffers.length &&
        !this.isPersonalPage
      )
    },
    isUserMember() {
      return this.dataProfile !== null && this.dataProfile?.role === MEMBER
    },
    isUserModerator() {
      return this.dataProfile !== null && this.dataProfile?.role === MODERATOR
    },
    isUserAdmin() {
      return this.dataProfile !== null && this.dataProfile?.role === ADMIN
    },
    isInitedDataProfile() {
      return this.$store.state.user.dataProfile
    },
  },

  watch: {
    $route() {
      if (this.$route.params.name !== this.dataProfile?.name) {
        this.resetData()
        this.fetchProfile()
      }
    },
  },
  async serverPrefetch() {
    if (!this.isInitedDataProfile) {
      await this.fetchProfile()
    }
  },
  async created() {
    await this.fetchProfile()
  },
  beforeUnmount() {
    this.init({
      viewUserId: null,
    })
  },

  methods: {
    ...mapUserMutations(['init', 'setChannelInfo', 'setDataProfile']),
    ...mapUserActions(['update']),
    setOpenOffer(bool) {
      this.openOffer = bool
    },
    resetData() {
      this.previewOffers = null
      this.dataProfile = null
      this.offers = null
    },
    delay(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    },
    getAllCurrencies(allCurrencies) {
      this.allCurrencies = allCurrencies
    },
    setSum(data, type) {
      this.type = type
      this.sum = data * 1
    },
    async onHideAll(val) {
      const req = {
        is_active: val,
        user_id: this.isAdminOrModerator ? this.dataProfile?.id : undefined,
      }
      try {
        const {
          data: { data, status, message },
        } = await this.$instance.post('user/offer/hideAll', req)
        if (status) {
          if (this.previewOffers !== null) {
            this.previewOffers.forEach((x) => {
              x.is_active = val
            })
          } else {
            this.offers.forEach((x) => {
              x.is_active = val
            })
          }
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        console.log('user/offer/hide', e)
        this.$error.show(e.message)
      }
    },
    async fetchProfile() {
      const {
        data: { data, status, message, meta },
      } = await this.$instance({
        url: 'user/get/data/public',
        data: {
          name: this.$route.params.name,
        },
      })
      if (status) {
        this.dataProfile = data
        this.meta = meta
        if (this.meta.is_channel) {
          await this.getChannelInfo(this.dataProfile?.id)
        }
        this.init({
          viewUserId: this.dataProfile?.id,
        })

        if (this.isUserMember) {
          await this.getAllSellerOffers()
        }
        if (this.isUserModerator && this.dataProfile?.name) {
          this.$router.replace(`/user/${this.dataProfile?.name}/logs`)
        }

        const userHasChannel =
          this.dataProfile?.role == 'admin'
            ? !!this.dataProfile?.active_channel
            : true
        if (!this.isPersonalPage && !userHasChannel) {
          this.$router.replace('/')
        }
        if (!this.showTabExchanger) {
          const childChannel = this.$route.path.match(this.pageType)
          if (childChannel == null && this.userName) {
            this.$router.push(`/user/${this.userName}/${this.pageType}`)
          }
        }
      } else {
        this.$error.show(message)
      }
      this.setDataProfile(true)
    },

    async getChannelInfo(id) {
      try {
        const { data, status } = await this.$instance.get(
          `userfeed/channel/${id}`,
          {
            channel_id: id,
          }
        )
        if (status) {
          this.setChannelInfo(data.data)
        }
      } catch {
        this.$error.show()
      }
    },
    async getData(value) {
      this.offset = value * this.limit - this.limit
      await this.getAllSellerOffers(this.requestData)
    },
    async getAllSellerOffers() {
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'offer/list',
          data: {
            user_id: this.viewUserId,
            user_name_page: true,
            limit: this.limit,
            start: this.offset,
          },
        })

        if (status) {
          const ads = Array.isArray(data.list)
            ? data.list
            : Object.values(data.list)
          this.previewOffers = ads
          this.totalAds = data.quantity
          this.isActiveAds = !!data.has_active
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show(e)
      }
    },
    showOffers(data, requestData) {
      const { REVIEWS } = this.pageTypes

      if (this.pageType === REVIEWS) {
        this.$router.push(`/user/${this.userName}`)
      }
      this.offers = data
      this.requestData = requestData

      if (!this.formView) return
      this.formView = false
    },
    showBlockDialog() {
      this.isBlockDialogVisible = true
    },
    setOffer(data) {
      if (data.length === 0) {
        this.$error.show()
      } else {
        this.openOffer = true
        this.activeExchange = data
      }
    },
    async createChat() {
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'chat/create',
          data: {
            first_user_id: this.id,
            second_user_id: this.viewUserId,
          },
        })

        if (status) {
          this.$router.push(`/messages/${data.chat_id}`)
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    toggleUserBlock(data) {
      this.dataProfile.banned_at = data.banned_at
      this.isBlockDialogVisible = false
    },
  },
}
</script>

<style lang="scss">
.seller-tab-list {
  margin: 20px -20px 0;
  width: 100%;
  overflow-x: auto;
  display: flex;
  font-size: var(--fz-h2);
  line-height: var(--lh-sm);
  font-weight: 700;
  padding: 0 0 15px 20px;

  @media (min-width: 1200px) {
    padding-bottom: 0;
    width: calc(100% + 40px);
  }
}

.seller-tab-list__item {
  white-space: nowrap;
  padding-right: 20px;

  &:nth-last-child(n + 2) {
    margin-right: 12px;
  }
}

.seller-tab-list__link {
  text-decoration: none;
  color: var(--c-gray-80);

  &:hover,
  &:focus,
  &_active {
    color: var(--c-primary);
  }

  &_active {
    cursor: default;
  }
}

.seller-online {
  &::after {
    width: 6px;
    height: 6px;
    display: inline-block;
    vertical-align: top;
    border-radius: var(--bdrs-round);
    margin-left: 2px;
    background-color: var(--c-success);
    content: '';
  }
}

.user-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  &__controls {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 23px;
    flex-wrap: wrap;

    @media (min-width: 1200px) {
      flex-wrap: nowrap;
      width: auto;
      margin-bottom: 0;
    }

    &--order {
      order: 1;
      margin-bottom: 0;

      @media (min-width: 1200px) {
        order: 0;
      }

      .toggler {
        margin-right: 22px;

        @media (min-width: 1200px) {
          margin-right: 0;
        }
      }
    }
  }

  &__button {
    display: block;
    color: var(--c-primary);
    cursor: pointer;
    /*transition-property: color;*/
    /*transition-duration: var(--t);*/
    margin-right: 22px;

    @media (min-width: 1200px) {
      margin-right: 16px;
    }

    &:last-child {
      margin: 0;
    }

    &:hover,
    &:focus {
      color: var(--c-primary-dark);
    }
  }

  &__icon {
    fill: currentColor;
    display: block;
  }

  &__exchanger-toggler {
    @media (min-width: 1200px) {
      margin-left: 48px;
    }
  }

  &__deposit {
    @media (min-width: 1200px) {
      margin-left: 48px;
    }
  }

  &__history-link {
    text-decoration: none;
    color: var(--c-primary);
    transition-property: color;
    margin-left: 22px;

    @media (min-width: 1200px) {
      margin-left: 40px;
    }

    &:hover,
    &:focus {
      color: var(--c-primary-dark);
    }

    @media (min-width: 1200px) {
      margin-left: 48px;
    }
  }
}
.content {
  .content__inner {
    &.is-exchange {
      .content__aside {
        width: auto;
        flex-shrink: 0;
      }
      @media (max-width: 1199px) {
        flex-direction: column;
        .content__aside {
          width: 100%;
        }
      }
    }
  }
}
</style>
