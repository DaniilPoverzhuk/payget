<template>
  <div class="captcha">
    <div class="captcha__body">
      <img class="captcha__image"
        v-if="captchaUrl"
        :src="captchaUrl"
        alt=""/>
      <Loader v-else/>
    </div>
    <button class="captcha__reload-button" type="button" @click="getCaptcha">
      <svg class="captcha__reload-icon" v-svg size="32" symbol="refresh"></svg>
    </button>
  </div>
</template>

<script>
import Loader from 'src/components/extends/loader/loader.vue'
import { useQuasar } from 'quasar'

export default {
  name: 'Captcha',
  components: {
    Loader,
  },
  setup () {
    const $q = useQuasar()
    return {
      showNotif () {
        $q.notify({
          message: this.$error,
          caption: '5 minutes agos',
          color: 'secondary'
        })
      }
    }
  },
  data() {
    return {
      captchaUrl: null,
    }
  },
  mounted() {
    this.getCaptcha()
  },
  methods: {
    async getCaptcha() {
      this.captchaUrl = null


      try {
        // this.$error.show(message)

        const {data: {data, status, message}} = await this.$api({
          url: 'user/login/captcha',
        })
        if (status) {
          this.captchaUrl = data.image
          this.$emit('load', data.code)
        } else {
          this.$error.show(message)
        }
      } catch(e) {
        this.$error.show(e)
      }
    },
  }
}
</script>

<style lang="scss">
.captcha {
  display: flex;
  justify-content: space-between;
  align-items: center;

  *:first-child {
    margin-top: 0;
  }
}

.captcha__body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: calc(100% - 42px);
  max-width: 300px;
}

.captcha__image {
  display: block;
  border-radius: var(--bdrs-default);
  max-width: 100%;
}

.captcha__reload-button {
  width: 32px;
  height: 32px;
  border-width: 0;
  padding: 0;
  background-color: transparent;
  margin: 0;
  cursor: pointer;
  color: var(--c-gray-80);
  display: flex;
}

.captcha__reload-icon {
  display: block;
  fill: currentColor;
  margin: auto;
}
</style>
