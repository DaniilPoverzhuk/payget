<template>
	<div class="w-full mt-6">
		<div class="w-full" v-if="!isChat">
			<div class="feeds mb-10" v-if="!hasIdTag || (hasIdTag && filterPostsID)">
				<div class="feeds__wrap">
					<template v-if="!edit">
						<TabsBadges :labels="statusText" :firstTab="activeTab" :showSettings="showSettings" :noSetPath="tagActive"
							@back="showSettings = false" @setPath="setPath">
							<div class="flex items-end" v-if="auth"><button
									class="flex items-center ml-4 cursor-pointer xs:border py-4 lg:border-b-2 xs:border-2 lg:border-transparent xs:border-gray-400 xs:dark:border-gray-500 lg:border-transparent xs:rounded-md xs:p-3"
									v-if="activeChannel" @click="editPost(null)"><svg
										class="w-4 h-4 lg:mr-2 text-gray-400 dark:text-gray-500" v-svg symbol="pencil-alt"></svg>
									<p class="font-medium text-gray-500 dark:text-gray-300 xs:hidden"> {{
										$t('channel.addEntry') }}</p>
								</button>
								<button
									class="flex items-center ml-4 cursor-pointer lg:border-b-2 xs:border-2 xs:rounded-md xs:py-3 xs:px-3 py-4"
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
						<SectionSetting v-if="showSettings" :value="savedTags" @back="showSettings = false" @clearPosts="clearPosts">
						</SectionSetting>
						<template v-if="!showSettings">
							<Tags :value="filterPosts" :key="filterPosts" :activeTab="activeTab" @takeTag="takeTag"></Tags>
							<VInput class="mb-6 lg:mb-10" v-model="searchValue" type="search" :placeholder="$t('button.search')"
								:clearButton="true" @clearValue="searchValue = ''">
							</VInput>
							<div class="tab" :key="activeTab" v-if="posts != null">
								<q-infinite-scroll @load="infiniteHandler" :offset="0">
									<div class="feeds__item" v-for="(post, key) in posts" :key="key">
										<ChannelPreview @takeTag="takeTag" :activeTab="activeTab" :pathTo="`/feeds/${post.slug}`" :post="post" :id="id" :feed="true"
											:tagActive="tagActive" :tagActiveId="filterPostsID" @removeDialog="removeDialog(post.id, post.channel.id)"
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
							:channelId="editPostData && editPostData.id" @editorShow="editorShow" @addPost="editorShow" :view="view">
						</EditorChannel>
					</template>
				</div>
			</div>
		</div>
		<router-view v-if="isChat" :key="route.params.chat_id" :active-tab="activeTab"></router-view>
		<Dialog v-model="dialogRemovePost" classCustom="dialogRemovePost" @hide="dialogRemovePost = false">
			<h2 class="dialogRemovePost__title"> {{ $t('channel.deletePostQ') }}
				</h2>
				<div class="dialogRemovePost__title-line">{{
				$t('channel.cannotUndone') }}</div>
			<div class="dialogRemovePost__wrap"><button class="button button_type_info dialogRemovePost__btn"
					@click="dialogRemovePost = false">{{ $t('button.cancel') }}</button><button
					class="button button_type_success dialogRemovePost__btn" @click="removePost">{{ $t('button.remove')
					}}</button>
			</div>
		</Dialog>
	</div>
</template>

<script>
import { useStore } from 'vuex'
import ChannelPreview from 'src/components/channel/channel-preview-new.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
import Tags from 'src/components/helper/page-feeds/tags.vue'
import TabsBadges from 'src/components/extends/tabs-badges/tabs-badges-new.vue'
import EditorChannel from 'src/components/editor-channel/editor-channel.vue'
import SectionSetting from 'src/components/helper/page-feeds/section-setting.vue'
import Loader from 'src/components/loader/loader.vue'
import { nextTick, onBeforeMount, ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, instance } from 'boot/axios'
import error from 'src/error.js'
import { debounce } from 'quasar'

