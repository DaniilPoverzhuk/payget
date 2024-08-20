<template>
  <div class="user_avatar" :class="{ empty: !src }">
    <img v-if="src" :src="src" />
    <svg v-else class="info__icon" v-svg symbol="user"></svg>
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
.user_avatar {
  min-width: 45px;
  min-height: 45px;
  max-width: 45px;
  max-height: 45px;
  margin-bottom: auto;
  margin-right: 1rem;
  img {
    min-width: 100%;
    min-height: 100%;
    border-radius: 50%;
  }
  &.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--c-secondary);
    svg {
      padding-left: 1px;
      height: 24px;
      width: 24px;
    }
  }
}
</style>
