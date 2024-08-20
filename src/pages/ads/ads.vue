<template>
  <div class="ads-page w-full lg:px-6 xs:px-4">
    <aside
      class="create-ads pt-6 border-gray-200 dark:border-gray-700 pr-9 flex-shrink-0 xs:w-auto"
    >
      <div class="create-ads-block">
        <LinkBack
          v-if="$matchMedia.mobile && formView"
          class=""
          :text="$t('ads.myAd')"
          @click="goToAds"
        />
        <h2
          class="create-title text-xl font-semibold text-gray-700 dark:text-gray-300"
        >
          <span class="title-text" :class="{ 'show-title': editedAd }">{{
            $t(editedAd ? 'ads.editingAd' : 'ads.createAnAd')
          }}</span>
          <Button
            v-if="!editedAd"
            @click="expanded = !expanded"
            viewColor="primary"
          >
            <span class="title-expand-btn">
              {{ $t('ads.createAnAd') }}
              <svg
                v-svg
                aria-hidden="true"
                size="18 17"
                symbol="select"
                class="h-5 w-5 text-gray-400"
              />
            </span>
          </Button>
        </h2>
        <TransitionSlide>
          <AdForm
            v-if="expanded"
            class="mt-6 bg-white transition duration-200 transition-height"
            :edited-ad="editedAd"
            @add="add"
            @edit="completeAdEditing"
            @error="showError"
          />
        </TransitionSlide>
        <Dialog
          v-if="$matchMedia.mobile"
          v-model="cancelAdEditingConfirmationDialog"
          :heading="$t('ads.leavePage')"
          :text="$t('ads.changesSaved')"
          :error="false"
          :is-icon="false"
          @hide="cancelAdEditingConfirmationDialog = false"
        >
          <div
            class="lg:mt-6 xs:mt-5 lg:grid lg:grid-cols-2 lg:gap-3 lg:grid-flow-col"
          >
            <Button
              class="font-medium xs:w-full lg:col-start-2 xs:mb-3"
              viewColor="primary"
              @click="cancelAdEditing"
              >{{ $t('ads.leave') }}</Button
            >
            <Button
              class="font-medium xs:w-full lg:col-start-1 lg:row-start-1"
              view-color="white"
              @click="cancelAdEditingConfirmationDialog = false"
            >
              {{ $t('button.cancel') }}
            </Button>
          </div>
        </Dialog>
      </div>
    </aside>
    <div class="my-ads-list py-6">
      <h1 class="flex gap-4">
        <span>{{ $t('ads.myAd') }}</span>
        <Toggler v-model="isActiveMyAds" @update:modelValue="onHideAll" />
      </h1>
      <div class="ads-rules mt-4 rounded-lg shadow-md p-5">
        <h3 class="ads-rules__title" @click="expandedRules = !expandedRules">
          {{ $t('offer.exchangeRules') }}
          <span class="arrow-icon" :class="{ active: expandedRules }">
            <svg
              v-svg
              aria-hidden="true"
              class="h-5 w-5 text-gray-700 dark:text-gray-300"
              symbol="chevron-down"
            />
          </span>
        </h3>
        <TransitionSlide>
          <div
            v-if="expandedRules"
            class="transition duration-200 transition-height h-0 overflow-hidden"
            :class="expandedRules && 'ad__rules'"
          >
            <EditorText
              v-if="isInited"
              class="ads__editor-text ads-editor mt-3"
              @getText="getText"
              :editMessage="ads_rules"
            ></EditorText>
            <Button
              @click="saveOfferRules"
              :disabled="isLoadingRules"
              viewColor="primary"
              class="ml-auto"
              >{{ $t('button.saveChanges') }}</Button
            >
          </div>
        </TransitionSlide>
      </div>
      <template v-if="ads">
        <ul v-if="ads.length" class="mt-7 xl:pb-0">
          <li
            v-for="ad in ads"
            :key="ad.id"
            class="nth-child:mt-6 dark:border dark:border-gray-800 rounded-lg"
          >
            <Ad
              :ad="ad"
              :edited-ad-id="editedAd ? editedAd.id : null"
              @startEditing="startAdEditing"
              @cancelEditing="cancelAdEditing"
              @remove="removeAd"
            />
          </li>
        </ul>
        <div v-else class="content__note">
          {{ $t('ads.noAd') }}
        </div>
      </template>
      <div v-else class="content__note">
        {{ $t('ads.createAdRequests') }}
      </div>
      <Pagination
        v-if="ads"
        class="mt-8 mb-8"
        ref="pagination"
        :short="true"
        :count="totalAds"
        :per-page="10"
        @getData="getData"
      />
      <!-- <FixedButton v-if="$matchMedia.mobile">
        <Button class="w-full" viewColor="primary" @click="formView = true">
          {{ $t('ads.createAd') }}
        </Button>
      </FixedButton> -->
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import FixedButton from 'src/components/fixed-button/fixed-button.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import Ad from 'src/components/helper/page-ads/ad/ad.vue'
import AdForm from 'src/components/helper/page-ads/ad-form/ad-form.vue'
import LinkBack from 'src/components/extends/link-back/link-back.vue'
import Button from 'src/components/extends/button/button.vue'
import TransitionSlide from 'src/components/transition-slide/transition-slide.vue'
import { useMeta, debounce } from 'quasar'
import { useRoute } from 'vue-router'
import EditorText from 'src/components/editor-channel/editor-text/editor-text.vue'
import Toggler from 'src/components/extends/v-toggler/v-toggler.vue'
import Pagination from 'src/components/extends/pagination/pagination.vue'
import { USER_ROLE } from 'src/constants'

