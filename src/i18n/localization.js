import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import pluralRules from './rules/pluralization'

export default createI18n({
  legacy: false,
  locale: 'ru-RU',
  globalInjection: true,
  messages,
  pluralRules
})
