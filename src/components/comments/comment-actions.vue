<template>
  <div class="comment__body-actions">
    <div class="action-btns">
      <slot name="comment" />
      <div v-if="!isView" @click="reply">{{ $t('button.answer') }}</div>
      <div v-if="!isCanEdit" @click="complain">
        {{ $t('complaints.complain') }}
      </div>
      <div v-if="isCanEdit" @click="edit">{{ $t('button.edit') }}</div>
      <div v-if="isCanEdit" @click="remove">{{ $t('button.remove') }}</div>
    </div>
    <div class="reactions">
      <div class="reactions__item">
        <svg
          class="reactions__item-icon"
          :class="{ active: currentReacted == 'like' }"
          @click="like"
          v-svg
          symbol="like"
          size="16"
        ></svg>
        {{ reactions.like || 0 }}
      </div>
      <div class="reactions__item">
        <svg
          class="reactions__item-icon rotate"
          :class="{ active: currentReacted == 'dislike' }"
          v-svg
          symbol="like"
          size="16"
          @click="dislike"
        ></svg>
        {{ reactions.dislike || 0 }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  reactions: {
    like: {
      type: Number,
      default: 0,
    },
    dislike: {
      type: Number,
      default: 0,
    },
  },
  isSelf: {
    type: Boolean,
    default: false,
  },
  isCanEdit: {
    type: Boolean,
    default: false,
  },
  currentReacted: {
    type: String,
    default: '',
  },
  isView: {
    type: Boolean,
    default: false,
  },
  userName: {
    type: String,
    default: '',
  },
})

const { locale } = useI18n({ useScope: 'global' })
const message = ref('')
const emit = defineEmits([
  'reply',
  'complain',
  'edit',
  'remove',
  'like',
  'dislike',
])
const reply = () => {
  emit('reply')
}
const complain = () => {
  emit('complain')
}
const edit = () => {
  emit('edit')
}
const remove = () => {
  emit('remove')
}
const like = () => {
  emit('like')
}
const dislike = () => {
  emit('dislike')
}
</script>

<style lang="scss">
.comment__body-actions {
  display: flex;
  .action-btns {
    display: flex;
    gap: 8px;
    > div,
    > a {
      cursor: pointer;
      color: var(--c-gray-20);
      transition: 0.15s linear;
      font-size: 14px;
      font-weight: 400;
      &:hover {
        filter: brightness(0.5);
        text-decoration: underline;
      }
    }
  }
  .reactions {
    margin-left: auto;
    display: flex;
    font-size: 14px;
    gap: 8px;
    &__item {
      gap: 4px;
      display: flex;
      align-items: center;
      &-icon {
        fill: var(--c-gray-20);
        transition: fill 0.15s linear;
        cursor: pointer;
        &.active,
        &:hover {
          fill: var(--c-primary);
        }
        &.rotate {
          transform: rotate(180deg) translateY(-2px);
        }
      }
    }
  }
}
</style>
