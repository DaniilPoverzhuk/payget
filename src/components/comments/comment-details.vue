<template>
  <h3 class="mb-2">
    {{ comment.reply_to ? 'Ответ на комментарий' : 'Комментарий' }}
  </h3>
  <div class="comment-wrap_details">
    <div v-if="isView" class="title-post">
      <router-link :to="`/feeds/${comment.post.slug}`">{{
        comment.post.title
      }}</router-link>
    </div>
    <div
      class="comment"
      :class="{ 'is-parent': !comment.reply_to, 'is-reply': comment.reply_to }"
    >
      <div class="comment__avatar">
        <!-- <img :src="comment.user.media.avatar" /> -->
        <CommentUserAvatar :src="viewComment.user.media.avatar" />
      </div>
      <div class="comment__body">
        <div class="comment__body-title">
          <div class="comment__body-title user-name">
            {{ viewComment.user.name }}
            <svg
              class="info__verified text-primary flex-shrink-0"
              v-if="viewComment.user.is_verified"
              v-svg
              size="20"
              symbol="verified"
            ></svg>
          </div>
          <div class="comment__body-title comment-date">
            {{ getFormattedDate }}
          </div>
          <svg
            @click="reply(false)"
            v-if="!getRemovedDate && !isView"
            class="ml-2 reply"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.03774 15.8033C7.35857 11.6274 10.8592 12.8162 10.8592 12.8162V15.4488C10.8568 15.5837 10.8939 15.7165 10.9662 15.8305C11.0384 15.9445 11.1425 16.0349 11.2655 16.0903C11.3886 16.1458 11.5252 16.1639 11.6585 16.1425C11.7917 16.121 11.9158 16.061 12.0152 15.9697L17.8989 10.521C17.9702 10.4542 18.0271 10.3736 18.066 10.284C18.1049 10.1944 18.125 10.0977 18.125 10C18.125 9.90233 18.1049 9.80568 18.066 9.71607C18.0271 9.62646 17.9702 9.54579 17.8989 9.47908L12.0152 4.03033C11.9158 3.93908 11.7917 3.87901 11.6585 3.85757C11.5252 3.83613 11.3886 3.85426 11.2655 3.90972C11.1425 3.96518 11.0384 4.05552 10.9662 4.16955C10.8939 4.28359 10.8568 4.41631 10.8592 4.55126V7.18386H9.4771C7.44209 7.20292 5.49798 8.0295 4.07235 9.48181C2.64672 10.9341 1.85633 12.8932 1.87502 14.9282V15.2927C1.87262 15.4284 1.9104 15.5618 1.98361 15.676C2.05681 15.7903 2.16217 15.8804 2.28644 15.935C2.4107 15.9896 2.54833 16.0062 2.68201 15.9827C2.81568 15.9593 2.93945 15.8968 3.03774 15.8033Z"
              fill="#C8C6D0"
            />
          </svg>
        </div>
        <div class="comment__body-content" v-html="viewComment.comment"></div>
        <div class="comment__body-removed" v-if="getRemovedDate">
          {{ getRemovedDate }}
        </div>
        <div v-if="embedHtml" v-html="embedHtml"></div>
        <CommentActions
          v-if="!getRemovedDate"
          @reply="reply"
          @edit="edit"
          @remove="remove"
          @complain="wantComplaintPost"
          @like="setReaction('like')"
          @dislike="setReaction('dislike')"
          :reactions="viewComment.reactions"
          :current-reacted="currentReacted"
          :is-self="isSelfComment"
          :is-can-edit="isCanEdit"
          :is-view="isView"
          :user-name="viewComment.user.name"
        >
          <template #comment v-if="comment.reply_to">
            <router-link
              :to="`/user/${viewComment.user.name}/comments/${viewComment.id}`"
              >Перейти</router-link
            >
          </template>
        </CommentActions>
        <div class="comment__body-message mt-2">
          <MessageSender
            @onComment="onComment"
            isAutoFocus
            v-if="isClient && isActiveSender"
            :value="message"
          />
        </div>
        <div class="comment__childrens" v-if="props.comment.reply_to">
          <Comment
            :key="props.comment.id"
            :comment="props.comment"
            :is-parent="false"
            is-view
            is-details
          ></Comment>
        </div>
      </div>
    </div>
  </div>
  <Dialog
    v-model="dialogRemoveComment"
    classCustom="dialogRemoveComment"
    @hide="dialogRemoveComment = false"
  >
    <h2 class="dialogRemoveComment__title">
      {{ $t('channel.deleteCommentQ') }}
    </h2>
    <div class="dialogRemoveComment__title-line">
      {{ $t('channel.cannotUndone') }}
    </div>
    <div class="dialogRemoveComment__wrap">
      <button
        class="button button_type_info dialogRemoveComment__btn"
        @click="dialogRemoveComment = false"
      >
        {{ $t('button.cancel') }}</button
      ><button
        class="button button_type_success dialogRemoveComment__btn"
        @click="removeComment"
      >
        {{ $t('button.remove') }}
      </button>
    </div>
  </Dialog>
  <Dialog
    v-model="complaintComment"
    classCustom="complaintComment"
    @hide="complaintComment = false"
  >
    <CommentComplaint
      :postCommentId="comment.id"
      @hide="complaintComment = false"
      :userId="comment.post.user.id"
      :types="typesComplaint"
    ></CommentComplaint>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { formatDistance, format } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { useI18n } from 'vue-i18n'
