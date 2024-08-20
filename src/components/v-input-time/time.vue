<template>
  <div class="flex items-center">
    <p class="font-medium text-sm text-gray-400 dark:text-gray-500 w-5 flex-shrink-0 mr-4">
      {{$t(label) }}
    </p>
    <div class="flex items-center">
      <div class="day_schedule-container py-2 lg:px-12 xs:px-9 flex items-center border-2 bg-transparent border-gray-300 justify-between shadow-sm rounded-md">
        <input
          v-model="from_hour"
          class="font-sm date-from taxt-gray-900 placeholder-gray-400 border-0 w-6 p-0 focus:ring-transparent focus:shadow-none focus:outline-none focus:ring-0"
          min="00"
          max="23"
          v-integer
          placeholder="00"
          @input="updateParentValue"
        >
        <span class="block mr-1 text-gray-400">:</span>
        <input
          v-model="from_minutes"
          class="font-sm taxt-gray-900 placeholder-gray-400 border-0 w-6 p-0 focus:ring-transparent focus:shadow-none focus:outline-none focus:ring-0"
          min="00"
          max="59"
          type="number"
          v-integer
          placeholder="00"
          ref="date_from"
          @input="updateParentValue"
        >
      </div>
      <span class="flex-shrink-0 text-gray-400 text-3xl px-3">–</span>
      <div class="day_schedule-container py-2 lg:px-12 xs:px-9 flex items-center border-2 bg-transparent border-gray-300 justify-between shadow-sm rounded-md">
        <input
          v-model="to_hour"
          class="font-sm date-to taxt-gray-900 placeholder-gray-400 border-0 w-6 p-0 focus:ring-transparent focus:shadow-none focus:outline-none focus:ring-0"
          min="00"
          max="23"
          type="number"
          v-integer
          placeholder="00"
          @input="updateParentValue"
        >
        <span class="block mr-1 text-gray-400">:</span>
        <input
          v-model="to_minutes"
          class="font-sm taxt-gray-900 placeholder-gray-400 border-0 w-6 p-0 focus:ring-transparent focus:shadow-none focus:outline-none focus:ring-0"
          min="00"
          max="59"
          v-integer
          type="number"
          placeholder="00"
          ref="date_to"
          @input="updateParentValue"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeGroup',
  props: {
    label: {
      type: String,
      default: '',
      required: true,
    },
    modelValue: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      localValue: {},
      from_hour: '',
      from_minutes: '',
      to_hour: '',
      to_minutes: '',
    }
  },
  watch: {
    modelValue(val) {
      this.parseSchedule(val)
    }
  },
  async created() {
    this.localValue = this.modelValue
    this.parseSchedule(this.localValue)
  },
  methods: {
    fixedValue(value) {
      const result = (value + '')
      return result.substring(0, 2)
    },
    maxHours(value) {
      return value > 23 ? '23' : value
    },
    maxMinutes(value) {
      return value > 59 ? '59' : value
    },
    updateParentValue(e) {
      this.from_hour = this.fixedValue(this.maxHours(this.from_hour))
      this.to_hour = this.fixedValue(this.maxHours(this.to_hour))
      this.from_minutes = this.fixedValue(this.maxMinutes(this.from_minutes))
      this.to_minutes = this.fixedValue(this.maxMinutes(this.to_minutes))
      const isDateFrom = e.target.classList.contains('date-from')
      const isDateTo = e.target.classList.contains('date-to')
      if(isDateFrom && this.from_hour.length > 1) {
        this.$refs.date_from?.focus()
        this.$refs.date_from?.select()
      }
      if(isDateTo && this.to_hour.length > 1) {
        this.$refs.date_to?.focus()
        this.$refs.date_to?.select()
      }
      let startValue = `${this.from_hour}:${this.from_minutes}`
      if (startValue === ':') {
        startValue = null
      }

      let endValue = `${this.to_hour}:${this.to_minutes}`
      if (endValue === ':') {
        endValue = null
      }

      this.$emit('update:modelValue', {
        alias: this.label,
        start: startValue,
        end: endValue,
      })
    },
    parseSchedule(scheduleDay) {
      const startTime = (scheduleDay.start || '').split(':')
      const endTime = (scheduleDay.end || '').split(':')

      this.from_hour = startTime[0] || ''
      this.from_minutes = startTime[1] || ''
      this.to_hour = endTime[0] || ''
      this.to_minutes = endTime[1] || ''
    },
  },
}
</script>
