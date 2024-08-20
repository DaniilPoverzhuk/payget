<template>
  <div class="requisites">
    <template
      v-if="isSeller"
    >
      <p class="text-gray-700 dark:text-gray-300 text-sm text-center pt-2">
        {{ $t('requisites.detailsSentLink') }}
      </p>
      <button
        class="text-primary text-sm block m-auto pt-2"
        @click="requisitesDialogBtn = true"
      >
        {{ $t('button.view') }}
      </button>
    </template>
    <Button
      v-else
      class="mx-auto mt-4 font-medium"
      view-color="primary"
      @click="requisitesDialogBtn = true"
    >
      {{ $t('button.pay') }}
    </Button>
    <template v-if="leaveReview">
      <div class="text-gray-700 dark:text-gray-300 text-sm text-center pt-2">
        {{ $t('requisites.leaveReview') }}
      </div>
      <div class="text-primary text-sm block m-auto pt-2">
        <Button @click="requisitesDialogBtn = true">
          {{ $t('disputes.leaveReview') }}
        </Button>
      </div>
    </template>
    <Dialog
      v-model="requisitesDialogBtn"
      class-custom="max-w-lg"
      :error="false"
      :is-icon="false"
      :heading="$t(isSeller ? 'chat.yourDetails' : 'chat.transferPayment')"
      @hide="requisitesDialogBtn = false"
    >
      <Requisitesdialog
        :message="message"
        :show-btn="isSeller"
        :text="isSeller ? $t('chat.linkDirect') : ''"
        @hide="requisitesDialogBtn = false"
      />
    </Dialog>
  </div>
</template>

<script>
import Requisitesdialog from '../requisites-dialog/requisites-dialog.vue'
import Dialog from 'src/components/dialog/dialog-q.vue'

export default {
  components: {
    Requisitesdialog,
    Dialog,
  },
  props: {
    isSeller: {
      type: Boolean,
      default: true,
    },
    isReviewed: {
      type: Boolean,
      default: true,
    },
    message: {
      type: String,
      required: true,
    },
    isBuyer: {
      type: Boolean,
      required: false,
    },
    leaveReview: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    requisitesDialogBtn: false,
  }),
  computed: {

  },
}
</script>
