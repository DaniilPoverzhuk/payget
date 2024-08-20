<template>
  <div class="editor-channel">
    <h2
      class="editor-channel__title"
      v-text="$t(edit ? 'channel.recordEditing' : 'channel.postTitle')"
    ></h2>
    <div class="editor-channel__wrap" v-if="post !== null">
      <form class="form form_tight" @submit.prevent="submitPost">
        <div class="editor-channel__item">
          <VInput
            class="form__group"
            v-model="post.title"
            :label="$t('channel.postTitle')"
            type="text"
            :v="v$.post.title"
          ></VInput>
        </div>
        <div class="editor-channel__item">
          <VInput
            class="form__group"
            v-model="post.short_description"
            :label="$t('channel.postBrief')"
            type="text"
            :v="v$.post.short_description"
          ></VInput>
        </div>
        <div class="editor-channel__item">
          <div class="v-input__label-container">
            <div
              class="form__input-label"
              :class="{ 'v-input__label-container_error': textError }"
            >
              {{ $t('channel.mainText') }}*
            </div>
          </div>
          <EditorText
            class="editor-channel__editor-text"
            :class="{ 'editor-channel__editor-error': textError }"
            @getText="getText"
            :editMessage="
              edit ? post.description.replaceAll('data-img-id', 'alt') : ''
            "
          ></EditorText>
          <div class="v-input-error v-input-error_error" v-if="textError">
            {{ $t('error.fieldRequired') }}
          </div>
        </div>
        <div class="editor-channel__item">
          <Toggler
            class="form__group"
            v-if="!edit"
            v-model="post.can_comment"
            label="channel.comments"
          ></Toggler>
        </div>
        <div class="editor-channel__item">
          <Toggler
            class="form__group"
            v-model="post.send_notification"
            label="channel.notifications"
          ></Toggler>
        </div>
        <div class="editor-channel__item">
          <EditorCropper
            :cover="post.cover"
            :uuidCover="uuidCover"
            @setPreview="setPreview"
          ></EditorCropper>
        </div>
        <!-- <VSelect class="mb-5 lg:max-w-sm" v-if="selectList.length > 0" v-model="post.tag" :label="$t('channel.tagPost')" :up-list="!isVerified" :select-list="selectList"></VSelect> -->
        <div class="editor-channel__item mb-5 lg:max-w-sm">
          <div class="v-input__label-container">
            <div class="form__input-label">{{ $t('channel.tagsPost') }}</div>
          </div>
          <q-select
            v-model="post.tags"
            multiple
            option-value="id"
            option-label="name"
            :options="langSelectList"
            counter
            max-values="3"
            style="width: 100%"
            :dense="false"
            outlined
            behavior="menu"
            :dark="isDark"
          />
        </div>
        <div class="editor-channel__item">
          <Toggler
            class="form__group"
            v-if="!edit"
            v-model="post.is_private"
            label="channel.postPartial"
          ></Toggler>
        </div>
        <template v-if="isVerified && !post.is_private">
          <div class="editor-channel__item">
            <h3 class="editor-channel__subtile">
              {{ $t('channel.settingsSeo') }}
            </h3>
            <VInput
              class="form__group"
              v-model="post.seo.meta_title"
              :label="$t('channel.titleSeo')"
              type="text"
              :v="v$.post.seo.meta_title"
            ></VInput>
          </div>
          <div class="editor-channel__item">
            <VInput
              class="form__group"
              v-model="post.seo.meta_description"
              :label="$t('channel.metaSeo')"
              type="text"
              :v="v$.post.seo.meta_description"
            ></VInput>
          </div>
          <div class="editor-channel__item">
            <VInput
              class="form__group"
              v-model="post.seo.meta_keywords"
              :label="$t('channel.metaKeywords')"
              type="text"
              :v="v$.post.seo.meta_keywords"
            ></VInput>
          </div>
        </template>
        <div class="editor-channel__paid" v-if="post.is_private">
          <EditorPaid
            v-if="post.private.price"
            v-model="post.private.price.cost"
            :paidData="post.private"
            @setCurrency="setCurrency"
            :codeMessage="codeMessage"
            :v="
              post.private.type !== 'subscription' && v$.post.private.price.cost
            "
          >
          </EditorPaid>
        </div>
        <div class="editor-channel__actions">
          <button
            class="button button_size_lg editor-channel__btn"
            type="submit"
            v-text="$t(edit ? 'button.saveChanges' : 'channel.publish')"
          ></button>
        </div>
        <Dialog
          v-model="postLimited"
          :heading="$t('channel.limitReached')"
          :text="
            $t(isVerified ? 'channel.verifiedUser' : 'channel.verifiedUserText')
          "
          @hide="showDialogLimited"
        ></Dialog>
      </form>
    </div>
  </div>
