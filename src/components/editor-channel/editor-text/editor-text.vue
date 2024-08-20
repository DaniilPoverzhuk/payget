<template>
	<div class="editor-text">
		<div class="editor-text__wrap">
			<QuillEditor contentType="html" class="notranslate" ref="quillEditor" v-model:content="message" :maxHeight="158" rows="1" :options="editorOption" @ready="onReadyQuill" @update:content="$emit('getText', message)"></QuillEditor>
		</div>
		<input class="editor-text__file" type="file" ref="getFile" @change="uploadFile($event)" />
		<input class="editor-text__file" type="file" ref="getVideoFile" @change="uploadVideoFile($event)" />
		<div class="editor-text__error" v-if="errorForFile" v-text="errorForFile"></div>
		<Dialog v-model="linkDialog" :heading="$t('chat.inserting')" width="narrow" @hide="linkDialog = false">
			<div class="form reserve-form">
				<VInput class="form__group" v-model.trim="dataLink.selText" type="text" :label="$t('chat.displayedText')"></VInput>
				<VInput class="form__group" v-model.trim="dataLink.selLink" type="text" :label="$t('chat.address')"></VInput>
				<footer class="form__footer"><Button viewColor="primary" @click="addToolbarlink" size="lg" class="w-full">{{ $t('chat.insertLink') }}</Button></footer>
			</div>
		</Dialog>
    <Dialog v-model="videoDialog" :heading="$t('chat.insertingVideo')" width="narrow" @hide="closeVideoDialog">
			<div class="form reserve-form video-dialog">
					<q-tabs
						v-model="videoTab"
						dense
						align="justify"
					>
						<q-tab class="text-red" name="youtube" icon="mdi-youtube" label="Youtube" />
						<!-- <q-tab class="text-orange" name="movies" icon="movie" label="Video File" /> -->
					</q-tabs>
					<q-tab-panels v-model="videoTab" animated>
						<q-tab-panel class="px-0" name="youtube">
							<VInput class="form__group" v-model.trim="dataVideoLink.videoLink" type="text" :label="$t('chat.address')"></VInput>
						</q-tab-panel>
						<!-- <q-tab-panel class="px-0" name="movies">
							<div class="video-file" v-if="dataVideoFile.name">
								<div class="file-info-wrap">
									<div class="file-info">
										<span class="file-name">{{ dataVideoFile.name }}</span>
										<span class="file-size">{{ dataVideoFile.offsetSize }} / {{ dataVideoFile.size }}</span>
										<span v-if="dataVideoFile.error" class="text-negative">{{ dataVideoFile.error }}</span>
									</div>
									<q-icon v-if="dataVideoFile.uuid || dataVideoFile.error" @click="resetVideoFile" color="red-8" style="cursor: pointer" name="close" />
								</div>
								<q-circular-progress
									show-value
									font-size="12px"
									:value="dataVideoFile.percentage"
									size="50px"
									:thickness="0.22"
									:color="dataVideoFile.uuid ? 'positive' : 'primary'"
									track-color="grey-3"
								>
									<q-icon color="positive" style="font-size: 2em" v-if="dataVideoFile.uuid" name="mdi-check-all" />
									<span v-else>
										{{ dataVideoFile.percentage }}%
									</span>
								</q-circular-progress>
							</div>
							<Button v-else viewColor="secondary" @click="addVideoFile" size="lg" class="w-full">{{ $t('button.uploadVideo') }}</Button>
						</q-tab-panel> -->
					</q-tab-panels>
				<footer class="form__footer">
          <Button viewColor="primary" @click="addVideo" size="lg" class="w-full">{{ $t('button.add') }}</Button>
        </footer>
			</div>
		</Dialog>
	</div>
</template>

<script>
async function loadQuill() {
  const { QuillEditor } = await import('@vueup/vue-quill')
  return QuillEditor
}
async function loadImageBlotFormat() {
  const Quill = await import('quill')
  const InlineBlot = Quill.default.import('blots/block')

  class ImageBlot extends InlineBlot {
    static create(data) {
      const node = super.create(data)
      node.setAttribute('data-img-id', data.id)
      node.setAttribute('src', data.url)
      return node
    }

    static value(domNode) {
      const { src, custom } = domNode.dataset
      return { src, custom }
    }
  }

  ImageBlot.blotName = 'imageBlot'
  ImageBlot.tagName = 'img'
  if(!Quill.default.import('formats/imageBlot')) {
    Quill.default.register(ImageBlot)
  }
  return ImageBlot
}

