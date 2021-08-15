<template>
  <q-item
    v-ripple
    clickable
  >
    <q-item-section>
      <label>
        {{ expenseProduct.name }}
        <q-skeleton
          v-if="loading"
          type="text"
          width="150px"
        />
      </label>
      <label>
        {{ $t('weightType') }}: {{ expenseProduct.weightType }}
        <q-skeleton
          v-if="loading"
          type="text"
          width="150px"
        />
      </label>
      <label> {{ $t('quantity') }}: {{ product.quantity }} </label>
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
  name: 'ProductRecipeInfo',
  props: {
    hideRemove: Boolean,
    product: {
      type: Object,
      required: true,
      defaut: () => ({})
    }
  },

  emits: ['remove'],

  data () {
    return {
      expenseProduct: {},
      loading: true
    }
  },

  mounted () {
    this.firebaseMixin('expenseProducts').id(this.product.id).doc().get().then((doc) => {
      if (doc.exists) {
        this.expenseProduct = doc.data()
      }
    }).finally(() => {
      this.loading = false
    })
  }
})
</script>
