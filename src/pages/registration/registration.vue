<template>
  <div class="mx-auto min-h-full flex flex-col justify-center py-12 lg:px-6 lg:px-8">
    <div class="lg:mx-auto lg:w-full lg:max-w-md">
      <a
        href="/"
        class="router-link-active"
      >
        <img
          src="~/assets/img/twixim.svg"
          alt="TWIX"
          title="TWIX"
          class="w-auto h-12 mx-auto"
        >
      </a>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{$t('auth.registration')}}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
         {{$t('auth.haveAccount')}}
        <router-link
          v-slot="{ navigate}"
          to="/"
        >
          <span
            class="font-medium text-indigo-600 text-primary"
            @click="navigate"
          >
            {{$t('auth.logiin')}}
          </span>
        </router-link>
      </p>
    </div>
    <div class="mt-8 mx-auto max-w-md">
      <div class="bg-white py-8 px-4 shadow lg:rounded-lg lg:px-10">
        <Form />
      </div>
    </div>
  </div>
</template>

<script>
import Form from 'src/components/helper/page-registration/form/form.vue'

export default {
  name: 'Registration',
  components: {
    Form,
  },
}
</script>
