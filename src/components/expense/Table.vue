<template>
  <q-table
    :title="$t('expense', 2)"
    :rows="expenses"
    :columns="columns"
    :loading="loadingDatabase"
    @edit="edit"
    @delete="row => firebaseDeleteItem('expenses', 'expense', row)"
  >
    <template #body-cell-description="{ row }">
      <q-td>
        <div>{{ row.description }}</div>
        <div
          v-for="expenseProduct in row.expenseProducts"
          :key="expenseProduct.name"
        >
          {{ expenseProduct.name }} "{{ expenseProduct.weightType }}": {{ expenseProduct.quantity }} - {{ expenseProduct.value }}
        </div>
      </q-td>
    </template>
    <template #body-cell-action="{ row }">
      <q-td>
        <div
          class="row no-wrap q-gutter-md"
        >
          <q-btn
            :label="$t('edit')"
            dense
            color="primary"
            @click="edit(row)"
          />
          <q-btn
            :label="$t('delete')"
            dense
            color="negative"
            :loading="row.loading"
            @click="firebaseDeleteItem('expenses', 'expense', row.id)"
          />
        </div>
      </q-td>
    </template>
  </q-table>
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
      loading: false
    }
  },

  computed: {
    columns () {
      return [
        { name: 'date', label: this.$t('date'), field: 'date', sortable: true, format: val => typeof val === 'object' ? formatDate(val.toDate(), 'DD/MM/YYYY HH:mm') : val },
        { name: 'description', label: this.$t('description') },
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
        },
        { name: 'action', label: this.$t('action'), align: 'left' }
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
