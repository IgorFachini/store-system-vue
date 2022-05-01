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
      @range-end="loadCashFlow"
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
  </q-page>
</template>

<script>
import { date } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
export default defineComponent({
  name: 'PageIndex',

  data () {
    return {
      cashFlow: [],
      expenses: [],
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
      this.loadCashFlow()
    },
    loadCashFlow () {
      this.firebaseMixin('cashFlow').bindField('cashFlow')
      this.firebaseMixin('expenses').bindField('expenses')
    }
  }
})
</script>
