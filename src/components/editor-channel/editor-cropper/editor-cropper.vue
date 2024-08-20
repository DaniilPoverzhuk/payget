<template>
  <div class="editor-cropper">
    <div class="editor-cropper__inner">
      <div class="editor-cropper__subtitle">{{ $t('channel.preview') }}</div>
      <div class="editor-cropper__wrap">
        <div class="editor-cropper__photo" :key="previewImg">
          <img
            class="editor-cropper__img"
            v-if="previewImg"
            :src="previewImg"
          />
          <div class="editor-cropper__text" v-else>
            <Loader class="loader" v-if="loader"></Loader
            ><svg
              class="editor-cropper__icon"
              v-else
              v-svg
              size="32"
              symbol="random-image"
            ></svg>
          </div>
        </div>
        <div class="editor-cropper__actions">
          <div class="profile-photo__file file">
            <input
              class="file__input"
              type="file"
              ref="file"
              @change="previewFiles($event, 'cover')"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
            />
            <button
              class="editor-cropper__btn file__btn button_type_success button"
              v-text="$t(!previewImg ? 'button.upload' : 'button.change')"
            ></button>
          </div>
          <button
            class="editor-cropper__btn button button_type_info"
            @click.prevent="removeCover()"
          >
            {{ $t('button.remove') }}
          </button>
        </div>
      </div>
    </div>
    <Dialog
      v-model="cropperDialog"
      :heading="$t('button.previewSelect')"
      @hide="cropperDialog = false"
      classCustom="profile-photo__dialog"
    >
      <ProfileCropper
        :img="preview"
        :ratio="ratio"
        @setLocalImg="setLocalImg"
        @setData="setData"
        maxWidth="836"
        maxHeight="836"
      ></ProfileCropper>
    </Dialog>
  </div>
</template>

<script>
import ProfileCropper from 'src/components/profile-photo/profile-cropper/profile-cropper.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import Loader from 'src/components/loader/loader.vue'
import error from 'src/error.js'

export default {
  name: 'EditorCropper',
  components: {
    ProfileCropper,
    Dialog,
    Loader,
  },
  props: {
    cover: {
      type: String,
      default: '',
    },
    uuidCover: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      cropperDialog: false,
      previewImg: '',
      ratio: {},
      imgSrc: '',
      loader: false,
      img: null,
      preview: {
        src: null,
        type: null,
        imgType: 'cover',
      },
    }
  },
  mounted() {
    this.previewImg = this.cover
  },
  unmounted() {
    this.previewImg = ''
  },
  methods: {
    removeCover() {
      this.previewImg = ''
      this.$emit('setPreview', null)
    },
    getMimeType(file, fallback = null) {
      const byteArray = new Uint8Array(file).subarray(0, 4)
      let header = ''
      for (let i = 0; i < byteArray.length; i++) {
        header += byteArray[i].toString(16)
      }
      switch (header) {
        case '47494638':
          return 'image/gif'
        case '89504e47':
          return 'image/png'
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          return 'image/jpeg'
        default:
          return fallback
      }
    },
    async setData(form) {
      // отправка
      this.previewImg = ''
      this.loader = true
      try {
        await this.$instance
          .post('/userfeed/post/image', form, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .then((data) => {
            this.previewImg = data.data.url
            this.$emit('setPreview', data.data.id)
          })
      } catch (err) {
        console.error(err)
        error.show(err.message)
      } finally {
        this.loader = false
      }
    },
    setLocalImg(base64data, type) {
      this.cropperDialog = false
    },
    previewFiles(event, type) {
      const { files } = event.target
      if (files && files[0]) {
        if (this.preview.src) {
          URL.revokeObjectURL(this.preview.src)
        }
        const blob = URL.createObjectURL(files[0])
        const reader = new FileReader()
        reader.addEventListener('load', (e) => {
          this.preview = {
            src: blob,
            type: this.getMimeType(e.target.result, files[0].type),
            imgType: type,
          }
          console.log('this.preview', this.preview)
          if (this.preview.type == 'image/gif') {
            const formData = new FormData()
            formData.append('image', files[0], files[0].name)
            formData.append('type', this.preview.imgType)
            this.setData(formData)
          } else {
            this.cropperDialog = true
          }
        })
        reader.readAsArrayBuffer(files[0])
      }
    },
  },
}
</script>
<style lang="scss">
.editor-cropper {
  &__photo {
    display: flex;
  }

  &__wrap {
    @media (min-width: 1200px) {
      display: flex;
    }
  }

  &__photo {
    width: 320px;
    height: 180px;
    background: var(--c-gray-10);
    border-radius: var(--bdrs-default);
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-right: 24px;
    margin-bottom: 24px;

    @media (min-width: 1200px) {
      width: 184px;
      height: 104px;
      margin-bottom: 0;
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__btn {
    min-width: 156px;
    display: block;
  }

  &__actions {
    display: flex;

    @media (min-width: 1200px) {
      display: block;
    }

    .file {
      margin-right: 8px;
      @media (min-width: 1200px) {
        margin-bottom: 12px;
        margin-right: 0;
      }

      &:last-child {
        margin-right: 0;
        margin-bottom: 0;
      }
    }
  }

  &__subtitle {
    font-size: 15px;
    color: var(--c-gray-70);
    margin-bottom: 10px;
  }

  &__icon {
    fill: var(--c-gray-10);
    font-weight: var(--fw-600);
    stroke: var(--c-gray-20);
  }

  .loader {
    margin: 0;
  }

  .file {
    position: relative;

    &__input {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;

      &:hover + .button {
        background-color: var(--c-primary-dark);
      }

      &:hover + .button_type_success {
        background-color: var(--c-secondary-dark);
      }
    }
  }
}

.q-dialog__inner--minimized > div {
  max-width: 992px;
}
</style>
