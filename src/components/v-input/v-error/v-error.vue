<template lang="pug">
div.v-input-error(
  :class='this.v.$error && "v-input-error_error"'
)
  template(
    v-for='(error, i) in relevantErrors'
  ) {{ errorText(error, i) }}
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
        email: this.$t('error.email'),
        min: this.$t('error.min', { val: this.min }),
        max: this.$t('error.max', { val: this.max }),
        minLength: this.$t('error.minLength', { val: this.minLength }),
        maxLength: this.$t('error.maxValue', { val: this.maxLength }),
        alphaNumUnder: this.$t('error.alphaNumUnder'),
        alphaNum: this.$t('error.alphaNum'),
        minValue: this.$t('error.minValue', { val: this.minValue }),
        maxValue: this.$t('error.maxValue', { val: this.maxValue }),
        integer: this.$t('error.integer'),
        href: this.$t('error.href'),
        trustedUrl: this.$t('error.trustedUrl'),
      }
    },
    min() {
      if (this.v.$params.min) return this.v.$params.min.min
      return ''
    },
    max() {
      if (this.v.$params.max) return this.v.$params.max.max
      return ''
    },
    minLength() {
      if (this.v.$params.minLength) return this.v.$params.minLength.min
      return ''
    },
    maxLength() {
      if (this.v.$params.maxLength) return this.v.$params.maxLength.max
      return ''
    },
    minValue() {
      if (this.v.$params.minValue) return this.v.$params.minValue.min
      return ''
    },
    maxValue() {
      if (this.v.$params.maxValue) return this.v.$params.maxValue.max
      return ''
    },
    relevantErrors() {
      if (!this.v.$error) return []
      return Object.keys(this.v)
        .filter(key => key[0] !== '$' && !this.v[key])
        .map(error => this.allErrors[error])
    },
  },
  methods: {
    errorText(error, i) {
      return (i ? ' and' : '') + (i ? error.slice(this.label.length) : error)
    },
  },
}
</script>

<style lang="scss">
.v-input-error {
  margin-top: 6px;
  font-size: var(--fz-xs);
  line-height: var(--lh-sm);

  &_error {
    color: var(--c-alert);
  }
}
</style>
