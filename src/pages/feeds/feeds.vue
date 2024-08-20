<template>
	<div class="w-full mt-6">
		<div class="w-full" v-if="!$route.params.chat_id">
			<div class="feeds mb-10" v-if="!hasIdTag || (hasIdTag && filterPostsID)">
				<div class="feeds__wrap">
					<template v-if="!edit">
						<TabsBadges :labels="statusText" :firstTab="activeTab" :showSettings="showSettings"
							:noSetPath="tagActive" @back="showSettings = false" @setPath="setPath">
							<div class="flex items-end" v-if="auth"><button
									class="flex items-center ml-4 cursor-pointer xs:border py-4 lg:border-b-2 xs:border-2 lg:border-transparent xs:border-gray-400 xs:dark:border-gray-500 lg:border-transparent xs:rounded-md xs:p-3"
									v-if="activeChannel" @click="editPost(null)"><svg
										class="w-4 h-4 lg:mr-2 text-gray-400 dark:text-gray-500" v-svg
										symbol="pencil-alt"></svg>
									<p class="font-medium text-gray-500 dark:text-gray-300 xs:hidden"> {{
										$t('channel.addEntry') }}</p>
								</button>
								<button
									class="flex items-center ml-4 cursor-pointer lg:border-b-2 xs:border-2 xs:rounded-md xs:py-3 xs:px-4 py-4"
									:class="{ 'border-primary xs:bg-primary': showSettings, 'border-gray-400 dark:border-gray-500': !showSettings }"
									@click="onSettings">
									<svg class="w-4 h-4 lg:mr-2" v-svg
										:class="{ 'text-gray-400 dark:text-gray-500': !showSettings, 'lg:text-primary xs:text-white': showSettings }"
										symbol="cog">
									</svg>
									<span class="font-medium text-base dark:text-gray-300 xs:hidden"
										:class="showSettings ? 'text-primary' : 'text-gray-500'">{{
											$t('channel.customizeFeed')
										}}
									</span>
								</button>
							</div>
						</TabsBadges>
						<SectionSetting v-if="showSettings" :value="savedTags" @back="showSettings = false"
							@clearPosts="clearPosts">
						</SectionSetting>
						<template v-if="!showSettings">
							<Tags :value="filterPosts" :key="filterPosts" :activeTab="activeTab" @takeTag="takeTag"></Tags>
							<VInput class="mb-6 lg:mb-10" v-model="searchValue" type="search"
								:placeholder="$t('button.search')" :clearButton="true" @clearValue="searchValue = ''">
							</VInput>
							<div class="tab" :key="activeTab" v-if="posts != null">
								<q-infinite-scroll @load="infiniteHandler" :offset="10">
									<div class="feeds__item" v-for="(post, key) in posts" :key="key">
										<ChannelPreview :pathTo="`/feeds/${post.slug}`" :postData="post" :id="id"
											:feed="true" :tagActive="tagActive"
											@removeDialog="removeDialog(post.id, post.channel.id)"
											@editPost="editPost(post)"></ChannelPreview>
									</div>
									<template v-slot:loading>
										<div class="row justify-center q-my-md">
											<Loader />
										</div>
									</template>
								</q-infinite-scroll>
								<p class="feeds__empty" v-if="posts.length == 0 && searchResult">{{ $t('feeds.noPosts') }}
								</p>
								<p v-if="!searchResult"
									:class="!searchResult ? 'flex w-full justify-center	text-gray-400 font-normal	text-lg dark:text-gray-500' : ''">
									{{ $t('nothingFound') }}</p>
							</div>
						</template>
					</template>
					<template v-if="edit"><button class="feeds__go-back lg:ml-5" @click="goBack"><svg
								class="feeds__icon text-gray-300 dark:text-gray-500" v-svg aria-hidden="true" size="18 17"
								symbol="back-arrow"></svg>{{ $t('feeds.backFeed') }}</button>
						<EditorChannel class="max-w-3xl m-auto" :id="id" :editPostData="editPostData"
							:channelId="editPostData && editPostData.id" @editorShow="editorShow" @addPost="editorShow"
							:view="view">
						</EditorChannel>
					</template>
				</div>
			</div>
		</div>
		<router-view v-if="$route.params.chat_id" :key="$route.params.chat_id"></router-view>
		<Dialog v-model="dialogRemovePost" classCustom="dialogRemovePost" @hide="dialogRemovePost = false">
			<h2 class="dialogRemovePost__title"> {{ $t('channel.deletePostQ') }}<span
					class="dialogRemovePost__title-line">{{
						$t('channel.cannotUndone') }}</span></h2>
			<div class="dialogRemovePost__wrap"><button class="button button_type_info dialogRemovePost__btn"
					@click="dialogRemovePost = false">{{ $t('button.cancel') }}</button><button
					class="button button_type_success dialogRemovePost__btn" @click="removePost()">{{ $t('button.remove')
					}}</button>
			</div>
		</Dialog>
	</div>
