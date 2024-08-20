<template lang="pug">
div.fixed-button
  slot
</template>

<script>
export default {
  name: 'FixedButton',
}
</script>

<style lang="scss">
.fixed-button {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0 20px 30px;
  background-color: var(--c-bg);

  &::before {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    content: '';
    display: block;
    height: 75px;
    background-image: var(--transparent-to-white);
    pointer-events: none;
  }
}
</style>
