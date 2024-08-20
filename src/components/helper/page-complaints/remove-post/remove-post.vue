<template>
  <div class="remove-post__inner">
    <template v-if="addReason">
      <h2 class="text-center text-lg text-gray-900 dark:text-white font-medium">
        {{ $t('channel.deletePostQ') }}
        <span class="inline-block">{{ $t('channel.cannotUndone') }}</span>
      </h2>
      <div class="flex space-x-3 mt-5">
        <Button
          class="w-1/2 font-medium"
          view-color="grey"
          @click="$emit('hide')"
        >
          {{ $t('button.cancel') }}
        </Button>
        <Button
          view-color="secondary"
          class="w-1/2 font-medium"
          @click="addReason = false"
        >
          {{ $t('button.remove') }}
        </Button>
      </div>
    </template>
    <form
      v-else
      class="form"
      @submit.prevent="removePost"
    >
      <h2 class="text-center text-lg text-gray-900 dark:text-white font-medium mb-4">
        {{ $t('placeholder.reasonDelete') }}
      </h2>
      <VInput
        v-model="reasonText"
        :v="v$.reasonText"
        class="mb-5"
        type="textarea"
        :maxlength="120"
        :rows="4"
      />
      <Button
        view-color="secondary"
        class="w-full font-medium"
        :submit="true"
      >
        {{ $t('button.add') }}
      </Button>
    </form>
  </div>
</template>

<script>
import { minLength, required } from '@vuelidate/validators'
import VInput from 'src/components/extends/v-input/v-input.vue'
import useVuelidate from '@vuelidate/core'

export default {
  components: {
    VInput,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  data() {
    return {
      reasonText: '',
      addReason: true,
      resolveDialog: false,
      sendingRequisites: false,
    }
  },
  validations: {
    reasonText: {
      required,
      minLength: minLength(3),
    },
  },
  methods: {
    async removePost() {
      this.v$.$touch()
      this.v$.reasonText.$touch()
      if (this.v$.$invalid) return
      try {
        const { data } = await this.$instance({
          method: 'delete',
          url: `/userfeed/complaint-post/${this.id}`,
          data: {
            post_id: this.id,
            delete_reason: this.reasonText,
            _debug: 1,
          },
        })
        if (data) {
          this.$emit('hide')
          this.$emit('update')
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
