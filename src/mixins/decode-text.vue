<script>
export default {
  methods: {
    decodeText(text,  cutTags) {
      const words = this.$CryptoJS.enc.Hex.parse(text)
      const wordsEnc = words.toString(this.$CryptoJS.enc.Utf8)
      if (!wordsEnc) {
        return ''
      }
      const messageEnc = wordsEnc.split('||')
      let message = this.$CryptoJS.AES.decrypt(messageEnc[0], messageEnc[1])
      message = message.toString(this.$CryptoJS.enc.Utf8)
      if(cutTags) {
        message = message.replace(/<\/?(\s|\S)*?>/g, ' ').replace(/(&nbsp;|\s| ){2,}/g, ' ').trim()
      }
      return message
    },
  },
}
</script>