</template>

<script>
import {
  maxLength,
  minLength,
  helpers,
  required,
  minValue,
} from '@vuelidate/validators'
import { createNamespacedHelpers } from 'vuex'
import VInput from 'src/components/extends/v-input/v-input.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import EditorText from './editor-text/editor-text.vue'
import EditorCropper from './editor-cropper/editor-cropper.vue'
import EditorPaid from './editor-paid/editor-paid.vue'
import Toggler from 'src/components/toggler/toggler.vue'
import VSelect from 'src/components/extends/v-select/v-select.vue'
import i18n from 'src/i18n/localization'
import useVuelidate from '@vuelidate/core'
const payPostCost = helpers.regex(
  'alpha',
  /^(?!0$)(?!0\d)(?:\d+|\d{1,3}(?:,\d{3})+)(?:[.,]\d+)?$/
)
const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'EditorChannel',
  components: {
    EditorText,
    Toggler,
    VInput,
    EditorCropper,
    Dialog,
    // VSelect,
    EditorPaid,
  },
  props: {
    channelId: {
      type: Number,
      default: 0,
    },
    editPostData: {
      type: Object,
      default: null,
    },
    id: {
      type: Number,
      default: 0,
    },
    view: {
      type: String,
      default: '',
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
  data() {
    return {
      textError: false,
      codeMessage: '',
      uuidCover: 'default',
      waiteCover: true,
      post: null,
      postLimited: false,
      newPost: {
        title: '',
        short_description: '',
        description: '',
        tag: '',
        tags: [],
        cover: '',
        can_comment: true,
        send_notification: true,
        seo: {
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
        },
        is_private: false,
        private: {
          type: 'both',
          price: {
            cost: '',
            currency: 'USD',
          },
        },
        videos: [],
      },
      selectList: [],
      tagList: [],
    }
  },
  validations() {
    const post = {
      title: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(250),
      },
      short_description: {
        required,
        maxLength: maxLength(250),
      },
      description: { required },
      seo: {
        meta_title: { maxLength: maxLength(80) },
        meta_description: { maxLength: maxLength(160) },
        meta_keywords: { maxLength: maxLength(170) },
      },
    }

    if (
      this.post &&
      this.post.is_private &&
      this.post.private.type !== 'subscription'
    ) {
      post.private = {
        price: {
          cost: {
            required,
            // payPostCost,
            minValue: minValue(0),
          },
        },
      }
    }
    return { post }
  },
  computed: {
    ...mapUserState(['is_verified', 'channelInfo']),
    edit() {
      return this.editPostData !== null
    },
    isVerified() {
      return this.channelInfo !== null
        ? this.channelInfo.is_verified
        : this.post.is_verified
    },
    isRu() {
      const { locale } = i18n.global
      return locale.value == 'ru-RU'
    },
    langSelectList() {
      return this.selectList.map((item) => {
        const newItem = { ...item }
        newItem.name = this.isRu ? item.name.ru : item.name.en
        return newItem
      })
    },
    isDark() {
      return this.$store.state.user.color_theme === 'dark'
    },
    videos() {
      const parser = new DOMParser()
      const dom = parser.parseFromString(this.post.description, 'text/html')
      const videos = Array.from(dom.querySelectorAll('video')) || []
      const response = videos.map((videoEl) => {
        return {
          uuid: videoEl.getAttribute('data-video-id'),
          url: videoEl.getAttribute('src'),
        }
      })
      return response
    },
  },
  mounted() {
    this.post = this.checkEdit()
    this.getTags()
    this.post = this.edit ? this.editPostData : this.newPost
    this.post.private.type = 'both'
    // this.tagList = this.post.tag ? this.post.tag.split(',') : []
    if (this.post.private.price == null) {
      this.post.private.price = this.newPost.private.price
    }
    if (this.post.can_comment == null) {
      this.post.can_comment = true
    }
    if (this.post.send_notification == null) {
      this.post.send_notification = true
    }
  },
  methods: {
    setCurrency(val) {
      this.post.private.price.currency = val
    },
    selectTag(tag) {
      this.post.tag = tag
    },
    setPreview(val) {
      this.uuidCover = val
    },
    showDialogLimited() {
      this.postLimited = false
    },
    checkEdit() {
      return this.editPostData
    },
    getText(message) {
      this.post.description = message
      this.textError = false
    },
    submitPost() {
      this.v$.post.$touch()
      if (!this.post.description || this.v$.post.$invalid) {
        if (!this.post.description) this.textError = true
        return false
      }
      if (this.videos && this.videos.length) {
        this.post.videos = this.videos
      }
      const seo = {}
      if (this.post.seo !== null) {
        for (const key in this.post.seo) {
          if (this.post.seo[key] !== null && this.post.seo[key].length > 0) {
            seo[key] = this.post.seo[key]
          }
        }
      }

      const form = {
        title: this.post.title,
        short_description: this.post.short_description,
        description: this.post.description,
        seo,
        channel_id: this.channelId || this.id,
        videos: this.post.videos,
        can_comment: this.post.can_comment,
        send_notification: this.post.send_notification,
      }

      if (this.post.tags && this.post.tags.length) {
        form.tags = this.post.tags.map((x) => x.id)
      }
      if (this.post.tag) form.tag = `${this.post.tag}`
      if (this.uuidCover !== 'default') {
        form.cover = this.uuidCover
      }
      if (this.post.id) form.post_id = this.uuidCover
      if (this.post.is_private && this.post.private.type !== 'subscription') {
        form.private = this.post.private.price
      }
      if (this.post.is_private) {
        if (!form.private) form.private = {}
        form.private.type = this.post.private.type
      }
      this.edit ? this.editPost(form) : this.publishPost(form)
    },
    async publishPost(form) {
      try {
        const { status, data } = await this.$instance({
          url: `/userfeed/channel/${this.channelId || this.id}/post`,
          data: form,
        })
        if (status) {
          this.$emit('editorShow')
          this.$emit('addPost', data.data)
          this.codeMessage = ''
        }
      } catch (error) {
        if (error.response.data.message) {
          this.codeMessage = error.response.data.message
        }
        if (error.response.data === 'exceptions.limit_exhausted') {
          this.postLimited = true
        }
      }
    },
    async editPost(form) {
      try {
        const { status, data } = await this.$instance.patch(
          `/userfeed/channel/${this.editPostData.channel.id}/post/${this.editPostData.id}`,
          form
        )
        if (status) {
          this.$emit('editorShow', data.data)
        }
      } catch (error) {
        if (error.response.data.message) {
          this.codeMessage = error.response.data.message
        } else {
          this.$error.show()
        }
      }
    },
    async getTags() {
      try {
        const { data, status } = await this.$instance({
          method: 'GET',
          url: 'userfeed/tag',
          params: {
            limit: 30,
          },
        })
        if (data) {
          data.data.forEach((el) =>
            this.selectList.push({
              id: el.id,
              name: el.name,
            })
          )
          if (this.post.tag) {
            this.post.tag = this.post.tag.id
          }
        }
      } catch {
        this.$error.show()
      }
    },
  },
}
</script>
<style lang="scss">
.editor-channel {
  &__title {
    font-size: 26px;
    line-height: 31px;
    color: var(--c-gray-80);
    text-align: center;
  }

  &__wrap {
    padding-top: 24px;
  }

  &__paid {
    margin-top: 24px;
  }

  &__subtile {
    font-size: 22px;
    line-height: 26px;
  }

  &__btn {
    max-width: 417px;
    margin: auto;
  }

  &__item {
    margin-bottom: 24px;

    .q-field--auto-height .q-field__control,
    .q-field--auto-height .q-field__native {
      height: 48px;
      padding-left: 6px;
    }
  }

  &__actions {
    padding-top: 16px;

    @media (--desktop) {
      padding-top: 24px;
    }
  }

  &__editor {
    &-text {
      margin-bottom: -20px;
    }

    &-error {
      .ql-container.ql-snow {
        border: 2px solid var(--c-alert);
        border-bottom: 0;
      }

      .ql-toolbar.ql-snow {
        border: 2px solid var(--c-alert);
        border-top: 0;
      }
    }
  }
}
</style>
