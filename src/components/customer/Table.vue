<template>
  <v-table-crud
    :title="$t('customer', 2)"
    :rows="customers"
    :columns="columns"
    :loading="loadingDatabase"
    @view="view"
    @edit="edit"
    @delete="row => firebaseDeleteItem('customers', 'customer', row.id)"
    @choose="row => $emit('choose', row)"
  >
    <template #action-more="props">
      <q-btn
        :label="$t('cashFlow')"
        dense
        color="blue"
        :to="`/customers/cash-flow/${props.row.id}`"
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
  name: 'CustomersTable',

  props: {
    chooseMode: Boolean
  },

  emits: ['choose'],

  setup () {
    const storeFirebase = useFirebaseStore()
    const { customers, loadingDatabase } = storeToRefs(storeFirebase)

    return {
      customers,
      loadingDatabase
    }
  },

  // data () {
  //   return {
  //     firebaseMixinInstance: null,
  //     loading: false
  //   }
  // },

  computed: {
    columns () {
      return [
        ...this.chooseMode ? [{ name: 'actionChoose', label: this.$t('choose'), align: 'left' }] : [{ name: 'actionView', label: this.$t('view'), align: 'left' }],
        { name: 'name', label: this.$t('name'), field: 'name' },
        { name: 'cellphone', label: this.$t('cellphone'), field: 'cellphone' },
        { name: 'phone', label: this.$t('phone'), field: 'phone' },
        { name: 'observation', label: this.$t('observation'), field: 'observation' },
        { name: 'document', label: this.$t('document'), field: 'document' },
        { name: 'cep', label: 'CEP', field: 'cep' },
        { name: 'publicPlace', label: this.$t('publicPlace'), field: 'publicPlace' },
        { name: 'number', label: this.$t('number'), field: 'number' },
        { name: 'district', label: this.$t('district'), field: 'district' },
        { name: 'city', label: this.$t('city'), field: 'city' },
        { name: 'complement', label: this.$t('complement'), field: 'complement' },
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
        ...this.chooseMode ? [] : [{ name: 'action', label: this.$t('action'), align: 'left' }]
      ]
    }
  },

  // mounted () {
  //   this.loading = true
  //   this.firebaseMixinInstance = this.firebaseMixin('customers')

  //   this.firebaseMixinInstance.bindField('customers').finally(() => {
  //     this.loading = false
  //   })
  // },

  methods: {
    view (row) {
      this.$router.push({
        name: 'customers.view',
        params: { id: row.id }
      })
    },
    edit (row) {
      this.$router.push({
        name: 'customers.edit',
        params: { id: row.id }
      })
    }
  }
})
</script>
