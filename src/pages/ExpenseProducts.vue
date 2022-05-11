<template>
  <q-page
    class="row q-gutter-y-md"
    padding
  >
    <expense-products-table />
    <div class="row full-width justify-center">
      <q-btn
        class="q-ma-md"
        color="accent"
        :label="$t('add')"
        @click="$router.push('/expense-products/add')"
      />
    </div>
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageExpenseProducts'
})
</script>
