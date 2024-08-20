<template>
  <tr class="cursor-pointer">
    <td class="px-2 py-4">
      <router-link
        v-if="user.is_link_profile"
        class="text-primary"
        :to="`/user/${encodeURIComponent(user.name)}`"
      >
        {{ `#${user.id}` }}
      </router-link>
      <template v-else>
        {{ `#${user.id}` }}
      </template>
    </td>
    <td class="px-2 py-4 max-w-176">
      {{ user.name }}
    </td>
    <template v-if="activeTab === 'information'">
      <td class="px-2 py-4 whitespace-nowrap">
        {{ user.login }}
      </td>
      <td v-if="isAdmin" class="px-2 py-4 whitespace-nowrap">
        {{ user.email }}
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <strong>{{ user.deposit }}</strong>
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <strong>{{ user.deposit_hold }}</strong>
      </td>
      <td v-if="isAdmin" class="px-2 py-4 whitespace-nowrap">
        <strong>{{ user.refs }}</strong>
      </td>
      <td v-if="isAdmin" class="px-2 py-4 whitespace-nowrap">
        <strong>{{ user.refs_profit }}</strong>
      </td>
    </template>
    <template v-if="activeTab === 'control'">
      <td class="px-2 py-4 whitespace-nowrap">
        <Toggler
          v-if="isUserAdmin !== user.is_link_profile || isUserModerator"
          v-model="user.active"
          @update:modelValue="changeExchangeStatus(user.active)"
        />
      </td>
      <td
        v-if="permissions.includes('withdraws.access')"
        class="px-2 py-4 whitespace-nowrap"
      >
        <Toggler
          v-model="user.automatic_withdraw"
          @update:modelValue="changeAutomaticWithdraw(user.automatic_withdraw)"
        />
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <Toggler
          v-if="
            user.is_link_profile &&
            (isUserAdmin !== user.is_link_profile || isUserModerator)
          "
          v-model="user.active_channel"
          @update:modelValue="changeСhannelStatus(user.active_channel)"
        />
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <Toggler
          v-if="
            user.is_link_profile &&
            (isUserAdmin !== user.is_link_profile || isUserModerator)
          "
          v-model="user.allow_import"
          @update:modelValue="changeImportsStatus(user.allow_import)"
        />
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <Toggler
          v-if="
            user.is_link_profile &&
            (isUserAdmin !== user.is_link_profile || isUserModerator)
          "
          v-model="user.active_comments"
          @update:modelValue="changeCommentsStatus(user.active_comments)"
        />
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <button
          v-if="!user.banned_at"
          class="user-actions__message-button"
          @click="createChat"
        >
          <svg
            v-svg
            class="user-actions__message-icon"
            size="24"
            symbol="chat"
          />
        </button>
        <svg
          v-else
          v-svg
          class="user-actions__message-icon user-actions__message-icon_blocked"
          size="24"
          symbol="chat"
        />
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <TogglerIcon
          v-if="isUserAdmin !== user.is_link_profile || isUserModerator"
          v-model="user.is_verified"
          class="text-primary"
          svg-symbol="verified"
          size="24"
          @update:modelValue="toggleUserVerified(user.is_verified)"
        />
      </td>
      <td class="px-2 py-4 whitespace-nowrap">
        <button
          class="user-actions__block-button"
          :class="!!user.banned_at && 'user-actions__block-button_blocked'"
          :disabled="isUserAdmin"
          @click="toggleUserBan"
        >
          <svg
            v-svg
            class="user-actions__block-icon"
            size="24"
            symbol="block"
          />
        </button>
      </td>
    </template>
  </tr>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
// import VInput from 'src/components/extends/v-input/v-input.vue'
import TogglerIcon from 'src/components/toggler-icon/toggler-icon.vue'
import Toggler from 'src/components/extends/v-toggler/v-toggler.vue'
import { USER_ROLE } from 'src/constants.js'

// ВЕРНУТЬ АПИ
// import ApiService from 'src/api/api.service.js'

const { mapState: mapUserState, mapActions: mapUserActions } =
  createNamespacedHelpers('user')
const { ADMIN, MODERATOR, MEMBER } = USER_ROLE