// const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'NewFeeds',
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
  preFetch({ store, currentRoute }) {
    return store.dispatch('feeds/getPosts', currentRoute)
    // return store.dispatch('feeds/getPosts', currentRoute.query.tab)
  },
  setup() {
    const $store = useStore()
    const router = useRouter()
    const route = useRoute()
    const activeTab = ref(route.query.tab || 'popular')
    const posts = ref([])
    const offset = ref(0)
    const limit = ref(10)
    const postsLoaded = ref(false)
    const activeChannel = ref(false)
    const dataRemoveDialog = ref(null)
    const filterPosts = ref(null)
    const filterPostsID = ref(null)
    const edit = ref(false)
    const dialogRemovePost = ref(false)
    const editPostData = ref(null)
    const tagActive = computed(() => !!route.params.tag_id)
    const searchValue = ref('')
    const searchResult = ref(true)
    const typingTimer = ref(null)
    const showSettings = ref(false)
    const savedTags = ref(null)
    const hasIdTag = ref(false)
    const inited = ref(false)
    const view = ref('')
    const statusText = ref({
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
    })

    const id = computed(() => $store.state.user.id)
    const auth = computed(() => $store.state.user.auth)
    const name = computed(() => $store.state.user.name)

    const isChat = computed(() => route.params.chat_id)

    watch(searchValue, (value) => {
      onSearch()
    })

    watch(filterPosts, (value) => {
      sortingPosts()
    })

    watch(isChat, (value, oldValue) => {
      if (oldValue && route.query.tab && !posts.value.length) {
        setPath(route.query.tab)
      }
      if (value) {
        edit.value = false
      }
    })

    watch(
      () => route.params.tag_id,
      async newId => {
        if (newId) {
          clearSearchMethod()
          edit.value = false
        }
      }
    )

    // const debounce = (fn, ms) => {
    //   let timeout
    //   return function () {
    //     const fnCall = () => { fn.apply(this, arguments) }
    //     clearTimeout(timeout)
    //     timeout = setTimeout(fnCall, ms)
    //   }
    // }

    const onSearch = debounce(() => {
      postsLoaded.value = false
      offset.value = 0
      sortingPosts()
    }, 350)

    const initBeforeMount = async () => {
      if (auth.value) await getSaveTags()
      if (route.params.tag_id) {
        hasIdTag.value = true
        await setActiveTag()
      }
      inited.value = true
    }

    const setActiveTag = async () => await getTags()

    const onSettings = async () => {
      showSettings.value = !showSettings.value
    }

    const getTags = async () => {
      try {
        const { data, status } = await api({
          method: 'GET',
          url: 'userfeed/tag',
          params: {
            limit: 30,
          },
        })
        if (data) {
          const tagId = data.data.find(el => el.slug === route.params.tag_id).id
          filterPostsID.value = tagId
          hasIdTag.value = false
        }
      } catch {
        error.show('tags')
      }
    }

    const takeTag = (val) => {
      if (val !== null) {
        filterPosts.value = val.slug
        filterPostsID.value = val.id
        offset.value = 0
      } else {
        filterPosts.value = ''
        filterPostsID.value = ''
        offset.value = 0
        if (tagActive.value) router.push({ path: '/feeds', query: { tab: activeTab.value } })
      }
    }
    const getUserId = async () => {
      const { data: { data } } = await instance({
        url: 'user/get/data/public',
        data: {
          name: name.value,
        },
      })
      if (data) {
        activeChannel.value = data.is_active_channel && data.active_channel && true
      } else {
        error.show('user/get/data/public')
      }
    }
    const goBack = () => {
      editPostData.value = null
      edit.value = false
      // if (!this.activeTab) this.activeTab = 'popular'
    }
    const clearSearchMethod = () => {
      searchValue.value = ''
    }
    const setPath = async (type) => {
      if (route.query.tab === type) {
        return
      }
      $store.dispatch('feeds/clearPosts')
      await nextTick()
      if(route.query.tab) {
        clearSearchMethod()
      }
      if (tagActive.value) router.push({ path: '/feeds', query: { tab: type } })
      showSettings.value = false
      activeTab.value = type
      offset.value = 0
      // TODO
      await setPostFromStore()
      postsLoaded.value = false
    }
    const back = () => {
      view.value = 'allPosts'
      editPostData.value = null
    }
    const editorShow = (data) => {
      if (data) router.push(`/feeds/${data.slug}`)
    }
    const editPost = (post) => {
      editPostData.value = post
      edit.value = true
      view.value = 'addPosts'
    }
    const removeDialog = (id, channel_id) => {
      dialogRemovePost.value = true
      dataRemoveDialog.value = {
        id,
        channel_id,
      }
    }
    const infiniteHandler = async (index, done) => {
      if (postsLoaded.value || !inited.value) {
        done()
        return
      }
      if(auth.value) {
        await getAuthUserPosts()
      } else {
        await getUserPosts()
      }
      done()
    }
    const clearPosts = async () => {
      offset.value = 0
      postsLoaded.value = false
      // TODO
      posts.value = []
      await getSaveTags()
    }
    const getSaveTags = async () => {
      try {
        const { data } = await instance({
          method: 'GET',
          url: 'userfeed/tag/settings',
          params: {},
        })
        if (data.data.length) {
          savedTags.value = data.data
          showSettings.value = false
        } else {
          showSettings.value = true
        }
      } catch (e) {
        console.log('e', e)
        error.show('userfeed/tag/settings')
      }
    }
    const removePost = async () => {
      try {
        const { status } = await instance({
          method: 'delete',
          url: `/userfeed/channel/${dataRemoveDialog.value.channel_id}/post/${dataRemoveDialog.value.id}`,
        })
        if (status) {
          dialogRemovePost.value = false
          offset.value = 0
          posts.value = []
          if(auth.value) {
            await getAuthUserPosts()
          } else {
            await getUserPosts()
          }
        }
      } catch {
        error.show('/userfeed/channel')
      }
    }
    const getAuthUserPosts = async () => {
      try {
        const { data } = await instance({
          method: 'GET',
          url: 'userfeed/feed',
          params: {
            offset: offset.value,
            'filter[type]': activeTab.value === 'new' ? 'fresh' : activeTab.value,
            'filter[tag_id]': filterPostsID.value ? filterPostsID.value : null,
            search: searchValue.value !== '' ? searchValue.value : null,
          },
        })
        if (data.data.length > 0) {
          offset.value = offset.value + limit.value
          data.data.forEach((el) => {
            if (!posts.value.find(x => x.id === el.id)) {
              posts.value.push(el)
            }
          })
        }
        if (posts.value.length >= data.meta.paginate.total) {
          postsLoaded.value = true
        }
      } catch (e) {
        error.show('1 getAuthUserPosts userfeed/feed', e)
      }
    }
    const getUserPosts = async () => {
      try {
        const { data } = await api({
          method: 'GET',
          url: 'userfeed/feed',
          params: {
            offset: offset.value,
            'filter[type]': activeTab.value === 'new' ? 'fresh' : activeTab.value,
            'filter[tag_id]': filterPostsID.value ? filterPostsID.value : null,
            search: searchValue.value !== '' ? searchValue.value : null,
          },
        })
        if (data.data.length > 0) {
          offset.value = offset.value + limit.value
          data.data.forEach((el) => {
            if (!posts.value.find(x => x.id === el.id)) {
              posts.value.push(el)
            }
          })
        }
        if (posts.value.length >= data.meta.paginate.total) {
          postsLoaded.value = true
        }
      } catch (e) {
        error.show('1 getUserPosts userfeed/feed', e)
      }
    }
    const sortingPosts = async () => {
      const instanceApi = $store.state.user.auth ? instance : api
      try {
        const { data } = await instanceApi({
          method: 'GET',
          url: 'userfeed/feed',
          params: {
            offset: offset.value,
            'filter[type]': activeTab.value === 'new' ? 'fresh' : activeTab.value,
            'filter[tag_id]': filterPostsID.value ? filterPostsID.value : null,
            search: searchValue.value !== '' ? searchValue.value : null,
          },
        })
        if (data) {
          if (!data.data.length && searchValue.value !== '') {
            searchResult.value = false
          } else {
            searchResult.value = true
          }
          posts.value = [...data.data]
          if (searchValue.value !== '') {
            posts.value.forEach((item) => {
              if (item.title.toLowerCase().indexOf(searchValue.value.toLowerCase()) !== -1) {
                item.title = item.title.replace(new RegExp(searchValue.value, 'gi'), "<span class='bg-indigo-50 font-extrabold dark:bg-indigo-800'>$&</span>")
              }
              if (item.short_description.toLowerCase().indexOf(searchValue.value.toLowerCase()) !== -1) {
                item.short_description = item.short_description.replace(new RegExp(searchValue.value, 'gi'), "<span class='bg-indigo-50 font-extrabold dark:bg-indigo-800'>$&</span>")
              }
            })
          }
        }
      } catch {
        error.show('2 userfeed/feed')
      }
    }

    const setPostFromStore = () => {
      posts.value = [...$store.state.feeds.posts]
    }

    initBeforeMount()

    getUserId()

    // console.log('$store.state.feeds.posts', $store.state.feeds)
    setPostFromStore()
    return {
      hasIdTag,
      edit,
      statusText,
      activeTab,
      showSettings,
      tagActive,
      filterPosts,
      filterPostsID,
      searchValue,
      posts,
      dialogRemovePost,
      auth,
      route,
      searchResult,
      id,
      isChat,
      activeChannel,
      editPostData,
      view,
      setPath,
      takeTag,
      infiniteHandler,
      onSettings,
      goBack,
      back,
      savedTags,
      editorShow,
      removeDialog,
      removePost,
      clearPosts,
      editPost
    }
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
.dialogRemovePost__title-line {
	text-align: center;
}
</style>
