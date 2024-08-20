<template >
    <div class="current-visitors" v-if="data != null">
        <p class="current-visitors__text">{{data}} {{ $t('statistics.visitorsActive') }}</p>
    </div>
</template>

<script>
import axiosPlausible from 'src/axios-plausible'

export default {
  name: 'CurrentVisitors',
  data() {
    return {
      data: null,
    }
  },
  async mounted() {
    await this.getData()
  },
  methods: {
    async getData() {
      try {
        const { status, data } = await axiosPlausible({
          method: 'get',
          url: '/current-visitors',
          params: { key: process.env.VUE_APP_STATISTICS_KEY },
        })

        if (status) {
          this.data = data
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.current-visitors {

  &__text {
    color: var(--c-gray-70);
    font-size: var(--fz-sm);
    font-weight: var(--fw-600);
    display: flex;
    align-items: center;

    &:before {
      content: '';
      width: 8px;
      height: 8px;
      display: block;
      background: #3ABF8F;
      margin-right: 16px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  }
}

</style>
