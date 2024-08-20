<template>
  <div class="social-sharing">
    <template
      v-for="type in types"
      :key="type"
    >
      <ShareNetwork
        :network="type"
        :url="url"
        :title="title"
        :description="description"
      >
        <div
          :class="type && `social-sharing__btn--${type.toLowerCase()}`"
          class="social-sharing__btn"
        >
          <svg
            v-svg
            aria-hidden="true"
            :symbol="type.toLowerCase()"
            class="h-5 w-5"
          />
        </div>
      </ShareNetwork>
    </template>
  </div>
</template>

<script>
import { ShareNetwork } from 'vue-social-sharing'

export default {
  name: 'SocialSharing',
  components: {
    ShareNetwork,
  },
  props: {
    url: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    types: [
      'facebook',
      'VK',
      'Telegram',
      'Twitter',
      'Viber',
      'WhatsApp',
    ],
  }),
}
</script>
<style lang="postcss">
.social-sharing {
  &__btn {
      @apply w-8 h-8 rounded-md	flex items-center justify-center;
   }
  &__btn {

    &--facebook {
       background: #4E6297;
    }
    &--vk {
       background: #7294C7;
    }
    &--telegram {
       background: #2F89CE;
    }
    &--twitter {
       background: #55ACE3;
    }
    &--viber {
       background: #7C509A;
    }

    &--whatsapp {
       background: #48C95F;
    }
  }
}
</style>
