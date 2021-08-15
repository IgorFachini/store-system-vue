<template>
  <q-item
    v-ripple
    clickable
  >
    <q-item-section>
      <label> {{ product.name }} </label>
      <label> {{ $t('quantity') }}: {{ product.quantity }} </label>
      <label> {{ $t('unitaryValue') }}: {{ product.unitaryValue }} </label>
      <label> Total: {{ (Number(product.quantity) * parseFloat(product.unitaryValue)).toFixed(2) }} </label>
    </q-item-section>
    <q-item-section side>
      <q-btn
        v-if="!hideRemove"
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
    hideRemove: Boolean,
    product: {
      type: Object,
      required: true,
      defaut: () => ({})
    }
  },

  emits: ['remove']
})
</script>
