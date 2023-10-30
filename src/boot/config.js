import { boot } from 'quasar/wrappers'
import VInput from '../components/common/VInput.vue'
import VDate from '../components/common/VDate.vue'
import VSelect from '../components/common/VSelect.vue'
import VTableCrud from '../components/common/VTableCrud.vue'
import ProductStockHistoryCount from '../components/product/ProductStockHistoryCount.vue'
import DiscountModal from '../components/product/DiscountModal.vue'
import ProductsForm from '../components/product/Form.vue'
import ProductsTable from '../components/product/Table.vue'
import Screen from 'mixins/Screen'
import CustomersForm from '../components/customer/Form.vue'
import CustomersTable from '../components/customer/Table.vue'
import CategoriesForm from '../components/categorie/Form.vue'
import CategoriesTable from '../components/categorie/Table.vue'
import ExpenseProductsForm from '../components/expenseProduct/Form.vue'
import ExpenseProductsTable from '../components/expenseProduct/Table.vue'
import CashFlowTable from '../components/cashFlow/CashFlowTable.vue'
import FastAction from '../components/cashFlow/FastAction.vue'
import ExpensesForm from '../components/expense/Form.vue'
import ExpensesTable from '../components/expense/Table.vue'
import SuppliersForm from '../components/supplier/Form.vue'
import SuppliersTable from '../components/supplier/Table.vue'

const utils = {
  methods: {
    showConsole (...params) {
      console.log('showConsole', params)
    }
  }
}

export default boot(({ app }) => {
  app.component('VInput', VInput)
  app.component('VDate', VDate)
  app.component('VSelect', VSelect)
  app.component('VTableCrud', VTableCrud)
  app.component('ProductStockHistoryCount', ProductStockHistoryCount)
  app.component('DiscountModal', DiscountModal)
  app.component('ProductsForm', ProductsForm)
  app.component('ProductsTable', ProductsTable)
  app.component('CustomersForm', CustomersForm)
  app.component('CustomersTable', CustomersTable)
  app.component('CashFlowTable', CashFlowTable)
  app.component('CategoriesForm', CategoriesForm)
  app.component('CategoriesTable', CategoriesTable)
  app.component('FastAction', FastAction)
  app.component('ExpenseProductsForm', ExpenseProductsForm)
  app.component('ExpenseProductsTable', ExpenseProductsTable)
  app.component('ExpensesForm', ExpensesForm)
  app.component('ExpensesTable', ExpensesTable)
  app.component('SuppliersForm', SuppliersForm)
  app.component('SuppliersTable', SuppliersTable)
  app.mixin(Screen)
  app.mixin(utils)
})

export { }
