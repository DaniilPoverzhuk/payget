<template>
  <tr class="codes-row">
    <td
      class="px-2 py-4 text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
    >
      {{ code.code }}
    </td>
    <td
      class="px-2 py-4 text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
    >
      {{ code.amount }} BTC
    </td>
    <td
      class="px-2 py-4 text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
    >
      {{ code.created_at }}
    </td>
    <td
      class="px-2 py-4 text-gray-500 dark:text-gray-300 whitespace-nowrap text-sm"
    >
      {{ code.valid_at }}
    </td>
  </tr>
</template>

<script>
export default {
  name: 'CodesRow',
  components: {},
  props: {
    code: {
      type: Object,
      required: true,
    },
  },
  computed: {
    codeCreatedAt() {
      return this.code !== null && this.code.created_at
        ? this.modifyDate(this.code.created_at)
        : ''
    },
    codeValidAt() {
      return this.code !== null && this.code.valid_at
        ? this.modifyDate(this.code.valid_at)
        : ''
    },
  },
  methods: {
    modifyDate(value) {
      return value.split('-').join('.').slice(0, -3)
    },
  },
}
</script>

<style lang="scss" scoped></style>
