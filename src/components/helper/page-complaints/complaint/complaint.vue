<template>
  <div
    v-if="dataList !== null"
    class="complaint w-full mt-10 lg:px-6 xs:px-4 mb-10"
  >
    <router-link v-slot="{ href, navigate }" :to="`/complaints`"
      ><a class="complaint__go-back mb-4" :href="href" @click="navigate"
        ><svg
          class="complaint__icon text-gray-300 dark:text-gray-500"
          v-svg
          aria-hidden="true"
          size="18 17"
          symbol="back-arrow"
        ></svg
        >{{ $t('complaints.back') }}</a
      ></router-link
    >
    <h1
      v-if="post !== null"
      class="text-2xl font-semibold text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6"
      v-text="post?.title"
    />
    <VSelect
      v-if="isShowStatus"
      v-model="currencyFrom"
      :label="$t('complaints.complaint')"
      :select-list="availableCurrencyList"
      class="max-w-177 mb-6"
      :placeholder="$t('knowledge.description')"
      @update:modelValue="selectStatus"
    />
    <Table
      v-if="dataList && dataList.length"
      ref="table"
      v-slot="{ sortedRows }"
      class="mb-10"
      :headers="headers"
      :rows="dataList"
    >
      <ComplaintRow
        v-for="(complaint, i) in sortedRows"
        :key="i"
        :data="complaint"
        :order="i + 1"
      />
    </Table>
    <template v-if="!isComment">
      <h2
        class="text-2xl font-semibold text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6"
      >
        {{ $t('channel.post') }}
      </h2>
      <ComplaintPost :post="post" />
    </template>
    <template v-if="isComment && post">
      <h2
        class="text-2xl font-semibold text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6"
      >
        {{ $t('comments.comment') }}
      </h2>
      <Comment :comment="post" is-complaint />
    </template>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Table from 'src/components/extends/table/table.vue'
import ComplaintRow from '../complaint-row/complaint-row.vue'
import ComplaintPost from '../complaint-post/complaint-post.vue'
import complaint from 'src/mixins/complaint.vue'
import VSelect from 'src/components/extends/v-select/v-select.vue'
import Comment from 'src/components/comments/comment.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Complaint',
  components: {
    Table,
    VSelect,
    ComplaintRow,
    ComplaintPost,
    Comment,
  },
  mixins: [complaint],
  data() {
    return {
      post: null,
      resolveDialog: false,
      limit: 50,
      totalQuantity: 0,
      dataList: null,
      list: 0,
      quantity: null,
      currencyFrom: '',
      complaintOwner: null,
      isComment: false,
    }
  },
  computed: {
    ...mapUserState(['id']),
    isStatus() {
      return this.data.complaint_request_status == 'in_progress' &&
        this.id == this.data.user.id
        ? 'user'
        : this.data.complaint_request_status
    },
    isShowStatus() {
      return (
        this.currencyFrom == 'new' ||
        (this.complaintOwner !== null && this.complaintOwner.id == this.id)
      )
    },
    postId() {
      return this.$route.params.id
    },
    availableCurrencyList() {
      return this.getStatusList()
    },
    headers() {
      return [
        { label: '№' },
        { label: 'headers.date' },
        { label: 'complaints.reasonComplaint' },
        { label: 'headers.sender' },
      ]
    },
  },
  created() {
    this.getUserPost()
    this.getRequests()
  },
  methods: {
    async selectStatus() {
      try {
        const { data } = await this.$instance.patch(
          `userfeed/complaint-post/${this.postId}`,
          {
            status: this.currencyFrom,
          }
        )
        if (data && this.currencyFrom === 'resolved') {
          this.$router.push('/complaints')
        }
      } catch {
        this.$error.show()
      }
    },
    async getRequests() {
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: `userfeed/complaint-post/${this.postId}/complaint`,
          params: {
            post_id: this.postId,
          },
        })
        if (data) {
          this.dataList = data.data
        }
      } catch {
        this.$router.push('/complaints')
      }
    },
    async getUserPost() {
      try {
        const { data } = await this.$instance({
          method: 'GET',
          url: `userfeed/complaint-post/${this.postId}`,
        })
        if (data) {
          this.isComment =
            data.data.complaintable_type === 'channel_post_comment'
          this.post = data.data.post
          this.currencyFrom = data.data.status
          this.complaintOwner = data.data.user
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.complaint {
  &__go-back {
    color: var(--c-gray-20);
    font-size: 14px;
    line-height: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 24px;
    text-decoration: none;

    &:hover {
      color: var(--c-primary);

      .icon {
        fill: var(--c-primary);
      }
    }
  }

  &__icon {
    fill: var(--c-gray-20);
    margin-right: 16px;
  }
}
</style>
