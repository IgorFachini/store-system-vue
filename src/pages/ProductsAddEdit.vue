<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <products-add-edit-form
      @done="$router.push('/products')"
    />
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ProductsAddEdit'
})
</script>
