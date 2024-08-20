<template>
  <div class="loader">
    <div class="loader__inner">
      <svg
        v-svg
        class="loader__spinner border-1 border-opacity-0 text-primary"
        size="32"
        symbol="spinner"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loader',
}
</script>

<style lang="scss">
.loader {
  //border: 1px solid #000;
}

.loader__inner {
  overflow: hidden;
}

.loader__spinner {
  display: block;
  margin: 0 auto;
  fill: var(--c-primary);
  animation-name: rotate;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  border: 1px solid transparent;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
