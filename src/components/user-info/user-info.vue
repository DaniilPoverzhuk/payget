<template lang="pug">
div.user-info(
  v-if='accessToken && $matchMedia.mobile'
)
  div.user-info__avatar {{ nameFirstLetter }}
  div.user-info__body
    div.user-info__name {{ name }}
    div.user-info__logout
      button.user-info__logout-button(
        type='button'
        @click='logOut'
      ) {{ $t('menu.exit') }}
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapState: mapUserState, mapActions: mapUserActions } =
  createNamespacedHelpers('user')

export default {
  name: 'UserInfo',
  computed: {
    ...mapUserState(['accessToken', 'name']),
    nameFirstLetter() {
      return this.name ? this.name[0].toUpperCase() : ''
    },
  },
  methods: {
    ...mapUserActions(['logOut']),
  },
}
</script>

<style lang="scss">
.user-info {
  padding: 0 20px 24px;
  margin-bottom: 30px;
  display: flex;
  border-bottom: 1px solid var(--c-gray-10);
  justify-content: space-between;
}

.user-info__avatar {
  width: 40px;
  height: 40px;
  align-self: flex-start;
  border-radius: var(--bdrs-sm);
  background-color: var(--c-primary-light);
  line-height: var(--lh-xs);
  padding: 10px 0;
  text-align: center;
  font-weight: 50;
  font-size: var(--fz-avatar);
}

.user-info__body {
  width: calc(100% - 52px);
}

.user-info__name {
  font-weight: 800;
  font-size: var(--fz-md);
  line-height: var(--lh-sm);
}

.user-info__logout {
  margin-top: 8px;
  font-size: var(--fz-xs);
  line-height: var(--fz-sm);
}

.user-info__logout-button {
  color: var(--c-gray-70);
  padding: 0;
  background-color: transparent;
}
</style>
