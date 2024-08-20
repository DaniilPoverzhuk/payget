<template>
  <div class="channel" v-if="post !== null">
    <div class="channel__wrap">
      <div class="channel__head head">
        <div class="head__info info">
          <component
            class="flex-shrink-0"
            :is="isRouterLink ? 'a' : 'div'"
            :href="isRouterLink ? `/user/${post.user.name}/channel` : undefined"
            :class="isRouterLink && 'link'"
          >
            <img
              class="info__img"
              v-if="
                post.user && post.user.media !== null && post.user.media.avatar
              "
              :src="post.user.media.avatar"
            />
            <div v-else class="info__noavatar">
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
                  isRouterLink ? `/user/${post.user.name}/channel` : undefined
                "
                :class="isRouterLink && 'link'"
                >{{ post.user.name }}</component
              >
              <div class="info__online" v-if="online"></div>
              <svg
                class="info__verified flex-shrink-0 text-primary"
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
                  @click="getEdit(post)"
                >
                  {{ $t('button.change') }}
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <div
        v-if="post.tag"
        class="flex w-max font-medium items-center relative pl-5 text-sm rounded my-2 py-0.5 pr-3 after:content-['\2022'] after:absolute after:left-1.5 dark:text-gray-300 dark:bg-gray-800 dark:after:content-['\2022'] dark:after:text-gray-500 lg:'mr-4 xs:mr-3"
        :class="
          tagActive
            ? 'text-white bg-primary after:text-white dark:after:text-white dark:text-white dark:bg-primary'
            : 'text-gray-800 bg-gray-100 after:text-gray-400'
        "
      >
        {{ post.tag.name }}
      </div>
      <div class="channel__body">
        <router-link v-if="accessPost" v-slot="{ href, navigate }" :to="pathTo"
          ><a
            class="channel__title"
            :href="href"
            @click="navigate"
            v-html="post.title"
          ></a></router-link
        ><button
          class="channel__title"
          v-else
          @click="showPrivatePaid = true"
          v-html="post.title"
        ></button>
        <div
          class="px-2 py-1 bg-secondary-100 inline-flex items-center text-sm font-medium rounded-md mb-4 dark:bg-gray-800 dark:text-gray-300 font-medium"
          v-if="post.is_private"
        >
          <svg
            class="text-secondary-400 dark:text-secondary-600 w-5 h-5 mr-1"
            v-svg
            symbol="star"
          ></svg
          >{{ $t('channel.postPartial') }}
        </div>
        <div class="preview-text flex-wrap">
          <p
            class="channel__descr"
            v-html="post.short_description + '... &nbsp;'"
          ></p>
          <router-link
            v-if="accessPost"
            v-slot="{ href, navigate }"
            :to="pathTo"
            ><span class="channel__more" :href="href" @click="navigate">{{
              $t('channel.readMore')
            }}</span></router-link
          ><button class="channel__more" v-else @click="showPrivatePaid = true">
            {{ $t('channel.readMore') }}
          </button>
        </div>
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
          class="channel__img"
          v-if="post.cover.length > 0"
          :class="post.cover && 'channel__img--preview'"
        >
          <img class="channel__picture" :src="post.cover" />
        </div>
        <div class="channel__noimg" v-if="post.cover.length == 0"></div>
      </div>
      <ChannelView
        class="channel__view"
        :comments="post.comments_count || 0"
        :viewed="post.viewed !== null ? post.viewed : 0"
        :currentReacted="currentReacted"
        :reactions="reactions"
        :idPost="post.id"
        @setReacted="setReacted"
      ></ChannelView>
    </div>
    <slot></slot>
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
  </div>
</template>
<script>
import { createNamespacedHelpers } from 'vuex'
import ChannelView from './channel-view/channel-view.vue'
import DialogDown from 'src/components/dialog/dialog-down.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import ChannelComplaint from './channel-complaint/channel-complaint.vue'
import PrivateForm from './channel-privatForm/channel-privatForm.vue'
import { isArray } from 'lodash'
import i18n from 'src/i18n/localization'

const { mapState: mapUserState, mapMutations: mapUserMutations } =
  createNamespacedHelpers('user')
const { mapState: mapEchoState } = createNamespacedHelpers('echo')

export default {
  name: 'channel',
  components: {
    Dialog,
    PrivateForm,
    ChannelComplaint,
    DialogDown,
    ChannelView,
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
    postData: {
      type: Object,
      default: null,
    },
    pathTo: {
      type: String,
      default: '',
    },
    id: {
      type: Number,
      default: NaN,
    },
    tagActive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showPrivatePaid: false,
      editFullPost: false,
      post: null,
      info: null,
      currentReacted: '',
      reactions: { like: 0, dislike: 0 },
      dropdownMenu: false,
      complaintPost: false,
      dialogRemovePost: false,
      typesComplaint: [],
    }
  },
  computed: {
    ...mapEchoState(['onlineUsers']),
    ...mapUserState(['channelInfo', 'role']),
    isRouterLink() {
      if (
        this.post.channel.id !== this.id ||
        (!this.feed && this.info.id === this.post.channel.id)
      ) {
        // if post wrote admin || is this profile in channel
        return false
      }
      return true
    },
    online() {
      return this.onlineUsers.includes(this.post.channel.id)
    },
    postDataCreate() {
      const date = this.post.created_at.split('T')[0].split('-')
      return `${date[2]} ${this.$t(`monthsShort.${[date[1] - 1]}`)} ${date[0]}`
    },
    accessPost() {
      return !!this.post.description
    },
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
  },
  watch: {
    channelInfo() {
      this.info = this.channelInfo
    },
    postData() {
      this.post = this.postData
    },
  },
  created() {
    this.info = this.channelInfo
    if (this.postData !== null) {
      this.post = this.postData
      if (this.post.reactions !== null) this.reactions = this.post.reactions
      this.currentReacted = this.post.current_reacted
    }
  },
  methods: {
    ...mapUserMutations(['setChannelInfo']),
    wantComplaintPost() {
      if (this.role == null) {
        this.$router.push('/')
      } else {
        this.complaintType()
      }
    },
    async complaintType() {
      try {
        const { status, data } = await this.$instance({
          method: 'GET',
          url: '/userfeed/complaint-type',
        })
        if (data) {
          this.typesComplaint = data.data.map((item) => {
            item.name = this.isRu ? item.name.ru : item.name.en
            return item
          })
          this.complaintPost = true
          this.dropdownMenu = false
        }
      } catch (e) {
        this.$error.show(e)
      }
    },
    setReacted(data, type) {
      this.reactions = data.count.length ? {} : { ...data.count }
      this.currentReacted =
        Object.keys(data.count)[0] && type !== this.currentReacted ? type : ''
    },
    editorFullPost(data) {
      this.post = data
      this.editFullPost = false
    },
    getRemoveMenu() {
      this.dropdownMenu = false
      this.$emit('removeDialog')
    },
    getEdit(post) {
      this.$emit('editPost', post)
      this.dropdownMenu = false
    },
  },
}
</script>

<style lang="scss">
@import './styles.scss';
</style>
