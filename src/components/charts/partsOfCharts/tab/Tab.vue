<template>
    <div class="tabs" v-click-outside="() => {tabsDropDown = false}"><button class="tabs__toggle" v-if="$matchMedia.mobile" @click="tabsDropDown = true">{{ $t(tabs[activeTabs].title)}}<svg class="tabs__toggle-icon" v-svg :class="tabsDropDown && 'dropdown__toggle-icon_active'" symbol="arrow"></svg></button>
        <div class="tabs__wrap" v-if="$matchMedia.desktop || tabsDropDown"><button class="tabs__title" v-for="(tab, key) in tabs" :key="key" :class="{'tabs__title--active': activeTabs == key}" @click="$emit('setTab', key); tabsDropDown = false">{{ $t(tab.title) }}</button></div>
    </div>
</template>

<script>
export default {
  name: 'Tab',
  data() {
    return {
      tabsDropDown: false
    }
  },
  props: {
    tabs: {
      type: Array,
      default: null
    },
    activeTabs: {
      type: Number,
      default: 0
    },

  },
  computed: {}
}
</script>

<style lang="scss">
.tabs {
  position: relative;

  &__wrap {
    line-height: var(--lh-sm);
    padding: 8px 0;
    position: absolute;
    background-color: var(--c-white);
    box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1);
    border-radius: var(--bdrs-default);
    top: 42px;
    font-weight: 500;
    font-size: var(--fz-md);
    z-index: 10;
    width: 100%;

    @media (min-width: 1200px) {
      box-shadow: none;
      background: none;
      z-index: 0;
      margin: 24px 0;
      position: relative;
      padding: 0;
      top: 0;

      &:after {
        content: '';
        height: 1px;
        width: 100%;
        display: block;
        background: var(--c-gray-20);
        position: absolute;
        bottom: 0;
        z-index: -1;
      }
    }
  }

  &__title {
    padding: 8px 16px;
    cursor: pointer;
    width: 100%;

    @media (min-width: 1200px) {
      margin-right: 40px;
      padding: 0 4px 16px;
      width: auto;
      border-bottom: 2px solid transparent;
    }

    &--active {
      border-color: var(--c-primary);
      color: var(--c-primary);
    }
  }
  &__toggle {
    display: inline-block;
    padding: 9px 36px 9px 16px;
    background-color: var(--c-white);
    font-size: var(--fz-sm);
    line-height: var(--lh-sm);
    cursor: pointer;
    position: relative;
    color: var(--c-gray-80);
    border: 1px solid #E6E6EA;
    box-sizing: border-box;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    width: 100%;

    @media (min-width: 1200px) {
      display: none;
    }

    &-icon {
      position: absolute;
      right: 9px;
      display: block;
      width: 7px;
      height: 4px;
      top: calc(50% - 2px);
      fill: var(--c-gray-70);
      transition-property: transform;
      transition-duration: var(--t);

      &_active {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
