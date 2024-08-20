<template>
  <div class="chat-form-wrapper">
    <p
      v-if="error"
      :class="{ 'lg:pl-8 xs:pl-4': support }"
      class="mb-2 text-sm text-red-900 chat-error-message"
    >
      {{ $t(errorMessage) }}
    </p>
    <form
      class="chat-form flex items-center xs:px-4 py-5 border-t border-gray-200 dark:border-gray-700"
      :class="{ 'lg:pl-8': support, '': !message }"
      @keydown="submitOnEnterPress"
      @submit.prevent="sendMessage()"
    >
      <div class="flex items-center" :class="{ 'flex-grow': file }">
        <div class="relative h-6 w-6 mr-6">
          <label class="mr-5 cursor-pointer" for="file">
            <svg
              v-svg
              class="h-6 w-6"
              :class="{
                'text-primary': file,
                'text-gray-400 dark:text-gray-500': !file,
              }"
              symbol="attach"
            />
          </label>
          <input
            v-if="uploadReady"
            id="file"
            class="opacity-1 w-0 h-0 absolute inset-0"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
            @change="changeFile"
          />
        </div>
        <div
          v-if="file"
          class="flex items-center p-0.5 pl-2 pr-1 rounded-full border border-gray-700 dark:border-gray-300 mr-6"
        >
          <p
            class="text-xs font-medium text-xs text-gray-700 dark:text-gray-300 max-w-118 line-clamp-1"
          >
            {{ file.name }}
          </p>
          <button
            class="border-0 text-sm text-gray-700 dark:text-gray-600 mr-0.5"
            type="button"
            :title="$t('chat.deleteFile')"
            @click="clearFile"
          >
            <svg
              v-svg
              size=""
              class="h-4 w-4 text-gray-700 dark:text-gray-300"
              symbol="close"
            />
          </button>
        </div>
      </div>
      <div :class="{ 'flex-grow': !file }" class="flex items-center">
        <input
          v-if="!file"
          v-model="message"
          class="p-0 border-0 bg-white w-full mr-4 dark:bg-dark-c-white focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
          type="text"
          :placeholder="`${$t('chat.messageText')}...`"
        />
        <button type="submit">
          <svg
            v-svg
            class="h-6 w-6 text-primary hover:text-primary-dark"
            size="24"
            symbol="plane"
          />
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ChatForm',
  props: {
    support: {
      type: Boolean,
      required: false,
    },
  },
  data: () => ({
    file: null,
    uploadReady: true,
    message: '',
    errorMessage: 'error.fieldRequired',
    error: false,
    isLoading: false,
  }),
  watch: {
    file() {
      this.message = ''
    },
  },
  methods: {
    getMimeType(file, fallback = null) {
      const byteArray = new Uint8Array(file).subarray(0, 4)
      let header = ''
      for (let i = 0; i < byteArray.length; i++) {
        header += byteArray[i].toString(16)
      }
      switch (header) {
        case '89504e47':
          return 'image/png'
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          return 'image/jpeg'
        default:
          return fallback
      }
    },
    submitOnEnterPress(event) {
      if (event.keyCode !== 13 || event.shiftKey || event.ctrlKey) return
      event.preventDefault()
      this.sendMessage()
    },
    async clearFile() {
      this.uploadReady = false
      this.file = null
      await this.$nextTick()
      this.uploadReady = true
    },
    sendMessage() {
      this.submitMessage()
    },
    changeFile(event) {
      ;[this.file] = event.target.files

      if (!['image/png', 'image/jpg', 'image/jpeg'].includes(this.file.type)) {
        this.clearFile()
        this.$error.show('error.formatInvalid', 'error.extensionsAvailable')
        return
      }

      if (this.file.size > 10 * 1024 * 1024) {
        this.$error.show(
          'error.fileNotUploaded',
          this.$t('error.maximumFileName', { name: event.target.files[0].name })
        )
        this.clearFile()
      }
    },

    async submitMessage() {
      if ((this.message.length == 0 && !this.file) || this.isLoading) {
        this.error = true
        return false
      }
      this.error = false
      try {
        this.isLoading = true
        const form = new FormData()
        if (this.message) form.append('message', this.message)
        if (this.file) form.append('file', this.file)
        this.file = ''
        this.message = ''
        const { data } = await this.$instance({
          methods: 'POST',
          url: `support/tickets/${this.$route.params.id}/messages`,
          data: form,
        })

        if (data) {
          this.$emit('setMessage', data.data)
        }
      } catch (e) {
        console.log('error', e)
        this.$error.show('Send message error')
      }
      this.isLoading = false
    },
  },
}
</script>

<style lang="scss" scoped>
.chat-form-wrapper {
  position: relative;
  .chat-error-message {
    position: absolute;
    top: -28px;
    left: 0;
  }
}
</style>
