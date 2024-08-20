<template lang="pug">
div.user-deposit(
  v-click-outside='() => {isOpen = false}'
)
  button.user-deposit__button(
    @click='toggleDropdown'
  )
    span {{ $t('deposit.title') }}
    svg.user-deposit__button-icon(
      v-svg
      :class='isOpen && "user-deposit__button-icon_active"'
      symbol='arrow'
    )
  ul.user-deposit__dropdown(
	class="lg:shadow-lg lg:rounded-lg lg:border lg:border-gray-100 lg:dark:border-gray-800"
    v-if='isOpen'
  )
    li.user-deposit__item
      span.user-deposit__label {{ $t('deposit.totalAmount') }}:
      span.user-deposit__value {{ totalDeposit }} BTC
    li.user-deposit__item
      span.user-deposit__label {{ $t('deposit.freeAmount') }}:
      span.user-deposit__value {{ user.deposit }} BTC
    li.user-deposit__item
      span.user-deposit__label {{ $t('deposit.hold') }}:
      span.user-deposit__value {{ user.deposit_hold }} BTC
</template>

<script>
export default {
  name: 'UserDeposit',
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isOpen: false,
    }
  },
  computed: {
    totalDeposit() {
      return +this.user.deposit + +this.user.deposit_hold
    },
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
  },
}
</script>

<style lang="scss">
.user-deposit {
  position: relative;
  color: var(--c-gray-70);
}

.user-deposit__button {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
}

.user-deposit__button-icon {
  display: block;
  width: 7px;
  height: 4px;
  margin-left: 9px;
  transition-property: transform;
  transition-duration: var(--t);

  &_active {
    transform: rotate(-180deg);
  }
}

.user-deposit__dropdown {
  position: absolute;
  top: 100%;
  left: -20px;
  background-color: var(--c-white);
  text-align: left;
  padding: 20px;
  border-radius: var(--bdrs-default);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
  @media (min-width: 1200px) {
    z-index: 1;
  }
}

.user-deposit__item {
  white-space: nowrap;
  display: flex;
  justify-content: space-between;

  &:nth-child(n + 2) {
    margin-top: 3px;
  }
}

.user-deposit__label {
  font-weight: 600;
}

.user-deposit__value {
  margin-left: 12px;
}
</style>