async function loadVideoBlotFormat() {
  const Quill = await import('quill')
  const InlineBlot = Quill.default.import('blots/block')

  class VideoBlot extends InlineBlot {
    static create(data) {
      const node = super.create(data)
      node.setAttribute('data-video-id', data.uuid)
      node.setAttribute('src', data.url)
      return node
    }

    static value(domNode) {
      const { src, custom } = domNode.dataset
      return { src, custom }
    }
  }

  VideoBlot.blotName = 'videoBlot'
  VideoBlot.tagName = 'video'
  if(!Quill.default.import('formats/videoBlot')) {
    Quill.default.register(VideoBlot)
  }
  return VideoBlot
}
import { defineAsyncComponent } from 'vue'
import Dialog from 'src/components/dialog/dialog-q.vue'
import VInput from 'src/components/extends/v-input/v-input.vue'
const QuillEditor = defineAsyncComponent(() => loadQuill())

export default {
  name: 'editor-text',
  components: {
    Dialog,
    VInput,
    QuillEditor
  },
  data() {
    return {
      message: '',
      linkDialog: false,
      videoDialog: false,
      dataVideoLink: {
        videoLink: '',
        videoIndex: 0
      },
      videoTab: 'youtube',
      dataVideoFile: {
        name: '',
        url: '',
        uuid: '',
        percentage: 0,
        index: 0,
        size: '',
        offsetSize: '0.00MB',
        error: ''
      },
      errorForFile: '',
      images: {},
      accessFormatImage: [
        'image/png',
        'image/jpeg',
        'image/gif'
      ],
      dataLink: {
        selText: '',
        selLink: '',
        selTextIndex: 0,
        selTextLength: 0
      },
      editorOption: {
        placeholder: '',
        theme: 'snow',
        modules: {
          clipboard: {
            matchVisual: false
          },
          toolbar: {
            container: [
              [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link'],
              ['image', 'video'],
              [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }]
            ],
            handlers: {
              link: () => {
                this.getQuillText()
              },
              underline: () => {
                this.selectionChange('underline')
              },
              strike: () => {
                this.selectionChange('strike')
              },
              italic: () => {
                this.selectionChange('italic')
              },
              bold: () => {
                this.selectionChange('bold')
              },
              image: () => {
                this.$refs.getFile.click()
              },
              video: () => {
                this.addToolbarVideo()
              },
            }
          }
        }
      }
    }
  },
  props: {
    editMessage: {
      type: String,
      default: ''
    },
    showVideo: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    quillEditor() {
      return this.$refs.quillEditor
    },
  },
  mounted() { },
  methods: {
    async onReadyQuill() {
      if (this.$refs.quillEditor) {
        const ImageBlot = await loadImageBlotFormat()
        if(this.showVideo) {
          const VideoBlot = await loadVideoBlotFormat()
          this.$refs.quillEditor.getQuill().options.formats = this.showVideo ? {
            imageBlot: ImageBlot,
            videoBlot: VideoBlot
          } : {
            imageBlot: ImageBlot
          }
        }
        this.$refs.quillEditor.getQuill().root.innerHTML = this.editMessage
          .replaceAll('data-img-id', 'alt').replaceAll('&lt;iframe', '<iframe')
          .replaceAll('&gt;&lt;/iframe&gt;', '></iframe>').replaceAll('&lt;video', '<video')
          .replaceAll('&gt;<br>&lt;/video&gt;', '><br></video>')
      }
    },
    uploadFile(e) {
      this.errorForFile = ''
      const file = e.target.files[0]
      if (!file) return false

      if ((file.size / 1000000).toFixed(2) >= 5) { // mb
        this.errorForFile = this.$t('error.maximumFile')
        return false
      }
      if (!this.accessFormatImage.includes(file.type)) {
        this.errorForFile = this.$t('error.extensionsAvailable')
        return false
      }
      const form = new FormData()
      form.append('image', file)
      this.fetchImagesPath(form)
    },
    async uploadVideoFile(e) {
      const file = e.target.files[0]

      if (!file) {
        console.error('Выберите файл для загрузки.')
        return false
      }

      this.dataVideoFile.error = ''
      this.dataVideoFile.name = file.name
      this.dataVideoFile.size = this.getSize(file.size + '')

      const chunkSize = 1024 * 1024 // 1 МБ
      let offset = 0
      let uuid
      while (offset < file.size) {
        if(!this.videoDialog) break
        const chunk = file.slice(offset, offset + chunkSize, file.type)
        const formData = new FormData()
        formData.set('chunk', offset / chunkSize)
        formData.set('chunks', Math.ceil(file.size / chunkSize))
        formData.set('filename', file.name)
        formData.append('video', chunk)

        try {
          const response = await this.$instance.post('/attachment/video/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          uuid = response.data.uuid
          if(uuid) {
            this.dataVideoFile.uuid = uuid
            this.dataVideoFile.url = response.data.url
            this.dataVideoFile.percentage = 100
          } else {
            this.dataVideoFile.percentage = response.data.data.percentage
          }
          offset += chunkSize
          this.dataVideoFile.offsetSize = this.getSize((offset < file.size ? offset : file.size) + '')
        } catch (error) {
          this.dataVideoFile.error = this.$t('error.fileNotUploaded')
          console.error('Ошибка при загрузке чанка:', error)
          break
        }
      }

      if(this.dataVideoFile.percentage == 100) {
        console.log('FileLoaded')
      }
    },
    async fetchImagesPath(form) {
      try {
        const data = await this.$instance.post('/userfeed/post/image', form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((data) => {
          if (data.data.url) {
            const range = this.$refs.quillEditor?.getQuill().getSelection()
            this.$refs.quillEditor?.getQuill().insertEmbed(range.index, 'imageBlot', data.data)
          }
        })
      } catch (err) {
        console.error(err)
      }
    },
    selectionChange(type) {
      const range = this.$refs.quillEditor?.getQuill().getSelection(true)
      const format = this.$refs.quillEditor?.getQuill().getFormat(range.index, range.length)

      if (!format[type]) {
        this.$refs.quillEditor?.getQuill().formatText(range.index, range.length, type, true)
        this.$refs.quillEditor?.getQuill().format(type, true)
      } else {
        this.$refs.quillEditor?.getQuill().formatText(range.index, range.length, type, false)
        this.$refs.quillEditor?.getQuill().format(type, false)
      }
      this.$refs.quillEditor?.getQuill().setSelection(range.index + range.length, 0)
    },
    getQuillText() {
      const range = this.$refs.quillEditor?.getQuill().getSelection()
      if (range) {
        this.dataLink.selText = this.$refs.quillEditor?.getQuill().getText(range.index, range.length)
        this.dataLink.selTextIndex = range.index
        this.dataLink.selTextLength = range.length
      }
      this.linkDialog = true
    },
    addToolbarlink() {
      const protocol = this.dataLink.selLink.match(/^(?:http(s)?:\/\/)|(\/\/)|www/) == null ? `//${this.dataLink.selLink}` : this.dataLink.selLink
      this.$refs.quillEditor?.getQuill().deleteText(this.dataLink.selTextIndex, this.dataLink.selTextLength)
      this.$refs.quillEditor?.getQuill().insertText(this.dataLink.selTextIndex, this.dataLink.selText, 'link', protocol)
      this.$refs.quillEditor?.getQuill().setSelection(this.dataLink.selTextIndex + this.dataLink.selText.length, 0)
      this.resetLinkData()
      this.linkDialog = false
    },
    addToolbarVideo() {
      const range = this.$refs.quillEditor?.getQuill().getSelection()
      if (range) {
        this.dataVideoLink.videoIndex = range.index
        this.dataVideoFile.index = range.index
      }
      this.videoDialog = true
    },
    addVideoFile() {
      this.$refs.getVideoFile.click()
    },
    getId(url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)

      return (match && match[2].length === 11)
        ? match[2]
        : null
    },
    addVideo() {
      if(this.videoTab == 'youtube') {
        this.embedVideo()
      } else {
        this.embedVideoFile()
      }
      this.closeVideoDialog()
    },
    embedVideo () {
      const id = this.getId(this.dataVideoLink.videoLink)
      if(id) {
        this.$refs.quillEditor?.getQuill().insertEmbed(this.dataVideoLink.videoIndex, 'video', `//www.youtube.com/embed/${id}`)
        this.$refs.quillEditor?.getQuill().setSelection(this.dataVideoLink.videoIndex + 1)
      }
    },
    embedVideoFile() {
      if(this.dataVideoFile && this.dataVideoFile.uuid) {
        this.$refs.quillEditor?.getQuill().insertEmbed(this.dataVideoFile.index, 'videoBlot', this.dataVideoFile)
        this.$refs.quillEditor?.getQuill().setSelection(this.dataVideoFile.index + 1)
      }
    },
    getSize(size) {
      return size.length < 7 ? `${Math.round(+size / 1024).toFixed(2)}kb` : `${(Math.round(+size / 1024) / 1000).toFixed(2)}MB`
    },
    closeVideoDialog() {
      this.videoDialog = false
      this.videoTab = 'youtube'
      this.resetVideoData()
      this.resetVideoFile()
    },
    resetLinkData() {
      this.dataLink = {
        selText: '',
        selLink: '',
        selTextIndex: 0,
        selTextLength: 0
      }
    },
    resetVideoData() {
      this.$refs.getFile.value = null
      this.dataVideoLink = {
        videoText: '',
        videoIndex: 0
      }
    },
    resetVideoFile() {
      this.$refs.getVideoFile.value = null
      this.dataVideoFile = {
        name: '',
        url: '',
        uuid: '',
        percentage: 0,
        index: 0,
        size: '',
        offsetSize: '0.00MB',
        error: ''
      }
    }
  },
}
</script>

<style lang="scss">
.editor-text {

	&__file {
		visibility: hidden;
		width: 0;
		height: 0;
	}

	.editor-text__wrap {
		display: flex;
		flex-direction: column;
	}

	.ql-container.ql-snow {
		order: -1;
		max-height: inherit;
		min-height: 160px;
		border: 2px solid var(--c-gray-15);
		border-bottom: 0;
		border-radius: 10px 10px 0 0;
		padding: 10px;
	}

	.ql-toolbar.ql-snow {
		display: flex;
		flex-wrap: wrap;
		transform: inherit;
		background: var(--c-gray-10);
		border-radius: 0 0 10px 10px;
		padding: 10px 20px;

		@media (min-width: 1200px) {
			flex-wrap: nowrap;
		}
	}

	.ql-formats {

		&:nth-child(1),
		&:nth-child(2) {
			width: inherit;
			margin-bottom: 0;
		}

		&:last-child {
			.ql-image {
				margin: 0;
			}
		}
	}

	.ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
		border-color: var(--c-gray-15);
		background: var(--c-white);
	}

	.ql-snow .ql-picker.ql-expanded .ql-picker-options {
		display: block;
		margin-top: -1px;
		top: 100%;
		z-index: 1;
	}

	.ql-toolbar.ql-snow .ql-picker-options {
		border: 1px solid transparent;
		box-shadow: rgb(0 0 0 / 20%) 0 2px 8px;
	}

	.ql-snow .ql-picker-options {
		background-color: var(--white);
		display: none;
		min-width: 100%;
		padding: 4px 8px;
		position: absolute;
		white-space: nowrap;
	}

	.ql-snow .ql-picker-options .ql-picker-item {
		cursor: pointer;
		display: block;
		padding-bottom: 5px;
		padding-top: 5px;
	}

	.ql-snow.ql-toolbar button:hover,
	.ql-snow .ql-toolbar button:hover,
	.ql-snow.ql-toolbar button:focus,
	.ql-snow .ql-toolbar button:focus,
	.ql-snow.ql-toolbar button.ql-active,
	.ql-snow .ql-toolbar button.ql-active,
	.ql-snow.ql-toolbar .ql-picker-label:hover,
	.ql-snow .ql-toolbar .ql-picker-label:hover,
	.ql-snow.ql-toolbar .ql-picker-label.ql-active,
	.ql-snow .ql-toolbar .ql-picker-label.ql-active,
	.ql-snow.ql-toolbar .ql-picker-item:hover,
	.ql-snow .ql-toolbar .ql-picker-item:hover,
	.ql-snow.ql-toolbar .ql-picker-item.ql-selected,
	.ql-snow .ql-toolbar .ql-picker-item.ql-selected {
		color: var(--c-primary);
	}

	.ql-snow.ql-toolbar button.ql-active {
		background-color: transparent;
	}


	.ql-snow .ql-picker-label::before {
		display: inline-block;
		line-height: 22px;
	}

	.ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
		position: absolute;
		margin-top: -9px;
		right: 0;
		top: 50%;
		width: 18px;
	}

	.ql-toolbar.ql-snow .ql-picker-label {
		border: 1px solid transparent;
	}

	.ql-snow .ql-picker-label {
		cursor: pointer;
		display: inline-block;
		height: 100%;
		padding-right: 2px;
		position: relative;
		width: 100%;
	}

	.ql-snow .ql-picker.ql-size {
		width: 98px;
	}

	.ql-snow .ql-picker {
		color: var(--c-gray-70);
		display: inline-block;
		float: left;
		font-size: 14px;
		height: 24px;
		width: 24px;
		position: relative;
		vertical-align: middle;
	}

	// .ql-snow.ql-toolbar button,
	// .ql-snow .ql-toolbar button {
	// 	width: 20px;
	// 	height: 20px;
	// }

	.ql-snow .ql-stroke {
		stroke: var(--c-gray-70);
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label[data-value=small]::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item[data-value=small]::before {
		content: 'Small';
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item::before {
		content: 'Normal';
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label[data-value=large]::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item[data-value=large]::before {
		content: 'Large';
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label[data-value=huge]::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item[data-value=huge]::before {
		content: 'Huge';
	}

	.ql-editor {
		min-height: 136px;
	}

	.ql-editor video {
		width: 100%;
	}

	.ql-editor .ql-size-small {
		font-size: 14px;
	}

	.ql-editor .ql-size-large {
		font-size: 22px;
	}

	.ql-editor .ql-size-huge {
		font-size: 26px;
	}

	.ql-editor ul {
		padding-bottom: 16px;
	}

	.ql-editor ul li {
		position: relative;
		padding-left: 12px;
		color: var(--c-gray-80);

		&:before {
			content: '';
			display: inline-block;
			width: 6px;
			height: 6px;
			background: var(--c-gray-80);
			border-radius: 50%;
			margin-right: 6px;
		}
	}

	.ql-editor ol {
		counter-reset: Index;
		padding-bottom: 16px;

		li {
			&:before {
				content: counter(Index) ". ";
				counter-increment: Index;
			}
		}
	}

	.ql-snow .ql-syntax,
	.ql-snow .ql-editor p {
		padding-bottom: 16px;
	}

	.ql-picker-label svg {
		display: block;
	}



	.ql-snow .ql-syntax,
	.ql-snow .ql-editor p {
		padding-bottom: 0;
	}

	.ql-snow .ql-editor img {
		display: inline-block;
	}

	.ql-editor p.ql-align-justify {
		&:after {
			content: "";
			width: 100%;
			display: inline-block;
			line-height: 0;
		}
	}


}

/* important*/
.ql-size-small {
	font-size: 14px;
}

.ql-size-large {
	font-size: 22px;
}

.ql-size-huge {
	font-size: 26px;
}

.ql-align-right {
	text-align: right;
	margin-left: auto;

}

.ql-align-center {
	margin: auto;
	text-align: center;
}

.ql-align-left {
	text-align: left;
	margin-right: auto;
}

.ql-toolbar.ql-snow+.ql-container.ql-snow {
	border-top: 2px solid var(--c-gray-15);
}

.editor-channel__editor-error .ql-toolbar.ql-snow+.ql-container.ql-snow {
	border-top: 2px solid var(--c-alert);
}
.ql-editor .ql-video {
	width: 100%;
	height: 100%;
	aspect-ratio: 16/9;
}
.video-dialog {
	.q-panel {
		&.scroll {
			overflow: hidden;
		}
	}
	.video-file {
		font-weight: 600;
		font-size: 14px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.file-info-wrap {
			display: flex;
			align-items: center;
			gap: 8px;
			.q-icon {
				font-size: 20px;
			}
			.file-info {
				display: flex;
				flex-direction: column;
				.file-size {
					font-size: 11px;
					font-weight: 400;
				}
				.text-negative {
					font-weight: 400;
				}
			}
		}
	}
}
</style>
