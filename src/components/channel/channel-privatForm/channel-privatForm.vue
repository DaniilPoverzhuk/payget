<template>
  <div class="channel-privat">
    <div class="channel-privat__inner"><img class="channel-privat__logo" src="~/assets/img/twixim.svg" />
        <div class="channel-privat__wrap">
            <p class="channel-privat__descr">{{$t('channel.privatePublication')}}</p>
            <div class="channel-privat__cards lg:space-x-4 xs:space-y-4">
                <div class="channel-privat__card card flex-grow" v-if="post.private.type !== 'subscription'" :class="{'card--active': payMethod == 'one', 'lg:w-2/4 ':  post.private.type == 'both'}" @click="payMethod = 'one'">
                    <div class="card__title">{{$t('channel.purchaseOneTime')}}</div>
                    <div class="card__price">{{post.private.price.cost}} {{post.private.price.currency}}</div>
                </div>
                <div class="channel-privat__card card flex-grow" v-if="post.private.type !== 'one_time' && plans !== null && Object.keys(plans).length > 0" :class="{'card--active': payMethod == 'rate', 'lg:w-2/4':  post.private.type == 'both' }" @click="payMethod = 'rate'">
                    <div class="card__title">{{$t('channel.channelPaid')}}</div>
					<VSelect class="card__select" v-if="minRateSelectList.length > 0" v-model="minRateSelect" :select-list="minRateSelectList[0].list"></VSelect>
                    <div class="card__price" v-if="plans !== null">{{plans[minRateSelect].cost}} {{plans[minRateSelect].currency}}</div>
                </div>
            </div>
            <div class="channel-privat__hints">
                <Hint class="editor-paid__hint flex justify-center" :label="$t('channel.subscriptionCharged')"></Hint>
                <Hint class="editor-paid__hint flex justify-center" v-if="!error" :label="$t('channel.ifNecessary')" href="/deposit" :hrefText="$t('channel.ifNecessaryDeposit')"></Hint>
                <Hint class="editor-paid__hint flex justify-center" v-if="error" :label="$t('channel.insufficientPurchase')" href="/deposit" :error="error" :hrefText="$t('channel.ifNecessaryDeposit')"></Hint>
            </div><button class="button button_size_lg editor-channel__btn" @click="getPost" v-text="$t(payMethod == 'one' ? 'channel.postSubscribe' : 'channel.channelSubscribe')"></button>
        </div>
    </div>
</div>

</template>

<script>
import VSelect from 'src/components/extends/v-select/v-select.vue'
import Hint from 'src/components/hint/hint.vue'

export default {
  name: 'ChannelPrivatForm',
  components: {
    VSelect,
    Hint,
  },
  props: {
    post: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      payMethod: '',
      minRateSelect: 'monthly',
      plans: null,
      error: false,
      minRateSelectList: [
        {
          label: null,
          list: [
            {
              value: 'monthly',
              text: this.$t('channel.monthly'),
            },
            {
              value: 'three_months',
              text: this.$t('channel.threeMonths'),
            },
            {
              value: 'six_months',
              text: this.$t('channel.sixMonths'),
            },
            {
              value: 'yearly',
              text: this.$t('channel.yearly'),
            },
          ],
        },
      ],
    }
  },
  mounted() {
    if (this.post.private.type !== 'one_time') this.getPlan()
    this.post.private.type !== 'subscription'
      ? (this.payMethod = 'one')
      : (this.payMethod = 'rate')
  },
  methods: {
    getPost() {
      this.payMethod == 'one' ? this.setPostOnes() : this.setPostRate()
    },
    async setPostRate() {
      try {
        const { data } = await this.$instance({
          url: `userfeed/plan/${this.plans[this.minRateSelect].id}/subscribers`,
          data: {
            plan_id: this.plans[this.minRateSelect].id,
          },
        })
        if (data.data) {
          if (data.data.created_at) {
            this.$router.push({ path: `/user/${this.post.user.name}/channel/${this.post.slug}`, params: { name: this.post.user.name, slug: this.post.slug } })
            this.$emit('hideDialog')
          }
        }
      } catch {
        this.error = true
        return false
      }
    },
    async setPostOnes() {
      try {
        const { data, status } = await this.$instance({
          url: '/userfeed/one-time-subscription',
          data: {
            post_id: this.post.id,
          },
        })
        if (data && status) {
          this.$router.push({ path: `/user/${this.post.user.name}/channel/${this.post.slug}`, params: { name: this.post.user.name, slug: this.post.slug } })
          this.$emit('hideDialog')
        }
      } catch {
        this.error = true
        return false
      }
    },
    async getPlan() {
      try {
        const { data, status } = await this.$instance({
          method: 'GET',
          url: `/userfeed/channel/${this.post.channel.id}/plan`,
          params: {
            channel_id: this.post.channel.id,
          },
        })
        if (data && data.data.length) {
          this.plans = {}
          data.data.map((el) => {
            if (el.price && el.price.cost > 0) {
              this.plans[el.type] = el.price
              this.plans[el.type].id = el.id
              if(this.minRateSelect == '') this.minRateSelect =  el.type
            }
            if (el.price && el.price.cost == 0) {
              const key = this.minRateSelectList[0].list.findIndex((item) => item.value == el.type)
              this.minRateSelectList[0].list.splice(key, 1)
              if(this.minRateSelect == el.type) this.minRateSelect = ''
            }
          })
        }
      } catch {
        this.error = true
        return false
      }
    },
  },
}
</script>

<style lang="scss">
.channel-privat {
	width: 100%;
	background-color: #fff;
  &__wrap {
    max-width: 1266px;
    margin: auto;
  }

  &__logo {
    max-width: 93px;
    margin: 0 auto 24px;
    display: block;
  }

  &__descr {
    color: var(--c-gray-80);
    margin-bottom: 24px;
    font-weight: var(--fw-600);

    @media (min-width: 1200px) {
      text-align: center;
    }
  }

  &__cards {
    margin-bottom: 24px;

    @media (min-width: 1200px) {
      display: flex;
    }
  }

  &__card {
    &:last-child {
      margin-bottom: 0;
      margin-right: 0;
    }
  }

  .card {
    cursor: pointer;
    background: var(--c-white);
    border: 1px solid var(--c-gray-15);
    box-sizing: border-box;
    border-radius: var(--bdrs-default);
    transition: 0.3s;
    padding: 16px 24px;

    @media (min-width: 1200px) {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    &:nth-child(2) {
      flex-direction: column;
      align-items: flex-start;

      @media (min-width: 1200px) {
        flex-direction: row;
        align-items: center;
      }
    }

    &__title,
    &__price {
      font-weight: var(--fw-600);
      color: var(--c-gray-70);
    }

    &__select {
      width: 100%;
      padding: 16px 0;

      @media (min-width: 1200px) {
        /*height: 38px;*/
        max-width: 237px;
        padding: 0;
      }

      .v-input__input_select {
        height: 38px;
      }
    }

    &.card--active {
      background-color: var(--c-primary);
      border-color: var(--c-primary);

      .card__title,
      .card__price,
			.card__select {
        color: white;
      }
    }

    &__hints {
      margin-bottom: 8px;
    }
  }
}
</style>
