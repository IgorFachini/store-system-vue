<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <customers-form
      @done="$router.push('/customers')"
    />
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PageCustomersForm'
})
</script>
