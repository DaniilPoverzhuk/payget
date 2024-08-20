<template>
  <div class="section-setting">
    <div v-if="$matchMedia.mobile">
      <LinkBack :text="$t('button.back')" @click="$emit('back')" />
      <h1 class="mt-4 mb-6 text-2xl font-semibold	text-center	text-gray-700 dark:text-gray-300">
        {{ $t('feeds.customizeFeed') }}
      </h1>
    </div>
    <div>
      <p class="text-sm text-gray-500 dark:text-gray-300 font-normal mb-2">
        {{ $t('feeds.selectTags') }}
      </p>
      <p class="text-sm font-normal" :class="error ? 'text-red-700' : 'text-gray-500 dark:text-gray-300'">
        {{ $t('feeds.numberTags') }}
      </p>
    </div>
    <div>
      <ul class="flex flex-wrap my-6">
        <li v-for="tag in tags" :key="tag.id"
          class="flex items-center relative cursor-pointer pl-5 text-sm rounded my-2 py-0.5 pr-3 after:content-['\2022'] after:absolute after:left-1.5 mr-3 lg:mr-4 dark:text-gray-300 dark:bg-gray-800 dark:after:content-['\2022'] dark:after:text-gray-500"
          :class="tag.active ? 'text-white bg-primary after:text-white dark:after:text-white dark:text-white dark:bg-primary' : 'text-gray-800 bg-gray-100 after:text-gray-400'"
          @click="select(tag.id)">
          {{ isRu ? tag.name.ru : tag.name.en }}
        </li>
      </ul>
      <p v-if="saved.length > 0" class="text-sm font-normal mb-10 lg:mb-12"
        :class="error ? 'text-red-700' : 'text-gray-500 dark:text-gray-300'">
        {{ $t('button.saveChanges') }}: {{ $t('feeds.tags', saved.length, { count: saved.length }) }}
      </p>
    </div>
    <div class="flex justify-center">
      <button class="text-white bg-primary rounded-md py-2 px-4" @click="saveSettings">
        {{ $t('button.saveChanges') }}
      </button>
    </div>
  </div>
</template>

<script>
import LinkBack from 'src/components/extends/link-back/link-back.vue'
import i18n from 'src/i18n/localization'

export default {
  name: 'SectionSetting',
  components: {
    LinkBack,
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      saved: [],
      tags: [],
      error: false,
      tagsMinCount: 5,
    }
  },
  computed: {
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
  },
  watch: {
    saved() {
      if (this.saved.length >= this.tagsMinCount) {
        this.error = false
      } else {
        this.error = true
      }
    },
  },
  mounted() {
    this.getTags()
  },
  methods: {
    initialization() {
      if (this.value && this.tags) {
        this.value.forEach((item) => {
          this.select(item.id)
        })
      }
    },
    async sendSaved() {
      try {
        const { data } = await this.$instance({
          url: 'userfeed/tag/settings',
          data: {
            tags: this.saved,
          },
        })
        if (data) {
          this.$emit('clearPosts')
        }
      } catch {
        this.$error.show()
      }
    },
    async getTags() {
      try {
        const { data } = await this.$api({
          method: 'GET',
          url: 'userfeed/tag',
          params: {
            limit: 30,
          },
        })
        if (data) {
          this.tags = data.data.map(item => ({ ...item, active: false }))
          this.initialization()
        }
      } catch {
        this.$error.show()
      }
    },
    select(id) {
      this.tags.forEach((item) => {
        if (item.id === id) {
          if (item.active) {
            item.active = false
            this.saved = this.saved.filter(item => item !== id)
          } else {
            item.active = true
            this.saved.push(item.id)
          }
        }
      })
    },
    saveSettings() {
      if (this.saved.length >= this.tagsMinCount) {
        this.sendSaved()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.section-setting {
	.flex {
		&.flex-wrap {
			flex-wrap: wrap;
		}
	}
}
</style>