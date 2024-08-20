<template>
  <div class="flex">
    <input :id="localId" v-model="localValue" type="checkbox" class="hidden" />
    <label
      :for="localId"
      class="flex justify-between items-center w-full cursor-pointer"
    >
      <span
        v-if="label"
        class="inline-block font-medium inline-block pr-1 flex-grow-1"
        :class="labelClasses"
        >{{ label }}
        <Hint v-if="hint" class="inline-block -mb-1" :hint="hint" />
      </span>
      <div
        class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-transparent"
        :class="{
          'bg-primary': localValue,
          'bg-gray-200 dark:bg-gray-700': !localValue,
        }"
        role="switch"
      >
        <span class="sr-only">Use setting</span>
        <span
          :class="{ 'translate-x-5': localValue, 'translate-x-0': !localValue }"
          class="pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        >
          <span
            :class="{
              'opacity-0 ease-out duration-100': localValue,
              'opacity-100 ease-in duration-200': !localValue,
            }"
            class="ease-in duration-200 absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          >
            <svg
              v-svg
              class="h-3 w-3 text-gray-400 dark:text-gray-500"
              symbol="toggler"
            />
          </span>
          <span
            :class="{
              'opacity-100 ease-in duration-200': localValue,
              'opacity-0 ease-out duration-100': !localValue,
            }"
            class="ease-out duration-100 absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          >
            <svg
              v-svg
              class="h-3 w-3 text-gray-400 dark:text-gray-500"
              symbol="toggler-check"
            />
          </span>
        </span>
      </div>
    </label>
  </div>
</template>

<script>
import Hint from 'src/components/dynamic-hint/dynamic-hint.vue'

export default {
  name: 'Toggler',
  components: {
    Hint,
  },
  props: {
    hint: {
      type: String,
      default: '',
    },
    modelValue: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: null,
    },
    right: {
      type: Boolean,
      default: false,
    },
    classLabel: {
      type: String,
      default: '',
    },
  },
  computed: {
    labelClasses() {
      return {
        [this.classLabel]: !!this.classLabel,
        'text-sm text-gray-700 dark:text-gray-300 ': !this.classLabel,
      }
    },
    localId() {
      return `VInput${`${Math.random()}`.slice(2)}`
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
}
</script>
