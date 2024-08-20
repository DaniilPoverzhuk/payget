<template>
  <div class="channel" v-if="post !== null">
    <EditorChannel
      v-if="editFullPost"
      :id="id"
      :editPostData="post"
      @editorShow="editorShow"
      :view="view"
      @editorFullPost="editorFullPost"
    ></EditorChannel>
    <div class="channel__wrap" v-else>
      <div class="channel__head head">
        <div class="head__info info">
          <component
            class="flex-shrink-0"
            :is="isRouterLink ? 'a' : 'div'"
            :href="
              isRouterLink
                ? `/user/${encodeURIComponent(post.user.name)}/channel`
                : undefined
            "
            :class="isRouterLink && 'link'"
            ><img
              class="info__img"
              v-if="
                post.user && post.user.media !== null && post.user.media.avatar
              "
              :src="post.user.media.avatar"
            />
            <div class="info__noavatar" v-else>
              <svg class="info__icon" v-svg symbol="user"></svg>
            </div>
          </component>
          <div class="info__wrap">
            <div class="info__title">
              <component
                class="info__text"
                v-if="post.user"
                :is="isRouterLink ? 'a' : 'p'"
                :href="
                  isRouterLink
                    ? `/user/${encodeURIComponent(post.user.name)}/channel`
                    : undefined
                "
                :class="isRouterLink && 'link'"
                >{{ post.user.name }}</component
              >
              <div class="info__online" v-if="online"></div>
              <svg
                class="info__verified text-primary flex-shrink-0"
                v-if="
                  channelInfo !== null && channelInfo.id == post.user.id
                    ? channelInfo.is_verified
                    : post.user.is_verified
                "
                v-svg
                size="20"
                symbol="verified"
              ></svg
              ><svg
                class="info__disturbe"
                v-if="channelInfo !== null && channelInfo.is_muted"
                v-svg
                size="20"
                symbol="unnotifications"
              ></svg>
            </div>
            <div
              class="info__time"
              v-if="post && post.created_at && postDataCreate"
            >
              {{ postDataCreate }}
            </div>
          </div>
        </div>
        <div class="head__action">
          <div class="channel__dropdown dropdown">
            <button
              class="dropdown__toggle"
              type="button"
              v-click-outside="
                () => {
                  dropdownMenu = false
                }
              "
              @click="dropdownMenu = !dropdownMenu"
            >
              <svg
                class="dropdown__toggle-icon"
                v-svg
                size="24"
                symbol="threedots"
              ></svg>
            </button>
            <transition name="fade">
              <div class="dropdown__menu" v-if="dropdownMenu">
                <button
                  class="dropdown__button"
                  v-if="post.has_update == false"
                  type="button"
                  @click="wantComplaintPost()"
                >
                  {{ $t('complaints.complain') }}</button
                ><button
                  class="dropdown__button"
                  v-if="post.has_update == true"
                  type="button"
                  @click="getRemoveMenu()"
                >
                  {{ $t('button.remove') }}</button
                ><button
                  class="dropdown__button"
                  v-if="post.has_update == true"
                  @click="getEdit()"
                >
                  {{ $t('button.change') }}
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <div class="channel__body">
        <h2 class="channel__title">{{ post.title }}</h2>
        <div
          class="px-2 py-1 bg-secondary-100 inline-flex items-center text-sm font-medium rounded-md mb-4 dark:bg-gray-800 dark:text-gray-300 font-medium"
          v-if="post.is_private"
        >
          <svg
            class="text-secondary-400 dark:text-secondary-600 w-5 h-5 mr-1"
            v-svg
            symbol="star"
          ></svg>
          {{ $t('channel.postPartial') }}
        </div>
        <p class="channel__descr">{{ post.short_description }}</p>
        <p
          class="channel__edited"
          v-if="post.last_modified"
          v-text="
            $t(
              post.last_modified == 'user'
                ? 'complaints.edited'
                : 'complaints.adminEdited'
            )
          "
        ></p>
        <div
          class="channel__text"
          v-if="accessPost"
          v-html="post.description"
        ></div>
      </div>
      <ChannelView
        class="channel__view"
        v-if="accessPost"
        :comments="post.comments_count || 0"
        :viewed="post.viewed !== null ? post.viewed : 0"
        :currentReacted="currentReacted"
        :reactions="reactions"
        :idPost="post.id"
        @setReacted="setReacted"
      ></ChannelView>
      <Comments
        @updateCount="onUpdateCommentsCount"
        :post-id="post.id"
        :count="post.comments_count || 0"
      />
    </div>
    <slot></slot>
    <DialogDown
      v-model="showPrivatePaid"
      classCustom="complaintPost"
      @hide="showPrivatePaid = false"
    >
      <PrivateForm
        :post="post"
        @hideDialog="showPrivatePaid = false"
      ></PrivateForm>
    </DialogDown>
    <Dialog
      v-model="complaintPost"
      classCustom="complaintPost"
      @hide="complaintPost = false"
    >
      <ChannelComplaint
        :postId="post.id"
        @hide="complaintPost = false"
        :userId="post.user.id"
        :types="typesComplaint"
      ></ChannelComplaint>
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers, useStore } from 'vuex'
import { isArray } from 'lodash'
import ChannelView from './channel-view/channel-view.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import ChannelComplaint from './channel-complaint/channel-complaint.vue'
import EditorChannel from 'src/components/editor-channel/editor-channel.vue'
import DialogDown from 'src/components/dialog/dialog-down.vue'
import PrivateForm from './channel-privatForm/channel-privatForm.vue'
import { computed, ref, nextTick, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, instance } from 'boot/axios'
import error from 'src/error.js'
import { useRoute, useRouter } from 'vue-router'
import { useMeta } from 'quasar'
import Comments from '../comments/comments.vue'

