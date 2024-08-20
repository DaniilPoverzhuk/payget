<template>
  <div class="comments">
    <div class="comments__header mb-2">
      {{ $t('user.comments') }} ({{ count }})
    </div>
    <div class="sender-wrap">
      <MessageSender @onComment="onComment" v-if="isClient" />
    </div>
    <Comment
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      @updateCount="onUpdateCount"
    ></Comment>
    <ShowMore
      v-if="isShowMore"
      :loading="loading"
      class="show-more"
      @click="getComments"
    />
  </div>
</template>

<script setup>
import Comment from './comment.vue'
import MessageSender from './message-sender.vue'
import ShowMore from './show-more.vue'
import { computed, onMounted, ref } from 'vue'
import { instance } from 'boot/axios'
import error from 'src/error.js'

const props = defineProps({
  count: {
    type: Number,
    default: 0,
  },
  postId: {
    type: Number,
    default: 0,
  },
})

const comments = ref([])
const page = ref({
  total: 0,
  offset: 0,
  limit: 20,
})
const loading = ref(false)
const isShowMore = computed(() => comments.value.length < page.value.total)
const emit = defineEmits(['updateCount'])

onMounted(() => {
  getComments()
})

const getComments = async () => {
  loading.value = true
  try {
    const { data, status } = await instance({
      url: `/userfeed/comment/post/${props.postId}`,
      method: 'GET',
      params: {
        offset: page.value.offset,
        limit: page.value.limit,
      },
    })
    if (data.data && data.data.length) {
      comments.value.push(...data.data)
    }
    if (data.meta.paginate) {
      page.value.total = data.meta.paginate.total
      page.value.offset += page.value.limit
    }
  } catch (e) {
    console.log(`Error /userfeed/comment/post/${props.postId}`, e)
  } finally {
    loading.value = false
  }
}

const isClient = ref(typeof window !== 'undefined')

const onComment = async (message) => {
  console.log('onComment', message)
  try {
    const { data, status } = await instance({
      url: '/userfeed/comment',
      data: {
        post_id: props.postId,
        comment: message,
      },
    })
    if (data.data) {
      comments.value.unshift(data.data)
      emit('updateCount')
    }
    console.log('data, status', data, status)
  } catch (e) {
    console.log('Error /userfeed/comment', e)
    if (e.response.data.status == 'failure') {
      error.show(e.response.data.messages.comment[0])
    } else {
      error.show(e.response.data || 'Error')
    }
  }
}
const onUpdateCount = () => {
  emit('updateCount')
}
</script>

<style lang="scss" scoped>
.comments {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--c-gray-20);
  padding-top: 20px;
  margin-top: 10px;
  gap: 10px;
  &__header {
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
  }
  .sender-wrap {
    border-bottom: 1px solid var(--c-gray-20);
    padding-bottom: 30px;
    margin-bottom: 10px;
  }
  .show-more {
    font-size: 14px;
    color: var(--c-primary);
    cursor: pointer;
    display: flex;
    gap: 12px;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
