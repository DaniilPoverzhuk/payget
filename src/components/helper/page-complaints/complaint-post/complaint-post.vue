<template>
  <div class="complaint-post">
    <ChannelFullview
      v-if="post !== null"
      :id="id"
      :route-after-edit="false"
      :post-data="post"
      @removeDialog="resolveDialog = true"
    />
    <Dialog
      v-model="resolveDialog"
      :error="false"
      :is-icon="false"
      @hide="resolveDialog = false"
    >
      <RemovePost
        :id="postId"
        @hide="resolveDialog = false"
        @update="$router.push(`/complaints`)"
      />
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import ChannelFullview from 'src/components/channel/channel-fullview.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import RemovePost from 'src/components/helper/page-complaints/remove-post/remove-post.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'ComplaintPost',
  components: {
    ChannelFullview,
    Dialog,
    RemovePost,
  },
  props: {
    post: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      resolveDialog: false,
    }
  },
  computed: {
    ...mapUserState(['id']),
    postId() {
      return this.$route.params.id
    },
  },
}
</script>
