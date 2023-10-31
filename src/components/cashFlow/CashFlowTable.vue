<template>
<!-- // TODO - campo de data no formato certo e editavel, possibilidade de editar a linha -->
  <q-table
    v-model:pagination="paginationInside"
    :rows="cashFlow"
    :columns="columnsCashFlow"
    :loading="loadingDatabase"
    class="full-width"
    :filter="search"
    row-key="id"
    v-model:selected="selected"
    selection="multiple"
  >
    <template #top-left>
      <div class="q-gutter-y-sm">
        <div class="q-table__title">
          {{ $t('cashFlow') }}
        </div>
        <div v-if="customerId" class="q-table__title">
          {{ $t('customer') }}: {{ customer.name }}
        </div>
        <div class="row">
          {{ $t('debt') }}: <div :class="debt < 0 ? 'text-red' : 'text-green'">
            {{ debt.toFixed(2) }}
          </div>
        </div>
      </div>
    </template>
    <template #top-right>
      <div class="row q-gutter-md">
        <q-btn
          label="Pagar compras"
          color="green"
          :disabled="!selected.filter(({ type }) => type === 'purchase').length"
          @click="makeAllPurchasePayed"
        />
        <q-btn
          label="Deletar"
          color="negative"
          :disabled="!selected.length"
          @click="deleteSelected"
        />
        <q-select
          style="width: 150px"
          v-model="search"
          :label="$t('type')"
          :options="typesOptions"
          emit-value
          map-options
          clearable
        />
        <q-input
          v-model="search"
          debounce="300"
          :placeholder="$t('search')"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
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
    <template #body-cell-action="{ row }">
      <q-td>
        <q-btn
          :label="$t('delete')"
          dense
          color="negative"
          :loading="row.loading"
          @click="firebaseDeleteItem('cashFlow', 'cashFlow', row.id).then(() => deleteProductStockHistory(row))"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script>

import { date, Dialog } from 'quasar'
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
    const { cashFlowByCustomerIdOrAll, loadingDatabase, customerById, productsStockHistory } = storeToRefs(storeFirebase)

    return {
      cashFlowByCustomerIdOrAll,
      loadingDatabase,
      customerById,
      productsStockHistory
    }
  },

  data () {
    return {
      search: '',
      paginationInside: {
        page: 1,
        rowsPerPage: 25,
        sortBy: 'date',
        descending: true
      },
      selected: [],
      typesOptions: [
        this.$t('quickExit'),
        this.$t('payment'),
        this.$t('fastSale'),
        this.$t('purchase')
      ]
    }
  },

  computed: {
    customer () {
      return this.customerById(this.customerId)
    },
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
        { name: 'purchasePayed', label: this.$t('purchasePayed'), field: 'purchasePayed', sortable: true, align: 'left', format: val => val !== undefined ? this.$t(val ? 'yes' : 'no') : '-' },
        { name: 'type', label: this.$t('type'), field: 'type', sortable: true, align: 'left', format: val => this.$t(val) },
        { name: 'date', label: this.$t('purchaseDate'), field: 'date', sortable: true, align: 'left', format: val => formatDate(val, 'DD/MM/YYYY') },
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

  methods: {
    deleteSelected () {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('selected', this.selected.length)} ?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.selected.forEach(row => {
          this.firebaseMixin('cashFlow').id(row.id).delete()
          this.deleteProductStockHistory(row)
        })
        this.selected = []
      })
    },
    deleteProductStockHistory (row) {
      this.productsStockHistory.filter(item => item.refId === row.id).forEach(item => {
        this.firebaseMixin('productsStockHistory').id(item.id).delete()
      })
    },
    makeAllPurchasePayed () {
      Dialog.create({
        title: `${this.$t('pay')} ${this.$t('selected', this.selected.filter(({ type }) => type === 'purchase').length)} ?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.selected.filter(({ type }) => type === 'purchase').forEach(row => {
          if (row.type === 'purchase' && !row.purchasePayed) {
            this.update({ ...row, purchasePayed: true })
          }
        })
        this.selected = []
      })
    },
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
