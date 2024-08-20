<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap">
      {{ `#${request.id}` }}
    </td>
    <td class="px-6 py-4 max-w-177">
      <router-link
        class="text-primary"
        :to="`user/${request.name}`"
      >
        {{ request.name }}
      </router-link>
    </td>
    <td class="px-6 py-4">
      {{ request.login }}
    </td>
    <td class="px-6 py-4 font-medium">
      {{ request.amount }} BTC
    </td>
    <template v-if="!request.requisites">
      <td class="px-6 py-4">
        <VInput
          v-model="requisites"
          :v="$v.requisites"
          view-color="secondary"
          :placeholder="$t('refill.enter')"
          type="text"
        />
      </td>
      <td class="px-6 py-4">
        <Button
          :loading="sendingRequisites"
          view-color="secondary"
          class="whitespace-nowrap"
          @click="sendRequisites"
        >
          {{ $t('refill.issue') }}
        </Button>
      </td>
    </template>
    <template v-else>
      <td class="px-6 py-4">
        {{ request.requisites }}
      </td>
      <template v-if="request.paid">
        <td
          v-if="!request.executed"
          class="px-6 py-4"
        >
          <div class="flex justify-end w-full space-x-5">
            <Button
              view-color="secondary"
              @click="$emit('resolve', request.id, 'approve')"
            >
              {{ $t('button.enroll') }}
            </Button>
            <Button
              view-color="grey"
              @click="$emit('resolve', request.id, 'canceled')"
            >
              {{ $t('button.reject') }}
            </Button>
          </div>
        </td>
        <td
          v-else
          class="px-6 py-4"
        >
          <span
            v-if="isRefillApproved"
            class="text-green-600"
          >{{ $t('button.credited') }}</span>
          <span
            v-else
            class="text-red-700"
          > {{ $t('button.rejected') }}</span>
        </td>
      </template>
    </template>
  </tr>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import VInput from '@/components/extends/v-input/v-input'
import Button from '@/components/extends/button/button'

export default {
  name: 'RefillRow',
  components: {
    Button,
    VInput,
  },
  props: {
    request: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      requisites: '',
      sendingRequisites: false,
    }
  },
  computed: {
    isRefillApproved() {
      return this.request.type === 'supplement-approved'
    },
  },
  validations: {
    requisites: { required },
  },
  methods: {
    async sendRequisites() {
      if (this.sendingRequisites) return
      this.$v.requisites.$touch()
      if (this.$v.requisites.$invalid) return

      this.sendingRequisites = true

      try {
        const { data: { status, message } } = await this.$instance({
          url: 'deposit/send/requisites',
          data: {
            id: this.request.id,
            requisites: this.requisites,
          },
        })

        if (!status) {
          this.$error.show(message)
        }
        this.sendingRequisites = false
      } catch {
        this.$error.show()
        this.sendingRequisites = false
      }
    },
  },
}
</script>
