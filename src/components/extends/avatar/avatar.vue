<template>
  <div
    class="flex items-center"
    :class="{'flex-row-reverse': theme === 'secondary'}
"
  >
    <img
      v-if="avatar"
      class="w-10 h-10 object-cover"
      :class="classAvatar"
      :src="avatar"
    >

    <div
      v-else
      class="w-10 h-10 rounded-md justify-center flex items-center"
      :class="{
        'bg-primary-medium text-primary ': !iconUser && theme === 'primary',
        'bg-secondary-100 text-secondary-800': !iconUser && theme === 'secondary',
        ...classAvatar
      }"
    >
      <span
        v-if="!iconUser"
        class="uppercase inline-block font-semibold text-2xl"
        v-text="name.charAt(0)"
      />
      <svg
        v-else
        v-svg
        class="w-6 h-6"
        symbol="user"
      />
    </div>
    <template v-if="!hiddenName">
      <router-link
        v-if="href.length > 0 && name"
        v-slot="{href, navigate, isActive}"
        :to="href"
      >
        <a

          class="text-gray-700 dark:text-gray-300 font-medium px-3"
          :href="href"
          :class="textClass"
        >{{ name }}
        </a>
      </router-link>
      <p
        v-else
        class="text-gray-700 dark:text-gray-300 font-medium px-3"
      >
        {{ name }}
      </p>
    </template>
  </div>
</template>

<script>

export default {
  name: 'Avatar',

  props: {
    avatar: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    textClass: {
      type: String,
      default: '',
    },
    href: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: 'primary',
    },
    classUser: {
      type: [Object, String],
      default: '',
    },
    iconUser: {
      type: Boolean,
      default: false,
    },
    hiddenName: {
      type: Boolean,
      default: false,
    },
    circle: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classAvatar() {
      return {
        'rounded-full': this.circle,
        'rounded-md': !this.circle,
        [this.classUser]: this.classUser,
      }
    },
  },
}
</script>
