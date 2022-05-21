<template>
  <v-table-crud
    :title="$t('expenseProduct', 2)"
    :rows="expenseProducts"
    :columns="columns"
    :loading="loadingDatabase"
    @edit="edit"
    @delete="row => firebaseDeleteItem('expenseProducts', 'expenseProduct', row.id)"
  >
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

import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'ExpenseProductsTable',

  setup () {
    const storeFirebase = useFirebaseStore()
    const { expenseProducts, countExpenseProductsStockHistoryById, loadingDatabase } = storeToRefs(storeFirebase)

    return {
      expenseProducts,
      countExpenseProductsStockHistoryById,
      loadingDatabase
    }
  },

  data () {
    return {
      loading: false
    }
  },

  computed: {
    columns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'description', label: this.$t('description'), field: 'description' },
        { name: 'weightType', label: this.$t('weightType'), field: 'weightType', sortable: true },
        {
          name: 'currentInventory',
          label: this.$t('currentInventory'),
          field: row => this.countExpenseProductsStockHistoryById(row.id),
          sortable: true
        },
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
    stockHistory (row) {
      this.$router.push({
        name: 'expenseProducts.stockHistory',
        params: { id: row.id }
      })
    },
    edit (row) {
      this.$router.push({
        name: 'expense-products.edit',
        params: { id: row.id }
      })
    }
  }
})
</script>
