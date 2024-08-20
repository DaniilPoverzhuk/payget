<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap">
      {{ `#${withdraw.id}` }}
    </td>
    <td class="px-6 py-4 max-w-300">
      <router-link
        class="text-primary"
        :to="`user/${withdraw.name}`"
      >
        {{ withdraw.name }}
      </router-link>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      {{ withdraw.login }}
    </td>
    <td class="px-6 py-4 font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
      {{ withdraw.amount }} BTC
    </td>
    <td class="px-6 py-4 font-semibold break-all text-gray-700 dark:text-gray-300">
      {{ withdraw.requisites }}
    </td>
    <td class="pl-6 py-4 whitespace-nowrap">
      <div
        v-if="withdraw.type === 'removing'"
        class="flex justify-end"
      >
        <Button
          view-color="secondary"
          class="mr-6"
          @click="$emit('resolve', withdraw.id, 'approve')"
        >
          {{ $t('button.bringOut') }}
        </Button>
        <Button
          view-color="grey"
          @click="$emit('resolve', withdraw.id, 'canceled')"
        >
          {{ $t('button.reject') }}
        </Button>
      </div>
      <span
        v-else-if="withdraw.type === 'removing-approved'"
        class="pr-6 text-green-700"
      >{{ $t('button.completed') }}</span>
      <span
        v-else
        class="pr-6 text-red-700"
      >{{ $t('button.canceled') }}</span>
    </td>
  </tr>
</template>

<script>

export default {
  name: 'WithdrawsRow',
  props: {
    withdraw: {
      type: Object,
      required: true,
    },
  },
}
</script>
