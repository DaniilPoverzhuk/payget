<template>
  <div class="text-center" v-if="count > 0">
    <div>
      <div class="relative flex items-center justify-center bottom-0.5 xs:py-5">
        <span
          class="float-left pb-2 pt-8 no-underline cursor-pointer flex items-center flex-row-reverse absolute left-0 xs:!pl-6"
          v-if="arrowLeftVisible"
          @click="prevPage"
          >{{ $t('previous') }}
          <svg class="mr-2" v-svg symbol="arrow-left" size="16 16"></svg>
        </span>
        <template v-if="!$matchMedia.mobile">
          <span
            class="cursor-pointer no-underline font-medium text-base pb-2 pt-8 px-4"
            :class="{ 'text-primary shadow-box-shadow-top': activePage(page) }"
            v-for="page in pages"
            :key="page"
            @click="changePage(page)"
            >{{ page }}</span
          >
        </template>
        <span
          class="float-left pb-2 pt-8 no-underline cursor-pointer flex items-center absolute right-0 xs:!pr-6"
          v-if="arrowRightVisible"
          @click="nextPage"
        >
          {{ $t('next') }}
          <svg
            class="rotate-180 ml-2"
            v-svg
            symbol="arrow-left"
            size="16 16"
          ></svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    count: {
      type: Number,
      required: true,
    },
    perPage: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      pagesCount: 1,
      currentPage: 1,
      pages: [],
      nextPages: [],
      prevPages: [],
      visitedByMobile: false,
      arrowLeftVisible: false,
      arrowRightVisible: true,
    }
  },
  watch: {
    count() {
      this.drawPages()
    },
    currentPage(value) {
      this.arrowLeftVisible = value !== 1
      this.arrowRightVisible = value !== this.pagesCount
    },
    pagesCount() {
      this.hideRightArrow()
    },
  },
  created() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          this.prevPage()
        }

        if (event.key === 'ArrowRight') {
          this.nextPage()
        }
      })

      // eslint-disable-next-line func-names
      window.mobileCheck = function () {
        let check = false
        ;(function (a) {
          // eslint-disable-next-line no-useless-escape,max-len
          if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
              a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
              a.substr(0, 4)
            )
          ) {
            check = true
          }
        })(navigator.userAgent || navigator.vendor || window.opera)
        return check
      }
      this.mobileVersion(window.mobileCheck())
      this.drawPages()
    }
  },
  methods: {
    mobileVersion(mobile) {
      if (mobile) {
        this.visitedByMobile = true
      }
    },
    getPrevPages() {
      const pages = []
      let prevPagesUntil = this.currentPage - 5
      if (this.currentPage >= 1 && this.currentPage <= 6) {
        prevPagesUntil = 1
      }

      if (this.pagesCount - this.currentPage <= 4) {
        prevPagesUntil = this.currentPage - 8
      }

      for (let i = this.currentPage - 1; i >= prevPagesUntil; i -= 1) {
        if (i < 1) break

        pages.unshift(i)
      }

      if (pages[0] !== 1) {
        pages.unshift(1)
      }

      if (pages[1] - 1 > 1) {
        pages.splice(1, 0, '...')
      }
      this.prevPages = pages
    },
    getNextPages() {
      let pages = []
      let nextPageUntil = this.currentPage + 4
      if (this.currentPage >= 1 && this.currentPage <= 6) {
        nextPageUntil = 9
      }

      for (let i = this.currentPage + 1; i <= nextPageUntil; i += 1) {
        if (i >= this.pagesCount) break
        pages.push(i)
      }

      if (this.visitedByMobile) {
        pages = []
        this.prevPages = [1]

        if (this.pagesCount - this.currentPage > 1) {
          pages.push(this.currentPage + 1)
        }
      }

      if (this.prevPages[0] !== this.currentPage) {
        pages.unshift(this.currentPage)

        if (this.visitedByMobile && this.currentPage !== 2) {
          pages.splice(0, 0, this.currentPage - 1)
          if (pages[0] - 1 > 1) {
            pages.splice(0, 0, '...')
          }
        }
      }

      this.prevPages = [...this.prevPages, ...pages]

      if (this.currentPage !== this.pagesCount) {
        this.prevPages.push(this.pagesCount)
      }

      if (this.pagesCount - 1 > this.prevPages[this.prevPages.length - 2]) {
        this.prevPages.splice(this.prevPages.length - 1, 0, '...')
      }

      this.pages = this.prevPages
      this.nextPages = pages
    },
    drawPages() {
      this.pagesCount = Math.ceil(this.count / this.perPage)
      this.getPrevPages()
      this.getNextPages()
      this.hideRightArrow()
      window.scrollTo(0, 0)
    },
    hideRightArrow() {
      this.arrowRightVisible = this.pagesCount !== 1
    },
    activePage(page) {
      return this.currentPage === page
    },
    async changePage(page) {
      if (page === '...') return
      if (this.currentPage === page) {
        return
      }
      this.currentPage = page

      this.drawPages()
      await this.$emit('getData', this.currentPage)
    },
    async prevPage() {
      if (this.currentPage <= 1) return
      this.currentPage -= 1
      this.drawPages()
      await this.$emit('getData', this.currentPage)
    },
    async nextPage() {
      if (this.currentPage >= this.pages[this.pages.length - 1]) return
      this.currentPage += 1
      this.drawPages()
      await this.$emit('getData', this.currentPage)
    },
    setFirstPage() {
      this.currentPage = 1
    },
  },
}
</script>

<style lang="scss">
.pagination-link {
  cursor: pointer;
}

.pagination-wrapper {
  text-align: center;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  &-left {
    float: left;
    padding: 8px 0px;
    padding-top: 35px;
    text-decoration: none;
  }

  &-number {
    text-decoration: none;
    color: var(--c-gray-90);
    font-weight: 500;
    font-size: var(--fz-md);
    line-height: var(--lh-sm);
    padding: 8px 16px;
    padding-top: 35px;
  }

  &-active {
    color: var(--c-primary);
  }
}
</style>
