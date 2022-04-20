import { boot } from 'quasar/wrappers'
import VInput from '../components/common/VInput.vue'
import VSelect from '../components/common/VSelect.vue'
import VTableCrud from '../components/common/VTableCrud.vue'
import ProductStockHistoryCount from '../components/product/ProductStockHistoryCount.vue'
import DiscountModal from '../components/product/DiscountModal.vue'
import Screen from 'mixins/Screen'

export default boot(({ app }) => {
  app.component('VInput', VInput)
  app.component('VSelect', VSelect)
  app.component('VTableCrud', VTableCrud)
  app.component('ProductStockHistoryCount', ProductStockHistoryCount)
  app.component('DiscountModal', DiscountModal)
  app.mixin(Screen)
})

export { }
