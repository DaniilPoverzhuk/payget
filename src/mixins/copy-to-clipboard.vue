<script>
import { Notify } from 'quasar'
export default {
  methods: {
    copyToClipboard(value, message = 'referralCopyLink') {
      const fakeInput = document.createElement('input')

      fakeInput.type = 'text'
      fakeInput.value = value
      fakeInput.className = 'visually-hidden'
      document.body.append(fakeInput)
      fakeInput.select()
      fakeInput.setSelectionRange(0, 99999)
      document.execCommand('copy')
      fakeInput.remove()

      Notify.create({ message: this.$t(message), type: 'info' })
    },
  },
}
</script>
