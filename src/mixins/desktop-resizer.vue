<script>

export default {
  data() {
    return {
      isDesktop: false,
    }
  },
  async created() {
    this.resizeHandler()
    if(typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeHandler)
    }
  },
  unmounted() {
    if(typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler)
    }
  },
  methods: {
    resizeHandler() {
      if(typeof window !== 'undefined') {
        this.isDesktop = !window.matchMedia('(max-width: 460px)').matches
      }
    },
  },
}
</script>
