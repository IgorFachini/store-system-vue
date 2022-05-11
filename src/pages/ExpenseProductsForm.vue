<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <expense-products-form
      @done="$router.push('/expense-products')"
    />
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PageExpenseProductsForm'
})
</script>
