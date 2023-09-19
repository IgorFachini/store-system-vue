<script setup>

import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { useRouter } from 'vue-router'

const props = defineProps({
  chooseMode: Boolean
})
const router = useRouter()

defineEmits(['choose'])

const { formatDate } = date
const { t } = useI18n({ useScope: 'global' })
const storeFirebase = useFirebaseStore()

const { customers, loadingDatabase } = storeToRefs(storeFirebase)

function view (row) {
  router.push({
    name: 'customers.view',
    params: { id: row.id }
  })
}
function edit (row) {
  router.push({
    name: 'customers.edit',
    params: { id: row.id }
  })
}

const columns = [
  ...props.chooseMode ? [{ name: 'actionChoose', label: t('choose'), align: 'left' }] : [{ name: 'action', label: t('action'), align: 'left' }],
  { name: 'name', label: t('name'), field: 'name' },
  { name: 'cellphone', label: t('cellphone'), field: 'cellphone' },
  { name: 'phone', label: t('phone'), field: 'phone' },
  { name: 'observation', label: t('observation'), field: 'observation' },
  { name: 'document', label: t('document'), field: 'document' },
  { name: 'cnpj', label: 'CNPJ', field: 'cnpj' },
  { name: 'stateRegistration', label: t('stateRegistration'), field: 'stateRegistration' },
  { name: 'cep', label: 'CEP', field: 'cep' },
  { name: 'publicPlace', label: t('publicPlace'), field: 'publicPlace' },
  { name: 'number', label: t('number'), field: 'number' },
  { name: 'district', label: t('district'), field: 'district' },
  { name: 'city', label: t('city'), field: 'city' },
  { name: 'complement', label: t('complement'), field: 'complement' },
  {
    name: 'createdAt',
    label: t('createdAt'),
    field: 'createdAt',
    format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
    sortable: true
  },
  {
    name: 'updatedAt',
    label: t('updatedAt'),
    field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY') : '',
    sortable: true
  }
]
</script>

<template lang="pug">
v-table-crud(
  :title="$t('customer', 2)"
  :rows="customers"
  :columns="columns"
  :loading="loadingDatabase"
  @view="view"
  @edit="edit"
  @delete="row => firebaseDeleteItem('customers', 'customer', row.id)"
  @choose="row => $emit('choose', row)"
)
  template(#action-more="props")
    q-btn(
      :label="$t('cashFlow')"
      dense
      color="blue"
      :to="`/customers/cash-flow/${props.row.id}`"
    )
</template>
