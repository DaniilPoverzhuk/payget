<template>
  <div class="user-cell">
    <div class="user-name font-semibold">
      {{ user.name }}
      <span class="accept" v-if="user.is_verified">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
        >
          <path
            d="M9.37936 1.33484C9.82523 0.933777 10.5019 0.933778 10.9477 1.33484L13.766 3.87002C13.8879 3.97965 14.0315 4.06251 14.1873 4.11325L17.792 5.28641C18.3623 5.47201 18.7006 6.05798 18.5762 6.64464L17.7899 10.353C17.7558 10.5134 17.7558 10.6791 17.7899 10.8395L18.5762 14.5478C18.7006 15.1344 18.3623 15.7204 17.792 15.906L14.1873 17.0792C14.0315 17.1299 13.8879 17.2128 13.766 17.3224L10.9477 19.8576C10.5019 20.2587 9.82523 20.2587 9.37936 19.8576L6.56103 17.3224C6.43914 17.2128 6.29562 17.1299 6.13973 17.0792L2.53504 15.906C1.96478 15.7204 1.62646 15.1344 1.75087 14.5478L2.53722 10.8394C2.57123 10.6791 2.57123 10.5134 2.53722 10.353L1.75087 6.64464C1.62646 6.05798 1.96478 5.47201 2.53504 5.28641L6.13973 4.11325C6.29562 4.06251 6.43914 3.97965 6.56103 3.87002L9.37936 1.33484Z"
            fill="#21B94B"
          />
          <path
            d="M13.095 8.83734L9.0643 12.355L7.23218 10.7561"
            stroke="white"
            stroke-width="1.17256"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>
    <div v-if="symbols && symbols.length" class="user-symbols">
      <div
        class="bg-indigo-500 symbol-item flex items-center justify-center rounded-full"
        v-for="item in symbols"
        :key="item.symbol"
      >
        <svg
          v-svg
          :symbol="item.symbol == 'arrow-right' ? 'arrow-left' : item.symbol"
          class="w-3 h-3 text-white"
          :class="{ 'rotate-180': item.symbol == 'arrow-right' }"
        ></svg>
        <q-tooltip
          class="bg-indigo text-white shadow-4"
          anchor="bottom middle"
          self="center left"
          :offset="[12, 12]"
          max-width="300px"
        >
          {{ item.translate }}
        </q-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserCell',
  props: {
    user: {
      type: Object,
    },
    symbols: {
      type: Array,
    },
  },
}
</script>

<style lang="scss" scoped>
.user-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: 720px) {
    flex-direction: row;
    justify-content: space-between;
  }
  .user-name {
    display: flex;
    align-items: center;
    gap: 4px;
    @media (max-width: 1440px) {
      font-size: 14px;
    }
  }
  .user-symbols {
    display: flex;
    gap: 4px;
    .symbol-item {
      min-width: 16px;
      min-height: 16px;
      max-width: 16px;
      max-height: 16px;
    }
    .bg-symbol-grey {
      background-color: #e6e7ee;
    }
  }
}
</style>
