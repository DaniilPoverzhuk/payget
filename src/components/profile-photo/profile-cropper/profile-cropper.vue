<template>
    <div class="preview-result">
        <div class="preview-result__wrap">
            <Cropper class="preview-result__cropper" ref="cropper" :class="{'preview-result__cropper--avatar': img.imgType == 'avatar', 'preview-result__cropper--banner': img.imgType == 'banner'}" :src="img.src" :debounce="false" @change="onChange" :canvas="{height: height, width: width,  maxWidth: maxWidth, maxHeight: maxHeight,}" :stencil-props="ratio"></Cropper>
            <div class="preview-result__previews" v-if="img.imgType == 'avatar' && $matchMedia.desktop">
                <div class="preview-result__subtitle">{{ $t('user.miniatures') }}</div>
                <Preview class="preview-result__preview" :image="result.image" :coordinates="result.coordinates"></Preview>
                <Preview class="preview-result__preview preview-result__preview--big" :image="result.image" :coordinates="result.coordinates"></Preview>
            </div>
        </div><button class="preview-result__btn button" v-bind="$attrs" @click="onCrop($event)">{{ $t('button.save') }}</button>
    </div>
</template>

<script>
import {Cropper, Preview} from 'vue-advanced-cropper'

export default {
  components: {
    Cropper,
    Preview,
  },
  props: {
    img: {
      type: Object,
      default: null,
    },
    ratio: {
      type: Object,
      default: null,
    },
    width: {
      type: [String, Number],
      default: 'auto',
    },
    height: {
      type: [String, Number],
      default: 'auto',
    },
    maxWidth: {
      type: [String, Number],
      default: 'auto',
    },
    maxHeight: {
      type: [String, Number],
      default: 'auto',
    },
  },
  data() {
    return {
      result: {
        coordinates: null,
        image: null,
      },
    }
  },
  computed: {
    sizeRestrictionsAlgorithmData() {
      return {
        touch: true,
        mouse: true,
        autoZoom: true,
        maxWidth: 836,
        maxHeight: 836,
        wheel: {
          ratio: 0.1
        },
        adjustStencil: true
      }
    },
  },
  methods: {
    flip(x, y) {
      if (this.$refs.cropper.customImageTransforms.rotate % 180 !== 0) {
        this.$refs.cropper.flip(!x, !y)
      } else {
        this.$refs.cropper.flip(x, y)
      }
    },
    rotate(angle) {
      this.$refs.cropper.rotate(angle)
    },
    onChange({coordinates, image}) {
      this.result = {
        coordinates,
        image,
      }
    },
    onCrop() {
      const result = this.$refs.cropper.getResult()
      result.canvas.toBlob((blob) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const base64data = reader.result
          this.$emit('setLocalImg', base64data, this.img.imgType)
        }
        const form = new FormData()
        const file = new File([blob], 'avatar.jpg', {type: blob.type})

        form.append('image', file)
        form.append('type', this.img.imgType)
        this.$emit('setData', form)
      }, 'image/jpeg')
    },

  },
}
</script>


<style lang="scss">

.preview-result {

  &__wrap {
    padding: 24px 0 32px;
    display: flex;
    justify-content: center;

    @media (min-width: 1200px) {
      padding: 48px 0;
    }
  }
  &__cropper {
    &--avatar {
      width: 264px;
      height: 264px;

      @media (min-width: 1200px) {
        width: 324px;
        height: 324px;
      }
    }

    &--banner {
      width: 324px;
      height: 136px;

      @media (min-width: 1200px) {
        width: 512px;
        height: 324px;
      }
    }
  }

  &__previews {
    display: none;
    @media (min-width: 1200px) {
      display: block;
      margin-left: 48px;
    }
  }

  &__preview {
    border-radius: var(--bdrs-default);
    overflow: hidden;
    margin-bottom: 10px;
    width: 104px;
    height: 104px;

    &--big {
      width: 140px;
      height: 140px;
    }
  }

  &__preview-image {
    width: 100%;
  }

  &__btn {
    margin: auto;
    display: block;
    min-width: 100%;

    @media (min-width: 1200px) {
      min-width: 345px;
    }
  }

  &__subtitle {
    color: var(--c-gray-70);
    font-size: 15px;
    line-height: 18px;
    font-weight: var(--fw-600);
    margin-bottom: 24px;
  }
}


</style>
