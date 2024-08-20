<template>
  <div class="users flex flex-col w-full">
    <EmojiImg />
    <header
      class="w-full xs:px-5 text-center lg:flex lg:flex-wrap pt-10 lg:px-6 lg:pb-3"
    >
      <h1>{{ $t('users') }}</h1>
      <Search
        class="mt-6 lg:max-w-300 w-full lg:m-0 lg:ml-auto"
        @search="search"
      />
    </header>
    <TabsBadges
      class="mb-0 px-5 lg:px-6"
      :labels="statusText"
      @setPath="setPath"
      :first-tab="activeTab"
    />
    <div class="flex grow w-full">
      <div v-if="rows && activeTab" class="w-full py-7 px-5 lg:px-6">
        <Table
          v-if="rows.length"
          ref="table"
          v-slot="{ sortedRows }"
          :headers="headers[activeTab]"
          class-headers="px-2"
          :rows="rows"
          :total="totalQuantity"
          :visible="visibleQuantity"
          :per-page="limit"
          :pagination="true"
          @cellAction="cellAction"
          @load="getUserList"
          @getData="getUserListPagination"
        >
          <UsersRow
            v-for="user in sortedRows"
            :key="user.id"
            :user="user"
            :active-tab="activeTab"
            @banUser="showBanUserDialog"
            @activateRow="onActivateRow"
          />
        </Table>
        <div
          v-else
          class="lg:text-xl xs:text-md text-gray-500 lg:mt-5 max-w-3xl xs:mt-3"
        >
          {{ $t('noUsersFound') }}
        </div>
      </div>
    </div>
    <Dialog
      v-model="banUserDialog"
      :heading="banUserDialogHeading"
      @hide="cancelUserBan"
    >
      <ul class="flex justify-center flex-wrap mt-4 mx-2.5 lg:-mx-3">
        <li class="mt-4 mx-2.5 lg:mt-6 lg:mx-3">
          <Button view-color="grey" @click="cancelUserBan">
            {{ $t('button.cancel') }}
          </Button>
        </li>
        <li class="mt-4 mx-2.5 lg:mt-6 lg:mx-3">
          <Button
            :loading="banningUser"
            view-color="secondary"
            @click="toggleUserBan"
          >
            <template v-if="currentBanningUser && currentBanningUser.banned_at">
              {{ $t('button.unlock') }}
            </template>
            <template v-else>
              {{ $t('button.block') }}
            </template>
          </Button>
        </li>
      </ul>
    </Dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Table from 'src/components/extends/table/table.vue'
import Dialog from 'src/components/dialog/dialog-new.vue'
import Search from 'src/components/extends/search/search.vue'
import TabsBadges from 'src/components/extends/tabs-badges/tabs-badges-new.vue'
import { USER_ROLE } from 'src/constants.js'
import UsersRow from 'src/components/helper/page-users/users-row/users-row.vue'
import EmojiImg from 'src/components/helper/page-chat/chat-form/emoji-img.vue'

const { mapState: mapUserState } = createNamespacedHelpers('user')
const { ADMIN } = USER_ROLE

