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
        required: 'Обязательное поле',
        url: 'Адрес введен не верно',
        notSameAsLogin: 'Никнейм должен отличаться от логина',
        sameAsPassword: 'Пароли не совпадают',
        email: 'Не соответствует формату электронной почты',
        min: `Не может быть менее ${this.min}`,
        max: `Не может быть более ${this.max}`,
        minLength: `Не может быть менее ${this.minLength} символов`,
        maxLength: `Не может быть более ${this.maxLength} символов`,
        alphaNumUnder: 'В этом поле можно использовать только буквы, цифры и символ подчеркивания',
        alphaNum: 'В этом поле можно использовать только латинские буквы, цифры и символ подчеркивания',
        minValue: `Должно быть более ${this.minValue}`,
        maxValue: `Должно быть не более ${this.maxValue}`,
        integer: 'Должно быть целым числом',
        href: 'Введите корректные реквизиты',
        trustedUrl: 'Введите ссылку для прямого перехода к оплате',
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
