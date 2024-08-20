<template>
<section class="article">
  <Back v-if="$route.params.article" to="/knowledge-base" :label="$t('knowledge.title')">
  </Back>
  <template v-if="post">
    <h1 class="article__heading">{{ isRu ? post.name : post.name_eng }}</h1>
    <Wysiwyg class="article__content" :text="isRu ? post.text.ru : post.text.en"></Wysiwyg>
  </template>
</section>
</template>

<script>
import Wysiwyg from 'src/components/wysiwyg/wysiwyg.vue'
import Back from 'src/components/back/back.vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'
import i18n from 'src/i18n/localization'

export default {
  name: 'KnowledgeBaseArticle',
  components: {
    Wysiwyg,
    Back,
  },
  setup() {
    const $route = useRoute()
    useMeta({
      meta: {
        ogTitle: { property: 'og:title', content: 'TWIX' },
        ogUrl: { property: 'og:url', content: `https://twix.im${$route.path}` },
        ogSiteName: { property: 'og:site_name', content: 'twix.im' },
        ogType: { property: 'og:type', content: 'website' },
      }
    })
  },
  data() {
    return {
      post: null,
    }
  },
  computed: {
    slug() {
      return this.$route.params.article || process.env.VUE_APP_RULES_SLUG
    },
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
  },
  async created() {
    try {
      const { data: { data, status, message } } = await this.$api({
        method: 'POST',
        url: 'post/get/data',
        data: {
          slug: this.slug,
        },
      })

      if (status) {
        this.post = data
      } else {
        this.$error.show(message)
      }
    } catch {
      this.$error.show()
    }
  },
}
</script>

<style lang="scss">
.article {
  padding: 30px 20px;
  max-width: 830px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 1200px) {
    padding: 30px 50px;
  }
}

.article__heading {
  text-align: center;
}

.article__content {
  margin-top: 24px;

  @media (min-width: 1200px) {
    margin-top: 30px;
  }
}
</style>
