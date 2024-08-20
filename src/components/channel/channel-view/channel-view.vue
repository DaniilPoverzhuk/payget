<template>
  <div class="channel-view">
    <div class="channel-view__wrap">
      <div class="channel-view__item">
        <svg
          class="channel-view__icon"
          v-svg
          aria-hidden="true"
          size="24"
          symbol="view"
        ></svg>
        <div class="channel-view__text">{{ viewed }}</div>
      </div>
      <button
        class="channel-view__item channel-view__item--btn"
        @click="setLike('like')"
        :class="{ active: currentReacted == 'like', noauth: !role }"
      >
        <svg class="channel-view__icon" v-svg symbol="like" size="20"></svg>
        <div
          class="channel-view__text"
          v-text="reactions.like ? reactions.like : 0"
        ></div>
      </button>
      <button
        class="channel-view__item channel-view__item--btn"
        @click="setLike('dislike')"
        :class="{ active: currentReacted == 'dislike', noauth: !role }"
      >
        <svg
          class="channel-view__icon channel-view__icon--rotate"
          v-svg
          symbol="like"
          size="20"
        ></svg>
        <div
          class="channel-view__text"
          v-text="reactions.dislike ? reactions.dislike : 0"
        ></div>
      </button>
      <div class="channel-view__item">
        <svg
          class="channel-view__icon"
          width="20"
          height="14"
          viewBox="0 0 20 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.99997 0.451294C5.00597 0.451294 0.935974 3.1795 0.935974 6.56411C0.935974 8.32822 2.03597 9.92822 3.81797 11.0359C3.53197 11.7949 3.09197 12.4923 2.54197 13.0462C2.16797 13.4154 2.51997 14.0103 3.06997 13.8872C4.30197 13.6205 5.42397 12.9846 6.12797 12.0821C7.29397 12.4513 8.61397 12.6769 9.99997 12.6769C14.994 12.6769 19.064 9.92822 19.064 6.56411C19.064 3.20001 14.994 0.451294 9.99997 0.451294Z"
            fill="#B6B4C1"
          />
        </svg>
        <div class="channel-view__text">{{ comments }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'channel-view',
  props: {
    viewed: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    idPost: {
      type: Number,
      default: 0,
    },
    reactions: {
      type: Object,
      default: null,
    },
    currentReacted: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapUserState(['role']),
  },
  methods: {
    setLike(type) {
      if (this.role) {
        this.fetchPost(type)
      }
    },
    async fetchPost(type) {
      try {
        const { data } = await this.$instance({
          method: 'post',
          url: `/userfeed/post/${type}`,
          data: {
            post_id: this.idPost,
          },
        })
        if (data) {
          this.$emit('setReacted', data.data, type)
        }
      } catch (e) {
        console.log('e', e)
        this.$error.show('fetchPost', e)
      }
    },
  },
}
</script>

<style lang="scss">
.channel-view {
  &__wrap {
    display: flex;
    padding-top: 24px;
  }

  &__icon {
    margin-right: 8px;
    fill: var(--c-gray-20);

    @media (min-width: 1200px) {
      margin-right: 16px;
    }

    &--rotate {
      transform: rotate(180deg) translateY(-2px);
    }
  }

  &__text {
    color: var(--c-gray-70);
    font-size: 16px;
    line-height: 24px;
    font-weight: var(--fw-500);
  }

  &__item {
    display: flex;
    align-items: center;
    margin-right: 44px;

    @media (min-width: 1200px) {
      margin-right: 64px;
    }

    &--btn {
      cursor: pointer;

      &.active,
      &:hover:not(.noauth) {
        .channel-view__text {
          color: var(--c-primary);
        }

        .icon {
          fill: var(--c-primary);
        }
      }
      &.noauth {
        cursor: auto;
      }
    }

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
