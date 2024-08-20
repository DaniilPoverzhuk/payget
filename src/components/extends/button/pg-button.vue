<template>
	<q-btn unelevated class="shadow-base flex justify-center py-2 px-4 rounded-md  shadow-sm font-medium text-gray-700 bg-secondary-400 hover:bg-secondary-600 focus:outline-none focus:ring-primary-dark relative flex justify-center items-center c-desktop xs:mt-4 ml-2 w-full text-base">
		<svg
			v-if="icon"
			v-svg
			class="mr-2 h-5 w-5"
			:symbol="icon"
			/>
		<slot />
	</q-btn>
</template>

<script>
export default {
  name: 'pg-button',
  props: {
    icon: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="scss">
.pg-button {
	font-size: 16px;
	line-height: 20px;
	background-color: #9a4fd5;
	color: #fff;
	&.q-btn--rectangle {
		border-radius: 0.375rem;
	}
}
</style>