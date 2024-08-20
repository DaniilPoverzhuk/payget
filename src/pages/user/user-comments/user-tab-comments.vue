<template>
  <div class="user-tab-comment">
    <template v-if="view === 'comments'">
      <UserComments :user="user" />
    </template>
    <template v-else-if="view === 'comment'">
      <UserComment />
    </template>
  </div>
</template>

<script>
import UserComments from './user-comments.vue'
import UserComment from './user-comment.vue'
export default {
  name: 'UserTabComments',
  components: { UserComments, UserComment },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {}
  },
  computed: {
    view() {
      return this.$route.params.slug ? 'comment' : 'comments'
    },
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.user-tab-comment {
  background-color: transparent;
}
</style>
