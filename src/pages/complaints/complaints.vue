<template>
  <div class="complaintsmt-10 px-4 lg:py-4 lg:px-6 mt-10 w-full">
    <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6"> {{ $t('complaints.title') }}</h1>
    <TabsBadges :first-tab="requestFilter" :labels="statusText" :tabs-data="tabsData" @setPath="setPath"
      class="lg:pt-3" />
    <template v-if="list != null">
      <Table v-if="list.length" ref="table" v-slot="{ sortedRows }" :headers="headers" class-headers="px-2" :rows="list"
        :total="total" :visible="visibleQuantity" :per-page="limit" :pagination="true" @load="getRequests"
        @getData="getRequestsPagination">
        <ComplaintsRow v-for="rows in sortedRows" :key="rows.post_id" :data="rows" @remove="removeRow"
          @update="getUpdate()" @resolve="showResolveRequestDialog" />
      </Table>
    </template>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Table from 'src/components/extends/table/table.vue'
import ComplaintsRow from 'src/components/helper/page-complaints/complaints-row/complaints-row.vue'
import complaint from 'src/mixins/complaint.vue'
import TabsBadges from 'src/components/extends/tabs-badges/tabs-badges-new.vue'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  name: 'Complaints',
  components: {
    Table,
    ComplaintsRow,
    TabsBadges,
  },
  mixins: [complaint],
  data() {
    return {
      requestFilter: this.$route.query.tab ? this.$route.query.tab : 'all',
      list: null,
      totals: null,
      total: null,
      limit: 20,
      offset: 0,
      quantity: null,
      resolvedRequestId: null,
      resolvedRequestStatus: null,
      tabsData: null,
      resolvingRequest: false,
      resolveRequestDialog: false,
      currentPage: 1,
      statusText: {
        new: {
          text: 'withdraws.open',
        },
        user: {
          text: 'status.mine',
        },
        in_progress: {
          text: 'dealStatus.work',
        },
        resolved: {
          text: 'withdraws.solved',
        },
        all: {
          text: 'status.all',
        },
      },
    }
  },
  computed: {
    ...mapUserState(['id']),
    visibleQuantity() {
      return 0
    },
    headers() {
      return [
        { label: 'headers.url.post' },
        { label: 'complaints.number' },
        { label: 'complaints.reason' },
        { label: 'complaints.complaint' },
        { label: 'complaints.admin' },
        { label: 'complaints.decision' },
        { label: 'placeholder.reasonDelete' },
      ]
    },
  },
  created() {
    this.getRequests()
  },
  methods: {
    setPath(type) {
      this.requestFilter = type
      this.offset = 0
      this.getUpdate()
    },
    getUpdate() {
      this.getRequests()
    },
    removeRow() {
      this.resolvingRequest = false
      this.resolveRequestDialog = false
    },
    showResolveRequestDialog(id, result) {
      this.resolvedRequestId = id
      this.resolvedRequestStatus = result
      this.resolveRequestDialog = true
    },
    async getRequestsPagination(value) {
      this.currentPage = value
      await this.getRequests()
    },
    setParamsPath(type) {
      if (type !== this.requestFilter) {
        this.$router.push({ query: { tab: type } })
        this.requestFilter = type
        this.offset = 0
        this.getRequests()
      }
    },
    async getRequests() {
      const status = this.requestFilter == 'all' ? undefined : this.requestFilter == 'user' ? 'in_progress' : this.requestFilter
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: 'userfeed/complaint-post',
          params: {
            'filter[status]': status,
            'filter[user_id]': this.requestFilter === 'user' ? this.id : undefined,
            offset: this.offset,
            limit: this.limit,
          },
        })
        if (data) {
          this.list = data.data
          this.total = data.meta.paginate.total
          this.quantity = data.data.length ? data.data.length : 0
          this.offset = this.offset + this.limit
          this.tabsData = data.meta.totals
        } else {
          this.$error.show('userfeed/complaint-post')
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.complaints {

  .table__th {
    white-space: nowrap;
  }

  &__filter {
    overflow: hidden;
    max-width: 100%;


  }

  .filter {
    display: flex;
    overflow-x: auto;
    font-size: var(--fz-xl);
    font-weight: var(--fw-600);
    width: 100%;

    @media (min-width: 1200px) {
      flex-wrap: wrap;
      margin: 0 -24px;
    }

    &__item {
      padding-right: 40px;
      padding-bottom: 20px;

      @media (min-width: 1200px) {
        padding: 0 24px 24px;
      }

      &:last-child {
        padding-right: 0;
      }
    }

    &__radio {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      margin: 0;
      clip: rect(0, 0, 0, 0);
    }

    &__label {
      display: flex;
      align-items: center;
      cursor: pointer;
      line-height: 1;
      font-size: 15px;
      white-space: nowrap;

      &_mark {
        position: relative;

        &::after {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: var(--c-primary);
          border-radius: var(--bdrs-round);
          content: '';
          display: block;
          top: 3px;
          right: -10px;
        }
      }
    }

    &__num {
      display: block;
      color: var(--c-gray-80);
      font-weight: var(--fw-500);
      font-size: 15px;
      line-height: 20px;
      padding: 0 7px;
      position: relative;
      margin-left: 10px;
      z-index: 0;

      &:after {
        content: "";
        border-radius: 10px;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background: var(--c-gray-10);
        z-index: -1;
      }
    }

    &__radio:checked {
      &+.filter__label {
        color: var(--c-primary);
        cursor: default;

        .filter__num {
          color: var(--c-primary);

          &:after {
            opacity: 0.1;
            background: var(--c-primary);
          }
        }
      }
    }
  }
}
</style>
