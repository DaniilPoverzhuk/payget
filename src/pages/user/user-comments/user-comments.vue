<template>
  <div class="user-comments">
    <div class="user-comments__list">
      <div class="w-full" v-if="isShowComments">
        <h3 class="mb-4">Список комментариев пользователя</h3>
        <Comment
          v-for="comment in userComments"
          :key="comment.id"
          :comment="comment"
          :is-parent="false"
          is-view
        ></Comment>
      </div>
      <div v-else>
        <h3 class="mb-4">Список комментариев пуст</h3>
      </div>
    </div>
  </div>
  <Pagination
    :count="page.total"
    :perPage="page.limit"
    @getData="getData"
  ></Pagination>
</template>

<script>
import Pagination from 'src/components/pagination/pagination.vue'
import Comment from 'src/components/comments/comment.vue'
export default {
  name: 'UserComments',
  components: {
    Pagination,
    Comment,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      userComments: [],
      page: {
        total: 0,
        offset: 0,
        limit: 5,
        currentPage: 1,
      },
    }
  },
  computed: {
    isShowComments() {
      return this.userComments && !!this.userComments.length
    },
  },
  watch: {},
  created() {
    this.getUserComments()
  },
  mounted() {},
  methods: {
    async getData(value) {
      this.page.currentPage = value
      this.page.offset =
        this.page.currentPage * this.page.limit - this.page.limit
      await this.getUserComments()
    },
    async getUserComments() {
      await this.$instance
        .get(`userfeed/comment/user/${this.user.id}`, {
          params: {
            userId: this.user.id,
            limit: this.page.limit,
            offset: this.page.offset,
          },
        })
        .then((res) => {
          const { data } = res.data
          const { paginate } = res.data.meta
          this.userComments = data
          this.page.total = paginate.total
        })
        .catch((e) => {
          console.log('error', `userfeed/comment/user/${this.user.id}: ${e}`)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.user-comments {
  &__list {
    min-height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