export default {
  name: 'UsersRow',
  components: {
    // VInput,
    Toggler,
    TogglerIcon,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    activeTab: {
      type: String,
      default: 'information',
    },
  },
  computed: {
    ...mapUserState(['id', 'role', 'permissions']),
    isAdmin() {
      return this.role === ADMIN
    },
    isUserAdmin() {
      return this.user.role === ADMIN
    },
    isUserModerator() {
      return this.user.role === MODERATOR
    },
    isAvailable() {
      return (
        this.user.role === MEMBER ||
        (this.user.role === MODERATOR && this.role === ADMIN)
      )
    },
    col() {
      return '9a4fd5'
    },
  },
  methods: {
    ...mapUserActions(['update']),
    toggleUserBan() {
      this.$emit('banUser', this.user.id)
    },
    async toggleUserVerified(val) {
      try {
        const { status } = await this.$instance({
          method: this.user.is_verified ? 'POST' : 'DELETE',
          url: `userfeed/user/${this.user.id}/${
            this.user.is_verified ? 'verify' : 'unverify'
          }`,
          data: {
            user_id: this.user.id,
          },
        })

        // if (status) {
        //   this.$emit('onActivateRow', this.user.id, val, 'is_verified')
        // } else {
        //   this.$emit('onActivateRow', this.user.id, !val, 'is_verified')
        //   this.$error.show(message)
        // }
      } catch {
        this.$emit('activateUser', this.user.id, val, 'is_verified')
        this.$error.show()
      }
    },

    async changeAutomaticWithdraw(eventState) {
      try {
        const data = await this.update({
          automatic_withdraw: eventState,
          user_id: this.user.id,
          login: this.user.login,
          name: this.user.name,
        })
        if (data) {
          this.$emit(
            'onActivateRow',
            this.user.id,
            eventState,
            'automatic_withdraw'
          )
        } else {
          this.$emit(
            'onActivateRow',
            this.user.id,
            !eventState,
            'automatic_withdraw'
          )
        }
      } catch {
        this.$emit(
          'activateUser',
          this.user.id,
          !eventState,
          'automatic_withdraw'
        )
        this.$error.show()
      }
    },
    async changeСhannelStatus(eventState) {
      try {
        const { status } = await this.$instance.patch(
          `/userfeed/channel/${this.user.id}`,
          {
            user_id: this.user.id,
            is_activate: eventState,
          }
        )
        if (status) {
          this.$emit(
            'onActivateRow',
            this.user.id,
            eventState,
            'active_channel'
          )
        }
        // else {
        //   this.$emit('onActivateRow', this.user.id, !eventState, 'active_channel')
        //   this.$error.show(message)
        // }
      } catch (e) {
        this.$emit('activateUser', this.user.id, !eventState, 'active_channel')
        this.$error.show(e)
      }
    },
    async changeImportsStatus(eventState) {
      try {
        const { status } = await this.$instance.post('/user/import/allow', {
          user_id: this.user.id,
          activate: eventState,
        })
        if (status) {
          this.$emit('onActivateRow', this.user.id, eventState, 'allow_import')
        }
      } catch (e) {
        this.$emit('activateUser', this.user.id, !eventState, 'allow_import')
        this.$error.show(e)
      }
    },
    async changeCommentsStatus(eventState) {
      console.log('eventState', eventState)
      console.log('this.user.active_comments', this.user.active_comments)
      if (!this.user.active_comments) {
        try {
          const { status } = await this.$instance.delete(
            `userfeed/user/${this.user.id}/disable-comments`
          )
          if (status) {
            this.$emit(
              'onActivateRow',
              this.user.id,
              !eventState,
              'active_message'
            )
          }
        } catch (e) {
          this.$emit('activateUser', this.user.id, eventState, 'active_channel')
          this.$error.show(e)
        }
      } else {
        try {
          const { status } = await this.$instance.post(
            `userfeed/user/${this.user.id}/enable-comments`
          )
          if (status) {
            this.$emit(
              'onActivateRow',
              this.user.id,
              eventState,
              'active_message'
            )
          }
        } catch (e) {
          this.$emit(
            'activateUser',
            this.user.id,
            !eventState,
            'active_channel'
          )
          this.$error.show(e)
        }
      }
    },
    async changeExchangeStatus(eventState) {
      try {
        const { status, message } = await this.$instance.post(
          'user/exchange/visible',
          {
            activate: eventState,
            user_id: this.user.id,
          }
        )

        if (status) {
          this.$emit('onActivateRow', this.user.id, eventState, 'active')
        } else {
          this.$emit('onActivateRow', this.user.id, !eventState, 'active')
          this.$error.show(message)
        }
      } catch {
        this.$emit('onActivateRow', this.user.id, !eventState, 'active')
        this.$error.show()
      }
    },
    async createChat() {
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'chat/create',
          data: {
            first_user_id: this.id,
            second_user_id: this.user.id,
          },
        })

        if (status) {
          this.$router.push(`/messages/${data.chat_id}`)
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss">
.user-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &__item {
    &:nth-child(n + 2) {
      margin-left: 26px;
    }
  }

  &__message-button {
    display: block;
    color: var(--c-primary);
    transition-property: opacity, color;
    transition-duration: var(--t);
    background-color: transparent;
    padding: 0;
    border-width: 0;
    cursor: pointer;

    &:not(.users-row__message-link_blocked):hover,
    &:not(.users-row__message-link_blocked):focus {
      color: var(--c-primary-dark);
    }

    &_blocked {
      opacity: 0.4;
    }
  }

  &__message-icon {
    display: block;
    fill: currentColor;
  }

  &__block-button {
    display: block;
    color: var(--c-gray-20);
    cursor: pointer;
    transition-property: color;
    transition-duration: var(--t);

    &:hover {
      color: var(--c-primary);
    }

    &:disabled {
      opacity: 0;
      visibility: hidden;
      cursor: default;
    }

    &_blocked {
      color: var(--c-primary);
    }
  }

  &__td {
    &--login {
      word-break: break-word;
      min-width: 170px;
    }
  }

  &__block-icon {
    display: block;
    fill: currentColor;
  }

  &__actions-toogle {
    margin-top: 100px;
  }
}

/* stylelint-disable */
.switch-button {
  position: relative;
  width: 300px;
  height: 130px;
  background: linear-gradient(
      to right,
      #fd1a15 0,
      #fc8b34 45%,
      #7fd03e 55%,
      #007177 100%
    )
    0 0;
  background-size: 650px 100%;
  border-radius: 70px;
  padding: 7px;
  cursor: pointer;
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.2) inset;
  margin-bottom: 10px;

  span {
    width: 116px;
    height: 116px;
    position: absolute;
    left: 7px;
    top: 7px;
    border-radius: 100%;
    background: #fff;
    text-align: center;
    line-height: 116px;
    font-family: 'Cabin', sans-serif;
    font-size: 35px;
    font-weight: bold;
    color: #fd1a15;
    letter-spacing: 3px;
    text-transform: uppercase;
    transition: left 500ms ease, color 500ms ease;
  }

  &.off {
    background-position: 0 0;
  }

  &.on {
    background-position-x: -350px;

    span {
      color: #007177;
      left: 177px;
    }
  }

  &:before {
    content: '开关组件';
    position: absolute;
    right: calc(100% + 10px);
    white-space: nowrap;
    padding: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 5px;
    top: 50%;
    transform: translateY(-50%);
  }

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border: 8px solid rgba(0, 0, 0, 0.5);
    border-color: transparent transparent transparent rgba(0, 0, 0, 0.5);
    right: calc(100% - 6px);
  }

  &:nth-child(2):before {
    content: '外部控制';
  }
}

input[type='button'] {
  display: inline-block;
  position: relative;
  text-decoration: none;
  font-family: 'Montserrat', arial, sans-serif;
  font-weight: 400;
  text-transform: uppercase;
  width: 11em;
  height: 4.5em;
  box-shadow: 0 3px 5px #282828;
  transition: all 0.6s cubic-bezier(0.37, 0.74, 0.15, 1.65);
  background-color: #fc2161;
  color: #fff;
  text-shadow: 0 1px 1px #b50236;
  border: none 0;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: darken(#fc2161, 10%);
  }
}
</style>
