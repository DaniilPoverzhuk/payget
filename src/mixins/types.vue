<script>
import { DEAL_TYPE } from 'src/constants.js'

const {
  TYPE_DEAL_BUY,
  TYPE_DEAL_SALE,
} = DEAL_TYPE

export default {
  data() {
    return {
      typeList: [
        {
          list: [
            {
              value: null,
              text: 'status.all',
            },
            {
              value: TYPE_DEAL_BUY,
              text: 'purchase',
            },
            {
              value: TYPE_DEAL_SALE,
              text: 'sale',
            },
          ],
        },
      ],
    }
  },
  computed: {
    typeListFor() {
      const items = []
      Object.keys(this.typeList[0].list).forEach((key) => {
        if (this.typeList[0].list[key].value !== null) {
          items.push(this.typeList[0].list[key])
        }
      })

      return items
    },
  },
}
</script>
