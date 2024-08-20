<template>
  <div :class="$matchMedia.desktop ? 'max-w-sm' : ''">
    <label id="listbox-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ $t('channel.tagPost') }}
    </label>
    <div class="mt-1 relative mb-10">
      <button type="button"
        class="bg-white relative w-full border rounded-md py-2 px-3 border-solid border-gray-300 dark:bg-gray-900 dark:border-gray-800"
        @click="showTags">
        <span class="block truncate">
          {{ activeTags ? activeTags[0].name : $t('chat.selectedNothing') }}
        </span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg v-svg aria-hidden="true" size="18 17" symbol="select" class="h-5 w-5 text-gray-400" />
        </span>
      </button>
      <ul v-if="active" v-click-outside="showTags"
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto border border-gray-300 focus:outline-none sm:text-sm dark:bg-gray-900 dark:border-gray-500"
        tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
        <li v-for="tag in tags" :key="tag.id"
          class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-primary dark:text-white"
          role="option" @click="checkedTag(tag.id, true)">
          <span class="block truncate" :class="tag.active ? 'font-semibold' : 'font-normal'">
            {{ isRu ? tag.name.ru : tag.name.en }}
          </span>
          <span v-if="tag.active" class="text-primary absolute inset-y-0 right-0 flex items-center pr-4">
            <svg v-svg aria-hidden="true" size="18 17" symbol="check" class="h-5 w-5" />
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import i18n from 'src/i18n/localization'
export default {
  name: 'TagsPost',
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      active: false,
      activeTags: null,
      tags: [],
    }
  },
  computed: {
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
  },
  mounted() {
    this.getTags()
  },
  methods: {
    initializationTag() {
      if (this.value) {
        this.checkedTag(this.value.id, false)
      }
    },
    showTags() {
      this.active = !this.active
    },
    checkedTag(id, show) {
      if (this.activeTags && id === this.activeTags[0].id) {
        this.$emit('selectTag', false)
        this.activeTags[0].active = false
        this.activeTags = null
      } else {
        this.$emit('selectTag', id.toString())
        if (this.activeTags) {
          this.activeTags[0].active = false
          this.activeTags = null
        }
        this.activeTags = this.tags.filter(item => item.id === id)
        this.activeTags[0].active = true
      }
      if (show) this.showTags()
    },
    async getTags() {
      try {
        const { data, status } = await this.$api({
          method: 'GET',
          url: 'userfeed/tag',
          params: {
            limit: 30,
          },
        })
        if (data) {
          this.tags = data.data.map(item => ({ ...item, active: false }))
          this.initializationTag()
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.text-gray-900.cursor-default.select-none.relative.py-2.pl-3.pr-9:hover {
  span {
    color: white;
  }
}

.dark .text-gray-900.cursor-default.select-none.relative.py-2.pl-3.pr-9:hover {
  span {
    color: #111827;
  }
}
</style>
