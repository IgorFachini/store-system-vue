<script setup>
import { date } from 'quasar'
import { useFirebaseStore } from 'stores/firebase'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
import { methods } from 'boot/firebase'
import { storeToRefs } from 'pinia'

const { firebaseDeleteItem, firebaseMixin } = methods
const router = useRouter()

const { formatDate } = date
const { t } = useI18n({ useScope: 'global' });
const storeFirebase = useFirebaseStore()

const { expenses, productsStockHistory, loadingDatabase } = storeToRefs(storeFirebase)

const columns = computed(() => [
  { name: 'action', label: t('action'), align: 'left' },
  { name: 'date', label: t('date'), field: 'date', sortable: true, format: val => typeof val === 'object' ? formatDate(val.toDate(), 'DD/MM/YYYY HH:mm') : val },
  {
    name: 'description',
    label: t('description'),
    field: (row) => row.description
  },
  { name: 'total', label: 'Total', field: 'total', sortable: true },
  {
    name: 'createdAt',
    label: t('createdAt'),
    field: 'createdAt',
    format: val => formatDate(val.toDate(), 'DD/MM/YYYY HH:mm'),
    sortable: true
  },
  {
    name: 'updatedAt',
    label: t('updatedAt'),
    field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY HH:mm') : '',
    sortable: true
  }
])

function edit (row) {
  router.push({
    name: 'expenses.edit',
    params: { id: row.id }
  })
}

function deleteItem (row) {
  firebaseDeleteItem('expenses', 'expense', row.id).then(() => {
    storeFirebase.productsStockHistory.filter(item => item.refId === row.id).forEach(item => {
      firebaseMixin('productsStockHistory').id(item.id).delete()
    })
  })
}
</script>

<template lang="pug">
v-table-crud(
  :title="$t('expense', 2)"
  :rows="expenses"
  :columns="columns"
  :loading="loadingDatabase"
  @edit="edit"
  @delete="row => deleteItem(row)"
  @choose="row => $emit('choose', row)"
)

</template>
