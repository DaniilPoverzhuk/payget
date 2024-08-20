<template>
    <div class="chart-filter" :class="{'chart-filter--filterDown': !view}">
        <div class="chart-filter__inner"><div v-if="view && $matchMedia.desktop" :class="{'chart-filter__inner__opacity': forWidthOpacity}">
            <div class="chart-filter__list" v-for="(filter, key ) in data" :some-data="key" :key="key">
                <div class="chart-filter__wrap">
                    <p class="chart-filter__val">{{$t(filterText(key))}}:&nbsp;</p><b class="filter__val chart-filter__label" v-text="key == 'country' ? countryText(filter) : filter"></b><button class="chart-filter__close" @click="$emit('closeFilter', [...key])"><svg class="chart-filter__icons" v-svg symbol="close" size="20"></svg></button>
                </div>
            </div>
            </div><button class="filterDown__toggle" v-else-if="Object.keys(data).length > 0" :class="[filterDown && 'filterDown__toggle_active']" type="button" @click="filterDown = !filterDown">{{ $t('filter.title') }}<svg class="filterDown__toggle-icon" v-svg :class="filterDown && 'filterDown__toggle-icon_active'" symbol="arrow"></svg></button>
            <ul class="filterDown__list" v-if="filterDown && Object.keys(data).length > 0 && !view" v-click-outside="() => {filterDown = !filterDown}">
                <li class="filterDown__item" v-for="(filter, i) in data" :key="i">
                    <div class="filterDown__link" @click="chooseBooking(i)">
                        <p class="chart-filter__val">{{$t(filterText(i))}}:&nbsp;</p><b class="chart-filter__val chart-filter__label" v-text="i == 'country' ? countryText(filter) : filter"></b>
                    </div><button class="chart-filter__close" @click="$emit('closeFilter', [i])"><svg class="chart-filter__icons" v-svg symbol="close" size="20"></svg></button>
                </li>
                <li class="filterDown__item"><button class="filterDown__link chart-filter__val" @click="clearFilter()">{{ $t('filter.clearFilter') }}</button></li>
            </ul>
        </div>
    </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import dateFormatter, {countries, filterLanguage } from '../../formatters'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')


export default {
  name: 'chartFilter',
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      filterDown: false,
      view: true,
      forWidthOpacity: false,
    }
  },
  computed: {
    ...mapUserState(['graphStore']), // remove,
  },
  watch: {
    graphStore() {
      this.checkWidth()
    },
  },
  methods: {
    countryText(text) {
      return countries(text)
    },
    filterText(text) {
      return filterLanguage(text) || text
    },
    checkWidth() {
      this.view = true
      this.forWidthOpacity = true
      setTimeout(() => {
        const conteiner = document.querySelector('.chart__head').clientWidth
        const sum = document.querySelector('.chart__box').clientWidth + document.querySelector('.chart__dropdown').clientWidth
        this.view = conteiner >= sum
        this.forWidthOpacity = false
        // this.filterDown = false
      }, 100)
    },
    clearFilter() {
      const keys = []
      for (const key in this.data) {
        keys.push(key)
      }
      this.$emit('closeFilter', keys)
      this.filterDown = false
    }
  }
}
</script>

<style lang="scss">
.chart-filter {
  display: flex;
  align-items: center;
  position: relative;

  @media (min-width: 1200px) {
    margin-left: 24px;
  }

  &--filterDown {
    width: 100%;
  }

  &__inner {
    display: flex;
    margin-left: auto;
    margin-right: 0;

    &__opacity{
      opacity: 0;
    }
  }

  &__wrap {
    display: flex;
    align-items: center;
    border: 1px solid #E6E6EA;
    box-sizing: border-box;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    padding: 7px 16px 7px;
    margin-right: 9px;
  }

  &__val {
    font-size: 14px;
    line-height: 22px;
    color: var(--c-gray-80);
    text-transform: initial;
    white-space: nowrap;
  }

  &__icons {
    fill: var(--c-gray-80);
  }

  &__close {
    margin-left: 8px;
    width: 20px;
    height: 20px;
  }

  &__label {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 185px;
  }

  .filterDown {
    position: relative;

    &__toggle {
      display: inline-block;
      padding: 9px 36px 9px 16px;
      background-color: var(--c-white);
      font-weight: 800;
      font-size: var(--fz-sm);
      line-height: var(--lh-sm);
      cursor: pointer;
      position: relative;
      color: var(--c-gray-80);
      border: 1px solid #E6E6EA;
      box-sizing: border-box;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border-radius: 6px;

      @media (min-width: 1200px) {
        margin-right: 16px;
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

    &__list {
      font-weight: 600;
      font-size: var(--fz-xl);
      line-height: var(--lh-sm);
      width: 350px;
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background-color: var(--c-white);
      box-shadow: 2px 3px 17px rgba(29, 43, 65, 0.1);
      z-index: 10;
      padding: 8px 0;

    }

    &__link {
      text-decoration: none;

      @media (min-width: 1200px) {
        display: flex;
        outline: none;
        cursor: pointer;
        width: 290px;


        & * {
          line-height: 1;
        }
      }
    }

    &__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      width: 350px;

      &:last-child {
        border-top: 1px solid var(--c-gray-10);
      }

      &:hover,
      &:focus {
        background-color: var(--c-gray-10);
      }

      &:active {
        color: var(--c-white) !important;
        background-color: var(--c-primary) !important;
        .chart-filter__val {
          color: var(--c-white);
        }
        .icon{
          fill: var(--c-white);
        }
      }

      &_active {
        color: var(--c-gray-70);
      }
    }
  }
}
</style>
