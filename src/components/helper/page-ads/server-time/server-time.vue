<template lang="pug">
  div.server-time
    button.server-time__toggle(
      type='button'
    )   {{ $t('auth.serverTime') }}
      div.v-input__tooltip-container(
        tabindex='0'
      )
        span.v-input__visually-hidden Info:
        svg.v-input__tooltip-trigger(
          v-svg
          aria-hidden='true'
          size='16'
          symbol='info'
        )
        <q-tooltip anchor="bottom middle" self="center left">{{hint}}</q-tooltip>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const {
  mapState: mapUserState,
} = createNamespacedHelpers('user')
export default {
  name: 'ServerTime',
  data() {
    return {
      hint: 'Время сервера',
    }
  },
  computed: {
    ...mapUserState(['server_time']),
  },
}
</script>

<style lang="scss">
.server-time {
  margin-top: 10px;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;

  &__toggle {
    padding: 14px 0;
    border-radius: var(--bdrs-default);
    background-color: var(--c-primary-light);
    font-weight: 800;
    font-size: var(--fz-sm);
    line-height: var(--lh-sm);
    position: relative;
    color: var(--c-gray-80);
  }
}
</style>
