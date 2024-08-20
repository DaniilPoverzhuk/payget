<template>
	<div class="profile-channel">
		<div class="profile-channel__wrap">
			<template v-if="view =='allPosts'">
				<button class="button profile-channel__add-post button_size_lg" v-if="isPersonalPage || (isAdminOrModerator && !isAdminsChannel)" @click="view = 'addPosts'">{{ $t('channel.addEntry') }}</button>
					<template v-if="posts != null">
						<div class="profile-channel__item" v-for="(post, key) in posts" :key="key">
							<ChannelPreview :pathTo="`/user/${$route.params.name}/channel/${post.slug}`" :post="post" :id="id" :isPersonalPage="isPersonalPage" @removeDialog="removeDialog(post.id, post.channel.id)" @editPost="editPost"></ChannelPreview>
						</div>
					</template>
					<p class="profile-channel__empty" v-if="posts.length == 0">{{ $t('channel.noPosts') }}</p>
					<Loader class="profile-channel__loader" ref="loader" :class="loader || 'profile-channel__loader--hidedn'"></Loader>
			</template>
			<template v-if="view == 'addPosts'">
				<div class="profile-channel__go-back" @click="back">
					<svg class="profile-channel__icon text-gray-300 dark:text-gray-500" v-svg aria-hidden="true" size="18 17" symbol="back-arrow"></svg>
					{{ $t('channel.return') }}
				</div>
				<EditorChannel :id="id" :editPostData="editPostData" :channelId="uid" @editorShow="editorShow" @addPost="addPost" :view="view"></EditorChannel>
			</template>
				<template v-if="view == 'fullPosts' && fullPostsId !== null">
					<div class="profile-channel__item">
						<router-link v-slot="{href, navigate}" :to="`/user/${fullPostsId.user.name}/channel`">
							<a class="profile-channel__go-back" :href="href" @click="navigate">
								<svg class="profile-channel__icon text-gray-300 dark:text-gray-500" v-svg aria-hidden="true" size="18 17" symbol="back-arrow"></svg>
								{{ $t('channel.return') }}
							</a>
						</router-link>
						<ChannelFullview v-if="fullPostsId !== null" :id="id" :key="fullPostsId.slug" :isPersonalPage="isPersonalPage" :postData="fullPostsId" @removeDialog="removeDialog(fullPostsId.id, fullPostsId.channel.id)" @editedPostRout="editedPostRout"></ChannelFullview>
					</div>
				</template>
		</div>
		<Dialog v-model="dialogRemovePost" classCustom="dialogRemovePost" @hide="dialogRemovePost = false">
			<h2 class="dialogRemovePost__title">
				{{ $t('channel.deletePost') }}? <span class="dialogRemovePost__title-line">{{ $t('channel.cannotUndone') }}</span>
			</h2>
			<div class="dialogRemovePost__wrap">
				<button class="button button_type_info dialogRemovePost__btn" @click="dialogRemovePost = false">{{ $t('button.cancel') }}</button>
				<button class="button button_type_success dialogRemovePost__btn" @click="removePost">{{ $t('button.remove') }}</button>
			</div>
		</Dialog>
	</div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex'
import ChannelFullview from 'src/components/channel/channel-fullview.vue'
import ChannelPreview from 'src/components/channel/channel-preview-new.vue'
import EditorChannel from 'src/components/editor-channel/editor-channel.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'
import Loader from 'src/components/loader/loader.vue'
import readNewNotifications from 'src/mixins/readNewNotifications.vue'


const {mapState: mapUserState} = createNamespacedHelpers('user')

