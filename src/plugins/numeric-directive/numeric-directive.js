export const NumericDirective = {
  mounted(el) {
    el.addEventListener('input', function (e) {
      const inputValue = e.target.value.replace(/\D/g, '')
      e.target.value = inputValue
    })
  }
}