<template>
  <v-table-crud
    :title="$t('product', 2)"
    :rows="products"
    :columns="columns"
    :loading="loading"
    @edit="edit"
    @delete="deleteAction"
  >
    <template #expand="props">
      <q-list
        bordered
        separator
      >
        <product-recipe-info
          v-for="recipe in props.row.recipes"
          :key="recipe.id"
          :product="recipe"
          hide-remove
        />
      </q-list>
    </template>
    <template #action-more="props">
      <q-btn
        :label="$t('stockHistory')"
        dense
        color="blue"
        @click="stockHistory(props.row)"
      />
    </template>
  </v-table-crud>
</template>

<script>

import { date, Dialog, Notify } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import ProductRecipeInfo from 'components/product/ProductRecipeInfo.vue'

export default defineComponent({
  name: 'ProductsTable',

  components: {
    ProductRecipeInfo
  },

  data () {
    return {
      firebaseMixinInstance: null,
      loading: false,
      products: []
    }
  },

  computed: {
    columns () {
      return [
        { name: 'expand', label: this.$t('recipe'), align: 'left' },
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true },
        { name: 'purchasePrice', label: this.$t('purchasePrice'), field: 'purchasePrice', sortable: true },
        { name: 'currentInventory', label: this.$t('currentInventory'), field: 'currentInventory', sortable: true },
        { name: 'description', label: this.$t('description'), field: 'description' },
        {
          name: 'category',
          label: this.$t('category'),
          field: 'category',
          format: category => category ? category.name : '',
          sortable: true
        },
        { name: 'code', label: this.$t('code'), field: 'code' },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'updatedAt',
          label: this.$t('updatedAt'),
          field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY') : '',
          sortable: true
        },
        { name: 'action', label: this.$t('action'), align: 'left' }
      ]
    }
  },

  watch: {
    products (val) {
      val.forEach((product, index) => {
        this.stockHistoryCount(product).then(count => {
          this.products[index].currentInventory = count
        })
      })
    }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('products')
    this.firebaseMixinInstance.bindField('products').then(products => {
      products.forEach((product, index) => {
        this.stockHistoryCount(product).then(count => {
          this.products[index].currentInventory = count
        })
      })
    }).finally(() => {
      this.loading = false
    })
  },

  methods: {
    stockHistoryCount (row) {
      return this.firebaseMixin('stockHistory').ref().where('productId', '==', row.id).get().then(snapshot => snapshot.docs.map(doc => doc.data()).reduce((acc, item) => {
        return acc + item.quantity
      }, 0))
    },
    stockHistory (row) {
      this.$router.push({
        name: 'products.stockHistory',
        params: { id: row.id }
      })
    },
    edit (row) {
      this.$router.push({
        name: 'products.edit',
        params: { id: row.id }
      })
    },

    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('product')}`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        row.loading = true
        this.firebaseMixin('stockHistory').ref().where('product', '==', this.firebaseMixinInstance.id(row.id).doc()).get().then(snapshot => {
          snapshot.docs.forEach(doc => {
            doc.ref.delete()
          })
        })
        this.firebaseMixinInstance.id(row.id).delete().finally(() => {
          row.loading = false
          Notify.create({
            message: this.$t('savedOperation'),
            color: 'positive',
            closeBtn: true
          })
        })
      })
    }
  }
})
</script>
