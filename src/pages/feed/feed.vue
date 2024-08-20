<template>
<div class="feeds mt-10 mx-5">
    <div class="feeds__wrap" :class="route.params.chat_id ? 'tab' : ''">
        <router-link v-slot="{href, navigate,}" :to="backRoute"><span class="feeds__go-back" :href="href" @click="navigate"><svg class="feeds__icon text-gray-300 dark:text-gray-500" v-svg aria-hidden="true" size="18 17" symbol="back-arrow"></svg>{{$t('feeds.backFeed')}}</span></router-link>
        <EditorChannel v-if="edit" :id="id" :editPostData="editPostData" :channelId="editPostData.id" @editorShow="editorShow" :view="view"></EditorChannel>
        <div class="feeds__item" v-if="!edit">
            <ChannelFullview v-if="fullPostsId !== null" :id="id" :postData="fullPostsId" :feed="true" :routeAfterEdit="false" @removeDialog="dialogRemovePost = true" @editPost="editPost(fullPostsId)"></ChannelFullview>
        </div>
    </div>
    <Dialog v-model="dialogRemovePost" classCustom="dialogRemovePost" @hide="dialogRemovePost = false">
        <h2 class="dialogRemovePost__title">
          {{$t('channel.deletePostQ')}}&nbsp;<span class="dialogRemovePost__title-line">{{$t('channel.cannotUndone')}}</span>
        </h2>
        <div class="dialogRemovePost__wrap">
          <button class="button button_type_info dialogRemovePost__btn" @click="dialogRemovePost = false">{{$t('button.cancel')}}</button>
          <button class="button button_type_success dialogRemovePost__btn" @click="removePost()">{{$t('button.remove')}}</button>
        </div>
    </Dialog>
</div>
</template>

<script>
import { createNamespacedHelpers, useStore } from 'vuex'
import ChannelFullview from 'src/components/channel/channel-fullview.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'
import EditorChannel from 'src/components/editor-channel/editor-channel.vue'
import {computed, ref} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, instance } from 'boot/axios'
import error from 'src/error.js'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Feed',
  components: {
    ChannelFullview,
    EditorChannel,
    Dialog,
  },
  props: {
    activeTab: {
      type: String,
      default: 'popular'
    }
  },
  preFetch({ store, currentRoute }) {
    return store.dispatch('feeds/getPosts', currentRoute)
  },
  setup(props) {
    const $store = useStore()
    const $router = useRouter()
    const route = useRoute()
    const edit = ref(false)
    const fullPostsId = ref(null)
    const dialogRemovePost = ref(false)
    const editPostData = ref(null)
    const id = computed(() => $store.state.user.id)
    const auth = computed(() => $store.state.user.auth)
    const backRoute = computed(() => `/feeds?tab=${props.activeTab}`)
    const editorShow = (data) => { $router.push(`/feeds/${data.slug}`) }
    const editPost = (post) => {
      editPostData.value = post
      edit.value = true
    }
    const getUserPost = async () => {
      if($store.state.feeds.fullPostsId) {
        fullPostsId.value = $store.state.feeds.fullPostsId
      } else {
        $router.push('/')
      }
    }
    const removePost = async () => {
      try {
        const { status, data } = await instance({
          method: 'delete',
          url: `/userfeed/channel/${fullPostsId.value.channel.id}/post/${fullPostsId.value.id}`,
        })
        if (status) {
          dialogRemovePost.value = false
          $router.push('/feeds')
        }
      } catch (e) {
        error.show(e)
      }
    }
    getUserPost()
    return {
      route,
      edit,
      fullPostsId,
      dialogRemovePost,
      editPostData,
      id,
      auth,
      backRoute,
      editorShow,
      editPost,
      getUserPost,
      removePost
    }
  },
}
</script>

