<template>
  <div>
      <!-- <Portal>
    <div
      v-if="visible"
      :class="backdropActiveClass"
      :style="`transition-duration: ${animationDuration}ms`"
      class="fixed inset-0 bg-popup bg-opacity-75 z-100"
    />
  </Portal> -->
  </div>

</template>

<script>

// переделать на квазар диалоги
export default {
  name: 'Backdrop',
  props: {
    modelValue: {
      type: Boolean,
      required: false,
      default: false
    },
    animationDuration: {
      type: Number,
      default: 250,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      visible: false,
      backdropActiveClass: null,
      waitingTimer: null,
    }
  },
  watch: {
    modelValue(value) {
      if (value) {
        clearTimeout(this.waitingTimer)

        const scrollY = window.scrollY || document.documentElement.scrollTop

        this.visible = true

        if (window.innerWidth > document.documentElement.clientWidth) {
          document.documentElement.classList.add('backdrop-has-scrollbar')
        }

        document.body.style.marginTop = `-${scrollY}px`
        document.documentElement.classList.add('backdrop-noscroll')
        document.body.classList.add('backdrop-fixed')

        setTimeout(() => {
          this.backdropActiveClass = 'backdrop_active'
        })
      } else {
        this.waitingTimer = setTimeout(() => {
          const newScrollTop = -document.body.style.marginTop.slice(0, -2)

          this.backdropActiveClass = null
          document.documentElement.classList.remove('backdrop-has-scrollbar', 'backdrop-noscroll')
          document.body.classList.remove('backdrop-fixed')
          document.body.style.marginTop = null
          window.scrollTo(null, newScrollTop)

          setTimeout(() => {
            this.visible = false
          }, this.animationDuration)
        })
      }
    },
  },
}
</script>

<style lang="scss">
.backdrop-noscroll {
  @apply overflow-y-hidden h-full
}

.backdrop-has-scrollbar {
  @apply overflow-y-scroll
}

.backdrop-fixed {
  @apply overflow-hidden
}

</style>
