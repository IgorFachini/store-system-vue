<template>
  <v-table-crud
    :title="$t('customer', 2)"
    :rows="customers"
    :columns="columns"
    :loading="loading"
    @view="view"
    @edit="edit"
    @delete="deleteAction"
    @choose="val => $emit('choose', val)"
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

import { date, Dialog, Notify } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date

export default defineComponent({
  name: 'CustomersTable',

  props: {
    chooseMode: Boolean
  },

  emits: ['choose'],

  data () {
    return {
      firebaseMixinInstance: null,
      loading: false,
      customers: []
    }
  },

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

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('customers')

    this.firebaseMixinInstance.bindField('customers').finally(() => {
      this.loading = false
    })
  },

  methods: {
    view (row) {
      this.$router.push({
        name: 'customers.view',
        params: { idCustomerView: row.id }
      })
    },
    edit (row) {
      this.$router.push({
        name: 'customers.edit',
        params: { idCustomerEdit: row.id }
      })
    },
    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('customer')}`,
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
