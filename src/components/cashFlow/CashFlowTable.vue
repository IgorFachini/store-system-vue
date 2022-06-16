<template>
  <q-table
    v-model:pagination="paginationInside"
    :rows="cashFlow"
    :columns="columnsCashFlow"
    :loading="loadingDatabase"
    class="full-width"
  >
    <template #top-left>
      <div class="q-table__title">
        {{ $t('cashFlow') }}
      </div>
      <div class="row">
        {{ $t('debt') }}: <div :class="debt < 0 ? 'text-red' : 'text-green'">
          {{ debt.toFixed(2) }}
        </div>
      </div>
    </template>
    <template #top-right>
      <q-input
        v-model="search"
        borderless
        dense
        debounce="300"
        :placeholder="$t('search')"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template #body-cell-description="{ row }">
      <q-td :class="getClassColor(row.type)">
        <div>{{ row.description || $t(row.type) }} {{ row.customer ? `: ${row.customer.name}` : '' }}</div>
        <div
          v-for="product in row.products"
          :key="product.name"
        >
          <div v-if="product.discountObject">
            {{ product.name }}: {{ product.unitaryValue }} {{ $t('by') }} {{ calcDiscountResult(product.discountObject, product.unitaryValue).toFixed(2) }} x  {{ product.quantity }} = {{ (calcDiscountResult(product.discountObject, product.unitaryValue) * product.quantity).toFixed(2) }}
          </div>
          <div v-else>
            {{ product.name }}: {{ product.unitaryValue }} x {{ product.quantity }} = {{ (product.unitaryValue * product.quantity) }}
          </div>
        </div>
        <div v-if="row.subTotalDiscountObject">
          {{ $t('discount') }}: {{ getDiscountValue(row.subTotalDiscountObject, sumProductsWithDiscountValue(row.products)) }}
        </div>
      </q-td>
    </template>
    <template #body-cell-date="{ row }">
      <q-td>
        {{ row.date }}
        <q-popup-edit
          v-slot="scope"
          v-model="row.date"
          buttons
          @save="(date) => update({...row, date})"
        >
          <v-input
            v-model="scope.value"
            :label="$t('date')"
            date
          />
        </q-popup-edit>
      </q-td>
    </template>
    <template #body-cell-action="{ row }">
      <q-td>
        <q-btn
          :label="$t('delete')"
          dense
          color="negative"
          :loading="row.loading"
          @click="firebaseDeleteItem('cashFlow', 'cashFlow', row.id)"
        />
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
  name: 'CashFlowTable',

  props: {
    customerId: {
      type: String,
      default: ''
    }
  },

  setup () {
    const storeFirebase = useFirebaseStore()
    const { cashFlowByCustomerIdOrAll, loadingDatabase } = storeToRefs(storeFirebase)

    return {
      cashFlowByCustomerIdOrAll,
      loadingDatabase
    }
  },

  data () {
    return {
      search: '',
      // firebaseMixinInstance: null,
      // loading: false,
      // cashFlow: [],
      paginationInside: {
        page: 1,
        rowsPerPage: 25,
        sortBy: 'date',
        descending: true
      }
    }
  },

  computed: {
    cashFlow () {
      return this.cashFlowByCustomerIdOrAll(this.customerId).map(item => {
        item.date = this.getDate(item.date)
        return item
      })
    },
    debt () {
      return this.cashFlow.reduce((acc, row) => {
        if (row.type === 'fastSale' || row.type === 'payment') {
          return acc + row.total
        }
        if (row.type === 'purchase') {
          return acc - row.total
        }

        return acc
      }, 0)
    },
    columnsCashFlow () {
      return [
        {
          name: 'description',
          label: this.$t('description'),
          align: 'left'
        },
        { name: 'total', label: 'Total', field: 'total', classes: row => this.getClassColor(row.type), sortable: true },
        { name: 'date', label: this.$t('date'), field: 'date', sortable: true, align: 'left' },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
          sortable: true
        },
        { name: 'action', label: this.$t('action') }
      ]
    }
  },

  // mounted () {
  //   this.setup()
  // },

  methods: {
    sumProductsWithDiscountValue (products) {
      return products.reduce((acc, item) => acc + (item.discountObject
        ? this.calcDiscountResult(item.discountObject, item.unitaryValue) * item.quantity
        : item.unitaryValue * item.quantity) || 0, 0)
    },
    calcDiscountResult (discountObject, value) {
      if (!discountObject?.type) {
        return 0
      }
      return discountObject.type === 'value'
        ? (value - discountObject.discount)
        : value - (value * discountObject.discount / 100)
    },
    getDiscountValue (discountObject, value) {
      if (!discountObject?.type) {
        return 0
      }
      return discountObject.type === 'value'
        ? discountObject.discount
        : (value * discountObject.discount / 100)
    },
    update (row) {
      this.firebaseMixin('cashFlow').id(row.id).update(row)
    },
    getDate (val) {
      return typeof val === 'object' ? formatDate(val.toDate(), 'YYYY/MM/DD HH:mm') : val
    },
    // setup () {
    //   this.loading = true
    //   this.firebaseMixinInstance = this.firebaseMixin('cashFlow')
    //   if (this.customerId) {
    //     this.$bind('cashFlow', this.firebaseMixin('cashFlow').ref().where('customer.id', '==', this.customerId).orderBy('date')).finally(() => {
    //       this.loading = false
    //     })
    //   } else {
    //     this.firebaseMixinInstance.bindField('cashFlow').finally(() => {
    //       this.loading = false
    //     })
    //   }
    // },
    getClassColor (type) {
      const colorMapType = {
        quickExit: 'text-red',
        payment: 'text-green',
        fastSale: 'text-green',
        purchase: 'text-blue'
      }
      return colorMapType[type]
    }
  }
})
</script>
