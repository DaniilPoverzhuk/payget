<template>
  <div class="show-more">
    <span> {{ t('comments.showMore') }} </span>
    <span>
      <svg
        v-if="loading"
        v-svg
        class="w-6 h-6 absolute animate-spin border border-transparent"
        symbol="spinner"
      />
    </span>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.show-more {
  font-size: 14px;
  color: var(--c-primary);
  cursor: pointer;
  display: flex;
  gap: 12px;
  &:hover {
    text-decoration: underline;
  }
}
</style>
