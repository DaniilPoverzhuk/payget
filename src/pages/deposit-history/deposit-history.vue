<template lang="pug">
section.content
  header.content__header
    Back(
      :label="$t('deposit.title')"
      @click='$router.push("/deposit")'
    )
    h1 {{ $t('deposit.history') }}
  div.content__inner
    div.content__main
      DepositHistory
</template>

<script>
import Back from '@/components/back/back'
import DepositHistory from '@/components/helper/page-deposit/deposit-history/deposit-history'

export default {
  name: 'DepositHistoryPage',
  components: {
    Back,
    DepositHistory,
  },
}
</script>
