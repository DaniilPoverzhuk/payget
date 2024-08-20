<template>
  <div>
    <div class="flex items-center mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
      <span>{{$t('ads.operatingExchanger')}}</span>
      <DynamicHint
        v-if="hint"
        :hint="hint"
        class="inline-block pl-1"
      />
    </div>
    <template
      v-for="(item, index) in modeList"
        :key="index"
    >
      <VRadio
        :id="'mode' + index"
        v-model="modeLocal"
        name-group="mode"
        :values="item.value"
        :label="item.label"
        :model-value="modeLocal"
        :class="{'mt-4' : index !== 0 }"
      />
    </template>
    <div
      v-if="modeLocal == 'schedule'"
      class="space-y-4 mt-6"
    >
      <TimeGroup
        v-for="(item, dayAlias) in time"
        :key="dayAlias"
        v-model="time[dayAlias]"
        :label="item.alias"
        :model-value="time[dayAlias]"
      />
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import TimeGroup from 'src/components/v-input-time/time.vue'
import VRadio from 'src/components/extends/v-radio/v-radio.vue'
import DynamicHint from 'src/components/dynamic-hint/dynamic-hint.vue'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')

export default {
  name: 'TimeWorkMenu',
  components: {
    TimeGroup,
    VRadio,
    DynamicHint,
  },
  props: {
    time: {
      type: Object,
      default() {
        return {}
      },
      required: true,
    },
    modeValue: {
      type: String,
      default: 'empty',
    },
  },
  data() {
    return {
      modeList: [
        { value: 'empty', label: 'ads.clockAround' },
        { value: 'schedule', label: 'ads.workingHours' },
      ],
      modeLocal: '',
      dropdown: false,
    }
  },
  computed: {
    ...mapUserState(['server_time']),
    hint() {
      return `<strong> ${this.$t('auth.serverTime')}: ${this.server_time}</strong><br/><br/>
       ${this.$t('ads.shownCustomers')}`
    },
  },
  watch: {
    time: {
      handler(value) {
        this.$emit('onChange', value)
      },
      deep: true,
    },
    modeValue: {
      handler(value) {
        this.modeLocal = value
      },
      deep: true,
    },
    modeLocal: {
      handler(value) {
        this.$emit('onChangeMode', value)
      },
    },
  },
  async created() {
    this.modeLocal = this.modeValue
  },
}
</script>
