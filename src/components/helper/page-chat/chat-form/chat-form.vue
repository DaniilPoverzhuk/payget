<template>
  <form class="chat-form" :key="KeyMe" @keydown="submitOnEnterPress" @submit.prevent="addMessage()">
    <div v-if="file" class="bg-gray-50 dark:bg-gray-800 py-2 px-4 flex">
      <div class="flex self-start rounded-lg border border-gray-300 dark:border-gray-500 items-center pr-1 pl-2">
        <div class="w-28 line-clamp-1 break-all text-xs font-medium">
          {{ file.name }}
        </div>
        <button class="border-0" type="button" :title="$t('chat.deleteFile')" @click="clearFile">
          <svg v-svg class="w-4 h-4 text-gray-700 dark:text-gray-300" symbol="close" />
        </button>
      </div>
    </div>
    <div v-if="replyToMessage" class="chat-form__quote quote py-2 pl-24 pr-6 relative bg-secondary-100">
      <div class="absolute top-2 bottom-2 w-1 left-20 bg-secondary-600 rounded-lg block" />
      <button class="border-0 text-gray-500 dark:text-gray-300 cursor-pointer mt-0.5 absolute top-4 left-6" :v-text="$t('chat.deleteFile')" @click="$emit('removequote')">
        <svg v-svg class="w-6 h-6" symbol="close" />
      </button>
      <p class="text-secondary-800 text-sm">
        {{ replyToMessage.user_name }}
      </p>
      <p v-if="messageText" class="hide-text line-clamp-1 break-all text-gray-700 dark:text-gray-300 text-sm" v-html="messageText" />
      <div v-if="replyToMessage.file" class="quote__file">
        <!-- <Photoswipe>
            v-pswp="image" -->
        <div class="w-80 h-80">
          <img class="w-5 h-5 rounded object-cover" :src="image.msrc" @click="onClickImage(image.src)" />
        </div>
        <!-- </Photoswipe> -->
      </div>
    </div>
    <div
      class="relative z-1 pr-20 pl-16 chat-message-form"
      :class="{
        'chat-form-mobile border-t border-gray-100 dark:border-gray-800': isMobile,
      }"
    >
      <div class="lg:h-10 xs:h-12 w-full block absolute -z-1 inset-x-0 top-0 bg-gray-100 dark:bg-dark-primary-light" :class="{ 'top-auto bottom-0': isMobile }" />
      <label
        class="absolute w-6 h-6 left-5 overflow-hidden block cursor-pointer"
        :class="{
          'chat-form__attach_filled': file,
          'bottom-3': !isMobile,
          'top-4': isMobile,
        }"
      >
        <input v-if="uploadReady" class="absolute opacity-0 w-0 h-0 outline-none" type="file" @change="changeFile" />
        <svg v-svg class="w-6 h-6 text-gray-400 dark:text-gray-500" symbol="paper-clip" />
      </label>
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
      <button
        class="absolute h-6 w-6 border-0 right-2 blockflex text-primary cursor-pointer block hover:visible focus:visible hover:opacity-100 focus:opacity-100 z-10 transitionduration-500"
        :class="{
          'opacity-100 visible': (!(message == '<p><br></p>') && message.trim()) || file,
          'opacity-0 invisible': (!message.trim() || message == '<p><br></p>') && !file,
          'top-3': isMobile,
          'bottom-3': !isMobile,
        }"
        type="submit"
      >
        <svg v-svg symbol="paper-airplane" class="h-6 w-6 transform rotate-90 text-primary" />
      </button>
      <!--      <div-->
      <!--        v-if="uploadingFile"-->
      <!--        class="chat-form__loading"-->
      <!--      />-->
      <Dialog v-model="linkDialog" :error="false" :is-icon="false" :heading="$t('chat.inserting')" width="narrow" @hide="linkDialog = false">
        <div class="mt-6">
          <VInput v-model.trim="dataLink.selText" class="mb-6" type="text" :label="$t('chat.displayedText')" />
          <VInput v-model.trim="dataLink.selLink" class="mb-6" type="text" :label="$t('chat.address')" />
          <Button view-color="secondary" class="w-full" @click="addToolbarlink">
            {{ $t('chat.insertLink') }}
          </Button>
        </div>
      </Dialog>
    </div>
    <EmojiImg v-if="quillEmojiPreload" />
  </form>
</template>

