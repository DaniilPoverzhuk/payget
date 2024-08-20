<template>
  <div class="flex w-full flex items-center">
    <div
      class="flex items-center max-w-full xs:max-w-300 w-width-calc-captcha h-24"
      :class="!captchaUrl && 'justify-center'"
    >
      <img
        v-if="captchaUrl"
        class="pl-1 rounded-lg"
        :src="captchaUrl"
        alt="captcha"
      >
      <Loader v-else />
    </div>
    <button
      class="ml-auto"
      type="button"
      @click="getCaptcha"
    >
      <svg
        v-svg
        class="text-gray-400"
        size="32"
        symbol="refresh"
      />
    </button>
  </div>
</template>

<script>
import Loader from 'src/components/extends/loader/loader.vue'

export default {
  name: 'Captcha',
  components: {
    Loader,
  },
  data () {
    return {
      captchaUrl: null,
    }
  },
  created () {
    this.getCaptcha()
  },
  methods: {
    async getCaptcha () {
      this.captchaUrl = null

      try {
        const { data: { data, status, message } } = await this.$noAuth({
          url: 'user/login/captcha',
        })
        if (status) {
          this.captchaUrl = data.image
          this.$emit('load', data.code)
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
