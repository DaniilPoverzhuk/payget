<template>
    <div class="profile-accordion" v-if="dataTab !== null">
        <h2 class="profile-accordion__toggle" :class="avtive && 'profile-accordion__toggle_active'" @click="avtive = !avtive">{{$t(dataTab.text)}}</h2>
        <TransitionSlide>
            <div class="profile-accordion__panel" v-if="avtive">
                <slot></slot>
            </div>
        </TransitionSlide>
    </div>
</template>

<script>
import TransitionSlide from 'src/components/transition-slide/transition-slide.vue'

export default {
  name: 'Accordion',
  components: {
    TransitionSlide,
  },
  props: {
    dataTab: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      avtive: false,
    }
  },
}
</script>
<style lang="scss">
.profile-accordion {

  &:last-child {
    border-bottom: 2px solid var(--c-gray-10);
  }

  &__toggle {
    border-top: 2px solid var(--c-gray-10);
    padding: 24px 40px 24px 20px;
    cursor: pointer;
    position: relative;

    &::before {
      position: absolute;
      content: '';
      background-image: url('../../../assets/img/angle.svg');
      background-repeat: no-repeat;
      background-position: 50% 50%;
      width: 7px;
      height: 10px;
      display: block;
      right: 20px;
      top: 34px;
      transform: rotate(90deg);
      transition-property: transform;
      transition-duration: var(--t);
    }

    &_active::before {
      transform: rotate(-90deg);
    }
  }

  &__panel {
    transition-property: height;
    transition-duration: var(--t);
    overflow: hidden;
    padding: 0 20px;

    &::after {
      height: 24px;
      display: block;
      content: '';
    }

    .form__footer {
      margin-top: 24px;
    }
  }
}

</style>