<script>
async function loadQuill() {
  const { QuillEditor } = await import('@vueup/vue-quill')
  return QuillEditor
}
import { defineAsyncComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
let quillEmoji
if (!process.env.SERVER) {
  import('quill-emoji').then((QuillEmoji) => {
    // Далее используйте QuillEmoji как требуется
    quillEmoji = QuillEmoji
  })
}
// import quillEmoji from 'quill-emoji'
import VInput from 'src/components/extends/v-input/v-input.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import EmojiImg from './emoji-img.vue'
const QuillEditor = defineAsyncComponent(() => loadQuill())

const emojiIcon =
  '<svg class="ql-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="ql-fill" d="M18 9V7H16V2.84C14.7363 2.28427 13.3705 1.99818 11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 10.95 21.83 9.95 21.53 9H18ZM15.5 8C16.33 8 17 8.67 17 9.5C17 10.33 16.33 11 15.5 11C14.67 11 14 10.33 14 9.5C14 8.67 14.67 8 15.5 8ZM8.5 8C9.33 8 10 8.67 10 9.5C10 10.33 9.33 11 8.5 11C7.67 11 7 10.33 7 9.5C7 8.67 7.67 8 8.5 8ZM12 17.5C9.67 17.5 7.69 16.04 6.89 14H17.11C16.31 16.04 14.33 17.5 12 17.5ZM22 3H24V5H22V7H20V5H18V3H20V1H22V3Z" /></svg>'
const { mapState: mapUserState } = createNamespacedHelpers('user')
const { mapState: mapLayoutState } = createNamespacedHelpers('layout')
export default {
  name: 'ChatForm',
  components: {
    Dialog,
    VInput,
    EmojiImg,
    QuillEditor,
  },
  props: {
    newMessages: {
      type: Object,
      default: null,
    },
    replyToMessage: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      message: '',
      file: null,
      KeyMe: false,
      uploadReady: true,
      uploadingFile: false,
      linkDialog: false,
      quillEmojiPreload: false,
      dataLink: {
        selText: '',
        selLink: '',
        selTextIndex: 0,
        selTextLength: 0,
      },
      editorOption: {
        placeholder: `${this.$t('chat.messageText')}...`,
        theme: 'snow',
        modules: {
          clipboard: {
            matchVisual: false,
          },
          'emoji-toolbar': {
            buttonIcon: emojiIcon,
          },
          'emoji-shortname': true,
          toolbar: {
            container: [['bold', 'italic', 'underline', 'strike', 'link'], ['emoji']],
            handlers: {
              link: () => {
                this.getQuillText()
              },
              underline: () => {
                this.selectionChange('underline')
              },
              strike: () => {
                this.selectionChange('strike')
              },
              italic: () => {
                this.selectionChange('italic')
              },
              bold: () => {
                this.selectionChange('bold')
              },
            },
          },
        },
      },
    }
  },
  computed: {
    ...mapUserState(['id']),
    ...mapLayoutState(['isMobile']),
    image() {
      const { file } = this.replyToMessage
      if (!file) return null
      return {
        src: `${file.path_origin}`,
        msrc: `${file.path_preview}`,
        size: `${file.width}x${file.height}`,
      }
    },
    quillEditor() {
      return this.$refs.quillEditor
    },
    messageText() {
      if (!this.replyToMessage.message.trim()) return null

      const words = this.$CryptoJS.enc.Hex.parse(this.replyToMessage.message)
      const wordsEnc = words.toString(this.$CryptoJS.enc.Utf8)
      if (!wordsEnc) {
        return ''
      }

      const messageEnc = wordsEnc.split('||')
      const message = this.$CryptoJS.AES.decrypt(messageEnc[0], messageEnc[1])

      return message.toString(this.$CryptoJS.enc.Utf8)
    },
  },
  watch: {
    newMessages(newMessages) {
      if (!this.uploadingFile) return
      this.hideFileLoader(newMessages)
    },
    replyToMessage() {
      this.$refs.quillEditor?.getQuill().setSelection(this.$refs.quillEditor?.getQuill().getLength())
    },
  },
  async mounted() {
    await this.$nextTick() // for fast upload in moc
    this.quillEmojiPreload = true
  },
  methods: {
    onClickImage(url) {
      this.$viewerApi({
        images: [url],
        options: {
          toolbar: false,
          title: false,
          navbar: false,
        },
      })
    },
    onReadyQuill(q) {
      this.$refs.quillEditor?.getQuill().keyboard.bindings[13].unshift({
        key: 13,
        handler: () => false,
      })
      this.addEventShiftKey()
      q.focus()
    },
    selectionChange(type) {
      const range = this.$refs.quillEditor?.getQuill().getSelection(true)
      const format = this.$refs.quillEditor?.getQuill().getFormat(range.index, range.length)

      if (!format[type]) {
        this.$refs.quillEditor?.getQuill().formatText(range.index, range.length, type, true)
        this.$refs.quillEditor?.getQuill().format(type, true)
      } else {
        this.$refs.quillEditor?.getQuill().formatText(range.index, range.length, type, false)
        this.$refs.quillEditor?.getQuill().format(type, false)
      }
      this.$refs.quillEditor?.getQuill().setSelection(range.index + range.length, 0)
    },
    resetLinkData() {
      this.dataLink = {
        selText: '',
        selLink: '',
        selTextIndex: 0,
        selTextLength: 0,
      }
    },
    addToolbarlink() {
      const protocol = this.dataLink.selLink.match(/^(?:http(s)?:\/\/)|(\/\/)|www/) == null ? `//${this.dataLink.selLink}` : this.dataLink.selLink
      this.$refs.quillEditor?.getQuill().deleteText(this.dataLink.selTextIndex, this.dataLink.selTextLength)
      this.$refs.quillEditor?.getQuill().insertText(this.dataLink.selTextIndex, this.dataLink.selText, 'link', protocol)
      this.$refs.quillEditor?.getQuill().setSelection(this.dataLink.selTextIndex + this.dataLink.selText.length, 0)
      this.resetLinkData()
      this.linkDialog = false
    },
    getQuillText() {
      const range = this.$refs.quillEditor?.getQuill().getSelection()
      if (range) {
        this.dataLink.selText = this.$refs.quillEditor?.getQuill().getText(range.index, range.length)
        this.dataLink.selTextIndex = range.index
        this.dataLink.selTextLength = range.length
      }
      this.linkDialog = true
    },
    addEventShiftKey() {
      const keyboard = this.$refs.quillEditor?.getQuill().getModule('keyboard')

      this.$refs.quillEditor?.getQuill().keyboard.addBinding({
        key: 13,
        collapsed: true,
        shiftKey: true,
        empty: false,
      })
    },
    isValidTrimmedMessage(text) {
      return text.replace(/<.+?>/g, '')
    },
    cleanTrimmedMessage(text) {
      return text
        .replace(/(&nbsp;|\s| ){2,}/g, ' ')
        .replace(/(&nbsp;|\s| )+(?=<\/p>)|<p>((&nbsp;|\s| )|<br>)<\/p>/g, '')
        .replace(/<p>(&nbsp;|\s| )/g, '<p>') // remove same trim
    },
    async addMessage() {
      const trimmedMessage = this.cleanTrimmedMessage(this.message)
      if (!this.isValidTrimmedMessage(trimmedMessage) && !this.file) return
      const data = new FormData()
      const x = '||'
      const salt = this.$CryptoJS.lib.WordArray.random(128 / 8)
      const saltEnc = salt.toString(this.$CryptoJS.enc.Hex)
      const messageEnc = this.$CryptoJS.AES.encrypt(trimmedMessage, saltEnc) + x + saltEnc

      data.append('chat_id', this.$route.params.chat_id)

      if (trimmedMessage) {
        data.append('message', this.utf8ToHex(messageEnc))
        this.message = ''
      }

      if (this.replyToMessage !== null) {
        data.append('parent', this.replyToMessage.id)
        this.$emit('removequote')
      }

      if (this.file) {
        data.append('file', this.file)
        this.uploadingFile = true
        this.clearFile()
      }

      data.append('hash', 'true')
      this.message = ''
      this.file = null
      this.KeyMe = !this.KeyMe
      try {
        const {
          data: { status, message },
        } = await this.$instance({
          url: 'chat/message/add',
          data,
        })

        if (!status) {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show()
      }
      this.$emit('removequote')
    },
    utf8ToHex(str) {
      return [...str]
        .map((c) => {
          if (c.charCodeAt(0) < 128) {
            return c.charCodeAt(0).toString(16).padStart(2, '0')
          }

          return encodeURIComponent(c).replace(/%/g, '').toLowerCase()
        })
        .join('')
    },
    hexToUtf8(hex) {
      return decodeURIComponent('%'.concat(hex.match(/.{1,2}/g).join('%')))
    },
    submitOnEnterPress(event) {
      if (event.keyCode !== 13 || event.shiftKey || event.ctrlKey) return
      event.preventDefault()
      this.addMessage()
    },
    changeFile(event) {
      ;[this.file] = event.target.files

      if (!['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].includes(this.file.type)) {
        this.$error.show('error.attachExtensions')
        this.clearFile()
        return
      }

      if (this.file.size > 5 * 1024 * 1024) {
        this.$error.show('error.maximumFile')
        this.clearFile()
      }
    },
    async clearFile() {
      this.uploadReady = false
      this.file = null
      await this.$nextTick()
      this.uploadReady = true
    },
    hideFileLoader(newMessages) {
      const messages = Object.values(newMessages)

      if (messages.some((msg) => msg.user_id === this.id)) {
        this.uploadingFile = false
      }
    },
  },
}
</script>

<style lang="scss">
.chat-message-form {
  display: flex;
  flex-direction: column;
  .ql-toolbar.ql-snow,
  .ql-container.ql-snow {
    border: none;
    overflow: initial;
  }
  .ql-toolbar.ql-snow {
    width: max-content;
  }
  .ql-editor.ql-blank::before {
    left: 0;
  }
  .ql-editor {
    padding: 0;
  }
}
.chat-form {
  &__quote {
    p {
      a {
        color: #2563eb;
        text-decoration: underline;
      }
    }
  }
}
</style>
