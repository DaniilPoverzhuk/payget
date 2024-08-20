<template lang="pug">
div.review
  header.review__header
    time.review__date {{ formattedDate }}
    div.review__author {{ review.name }}
    div.review__rating(
      :class='ratingClass'
    ) {{ $t(rating || '') }}
  div.review__text {{ review.text }}
  div.review__action-list(
    v-if='isAdminOrModerator'
  )
    div.review__action
      Button(
        size='sm'
        view-color='secondary'
        @click='$emit("edit")'
      )  {{ $t('button.edit') }}
    div.review__action
      Button(
        :loading='deletingReview'
        size='sm'
        view-color='grey'
        @click='$emit("delete")'
      ) {{ $t('button.remove') }}
</template>

<script>
import { format } from 'date-fns'
import { createNamespacedHelpers } from 'vuex'
import { USER_ROLE } from 'src/constants'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { ADMIN, MODERATOR } = USER_ROLE

export default {
  name: 'Review',
  props: {
    review: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      deletingReview: false,
      deleted: false,
    }
  },
  computed: {
    ...mapUserState(['role']),
    isAdminOrModerator() {
      return this.role === ADMIN || this.role === MODERATOR
    },
    rating() {
      if (this.review.status === 'negative') {
        return 'review.negative'
      }
      if (this.review.status === 'positive') {
        return 'review.positive'
      }

      return 'review.neutral'
    },
    ratingClass() {
      return {
        review__rating_positive: this.review.status === 'positive',
        review__rating_negative: this.review.rating === 'negative',
      }
    },
    formattedDate() {
      return format(this.$getDateInMs(this.review.created_at), 'dd.MM.yyyy')
    },
  },
}
</script>

<style lang="scss">
.review {
  border-bottom: 1px solid var(--c-gray-10);
  padding-bottom: 24px;
}

.review__header {
  display: flex;
  flex-wrap: wrap;
  font-size: var(--fz-sm);
  line-height: var(--lh-sm);
}

.review__date {
  width: 88px;
  color: var(--c-gray-20);
}

.review__author {
  color: var(--c-gray-70);
}

.review__rating {
  margin-top: 8px;
  width: 100%;

  &_positive {
    color: var(--c-success);
  }

  &_negative {
    color: var(--c-alert);
  }

  @media (min-width: 1200px) {
    margin: 0 0 0 auto;
    width: auto;
  }
}

.review__text {
  margin-top: 8px;

  @media (min-width: 1200px) {
    margin-top: 12px;
  }
}

.review__action-list {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.review__action {
  margin: 10px 10px 0;
}
</style>
