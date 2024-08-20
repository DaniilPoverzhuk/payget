<template>
    <FlatPickr ref="datePicker" v-model="date" name="date" open="openFlatPickr" :config="configFlatPickr" @on-close=" $emit('doCloseCalendar', $refs.datePicker.fp.input.value)"></FlatPickr>
</template>

<script>
import 'flatpickr/dist/flatpickr.css'
import FlatPickr from 'vue-flatpickr-component'
import { Russian } from 'flatpickr/dist/l10n/ru.js'

export default {
  components: { FlatPickr },
  name: 'flatpickr',

  data() {
    return {
      date: null,
      configFlatPickr: {
        locale: Russian,
        mode: 'range',
        maxDate: 'today',
        showMonths: 1,
        animate: true
      },
    }
  },
  methods: {
    openFlatPickr() {
      this.$refs.datePicker.fp.open()
    }
  }
}
</script>

<style lang="scss">
.flatpickr-input {
  position: absolute;
  width: 100%;
  height: 0;
  right: 0;
  top: 100%;
  opacity: 0;
  z-index: -999;
}

.flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected.inRange, .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay {
  background: var(--c-primary);
  border-color: var(--c-primary);
}
</style>
