<template>
  <div class="mt-2 lg:text-sm text-xs text-red-900">
    <div v-if="relevantErrors && relevantErrors.length">
      {{ relevantErrors[0] }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    v: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  computed: {
    allErrors() {
      return {
        required: this.$t('error.required'),
        url: this.$t('error.url'),
        notSameAsLogin: this.$t('error.notSameAsLogin'),
        sameAsPassword: this.$t('error.sameAsPassword'),
        sameAs: this.$t('error.sameAsPassword'),
        email: this.$t('error.email'),
        // min: this.$t('error.min', { val: this.min }),
        // max: this.$t('error.max', { val: this.max }),
        minLength: this.$t('error.minLength', {
          val: this.v.minLength?.$params.min,
        }),
        maxLength: this.$t('error.maxLength', {
          val: this.v.maxLength?.$params.max,
        }),
        alphaNumUnder: this.$t('error.alphaNumUnder'),
        // edit after discussion
        // currency: this.cost === '0' ? this.$t('error.min', { val: this.cost }) : this.$t('error.correctNumber'),
        // payPostCost: this.cost === '0' ? this.$t('error.min', { val: this.cost }) : this.$t('error.correctNumber'),
        alphaNum: this.$t('error.alphaNum'),
        minValue: this.$t('error.minValue', {
          val: this.v.minValue?.$params.min,
        }),
        maxValue: this.$t('error.maxValue', {
          val: this.v.maxValue?.$params.max,
        }),
        codeTelegramValidate: this.$t('error.tgInvalid'),
        integer: this.$t('error.integer'),
        href: this.$t('error.href'),
        trustedUrl: this.$t('error.trustedUrl'),
      }
    },
    // min () {
    //   if (this.v.$params.min) return this.v.$params.min.min
    //   return ''
    // },
    // max () {
    //   if (this.v.$params.max) return this.v.$params.max.max
    //   return ''
    // },
    // minLength () {
    //   if (this.v.$params.minLength) return this.v.$params.minLength.min
    //   return ''
    // },
    // maxLength () {
    //   if (this.v.$params.maxLength) return this.v.$params.maxLength.max
    //   return ''
    // },
    // minValue () {
    //   if (this.v.$params.minValue) return this.v.$params.minValue.min
    //   return ''
    // },
    // maxValue () {
    //   if (this.v.$params.maxValue) return this.v.$params.maxValue.max
    //   return ''
    // },
    // cost () {
    //   return this.v.$model
    // },
    relevantErrors() {
      if (!this.v.$errors) return []
      return this.v.$errors.map((x) => this.allErrors[x.$validator])
    },
  },
  methods: {
    errorText(error, i) {
      return (
        (i ? ` ${this.$t('end')} ` : '') + (i ? error.toLowerCase() : error)
      )
    },
  },
}
</script>