const { mapState: mapUserState, mapMutations: mapUserMutations } =
  createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')
export default {
  name: 'ChannelFullView',
  components: {
    Dialog,
    EditorChannel,
    ChannelComplaint,
    ChannelView,
    DialogDown,
    PrivateForm,
    Comments,
  },
  props: {
    feed: {
      type: Boolean,
      default: false,
    },
    isPersonalPage: {
      type: Boolean,
      default: false,
    },
    routeAfterEdit: {
      type: Boolean,
      default: true,
    },
    view: {
      type: String,
      default: '',
    },
    postData: {
      type: Object,
      default: null,
    },
    id: {
      type: Number,
      default: NaN,
    },
  },
  setup(props, { emit }) {
    const $store = useStore()
    const $router = useRouter()
    const $route = useRoute()
    const { t } = useI18n()
    const showPrivatePaid = ref(false)
    const editFullPost = ref(false)
    const post = ref(null)
    const info = ref(null)
    const currentReacted = ref('')
    const reactions = ref({ like: 0, dislike: 0 })
    const dropdownMenu = ref(false)
    const complaintPost = ref(false)
    const typesComplaint = ref([])
    const onlineUsers = computed(() => $store.state.echo.onlineUsers)
    const channelInfo = computed(() => $store.state.user.channelInfo)
    const role = computed(() => $store.state.user.role)
    const isRouterLink = computed(() => {
      if (
        post.value !== null &&
        !props.feed &&
        info.value?.id == post.value.channel.id
      ) {
        // is this profile in channel
        return false
      }
      return true
    })
    const accessPost = computed(() => {
      if (
        Array.isArray(post.value.private) ||
        post.value.user.id == $store.state.user.id ||
        role.value == 'admin'
      ) {
        return true
      }
      const oneTimeSubscription = !Array.isArray(
        post.value.private.one_time_subscription
      )
      const plan_subscription =
        !Array.isArray(post.value.private.plan_subscription) &&
        new Date() < new Date(post.value.private.plan_subscription.end_date) &&
        new Date() > new Date(post.value.private.plan_subscription.start_date)
      return oneTimeSubscription || plan_subscription
    })
    const { locale } = useI18n({ useScope: 'global' })
    const isRu = computed(() => locale.value == 'ru-RU')
    const online = computed(() =>
      onlineUsers.value.includes(post.value.channel.id)
    )
    const postImgPreview = computed(() => {
      const path = post.value.description.match(/src="([^">]+)"/)
      return path !== null
        ? path[0].replace(/src=/, '').replace(/"/, '').replace(/"/, '')
        : false
    })
    const postDataCreate = computed(() => {
      const date = post.value.created_at.split('T')[0].split('-')
      return `${date[2].slice(0, 2)} ${t(`monthsShort.${[date[1] - 1]}`)} ${
        date[0]
      }`
    })
    watch(channelInfo, (value) => {
      info.value = value
    })
    const init = async () => {
      info.value = channelInfo.value
      if (props.postData !== null) {
        post.value = props.postData
        if (post.value.description) {
          post.value.description = post.value.description
            .replaceAll('&lt;iframe', '<iframe')
            .replaceAll('&gt;&lt;/iframe&gt;', '></iframe>')
          post.value.description = post.value.description
            .replaceAll('&lt;video', '<video')
            .replaceAll('&gt;<br>&lt;/video&gt;', '><br></video>')
        }
        if (post.value.reactions !== null) {
          reactions.value = post.value.reactions
        }
        currentReacted.value = post.value.current_reacted
        if (info.value == null) {
          setInfo()
        }
      }
      await nextTick()
      if (!accessPost.value) {
        showPrivatePaid.value = true
      }
    }
    const metaInfo = () => {
      const post = $store.state.feeds.fullPostsId
      return {
        title:
          post !== null && post.seo.meta_title !== null
            ? post.seo.meta_title
            : 'TWIX',
        meta: {
          description: {
            name: 'description',
            content:
              post !== null && post.seo.meta_description !== null
                ? post.seo.meta_description
                : '',
          },
          keywords: {
            name: 'keywords',
            content:
              post !== null && post.seo.meta_keywords !== null
                ? post.seo.meta_keywords
                : '',
          },
        },
      }
    }
    useMeta(metaInfo())
    const complaintType = async () => {
      try {
        const { status, data } = await instance({
          method: 'GET',
          url: '/userfeed/complaint-type',
        })
        if (data) {
          typesComplaint.value = data.data.map((item) => {
            item.name = isRu.value ? item.name.ru : item.name.en
            return item
          })
          complaintPost.value = true
          dropdownMenu.value = false
        }
      } catch (e) {
        error.show(e)
      }
    }
    const setInfo = (data) => {
      $store.commit('user/setChannelInfo', {
        id: post.value.id,
        is_verified: post.value.user.is_verified,
      })
    }
    const wantComplaintPost = () => {
      if (role.value == null) {
        $router.push('/')
      } else {
        complaintType()
      }
    }
    const editorShow = (data) => {
      if (props.routeAfterEdit) {
        $router.push(`/user/${$route.params.name}/channel/${data.slug}`)
      }
      editFullPost.value = false
      post.value = data
      post.value.description = post.value.description
        .replaceAll('&lt;iframe', '<iframe')
        .replaceAll('&gt;&lt;/iframe&gt;', '></iframe>')
      post.value.description = post.value.description
        .replaceAll('&lt;video', '<video')
        .replaceAll('&gt;&lt;/video&gt;', '></video>')
      console.log(post.value.description)
    }
    const fetchSubscribers = async () => {
      if (role.value == null) {
        $router.push('/')
        return false
      }
      try {
        const { data } = await instance({
          method: info.value.has_unsubscribe ? 'DELETE' : 'POST',
          url: `/userfeed/channel/${post.value.channel.id}/subscribe`,
          data: {
            channel_id: post.value.channel.id,
          },
        })
        $store.commit('user/setChannelInfo', {
          ...channelInfo.value,
          has_subscribe: !info.value.has_subscribe,
          has_unsubscribe: !info.value.has_unsubscribe,
          subscribers: data.meta.subscribers_count,
        })
      } catch (e) {
        error.show(e)
      }
    }

    const setReacted = (data, type) => {
      reactions.value = data.count.length ? {} : { ...data.count }
      currentReacted.value =
        Object.keys(data.count)[0] && type !== currentReacted.value ? type : ''
    }
    const editorFullPost = (data) => {
      post.value = data
      post.value.description = post.value.description
        .replaceAll('&lt;iframe', '<iframe')
        .replaceAll('&gt;&lt;/iframe&gt;', '></iframe>')
      post.value.description = post.value.description
        .replaceAll('&lt;video', '<video')
        .replaceAll('&gt;&lt;/video&gt;', '></video>')
      editFullPost.value = false
    }
    const getRemoveMenu = () => {
      dropdownMenu.value = false
      emit('removeDialog')
    }
    const getEdit = () => {
      editFullPost.value = true
      dropdownMenu.value = false
    }
    init()
    onBeforeUnmount(() => {
      post.value = null
    })
    const onUpdateCommentsCount = () => {
      post.value.comments_count = post.value.comments_count + 1
    }
    return {
      showPrivatePaid,
      editFullPost,
      post,
      info,
      currentReacted,
      reactions,
      dropdownMenu,
      complaintPost,
      typesComplaint,
      onlineUsers,
      channelInfo,
      role,
      isRouterLink,
      accessPost,
      online,
      postImgPreview,
      postDataCreate,
      complaintType,
      setInfo,
      wantComplaintPost,
      editorShow,
      fetchSubscribers,
      setReacted,
      editorFullPost,
      getRemoveMenu,
      getEdit,
      onUpdateCommentsCount,
    }
  },
}
</script>
<style lang="scss">
.channel {
  &__wrap {
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--c-gray-10);

    @media (--desktop) {
      padding: 24px;
      border-radius: 8px;
    }
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__body {
    position: relative;
  }

  &__footer {
    @media (--desktop) {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .button {
      width: auto;
    }
  }

  &__edited {
    color: var(--c-gray-20);
    margin-top: 16px;
  }

  &__footer,
  &__head {
    margin-bottom: 16px;

    @media (--desktop) {
      margin-bottom: 24px;
    }
  }

  &__footer {
    padding-top: 32px;
    align-items: center;
  }

  &__title {
    font-size: 18px;
    line-height: 140%;
    color: var(--c-gray-80);
    margin-bottom: 16px;
    font-weight: var(--fw-600);
    display: block;
    text-decoration: none;
    word-break: break-word;

    &--href {
      cursor: pointer;

      &:hover {
        color: var(--c-primary);
      }
    }

    @media (--desktop) {
      font-size: 26px;
    }
  }

  &__descr {
    font-size: 16px;
    line-height: 24px;
    font-weight: var(--fw-500);
    color: var(--c-gray-70);
  }

  &__more {
    color: var(--c-gray-20);
    text-decoration: none;
  }

  &__noimg {
    padding-top: 32px;
    width: calc(100% + 48px);
    margin-right: -24px;
    margin-left: -24px;
    border-bottom: 1px solid var(--c-gray-15);
  }

  &__text {
    padding-top: 24px;
    .ql-video {
      width: 100%;
      height: 100%;
      aspect-ratio: 16/9;
    }
    video {
      width: 100%;
    }

    & * {
      color: var(--c-gray-80);
      word-break: break-word;
      &.ql-align-justify {
        text-align: justify;
        &:after {
          content: '';
          width: 100%;
          display: inline-block;
          line-height: 0;
        }
      }
    }

    & a {
      color: var(--c-primary);
    }

    ol {
      counter-reset: Index;
      padding-bottom: 16px;

      li {
        &:before {
          content: counter(Index) '. ';
          counter-increment: Index;
        }
      }
    }

    ul li {
      position: relative;
      padding-left: 12px;
      color: var(--c-gray-80);

      &:before {
        content: '';
        width: 6px;
        height: 6px;
        background: var(--c-gray-80);
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
      }
    }

    img {
      max-width: 100%;
      display: block;
    }
  }

  &__picture {
    margin: auto;
  }

  &__img {
    width: 100%;
    margin-top: 24px;

    @media (--desktop) {
      margin-top: 20px;
    }

    &--preview {
      width: auto;
      max-width: calc(100% + 40px);
      margin-right: -20px;
      margin-left: -20px;

      @media (--desktop) {
        max-width: calc(100% + 48px);
        margin-right: -24px;
        margin-left: -24px;
      }
    }
  }

  &__view {
    &--bg {
      border-top: 1px solid var(--c-gray-15);
    }
  }

  &__dropdown {
    position: relative;
  }

  .head {
    &__info {
      display: flex;
      align-items: flex-start;
    }
  }

  .info {
    &__title {
      display: flex;
    }

    &__text {
      font-size: 16px;
      line-height: 24px;
      color: var(--c-gray-80);
      margin-bottom: 4px;
      position: relative;
      display: flex;
      font-weight: var(--fw-600);
      text-decoration: none;

      @media (--desktop) {
        font-size: 18px;
        line-height: 1.4;
      }
    }

    &__online {
      content: '';
      width: 6px;
      height: 6px;
      display: block;
      background: #3abf8f;
      border-radius: 50%;
      flex-shrink: 0;
      margin-left: 2px;

      @media (--desktop) {
        width: 8px;
        height: 8px;
        margin-left: 4px;
      }
    }

    &__disturbe {
      fill: var(--c-gray-20);
      margin-left: 2px;
      transform: translateY(3px);
    }

    &__verified {
      margin-left: 2px;
      transform: translateY(3px);
      fill: var(--c-primary);
    }

    &__noavatar,
    &__img {
      width: 52px;
      height: 52px;
      border-radius: 8px;
      margin-right: 12px;
      @media (--desktop) {
        margin-right: 8px;
      }
    }

    &__noavatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--c-secondary);
    }

    &__icon {
      height: 24px;
      width: 24px;

      @media (--desktop) {
        height: 28px;
        width: 28px;
      }
    }

    &__time {
      font-size: 14px;
      line-height: 1.43;
      color: var(--c-gray-20);
    }
  }

  .footer {
    &__info {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      @media (--desktop) {
        margin-bottom: 0;
      }
    }

    &__action {
      display: flex;
      justify-content: center;

      @media (--desktop) {
        display: block;
      }
    }
  }

  .dropdown {
    @media (--desktop) {
      margin-left: 8px;
      position: relative;
      top: auto;
      right: auto;
      width: auto;
      height: auto;
      display: block;
    }

    &__toggle {
      border-width: 0;
      background-color: var(--c-transparent);
      color: var(--c-gray-20);
      align-self: center;
      display: block;
      cursor: pointer;
      transition-property: color;
      transition-duration: var(--t);
      margin-left: 8px;

      &:hover,
      &:focus {
        color: var(--c-gray-70);
      }

      &-icon {
        display: block;
        fill: currentColor;
        transform: rotate(90deg);
      }
    }

    &__menu {
      border-radius: var(--bdrs-default);
      box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1);
      transition-duration: var(--t);
      transition-property: background-color;
      background-color: var(--c-white);
      position: absolute;
      right: 0;
      top: 100%;
      z-index: 999;
    }

    &__action {
      flex-shrink: 0;
    }

    &__button {
      padding: 20px;
      white-space: nowrap;
      color: var(--c-gray-70);
      cursor: pointer;
      line-height: var(--lh-sm);
      width: 100%;

      &:hover,
      &:focus {
        background-color: var(--c-gray-10);
      }
    }
  }

  .link {
    cursor: pointer;
  }
}

.ql-align-right {
  text-align: right;
}

.ql-align-left {
  text-align: left;
}

.dialogRemovePost {
  padding-left: 5px;
  padding-right: 5px;
  max-width: 476px;

  .dialogRemovePost__title,
  .dialogRemovePost__wrap {
    max-width: 338px;
    margin: auto;

    @media (--desktop) {
      max-width: 390px;
    }
  }

  &__wrap {
    display: flex;
    justify-content: center;
    padding-top: 24px;
  }

  &__btn {
    min-width: 128px;
    margin-right: 20px;

    @media (--desktop) {
      margin-right: 26px;
      min-width: 156px;
    }

    &:last-of-type {
      margin-right: 0;
    }
  }

  &__title {
    font-weight: var(--fw-600);
    font-size: 18px;
    line-height: 1.4;
    text-align: center;

    @media (--desktop) {
      font-size: 22px;
    }

    &-line {
      @media (--desktop) {
        display: inline-block;
      }
    }
  }
}
</style>
