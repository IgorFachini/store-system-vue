<template>
  <q-page
    class="row"
    padding
  >
    <fast-action />
    <cash-flow-table :customer-id="$route.params.id" />
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageCashFlow'
})
</script>