export default {
  name: 'ProfileChannel',
  components: {
    Loader,
    EditorChannel,
    Dialog,
    ChannelFullview,
    ChannelPreview,
  },
  mixins: [readNewNotifications],
  data() {
    return {
      view: '',
      posts: [],
      fullPostsId: null,
      loader: true,
      offset: 0,
      uid: 0,
      scrollInitstop: false,
      isAdminsChannel: false,
      editPostData: null,
      dialogRemovePost: false,
      dataRemoveDialog: null,
      channelId: 0,
    }
  },
  computed: {
    ...mapUserState(['id', 'channelInfo', 'auth']),
  },
  props: {
    isPersonalPage: {
      type: Boolean,
      default: false,
    },
    isAdminOrModerator: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    $route() {
      this.checkPage()
    },
    view() {
      if (this.view == 'allPosts' || this.view == 'fullPosts') {
        this.offset = 0
        this.posts = []
        this.fullPostsId = null
        this.checkPage()
      }
    },
  },
  created() {
    this.view = 'allPosts'
  },
  async serverPrefetch() {
    await this.checkPage()
  },
  mounted() {
    this.scrollInit()
  },
  methods: {
    removeDialog(id, channel_id) {
      this.dialogRemovePost = true
      this.dataRemoveDialog = {
        id,
        channel_id,
      }
    },
    editedPostRout(slug) {
      this.$router.push(`/user/${this.$route.params.name}/channel/${slug}`)
    },
    back() {
      this.view = 'allPosts'
      this.editPostData = null
    },
    editPost(post) {
      this.view = 'addPosts'
      this.editPostData = post
    },
    editView(status) {
      this.view = status
    },
    editorShow(data) {
      this.view = 'allPosts'
      this.editPostData = null
      this.fullPostsId = data
      this.posts = []
      this.offset = 0
    },
    scrollInit() {
      if (this.loader) {
        document.addEventListener('scroll', () => {
          if (this.$refs.loader && this.view == 'allPosts' && this.$refs.loader.$el && this.posts.length >= 9) {
            setTimeout(() => {
              const loaderContext = this.$refs.loader.$el
              const offsetTop = loaderContext.getBoundingClientRect().top
              if (offsetTop - window.top.innerHeight <= 0 && !this.scrollInitstop) {
                this.scrollInitstop = true
                this.getUserPosts()
              } else if (offsetTop - window.top.innerHeight > 0 && !this.scrollInitstop) {
                this.loader = true
              }
            }, 100)
          }
        })
      }
    },
    readNewNotifice(statuses) {
      statuses.map(el => {
        this.readNewNotifications(el, this.channelInfo.id)
      })
    },
    async checkPage() {
      if (this.auth) this.readNewNotifice(['post_created', 'post_updated', 'post_deleted'])
      if (!this.channelInfo.is_enabled) this.$router.push(`/user/${this.$route.params.name}`)
      if (this.$route.params && this.$route.params.name) {
        try {
          const {data, status} = await this.$instance({
            method: 'POST',
            url: '/user/get/data/public',
            data: {
              name: this.$route.params.name,
            },
          })
          if (status == 200) {
            if (data.data.id) {
              this.isAdminsChannel = data.data.role == 'admin'
              this.uid = data.data.id
              if (this.$route.params && this.$route.params.slug) {
                this.view = 'fullPosts'
                await this.getUserPost(this.$route.params.slug)
              } else if (!this.$route.params.slug) {
                this.view = 'allPosts'
                await this.getUserPosts(this.posts)
              }
            }
          }
        } catch {
          // this.$error.show()
        }
      }
    },
    async getUserPosts(posts) {
      const postsData = posts || this.posts
      try {
        const {data} = await this.$instance({
          method: 'GET',
          url: `/userfeed/channel/${this.uid}/post`,
          params: {
            channel_id: this.uid,
            offset: this.offset,
          },
        })
        if (data) {
          if (data.data.length) {
            this.posts = [
              ...postsData,
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
    async getUserPost(postId) {
      try {
        const {data, status} = await this.$instance({
          method: 'GET',
          url: `/userfeed/post/${this.$route.params.slug}`,
          params: {
            idOrSlug: this.$route.params.slug,
          },
        })
        if (data) {
          if (data.data.length == 0) this.$router.push('/')
          this.fullPostsId = data.data
        }
      } catch {
        this.$error.show()
      }
    },
    addPost(data) {
      this.posts.unshift(data)
    },
    async removePost() {
      try {
        const {status, data} = await this.$instance({
          method: 'delete',
          url: `/userfeed/channel/${this.dataRemoveDialog.channel_id}/post/${this.dataRemoveDialog.id}`,
        })
        if (status) {
          if (this.view == 'fullPosts') this.$router.push(`/user/${this.$route.params.name}/channel`)
          this.dialogRemovePost = false
          this.view = 'allPosts'
          this.posts = []
          this.offset = 0
          this.checkPage()
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.profile-channel {
  height: 100%;
  position: relative;


  @media (min-width: 1200px) {
    padding: 0 173px;
    margin: auto;
  }


  &__loader {
    flex-grow: 1;
    display: flex;
    justify-content: center;

    &--hidedn {
      visibility: hidden;
      width: 0;
      height: 0;
      z-index: -99;
    }
  }

  &__wrap {
    display: flex;
    flex-direction: column;
    max-width: 836px;
    margin: auto;
    height: 100%;
  }

  &__add-post {
    max-width: 417px;
    margin: 0 auto 40px;
    @media (min-width: 1200px) {
      z-index: 1;
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

    @media (min-width: 1200px) {
      position: absolute;
      left: 0;
    }

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

  &__empty {
    color: var(--c-gray-20);
  }

  &__item {

    @media (min-width: 1200px) {
      margin: 0 0 32px;
    }
  }
}
</style>
