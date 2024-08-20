<template>
  <div class="footers shadow-base bg-white">
    <Nav class="footer-mobile-menu" />
    <!-- <div class="footer-mobile-menu">
			<div class="footer-mobile-menu-item">1</div>
			<div class="footer-mobile-menu-item">2</div>
			<div class="footer-mobile-menu-item">3</div>
			<div class="footer-mobile-menu-item">4</div>
		</div> -->
  </div>
</template>

<script>
import Nav from './../header/nav/nav.vue'
export default {
  name: 'footer-mobile',
  components: {
    Nav,
  },
  data: () => ({
    value: '',
  }),
}
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  width: 100%;
  height: 64px;
  align-items: center;
  position: fixed;
  z-index: 11;

  .footer-mobile-menu {
    display: flex;
    flex-grow: 1;
    flex-wrap: nowrap;

    .footer-mobile-menu-item {
      padding: 4px 8px;
      flex-grow: 1;
      border: 1px solid #ccc;
      border-left: 0;

      &:last-child {
        border-right: 0;
      }
    }
  }
}
.footers {
  display: none;

  @media (max-width: 1200px) {
    display: flex;
    align-items: center;
    width: 100%;
    position: fixed;
    z-index: 11;
    bottom: 0;
    overflow-x: auto;
    border-top: 1px solid var(--c-gray-15);
  }
}
</style>
