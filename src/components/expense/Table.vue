<template lang="pug">
v-table-crud(
  :title="$t('expense', 2)"
  :rows="expenses"
  :columns="columns"
  :loading="loadingDatabase"
  @view="view"
  @edit="edit"
  @delete="row => firebaseDeleteItem('expenses', 'expense', row.id)"
  @choose="row => $emit('choose', row)"
)
  //- template(#body-cell-description="{ row }")
  //-   q-td
  //-     div {{ row.description }}
  //-     div(
  //-       v-for="expenseProduct in row.expenseProducts"
  //-       :key="expenseProduct.name"
  //-     )
  //-       | {{ expenseProduct.name }} "{{ expenseProduct.weightType }}": {{ expenseProduct.quantity }} - {{ expenseProduct.value }}

</template>

<script>

import { date } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'ExpensesTable',

  setup () {
    const storeFirebase = useFirebaseStore()
    const { expenses, loadingDatabase } = storeToRefs(storeFirebase)

    return {
      expenses,
      loadingDatabase
    }
  },

  data () {
    return {
      loading: false,
      search: ''
    }
  },

  computed: {
    columns () {
      return [
        { name: 'action', label: this.$t('action'), align: 'left' },
        { name: 'date', label: this.$t('date'), field: 'date', sortable: true, format: val => typeof val === 'object' ? formatDate(val.toDate(), 'DD/MM/YYYY HH:mm') : val },
        {
          name: 'description',
          label: this.$t('description'),
          field: (row) => row.description
        },
        // {
        //   name: 'product',
        //   label: this.$t('product'),
        //   field: (row) => row.expenseProducts
        // },
        { name: 'total', label: 'Total', field: 'total', sortable: true },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val.toDate(), 'DD/MM/YYYY HH:mm'),
          sortable: true
        },
        {
          name: 'updatedAt',
          label: this.$t('updatedAt'),
          field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY HH:mm') : '',
          sortable: true
        }
      ]
    }
  },

  methods: {
    edit (row) {
      this.$router.push({
        name: 'expenses.edit',
        params: { id: row.id }
      })
    }
  }
})
</script>
