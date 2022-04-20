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
      @range-end="loadSales"
    />

    <v-input
      :model-value="`${totalSales} - ${totalExpenses} = ${(totalSales - totalExpenses).toFixed(2)}`"
      :label="`${$t('sale', 2)} - ${$t('expense', 2)} = total`"
      readonly
    />
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
      sales: [],
      expenses: [],
      modelData: {
        from: '',
        to: ''
      }
    }
  },

  computed: {
    totalSales () {
      return this.sales.reduce((a, b) => a + (b.total || 0), 0)
    },

    totalExpenses () {
      return this.expenses.reduce((a, b) => a + (b.total || 0), 0)
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
      this.modelData.from = formatDate(firstDay, 'DD/MM/YY')
      this.modelData.to = formatDate(lastDay, 'DD/MM/YY')
      this.loadSales()
    },
    loadSales () {
      this.$bind('sales', this.firebaseMixin('sales').ref().orderBy('date').startAt(this.modelData.from).endAt(this.modelData.to))
      this.$bind('expenses', this.firebaseMixin('expenses').ref().where('type', '==', 'entry').orderBy('date').startAt(this.modelData.from).endAt(this.modelData.to))
    }
  }
})
</script>
