<template>
  <section class="referral w-full lg:px-6 xs:px-4 mt-10">
    <h1 class="font-semibold text-gray-700 dark:text-gray-300 mb-6 xs:text-center">
      {{ $t('referral.title') }}
    </h1>
    <div class="flex xs:items-start lg:space-x-8 xs:flex-col">
      <div class="max-800 w-full xs:order-1 xs:mt-8">
        <h2 class="text-gray-700 dark:text-gray-300 text-xl mb-4">
          {{ $t('referral.mechanism') }}
        </h2>
        <p class="text-gray-500 dark:text-gray-300 mb-4">
          {{ $t('referral.text1') }}
        </p>
        <p class="text-gray-500 dark:text-gray-300 mb-4">
          {{ $t('referral.text2') }}
        </p>
        <p class="text-gray-500 dark:text-gray-300 mb-4">
          {{ $t('referral.text3') }}
        </p>
      </div>

      <div class="max-w-384 w-full flex-shrink-0">
        <h3 class="text-gray-700 dark:text-gray-300 text-xl mb-4">
          {{ $t('referral.referralLin') }}
        </h3>
        <VInput
          v-model="referralUrl"
          class="mb-4"
          :readonly="true"
          :placeholder="$t('referral.referralLin')"
          type="text"
        />
        <div class="lg:mb-4 xs:mb-6 lg:flex lg:items-start lg:justify-between">
          <Button
            class="font-medium xs:w-full"
            view-color="primary"
            @click="() => copyToClipboard(referralUrl)"
          >
          {{$t('button.copy')}}
          </Button>
          <SocialSharing
            class="flex space-x-1 xs:mt-6"
            url="http://twix.im/"
            :title="`${referralUrl}`"
            :description="$t('referral.socialSharingText')"
          ></SocialSharing>
        </div>
        <p class="text-gray-500 dark:text-gray-300 mb-4">
          {{ $t('referral.text4') }}
        </p>
        <h3 class="text-gray-700 dark:text-gray-300 text-xl mb-4">
          {{ $t('referral.numberReferrals') }}
        </h3>
        <p>{{ refs }}</p>
      </div>
    </div>
  </section>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import VInput from 'src/components/extends/v-input/v-input.vue'
import copyToClipboard from 'src/mixins/copy-to-clipboard.vue'
import Button from 'src/components/extends/button/button.vue'
import SocialSharing from 'src/components/helper/page-referral/social-sharing/social-sharing.vue'
const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'Referral',
  components: {
    VInput,
    Button,
    SocialSharing,
  },
  mixins: [copyToClipboard],
  computed: {
    ...mapUserState(['id', 'refs']),
    referralUrl() {
      return `${process.env.VUE_APP_STATISTICS_DOMAIN}?ref=${this.id}`
    },
  },
}
</script>
