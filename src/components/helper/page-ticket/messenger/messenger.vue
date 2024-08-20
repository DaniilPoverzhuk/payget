<template>
  <div
    v-if="messages !== null"
    class="messenger py-2"
  >
    <slot/>
    <template
      v-for="(message, index) in messagesWithDate"
    >
      <p
        v-if="message.date"
        :key="index + 1"
        class="text-center py-2 text-sm text-gray-400"
        v-text="getFormatDate(message.date)"
      />
      <div
        v-else
        :key="index"
        class="flex flex-col justify-between  items-start"
        :class="{'items-end' : id == message.user.id}"
      >
        <div class="flex items-center">
          <Avatar
            :name="message.user.name"
            :class-user="{'order-1 bg-secondary-100 text-yellow-400':id == message.user.id}"
            :href="id !== message.user.id ?`/user/${message.user.name}` : ''"
            :avatar="message.user.media.avatar"
            :class="{ 'cursor-pointer': id !== message.user.id }"
          />
        </div>
        <div
          class="mt-2 p-4 rounded-md flex"
          :class="setClassMessage(message, index)"
        >

          <!-- <Photoswipe v-if="message.screenshot">
              v-pswp="message.screenshot" -->
							<div v-viewer="imageViewerOptions" class="w-80 h-80" v-if="message.screenshot">
								<img
									:src="message.screenshot"
									class="max-w-80 max-h-80 mr-4 rounded-md"
								>
							</div>
          <!-- </Photoswipe> -->
          <span
            v-if="message.message"
            class="block text-gray-700 text-sm break-all flex-grow mb-1">{{ message.message }}</span>
          <span class="inline-block text-gray-400 text-sm text-right w-full">{{
              messageTime(message.created_at)
            }}</span>
        </div>
      </div>
    </template>

    <p
      v-if="ticketInfo !== null && ticketInfo.status == 'resolved'"
      class="text-center inline-block w-full py-2 text-sm text-gray-400"
    >
      {{ $t('tickets.ticketClosed') }}
    </p>
    <p
      v-if="ticketInfo !== null && ticketInfo.status == 'new'"
      class="text-center inline-block w-full py-2 text-sm text-gray-400"
    >
       {{ $t('tickets.questionConsideration') }}
    </p>
  </div>
</template>

<script>

import {createNamespacedHelpers} from 'vuex'
import {format, isToday, isYesterday} from 'date-fns'
import {ru} from 'date-fns/locale'
import Avatar from 'src/components/extends/avatar/avatar.vue'

const {mapState: mapUserState} = createNamespacedHelpers('user')

export default {
  name: 'Messenger',
  components: {
    Avatar,
  },
  props: {
    messages: {
      type: Array,
      default: null,
    },
    ticketInfo: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    imageViewerOptions: {
      toolbar: false,
      title: false,
      navbar: false
    }
  }),
  computed: {
    ...mapUserState(['id']),
    dates() {
      const newArr = []
      Object.keys(this.messages).map((el) => {
        const date = this.messages[el].created_at.split(' ')[0]
        if (!newArr.includes(date)) {
          newArr.push(date)
        }
      })

      return newArr
    },
    messagesWithDate() { // add date in messages
      const newArr = []
      let lastDate = ''
      this.messages.map((el) => {
        const date = el.created_at.split(' ')[0]
        if (lastDate !== date) {
          lastDate = date
          newArr.push({
            date,
          })
        }
        newArr.push(el)
      })
      return newArr
    },
  },
  methods: {
    setClassMessage(message, index) {
      return {
        'lg:ml-16 xs:ml-11 bg-indigo-50': this.id !== message.user.id,
        'lg:mr-16 xs:mr-11 bg-secondary-100': this.id === message.user.id,
        'message-scroll': index + 1 === this.messages.length,
        'flex-col': !message.screenshot,
        'items-end': message.screenshot
      }
    },
    messageTime(date) {
      return format(this.$getDateInMs(date), 'HH:mm')
    },
    getFormatDate(date) {
      const dateInMs = this.$getDateInMs(date)
      const formattedDate = format(dateInMs, 'dd.MM.yyyy')
      let dayName = format(dateInMs, 'EEEE', {locale: ru})
      dayName = dayName[0].toUpperCase() + dayName.slice(1)
      if (isToday(dateInMs)) dayName = this.$t('date.today')
      if (isYesterday(dateInMs)) dayName = this.$t('date.yesterday')
      return `${dayName}, ${formattedDate}`
    },
  },
}
</script>