</template>

<script>
import { createNamespacedHelpers, useStore } from 'vuex'
import ChannelPreview from 'src/components/channel/channel-preview.vue'
import Dialog from 'src/components/dialog/dialog.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import Tags from 'src/components/helper/page-feeds/tags.vue'
import TabsBadges from 'src/components/extends/tabs-badges/tabs-badges.vue'
import EditorChannel from 'src/components/editor-channel/editor-channel.vue'
import SectionSetting from 'src/components/helper/page-feeds/section-setting.vue'
import Loader from 'src/components/loader/loader.vue'
import { nextTick } from 'vue'
import { api } from 'boot/axios'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  preFetch({ store, currentRoute }) {
    return store.dispatch('feeds/getPosts', currentRoute.query.tab)
  },
  name: 'Feeds',
  components: {
    EditorChannel,
    ChannelPreview,
    Dialog,
    TabsBadges,
    VInput,
    Tags,
    SectionSetting,
    Loader
  },
  setup() {
    const $store = useStore()

    console.log('$store.state.feeds.posts', $store.state.feeds.posts)
  },
  data: () => ({
    activeTab: '',
    posts: [],
    offset: 0,
    limit: 10,
    postsLoaded: false,
    activeChannel: false,
    dataRemoveDialog: null,
    filterPosts: null,
    filterPostsID: null,
    edit: false,
    dialogRemovePost: false,
    editPostData: null,
    tagActive: false,
    searchValue: '',
    searchResult: true,
    stateLoader: null,
    typingTimer: null,
    showSettings: false,
    savedTags: null,
    hasIdTag: false,
    statusText: {
      personal: {
        text: 'feeds.myFeed',
        excludeRole: ['admin', 'moderator', 'member'],
      },
      popular: {
        text: 'feeds.popular',
      },
      new: {
        text: 'feeds.new',
      },
    },
  }),
  computed: {
    ...mapUserState(['id', 'auth', 'name']),
  },
  watch: {
    searchValue() {
      clearInterval(this.typingTimer)
      this.typingTimer = setTimeout(() => {
        this.postsLoaded = false
        this.sortingPosts()
      }, 350)
    },
    filterPosts() {
      console.log('this.filterPosts', this.filterPosts)
      this.sortingPosts()
    },
    posts() {
      if (this.searchValue !== '') {
        const { searchValue } = this
        this.posts.forEach((item) => {
          if (item.title.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1) {
            item.title = item.title.replace(new RegExp(searchValue, 'gi'), "<span class='bg-indigo-50 font-extrabold dark:bg-indigo-800'>$&</span>")
          }
          if (item.short_description.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1) {
            item.short_description = item.short_description.replace(new RegExp(searchValue, 'gi'), "<span class='bg-indigo-50 font-extrabold dark:bg-indigo-800'>$&</span>")
          }
        })
      }
    },
    $route() {
      if (!this.$route.params.tag_id) {
        this.tagActive = false
      }
      if (this.$route.params.chat_id) {
        this.clearSearchMethod()
        this.edit = false
      }
    },
  },
  beforeMount() {
    this.lengh = this.$store.state.feeds.posts.length
    if (this.$route.query.tab) this.setPath(this.$route.query.tab)
    if (this.auth) this.getSaveTags()
    if (this.$route.params.tag_id) {
      this.tagActive = true
      this.hasIdTag = true
      this.setActiveTag()
    }
    if (this.$store.state.feeds.posts && this.$store.state.feeds.posts.length) {
      this.posts = this.$store.state.feeds.posts
    }
  },
  mounted() {
    this.getUserId()
  },
  methods: {
    setActiveTag() {
      this.getTags()
      // this.$route.params.tag_id
    },
    async onSettings() {
      this.showSettings = !this.showSettings
    },
    async getTags() {
      try {
        const { data, status } = await this.$api({
          method: 'GET',
          url: 'userfeed/tag',
          params: {
            limit: 30,
          },
        })
        if (data) {
          this.filterPostsID = data.data.find(el => el.slug === this.$route.params.tag_id).id
          this.hasIdTag = false
        }
      } catch {
        this.$error.show('tags')
      }
    },
    takeTag(val) {
      if (val !== null) {
        this.filterPosts = val.slug
        this.filterPostsID = val.id
        this.tagActive = true
      } else {
        this.filterPosts = ''
        this.filterPostsID = ''
        if (this.tagActive) this.$router.push({ path: '/feeds', query: { tab: this.activeTab } })
      }
    },
    async getUserId() {
      const { data: { data } } = await this.$instance({
        url: 'user/get/data/public',
        data: {
          name: this.name,
        },
      })
      if (data) {
        this.activeChannel = data.is_active_channel && data.active_channel && true
      } else {
        this.$error.show('user/get/data/public')
      }
    },
    goBack() {
      this.editPostData = null
      this.edit = false
      // if (!this.activeTab) this.activeTab = 'popular'
    },
    clearSearchMethod() {
      this.filterPosts = null
      this.filterPostsID = null
      this.searchValue = ''
      this.tagActive = false
    },
    async setPath(type) {
      await nextTick()
      if (this.tagActive) this.$router.push({ path: '/feeds', query: { tab: type } })
      this.clearSearchMethod()
      this.showSettings = false
      this.activeTab = type
      this.offset = 0
      this.posts = []
      this.postsLoaded = false
    },
    back() {
      this.view = 'allPosts'
      this.editPostData = null
    },
    editorShow(data) {
      if (data) this.$router.push(`/feeds/${data.slug}`)
    },
    editPost(post) {
      this.editPostData = post
      this.edit = true
      this.view = 'addPosts'
    },
    removeDialog(id, channel_id) {
      this.dialogRemovePost = true
      this.dataRemoveDialog = {
        id,
        channel_id,
      }
    },
    async infiniteHandler(index, done) {
      if (this.postsLoaded) {
        done()
        return
      }
      await this.getUserPosts()
      done()
    },
    clearPosts() {
      this.offset = 0
      this.posts = []
      this.getSaveTags()
      this.$forceUpdate()
    },
    async getSaveTags() {
      try {
        const { data } = await this.$instance({
          method: 'GET',
          url: 'userfeed/tag/settings',
          params: {},
        })
        if (data.data.length) {
          this.savedTags = data.data
          this.showSettings = false
        } else {
          this.showSettings = true
        }
      } catch {
        this.$error.show('userfeed/tag/settings')
      }
    },
    async removePost() {
      try {
        const { status } = await this.$api({
          method: 'delete',
          url: `/userfeed/channel/${this.dataRemoveDialog.channel_id}/post/${this.dataRemoveDialog.id}`,
        })
        if (status) {
          this.dialogRemovePost = false
          this.offset = 0
          this.posts = []
          this.getUserPosts()
        }
      } catch {
        this.$error.show('/userfeed/channel')
      }
    },
    async getUserPosts() {
      console.log('feeds getUserPosts')
      try {
        const { data } = await this.$api({
          method: 'GET',
          url: 'userfeed/feed',
          params: {
            offset: this.offset,
            'filter[type]': this.activeTab === 'new' ? 'fresh' : 'popular',
            'filter[tag_id]': this.filterPostsID ? this.filterPostsID : null,
            search: this.searchValue !== '' ? this.searchValue : null,
          },
        })
        if (data.data.length > 0) {
          console.log('oldPosts getUserPosts', data.data.length)
          this.offset = this.offset + this.limit
          this.posts.push(...data.data)
          this.scrollInitstop = false
        }
        if (this.posts.length >= data.meta.paginate.total) {
          this.postsLoaded = true
        }
      } catch (e) {
        this.$error.show('1 userfeed/feed', e)
      }
    },
    async sortingPosts() {
      console.log('feeds sortingPosts')
      try {
        const { data } = await this.$api({
          method: 'GET',
          url: 'userfeed/feed',
          params: {
            'filter[type]': this.activeTab === 'new' ? 'fresh' : this.activeTab,
            'filter[tag_id]': this.filterPostsID ? this.filterPostsID : null,
            search: this.searchValue !== '' ? this.searchValue : null,
          },
        })
        if (data) {
          console.log('oldPosts getUserPosts', data.data.length)
          if (!data.data.length && this.searchValue !== '') {
            this.searchResult = false
          } else {
            this.searchResult = true
          }
          if (data.data.length && this.filterPosts) {
            this.tagActive = true
          } else {
            // this.tagActive = false
          }
          this.posts = [
            ...data.data,
          ]
        }
      } catch {
        this.$error.show('2 userfeed/feed')
      }
    },
  },
}
</script>

<style lang="scss">
.feeds {
	position: relative;

	&__wrap {
		margin: 0 20px;
	}

	.tab {
		max-width: 796px;
		margin: auto;
	}

	&__item {
		margin-bottom: 32px;
		margin-left: -20px;
		margin-right: -20px;
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

	&__icon {
		fill: var(--c-gray-20);
		margin-right: 16px;
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

	&__empty {
		color: var(--c-gray-20);
	}
}
</style>
