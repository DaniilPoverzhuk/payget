<template>
    <transition name="slide" @enter="enter" @after-enter="afterEnter" @leave="leave">
        <slot v-if="show"></slot>
    </transition>
</template>

<script>
export default {
  name: 'TransitionSlide',
  data() {
    return {
      show: false,
    }
  },
  mounted() {
    this.show = true
  },
  methods: {
    enter(element) {
      const { width } = getComputedStyle(element)

      element.style.width = width
      element.style.position = 'absolute'
      element.style.visibility = 'hidden'
      element.style.height = 'auto'

      const { height } = getComputedStyle(element)

      element.style.width = null
      element.style.position = null
      element.style.visibility = null
      element.style.height = 0

      if (!getComputedStyle(element).height) return

      requestAnimationFrame(() => {
        element.style.height = height
      })
    },
    afterEnter(element) {
      element.style.height = 'auto'
    },
    leave(element) {
      const { height } = getComputedStyle(element)

      element.style.height = height

      if (!getComputedStyle(element).height) return

      requestAnimationFrame(() => {
        element.style.height = 0
      })
    },
  },
}
</script>
