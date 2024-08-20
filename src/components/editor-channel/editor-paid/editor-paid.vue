<template>
    <div class="editor-paid">
        <!-- <div class="editor-paid__item">
            <div class="editor-paid__subtitle">{{$t('channel.postPrivate')}}</div>
            <Radio class="editor-paid__item" v-for="(item, index) in modeList" :id="item.value" :key="index" :defaultRadio="item.default" nameGroup="mode" :values="item.value" :label="item.label" :modelValue="paidData.type" v-model="paidData.type"></Radio>
        </div> -->
        <div class="editor-paid__item" v-if="paidData.type !== 'subscription'">
            <div class="editor-paid__subtitle">{{$t('channel.postAccess')}}</div>
            <VInpuSelect class="editor-paid__select" v-if="paidData.price !== null" v-model="localValue" :id="paidData.payCurrency" :prefix="activeSelect.prefix" placeholder="0.00" :activeCurrency="paidData.price.currency" :currencyList="currencyList" @setCurrency="setCurrency" type="text" :v="v"></VInpuSelect>
            <Hint class="editor-paid__hint" :label="$t('channel.buyingCost')"></Hint>
            <Commission></Commission>
						<Hint class="editor-paid__hint" :label="$t('channel.madePayment')" href="/profile-settings?tab=paid" :hrefText="$t('user.profileSettings')" target="_blank"></Hint>
						<div class="mt-2 text-sm text-red-900">{{codeMessage}}</div>
        </div>
    </div>
</template>

<script>
import VInpuSelect from 'src/components/v-input-select/v-input-select.vue'
import Hint from 'src/components/hint/hint.vue'
import Radio from 'src/components/radio/radio.vue'
import Commission from 'src/components/editor-channel/editor-commission/editor-commission.vue'

export default {
  name: 'EditorPaid',
  components: {
    Hint,
    VInpuSelect,
    // Radio,
    Commission,
  },
  props: {
    v: {
      type: [Object, Boolean],
      default: () => ({}),
    },
    modelValue: {
      type: [String, Boolean, Number],
      default: '0',
    },
    paidData: {
      type: Object,
      default: null,
    },
    codeMessage: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      commission: '0',
      dropdown: false,
      price: '',
      activeSelect: { value: 'USD', prefix: '$' },
      modeList: [
        { value: 'one_time', label: 'channel.purchaseOneTime', default: true },
        { value: 'subscription', label: 'channel.setSubscription', default: false },
        { value: 'both', label: 'channel.optionsBoth', default: false },
      ],
      currencyList: {
        USD: '$',
        RUB: '&#8381;',
      },
    }
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  watch: {
    localValue() {
      if (this.localValue.match(/[^\d\.\,]]/)) this.$emit('update:modelValue', this.localValue.replace(/[^\d\.\,]+/, ''))
    },
  },
  methods: {
    setCurrency(currency) {
      this.$emit('setCurrency', currency)
    },

  },
}
</script>
<style lang="scss">
.editor-paid {
  &__select {
    margin-bottom: 24px;
  }

  &__subtitle {
    font-size: 22px;
    color: var(--c-gray-80);
    margin-bottom: 24px;
  }

  &__item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__hint {
    margin-bottom: 16px;
  }

  .radio__label {
    font-weight: var(--fw-600);
    color: var(--c-gray-70);
  }
}
</style>
