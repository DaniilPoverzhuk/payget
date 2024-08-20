<template>
  <Dialog v-model="localValue" :heading="$t(dialogHeader)" @hide="cancel">
    <ul class="dialog__action-list">
      <li class="dialog__action-list-item">
        <Button view-color="grey" @click="cancel">{{ $t('button.cancel') }}</Button>
      </li>
      <li class="dialog__action-list-item">
        <Button :loading="blockingUser" view-color="secondary" @click="toggleUserBlock">
          <template v-if="user && user.banned_at"> {{ $t('button.unlock') }}</template>
          <template v-else> {{ $t('button.block') }}</template>
        </Button>
      </li>
    </ul>
  </Dialog>
</template>

<script>
import Dialog from 'src/components/dialog/dialog-new.vue'
import Button from 'src/components/extends/button/button.vue'

export default {
  name: 'UserBlockDialog',
  components: {
    Dialog,
    Button
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      blockingUser: false,

    }
  },
  computed: {
    dialogHeader() {
      return this.user.banned_at
        ? 'popup.unlock'
        : 'popup.block'
    },
    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    async toggleUserBlock() {
      const url = this.user.banned_at ? 'user/unban' : 'user/ban'

      this.blockingUser = true

      try {
        const { data: { data, status, message } } = await this.$instance({
          url,
          data: {
            user_id: this.user.id,
          },
        })

        if (status) {
          this.$emit('success', data)
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }

      this.blockingUser = false
    },
  },
}
</script>
