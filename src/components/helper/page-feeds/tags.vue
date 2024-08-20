<template>
  <div class="my-4">
    <ul v-if="tags.length" class="flex flex-wrap">
      <li v-for="(tag, key) in lineShortening" :key="key"
        class="h-7 flex items-center relative cursor-pointer pl-5 text-sm rounded my-2 py-0.5 pr-3 after:content-['\2022'] after:absolute after:left-1.5 mr-3 lg:mr-4 dark:text-gray-300 dark:bg-gray-800 dark:after:content-['\2022'] dark:after:text-gray-500"
        :class="selected === key
            ? 'text-white bg-primary after:text-white dark:after:text-white dark:text-white dark:bg-primary'
            : 'text-gray-800 bg-gray-100 after:text-gray-400'
          " @click="search(key, selected == key)">
        <router-link v-slot="{ href, navigate }" :to="`/feeds/tag/${tag.slug}?tab=${activeTab}`">
          <a :href="href" @click="navigate">{{ isRu ? tag.name.ru : tag.name.en }}</a>
        </router-link>
      </li>
      <li class="h-7 flex items-center rounded my-2 cursor-pointer lg:p-1 xs:px-1"
        :class="fullVeiw ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'" @click="show">
        <svg v-svg symbol="threedots" class="rotate-90 fill-current w-6 h-6"
          :class="fullVeiw ? ' text-white' : ' text-gray-400'" />
      </li>
    </ul>
  </div>
</template>

<script>
import i18n from 'src/i18n/localization'
export default {
  name: 'Tags',
  components: {},
  props: {
    value: {
      type: String,
      default: '',
    },
    activeTab: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    selected: NaN,
    fullVeiw: false,
    tags: [],
  }),
  computed: {
    lineShortening() {
      if (this.$matchMedia.desktop && this.fullVeiw) {
        return this.tags
      }
      if (!this.$matchMedia.desktop && !this.fullVeiw) {
        return this.tags.slice(0, 4)
      }
      return this.tags
    },
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
  },
  watch: {
    activeTab() {
      this.selected = NaN
    },
  },
  mounted() {
    this.getTags()
  },
  methods: {
    search(key, active) {
      if (!active) {
        this.$emit('takeTag', this.tags[key])
        this.selected = key
      } else {
        this.$emit('takeTag', null)
      }
    },
    show() {
      this.fullVeiw = !this.fullVeiw
      this.getTags()
    },
    async setTagDefault() {
      const path = this.$route.params.tag_id
      this.selected = this.tags.findIndex(el => el.slug === (this.value ?? path))
    },
    async getTags() {
      try {
        const { data } = await this.$api({
          method: 'GET',
          url: 'userfeed/tag',
          params: {
            'filter[popular]': !this.fullVeiw ? true : undefined,
            limit: this.fullVeiw ? 50 : 10,
          },
        })
        if (data) {
          this.tags = data.data
          if (this.$route.params) this.setTagDefault()
        }
      } catch (e) {
        console.log('e 1', e)
        this.$error.show('userfeed/tag')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.flex-wrap {
	flex-wrap: wrap;
}
</style>
