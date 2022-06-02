<template>
  <q-page
    class="q-col-gutter-md"
    padding
  >
    <v-input
      v-model="modelData"
      :label="$t('date')"
      date
      range
      clearable
    />

    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-field
          :label="$t('sold')"
          readonly
          stack-label
        >
          <div class="text-blue">
            {{ totalPurchase.toFixed(2) }}
          </div>
        </q-field>
        <q-field
          :label="$t('receveid')"
          readonly
          stack-label
        >
          <div class="text-green">
            {{ totalPayment.toFixed(2) }}
          </div>
        </q-field>
        <q-field
          :label="$t('fastSale')"
          readonly
          stack-label
        >
          <div class="text-green">
            {{ totalFastsale.toFixed(2) }}
          </div>
        </q-field>
        <q-field
          :label="$t('totalEntry')"
          readonly
          stack-label
        >
          <div class="text-green">
            {{ totalEntry.toFixed(2) }}
          </div>
        </q-field>
      </div>
      <div class="col-6">
        <q-field
          :label="$t('expense', 2)"
          readonly
          stack-label
        >
          <div class="text-red">
            {{ totalExpenses.toFixed(2) }}
          </div>
        </q-field>
        <q-field
          :label="$t('quickExit')"
          readonly
          stack-label
        >
          <div class="text-red">
            {{ totalQuickExit.toFixed(2) }}
          </div>
        </q-field>
      </div>
    </div>
    <div>
      <v-table-crud
        :title="$t('purchase', 2) + ' - ' + $t('customer', 2)"
        :rows="customersCashFlowGrouped"
        :columns="customersCashFlowGroupedColumns"
      >
        <template #expand="propsCashFlow">
          <v-table-crud
            :title="$t('cashFlow') + ': ' + propsCashFlow.row.name"
            :rows="propsCashFlow.row.cashFlow"
            :columns=" customersCashFlowGroupedCashFlowColumns"
          >
            <template #expand="propsProducs">
              <v-table-crud
                :title="$t('product', 2) + ': ' + propsCashFlow.row.name"
                :rows="propsProducs.row.products"
                :columns=" customersCashFlowGroupedProductColumns"
              />
            </template>
          </v-table-crud>
        </template>
      </v-table-crud>
    </div>
  </q-page>
</template>

<script>
import { date } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date

import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'PageIndex',

  setup () {
    const storeFirebase = useFirebaseStore()
    const { cashFlow, expenses } = storeToRefs(storeFirebase)

    return {
      cashFlow,
      expenses
    }
  },

  data () {
    return {
      modelData: {
        from: '',
        to: ''
      }
    }
  },

  computed: {
    cashFlowFilterDateRange () {
      if (!this.modelData.from || !this.modelData.to) {
        return this.cashFlow
      }
      const startDate = new Date(this.modelData.from)
      const endDate = new Date(this.modelData.to)
      return this.cashFlow.filter(c => {
        const date = typeof c.date === 'object' ? new Date(c.date.toDate()) : c.date
        return (date >= startDate && date <= endDate)
      })
    },
    expensesFilterDateRange () {
      if (!this.modelData.from || !this.modelData.to) {
        return this.expenses
      }
      const startDate = new Date(this.modelData.from)
      const endDate = new Date(this.modelData.to)
      return this.expenses.filter(c => {
        const date = typeof c.date === 'object' ? new Date(c.date.toDate()) : c.date
        return (date >= startDate && date <= endDate)
      })
    },
    totalPurchase () {
      return this.cashFlowFilterDateRange.filter(c => c.type === 'purchase').reduce((total, item) => {
        return total + item.total
      }, 0)
    },
    totalFastsale () {
      return this.cashFlowFilterDateRange.filter(c => c.type === 'fastSale').reduce((total, item) => {
        return total + item.total
      }, 0)
    },
    totalPayment () {
      return this.cashFlowFilterDateRange.filter(c => c.type === 'payment').reduce((total, item) => {
        return total + item.total
      }, 0)
    },
    totalQuickExit () {
      return this.cashFlowFilterDateRange.filter(c => c.type === 'quickExit').reduce((total, item) => {
        return total + item.total
      }, 0)
    },
    toReceive () {
      return this.totalPurchase - this.totalPayment
    },

    totalEntry () {
      return this.totalFastsale + this.totalPayment
    },

    totalCashFlow () {
      return this.cashFlowFilterDateRange.reduce((a, b) => a + (b.total || 0), 0)
    },

    totalExpenses () {
      return this.expensesFilterDateRange.reduce((a, b) => a + (b.total || 0), 0)
    },

    customersCashFlowGrouped () {
      return this.cashFlowFilterDateRange.filter(c => c.customer && c.type === 'purchase')
        .reduce((acc, item) => {
          const customerIndex = acc.findIndex(c => c.id === item.customer.id)
          if (customerIndex < 0) {
            acc.push({
              ...item.customer,
              cashFlow: [item],
              total: item.total
            })
          } else {
            const customer = acc[customerIndex]
            customer.total += item.total
            customer.cashFlow.push(item)
          }
          return acc
        }, [])
    },
    customersCashFlowGroupedColumns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name' },
        { name: 'total', label: 'Total', field: 'total', format: value => value.toFixed(2), sortable: true },
        { name: 'expand', label: this.$t('cashFlow') }
      ]
    },
    customersCashFlowGroupedCashFlowColumns () {
      return [
        { name: 'total', label: 'Total', field: 'total', format: value => value.toFixed(2), sortable: true },
        { name: 'description', label: this.$t('description'), field: 'description' },
        {
          name: 'date',
          label: this.$t('date'),
          field: 'date',
          format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
          sortable: true
        },
        { name: 'expand', label: this.$t('product', 2), disable: (row) => !row.products || !row.products.length }
      ]
    },
    customersCashFlowGroupedProductColumns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name' },
        { name: 'quantity', label: this.$t('quantity'), field: 'quantity', sortable: true },
        { name: 'unitaryValue', label: this.$t('unitaryValue'), field: 'unitaryValue', sortable: true },
        { name: 'total', label: 'Total', field: (row) => row.quantity * row.unitaryValue, sortable: true }
      ]
    }
  },

  mounted () {
    this.loadCurrentMonth()
  },

  methods: {
    loadCurrentMonth () {
      const date = new Date(), y = date.getFullYear(), m = date.getMonth()
      const firstDay = new Date(y, m, 1)
      const lastDay = new Date(y, m + 1, 0)
      this.modelData.from = formatDate(firstDay, 'YYYY/MM/DD')
      this.modelData.to = formatDate(lastDay, 'YYYY/MM/DD')
    }
  }
})
</script>
