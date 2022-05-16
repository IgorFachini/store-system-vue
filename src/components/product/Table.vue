<template>
  <v-table-crud
    :title="$t('product', 2)"
    :rows="products"
    :columns="columns"
    :loading="loading"
    @edit="edit"
    @delete="row => firebaseDeleteItem('products', row, deleteStockHistory(row))"
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

import { date } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import ProductRecipeInfo from 'components/product/ProductRecipeInfo.vue'

import { useFirebaseStore } from 'stores/firebase'
// import { mapState, mapActions } from 'pinia'

export default defineComponent({
  name: 'ProductsTable',

  components: {
    ProductRecipeInfo
  },

  setup () {
    const storeFirebase = useFirebaseStore()

    return {
      storeFirebase
    }
  },

  data () {
    return {
      loading: false
    }
  },

  computed: {
    // ...mapState(useFirebaseStore, ['products']),
    products () {
      return this.storeFirebase.products
    },

    columns () {
      return [
        { name: 'expand', label: this.$t('recipe'), align: 'left' },
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true },
        { name: 'purchasePrice', label: this.$t('purchasePrice'), field: 'purchasePrice', sortable: true },
        {
          name: 'currentInventory',
          label: this.$t('currentInventory'),
          field: row => this.storeFirebase.countProductsStockHistoryById(row.id),
          sortable: true
        }, { name: 'description', label: this.$t('description'), field: 'description' },
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

  methods: {
    // ...mapActions(useFirebaseStore, ['countProductsStockHistoryById']),
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

    deleteStockHistory (row) {
      this.firebaseMixin('productsStockHistory').ref().where('productId', '==', row.id).get().then(snapshot => {
        snapshot.docs.forEach(doc => {
          doc.ref.delete()
        })
      })
    }
  }
})
</script>
