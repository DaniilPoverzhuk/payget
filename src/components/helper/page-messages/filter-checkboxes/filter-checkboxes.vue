<template>
  <div class="messages-filters">
    <h4 class="text-gray-700 dark:text-gray-300 font-medium text-sm mm-0.5">
      {{ $t('chat.statusFilter') }}
    </h4>
    <VSelectCheckbox
      v-model="modelCheckbox"
      placeholderData="chat.allDeals"
      :list="statusListFor"
      @update:modelValue="sendModel(modelCheckbox)"
    />
  </div>
</template>
<script>
import { createNamespacedHelpers } from 'vuex'
import statuses from 'src/mixins/statuses.vue'
import VSelectCheckbox from 'src/components/extends/v-select-checkbox/v-select-checkbox.vue'

const { mapActions: mapLayoutActions } = createNamespacedHelpers('layout')
export default {
  name: 'MessagesFilters',
  components: {
    VSelectCheckbox,
  },
  mixins: [statuses],
  data() {
    return {
      activeFilters: true,
      modelCheckbox: [],
      waiting: true,
    }
  },
  computed: {},
  mounted() {
    this.modelCheckbox = this.filterAttributes
  },
  methods: {
    ...mapLayoutActions(['setFilters']),
    sendModel(val) {
      this.waiting = false
      setTimeout(() => {
        this.setFilters(val)
        this.waiting = true
      }, 400)
    },
    // getTextStatus() {
    //   let text = ''
    //   this.statusListFor.map((item) => {
    //     if (this.modelCheckbox.includes(item.value)) text += `${this.$t(item.text)}, `
    //   })
    //   return text.slice(0, -2)
    // },
  },
}
</script>

<!--  <style lang="scss">-->
<!--    .messages-filters {-->
<!--    &__title {-->
<!--    margin-bottom: 10px;-->
<!--    font-weight: 600;-->
<!--    color: var(&#45;&#45;c-gray-70);-->
<!--    }-->

<!--    &__wrap {-->
<!--    border-radius: var(&#45;&#45;bdrs-default);-->
<!--    box-shadow: 0 1px 4px rgba(29, 43, 65, 0.1);-->
<!--    }-->

<!--    &__btn {-->
<!--    position: relative;-->
<!--    display: inline-block;-->
<!--    width: 100%;-->
<!--    color: var(&#45;&#45;c-gray-80);-->
<!--    padding: 15px 33px 16px 14px;-->
<!--    cursor: pointer;-->
<!--    background-color: var(&#45;&#45;c-white);-->
<!--    }-->

<!--    &__icon {-->
<!--    position: absolute;-->
<!--    right: 14px;-->
<!--    display: block;-->
<!--    width: 9px;-->
<!--    height: 6px;-->
<!--    top: calc(50% - 3px);-->
<!--    transition-duration: var(&#45;&#45;t);-->
<!--    fill: var(&#45;&#45;c-primary);-->

<!--    &_active {-->
<!--    transform: rotate(180deg);-->
<!--    }-->
<!--    }-->

<!--    &__checkbox {-->
<!--    padding-left: 16px;-->
<!--    padding-bottom: 14px;-->
<!--    }-->
<!--    }-->
<!--  </style>-->
