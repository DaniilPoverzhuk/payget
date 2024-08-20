<template>
  <div class="reviews" v-if="reviews">
    <header class="reviews__header">
      <h3 class="reviews__heading" v-if="$matchMedia.desktop">
        {{ $t('user.reviews') }}
      </h3>
      <div class="reviews__counter">
        <span class="reviews__positive">{{ positive }}</span> /
        <span class="reviews__negative">{{ negative }}</span> /
        <span class="reviews__neutral">{{ neutral }}</span>
      </div>
    </header>
    <ul class="reviews__list">
      <li
        class="reviews__item"
        v-for="(review, index) in reviews"
        :key="review.id"
      >
        <Review
          :review="review"
          @edit="editReview(review, index)"
          @delete="startDeleteReview(review, index)"
        ></Review>
      </li>
    </ul>
    <Pagination
      :count="count"
      :perPage="perPage"
      @getData="getData"
    ></Pagination>
    <Dialog
      v-model="editReviewDialog"
      :heading="$t('review.edit')"
      @hide="editReviewDialog = false"
    >
      <ReviewForm
        :review="editedReview"
        @success="changeEditedReview"
      ></ReviewForm>
    </Dialog>
    <Dialog
      v-model="deleteReviewDialog"
      :heading="$t('review.remove')"
      @hide="deleteReviewDialog = false"
    >
      <ul class="dialog__action-list">
        <li class="dialog__action-list-item">
          <Button
            type="info"
            view-color="grey"
            @click="deleteReviewDialog = false"
            >{{ $t('button.cancel') }}</Button
          >
        </li>
        <li class="dialog__action-list-item">
          <Button
            :loading="deletingReview"
            view-color="secondary"
            @click="deleteReview"
          >
            {{ $t('button.remove') }}</Button
          >
        </li>
      </ul>
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Dialog from 'src/components/dialog/dialog-new.vue'
import Pagination from 'src/components/pagination/pagination.vue'
import ReviewForm from 'src/components/extends/review-form/review-form.vue'
import Review from './review/review.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Reviews',
  components: {
    Dialog,
    Review,
    ReviewForm,
    Pagination,
  },
  data() {
    return {
      reviews: null,
      positive: 0,
      negative: 0,
      neutral: 0,
      editedReview: null,
      editedReviewIndex: null,
      editReviewDialog: false,
      deletedReview: null,
      deletedReviewIndex: null,
      deleteReviewDialog: false,
      deletingReview: false,
      pages: [],
      currentPage: 1,
      pagination: {},
      count: 0,
      perPage: 50,
    }
  },
  computed: {
    ...mapUserState(['viewUserId']),
  },
  watch: {
    async viewUserId(value) {
      if (!value) return
      await this.getReviews()
      await this.getStatuses()
    },
  },
  async created() {
    if (!this.viewUserId) return
    await this.getReviews()
    await this.getStatuses()
  },
  methods: {
    async getData(value) {
      this.currentPage = value
      await this.getReviews()
    },
    async getReviews() {
      await this.makeRequest('review/list', true)
    },
    async getStatuses() {
      await this.makeRequest('review/list/info', false)
    },
    async makeRequest(url, reviews) {
      if (!this.viewUserId) return

      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url,
          data: {
            user_id: this.viewUserId,
            page: this.currentPage,
            per_page: this.perPage,
          },
        })

        if (status) {
          if (reviews) {
            const { list, count } = data
            this.count = count

            this.reviews = list
          } else {
            const { count } = data

            Object.assign(this, count)
          }
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    editReview(review, index) {
      this.editedReview = review
      this.editedReviewIndex = index
      this.editReviewDialog = true
    },
    startDeleteReview(review, index) {
      this.deleteReviewDialog = true
      this.deletedReview = review
      this.deletedReviewIndex = index
    },
    changeEditedReview(data) {
      Object.assign(this.reviews[this.editedReviewIndex], data)
      this.editReviewDialog = false
    },
    async deleteReview() {
      this.deletingReview = true

      try {
        const {
          data: { status, message },
        } = await this.$instance({
          url: 'review/delete',
          data: {
            id: this.deletedReview.id,
          },
        })

        if (status) {
          this.reviews.splice(this.deletedReviewIndex, 1)
          this[this.deletedReview.status] -= 1
          this.deleteReviewDialog = false
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.deletingReview = false
    },
  },
}
</script>

<style lang="scss">
.reviews__header {
  @media (min-width: 1200px) {
    position: sticky;
    top: 0;
    background-color: var(--c-white);

    &::after {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      display: block;
      content: '';
      background-image: var(--review-list-header-grad);
      background-repeat: repeat-x;
      height: 30px;
    }
  }
}

.reviews__heading {
  display: inline;
}

.reviews__counter {
  display: inline;
  line-height: var(--lh-sm);
  font-size: var(--fz-lg);

  @media (min-width: 1200px) {
    margin-left: 18px;
  }
}

.reviews__positive {
  color: var(--c-success);
}

.reviews__negative {
  color: var(--c-alert);
}

.reviews__neutral {
  color: var(--c-gray-20);
}

.reviews__list {
  margin-top: 30px;
}

.reviews__item {
  &:nth-child(n + 2) {
    margin-top: 25px;
  }
}
.dialog__action-list {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 16px;
}
</style>
