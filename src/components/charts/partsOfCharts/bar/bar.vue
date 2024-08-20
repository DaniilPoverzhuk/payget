<template>
    <div class="bar__wrap">
        <div class="bar__line" :style="{ width: `calc(100% - ${maxWidthDeduction})`}">
            <div class="bar__plante" :style="{ width: `${width}%`}" :class="{'bar__plante--blue': bg == 'blue'}"></div>
        </div>
        <div class="bar__box">
            <div class="bar__link" @click="$emit('setFilter', data.name)"><svg class="bar__icon" v-if="isDevice(data.name)" v-svg size="20" :symbol="isDevice(data.name)"></svg><img class="bar__img" v-if="data.url" :src="`https://icons.duckduckgo.com/ip3/${data.url}.ico`" referrerPolicy="no-referrer" /><span class="bar__text">{{data.name}}</span></div>
            <div class="bar__desc">
                <div class="bar__num" :class="{'bar__num--count': data.conversion_rate || data.conversion_rate == 0}">{{ getFormat(data.count) }}</div>
                <div class="bar__num bar__num--total" v-if="data.total_count || data.total_count == 0">{{ getFormat(data.total_count) }}</div>
                <div class="bar__num bar__num--rate" v-if="data.conversion_rate || data.conversion_rate == 0">{{ data.conversion_rate }}%</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      device: [
        'Desktop',
        'Mobile',
        'Laptop',
        'Tablet'
      ]
    }
  },
  props: {
    data: {
      type: Object,
      default: null
    },
    all: {
      type: Array,
      default: null
    },
    bg: {
      type: String,
      default: 'blue'
    },
    maxWidthDeduction: {
      type: String,
      default: ''
    }
  },
  computed: {
    width() {
      let maxVal = this.all[0].count
      for (const entry of this.all) {
        if (entry.count > maxVal) maxVal = entry.count
      }
      return this.data.count / maxVal * 100
    }
  },
  methods: {
    addFilter() {

    },
    getFormat(count) {
      return count >= 1000 ? `${parseInt((count / 1000) * 10) / 10} ${this.$t('degrees.thousand')}.` : count
    },
    isDevice(name) {
      return this.device.includes(name) ? name.toLowerCase() : false
    }
  }
}
</script>
<style lang="scss">
.bar {
  &__wrap {
    position: relative;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__plante {
    width: 100%;
    height: 30px;
    opacity: 0.08;

    &--blue {
      background: var(--c-primary);
    }
  }

  &__line {
    position: absolute;
    box-sizing: border-box;
  }

  &__text {
    overflow: hidden;
    padding-right: 6px;
    text-overflow: ellipsis;
  }

  &__box,
  &__link {
    color: var(--c-gray-80);
    font-weight: var(--fw-600);
    z-index: 1;
    text-decoration: none;
  }

  &__box {
    padding-left: .5rem;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  &__link {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  &__img {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  &__icon {
    margin-right: 8px;
  }

  &__desc {
    display: flex;
  }

  &__num {

    &--rate {
      min-width: 162px
    }

    &--total {
      min-width: 90px
    }

    &--count {
      min-width: 122px
    }

  }
}
</style>
