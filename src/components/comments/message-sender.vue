<template>
  <form class="message-sender-wrap" @keydown="submitOnEnterPress" @submit.stop>
    <button
      class="send-btn ml-2 h-6 w-6 border-0 right-2 blockflex text-primary cursor-pointer block hover:visible focus:visible hover:opacity-100 focus:opacity-100 z-10 transitionduration-500"
      :class="{
        'top-3': isMobile,
        'bottom-3': !isMobile,
      }"
      :disabled="!message.trim() || message == '<p><br></p>'"
      @click="onSend"
      type="button"
    >
      <svg
        v-svg
        symbol="paper-airplane"
        class="h-6 w-6 transform rotate-90 text-primary"
      />
    </button>
    <QuillEditor
      ref="quillEditor"
      v-model:content="message"
      contentType="html"
      class="notranslate relative w-full"
      :max-height="158"
      rows="1"
      :options="editorOption"
      autofocus
      @ready="onReadyQuill"
    />
    <input
      class="editor-text__file"
      type="file"
      ref="getFile"
      @change="uploadFile($event)"
    />
    <img
      v-if="quillEmojiPreload"
      class="invisible w-0 h-0 absolute -z-1"
      src="~assets/img/emojis.png"
    />
    <CommentUserAvatar :src="avatar" />
  </form>
  <div
    class="editor-text__error"
    v-if="errorForFile"
    v-text="errorForFile"
  ></div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import CommentUserAvatar from './comment-user-avatar.vue'
async function loadQuill() {
  const { QuillEditor } = await import('@vueup/vue-quill')
  return QuillEditor
}
async function loadImageBlotFormat() {
  const Quill = await import('quill')
  const InlineBlot = Quill.default.import('blots/block')

  class ImageBlot extends InlineBlot {
    static create(data) {
      const node = super.create(data)
      node.setAttribute('data-img-id', data.id)
      node.setAttribute('src', data.url)
      return node
    }

    static value(domNode) {
      const { src, custom } = domNode.dataset
      return { src, custom }
    }
  }

  ImageBlot.blotName = 'imageBlot'
  ImageBlot.tagName = 'img'
  if (!Quill.default.import('formats/imageBlot')) {
    Quill.default.register(ImageBlot)
  }
  return ImageBlot
}
let quillEmoji
if (!process.env.SERVER) {
  import('quill-emoji').then((QuillEmoji) => {
    // Далее используйте QuillEmoji как требуется
    quillEmoji = QuillEmoji
  })
}
const QuillEditor = defineAsyncComponent(() => loadQuill())

const emojiIcon =
  '<svg class="ql-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="ql-fill" d="M18 9V7H16V2.84C14.7363 2.28427 13.3705 1.99818 11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 10.95 21.83 9.95 21.53 9H18ZM15.5 8C16.33 8 17 8.67 17 9.5C17 10.33 16.33 11 15.5 11C14.67 11 14 10.33 14 9.5C14 8.67 14.67 8 15.5 8ZM8.5 8C9.33 8 10 8.67 10 9.5C10 10.33 9.33 11 8.5 11C7.67 11 7 10.33 7 9.5C7 8.67 7.67 8 8.5 8ZM12 17.5C9.67 17.5 7.69 16.04 6.89 14H17.11C16.31 16.04 14.33 17.5 12 17.5ZM22 3H24V5H22V7H20V5H18V3H20V1H22V3Z" /></svg>'
const { mapState: mapLayoutState } = createNamespacedHelpers('layout')
const { mapState: mapUserState } = createNamespacedHelpers('user')
export default {
  name: 'MessageSender',
  components: {
    QuillEditor,
    CommentUserAvatar,
  },
  emits: ['onComment'],
  props: {
    isAutoFocus: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      message: '',
      quillEmojiPreload: false,
      errorForFile: '',
      editorOption: {
        placeholder: `${this.$t('chat.messageText')}...`,
        allowedTags: ['span', 'p', 'h2', 'a', 'u', 'em', 's'],
        formats: ['image', 'emoji'],
        modules: {
          clipboard: {
            matchVisual: false,
          },
          'emoji-toolbar': {
            buttonIcon: emojiIcon,
          },
          'emoji-shortname': true,
          toolbar: {
            container: [['image', 'emoji']],
            handlers: {
              image: () => {
                this.$refs.getFile.click()
              },
            },
          },
        },
      },
      accessFormatImage: ['image/png', 'image/jpeg', 'image/gif'],
    }
  },
  watch: {
    value() {
      this.message = this.value || ''
    },
  },
  computed: {
    ...mapLayoutState(['isMobile']),
    ...mapUserState(['media']),
    avatar() {
      return this.media.avatar
    },
  },
  created() {
    this.quillEmojiPreload = true
  },
  methods: {
    async onReadyQuill(q) {
      if (this.value) {
        this.message = this.value
        // TODO
        // const ImageBlot = await loadImageBlotFormat()
        // this.$refs.quillEditor.getQuill().options.formats = {
        //   imageBlot: ImageBlot,
        // }
      }
      if (this.isAutoFocus) {
        q.focus()
      }
    },
    submitOnEnterPress(event) {
      if (event.keyCode !== 13 || (event.keyCode === 13 && !event.ctrlKey)) {
        return
      }
      event.preventDefault()
      this.onSend()
    },
    uploadFile(e) {
      this.errorForFile = ''
      const file = e.target.files[0]
      if (!file) return false

      if ((file.size / 1000000).toFixed(2) >= 5) {
        // mb
        this.errorForFile = this.$t('error.maximumFile')
        return false
      }
      if (!this.accessFormatImage.includes(file.type)) {
        this.errorForFile = this.$t('error.extensionsAvailable')
        return false
      }
      const form = new FormData()
      form.append('image', file)
      this.fetchImagesPath(form)
    },
    async fetchImagesPath(form) {
      try {
        const data = await this.$instance
          .post('/userfeed/post/image', form, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((data) => {
            if (data.data.url) {
              console.log('data.data.url', data.data.url)
            }
          })
      } catch (err) {
        console.error(err)
      }
    },
    onSend() {
      this.$emit('onComment', this.message)
      this.message = '<p></p>'
    },
  },
}
</script>

<style lang="scss">
.message-sender-wrap {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  align-items: center;
  margin-bottom: 12px;
  .send-btn {
    padding-top: 2px;
    margin-bottom: auto;
  }
  .ql-container.ql-snow {
    border: none;
    overflow: initial;
    border-radius: 8px;
    padding: 0;
    max-height: 300px;
    max-width: calc(100% - 93px);
    a {
      &.info__text.link {
        text-decoration: none;
        display: inline-flex;
        font-weight: var(--fw-500);
        color: var(--q-primary);
      }
    }
  }
  .ql-toolbar.ql-snow + .ql-container.ql-snow {
    border: 1px solid var(--c-gray-15);
    transition: 0.15s linear;
    min-height: 45px;
    &:hover,
    &:focus-within {
      border-color: var(--c-primary);
    }
  }
  .ql-toolbar.ql-snow {
    width: max-content;
    padding: 0;
    border: none;
    z-index: 1;
    position: absolute;
    right: 0;
    top: 1px;
    .ql-formats {
      margin-right: 0;
    }
  }
  .ql-editor.ql-blank::before {
    left: 12px;
    right: 12px;
  }
  .ql-editor {
    padding: 4px 40px 4px 12px;
    max-height: 292px;
    max-width: 100%;
  }
}
</style>