import { instance } from 'boot/axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { USER_ROLE } from 'src/constants'
import MessageSender from './message-sender.vue'
import CommentActions from './comment-actions.vue'
import Comment from './comment.vue'
import CommentUserAvatar from './comment-user-avatar.vue'
import ShowMore from './show-more.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'
import CommentComplaint from './comment-complaint.vue'
import error from 'src/error.js'

const props = defineProps({
  isParent: {
    type: Boolean,
    default: true,
  },
  isView: {
    type: Boolean,
    default: false,
  },
  comment: {
    id: Number,
    comment: String,
    reply_to: null,
    replies: Number,
    thread: String,
    current_reacted: String,
    post: {
      id: Number,
      title: String,
      slug: String,
      short_description: String,
      user: {
        id: Number,
        name: String,
        media: {
          avatar: String,
          banner: String,
        },
        is_verified: Boolean,
      },
      cover: String,
    },
    user: {
      id: Number,
      name: String,
      media: {
        avatar: String,
        banner: String,
      },
      is_verified: Boolean,
    },
    reactions: {
      like: {
        type: Number,
        default: 0,
      },
      dislike: {
        type: Number,
        default: 0,
      },
    },
    created_at: Date,
    deleted_at: Date,
  },
})

const { ADMIN, MODERATOR } = USER_ROLE

const emit = defineEmits(['updateCount'])

const childrenComments = ref([])

const viewComment = computed(() => props.comment.reply_to || props.comment)

const { locale } = useI18n({ useScope: 'global' })
const isRu = computed(() => locale.value == 'ru-RU')
const $store = useStore()
const $router = useRouter()
const message = ref('')
const embedHtml = ref('')
const isClient = ref(typeof window !== 'undefined')
const isActiveSender = ref(false)
const isReplyUser = ref(false)
const isEdit = ref(false)
const dialogRemoveComment = ref(false)
const complaintComment = ref(false)
const currentReacted = ref(props.comment.current_reacted || '')
const typesComplaint = ref([])
const page = ref({
  total: 0,
  offset: 0,
  limit: 20,
})
const loading = ref(false)
const currentUser = computed(() => $store.state.user)
const isSelfComment = computed(
  () => currentUser.value.id == viewComment.value.user.id
)
const isCanEdit = computed(
  () =>
    currentUser.value.role == MODERATOR ||
    currentUser.value.role == ADMIN ||
    isSelfComment.value
)
const isShowMore = computed(
  () => childrenComments.value.length < page.value.total
)

