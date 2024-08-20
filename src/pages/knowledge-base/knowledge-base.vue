<template>
  <div class="knowledge-base max-w-4xl mx-auto w-full mt-10 px-4">
    <h1 class="text-2xl font-semibold text-center text-gray-700 dark:text-gray-300 lg:mb-8 xs:mb-6">
      {{ $t('knowledge.title') }}
    </h1>
    <div class="lg:flex lg:justify-between lg:items-center">
      <div class="lg:flex-grow lg:mr-8 xs:mb-6">
        <Search
          :results="searchResults"
          @search="(query) => searchQuery = query"
        />
      </div>
      <div class="flex lg:justify-between items-center flex-shrink-0">
        <div class="w-11 h-11 flex justify-center items-center bg-primary flex-shrink-0 rounded mr-2">
          <svg
            v-svg
            class="text-white"
            size="24"
            symbol="chat-alt"
          />
        </div>
        <div class="self-start">
          <div class="whitespace-nowrap text-gray-500 dark:text-gray-300 text-sm">
            {{ $t('knowledge.noAnswer') }}
          </div>
          <router-link
            class="whitespace-nowrap text-primary text-sm font-medium"
            to="/knowledge-base/kontakty"
          >
            {{ $t('knowledge.support') }}
          </router-link>
        </div>
      </div>
    </div>
    <ul class="lg:mt-10 xs:mt-6 lg:flex lg:flex-wrap max-w-2xl xs:border-b xs:border-gray-200 dark:xs:border-gray-700 xs:pt-6">

      <li
        v-for="category in categories"
        :key="category.id"
        :class="{'lg:order-1' : category.id == 2}"
        class="lg:w-6/12 lg:mb-8 xs:border-t xs:border-gray-200 dark:xs:border-gray-700 xs:py-6"
      >
        <h3
          class="lg:mb-4 text-lg xs:flex xs:justify-between xs:items-center"
          @click="slideToggleArticles(category)"
        >
          {{ isRu ? category.name.ru : category.name.en }}
          <span
            v-if="$matchMedia.mobile"
            class="knowledge-base__rubric-toggle"
            :class="category.expand && 'knowledge-base__rubric-toggle_active'"
          />
        </h3>
        <TransitionSlide>
          <ul
            v-if="posts[category.id] && ($matchMedia.desktop || category.expand)"
            class="knowledge-base__article-list xs:pt-4"
          >
            <li
              v-for="post in posts[category.id]"
              :key="post.id"
              class="text-gray-500 dark:text-gray-300 font-medium lg:mb-4"
            >
              <router-link
                :class="{'block xs:mb-4': post.id !== posts[category.id].length}"
                :to="`/knowledge-base/${post.slug}`"
              >
                {{ isRu ? post.name : post.name_eng }}
              </router-link>
            </li>
          </ul>
        </TransitionSlide>
      </li>
    </ul>
  </div>
</template>

<script>
import Search from 'src/components/extends/search/search.vue'
import TransitionSlide from 'src/components/transition-slide/transition-slide.vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

export default {
  name: 'KnowledgeBase',
  components: {
    Search,
    TransitionSlide,
  },
  setup() {
    const $route = useRoute()
    const { locale } = useI18n({ useScope: 'global' })
    const isRu = computed(() => locale.value == 'ru-RU')
    useMeta({
      meta: {
        ogTitle: { property: 'og:title', content: 'TWIX' },
        ogUrl: { property: 'og:url', content: `https://twix.im${$route.path}` },
        ogSiteName: { property: 'og:site_name', content: 'twix.im' },
        ogType: { property: 'og:type', content: 'website' },
      }
    })
    return {isRu}
  },
  data() {
    return {
      categories: null,
      posts: null,
      searchResults: null,
      searchQuery: null,
    }
  },
  watch: {
    searchQuery() {
      this.searchPosts()
    },
  },
  async created() {
    await this.getPostsCategory()
  },
  methods: {
    async getPostsCategory () {
      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'post/list',
          data: {
            format: 'category',
          },
        })

        if (status) {
          this.categories = data.categories.map(category => ({
            ...category,
            expand: false,
          })).sort((a, b) => a.sort - b.sort)
          this.posts = Object.entries(data.posts).reduce((sortedPosts, [category]) => {
            sortedPosts[category] = data.posts[category].sort((a, b) => a.sort - b.sort)
            return sortedPosts
          }, {})
        } else {
          this.$error.show(message)
        }
      } catch (e) {
        this.$error.show(e)
      }
    },
    async searchPosts() {
      const query = this.searchQuery

      if (!query) {
        this.searchResults = null
        return
      }

      try {
        const { data: { data, status, message } } = await this.$instance({
          url: 'post/list',
          data: {
            query,
          },
        })

        if (status) {
          if (this.searchQuery !== query) return

          if (data.posts) {
            this.searchResults = data.posts.map(result => ({
              text: result.name,
              url: `knowledge-base/${result.slug}`,
            }))
          } else {
            this.searchResults = []
          }
        } else {
          this.$error.show(message)
        }
      } catch {
        this.$error.show()
      }
    },
    slideToggleArticles(category) {
      if (this.$matchMedia.desktop) return
      category.expand = !category.expand
    },
  },
}
</script>

<style lang="scss">

.knowledge-base__rubric-toggle {
  width: 24px;
  height: 24px;
  vertical-align: top;
  position: relative;
  display: inline-block;

  &::before,
  &::after {
    width: 16px;
    height: 2px;
    background-color: var(--c-gray-70);
    content: '';
    display: block;
    position: absolute;
    top: calc(50% - 1px);
    left: calc(50% - 8px);
    border-radius: var(--bdrs-round);
    transition-property: opacity, transform;
    transition-duration: var(--t);
  }

  &::after {
    transform: rotate(90deg);
  }

  &_active {
    &::before {
      transform: rotate(90deg);
      opacity: 0;
    }

    &::after {
      transform: rotate(180deg);
    }
  }
}

.knowledge-base__article-list {
  transition-property: height;
  transition-duration: var(--t);
  overflow: hidden;
}
</style>
