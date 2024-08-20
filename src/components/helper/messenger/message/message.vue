<template>
  <div
    v-if="message"
    v-touch:longtap="optionClickedContextMenu"
    v-touch:swipe.left="optionClickedContextMenu"
    class="message w-full flex flex-col"
    :class="{
      'items-end': isOwnMassage,
      'items-start': !isOwnMassage
    }"
  >
    <Avatar
      :name="userName"
      :class-user="{'order-1 bg-secondary-100 text-yellow-400': isOwnMassage}"
      :href="id !== memberId ?`/user/${userName}` : ''"
      :avatar="message.user_media.avatar"
      :theme="isOwnMassage ? 'secondary' : 'primary'"
    />
    <div
      class="relative rounded-md py-3 pl-4 max-w-xl lg:w-max pr-16 xs:max-w-message"
      :class="{
        'bg-primary-light ml-14': !isOwnMassage,
        'bg-secondary-100 mr-12 order-1': isOwnMassage,
      }"
      @contextmenu.prevent.stop="showContextMenu($event)"
    >
      <template v-if="message.replies">
        <div
          v-for="(replies, i) in message.replies"
          :key="i"
          class="pl-4 relative "
        >
          <div
            class="absolute block absolute inset-y-0 left-0 w-1 rounded-md"
            :class="{'bg-primary': !isOwnMassage, 'bg-secondary-800': isOwnMassage}"
          />
          <p
            class="text-primary font-medium text-sm"
            :class="isOwnMassage ? 'text-secondary-800' : 'text-primary'"
          >
            {{ replies.user_id }}
          </p>
          <div
            class="text-gray-700 replies-message"
            v-html="convertText(replies.message)"
          />
          <div
            v-if="replies.file !== null"
          >
            <!-- <Photoswipe class="w-80 h-80"> -->
                <!-- v-pswp="imageReplies(replies.file).image" -->
								<div class="w-80 h-80">
									<img
										class="block w-full h-full object-cover rounded-lg"
										:src="imageReplies(replies.file).msrc"
										@click="onClickImage(imageReplies(replies.file).src)"
									>
								</div>
            <!-- </Photoswipe> -->
          </div>
        </div>
      </template>
      <!--      replies-->
      <div
        v-if="messageText"
        class="message-block text-gray-700 text-sm break-words"
        v-html="messageText"
      />
      <!-- <Photoswipe
        v-if="image"
        class="mt-3 w-80 h-80 "
      > -->
          <!-- v-pswp="image" -->
					<div class="w-80 h-80" v-if="image">
						<img
							class="w-full h-full object-cover rounded-lg"
							:src="image.msrc"
							@click="onClickImage(image.src)"
						>
					</div>
      <!-- </Photoswipe> -->

      <time class="absolute bottom-3 right-4 text-sm text-gray-400">{{ messageTime }}</time>
    </div>
    <Teleport to="body">
      <vue-simple-context-menu
        :ref="'contextMenuRef'"
        :element-id="`myFirstMenu-${message.id}`"
        :options="optionsContextMenu"
        @option-clicked="optionClickedContextMenu"
      />
    </Teleport>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { format } from 'date-fns'
import { USER_ROLE } from 'src/constants'
import Avatar from 'src/components/extends/avatar/avatar.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

const {
  ADMIN, MODERATOR,
} = USER_ROLE

export default {
  name: 'Message',
  components: {
    Avatar
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    members: {
      type: Array,
      required: true,
    },
    sameAuthor: {
      type: Boolean,
      default: false,
    },
    public: {
      type: Boolean,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      optionsContextMenu: [
        {
          name: this.$t('button.answer'),
          slug: 'edit',
        },
      ],
    }
  },
  computed: {
    ...mapUserState(['id', 'role']),
    isOwnMassage() {
      return this.message.user_id === this.id
    },
    messageText() {
      if (!this.message.message.trim()) return null
      return this.convertText(this.message.message)
    },
    userName() {
      const member = this.members && this.message && this.members.find(member => member.user.id === this.message.user_id)
      return member && member.user.name
    },
    messageTime() {
      return format(this.$getDateInMs(this.message.created), 'HH:mm')
    },
    // messageAuthorRole() {
    //   if (this.message.user_id === this.messageId) return false
    //   const author = this.members.find(member => member.user.id === this.message.user_id)
    //   if (author.role === 'moderator') return 'conversation.moderator'
    //   console.log(author.role)
    //   if (author.role === 'admin') return 'conversation.administrator'
    //   return false
    // },
    image() {
      const { file } = this.message
      if (!file) return null
      return this.getImages(file)
    },
    memberId() {
      const author = this.members.find(member => member.user.id === this.message.user_id)
      if (!author) return false
      if (author.role === ADMIN || author.role === MODERATOR || this.public) {
        return false
      }
      return this.message.user_id
    },
  },
  methods: {
    onClickImage(url) {
      this.$viewerApi({
        images: [url],
        options: {
          toolbar: false,
          title: false,
          navbar: false
        }
      })
    },
    getImages(file) {
      return {
        src: `${file.path_origin}`,
        msrc: `${file.path_preview}`,
        size: `${file.width}x${file.height}`,
      }
    },
    imageReplies(file) {
      return this.getImages(file)
    },
    convertText(text) {
      const words = this.$CryptoJS.enc.Hex.parse(text)
      const wordsEnc = words.toString(this.$CryptoJS.enc.Utf8)
      if (!wordsEnc) {
        return ''
      }
      const messageEnc = wordsEnc.split('||')
      const message = this.$CryptoJS.AES.decrypt(messageEnc[0], messageEnc[1])
      return message.toString(this.$CryptoJS.enc.Utf8)
    },
    showContextMenu(event) {
      if (this.$matchMedia.desktop) {
        this.$refs.contextMenuRef.showMenu(event, this.message.id)
      }
    },
    optionClickedContextMenu() {
      this.$emit('setQuote', this.message.id)
    },
  },
}
</script>

<style lang="scss">
.message {
	.replies-message {
		-ms-text-overflow: ellipsis;
		-o-text-overflow: ellipsis;
		text-overflow: ellipsis;
		overflow: hidden;
		-ms-line-clamp: 3;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		display: flex;
		display: -webkit-box;
		word-wrap: break-word;
		-webkit-box-orient: vertical;
		box-orient: vertical;
	}
  .message-block {
    a {
      color: #2563eb;
      text-decoration: underline;
    }
  }
}
.vue-simple-context-menu {
  &.vue-simple-context-menu--active {
    background-color: #fff;
    .vue-simple-context-menu__item {
      display: flex;
      color: var(--c-gray-70);
      cursor: pointer;
      padding: 8px 12px;
      align-items: center;
      &:hover {
        color: white
      }
    }
  }
}
</style>