<template>
  <div class="emoji">
    <div class="emoji__abilities">
      <div v-if="isClient">
        <EmojiPicker @select="handleEmojiClick" />
      </div>
      <div class="emoji__abilities-forms">
        <form>
          <div ref="editable" class="border-gray-100 border-2 focus:outline-0 min-h-12 py-3 px-5 w-full max-w-52 break-all whitespace-pre-wrap text-xs" contenteditable></div>
          <Button view-color="primary" @click="sendMessage">Отправить сообщение</Button>
        </form>
        <form>
          <VInput placeholder="Введите id чата..." v-model="chatId.current" />
          <Button type="button" view-color="primary" @click="joinChannel">Присоединиться</Button>
        </form>
      </div>
    </div>
    <div class="emoji__track">
      <ul>
        <li v-for="message in messages" :key="message.id" v-html="convertMessage(message.message)" />
      </ul>
    </div>
  </div>
  {{ isMobile }}
</template>
<script lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { findIndex } from 'lodash'

import VInput from 'src/components/extends/v-input/v-input.vue'
import Button from 'src/components/extends/button/button.vue'

import 'vue3-emoji-picker/css'

// const contenteditableRef = ref()

export default {
  data: () => ({
    chatId: {
      prev: null,
      current: null,
    },
    messages: [],
    message: '',
    isMobile: false,
  }),
  components: {
    VInput,
    Button,
    EmojiPicker: defineAsyncComponent(() => import('vue3-emoji-picker')),
  },
  mounted() {
    this.onResize()

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize)
    }
  },
  computed: {
    isClient() {
      return typeof window !== 'undefined'
    },
  },
  methods: {
    onResize() {
      return (this.isMobile = innerWidth <= 540)
    },
    convertMessage(message) {
      const wordArray = this.$CryptoJS.enc.Hex.parse(message)
      const utf8 = this.$CryptoJS.enc.Utf8
      const wordsEnc = wordArray.toString(utf8)

      if (!wordsEnc) return ''

      const messageEnc = wordsEnc.split('||')
      const convertedMessage = this.$CryptoJS.AES.decrypt(messageEnc[0], messageEnc[1]).toString(utf8)

      return convertedMessage
    },
    cleanTrimmedMessage(text) {
      return text
        .replace(/(&nbsp;|\s| ){2,}/g, ' ')
        .replace(/(&nbsp;|\s| )+(?=<\/p>)|<p>((&nbsp;|\s| )|<br>)<\/p>/g, '')
        .replace(/<p>(&nbsp;|\s| )/g, '<p>')
    },
    isValidTrimmedMessage(text) {
      return text.replace(/<.+?>/g, '')
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
    async sendMessage() {
      const trimmedMessage = this.cleanTrimmedMessage(this.message)

      if (!this.isValidTrimmedMessage(trimmedMessage) && !this.file) return

      const data = new FormData()
      const salt = this.$CryptoJS.lib.WordArray.random(128 / 8)
      const saltEnc = salt.toString(this.$CryptoJS.enc.Hex)
      const messageEnc = this.$CryptoJS.AES.encrypt(trimmedMessage, saltEnc) + '||' + saltEnc

      data.append('chat_id', this.chatId.current)
      data.append('hash', 'true')

      if (trimmedMessage) {
        data.append('message', this.utf8ToHex(messageEnc))
      }

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

        this.message = ''
      } catch (e) {
        this.$error.show()
      }
    },
    handleEmojiClick(detail) {
      const name = detail.r

      console.log(name)

      const url = `/chat-emoji/${name}.svg`
      const img = document.createElement('img')

      img.src = url
      img.style.width = '22px'
      img.style.height = '22px'
      img.style.display = 'inline-block'

      const selection = window.getSelection()

      if (selection.rangeCount === 0 || !this.$refs.editable.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        this.$refs.editable.appendChild(img)
      } else {
        const range = selection.getRangeAt(0)

        range.collapse(false)
        range.insertNode(img)

        selection.removeAllRanges()
        range.setStartAfter(img)
        selection.addRange(range)
      }
    },
    joinChannel() {
      if (!this.chatId.current) return

      if (this.chatId.prev) {
        this.leaveChannel()
      }

      this.chatId.prev = this.chatId.current

      if (this.isClient) {
        const response = window.echo?.private(`Chat.${this.chatId.current}.Messages`).listen('newMessage', (payload) => {
          const message = Object.values(payload.messages).at(-1)
          const index = findIndex(this.messages, ['id', message.id])

          console.log(message, 'MESSAGE')

          if (index > -1) {
            this.messages[index] = message
          } else {
            this.messages?.push(message)
          }
        })

        console.log(response)
      }
    },
    leaveChannel() {
      if (this.isClient) {
        console.log(this.chatId.prev, 'leave channel')
        window.echo?.leave(`Chat.${this.chatId.prev}.Messages`)
      }
    },
  },
}
</script>
<style scoped lang="scss">
.emoji {
  display: flex;
  width: 100%;

  padding: 20px 0;
  margin: 0 20px;
  gap: 20px;

  &__abilities {
    display: flex;
    flex-direction: column;
    gap: 15px;

    &-forms {
      display: flex;
      align-items: center;
      gap: 20px;

      form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
    }
  }

  &__track {
    flex-grow: 1;
    border: 1px solid;
    border-radius: 10px;
    padding: 20px;

    max-height: 650px;
    overflow-y: auto;

    ul {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      li {
        background-color: $primary;
        display: inline-block;
        border-radius: 5px;

        padding: 5px 10px;

        color: #fff;
      }
    }
  }
}
</style>
