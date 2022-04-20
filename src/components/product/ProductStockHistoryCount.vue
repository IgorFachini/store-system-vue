<template>
  <q-skeleton
    v-if="loading"
    type="text"
    width="150px"
  />
  <div v-else>
    {{ quantity }}
  </div>
</template>

<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProductStockHistoryCount',

  props: {
    product: {
      type: Object,
      required: true,
      defaut: () => ({})
    }
  },

  data () {
    return {
      stockHistory: [],
      loading: false
    }
  },

  computed: {
    quantity () {
      return this.stockHistory.reduce((acc, item) => {
        return acc + item.quantity
      }, 0)
    }
  },

  mounted () {
    this.load()
  },

  methods: {
    load () {
      this.loading = true
      const id = this.product.id
      this.productRef = this.firebaseMixin('products').id(id).doc()
      this.productRef.get().then(product => {
        if (product.exists) {
          this.firebaseMixinInstance = this.firebaseMixin('stockHistory')
          this.$bind('stockHistory', this.firebaseMixin('stockHistory').ref().where('product', '==', this.productRef).orderBy('createdAt')).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
})
</script>
