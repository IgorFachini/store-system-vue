<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <div class="row">
      <customers-table />
    </div>
    <div class="row full-width justify-center">
      <q-btn
        class="q-ma-md"
        color="accent"
        :label="$t('add')"
        @click="$router.push('/customers/add')"
      />
    </div>
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageCustomers'
})
</script>
