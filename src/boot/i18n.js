import { boot } from 'quasar/wrappers'
import { createI18n, VERSION } from 'vue-i18n'
import localization from 'src/i18n/localization'

function customRule(choice, choicesLength, orgRule) {
  console.log('customRule', choice, choicesLength)
  if (choice === 0) {
    return 0
  }

  const teen = choice > 10 && choice < 20
  const endsWithOne = choice % 10 === 1
  if (!teen && endsWithOne) {
    return 1
  }
  if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
    return 2
  }

  return choicesLength < 4 ? 2 : 3
}

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(localization)
})
