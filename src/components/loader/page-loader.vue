<template>
<div class="page-loader" style="position: fixed;
  z-index: 99999999;
  top: 0;
  height: 100vh;
  width: 100vw;
  background-color: #fff;
  display: flex;
	gap: 32px;
	flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.5s ease-in-out;">
	<!-- <q-spinner-ball color="orange" size="12em" /> -->
	<img class="page-loader-logo" src="~/assets/img/twixim-animation.svg" style="max-width: 120px" />
	<!-- <img class="page-loader-logo" src="~/assets/img/logo.svg" style="max-width: 240px" /> -->
</div>
</template>

<script>
export default {
  name: 'PageLoader',
}
</script>

<style lang="scss">
.page-loader {
  position: fixed;
  z-index: 99999999;
  top: 0;
  height: 100vh;
  width: 100vw;
  background-color: #fff;
	gap: 32px;
	flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0 !important;
  transition: opacity 0.5s ease-in-out;
	display: none !important;
	&.is-active {
		opacity: 0 !important;
		display: flex !important;
	}
  &.is-active-loading {
		display: flex !important;
		opacity: 1 !important;
  }
}
</style>