const checkOnYoutube = () => {
  // Проверяем, есть ли в сообщении ссылка на YouTube
  const youtubeUrlRegex =
    /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
  const youtubeUrlMatch = message.value.match(youtubeUrlRegex)

  if (youtubeUrlMatch) {
    const youtubeUrl = youtubeUrlMatch[0]
    const youtubeId = youtubeUrlMatch[1]

    // Получаем информацию о видеоролике с использованием API YouTube
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&key=AIzaSyBvmujxX-nHIq3XjwF9zmkL5Ji8aE-hW0M&part=snippet`
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const videoTitle = data.items[0].snippet.title
        const videoThumbnailUrl = data.items[0].snippet.thumbnails.medium.url

        // Сформировываем HTML-код для встраивания видеоролика
        const embedHtmlEl = `
          <div class="embed-responsive embed-responsive-16by9">
            <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${youtubeId}" allowfullscreen></iframe>
          </div>
        `

        const videoImage = `<div>Title: ${videoTitle}</div><img src=${videoThumbnailUrl} />`

        // Замещаем ссылку на видеоролик в сообщении на сформированный HTML-код
        const messageHtml = message.value.replace(
          youtubeUrl,
          embedHtmlEl + youtubeUrl
        )
        embedHtml.value = messageHtml
      })
  }
}

watch(message, () => {
  console.log('checkOnYoutube')
  checkOnYoutube()
})

const getFormattedDate = computed(() =>
  formatDistance(new Date(viewComment.value.created_at + 'Z'), new Date(), {
    addSuffix: true,
    locale: locale.value == 'ru-RU' ? ru : enUS,
  })
)

const getRemovedDate = computed(() => {
  if (viewComment.value.deleted_at) {
    const deleteDate = props.comment.deleted_at.endsWith('Z')
      ? viewComment.value.deleted_at
      : viewComment.value.deleted_at + 'Z'
    return formatDistance(new Date(deleteDate), new Date(), {
      addSuffix: true,
      locale: locale.value == 'ru-RU' ? ru : enUS,
    })
  } else {
    return ''
  }
})

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
      complaintComment.value = true
    }
  } catch (e) {
    error.show(e)
  }
}

const wantComplaintPost = () => {
  if (currentUser.value.role == null) {
    $router.push('/')
  } else {
    complaintType()
  }
}

const getCommentThread = async () => {
  loading.value = true
  try {
    const { data, status } = await instance({
      url: '/userfeed/comment/thread',
      method: 'GET',
      params: {
        thread_id: props.comment.thread,
        offset: page.value.offset,
        limit: page.value.limit,
      },
    })
    if (data.data && data.data.length) {
      childrenComments.value.push(...data.data)
    }
    if (data.meta.paginate) {
      page.value.total = data.meta.paginate.total
      page.value.offset += page.value.limit
    }
  } catch (e) {
    console.log('Error /userfeed/comment/thread', e)
  } finally {
    loading.value = false
  }
}

const onComment = async (message) => {
  console.log('onComment', message)
  const replyUser = isReplyUser.value
    ? `<a class="info__text link" href="/user/${props.comment.user.name}">${props.comment.user.name}</a>, `
    : ''
  const firstPart = message.slice(0, 3)
  const secondPart = message.slice(3)
  message = firstPart.concat(replyUser, secondPart)
  try {
    const { data, status } = await instance({
      url: '/userfeed/comment',
      data: {
        post_id: props.comment.post.id,
        comment: message,
        reply_to_comment: props.comment.id,
      },
    })
    if (data.data) {
      childrenComments.value.unshift(data.data)
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
  } finally {
    isReplyUser.value = false
  }
}

const edit = () => {
  isEdit.value = true
  message.value = props.comment.comment
  isActiveSender.value = true
}

const reply = (replyToUser = true) => {
  isActiveSender.value = true
  if (replyToUser) {
    isReplyUser.value = true
  }
}

const remove = () => {
  console.log('remove', props.comment.id)
  dialogRemoveComment.value = true
}

const setReaction = async (type) => {
  try {
    const { data, status } = await instance({
      url: `/userfeed/comment/${type}`,
      data: {
        comment_id: props.comment.id,
      },
    })
    if (data.data) {
      props.comment.reactions = data.data.count.length
        ? {}
        : { ...data.data.count }
      currentReacted.value =
        Object.keys(data.data.count)[0] && type !== currentReacted.value
          ? type
          : ''
    }
  } catch (e) {
    console.log('Error /userfeed/comment/like', e)
  }
}

const like = async () => {
  console.log('like')
  try {
    const { data, status } = await instance({
      url: '/userfeed/comment/like',
      data: {
        comment_id: props.comment.id,
      },
    })
    console.log('data', data)
    if (Array.isArray(data.data.count)) {
      props.comment.reactions.like = 0
    } else {
      props.comment.reactions.like = data.data.count.like
    }
    console.log('data, status', data, status)
  } catch (e) {
    console.log('Error /userfeed/comment/like', e)
  }
}

const dislike = async () => {
  console.log('dislike')
  try {
    const { data, status } = await instance({
      url: '/userfeed/comment/dislike',
      data: {
        comment_id: props.comment.id,
      },
    })
    console.log('data', data)
    if (Array.isArray(data.data.count)) {
      props.comment.reactions.dislike = 0
    } else {
      props.comment.reactions.dislike = data.data.count.dislike
    }
    console.log('data, status', data, status)
  } catch (e) {
    console.log('Error /userfeed/comment/dislike', e)
  }
}

const removeComment = async () => {
  try {
    const { data, status } = await instance({
      method: 'delete',
      url: `/userfeed/comment/${props.comment.id}`,
    })
    props.comment.comment = 'Комментарий удален'
    props.comment.deleted_at = new Date().toISOString()
    dialogRemoveComment.value = false
  } catch (e) {
    console.log('Error delete /userfeed/comment/', e)
    error.show('You can not remove this comment')
  }
}

if (props.comment.thread && props.comment.reply_to == null && props.isParent) {
  console.log('props.comment.thread', props.comment.thread)
  getCommentThread()
}
</script>

<style lang="scss" scoped>
.comment-wrap_details {
  display: flex;
  flex-direction: column;
  .title-post {
    padding: 4px 12px;
    font-size: 18px;
    border-bottom: 1px solid var(--c-gray-20);
    margin-bottom: 10px;
    background-color: var(--c-gray-10);
  }
  .comment {
    display: flex;
    gap: 15px;
    &__avatar {
      width: 45px;
      height: 45px;
      min-width: 45px;
      min-height: 45px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    &__body {
      flex-grow: 1;
      max-width: calc(100% - 60px);
      &-title {
        display: flex;
        gap: 5px;
        align-items: center;
        .reply {
          cursor: pointer;
          transition: 0.15s linear;
          &:hover {
            filter: brightness(0.5);
          }
        }
        &.user-name {
          font-weight: 600;
          font-size: 16px;
          line-height: 18px;
          display: flex;
          align-items: center;
          gap: 2px;
          .info__verified {
            margin-left: 0;
            transform: translateY(0);
          }
        }
        &.comment-date {
          font-size: 14px;
          line-height: 17px;
          color: var(--c-gray-20);
        }
      }
      &-content {
        line-height: 20px;
        margin: 7px 0;
      }
      &-removed {
        font-size: 13px;
        line-height: 1;
        color: var(--c-gray-70);
      }
    }
    &__childrens {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>

<style lang="scss">
.comment {
  &-wrap_details {
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--c-gray-10);

    @media (--desktop) {
      padding: 24px;
      border-radius: 8px;
    }
  }
  .comment__body {
    .comment__body-content {
      .info__text {
        display: inline-flex;
        font-weight: var(--fw-500);
        color: var(--q-primary);
      }
    }
  }
}
.dialogRemoveComment {
  padding-left: 5px;
  padding-right: 5px;
  max-width: 476px;

  .dialogRemoveComment__title,
  .dialogRemoveComment__wrap {
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
