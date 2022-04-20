<template>
  <q-page
    class="row"
    padding
  >
    <v-table-crud
      :title="$t('product', 2)"
      :rows="products"
      :columns="columns"
      :loading="loading"
      class="full-width"
      style="z-index: 1"
      @edit="edit"
      @delete="deleteAction"
      @view="view"
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
    </v-table-crud>
    <div class="row full-width justify-center">
      <q-btn
        class="q-ma-md"
        color="accent"
        :label="$t('add')"
        @click="$router.push('/products/add')"
      />
    </div>
  </q-page>
</template>

<script>

import { date, Dialog, Notify } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import ProductRecipeInfo from 'components/product/ProductRecipeInfo.vue'

export default defineComponent({
  name: 'PageProducts',

  components: {
    ProductRecipeInfo
  },

  data () {
    return {
      form: {},
      loading: false,
      saving: false,
      firebaseMixinInstance: null,
      products: []
    }
  },

  computed: {
    columns () {
      return [
        { name: 'actionView', label: this.$t('view'), align: 'left' },
        { name: 'expand', label: this.$t('recipe'), align: 'left' },
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true },
        { name: 'purchasePrice', label: this.$t('purchasePrice'), field: 'purchasePrice', sortable: true },
        { name: 'productStockHistoryCount', label: this.$t('currentInventory'), sortable: true },
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

  created () {
    this.form = { ...this.modelForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('products')
    Promise.all([
      this.firebaseMixinInstance.bindField('products')
    ])
      .finally(() => {
        this.loading = false
      })
  },

  methods: {
    view (row) {
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
