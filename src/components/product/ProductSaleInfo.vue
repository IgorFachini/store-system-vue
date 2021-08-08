<template>
  <q-item
    v-ripple
    clickable
  >
    <q-item-section>
      <label> {{ product.name }} </label>
      <label> {{ $t('unitaryValue') }}: {{ product.quantity }} - {{ $t('unitaryValue') }}: {{ product.unitaryValue }} </label>
      <label> Total: {{ Number(product.quantity) * parseFloat(product.unitaryValue.replace(',', '.')) }} </label>
    </q-item-section>
    <q-item-section side>
      <q-btn
        :label="$t('delete')"
        dense
        color="negative"
        @click="$emit('remove', product)"
      />
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProductSaleInfo',
  props: {
    product: {
      type: Object,
      required: true,
      defaut: () => ({})
    }
  },

  emits: ['remove']
})
</script>
