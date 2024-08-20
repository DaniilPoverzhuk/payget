<template>
  <form
    class="review-form"
    @submit.prevent="sendReview"
  >
    <h2 class="text-center text-lg text-gray-900 dark:text-white font-medium">
      {{ $t(review ? 'review.ratingSeller' : 'review.doRateSeller') }}
    </h2>
    <div class="flex items-center justify-between space-x-2 mt-4">
      <div
        v-for="(item, key) in ratingItems"
        :key="key"
        class="flex-shrink-0 w-1/3 mb-3 "
      >
        <input
          :id="item.value"
          v-model="rating"
          class="hidden"
          :value="item.value"
          type="radio"
          name="review-rating"
        >
        <label
          class="flex items-center py-2 px-3 rounded-lg cursor-pointer"
          :class="{
            'bg-green-100': item.value === 'positive' && rating === 'positive',
            'bg-gray-100': item.value === 'neutral' && rating === 'neutral',
            'bg-red-100': item.value === 'negative' && rating === 'negative',
          }"
          :for="item.value"
        >
          <svg
            v-svg
            class="flex-shrink-0 mr-1 w-6 h-6"
            :class="{
              'text-green-600': item.value === 'positive',
              'text-gray-500': item.value === 'neutral',
              'text-red-600': item.value === 'negative',
            }"
            :symbol="`rating-${item.value}`"
          />

          <span
            class="font-medium text-sm"
            :class="{
              'text-green-600': item.value === 'positive' && rating === 'positive',
              'text-gray-500': item.value === 'neutral' && rating === 'neutral',
              'text-red-600': item.value === 'negative' && rating === 'negative',
            }"
          >{{ $t(item.name) }}</span>
        </label>
      </div>
    </div>
    <h3
      class="text-gray-700 dark:text-gray-300 text-lg text-center font-semibold"
    >
      {{ $t( review ? 'chat.feedback' : 'review.feedbackYour') }}
    </h3>
    <VTextarea
      v-model="reviewText"
      class="pt-3 mb-6"
      :rows="4"
    />
    <Button
      view-color="secondary"
      :disabled="!rating"
      :loading="sendingReview"
      :submit="true"
      class="w-full"
      type="success"
    >
      {{ $t(review ? 'review.editReview' : 'disputes.leaveReview') }}
    </Button>
  </form>
</template>

<script>
import VTextarea from 'src/components/extends/v-textarea/v-textarea.vue'
import Button from 'src/components/extends/button/button.vue'

export default {
  name: 'ReviewForm',
  components: {
    Button,
    VTextarea,
  },
  props: {
    review: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      rating: this.review ? this.review.status : '',
      reviewText: this.review ? this.review.text : '',
      ratingItems: [
        {
          value: 'positive',
          name: 'review.positiveAdverb',
        },
        {
          value: 'negative',
          name: 'review.negativeAdverb',
        },
        {
          value: 'neutral',
          name: 'review.feedbackYour',
        },
      ],
      sendingReview: false,
    }
  },
  methods: {
    async sendReview() {
      this.sendingReview = true
      // if (!this.review) plausible('Reviews')
      try {
        const { data: { status, message } } = await this.$instance({
          url: this.review ? 'review/edit' : 'review/add',
          data: {
            status: this.rating,
            text: this.reviewText,
            ...(this.review ? { id: this.review.id } : { chat_id: this.$route.params.chat_id }),
            hash: true,
          },
        })

        if (status) {
          this.$emit('success', (this.review ? { status: this.rating, text: this.reviewText } : null))
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.sendingReview = false
    },
  },
}
</script>
