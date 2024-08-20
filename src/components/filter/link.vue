<template>
  <div class="filter_section ml-4">
    <button class="filter_link flex items-center" @click="click">
      <svg class="filter_link-icon" v-if="stateLocal == false" v-svg symbol="filter" size="17 15"></svg>
      {{ $t(label) }}
    </button>
    <button class="filter_link content__right" v-if="!isDesktop && stateLocal === true" @click="clear">{{ $t('filter.clearFilter') }}</button>
  </div>
</template>

<script>
import DesktopResizer from 'src/mixins/desktop-resizer.vue'

export default {
  name: 'Link',
  mixins: [DesktopResizer],
  props: {
    isOpen: {
      type: Boolean,
      default: () => false,
    },
    state: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      isOpenLocal: false,
      stateLocal: false,
    }
  },
  computed: {
    label() {
      if (!this.isDesktop && this.stateLocal === true) {
        return 'filter.changeFilters'
      }

      return (this.isOpenLocal === true ? 'filter.clearFilter' : 'filter.addFilter')
    },
  },
  watch: {
    isOpen(val) {
      this.isOpenLocal = val
    },
    state(val) {
      this.stateLocal = val
    },
  },
  async created() {
    this.isOpenLocal = this.isOpen
    this.stateLocal = this.state
  },
  methods: {
    click() {
      this.isOpenLocal = !this.isOpenLocal
      this.$emit('toggleFilter', this.isOpenLocal)
    },
    clear() {
      this.isOpenLocal = false
      this.$emit('clearFilter')
    },
  },
}
</script>

<style lang="scss">
.filter_section{
  .filter {
    color: var(--c-primary);
    font-size: var(--fz-sm);

    &_section {
      padding-top: 8px;
      margin-left: 10px;

      @media (max-width: 460px) {
        margin-left: 0;
        display: flex;
        padding-top: 0;
        margin-left: 0;
        padding-right: 15px;
      }
    }

    &_link-icon {
      margin-right: 9px;
    }

    &_link {
      color: var(--c-primary);
      text-underline: none;

      @media (max-width: 460px) {
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 50%;
      }
    }
  }
}
</style>
