<template>
  <v-table-crud
    :title="$t('expenseProduct', 2)"
    :rows="expenseProducts"
    :columns="columns"
    :loading="loading"
    @edit="edit"
    @delete="deleteAction"
    @view="view"
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

import { date, Dialog, Notify } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date

import { useFirebaseStore } from 'stores/firebase'
import { mapState, mapActions } from 'pinia'

export default defineComponent({
  name: 'ExpenseProductsTable',

  data () {
    return {
      firebaseMixinInstance: null,
      loading: false
    }
  },

  computed: {
    ...mapState(useFirebaseStore, ['expenseProducts']),
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
    ...mapActions(useFirebaseStore, ['countExpenseProductsStockHistoryById']),
    stockHistory (row) {
      this.$router.push({
        name: 'expenseProducts.stockHistory',
        params: { id: row.id }
      })
    },
    view (row) {
      this.$router.push({
        name: 'expenseProducts.view',
        params: { id: row.id }
      })
    },
    edit (row) {
      this.$router.push({
        name: 'expenseProducts.edit',
        params: { id: row.id }
      })
    },
    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('expenseProduct')}?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        row.loading = true
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
