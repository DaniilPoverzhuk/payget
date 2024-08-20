<template>
  <div class="flex items-center">
    <input
      :id="id"
      :name="nameGroup"
      type="radio"
      :checked="isChecked"
      :value="values"
      @input="updateParentValue()"
      ref="refsElement"
      class="focus:ring-transparent h-4 w-4 text-primary border-gray-300 dark:border-gray-500"
    >
    <label
      v-if="label"
      :for="id"
      class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
    >
      {{ $t(label) }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'Radio',
  props: {
    hint: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      required: true,
    },
    values: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    nameGroup: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  computed: {
    isChecked() {
      return this.values === this.modelValue
    },
  },
  methods: {
    updateParentValue() {
      this.$emit('update:modelValue', this.$refs.refsElement.value)
    },
  },
}
</script>

