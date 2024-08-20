import i18n from 'src/i18n/localization'

const { t } = i18n.global
const THOUSAND = 1000
const HUNDRED_THOUSAND = 100000
const MILLION = 1000000
const HUNDRED_MILLION = 100000000
const BILLION = 1000000000
const HUNDRED_BILLION = 100000000000
const TRILLION = 1000000000000

export function getMonthName(month, length) {
  return length == 'short' ?  t(`monthsShort.${month}`) : t(`monthsFull.${month}`)
}
export default function dateFormatter(interval, longForm) {
  return function (isoDate, index, ticks) {
    let date = new Date(isoDate)
    if (interval === 'month') {
      return t(`monthsFull.${date.getUTCMonth()}`)
    } if (interval === 'date') {
      const day =  t(`weeks.${date.getUTCDay()}`)
      const date_ = date.getUTCDate()
      const month = t(`monthsShort.${date.getUTCMonth()}`)
      return `${day}, ${date_} ${month}`
    } if (interval === 'hour') {
      const parts = isoDate.split(/[^0-9]/)
      date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
      const hours = date.getHours() // Not sure why getUTCHours doesn't work here
      return `${hours}:00`
    } if (interval === 'minute') {
      if (longForm) {
        const minutesAgo = Math.abs(isoDate)
        return minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`
      }
      return `${isoDate}м`
    }
  }
}

export function numberFormatter(num) {
  if (num >= THOUSAND && num < MILLION) {
    const thousands = num / THOUSAND
    if (thousands === Math.floor(thousands) || num >= HUNDRED_THOUSAND) {
      return `${Math.floor(thousands)} ${t('degrees.thousand')}.`
    }
    return `${Math.floor(thousands * 10) / 10} ${t('degrees.thousand')}.`
  } if (num >= MILLION && num < BILLION) {
    const millions = num / MILLION
    if (millions === Math.floor(millions) || num >= HUNDRED_MILLION) {
      return `${Math.floor(millions)} ${t('degrees.million')}.`
    }
    return `${Math.floor(millions * 10) / 10} ${t('degrees.million')}.`
  } if (num >= BILLION && num < TRILLION) {
    const billions = num / BILLION
    if (billions === Math.floor(billions) || num >= HUNDRED_BILLION) {
      return `${Math.floor(billions)}B`
    }
    return `${Math.floor(billions * 10) / 10} ${t('degrees.billion')}.`
  }
  return num
}

export function countries(country) {
  return t(`countries.${country}`)
}

export function filterLanguage(data) {
  return t(`statistics.${data}`)
}

export function shiftMonths(date, months) {
  const newDate = new Date(date.getTime())
  const d = newDate.getDate()
  newDate.setMonth(newDate.getMonth() + +months)
  if (newDate.getDate() != d) {
    newDate.setDate(0)
  }
  return newDate
}

export function isToday(date) {
  return (new Date(date).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0))
}

export function shiftArrowDays(date, days) {
  const newDate = new Date(date.getTime())
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

function pad(num, size) {
  return (`000${num}`).slice(size * -1)
}

export function durationFormatter(duration) {
  const hours = Math.floor(duration / 60 / 60)
  const minutes = Math.floor(duration / 60) % 60
  const seconds = Math.floor(duration - (minutes * 60) - (hours * 60 * 60))
  if (hours > 0) {
    return `${hours}h ${minutes} ${t('time.min')}. ${seconds}${t('time.sec')}.`
  } if (minutes > 0) {
    return `${minutes}${t('time.min')}. ${pad(seconds, 2)}${t('time.sec')}.`
  }
  return `${seconds}${t('time.sec')}.`
}
