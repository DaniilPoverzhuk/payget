<template>
  <div class="contacts max-w-800 mx-auto w-full my-6 px-4">
    <LinkBack to="/knowledge-base" :text="$t('knowledge.title')" />
    <h1
      class="text-2xl font-semibold text-center text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6"
    >
      {{ $t('knowledge.contactsAdministration') }}
    </h1>
    <h2
      class="text-xl font-semibold text-gray-700 dark:text-gray-300 lg:mb-3 xs:mb-4"
    >
      {{ $t('support.title') }}
    </h2>
    <p class="lg:text-sm text-gray-500 dark:text-gray-300 m-0" />
    <p
      v-if="!role"
      class="lg:text-sm text-gray-500 dark:text-gray-300 m-0 pt-4"
    >
      {{ $t('knowledge.necessary') }}
      <a class="text-primary font-medium" href="/">{{ $t('auth.logiin') }} </a>
      {{ $t('knowledge.or') }}
      <a class="text-primary font-medium" href="/registration"
        >{{ $t('auth.register') }}
      </a>
    </p>
    <form
      v-if="role !== 'admin'"
      class="lg:pt-3 xs:pt-4"
      :class="{ 'opacity-40 pointer-events-none': !role }"
      @submit.prevent="sendSupport"
    >
      <VSelect
        v-if="selectList.length > 0"
        v-model="form.subject"
        :label="$t('knowledge.chooseSubject')"
        :select-list="langSelectList"
        class="max-w-md"
        :placeholder="$t('knowledge.description')"
        :v="v$.form.subject"
      />
      <VTextarea
        v-model="form.message"
        class="pt-3"
        :label="$t('knowledge.question')"
        :rows="3"
        :v="isValidate ? v$.form.message : () => {}"
        @update:modelValue="resetError"
      />
      <Button
        class="mt-4 xs:w-full font-medium"
        view-color="primary"
        :submit="true"
        @click="mobileActiveForm = true"
        :loading="isLoading"
        :disabled="isLoading"
      >
        {{ $t('button.send') }}
      </Button>
    </form>
    <div
      v-if="data !== null"
      class="article"
      v-html="isRu ? data.text.ru : data.text.en"
    />
  </div>
</template>

<script>
import { required, minLength } from '@vuelidate/validators'
import { createNamespacedHelpers } from 'vuex'
import VSelect from 'src/components/extends/v-select/v-select.vue'
import VTextarea from 'src/components/extends/v-textarea/v-textarea.vue'
import LinkBack from 'src/components/extends/link-back/link-back.vue'
import useVuelidate from '@vuelidate/core'
import i18n from 'src/i18n/localization'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Contacts',
  components: {
    VTextarea,
    VSelect,
    LinkBack,
  },
  setup() {
    return { v$: useVuelidate() }
  },
  data: () => ({
    error: '',
    post: '',
    form: {
      subject: '',
      message: '',
    },
    selectList: [],
    data: null,
    isLoading: false,
  }),
  validations() {
    const form = {
      subject: {
        required,
      },
      message: {
        required,
        minLength: minLength(10),
      },
    }
    return { form }
  },
  computed: {
    ...mapUserState(['role']),
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
    langSelectList() {
      return this.selectList.map((item) => {
        const newItem = { ...item }
        newItem.text = this.isRu ? item.text.ru : item.text.en
        return newItem
      })
    },
    isValidate() {
      return this.v$ && this.v$.form
    },
  },
  mounted() {
    this.sendSubject()
    this.created()
  },
  methods: {
    async created() {
      try {
        const {
          data: { data, status, message },
        } = await this.$instance({
          url: 'post/get/data',
          data: {
            slug: 'kontakty',
          },
        })

        if (status) {
          this.data = data
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    resetError() {
      this.error = null
    },
    async sendSubject() {
      try {
        const { data } = await this.$instance({
          method: 'get',
          url: '/support/subject',
        })
        if (data) {
          data.data.map((el) =>
            this.selectList.push({
              value: el.id,
              text: el.subject,
            })
          )
          this.form.subject = data.data[0].id
        }
      } catch {
        this.$error.show()
      }
    },
    async sendSupport() {
      this.v$.form.$touch()
      if (this.v$.form.$invalid || this.isLoading) return
      try {
        this.isLoading = true
        const { data } = await this.$instance({
          url: '/support/tickets',
          data: this.form,
        })
        if (data.status) {
          this.$router.push(`/support/${data.data.uuid}`)
        }
      } catch {
        this.$error.show()
      }
      this.isLoading = false
    },
  },
}
</script>
<style lang="postcss">
.article {
  h2 {
    @apply text-xl font-semibold text-gray-700 dark:text-gray-300 lg:mb-3 xs:mb-4 lg:mt-6 xs:mt-8;
  }
  p {
    @apply lg:text-sm text-gray-500 dark:text-gray-300 mt-3;
  }
  p a {
    @apply inline-block lg:text-sm text-primary font-medium outline-none;
  }
}
</style>
