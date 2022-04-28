import { boot } from 'quasar/wrappers'
import VInput from '../components/common/VInput.vue'
import VSelect from '../components/common/VSelect.vue'
import VTableCrud from '../components/common/VTableCrud.vue'
import ProductStockHistoryCount from '../components/product/ProductStockHistoryCount.vue'
import DiscountModal from '../components/product/DiscountModal.vue'
import ProductsAddEditForm from '../components/product/ProductsAddEditForm.vue'
import Screen from 'mixins/Screen'
import CustomersForm from '../components/customer/CustomersForm.vue'
import CustomersTable from '../components/customer/CustomersTable.vue'

export default boot(({ app }) => {
  app.component('VInput', VInput)
  app.component('VSelect', VSelect)
  app.component('VTableCrud', VTableCrud)
  app.component('ProductStockHistoryCount', ProductStockHistoryCount)
  app.component('DiscountModal', DiscountModal)
  app.component('ProductsAddEditForm', ProductsAddEditForm)
  app.component('CustomersForm', CustomersForm)
  app.component('CustomersTable', CustomersTable)
  app.mixin(Screen)
})

export { }