const { mapActions: mapOffersActions } = createNamespacedHelpers('offers')
const { mapState: mapUserState } = createNamespacedHelpers('user')
const { ADMIN, MODERATOR } = USER_ROLE

const FORM_VIEW_HASH = '#form'

export default {
  name: 'Ads',
  components: {
    // FixedButton,
    Ad,
    AdForm,
    Dialog,
    Button,
    LinkBack,
    TransitionSlide,
    EditorText,
    Toggler,
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
  },
  data() {
    return {
      expanded: true,
      expandedRules: false,
      editedAd: null,
      ads: [],
      cancelAdEditingConfirmationDialog: false,
      ads_rules: '',
      isInited: false,
      isLoadingRules: false,
      isActiveMyAds: true,
      offset: 0,
      limit: 10,
      totalAds: 0,
    }
  },
  computed: {
    ...mapUserState(['role']),
    canEdit() {
      return this.role === ADMIN || this.role === MODERATOR
    },
    formView: {
      get() {
        return this.$route.hash === FORM_VIEW_HASH
      },
      set(value) {
        if (value) {
          this.$router
            .push(`${this.$route.path}${FORM_VIEW_HASH}`)
            .catch(() => {})
        } else {
          this.$router.push(this.$route.path).catch(() => {})
        }
      },
    },
  },
  async created() {
    await this.getOfferList()
    await this.getOfferRules()
    this.onResize()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize)
    }
    this.isInited = true
  },
  methods: {
    getText(message) {
      this.ads_rules = message
    },
    onResize() {
      if (
        typeof window !== 'undefined' &&
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        this.expanded = window.innerWidth > 992
      }
    },
    async getOfferRules() {
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          method: 'GET',
          url: 'user/offer/rules',
        })
        if (status) {
          this.ads_rules = data.description
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show()
      }
    },
    async saveOfferRules() {
      this.isLoadingRules = true
      try {
        await this.$instance.post('user/offer/rules', {
          description: this.ads_rules,
        })
        this.getOfferRules()
      } catch (e) {
        this.$error.show()
      } finally {
        this.isLoadingRules = false
      }
    },
    async getOfferList() {
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          method: 'GET',
          url: 'user/offer/list',
          params: { start: this.offset, limit: this.limit },
        })
        if (status) {
          this.ads = data.list
          this.isActiveMyAds = !!data.has_active
          this.totalAds = data.quantity
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show()
      }
    },
    async getData(value) {
      this.offset = value * this.limit - this.limit
      await this.getOfferList()
    },
    add(ad) {
      this.ads.unshift(ad)
    },
    startAdEditing(ad) {
      this.editedAd = ad
      this.formView = true
      this.expanded = true
    },
    cancelAdEditing() {
      this.editedAd = null
      this.formView = false
      // this.expanded = false

      if (this.$matchMedia.desktop) return
      this.cancelAdEditingConfirmationDialog = false
    },
    completeAdEditing(ad) {
      const editingAdIndex = this.ads.findIndex((item) => item.id === ad.id)
      Object.assign(this.ads[editingAdIndex], ad)
      this.editedAd = null
    },
    async removeAd(id, isEditing) {
      if (isEditing && this.editedAd) this.editedAd = null
      this.ads = this.ads.filter((item) => item.id !== id)
    },
    goToAds() {
      if (this.editedAd) {
        this.cancelAdEditingConfirmationDialog = true
      } else {
        this.formView = false
      }
    },
    showError(message) {
      this.$error.show(message)
    },
    async onHideAll(val) {
      const req = {
        is_active: val,
      }
      console.log('req', req)
      // TODO USE METHOD
      try {
        const {
          data: { data, status, message },
        } = await this.$instance.post('user/offer/hideAll', req)
        if (status) {
          console.log('status', status)
          this.ads.forEach((x) => {
            x.is_active = val
          })
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        console.log('user/offer/hide', e)
        this.$error.show(e.message)
      }
    },
  },
  beforeUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize)
    }
  },
}
</script>

<style lang="scss">
.ads-page {
  .my-ads-list {
    .ads__editor-text {
      &.ads-editor {
        .ql-video {
          display: none !important;
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.ads-page {
  display: flex;
  gap: 36px;
  .my-ads-list {
    flex-grow: 1;
    .ads-rules {
      .ad__rules {
        display: flex;
        flex-direction: column;
      }
      &__title {
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        transition: 0.15s ease-in-out;
        &:hover {
          filter: brightness(1.4);
        }
        .arrow-icon {
          transition: 0.15s ease-in-out;
          &.active {
            transform: rotate(180deg);
          }
        }
      }
    }
  }
  .create-ads {
    border-right-width: 2px;
    .create-ads-block {
      width: 384px;
      .create-title {
        display: flex;
        justify-content: space-between;
        .ui-btn {
          font-size: 16px;
          height: 40px;
          display: none;
        }
      }
    }
  }
  @media (max-width: 992px) {
    gap: 16px;
    flex-direction: column;
    .create-ads {
      max-width: 100%;
      border-right: none;
      .create-ads-block {
        .create-title {
          .title-text {
            display: none;
            &.show-title {
              display: inline-block;
            }
          }
          .ui-btn {
            display: flex;
            width: 100%;
            .title-expand-btn {
              display: inline-flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
      &.pr-9 {
        padding-right: 0;
      }
      .create-ads-block {
        width: 100%;
        .ad-form {
          &.my-10 {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style>
