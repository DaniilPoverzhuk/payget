<template>
  <div class="user-comment">
    <template v-if="userComment">
      <CommentDetails :comment="userComment" is-view />
    </template>
    <div v-else>Комментарий не найден или удалён.</div>
  </div>
</template>

<script>
import CommentDetails from 'src/components/comments/comment-details.vue'
export default {
  name: 'UserComment',
  components: { CommentDetails },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      userComment: null,
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getUserComment()
  },
  mounted() {},
  methods: {
    async getUserComment() {
      console.log('getUserComment')
      await this.$instance
        .get(`userfeed/comment/${this.$route.params.slug}`)
        .then((res) => {
          const { data } = res.data
          console.log(res)
          if (data) {
            this.userComment = data.find(
              (x) => x.id === +this.$route.params.slug
            )
            console.log('this.userComment', this.userComment)
          }
        })
        .catch((e) => {
          console.log(
            'error',
            `userfeed/comment${this.$route.params.slug}: ${e}`
          )
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.user-comment {
  background-color: transparent;
}
</style>