export default {
  name: 'Users',
  components: {
    UsersRow,
    Table,
    Dialog,
    Search,
    TabsBadges,
    EmojiImg,
  },
  data() {
    return {
      activeTab: 'information',
      currentBanningUser: null,
      banUserDialog: false,
      rows: null,
      banningUser: false,
      sort: '',
      totalQuantity: 0,
      limit: 50,
      searchQuery: null,
      filter: null,
      lastFilter: NaN,
      currentPage: 1,
      statusText: {
        information: {
          text: 'user.information',
        },
        control: {
          text: 'user.control',
        },
      },
    }
  },
  computed: {
    ...mapUserState(['role', 'permissions']),
    visibleQuantity() {
      return this.rows ? this.rows.length : 0
    },
    banUserDialogHeading() {
      return this.currentBanningUser && this.currentBanningUser.banned_at
        ? this.$t('popup.unlock')
        : this.$t('popup.block')
    },
    headers() {
      const withdraw = {
        icon: 'cash',
        hint: 'channel.automaticWithdraw',
        event: { filter: 'automatic_withdraw', active: false, sort: '' },
      }
      const headers = {
        information: [
          { label: 'ID' },
          { label: 'headers.nickname' },
          { label: 'headers.login' },
          { label: 'contacts' },
          {
            label: 'free',
            event: { filter: 'deposit', active: false, sort: '' },
          },
          {
            label: 'headers.hold',
            event: { filter: 'deposit_hold', active: false, sort: '' },
          },
          {
            label: 'referral.numberReferrals',
            event: { filter: 'ref_count', active: false, sort: '' },
          },
          {
            label: 'remunerationPaid',
            event: { filter: 'ref_profit', active: false, sort: '' },
          },
        ],
        control: [
          { label: 'ID' },
          { label: 'headers.nickname' },
          {
            icon: 'switch-horizontal',
            hint: 'user.exchanger',
            event: { filter: 'active_exchange', active: false, sort: '' },
          },
          {
            icon: 'newspaper',
            hint: 'channel.title',
            event: { filter: 'channel', active: false, sort: '' },
          },
          {
            icon: 'file',
            hint: 'user.fileImport',
          },
          {
            icon: 'message',
            hint: 'user.comments',
          },
          { icon: 'chat', hint: 'channel.chat' },
          {
            icon: 'verified',
            hint: 'channel.verified',
            event: { filter: 'is_verified', active: false, sort: '' },
          },
          {
            icon: 'block',
            hint: 'channel.ban',
            event: { filter: 'banned_at', active: false, sort: '' },
          },
        ],
      }
      if (this.permissions.includes('withdraws.access')) {
        headers.control.splice(3, 0, withdraw)
      }
      return headers
    },
  },
  watch: {
    searchQuery() {
      this.searchResetPagination()
    },
  },
  created() {
    this.getUserList()
  },
  mounted() {
    // if (this.$route.query.tab) this.setPath(this.$route.query.tab)
  },
  methods: {
    cellAction(value) {
      const [filter, index, sort] = value

      const activeTab = this.headers[this.activeTab]
      this.filter = sort ? filter : ''
      this.sort = sort || ''

      if (sort) {
        this.setHeadervalue(activeTab, index, sort)
        if (this.lastFilter && this.lastFilter !== index) {
          this.setHeadervalue(activeTab, this.lastFilter, false)
        }
        this.lastFilter = !sort ? '' : index
      } else {
        this.setHeadervalue(activeTab, this.lastFilter, false)
        this.setHeadervalue(activeTab, index, false)
      }

      this.getUserList(true, true)
    },

    setHeadervalue(el, index, value) {
      el[index].event.active = !!value
      el[index].event.sort = value || ''
    },

    setPath(tabs) {
      this.activeTab = tabs
    },
    getUserListPagination(value) {
      this.currentPage = value
      this.getUserList()
    },
    search(query) {
      this.searchQuery = query
      this.searchResetPagination()
    },
    searchResetPagination() {
      this.currentPage = 1
      this.getUserList()
    },
    getUserListData(query, isFiltered) {
      const startReseted = isFiltered || query !== null

      return {
        limit: this.limit,
        start: startReseted ? 0 : this.visibleQuantity,
        ...(query ? { query } : {}),
        ...(this.filter ? { filter: this.filter } : {}),
        ...(this.sort ? { sort: this.sort } : {}),
        page: this.currentPage,
      }
    },
    async getUserList(isLoaderVisible, isFiltered) {
      if (isLoaderVisible === false) return

      const query = this.searchQuery
      const userListData = this.getUserListData(query, isFiltered)

      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'user/list/moderate',
          data: userListData,
        })

        if (status) {
          this.rows = data.list
          this.totalQuantity = data.quantity || 0
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    showBanUserDialog(id) {
      this.currentBanningUser = this.rows.find((item) => item.id === id)
      this.banUserDialog = true
    },
    async toggleUserBan() {
      const url = this.currentBanningUser.banned_at ? 'user/unban' : 'user/ban'

      this.banningUser = true

      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url,
          data: {
            user_id: this.currentBanningUser.id,
          },
        })

        if (status) {
          this.rows.find(
            (item) => item.id === this.currentBanningUser.id
          ).banned_at = data.banned_at
          this.cancelUserBan()
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.banningUser = false
    },
    cancelUserBan() {
      this.currentBanningUser = null
      this.banUserDialog = false
    },
    onActivateRow(id, state, field) {
      this.rows.find((item) => item.id === id)[field] = state
    },
  },
}
</script>
