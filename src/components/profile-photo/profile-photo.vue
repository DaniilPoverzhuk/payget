<template>
    <div class="profile-photo">
        <div class="profile-photo__wrap">
            <div class="profile-photo__item avatar">
                <div class="profile-photo__subtitle">{{ $t('user.avatar') }}</div>
                <div class="avatar__wrap">
                    <div class="avatar__photo"><img class="avatar__img" v-if="avatarImg" :src="avatarImg" />
                        <div class="avatar__text" v-else v-text="name.charAt(0)"></div>
                    </div>
                    <div class="avatar__actions">
                        <div class="profile-photo__file file"><input class="file__input" type="file" ref="file" @change="previewFiles($event, 'avatar')" accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp" /><button class="avatar__btn file__btn button" :class="{button_type_success:avatarImg }">{{ $t(!avatarImg ? 'button.upload' : 'button.change') }}</button></div><button class="avatar__btn button button_type_info" @click="removeProfileImg('avatar')">{{ $t('button.remove') }}</button>
                    </div>
                </div>
            </div>
            <div class="profile-photo__item baner">
                <div class="profile-photo__subtitle">{{ $t('user.banner') }}</div>
                <div class="baner__wrap">
                    <div class="baner__area"><img class="baner__img" :src="bannerImg || defaultBanner" /></div>
                    <div class="baner__actions">
                        <div class="profile-photo__file file"><input class="file__input" type="file" accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp" @change="previewFiles($event, 'banner')" /><button class="avatar__btn file__btn button" :class="{button_type_success:bannerImg }" v-text="$t(!bannerImg ? 'button.upload' : 'button.change')"></button></div><button class="avatar__btn button button_type_info" @click="removeProfileImg('banner')">{{ $t('button.remove') }}</button>
                    </div>
                </div>
            </div>
        </div>
        <Dialog v-model="cropperDialog" :heading="image.imgType == 'avatar' ?  $t('user.miniaturesAvatar') : $t('user.miniaturesBanner')" @hide="cropperDialog = false" classCustom="profile-photo__dialog">
            <ProfileCropper :img="image" :ratio="ratio" @setLocalImg="setLocalImg" @setData="setData" :width="image.imgType == 'avatar' ? 256 : 1266" :height="image.imgType == 'avatar' ? 256 : 180"></ProfileCropper>
        </Dialog>
    </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import ProfileCropper from './profile-cropper/profile-cropper.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import banner from 'src/assets/img/baner-area.svg'

const {
  mapState: mapUserState,
  mapMutations: mapUserMutations,
} = createNamespacedHelpers('user')

export default {
  components: {
    ProfileCropper,
    Dialog,
  },
  data() {
    return {
      cropperDialog: false,
      defaultBanner: banner,
      bannerImg: '',
      avatarImg: '',
      ratio: {
        aspectRatio: 10 / 10,
      },
      imgSrc: '',
      img: null,
      image: {
        src: null,
        type: null,
        imgType: null,
      },
    }
  },
  computed: {
    ...mapUserState(['avatar', 'banner', 'name']),
  },
  mounted() {
    this.avatarImg = this.avatar
    this.bannerImg = this.banner
  },
  methods: {
    ...mapUserMutations(['setSomeState']),
    // This function is used to detect the actual image type,
    async setData(form) {
      form.append('_method', 'put')
      try {
        await this.$instance.post('/user/avatar-banner', form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
          // console.log(res);
        })
      } catch (err) {
        console.error(err)
      }
    },
    getMimeType(file, fallback = null) {
      const byteArray = (new Uint8Array(file)).subarray(0, 4)
      let header = ''
      for (let i = 0; i < byteArray.length; i++) {
        header += byteArray[i].toString(16)
      }
      switch (header) {
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
    setLocalImg(base64data, type) {
      type == 'avatar' ? this.avatarImg = base64data : this.bannerImg = base64data
      this.cropperDialog = false
      this.setSomeState([type, base64data])
    },
    async removeProfileImg(type) {
      try {
        await this.$instance.delete('/user/avatar-banner', {
          data: {
            type,
          },
        }).then((res) => {
          type == 'avatar' ? this.avatarImg = '' : this.bannerImg = ''
        })
      } catch (err) {
        console.error(err)
      }
    },
    previewFiles(event, type) {
      this.ratio.aspectRatio = type == 'avatar' ? 10 / 10 : 211 / 30
      const { files } = event.target
      if (files && files[0]) {
        if (this.image.src) {
          URL.revokeObjectURL(this.image.src)
        }
        const blob = URL.createObjectURL(files[0])
        const reader = new FileReader()
        reader.addEventListener('load', (e) => {
          this.image = {
            src: blob,
            type: this.getMimeType(e.target.result, files[0].type),
            imgType: type,
          }
        })
        reader.readAsArrayBuffer(files[0])
        this.cropperDialog = true
      }
    },
  },
}
</script>


<style lang="scss">

.profile-photo {

  &__item {
    margin-bottom: 24px;

    @media (min-width: 1200px) {
      margin-bottom: 28px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__subtitle {
    font-weight: var(--fw-600);
    font-size: var(--fz-md);
    line-height: var(--fz-xl);
    color: var(--c-gray-70);
    margin-bottom: 10px;
  }

  &__file {
    position: relative;
  }

  &__dialog {
    padding: 10px 32px 32px;

    @media (min-width: 1200px) {
      padding: 30px 48px;
    }
  }

  .file {
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

  .avatar {
    &__photo,
    &__wrap {
      display: flex;
    }

    &__photo {
      width: 140px;
      height: 140px;
      background: #EBDCF7;
      border-radius: var(--bdrs-default);
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-right: 24px;

      @media (min-width: 1200px) {
        width: 104px;
        height: 104px;
      }
    }

    &__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__text {
      font-weight: var(--fw-500);
      font-size: 48px;
      color: var(--c-primary);
      text-transform: uppercase;
    }

    &__btn {
      min-width: 156px;
      display: block;
    }

    &__actions .file {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .baner {
    &__area {
      border-radius: var(--bdrs-default);
      overflow: hidden;
      height: 104px;
      margin-bottom: 24px;
    }

    &__actions {
      display: flex;
    }

    &__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__btn {
      margin-right: 8px;

      @media (min-width: 1200px) {
        margin-right: 33px;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    &__actions .file {
      margin-right: 8px;

      @media (min-width: 1200px) {
        margin-right: 33px;
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }
}

</style>
